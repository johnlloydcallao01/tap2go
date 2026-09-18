# Dashboard Performance Blueprint — `/dashboard/overview` + `/dashboard/analytics` + `/dashboard/reports` + `/vendors` + `/merchants` + `/products` + `/orders` + `/customers`

Date: 2026-09-18
Scope: `apps/web-admin` Overview + Analytics + Reports + Vendors + Merchants + Products/Catalog + Orders + Customers + `apps/cms` admin dashboard/analytics/reports/vendors/merchants/products/catalog/orders/customers APIs + Postgres + Upstash Redis + Cloud Run
Status: Implemented and verified (`tsc`, `eslint`, `migrate:status Yes` ×2). No `migrate:fresh` used.

This document is the reproduction guide for applying the same optimization to other pages (analytics, reports, vendor payouts, merchant dashboard, lists).

---

## 1. Problem (before)

Cold load of `/dashboard/overview` was a textbook CSR-slow case: fast Cloud Run, slow page.

- 3 parallel browser fetches (`metrics/charts/tables`) → 3 BFF proxies → 3 CMS handlers
- 14 data `payload.find` + 3 auth `findByID users` = **17 Payload ops** for ~60 small rows
- `metrics`: 7× find (6× `limit:0` + 1× `transactions limit:1000 depth:0`)
- `charts`: 3× `limit:1000 depth:0` (transactions paid+30d, orders unfiltered, merchants unfiltered)
- `tables`: 4× (`vendors 1000`, `merchants 1000`, `orders 1000`, `orders 10 depth:1`)
- Hydrated vs returned: metrics ~1000 docs → 8 scalars; charts ~3000 docs → ~42 rows; tables ~3010 docs → 15 rows
- `select:` 0/19, `payload.count` 0/19, `pagination:false` missing on all `limit:1000`
- Unindexed predicates: `transactions.status/paid_at`, `orders.status`, bare `ORDER BY created_at`
- `Merchants afterRead` ran `getStoreHoursStatus` + up to 11520 `isStoreOpen` loops per doc ×1000, even at `depth:0`
- Gate `MAX_CONCURRENT_ADMIN_REQUESTS=2` vs 3 parallel → 1 queued every cold load
- Legacy monolith (`5× limit:1000 depth:1` + O(30N) loop) still live
- Cache: per-`admin.id` keys, TTL 60/300/30/20s, TTL-only, fail-open Redis, BFF `cache:no-store`, no coalescing

---

## 2. Architecture (after)

```text
Browser useDashboardOverview()
  → GET /api/dashboard/overview (BFF, 15s timeout, no-store upstream)
  → GET /api/admin/dashboard/overview (CMS)
  → getPayload → authenticateAdmin(findByID users)
  → getOrBuildDashboard(admin:dashboard:overview:v1, 300s)
      L1 5s fresh / 30s stale → Redis → singleflight builder
      MISS only → withAdminRequestSlot(MAX 8) → buildOverview()
        6× payload.count + 8× indexed SQL (SUM/GROUP BY/JOIN LIMIT)
  → X-Dashboard-Cache: HIT/STALE/MISS + Cache-Control: private, max-age=30, SWR=60
```

Cold MISS now: 1 browser → 1 BFF → 1 CMS → ~14 cheap DB statements, zero doc hydration.
HIT: no aggregates, no gate queue (gate inside builder only).

---

## 3. What was implemented

### Q1 — Indexes (DB change, per `docs/database-modification-guide.md`)

Collections:

- `apps/cms/src/collections/Transactions.ts:32-36`
  `indexes: [{fields:['status','paid_at']},{fields:['status','createdAt']}]`
- `apps/cms/src/collections/Orders.ts:206-210`
  `indexes: [{fields:['status','createdAt']},{fields:['merchant','createdAt']}]`
- `apps/cms/src/collections/Users.ts:117-120`
  `indexes: [{fields:['role']}]` — fixes `role==admin` fanout scan
- `apps/cms/src/collections/Merchants.ts:581-610`
  Pre-existing `['vendor'],['outletCode'],['isActive'],['isActive','isAcceptingOrders']` kept. `afterRead` guarded (see Q5).

Migration (Step 2–4 of guide):

- `pnpm payload migrate:create` → `apps/cms/src/migrations/20260918_041730.ts` (+ `.json`, registered in `migrations/index.ts:430-434`)
- Reviewed: index-only (`CREATE INDEX role_idx`, `isActive_1_idx` merchants, `isActive_2_idx` drivers rename, `status_createdAt_idx` orders, `merchant_createdAt_idx` orders, `status_paid_at_idx` + `status_createdAt_1_idx` transactions). No column drops, no data loss.
- `echo y | pnpm payload migrate --force` → `Migrated: 20260918_041730 (347ms)`. `migrate:status Yes`.
- Pool unchanged: `apps/cms/src/payload.config.ts:192-203` `max 8 / min 1 / idle 30s / connectionTimeout 10s / statement_timeout 20s`.

NOT done: single-column `orders(created_at)` index; duplicate `vendor/outletCode` name dedup.

### Q2/Q3 — Counts + DB aggregation (no hydration)

New shared lib `apps/cms/src/utils/dashboardOverview.ts`:

- `drizzleRows():37-40` — `payload.db.drizzle.execute()` → `rows[]`, no access/depth/hooks
- `fetchDashboardCounts():78-121` — 6× `payload.count({overrideAccess:true, context:{skipStoreHours:true}})` (vendors, customers, merchants `isActive`, orders total, orders ≥30d, orders 60–30d)
- `fetchRevenueMetrics():127-146` — 3× `SELECT SUM(amount::numeric) FROM transactions WHERE status='paid' [AND paid_at window]`
- `fetchRevenueChart():148-166` — `date_trunc('day',paid_at) GROUP BY` + JS 30-day zero-fill
- `fetchOrderStatusChart():168-171` — `SELECT status,COUNT(*) GROUP BY`
- `fetchTopMerchants():173-188` — `orders LEFT JOIN merchants GROUP BY merchant_id ORDER BY COUNT DESC LIMIT 5` (`rating:0` preserved — merchants have no rating field)
- `fetchTopVendors():190-202` — `vendors LEFT JOIN merchants LEFT JOIN orders GROUP BY v.id ORDER BY COUNT(o.id) DESC LIMIT 5`
- `fetchRecentOrders():204-217` — `orders LEFT JOIN merchants/customers ORDER BY created_at DESC LIMIT 10`, uses `customers.email` directly (fixes `customer.user.email` depth:1 bug)
- `buildMetricsGroup():219-239`, `buildChartsGroup():241-249`, `buildTablesGroup():251-254`, `buildOverview():256-263` (`Promise.all`)

CMS routes refactored to global keys + MISS-only gate:

- `overview/route.ts:22-27` `admin:dashboard:overview:v1` TTL 300
- `metrics/route.ts:22-29` `admin:dashboard:metrics:v1` TTL 300 (was 60, per-admin)
- `charts/route.ts:23-30` `admin:dashboard:charts:v1` TTL 300 (was 300, per-admin)
- `tables/route.ts:22-29` `admin:dashboard:tables:v1` TTL 300 (was 30, per-admin)

### Q4 — Dedupe to single call

- CMS new `apps/cms/src/app/api/admin/dashboard/overview/route.ts:1-36` — single `buildOverview()`
- BFF new `apps/web-admin/src/app/api/dashboard/overview/route.ts:1-33` — `CMS_BASE`, `tap2go-admin-token` → `401`, `fetch(CMS/admin/dashboard/overview,{cache:no-store,timeout 15s})`, forwards `X-Dashboard-Cache`, sets `Cache-Control: private, max-age=30, stale-while-revalidate=60`
- Frontend `apps/web-admin/src/hooks/useDashboard.ts:32-36,117-124` new `fetchDashboardOverview()` + `useDashboardOverview()` (`QUERY_KEYS.adminDashboardOverview`, `staleTime 30s`). Old `useDashboardMetrics/Charts/Tables` kept for compat.
- `packages/client-services/src/query/keys.ts:7` new `adminDashboardOverview:['admin','dashboard','overview','v1']`
- `apps/web-admin/src/app/(main)/dashboard/overview/page.tsx:152-175,192-217` — single `overviewQuery`, single `refetch`, `removeQueries` clears overview+metrics+charts+tables+legacy. Skeletons preserved (`DashboardSkeleton:39-123`, `SectionSkeleton:125-132`, `SectionError:134-147`, `ClientOnly:319-326`).

NOT done: `?range/fields` forwarding (BFF hardcodes CMS path), prefetch/SSR dehydrate, `Cache-Control` on splits, BFF-local Redis.

### Q5 — Entry overhead

- `apps/cms/src/utils/adminRequestGate.ts:1` `MAX 2 → 8`. Gate wraps builder only (`overview/route.ts:24-26`, same splits), so HIT never queues.
- `apps/cms/src/collections/Merchants.ts:642-650` `afterRead` returns early when `req.context.skipStoreHours`. `dashboardOverview.ts:42` `DASH_CTX` passes it to counts (moot for `count`, protective for any residual `find`).
- Auth still runs on every hit (`getPayload` + `authenticateAdmin: findByID users depth:0` before cache). No JWT-before-payload fast-path (intentional — secure, listed as future).

### Q6 — Email fix + legacy retirement

- Recent orders email now comes from `customers.email` JOIN, fallback `Customer #id` (`dashboardOverview.ts:209-216`).
- `apps/cms/src/app/api/admin/dashboard/route.ts:1-14` → `410 Gone`
- `apps/web-admin/src/app/api/dashboard/route.ts:1-12` → `410 Gone`

### Herd + write-through (FB-next 1+2)

New `apps/cms/src/utils/dashboardCache.ts`:

- No top-level `@encreasl/cache` import (payload-bin ESM safe — dynamic `import()` at runtime only: `redisGet:7-14`, `redisSet:16-24`, `redisBustPrefix:25-33`)
- L1 `L1_FRESH_MS 5000 / L1_STALE_MS 30000` (`36-44`), `inflight` singleflight map
- `getOrBuildDashboard():77-133` — L1 fresh HIT → inflight HIT → Redis HIT → stale SWR (serve `STALE`, background rebuild) → MISS build. All writes update L1 + Redis.
- `bustDashboardL1()` + `bustDashboardCache(prefix='admin:dashboard:')`

Write-through hooks (best-effort `try/catch`, `afterChange` + `afterDelete`):

- `Orders.ts:167-185`, `Transactions.ts:131-149`, `Merchants.ts:625-641`, `Vendors.ts:310-326`, `Customers.ts:25-41`

This allows TTL 300s with immediate freshness on writes. `Users.ts` has no bust (no dashboard dependency).

---

## 4. Reproduction blueprint (other pages)

Use for analytics, reports, payouts, merchant dashboard, any `limit:1000 + JS aggregate` page.

1. **Map fan-out.** Find page → hooks → BFF `route.ts` → CMS `route.ts`. Count `payload.find` + auth hits. Assert rows hydrated vs returned. If ratio >10:1, proceed.
2. **Indexes first (DB change).** Add composite `indexes: [{fields:[equality..., range/sort]}]` matching `where + sort`. `pnpm payload migrate:create`, review SQL (index-only?), `echo y | pnpm payload migrate --force`, verify `migrate:status`. Never `migrate:fresh`.
3. **Shared builder.** Create `apps/cms/src/utils/<page>Overview.ts`: `payload.count` for counts, `drizzle.execute` `SUM/COUNT/GROUP BY/JOIN LIMIT` for aggregates, single `ORDER BY ... LIMIT N` JOIN for recent rows. No `limit:1000`, no JS `filter/reduce/sort.slice` over docs. Fix email/name via JOIN, not `depth:2`.
4. **Cache wrapper.** Reuse `getOrBuildDashboard(globalKey, 300, () => withAdminRequestSlot(builder))`. Global key if data is platform-wide, per-user key only if truly personal. HIT must bypass gate; gate wraps builder only. Keep `skipStoreHours` context if merchants are read via `find`.
5. **Single endpoint.** Add CMS `.../overview/route.ts` (all groups) + keep splits as thin slices if UI needs progressive. Add BFF `.../overview/route.ts` (15s timeout, `X-Dashboard-Cache` passthrough, `Cache-Control: private, max-age=30, SWR=60`). Retire monolith to `410`.
6. **Frontend single query.** Add `QUERY_KEYS.<page>Overview`, `use<Page>Overview(staleTime 30s)`, switch page to 1 query + `removeQueries` all variants on hard refresh. Keep skeletons (`allLoading`, per-section, `ClientOnly` if echarts/date).
7. **Write-through.** Add `bustDashboardCache()` (or `<page>` prefix variant) to `afterChange+afterDelete` of every collection the builder reads. Dynamic import only — never top-level `@encreasl/cache` in collections.
8. **Verify.** `tsc --noEmit` (cms + consumer), `eslint` changed files, `migrate:status`, `git status` (no secrets). Then `EXPLAIN ANALYZE` new SQL, k6 cold/HIT p95, HIT% dashboard.

---

## 5. Verification record

- `pnpm exec tsc --noEmit` CMS + web-admin: clean
- `eslint` on `dashboardCache.ts`, `dashboardOverview.ts`, 4 CMS routes, 5 collections: clean
- `pnpm payload migrate:status`: `20260918_041730 Yes` (Batch 37)
- `git status`: only intended CMS collections/routes/utils, web-admin BFF/hooks/page, `keys.ts`, new `overview/` dirs, `20260918_041730.*`. No `migrate:fresh`, no secrets.

---

## 6. Known gaps (do not claim as done)

- `orders(created_at)`: covered by auto `orders_created_at_idx` (`payload-generated-schema.ts:1717`) — no extra migration needed. Verified 2026-09-18, no duplicate index created.
- SQL dates parameterized 2026-09-18 via `drizzle-orm sql` (`dashboardOverview.ts`: `sql`...`${thirtyDaysAgoISO}` bound params, `drizzleRows(payload, string | SQL)`). No string interpolation remaining for dates.
- Duplicate `vendor/outletCode` index names kept.
- Auth (`getPayload + findByID users`) runs on every HIT; no JWT-before-payload fast-path.
- No read replica; `drizzleRows` hits primary; pool `max 8` vs BFF 15s vs DB 20s.
- No `searchParams` forwarding, no prefetch/SSR dehydrate, splits lack `Cache-Control`, BFF has no local Redis.
- First visit is still CSR + `no-store` waterfall; 1M-row scale needs rollup/materialized view + BRIN + HLL.

Next highest leverage if needed: auth fast-path → EXPLAIN + p95/HIT% + k6 → replica/rollup.

---

## 7. Analytics application (`/dashboard/analytics`, 2026-09-18)

Same principles, filter-aware variant. Before: 3 parallel `summary/charts/tops` (same `qs`) → 3 BFF → 3 CMS handlers re-hydrating overlapping collections (~25 finds + 3 auth, up to ~31k docs with `limit:2000-5000 depth:0`, monolith 13× `depth:1`), all-JS `filter/reduce/Map/sort.slice`, per-`admin.id` + raw-qs keys, TTL 30/120/60, gate-outside-cache, no L1/singleflight, no analytics bust.

After: 1 browser → 1 BFF → 1 CMS `buildAnalyticsOverview()`.

- **Indexes:** `Vendors(businessType, verificationStatus, isActive)`, `Transactions(payment_method)`, `Orders(fulfillment_type, delivery_status)` added to collections. `pnpm payload migrate:create` → `20260918_053029.ts` (index-only, reviewed), `echo y | pnpm payload migrate --force` → `Migrated (368ms)`, `migrate:status Yes` (Batch 38). `order_items(order,product)` already auto-indexed — not duplicated.
- **Shared builder** `apps/cms/src/utils/analyticsOverview.ts`: reuses `parseAnalyticsParams`; `buildAnalyticsNormalizedKey()` (global, no `admin.id`; range aliases `1y/365d/12m→1y`, `all/0→all`; lowercase `q`; sorted CSV); filtered-orders WHERE (date + `LOWER(status/fulfillment/delivery)` + vendor `COALESCE(LOWER(business_type/verification_status),'unknown')` + `q` ILIKE across `o.id/m.outlet_name/v.business_name/EXISTS order_items`) + verified-revenue JOIN (paid window + `LOWER(payment_method)` + filtered orders); `payload.count` globals + parameterized `drizzle-orm sql` `SUM/COUNT/GROUP BY/JOIN LIMIT 5/8/10`; unfiltered revenue trend preserved (monolith semantics); hourly/weekday via `EXTRACT(HOUR/DOW)` + verified-revenue subquery; category via `order_items→products→products_rels→prod_categories` + uncategorized fallback. Returns `{summary, charts, tops}` matching `analytics-types.ts` shapes.
- **Cache:** CMS new `analytics/overview/route.ts` (`admin:analytics:overview:v1:<normalized>`, TTL 300, `getOrBuildDashboard` + gate-inside-builder, `X-Analytics-Cache`). Splits (`summary/charts/tops`) refactored to same global key + builder slices (identical numbers). Monoliths retired: CMS `analytics/route.ts` → `410`, BFF `api/analytics/route.ts` → `410`.
- **BFF:** new `api/analytics/overview/route.ts` (forwards all 7 params + `range` default, 25s timeout, `X-Analytics-Cache` passthrough, `Cache-Control: private, max-age=30, SWR=60`).
- **Frontend:** `keys.ts` new `adminAnalyticsOverview(qs)`, `useAnalyticsOverview(qs)` (`staleTime 60s`, `keepPreviousData`), page switched to single `overviewQuery` with adapters preserving per-section skeleton/error UX. Old split hooks kept for compat.
- **Write-through:** `dashboardCache.ts` new `bustAnalyticsCache()` (`admin:analytics:` L1+Redis); `Orders/Transactions/Merchants/Vendors/Customers` hooks now bust both dashboard + analytics prefixes (`afterChange+afterDelete`).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` both `Yes`, no `migrate:fresh`.

---

## 8. Reports application (`/dashboard/reports`, 2026-09-18)

Same principles, range-only variant (no `q`/status filters — only `range`). Before: 3 parallel `summary/financial/catalog` (same `range`) → 3 BFF → 3 CMS handlers re-hydrating overlapping collections (15 finds + 3 auth, `vendors/orders/transactions` 2–3× each; monolith 9× `depth:1` incl. dead `products` + `reviews` fetches), all-JS `filter/reduce/Map/sort.slice(0,20/100/200)`, per-`admin.id` + raw-qs keys, TTL 30/60/120, gate-outside-cache, no L1/singleflight, no reports bust.

After: 1 browser → 1 BFF → 1 CMS `buildReportsOverview()`.

- **Indexes:** `Vendors(businessType, verificationStatus, isActive)`, `Transactions(payment_method)`, `Orders(fulfillment_type, delivery_status)` added under analytics migration `20260918_053029.ts` (index-only, reviewed, `migrate --force` 368ms, status Yes Batch 38). `order_items(order,product)`, `order_discounts(order)`, `delivery_bookings(order)`, `orders(created_at)` already auto-indexed — not duplicated. No new migration for reports (code-only after analytics migration).
- **Shared builder** `apps/cms/src/utils/reportsOverview.ts`: `buildReportsNormalizedKey()` (global, no `admin.id`, range-only normalized); period windows from `parseReportsParams`; `payload.count` globals (vendors, merchants, orders, transactions, wishlists) + parameterized `drizzle-orm sql` aggregates — summary KPIs (`SUM FILTER`, discounts `amount_off/vendor_share`, active counts, ratings `AVG`), financial 200-row reconciliation JOIN (transactions+orders+merchants+vendors+discount sums, totals preserve truncated-200 semantics for fees + full-period gross), vendor payouts `GROUP BY` with `GREATEST(0,…)` net, refunds `UNION ALL LIMIT 100`, catalog daily `GROUP BY day`, products `GROUP BY snapshot LIMIT 20`, vendors full list (denormalized fields preserved), bookings JOIN + `byStatus`. Returns `{summary, financial, catalog}` matching CMS route shapes.
- **Cache:** CMS new `reports/overview/route.ts` (`admin:reports:overview:v1:<range>`, TTL 300, `getOrBuildDashboard` + gate-inside-builder, `X-Reports-Cache`). Splits refactored to same global key + builder slices. Monoliths retired: CMS `reports/route.ts` → `410`, BFF `api/reports/route.ts` → `410`.
- **BFF:** new `api/reports/overview/route.ts` (forwards `range` + default `30d`, 25s timeout, `X-Reports-Cache` passthrough, `Cache-Control: private, max-age=30, SWR=60`).
- **Frontend:** `keys.ts` new `adminReportsOverview(range)`, `useReportsOverview(range)` (`staleTime 60s`, `keepPreviousData`), page switched to single `overviewQuery` with adapters preserving per-section skeleton/error UX. Old split hooks kept for compat.
- **Write-through:** `dashboardCache.ts` new `bustReportsCache()` (`admin:reports:` L1+Redis); `Orders/Transactions/Merchants/Vendors/Customers` hooks now bust all three prefixes; `OrderDiscounts.ts` new `afterChange+afterDelete` bust reports (dynamic import only, no top-level `@encreasl/cache` in collections).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` both `Yes`, no `migrate:fresh`.

---

## 9. Vendors application (`/vendors`, `/vendors/payouts`, 2026-09-18)

Same principles, payouts = full port, list = sidecar port, detail = bounded + cached. Before: payouts 3 parallel `summary/rows/daily` (same `qs`) → 3 BFF → 3 CMS handlers re-hydrating identical 4 collections (12 finds + 3 auth, ~36k docs `vendors/merchants/orders/transactions 2000/2000/5000/5000 depth:0`, monolith 5× `depth:1` ~12k), all-JS `filter/Map/reduce/sort(net)`, per-`admin.id` raw-qs keys TTL 30/60/120, no gate/L1/singleflight/bust; vendors list paginated display correct but stats sidecars (`vendors 2000 + merchants 5000` + JS breakdowns, per-admin 20s, gate-outside); detail `findByID depth:2 + merchants 50` + dead `orders limit:0`, no cache.

After: payouts 1 browser → 1 BFF → 1 CMS `buildPayoutsOverview()`; list keeps paginated `find` + SQL sidecars; detail cached single-doc.

- **Indexes:** reused `20260918_041730` + `20260918_053029` (`Vendors(businessType,verificationStatus,isActive)`, `Transactions(status,paid_at/payment_method)`, `Orders(status/merchant/fulfillment/delivery)`). `order_items(order,product)`, `delivery_bookings(order)`, `orders(created_at)` already auto-indexed — not duplicated. No new migration (code-only).
- **Shared builder** `apps/cms/src/utils/payoutsOverview.ts`: `buildPayoutsNormalizedKey()` (global, no `admin.id`; range aliases, lowercase search, sorted CSV, `isActive` tri-state); vendor filter WHERE (`LOWER(verification/businessType)`, `is_active`, ILIKE across `business_name/legal_name/regNumber/email`) + verified-revenue JOIN (paid window + filtered vendors); parameterized `drizzle-orm sql` — single vendor agg (all filtered vendors incl. zero-payout, live `COUNT(DISTINCT merchants)`, `SUM/COUNT`, `GREATEST(0,…)` net, media logo JOIN), separate per-vendor refunded (avoids fan-out double-count), daily `GROUP BY day`, verification `GROUP BY`. Returns `{meta, summary, vendorPayouts, daily, verificationBreakdown}` matching monolith shape (splits slice it).
- **Cache:** CMS new `vendors/payouts/overview/route.ts` (`admin:payouts:overview:v1:<normalized>`, TTL 300, `getOrBuildDashboard` + gate-inside, `X-Payouts-Cache`). Splits refactored to same key + slices. Monoliths retired: CMS `vendors/payouts/route.ts` → `410`, BFF `vendors/payouts/route.ts` → `410`. Vendors list `route.ts` → global `admin:vendors:v1:<qs>` TTL 60, gate-inside; detail `[id]/route.ts` → `admin:vendors:detail:v1:<id>` TTL 120, gate-inside, dead `orders limit:0` removed.
- **BFF:** new `api/vendors/payouts/overview/route.ts` (qs forward + `range` default, 30s timeout, `X-Payouts-Cache` + `Cache-Control`).
- **Frontend:** `keys.ts` new `adminVendorPayoutsOverview(qs)`, `usePayoutsOverview(qs)` (`staleTime 60s`), payouts page single `overviewQuery` with adapters (client `slice` pagination kept — cheap over aggregated rows). Old split hooks kept.
- **Write-through:** `dashboardCache.ts` new `bustPayoutsCache()` + `bustVendorsCache()`; `Orders/Transactions` bust dashboard+analytics+reports+payouts; `Merchants/Vendors` bust all five incl. vendors; `OrderDiscounts` bust reports (payouts unaffected — no discount reads).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` both `Yes`, no `migrate:fresh`.

---

## 10. Merchants application (`/merchants`, 2026-09-18)

Same principles, list-sidecar variant (display already paginated; stats + vendor-search fallback were the blowup). Before: list `GET` gate-outside + per-`admin.id` raw-qs key TTL 20 → 12 concurrent `find` (paginated `depth:1` + `vendors limit:1`×2 + conditional `vendors 2000` + `merchants limit:1`×8 incl. 5× operational) + unbounded `vendors IN (pageIds) depth:1` + worst-case `merchants 5000 depth:2` vendor-search fallback with in-memory `filter/sort/slice` + pagination override; stats read `totalDocs` off `limit:1` finds; `sanitizeMerchantDoc:getStoreHoursStatus` per doc doubled by collection `afterRead` (no `skipStoreHours`); detail `findByID depth:2` + dead `orders limit:0` count-via-find, no cache/gate; `peak-hours` unbounded `orders limit:0` + per-order `Intl` loop; `timezone POST` no bust; BFF list 20s timeout no `Cache-Control`, detail drops `X-Cache`.

After: list keeps paginated `find` (correct) + counts/SQL sidecars; detail + peak-hours cached.

- **Indexes:** reused `20260918_041730` + `20260918_053029` (no new migration, code-only). Vendor-search ILIKE uses existing `business_name` pattern + `Vendors(businessType,verificationStatus)` for constrained resolution; `merchants(vendor)`, `orders(created_at)` auto-indexed.
- **List builder** (in-route `buildMerchantsList`): vendor verification/businessType resolved via bounded SQL (500) and pushed as `vendor IN` (fixes post-filter pagination drift); vendor businessName search via bounded SQL ILIKE (200) OR-ed with direct `outletName/outletCode/contact` matches (replaces `merchants 5000 depth:2` fallback, respects requested `sort` + DB pagination totals); stats via `payload.count` (merchants total/active/accepting, vendors total/active) + SQL `GROUP BY operational_status`; merchant counts per vendor via SQL `GROUP BY vendor_id`; page-vendor enrichment kept bounded (≤100, `skipStoreHours`); empty-constraint short-circuit returns zero page without queries. Global `admin:merchants:v1:<sorted-qs>` TTL 60, `getOrBuildDashboard` + gate-inside, `X-Merchants-Cache`.
- **Detail `[id]`:** wrapped in `admin:merchants:detail:v1:<id>` TTL 120 + gate-inside; dead `orders limit:0` replaced by `payload.count(vendor)`; `findByID` + sibling finds pass `skipStoreHours` (route-level sanitize keeps single `getStoreHoursStatus`).
- **Peak-hours `[id]/peak-hours`:** unbounded `orders limit:0` + JS cutoff + per-order `Intl` → single SQL `EXTRACT(HOUR FROM created_at AT TIME ZONE <validated-tz>)` + `COUNT FILTER (delivered/cancelled)`, `GROUP BY 1`, gate-inside, `admin:merchants:peak:v1:<id>:<days>` TTL 300. Timezone POST adds missing `bustMerchantsCache()`.
- **Write-through:** `dashboardCache.ts` new `bustMerchantsCache()`; `Merchants` hooks bust all six prefixes; list POST + `[id]` PATCH/DELETE switched from `deleteCachedByPrefix` to `bustMerchantsCache()` (L1+Redis).
- **BFF:** list GET adds `Cache-Control: private, max-age=30, SWR=60`; detail GET forwards `X-Merchants-Cache`. Frontend unchanged (list already single `useMerchants(qs)`; detail/edit direct-fetch now HIT-cached server-side).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` both `Yes`, no `migrate:fresh`.

---

## 11. Products/Catalog application (`/products`, `/catalog/*`, 2026-09-18)

Same principles, list-sidecar variant (displays already paginated; stats hydration was the blowup; no fan-out to dedupe — each list is already a single query). Before: every list did paginated `find depth:1/2` + unbounded stats `find limit:2000 depth:0` (+ `products 5000` for categories, 2× `2000` + re-fetch for terms/values) with JS `filter/Map` breakdowns; `merchant-products` filtered path hydrated 11k docs (`vendors/merchants/merchant-products/products 2000/2000/5000/2000`) + N+1 per-vendor counts unfiltered; per-admin raw-qs keys TTL 20, gate-outside (products) or no gate (merchant-products, all catalog); no L1/singleflight; prefix-SCAN bust only.

After: same single queries, global keys, gate-inside, SQL stats, bounded hydration.

- **Indexes:** `Products(productType, isActive, catalogVisibility)` added. `pnpm payload migrate:create` → `20260918_102102.ts` (index-only, reviewed), `echo y | pnpm payload migrate --force` → `Migrated (386ms)`, `migrate:status Yes` (Batch 39). FKs (`merchant_id/product_id`, `product_id`, `attribute/ variation/term_id`, `parentCategory`, `sku` unique) already auto-indexed — not duplicated.
- **List builders** (in-route, shapes preserved): `products` stats → single SQL `COUNT + COUNT FILTER (simple/variable/grouped/active)`; `merchant-products` unfiltered N+1 → single SQL `GROUP BY merchant vendor` + `payload.count` totals, filtered 11k → SQL vendor page (`DISTINCT` + `ORDER BY business_name LIMIT/OFFSET`, `COUNT DISTINCT` total) + bounded hydration (page vendors → merchants → mps → products via `product_id_id IN`); `variations` → `COUNT + FILTER (mode×3/stock/active)`; `attributes` → `FILTER (type×4/active)`; `attribute-terms` → global `GROUP BY attribute_id` + `FILTER active` + filtered exact via WHERE fragment (replaces bounded-2000 re-fetch + cap fallback), term search pre-pass via SQL ILIKE `LIMIT 200`; `variation-values` → 3× `GROUP BY` (variation/attribute/term) + filtered variants; `product-categories` → `FILTER (active/featured/top)` + `GROUP BY level/type` + `products_rels GROUP BY "product-categoriesID"` (replaces `products 5000` scan). All parameterized `drizzle-orm sql`, all TTL 60 globals (`admin:products:v1`, `admin:merchant-products:v1`, `admin:catalog-<ns>:v1`).
- **Details `[id]`** (products, merchant-products, variations, attributes, terms, values, categories): wrapped in `…:detail:v1:<id>` TTL 120 + gate-inside; categories 5000-scan fallback → SQL rels `COUNT`; merchant-products detail passes `skipEffectiveModifierPreview`; PATCH/DELETE busts switched to `bustProductsCache()/bustCatalogCache()` (L1+Redis).
- **Write-through:** `dashboardCache.ts` new `bustProductsCache()` (`admin:products:` + `admin:merchant-products:`) + `bustCatalogCache()` (`admin:catalog-` + `admin:product-categories:`); `Products` afterChange, `MerchantProducts` afterChange/afterDelete, `ProdVariations` afterChange/afterDelete, `ProdAttributes/Terms/Values/Categories` afterChange/afterDelete. Dynamic import only in collections.
- **BFF:** lists add `Cache-Control: private, max-age=30, SWR=60` + `X-*-Cache` forward (products, merchant-products, product-categories, 4 catalog groups); `[id]` GETs forward `X-*-Cache`. Frontend unchanged (lists already single `useQuery`; details direct-fetch now HIT-cached).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` 3× `Yes`, no `migrate:fresh`.

---

## 12. Orders application (`/orders`, `/order-items`, `/transactions`, 2026-09-18)

Same principles, list-sidecar variant (displays already single-query with correct pagination; stats hydration was the blowup; no fan-out to dedupe). Before: lists did paginated `find depth:2` (correct, bounded ≤100) + unbounded stats hydration (`orders 2000 + transactions paid 2000`, `order-items 2000`, `transactions 2000`) with JS `for` breakdowns/sums/Sets; per-`admin.id` raw-qs keys TTL 20, no gate/L1/singleflight; details uncached (`orders/[id]` 1+7 aggregates per view, `transactions/[id]` 1+1, `order-items/[id]` single) with dead `orders limit:0` count-via-find; BFF no timeout/`Cache-Control`, detail drops `X-Cache`; frontend `fulfillmentType/deliveryStatus` camelCase never matched CMS `fulfillment_type/delivery_status` (filters silently ignored).

After: same single queries, global keys, gate-inside, SQL stats, cached details.

- **Indexes:** `Orders(placed_at)` (list default sort `-placed_at` was unindexed) + `OrderTracking(order,timestamp)` (detail timeline `WHERE order + ORDER BY timestamp`). `pnpm payload migrate:create` → `20260918_103301.ts` (index-only, reviewed), `echo y | pnpm payload migrate --force` → `Migrated (399ms)`, `migrate:status Yes` (Batch 40). Status/payment/FK sorts already covered by `041730`/`053029`/auto indexes; `LIKE %…%` search and `discount_total` expression intentionally not indexed.
- **List builders** (in-route, shapes preserved, stats stay global per existing contract): `orders` stats → `COUNT` + `GROUP BY status/fulfillment_type/delivery_status` + `SUM(paid)`; `order-items` → `COUNT + SUM(total_price/quantity) + COUNT DISTINCT order/product + FILTER (options_snapshot not empty)` (avgQuantity divisor fixed to `totalAll` instead of capped-2000 length); `transactions` → `COUNT + SUM FILTER (paid/refunded/failed/pending)` + `GROUP BY status/payment_method`. All parameterized `drizzle-orm sql`, all TTL 60 globals (`admin:orders:v1`, `admin:order-items:v1`, `admin:transactions:v1`).
- **Details:** `orders/[id]` (1+7 aggregates) + `transactions/[id]` (1+1) + `order-items/[id]` wrapped in `:detail:v1:<id>` TTL 120 + gate-inside; dead `orders limit:0` replaced by `payload.count(vendor)`; PATCH busts switched to `bustOrdersCache()/bustOrderItemsCache()` (L1+Redis).
- **Write-through:** `dashboardCache.ts` new `bustOrdersCache()`, `bustOrderItemsCache()`, `bustTransactionsCache()`; `Orders` hooks bust all eight prefixes; `Transactions` bust six; `OrderItems` new `afterChange+afterDelete` bust items+orders. Dynamic import only in collections.
- **BFF:** lists add 20s timeout + `Cache-Control` + existing `X-*-Cache` forward; details forward `X-*-Cache`. Frontend one-line fix: `fulfillmentType/deliveryStatus` → `fulfillment_type/delivery_status` (filters now actually apply).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` 4× `Yes`, no `migrate:fresh`. Known remaining gap (documented, not changed): list `search` covers `id/lalamove/notes/coupon` only, not merchant/customer/outlet despite placeholder text — needs JOIN search if desired.

---

## 13. Customers application (`/customers`, addresses, emergency-contacts, activity, 2026-09-18)

Same principles, list-sidecar variant (displays already single-query with correct pagination; stats hydration was the blowup; no fan-out to dedupe except addresses 2-query page). Before: customers list did level `customers 5000` + `has_active` `customers 5000` + paginated `users depth:2` + stats `users limit:0` (docs empty → stats zeros) + profile `customers 5000 depth:2` + page-scoped `orders/addresses 5000`; addresses list did `customers 5000` + users search 200 + paginated `depth:2` + discarded `limit:0` + stats `addresses 2000` + per-page active fetch; emergency list did users search 200 + paginated `depth:2` + discarded `limit:0` + stats 2000; activity `depth:3`; all per-`admin.id` raw-qs keys TTL 20, gate-outside (customers) or no gate, no L1/singleflight/bust.

After: same single queries, global keys, gate-inside, SQL stats + id sets.

- **Indexes:** `Customers(currentLevel)`, `Users(isActive)`, `Addresses(address_type,is_default)`, `EmergencyContacts(relationship,isPrimary)` added. `pnpm payload migrate:create` → `20260918_105206.ts` (index-only incl. `isActive` renames, reviewed), `echo y | pnpm payload migrate --force` → `Migrated (342ms)`, `migrate:status Yes` (Batch 41). FK/search `contains` intentionally not indexed (`LIKE %…%`).
- **List builders** (in-route, shapes preserved): `customers` level/has_active pre-filters → SQL id sets (`SELECT user_id … LIMIT 10000`, `active_address_id IS NOT NULL`), profiles page-scoped (`user IN pageIds depth:1`, was 5000 `depth:2`), stats via SQL (`COUNT`, `GROUP BY current_level`, active/inactive, monthly enrollment, active-address) — also fixes stats previously returning zeros; `addresses` active-map → SQL id pairs, user search → SQL ILIKE `LIMIT 200`, stats via `GROUP BY` + `FILTER` + pre-sorted top-localities, enrichment page-scoped; `emergency` user search → SQL ILIKE, stats via `COUNT + GROUP BY relationship`; `activity` `depth:3` → `depth:2` (covers `customer.user.profilePicture` + nested product). All parameterized `drizzle-orm sql`, TTL 60 globals (`admin:customers:v1`, `admin:customer-addresses:v1`, `admin:emergency-contacts:v1`, `admin:customer-activity:v1:<activity>`).
- **Details `[id]`** (customers, addresses, emergency): wrapped in `:detail:v1:<id>` TTL 120 + gate-inside; bounded finds kept (orders 10, addresses 50, events 8, wishlists 50); PATCH/DELETE/POST add missing `bustCustomersCache()`.
- **Write-through:** `dashboardCache.ts` new `bustCustomersCache()` (all four customer-domain prefixes L1+Redis); `Customers` hooks extend to it; `Addresses` afterChange (sync-safe `void …catch`) + afterDelete; `EmergencyContacts` new `afterChange+afterDelete`. Dynamic import only in collections.
- **BFF:** lists add 20s timeout (addresses/emergency) + `Cache-Control` (all four); details forward `X-*-Cache`. Frontend unchanged (lists already single `useQuery`; details direct-fetch now HIT-cached).
- **Verify:** `tsc` CMS + web-admin clean, `eslint` clean, `migrate:status` 5× `Yes`, no `migrate:fresh`.


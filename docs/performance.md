# Speed Optimization Principles (Final Checklist)

## 1. Diagnose first
- [ ] Trace the full path: UI hook → API proxy → backend handler → DB
- [ ] Count requests, queries, and auth hits per page load
- [ ] Compare rows hydrated vs. returned. If the ratio is over 10:1, fix it
- [ ] Measure before claiming a win (p50/p95, `EXPLAIN ANALYZE`, cache hit %)

## 2. Cut the work
- [ ] One page = one request. Merge parallel fetches into a single endpoint
- [ ] Aggregate in the DB, not in JS: `COUNT`, `SUM`, `GROUP BY`, `LIMIT`
- [ ] Never use `limit:1000` followed by JS `filter/reduce/sort`
- [ ] Use `count()` for counts, never `find` just to read `totalDocs`
- [ ] Select only the fields the UI renders
- [ ] Use the shallowest depth that renders correctly
- [ ] Use JOINs for names and emails instead of deep population
- [ ] Remove dead queries, unused fields, and redundant re-fetches
- [ ] Skip per-row CPU the UI never displays (e.g. store-hours loops, previews)
- [ ] Parallelize independent reads and serialize only true dependencies
- [ ] Batch N+1 lookups into one `IN (...)` query

## 3. Index smartly
- [ ] Composite indexes: equality columns first, then range/sort column
- [ ] Index every filter, sort, and foreign key column that is actually used
- [ ] Use `pg_trgm` GIN indexes for `%ILIKE%` search once tables grow
- [ ] Skip indexes on tiny tables (a seq scan is sub-ms)
- [ ] Review migrations as index-only, and never reset the DB

## 4. Cache in layers (L1 memory + Redis via Upstash)
- [ ] **Use Redis like Upstash as the shared L2 cache.** It is serverless and HTTP-based, so it works on Cloud Run and edge runtimes with no connection pooling
- [ ] **Use L1 in-process memory in front of Upstash.** It is the fastest layer and saves a network round-trip on hot keys
- [ ] Lookup order: **L1 fresh → in-flight → Upstash Redis → stale (SWR) → build**
- [ ] Write every built result to **both** L1 and Upstash
- [ ] Singleflight: concurrent misses on the same key share one build
- [ ] **Upstash is fail-open.** If it's slow or down, rebuild from the DB instead of erroring
- [ ] Don't await Upstash writes on hot paths. Write L1 synchronously and Upstash best-effort
- [ ] Import the Upstash cache package dynamically (`import()`), never at the top level of collections
- [ ] Keys: `ns:name:v1:<sorted-normalized-params>`. Use global keys for shared data, per-user keys only for personal data
- [ ] TTLs: ~60s for lists, ~300s for rollups/stats, ~120s for details
- [ ] Split slow-changing global stats into their own long-TTL rollup
- [ ] **Write-through:** in `afterChange`/`afterDelete`, bust **L1 and Upstash** by key prefix, wrapped in try/catch so a bust failure never breaks the write
- [ ] Don't bust only Upstash, or L1 keeps serving stale data until its TTL expires
- [ ] **Cache hits bypass the concurrency gate.** The gate wraps the builder only
- [ ] Never cache 404s or null results
- [ ] Add a `refresh=true` escape hatch that bypasses both L1 and Upstash
- [ ] Keep customer data `private, no-store` at the HTTP layer so only the server-side Upstash cache holds it
- [ ] Expose `X-Cache: HIT/STALE/MISS` for diagnostics

## 5. Perceived speed
- [ ] Never show blank: render an inline-styled shell immediately
- [ ] Stream the static shell and resolve auth afterward
- [ ] Server-prefetch default list queries into the client cache
- [ ] Prefetch on sidebar and links
- [ ] Defer below-the-fold data until near the viewport
- [ ] Load non-critical CSS and fonts without blocking render
- [ ] Import icons directly, not through barrel files
- [ ] Serve resized image variants (thumbnails) with lazy loading
- [ ] Keep skeleton loaders per section

## 6. Resilience
- [ ] Set timeouts at every hop (browser < proxy < DB)
- [ ] Pass abort signals through to fetches and cancel stale requests
- [ ] Debounce typeahead input
- [ ] Failed refresh keeps the old data visible, with a retry
- [ ] Never convert errors into empty-success responses
- [ ] Retire legacy endpoints with `410 Gone`

## 7. Scale rules
- [ ] Bound everything: page size, `LIMIT` pushdown, hydration caps
- [ ] Use cursor pagination only if deep pages matter, since it breaks numbered UIs
- [ ] Use a search engine only when typo-tolerance is a real requirement
- [ ] Use matviews or rollups only after profiling shows a breach
- [ ] Build deferred patterns on **triggers**, not speculation

## 8. Order of attack (highest impact first)
1. Fix fan-out and over-hydration
2. Add indexes
3. Move aggregation into SQL
4. Add L1 + Upstash cache with write-through invalidation
5. Dedupe to a single endpoint and a single query
6. Optimize first paint (prefetch, shell, direct imports)
7. Cut per-row CPU and narrow selects
8. Trigram search
9. Measure, then consider replicas, rollups, or auth fast-paths

## 9. Verify every change
- [ ] Type check and lint pass
- [ ] Migration status is clean
- [ ] Old and new numbers match (verify against real data)
- [ ] Response shapes are unchanged
- [ ] No secrets in the diff
- [ ] Don't claim speedups without measurements

## One-line rule
**Fetch less, compute in the DB, cache globally (L1 + Upstash Redis), invalidate on write, and never show a blank screen.**
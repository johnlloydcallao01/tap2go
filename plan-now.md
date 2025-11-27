apps/web Fetching Architecture Review — Home, Nearby, Newly Updated, Merchant Categories

Overview
- Goal: deeply analyze how data is fetched and supplied to the “/” page sections for Nearby Restaurants and Newly Updated, and the merchant categories used for home and search, identify duplication, and recommend an enterprise-grade design.
- Scope: `apps/web` client-side fetching and rendering paths, including components and client services.

Primary Data Sources
- Location-based merchants: `GET /merchant/location-based-display?customerId=&limit=&categoryId=` via client service at `apps/web/src/lib/client-services/location-based-merchant-service.ts:54-128`.
- Merchant categories: `GET /merchant-categories` using IDs mined from merchants, in multiple places:
  - Home categories carousel: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:83-154, 111-118`.
  - Shared client service method: `apps/web/src/lib/client-services/location-based-merchant-service.ts:130-164`.
- Merchant detail/addresses (for display of active address names):
  - Per-merchant lookups in list UIs: `apps/web/src/components/sections/LocationBasedMerchants.tsx:247-277`, `nearby-restaurants/page.tsx:33-65`, `newly-updated/page.tsx:33-65`.

Home Page Flow
- Component: `apps/web/src/app/(main)/page.tsx:94-111`.
- Resolves `customerId` once at page level: `apps/web/src/app/(main)/page.tsx:34-50`.
- Renders merchant categories carousel: `LocationBasedProductCategoriesCarousel` which:
  - Fetches all location-based merchants and mines `merchant_categories` IDs: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:88-104`.
  - Fetches category details by ID from `merchant-categories`: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:111-125`.
  - Resolves slug→id and emits `onCategoryIdResolved`: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:64-71`.
- Renders `LocationBasedMerchants` with optional `categoryId` for filtering: `apps/web/src/app/(main)/page.tsx:106-111`.

Nearby Restaurants Page
- Component: `apps/web/src/app/(main)/nearby-restaurants/page.tsx`.
- Resolves `customerId` and fetches merchants via service: `apps/web/src/app/(main)/nearby-restaurants/page.tsx:103-131`.
- Performs per-merchant active address name fetch with merchant detail then coordinates fallback: `apps/web/src/app/(main)/nearby-restaurants/page.tsx:32-65, 67-89`.
- Displays cards using `LocationMerchantCard`: `apps/web/src/app/(main)/nearby-restaurants/page.tsx:198-210`.

Newly Updated Page
- Component: `apps/web/src/app/(main)/newly-updated/page.tsx`.
- Resolves `customerId` and fetches merchants: `apps/web/src/app/(main)/newly-updated/page.tsx:103-118`.
- Sorts merchants by `updatedAt/createdAt` descending to represent “Newly Updated”: `apps/web/src/app/(main)/newly-updated/page.tsx:120-127`.
- Performs same per-merchant active address lookup flow: `apps/web/src/app/(main)/newly-updated/page.tsx:32-65, 67-89`.

LocationBasedMerchants Section (Home)
- Component: `apps/web/src/components/sections/LocationBasedMerchants.tsx`.
- Fetches merchants via service with optional `categoryId`: `apps/web/src/components/sections/LocationBasedMerchants.tsx:299-319`.
- “Nearby Restaurants” grid/carousel and “Newly Updated” grid/carousel are composed inside this component.
- Address name enrichment duplicates the per-merchant lookup flow: `apps/web/src/components/sections/LocationBasedMerchants.tsx:247-297`.
- “Newly Updated” sort duplicated here as well: `apps/web/src/components/sections/LocationBasedMerchants.tsx:323-333`.

Merchant Categories Across the App
- Home carousel sources merchant categories by mining merchant payloads then calling `merchant-categories`: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:88-118`.
- Client service now includes a shared method to fetch location-based merchant categories: `apps/web/src/lib/client-services/location-based-merchant-service.ts:130-164`.
- Search components use the shared service to supply category suggestions and filtering (ensures merchant categories, not product categories), e.g. `apps/web/src/components/search/SearchModal.tsx:107-157`.

Duplication and Inconsistencies
- Per-merchant address resolution logic:
  - Duplicated in three places (Home section, Nearby page, Newly Updated page), including building headers and coordinate fallback. References: `LocationBasedMerchants.tsx:247-297`, `nearby-restaurants/page.tsx:32-65`, `newly-updated/page.tsx:32-65`.
  - Each call performs N+1 network requests (merchant detail and optional address coords lookup), repeated across pages.
- “Newly Updated” sorting:
  - Duplicated in Home section (`LocationBasedMerchants.tsx:323-333`) and dedicated page (`newly-updated/page.tsx:120-127`).
- Merchant categories fetching:
  - Home carousel implements bespoke mining of IDs and direct API fetch (`LocationBasedProductCategoriesCarousel.tsx:88-125`).
  - Client service provides the same capability with caching (`location-based-merchant-service.ts:130-164`).
  - These paths are not unified; category sourcing logic is duplicated and not centralized.
- Customer ID resolution:
  - Implemented in multiple components (Home page, categories carousel, merchants section, nearby page, newly updated page) with similar patterns.
  - While there is caching in `getCurrentCustomerId`, individual components still resolve `customerId` redundantly, leading to scattered responsibility.

Risks and Operational Concerns
- Network efficiency:
  - N+1 address lookups (merchant detail, coordinates fallback) per view lead to high request volume and latency spikes on slower networks.
  - Mining categories by first fetching all merchants (limit=9999) can be heavy for dense areas; better to request categories directly per location.
- Consistency:
  - Multiple implementations of sorting and categories mining increase the chance of drift and regressions.
  - Historical confusion between product categories and merchant categories can reoccur when logic is not centralized.
- Caching coherence:
  - `dataCache` is used, but cache keys are per-component/service and do not dedupe cross-component fetches; lack of shared query cache can cause repeated identical requests.
- Security and API posture:
  - Client-side use of `NEXT_PUBLIC_PAYLOAD_API_KEY` exposes the service account key to the browser; consider proxying sensitive lookups via `/api/*` routes (server-side) to reduce exposure and centralize auth policy.

Recommendations (Enterprise-Level)
- Centralize category sourcing:
  - Establish `getLocationBasedMerchantCategories(customerId, options)` as the single source of truth. Ensure all UI (home carousel, search suggestions) uses this method rather than duplicating ID-mining and direct fetches.
  - Prefer a server-provided endpoint `GET /merchant/location-based-categories?customerId=` that returns active categories for the customer’s location, so we avoid fetching all merchants to mine category IDs.
- Address enrichment service:
  - Create `MerchantAddressService.getActiveAddressNames(merchantIds)` to batch-fetch active addresses for a list of merchants (one endpoint) instead of per-merchant requests.
  - Add local cache keyed by merchant id and TTL (e.g., 5–15 minutes) and a concurrency limiter to avoid floods.
  - Expose a hook `useMerchantActiveAddresses(merchants)` that uses the service and caches results.
- Shared data hooks:
  - `useLocationBasedMerchants({ customerId, categoryId, limit })` returning `{ merchants, isLoading, error }` with internal caching. Reuse across Home section and pages.
  - `useLocationBasedMerchantCategories({ customerId })` returning `{ categories, isLoading, error }`.
  - `useCustomerId()` context/provider that resolves once and provides `customerId` globally.
- Sorting utilities:
  - Add `getUpdatedTimeMs(m)` and `sortByRecentlyUpdated(list)` utilities in a shared module (e.g., `lib/utils/merchants.ts`). Use the same function in Home and Newly Updated page to guarantee consistency.
- API access normalization:
  - Wrap all CMS calls in service modules and, where possible, proxy via Next.js API routes to centralize authentication, logging, and rate limiting. This allows replacing `NEXT_PUBLIC_PAYLOAD_API_KEY` exposure with server-side credentials.
- Performance controls:
  - Avoid `limit=9999` merchant requests for categories mining; use dedicated categories endpoint or paginate and aggregate with reasonable limits.
  - Debounce and memoize expensive operations (category mining, address enrichment) and use shared caches.
- Type consistency:
  - Normalize `categoryId` to `string` everywhere to match service signatures; map numeric IDs to strings at boundaries.

Proposed Refactor Plan (Incremental)
- Phase 1: Centralize category fetching
  - Adopt `getLocationBasedMerchantCategories` service as the only path for categories.
  - Refactor `LocationBasedProductCategoriesCarousel` to consume the service rather than re-implementing ID mining and direct fetch.
  - Ensure search components rely on the same service.
- Phase 2: Shared merchant list and sorting
  - Introduce `useLocationBasedMerchants` hook with shared error/loading/caching logic.
  - Move “Newly Updated” sort into `lib/utils/merchants.ts` and reuse in Home section and page.
- Phase 3: Address enrichment consolidation
  - Implement `MerchantAddressService.getActiveAddressNames(merchantIds)` with batching and caching.
  - Replace per-merchant fetch logic in `LocationBasedMerchants`, `nearby-restaurants/page.tsx`, `newly-updated/page.tsx` with the shared service/hook.
- Phase 4: Customer ID context
  - Provide `CustomerProvider` that resolves `customerId` once and avoids repeated resolutions in components.
  - Update pages/components to consume from context.
- Phase 5: Server-side proxying (optional, recommended)
  - Introduce Next.js API routes for sensitive CMS calls (merchant detail, address lookups, categories) to remove client exposure of API key and unify error handling.

Expected Outcomes
- Reduced network requests and latency, especially for address enrichment.
- Consistent category behavior across home, search, and filters, eliminating product-vs-merchant category confusion.
- Lower maintenance cost via centralized logic, fewer regressions.
- Better security posture by removing client-side service account key usage for sensitive endpoints.

Open Questions & Assumptions
- Is a server endpoint like `GET /merchant/location-based-categories` available or feasible to add? If not, we will keep the service-driven aggregation with stricter pagination.
- SLA on address freshness and acceptable cache TTL for `activeAddressName`.
- Acceptable maximum item counts for mobile carousels vs desktop grids; current limits: merchants 8 for mobile carousels.
- Any need to include product categories alongside merchant categories in any UI? If so, maintain separate services to avoid conflation and clearly differentiate.

Key References
- Home: `apps/web/src/app/(main)/page.tsx:94-111` (wiring categories and merchants), `apps/web/src/app/(main)/page.tsx:34-50` (customerId resolution).
- Merchants section: `apps/web/src/components/sections/LocationBasedMerchants.tsx:299-319` (fetch), `apps/web/src/components/sections/LocationBasedMerchants.tsx:323-333` (recently updated sort), `apps/web/src/components/sections/LocationBasedMerchants.tsx:247-297` (address enrichment).
- Nearby: `apps/web/src/app/(main)/nearby-restaurants/page.tsx:103-131` (fetch), `apps/web/src/app/(main)/nearby-restaurants/page.tsx:32-65` (address enrichment).
- Newly Updated: `apps/web/src/app/(main)/newly-updated/page.tsx:103-118` (fetch), `apps/web/src/app/(main)/newly-updated/page.tsx:120-127` (sort), `apps/web/src/app/(main)/newly-updated/page.tsx:32-65` (address enrichment).
- Categories carousel: `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:83-154` (fetch flow), `apps/web/src/components/carousels/LocationBasedProductCategoriesCarousel.tsx:64-71` (slug→id resolution).
- Client service: `apps/web/src/lib/client-services/location-based-merchant-service.ts:54-128` (merchants), `apps/web/src/lib/client-services/location-based-merchant-service.ts:130-164` (merchant categories), `apps/web/src/lib/client-services/location-based-merchant-service.ts:170-207` (customerId resolution).

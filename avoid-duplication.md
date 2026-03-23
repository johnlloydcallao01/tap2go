# Recommendations for Removing Address Service Duplication

Based on the analysis of both `apps/web/src/lib/services/address-service.ts` and `packages/client-services/src/services/address-service.ts`, here is the recommended step-by-step approach to eliminate the duplication and rely entirely on the shared package:

### 1. Consolidate and Merge Missing Methods into the Shared Package
Currently, the local web service might have some specialized methods or slightly different method signatures (e.g., `deleteAddress`, `setDefaultAddress`, `updateAddress`) compared to the shared package. 
**Recommendation:** Audit the shared `AddressService` in `packages/client-services` and add any missing CRUD methods from the web version. Ensure the shared package is the single source of truth for all address-related business logic.

### 2. Standardize Authentication and API Routing
- **Current State:** `apps/web` calls a Next.js proxy route (`/api/addresses`) which internally handles the user token (from cookies or localStorage) before hitting the CMS. The mobile app (`client-services`) talks directly to the CMS API (`https://cms.../api/addresses`) by explicitly passing the token.
- **Recommendation:** Refactor the shared `AddressService` to accept the `API_BASE` as an injectable configuration, OR update `apps/web` to communicate directly with the CMS API using the shared service. The latter is preferred for monorepo consistency: `apps/web` components should retrieve the token (via `useAuth` hook) and pass it directly to the `client-services` methods, bypassing the Next.js proxy route entirely.

### 3. Unify the Caching Strategy
Both services utilize the `dataCache` mechanism.
**Recommendation:** Ensure the shared package includes the robust caching, cache-invalidation (`clearCache()`, `removeAddressFromCache()`), and fallback mechanisms currently present in the web app's local service. When a user creates or deletes an address, the shared package should handle the cache invalidation uniformly for both web and mobile.

### 4. Update Imports and Component Logic in `apps/web`
Once the shared package is robust enough to handle the web app's needs:
**Recommendation:** Go through `apps/web` components (e.g., `CheckoutAddressSection.tsx`, `LocationSelector.tsx`, `AddressesClient.tsx`) and:
1. Change imports from `@/lib/services/address-service` to `@encreasl/client-services`.
2. Update the method calls to pass the authentication token explicitly (e.g., `AddressService.getUserAddresses(token)` instead of relying on the service to pull from `localStorage`).

### 5. Deprecate and Remove Local Files
**Recommendation:** Once all components in `apps/web` are successfully using the shared package and everything is tested:
1. Delete `apps/web/src/lib/services/address-service.ts`.
2. Delete the Next.js API proxy route files under `apps/web/src/app/api/addresses/` (if they are no longer used by other parts of the system).

### Summary
By moving all specific API logic into `packages/client-services/src/services/address-service.ts` and injecting the auth token from the client components, you can safely delete the local web service and achieve a 100% shared address logic architecture across both Web and Mobile.
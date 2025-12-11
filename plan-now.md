# Mobile Search Popup: Merchant Results Navigation (apps/web)

## Overview

- The mobile search popup is implemented as a client-side modal rendered into `document.body` using a portal.
- Merchant search results inside the popup are rendered as `LocationMerchantCard` items that link to the merchant view route.
- Navigation to a merchant page happens via `next/link` client-side routing, so the app transitions without a full page reload.

## Key Components

- `apps/web/src/components/search/SearchModal.tsx` — mobile popup for searching merchants and foods.
- `apps/web/src/components/cards/LocationMerchantCard.tsx` — merchant list/card with a `Link` to the merchant page.
- `apps/web/src/app/(main)/merchant/[slugId]/page.tsx` — the merchant view page.
- `apps/web/src/lib/client-services/location-based-merchant-service.ts` — client service fetching location-based merchants and categories.

## How the Mobile Search Popup Works

1) Open and render the modal
- The header toggles the popup via state. The modal is portaled to `document.body`:
- `apps/web/src/components/layout/Header.tsx:835` renders `<SearchModal isOpen={isSearchOpen} onClose={...} />`.
- The modal disables body scroll when open and re-enables it when closed: `apps/web/src/components/search/SearchModal.tsx:63-78`.
- The modal is rendered using a portal: `apps/web/src/components/search/SearchModal.tsx:375-393`, `492`.

2) Fetch merchants and categories for the current customer
- On open, it resolves the current customer and loads nearby merchants and categories:
- `apps/web/src/components/search/SearchModal.tsx:114-136` and `155-176`.
- The service that actually hits the CMS API:
- `apps/web/src/lib/client-services/location-based-merchant-service.ts:65-139` (merchants), `141-189` (categories).

3) Build suggestions and perform filtering
- Suggestions combine merchant names, categories, tags, and product names:
- `apps/web/src/components/search/SearchModal.tsx:280-326`.
- Committed searches (after Enter or clicking a suggestion) trigger product→merchant matching:
- `apps/web/src/components/search/SearchModal.tsx:205-244`.
- Final merchant result set merges category matches, product matches, and text matches:
- `apps/web/src/components/search/SearchModal.tsx:262-278`.

4) Render merchant results as navigable cards
- Once filtered, results are rendered as `LocationMerchantCard` with a compact list variant:
- `apps/web/src/components/search/SearchModal.tsx:472-481`.

## Why Clicking Navigates to the Merchant View Page

1) Merchant card creates a slug and links to the merchant route
- `LocationMerchantCard` constructs a `slugId` based on outlet name and ID, then uses `next/link`:
- `apps/web/src/components/cards/LocationMerchantCard.tsx:41-51` (slug assembly), `51-52` and `104-105` (Link to `/merchant/${slugId}`).

2) The merchant page route parses the ID from `slugId` and loads the merchant
- The dynamic route `[slugId]` extracts the numeric ID from the tail of the slug and fetches data:
- `apps/web/src/app/(main)/merchant/[slugId]/page.tsx:68-71` (ID parsing), `70-73` (notFound when missing), `75-88` (hero and header), `178-179` (product grid client).
- Server-side service call to CMS:
- `apps/web/src/server/services/merchant-service.ts:93-126` (`getMerchantById`).

This means when you click any merchant result, the link navigates to `/merchant/{slug}-{id}`, the route reads the `{id}`, fetches the merchant, and renders the page.

## Why It Doesn’t Require a Page Reload

- `next/link` performs client-side navigation. Clicks are intercepted and the router transitions to the new route without a full browser reload.
- In the Next.js App Router, route changes stream server-rendered content while preserving client state where applicable. The modal itself unmounts as `isOpen` becomes false, but the navigation is handled via the SPA router.
- Code references showing portal and `Link` usage:
- Portal: `apps/web/src/components/search/SearchModal.tsx:375-393`, `492`.
- Link-based navigation: `apps/web/src/components/cards/LocationMerchantCard.tsx:51-52`, `104-105`.

## Pattern You Can Reuse in Other Apps

- Use `next/link` with SEO-friendly slugs that still carry a stable identifier.
  - Build slugs as `{normalized-name}-{id}` on the client.
  - In the route, parse the `{id}` by splitting on `-` and taking the last token.
  - References: `apps/web/src/components/cards/LocationMerchantCard.tsx:41-49`, `apps/web/src/app/(main)/merchant/[slugId]/page.tsx:68-71`.

- Keep search modals fully client-side and portaled.
  - Render with `createPortal` to `document.body` for consistent overlay behavior.
  - Lock body scroll while the modal is open for a native mobile feel.
  - References: `apps/web/src/components/search/SearchModal.tsx:63-78`, `375-393`, `492`.

- Merge multiple relevance signals for better results.
  - Combine text matches (name, vendor, description, tags) with category matches and product→merchant matches.
  - Debounce product lookups and use lightweight suggestion lists.
  - References: `apps/web/src/components/search/SearchModal.tsx:262-278`, `280-326`, `205-244`.

- Centralize CMS access in typed client services and cache results.
  - Use a client service module to fetch merchants and categories, with short-term caching.
  - References: `apps/web/src/lib/client-services/location-based-merchant-service.ts:65-139`, `141-189`.

- Encapsulate display as reusable cards.
  - Render merchants via a single card component (`LocationMerchantCard`) with variants.
  - References: `apps/web/src/components/cards/LocationMerchantCard.tsx:28-35`, `49-101`, `103-166`.

## Bonus: In-Merchant “Search Menu” Popup

- Inside each merchant page there’s a dedicated product search popup for that merchant:
- Trigger: `apps/web/src/components/merchant/MobileStickyHeader.tsx:51-61` emits `merchant:open-search`.
- Listener and modal: `apps/web/src/components/merchant/MerchantProductGrid.tsx:103-113` opens `<MerchantSearchModal />`.
- Product search modal builds product links to `/merchant/{slugId}/{productSlugId}`:
- `apps/web/src/components/merchant/MerchantSearchModal.tsx:132-141`.
- Product detail route parses ID from `productSlugId` and renders the detail client:
- `apps/web/src/app/(main)/merchant/[slugId]/[productSlugId]/page.tsx:39-49`.

## Recap

- Merchant search results navigate correctly because cards use `next/link` to `/merchant/{slug}-{id}` and the dynamic route extracts the ID to fetch and render.
- The popup and navigation are client-side, so transitions don’t reload the page.
- The approach is modular: portal-based modal, typed client services, reusable cards, and slug+ID routing that’s easy to adopt across apps.

---

## Focus: Mobile Popup Merchant Results → Merchant Page Navigation

- Results render as list cards: `apps/web/src/components/search/SearchModal.tsx:472-481` maps filtered merchants to `LocationMerchantCard` with `variant="list"`.
- Each card builds a `slugId` and links to the merchant page: `apps/web/src/components/cards/LocationMerchantCard.tsx:41-49` (slug assembly) and `51-52` (Link `href` = `/merchant/${slugId}`).
- The merchant route `[slugId]` extracts the trailing numeric ID and fetches merchant data: `apps/web/src/app/(main)/merchant/[slugId]/page.tsx:68-71` (ID parse) and `70-73` (missing → `notFound`).
- Net effect: clicking a popup result navigates to `/merchant/{slug}-{id}` and the dynamic route loads and renders that merchant view.

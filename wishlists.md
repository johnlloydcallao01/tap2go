# Wishlist Schema Design for apps/cms

This document summarizes deep research (internal + external) on how to model wishlists in `apps/cms` so that:
- It supports **both merchants and merchant products** as wishlist items.
- It is **highly scalable** (millions of rows, high read/write traffic).
- It fits the existing **PayloadCMS + Postgres** architecture and current collections like `merchants`, `merchant-products`, `products`, `recent-views`, `recent-searches`, `cart-items`.
- It stays flexible for future extensions (folders, per‑wishlist sharing, analytics).

---

## 1. Current Context in apps/cms

### 1.1 Relevant existing collections

Key collections in `apps/cms/src/collections`:
- `Merchants`: merchant outlets and locations, including vendor, operational status, delivery configuration, geo columns.  
  - File: `apps/cms/src/collections/Merchants.ts`
- `MerchantProducts`: join between merchants and products, with price overrides and stock per merchant.  
  - File: `apps/cms/src/collections/MerchantProducts.ts`  
  - Relationships:
    - `merchant_id` → `merchants`
    - `product_id` → `products`
- `Products`: master product catalog (names, descriptions, categories, media, pricing).  
  - File: `apps/cms/src/collections/Products.ts`
- `Customers` + `Users`: user and customer profiles and roles.  
  - Files: `Customers.ts`, `Users.ts`
- `CartItems`: shopping cart rows (per customer, merchant, product, merchant-product, quantities, price snapshots).  
  - File: `apps/cms/src/collections/CartItems.ts`
- `RecentViews`: per‑user **history** of viewed merchants and merchant products, including `itemType`, `merchant`, `merchantProduct`, `product`, `viewCount`, timestamps, and a `compositeKey`.  
  - File: `apps/cms/src/collections/RecentViews.ts`
- `RecentSearches`: per‑user search history with normalization and a `compositeKey`.  
  - File: `apps/cms/src/collections/RecentSearches.ts`

Observations:
- There is **no existing wishlist / favorites collection** in `apps/cms`.
- There is a clear pattern for **per‑user behavioral data**:
  - `recent-searches` and `recent-views` both:
    - Store `user` (relationship to `users`) and optional `deviceId`.
    - Use an `itemType` or `scope` select.
    - Maintain a `compositeKey` (user + type + identifier) with unique constraint.
    - Track frequency or view counts and timestamps.
- `CartItems` uses a more denormalized structure with `customer`, `merchant`, `product`, `merchantProduct`, price snapshot fields, and `itemHash` for deduplication.

These patterns are highly relevant for a wishlist design.

### 1.2 Frontend expectations

On the frontend side:
- Web app:
  - `LocationMerchantCard` expects props like `merchant`, `isWishlisted`, `onToggleWishlist`, and `addressName`.
  - A dedicated wishlist page exists at `apps/web/src/app/(main)/wishlists/page.tsx`.
- Mobile customer app:
  - `WishlistScreen.tsx` exists in `apps/mobile-customer/src/screens/WishlistScreen.tsx`.

Conclusion: **UI for wishlist exists**, but **backend persistence does not**. We need a CMS‑level schema that:
- Can mark **merchants** as wishlisted.
- Can mark **merchant products** (and underlying products) as wishlisted.
- Can easily answer queries for:
  - "All wishlisted merchants for this user"
  - "All wishlisted products/merchant-products for this user"
  - Mixed "all wishlist items" sorted by recency or grouping.

---

## 2. External Research Summary (Industry Patterns)

### 2.1 Typical e‑commerce wishlist tables

Common patterns from external references:

1. **Single wishlist table per user with product link**  
   - Many designs use a table like:
     - `wishlists(user_id, product_id, created_at, ...)`
   - Example: DEV article on e‑commerce database design describes a wishlist table as "just store the `user_id` and `product_id`" plus timestamps and optional metadata [DEV Community, 2021][1].
   - Pros:
     - Very simple.
     - Efficient for pure "user ↔ product" relationships.
   - Cons:
     - Only handles **one entity type** (products).
     - Harder to generalize for merchants, categories, bundles, etc.

2. **Conceptual wishlist + separate WishlistItem table**
   - Some designs model:
     - `wishlist(id, user_id, name, is_default, ...)`
     - `wishlist_item(id, wishlist_id, product_id, created_at, ...)`
   - This allows:
     - Multiple wishlists per user (e.g., "Favorites", "Birthday", "For later").
     - Sharing a wishlist with others.
   - Example: ER diagrams for online shopping from Vertabelo / Redgate treat Wishlist as an entity that "stores items chosen by the customer for possible future purchases" [Redgate, 2023][5].
   - Pros:
     - Flexible grouping and sharing.
   - Cons:
     - A bit more complexity; still usually **product‑only**.

3. **Polymorphic “favorites” table**
   - More advanced platforms consolidate favorites into a single table that supports multiple entity types:
     - `favorite_items(user_id, entity_type, entity_id, created_at, ...)`
   - Variants:
     - Use a polymorphic `entity_type` + `entity_id`.
     - Use dedicated columns with a `type` column (similar to current `recent-views`):
       - `item_type` enum (e.g., `merchant`, `merchant_product`).
       - `merchant_id`, `merchant_product_id`, `product_id` columns.
   - Pros:
     - Single global view of user favorites across different domains.
     - Easy to answer "what are this user's favorites?" with filter by type.
   - Cons:
     - Slightly more complexity in uniqueness constraints and indexing.

### 2.2 Scalability considerations from general e‑commerce schemas

Across multiple e‑commerce schema examples and discussions (Postgres‑focused and generic) [1][3][4][5]:
- **Normalize** transactional data at least up to 3rd Normal Form (3NF):
  - No repeating groups; each table represents a single concept; no redundant columns.
- For **high‑cardinality link tables** like wishlist items:
  - Use narrow tables (few columns) for the hot path (user ↔ item).
  - Ensure there is a **composite unique key** to avoid duplicates, e.g.:
    - `(user_id, item_type, merchant_id, merchant_product_id)` or
    - `(user_id, product_id)` in simpler models.
  - Add **indexes aligned with query patterns**:
    - `user_id` + `created_at` (listing a user's wishlist by recency).
    - `user_id` + `item_type` (filter by merchants vs products).
    - Possibly partial indexes (e.g., only active items).
- **Avoid per‑type tables** unless you truly need different columns per type:
  - Many answers emphasize that creating new tables for each item subtype quickly leads to complexity; they recommend a unified "things we sell" or "items" table with type attributes [Stack Overflow Postgres e‑commerce design][4].

In other words, from a scalability and maintainability perspective, a **single logically unified wishlist items table** with an item type discriminator and correct indexing is usually preferred.

---

## 3. Design Choice for apps/cms Wishlists

We want to support:
- Merchants as wishlist entries (for later ordering from a store).
- Merchant products as wishlist entries (for specific dishes/items).
- Possibly raw products in the future (if needed).
- High scale: potentially **millions of rows** for active users, including mobile apps.

The chosen design is a **single `wishlist-items` collection** (unified polymorphic design).

Conceptually:
- One **row per wishlisted item**, with:
  - `user` (relationship to `users`) and optional `deviceId`.
  - `itemType` enum: `merchant` or `merchant_product` (and optionally `product` later).
  - `merchant` relationship.
  - `merchantProduct` relationship (when `itemType === 'merchant_product'`).
  - Optional `product` relationship (denormalized convenience).
  - `compositeKey` unique per user + item.
  - Timestamps.

This is directly analogous to the existing `recent-views` collection.

**PayloadCMS shape (conceptual)**:
- Collection: `wishlist-items` (slug: `wishlist-items`, dbName: `wishlist_items` optional).
- Fields:
  - `user`: relationship → `users` (required).
  - `deviceId`: text (optional).
  - `itemType`: select
    - Options: `merchant`, `merchant_product` (and maybe `product` later).
  - `merchant`: relationship → `merchants` (required when `itemType` is `merchant` or `merchant_product`).
  - `merchantProduct`: relationship → `merchant-products` (required when `itemType` is `merchant_product`).
  - `product`: relationship → `products` (optional, denormalized pointer; helpful when `merchantProduct` is also linked to a product).
  - `source`: select (`web`, `mobile`, `unknown`) – matching `recent-views`.
  - `addressText`: text (optional snapshot of active address, similar to `recent-views`).
  - `notes` / `label`: optional text for user‑specific notes (future).
  - `meta`: json (future extensibility).
  - `compositeKey`: text, unique.
  - Timestamps: `createdAt`, `updatedAt`.

**Uniqueness and indexes:**
- Unique:
  - `compositeKey` (one row per user + item).
- Indexes:
  - `(user, createdAt)` – for "list wishlist items by newest first".
  - `(user, itemType, createdAt)` – for filtered queries by type.
  - Potential partial indexes (e.g., `WHERE itemType = 'merchant'` and `WHERE itemType = 'merchant_product'`) if needed at very high scale.

**Composite key strategy:**
- Use a `beforeValidate` hook similar to `recent-views`:
  - When `itemType === 'merchant'`:
    - `compositeKey = userId + ':merchant:' + merchantId`
  - When `itemType === 'merchant_product'`:
    - `compositeKey = userId + ':merchant_product:' + merchantId + ':' + merchantProductId`
  - This guarantees **no duplicates** per user and item while remaining simple.

**Access control:**
- Same pattern as `recent-views` and `recent-searches`:
  - `read`: service/admin can read all; normal users only see their own rows.
  - `create`: only authenticated users (and service accounts) can create.
  - `update` / `delete`: same per‑user or admin/service controls.

**Query patterns supported:**
- Get all wishlisted merchants:
  - Filter `itemType = 'merchant'` and join `merchant` + `vendor`.
- Get all wishlisted merchant products:
  - Filter `itemType = 'merchant_product'`, join `merchantProduct` + `product` + `merchant`.
- Mixed "my wishlist" view:
  - Filter by `user`, sort by `createdAt DESC`, optionally filter by `itemType`.
- Quick checks:
  - "Is merchant X in this user's wishlist?"
    - Look up by `compositeKey` or `user + itemType + merchant`.

**Advantages:**
- **Aligned with existing patterns** (`recent-views`, `recent-searches`).
- Simple integration for web and mobile: one API endpoint for wishlist items with filters.
- Easy to add new item types in the future (`product`, `category`, etc.) by extending the `itemType` enum and adding an extra relationship column when needed.
- **Scalable**: a single narrow table with proper indexes can handle millions of rows efficiently in Postgres; this is standard for "user ↔ item" relations.

---

## 4. Scalability Analysis

### 4.1 Data volume and access patterns

Wishlist data is:
- Write pattern:
  - Spiky, but typically **low write volume per user** (add/remove).
  - Rows are rarely updated except for timestamps; mostly insert/delete.
- Read pattern:
  - Very read‑heavy ("My wishlist" on web/mobile home, merchant pages, etc.).
  - Common queries:
    - "Give me all wishlist merchants for user X."
    - "Give me all wishlist products for user X."
    - "Is this merchant/product in user X's wishlist?"
  - All queries are strongly **user‑scoped** (always filter by user first).

Given these patterns:
- A single `wishlist-items` table with:
  - **Primary index** on `id`.
  - **Composite indexes** on `(user, itemType, createdAt)` and `(user, createdAt)`.
  - Unique `compositeKey`.
- Is more than sufficient for millions of rows.

Postgres handles this pattern well:
- The table is narrow (handful of columns).
- All high‑traffic queries can use the `user` column as the leading index column.
- If needed, you can use:
  - Partial indexes per `itemType`.
  - Table partitioning by `itemType` or by user ID hash.

Splitting into separate tables for merchants vs products does not inherently improve scalability in this scenario; it mostly increases schema and code complexity.

### 4.2 When multiple tables might be justified

Multiple per‑type tables could make sense if:
- Each type has **significantly different attributes** and you need to store many type‑specific columns.
- You operate at **massive scale** (hundreds of millions of rows) and:
  - You want to physically partition data by type.
  - You need to tune per‑type storage and indexing differently.
- You want to **completely isolate** access and retention policies per item type.

For Tap2Go's current architecture and scale, this is premature. A single `wishlist-items` collection with a clean `itemType` discriminator, plus appropriate indexing, is both simpler and scalable.

Conclusion:
- **Most scalable and maintainable approach for now**:  
  - **One `wishlist-items` collection/table** with `itemType` + polymorphic relationships.
- If future requirements demand more, we can:
  - Add per‑type partial indexes.
  - Use Postgres **partitioning** by `itemType` without changing the logical Payload collection shape.
  - Optionally introduce a higher‑level `wishlists` collection for multiple named lists, while still keeping a single items table.

---

## 5. Concrete Schema Proposal for apps/cms

### 5.1 Collection definition (logical)

New collection: `WishlistItems`.

- **Slug**: `wishlist-items`
- **dbName** (optional): `wishlist_items`
- **Admin group**: likely `History` or `Food Delivery` (similar to `recent-views` / `cart-items`).

Fields:
1. **User association**
   - `user`: relationship → `users` (required)
   - `deviceId`: text (optional)

2. **Item type and identity**
   - `itemType`: select (required)
     - Options:
       - `merchant`
       - `merchant_product`
       - (optional future) `product`
   - `merchant`: relationship → `merchants`
     - Required when `itemType` is `merchant` or `merchant_product`.
   - `merchantProduct`: relationship → `merchant-products`
     - Required when `itemType` is `merchant_product`.
   - `product`: relationship → `products`
     - Optional denormalized pointer, mainly for faster joins when the frontend needs product attributes directly.

3. **Metadata**
   - `source`: select
     - Options: `web`, `mobile`, `unknown`. Default: `unknown`.
   - `addressText`: text (optional; snapshot of active address when added).
   - `notes`: text (optional; user notes like "Order on Friday").
   - `meta`: json (optional; flexible for future analytics/flags).

4. **Composite key (uniqueness)**
   - `compositeKey`: text, unique
     - Generated in `beforeValidate` hook:
       - For `merchant`:  
         `userId:merchant:merchantId`
       - For `merchant_product`:  
         `userId:merchant_product:merchantId:merchantProductId`

5. **Timestamps**
   - Use Payload `timestamps: true` → `createdAt`, `updatedAt`.

Indexes:
- `{ fields: ['user', 'createdAt'] }`
- `{ fields: ['user', 'itemType', 'createdAt'] }`
- Optionally later:
  - `{ fields: ['itemType', 'createdAt'] }`
  - Partial indexes for heavy types at Postgres level.

### 5.2 Example collection config (PayloadCMS)

Below is a **conceptual** example of what the collection config would look like in `apps/cms/src/collections/WishlistItems.ts`.  
This is not implemented yet, but shows the intended shape.

```ts
import type { CollectionConfig } from 'payload'

export const WishlistItems: CollectionConfig = {
  slug: 'wishlist-items',
  admin: {
    useAsTitle: 'compositeKey',
    defaultColumns: ['user', 'itemType', 'merchant', 'merchantProduct', 'createdAt'],
    group: 'History',
  },
  timestamps: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user.role as string) === 'service' || (user.role as string) === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if ((user?.role as string) === 'service' || (user?.role as string) === 'admin') return true
      return { user: { equals: user?.id || '' } }
    },
    delete: ({ req: { user } }) => {
      if ((user?.role as string) === 'service' || (user?.role as string) === 'admin') return true
      return { user: { equals: user?.id || '' } }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'deviceId',
      type: 'text',
    },
    {
      name: 'itemType',
      type: 'select',
      required: true,
      options: [
        { label: 'Merchant', value: 'merchant' },
        { label: 'Merchant Product', value: 'merchant_product' },
      ],
    },
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
    },
    {
      name: 'merchantProduct',
      type: 'relationship',
      relationTo: 'merchant-products',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'unknown',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'addressText',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'text',
    },
    {
      name: 'meta',
      type: 'json',
    },
    {
      name: 'compositeKey',
      type: 'text',
      unique: true,
    },
  ],
  indexes: [
    { fields: ['user', 'createdAt'] },
    { fields: ['user', 'itemType', 'createdAt'] },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return
        type Mutable = {
          user?: string | number | { id?: string | number }
          itemType?: string
          merchant?: string | number | { id?: string | number }
          merchantProduct?: string | number | { id?: string | number }
          compositeKey?: string
        }
        const d = data as Mutable

        let userId = ''
        const u = d.user
        if (typeof u === 'string' || typeof u === 'number') {
          userId = String(u)
        } else if (u && typeof (u as { id?: string | number }).id !== 'undefined') {
          userId = String((u as { id?: string | number }).id)
        }

        let merchantId = ''
        const m = d.merchant
        if (typeof m === 'string' || typeof m === 'number') {
          merchantId = String(m)
        } else if (m && typeof (m as { id?: string | number }).id !== 'undefined') {
          merchantId = String((m as { id?: string | number }).id)
        }

        let merchantProductId = ''
        const mp = d.merchantProduct
        if (typeof mp === 'string' || typeof mp === 'number') {
          merchantProductId = String(mp)
        } else if (mp && typeof (mp as { id?: string | number }).id !== 'undefined') {
          merchantProductId = String((mp as { id?: string | number }).id)
        }

        const itemType = typeof d.itemType === 'string' ? d.itemType : ''
        if (!userId || !itemType) return

        if (itemType === 'merchant') {
          if (!merchantId) return
          d.compositeKey = `${userId}:merchant:${merchantId}`
        } else if (itemType === 'merchant_product') {
          if (!merchantId || !merchantProductId) return
          d.compositeKey = `${userId}:merchant_product:${merchantId}:${merchantProductId}`
        }
      },
    ],
  },
}
```

This mirrors the approach already used in `RecentViews`, which is known to work well in the current codebase.

---

## 6. Answer to the Design Questions

1. **Support both merchants and merchant products in wishlists?**
   - Use a single `wishlist-items` collection with:
     - `itemType` select: `merchant` / `merchant_product`.
     - `merchant` relationship (always set).
     - `merchantProduct` relationship for product rows.
     - Optional `product` relationship for convenience.

2. **Scalability?**
   - Single narrow table with:
     - Composite indexes on `(user, itemType, createdAt)` and `(user, createdAt)`.
     - Unique `compositeKey` to avoid duplicates.
   - Pattern is proven in large e‑commerce systems and matches your existing `recent-views` / `recent-searches` history tables.
   - If scale increases massively, Postgres partitioning and partial indexes can be layered on without changing the logical model.

3. **Separate tables vs one unified table: which is best?**
   - For Tap2Go **right now**, the most scalable and maintainable approach is:
     - **One unified `wishlist-items` collection/table with an `itemType` discriminator.**
   - Separate tables for merchant vs merchant‑product wishlists mainly add complexity and are only justified at extreme scale or if each type has very different attributes and rules.
   - You can still introduce a higher‑level `wishlists` collection later for named lists / sharing, while keeping a single items table underneath.

---

## 7. References

[1]: https://dev.to/ezzdinatef/ecommerce-database-design-1ggc  
     *Ezz Eldin Atef, "eCommerce Database Design" (DEV Community) – describes a simple Wishlist table keyed by user and product.*

[3]: https://github.com/ramortegui/e-commerce-db  
     *Generic e‑commerce database schema for web stores – demonstrates normalized transactional schema and user↔product relationships.*

[4]: https://stackoverflow.com/questions/31841269/postgresql-database-design-for-ecommerce  
     *Stack Overflow discussion on Postgres e‑commerce design – emphasizes having unified entities and avoiding per‑product‑type tables when possible.*

[5]: https://vertabelo.com/blog/er-diagram-for-online-shop/  
     *Redgate / Vertabelo article on ER diagram for online shopping – includes Wishlist as a dependent entity of Customer and shows normalized transactional modeling.*

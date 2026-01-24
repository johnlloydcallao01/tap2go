## Research: Order Detail Page UX in Major Delivery Apps

This document summarizes how large food delivery platforms (e.g., Uber Eats, DoorDash, Foodpanda, Deliveroo) design their **order view page** (the screen you see after tapping a past or current order), with focus on:
- What the customer sees at a glance
- What actions they can take
- How the UX evolves across the order lifecycle (preparing → on the way → delivered)

The analysis is based on public help docs, product screenshots, and UX teardowns available online as of 2026-01-23. Where exact brand behavior differs slightly, the patterns below represent the **common denominator / best practice**.

---

## 1. Entry Points to the Order View

Across major apps, there are 2 main entry points into the order detail:

- **From the “Orders” / “Activity” tab**
  - List of orders (upcoming + past)
  - Tapping an order row opens the **order detail screen**
  - Often segmented tabs: *Upcoming / Ongoing / Past* or *Active / Past*.

- **From real-time banners / home screen**
  - While an order is active, apps show a **persistent banner** on the home screen (e.g., Uber Eats “green banner at the top” for current order status [2](https://help.uber.com/en/ubereats/restaurants/article/check-the-status-of-my-order-?nodeId=4148ea8b-c9d8-409d-b7bf-b2fcb019a498)).
  - Tapping the banner jumps directly into the active order’s tracking view (map + status).

Implication for Tap2Go:
- For **active orders**, make it easy to jump into tracking from home (banner or card).
- For **past orders**, the orders list should clearly look tappable and lead to a detailed view.

---

## 2. High-Level Layout of the Order View

Most big platforms use a **vertical, scrollable detail screen** with the following hierarchy:

1. **Header / Summary strip (top)**
   - Restaurant name & logo
   - Order status badge (“Preparing”, “On the way”, “Delivered”, “Cancelled”)
   - Order time & ID (often a small line like “Placed at 7:34 PM • Order #ABC123”)

2. **Real-time tracking area (for active orders)**
   - Map with driver location (Uber Eats, DoorDash, Deliveroo)
   - ETA text (“Arriving in 14–19 min”)
   - Status timeline or stepper (see section 3)

3. **Order content**
   - List of items with quantities, options/modifiers, and individual prices
   - Subtotal, delivery fee, service fee, tax, tip, and total line
   - Payment method summary (“Paid with Visa •••• 1234”)

4. **Actions & support**
   - Contextual buttons (e.g., “Contact driver”, “Contact support”, “Reorder”, “Report issue”)
   - For active orders: more emphasis on *tracking & contacting*
   - For completed orders: more emphasis on *reorder & rating/feedback*

5. **Meta information**
   - Delivery address
   - Instructions to rider/restaurant
   - Invoice / receipt download (PDF) in some regions

---

## 3. Status Timeline & Real-Time Tracking

For **active orders**, the detail screen is essentially a **tracking dashboard**.

Common components:

- **Status stepper / timeline**
  - Steps typically include:
    - “Order placed”
    - “Restaurant confirmed”
    - “Preparing your order”
    - “Courier on the way to restaurant”
    - “Courier picked up your order”
    - “On the way to you”
    - “Delivered”
  - Active step is highlighted; completed steps are checked / dimmed; future steps are greyed.
  - Text under each step gives more context (“Your order is being prepared”, “Rider is near the restaurant”, etc.).

- **Map integration**
  - Uber Eats and similar apps show a **live map** with:
    - Restaurant pin
    - Customer pin
    - Courier icon moving along the route
    - Polyline route between courier and destination
  - Under the map, they show ETA + a line like “John is delivering your order”.

- **Live ETA + latest arrival time**
  - Typically 2 times:
    - A dynamic **estimated arrival time**.
    - A more conservative **“latest arrival by”** time [5](https://metrobi.com/package-tracker/uber-eats-delivery-tracking/).
  - Messaging shifts if the order is late (“running a bit behind”).

Implication:
- For Tap2Go’s order detail, an **order status timeline** is core UX, even if full map tracking is a later phase.

---

## 4. Key Actions Available on the Order Detail Page

### 4.1 Actions for Active Orders

Typical actions:

- **Contact the delivery driver**
  - Call (masked number) or in-app chat.
  - Usually available once a driver is assigned and has your order.
  - Also includes templated quick messages (“I’m outside”, “Please leave at door”).

- **Contact support**
  - “Help” / “Get help” button.
  - Leads to a structured list of issues: wrong items, missing items, order taking too long, driver not moving, etc.

- **Cancel order (within constraints)**
  - Appears differently depending on stage:
    - Before restaurant accepts: full cancellation allowed.
    - After prep starts: either no cancellation or partial refund.
  - Often hidden behind Help → “I want to cancel my order”.

- **Modify instructions**
  - Some apps allow editing delivery instructions or doorbell notes early in the flow.
  - Changing address mid-flow is heavily restricted or disallowed (risk & fraud).

- **Track driver**
  - The main CTA for active orders is essentially “Track”, but since users are already in the order detail, the focus is on the live map + ETA.

### 4.2 Actions for Completed Orders

Once the order is delivered, the context shifts from **tracking** to **post-order management**:

- **Reorder / Order again**
  - Big primary button: “Reorder” / “Order again”.
  - Some apps allow editing the cart after tapping reorder (add/remove items).

- **Rate & review**
  - Rating the restaurant (usually 1–5 stars).
  - Optional rating of delivery experience separately.
  - Tagging issues: “Food was cold”, “Missing items”, “Late delivery”, etc.

- **Report a problem / Help**
  - Flow for requesting refunds or credits for:
    - Missing items
    - Incorrect items
    - Poor quality
    - Delivery never arrived
  - Guided flows that ask which item was wrong, whether partial or full refund is desired, etc.

- **View receipt / invoice**
  - A full breakdown of charges:
    - Item prices
    - Delivery fee
    - Service fees
    - Tip
    - Tax
  - Sometimes a downloadable invoice/receipt (PDF) for business expenses.

---

## 5. Information Architecture of the Order Detail

### 5.1 Above the fold

What users see immediately when opening the order:

- Restaurant name & logo (very prominent).
- Order status (e.g., “Delivered”, “On the way”, “Preparing”).
- High-level ETA or “Delivered at 7:45 PM”.
- Map or hero status illustration (for active orders).

The goal:
- Answer **“What’s the status of my order?”** within the first 1–2 seconds.

### 5.2 Mid section – order breakdown

Details of what was ordered:

- Ordered items with:
  - Title
  - Quantity
  - Variant / option details (size, flavor, toppings, etc.).
  - Price per item or per line.
- Subtotals and fees.
- Payment method.

This section is important for:
- Verifying that what showed up matches what was ordered.
- Reporting problems (which items were wrong).

### 5.3 Lower section – actions & meta

- CTAs (Reorder, Get Help, Rate).
- Delivery address & instructions.
- Small print: order ID, timestamp, fulfillment method (Delivery vs Pickup).

---

## 6. Subtle UX Details & Patterns

### 6.1 Progressive disclosure of complexity

Big platforms avoid overwhelming users:

- Top of the screen: **simple, human-readable status** and visually clear stepper.
- Below that: **details** such as itemization and fees.
- Even further down: **support flows** or advanced info (receipts, legal text).

### 6.2 Contextual help

“Help” is always **contextual to that order**, not a global help center:

- When you tap “Help” from the order detail, the support screen already knows:
  - Which order
  - Which restaurant
  - Which status (delivered/undelivered)

This allows showing only relevant help options (e.g., “My order is late” vs “Missing items” vs “I was charged twice”).

### 6.3 State-specific UI variations

The same order detail layout will swap different components based on state:

- **Before driver assigned**:
  - No driver avatar / contact options yet.
  - Only show “Preparing your order” and maybe a “Cancel” option.

- **Driver assigned & en route**:
  - Show driver name, vehicle, contact options.
  - Map is prominent.

- **Delivered**:
  - Map shrinks or disappears; replaced by “Delivered” confirmation.
  - Reorder / rate CTAs move to the top of the action section.

---

## 7. Specific Functionalities Customers Commonly Have

Summarizing concrete actions a typical user can perform from the order detail page:

1. **Track the order**
   - See current status (preparing, picked up, on the way, etc.).
   - View ETA and “latest arrival” time.
   - See courier’s live location on a map (for many apps).

2. **Contact stakeholders**
   - Contact the delivery driver (call/chat) when appropriate.
   - Contact support for that specific order.
   - Sometimes contact the restaurant (less common; usually mediated by support).

3. **Manage the order**
   - Cancel under specific conditions (before prep or pickup).
   - Update delivery instructions early in the process.

4. **After delivery**
   - Rate restaurant and/or delivery.
   - Write a review or select issue tags.
   - Report problems with individual items and request refunds/credits.
   - Reorder the same basket quickly.
   - View/download receipt and tax invoice.

5. **General info**
   - Confirm delivery address and instructions used.
   - See which payment method was charged.
   - Check item-level details to compare with what arrived.

---

## 8. Recommendations for Tap2Go’s Order View

Based on these patterns, a **strong first version** of Tap2Go’s order detail (without overbuilding) could:

1. **Top section**
   - Restaurant name, logo, and badge with order status.
   - Timestamp (“Ordered on Jan 23, 7:42 PM”) and short ID.

2. **Status timeline**
   - Simple 4–6 step timeline:
     - Placed → Accepted → Preparing → Ready for pickup → On the way → Delivered / Cancelled.

3. **Order breakdown**
   - Items with quantities, options, and price per line.
   - Subtotal, fees, total.
   - Payment method summary.

4. **Actions**
   - Active:
     - “Track order” (even if initially just a text status with timestamps).
     - “Get help about this order”.
   - Completed:
     - “Order again”.
     - “Rate this order”.

5. **Support**
   - Contextual “Get help” entry point that knows which order the user is asking about.

6. **Later phases**
   - Map-based tracking.
   - In-app chat with rider.
   - Refund flows at item-level granularity.

No code has been modified in this step; this document is purely research to guide future UX and implementation decisions.

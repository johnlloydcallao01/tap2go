GUIDELINES: Before defining schemas or collections in apps/cms, make sure you super deeply analyze first the existing schemas in apps/cms first.
This will help you to avoid any potential conflicts or issues that may arise from defining new schemas or collections. For example, you need to look at the following existing collections or tables or schemas such as: Customers, Merchants, Merchant Products, and more. For example, in the case of Delivery Locations in #3 below, you need to be aware that we derive that snapshot of the delivery location from the Customer table's active_address_id because that is going to be the source for delivery location of a customer "snapshot" that specific time an order was made...Understand very deeply the interconnectedness of current schemas in our apps/cms especially the ones mentioned above before doing an implementation for creating below tables or collections:

#1 BATCH: Core Transaction (MVP)
1. Orders: To store the main transaction details (Customer, Merchant, Total, Fulfillment Type: Delivery or Pickup, Status: Pending, Accepted, Preparing, Ready for Pickup, On Delivery, Delivered, Cancelled).
2. Order Items: To link products to an order (Product, Quantity, Price at time of purchase, Options/Add-ons).
3. Delivery Locations: To save the exact delivery coordinates and address for the specific order (Required for Delivery orders).
4. Transactions/Payments: To record the payment details (Payment Intent ID, Payment Method, Amount, Date).

#2 BATCH:
5. Order Tracking/Status History: To track the timestamp of every status change (e.g., "Order Placed at 10:00", "Kitchen Accepted at 10:05").
6. Rider/Driver Assignments: To assign a driver to an order (Driver ID, Order ID, Status).

#3 BATCH:
7. Discounts/Vouchers: To handle promo codes applied to specific orders.
8. Reviews/Ratings: To allow users to rate the Order, Merchant, and Driver separately.

I’ll have one read-only agent trace the current CMS/mobile payment-to-booking implementation, and another verify the provider/framework guidance. I’ll use those findings to refine the proposal, not edit code.

Delegated task

Delegated task

I’m waiting for the two read-only analyses before finalizing the solution. No files have been changed.

Background agent `Verify provider and framework guidance` is complete

Read agent `Verify provider and framework guidance`
Completed with input: {
  "agent_id": "773d2701-dfd9-4bdc-a015-2d5e45fe1703",
  "since_turn": 0
}

Background agent `Trace order fulfillment code` is complete

Read agent `Trace order fulfillment code`
Completed with input: {
  "agent_id": "5ae6fb0d-28b0-40c5-8b32-623831a5e291",
  "since_turn": 0
}

Read , lines 1 to 220
Completed with input: {
  "path": "C:\\Users\\User\\AppData\\Local\\Temp\\1794122703639-copilot-tool-output-8b48c17184eb47ebb7586da18d0feb27.txt",
  "view_range": [
    1,
    220
  ]
}

Read , lines 42 to 100
Completed with input: {
  "path": "C:\\Users\\User\\AppData\\Local\\Temp\\1794122703639-copilot-tool-output-8b48c17184eb47ebb7586da18d0feb27.txt",
  "view_range": [
    42,
    100
  ]
}

Read , lines 74 to 110
Completed with input: {
  "path": "C:\\Users\\User\\AppData\\Local\\Temp\\1794122703639-copilot-tool-output-8b48c17184eb47ebb7586da18d0feb27.txt",
  "view_range": [
    74,
    110
  ]
}

# Final Solution: Reliable Lalamove Delivery Fulfillment

## What the codebase analysis confirms

There is currently **no single, reliable server-side path from confirmed payment to Lalamove booking**:

- The registered `/checkout/prepare` route is an inline implementation in `payload.config.ts`. A separate, more defensive `checkoutPrepareHandler` exists but is not wired to that route. The mobile app uses the inline route’s contract.
- The active mobile checkout creates a PayMongo intent, prepares the order, then attaches the payment method in `CheckoutScreen.tsx`. The PayMongo webhook updates payment/order state in `paymongoWebhook.ts`, but does **not** book delivery.
- Delivery booking is initiated by the mobile return/finalization flow in `checkoutReturn.ts`. That helper can return early if cart lookup fails, and it swallows booking errors after logging them. So closing the app or hitting a failed request can leave a paid order unbooked.
- `/delivery/book` calls Lalamove **before** creating the local booking record in `deliveryBook.ts`. Concurrent calls or a database failure after Lalamove accepts the request can therefore create an external booking that the CMS cannot safely identify. The unique order relationship in `DeliveryBookings.ts` protects local rows, not Lalamove requests.
- The webhook’s signature check is skipped when its secret is absent. Paid events are not deduplicated or reconciled against PayMongo’s current intent status and amount. The Lalamove webhook also needs authentication, replay/deduplication, and handling for events that arrive before the local booking exists.
- Job tables and a notification task exist, but the inspected configuration does not show a delivery-fulfillment task or a running fulfillment worker. **Enqueueing alone would not ensure execution.**
- Booking obtains a fresh Lalamove quote after payment and may update the order total. That can make the recorded order total differ from the amount charged; the intended handling of a changed delivery price needs to be explicit.

These are confirmed code risks, but they do not prove which specific failure caused the earlier missing booking. **No code has been changed.**

---

## 1. Objective and guarantee

Ensure every delivery order with a verified successful payment has a **durable, visible, recoverable fulfillment record** until Lalamove accepts the delivery or a person explicitly resolves the case.

The system cannot guarantee Lalamove availability or acceptance, and cannot promise automatic recovery if Lalamove accepts a request but provides no recoverable order identifier. It can ensure those cases are not silently lost.

**Payment confirmation means fulfillment is durably scheduled. It does not mean Lalamove has accepted the delivery.**

## 2. Establish one authoritative checkout and payment path

1. Choose one `/checkout/prepare` implementation. Wire the intended handler and update the mobile client to its request/response contract, or deliberately harden the inline implementation. Remove or clearly retire the duplicate so code and tests cannot exercise a different path than production.
2. Make the server authoritative for customer, cart, address, price, and payment-intent/order association. Do not accept client-supplied totals as the source of truth.
3. Ensure a payment intent is created with an idempotency strategy tied to the checkout attempt. Persist its ID and expected amount/currency with the order/payment attempt. Handle failures between intent creation and order persistence without creating orphaned or duplicate payment attempts.
4. Replace any privileged CMS API key embedded in the mobile app with customer-scoped authentication and narrowly authorized endpoints.

## 3. Confirm payment securely and persist fulfillment durably

For each PayMongo `payment.paid` event:

1. Require a configured webhook secret; **fail closed** if absent. Verify the raw-body signature, the applicable live/test signature, timestamp freshness, and replay protections.
2. Retrieve the Payment Intent server-side and confirm that it succeeded and matches the expected order, amount, and currency before marking the order paid. Do not treat the app redirect as payment proof.
3. Record the provider event using a unique event identifier where available, and make the payment transition idempotent and monotonic. Duplicate or out-of-order events must not undo a successful payment or repeat fulfillment.
4. In one database transaction, persist the paid state and a unique durable fulfillment/outbox record for delivery orders. A unique constraint should ensure only one fulfillment intent exists per order.
5. Acknowledge PayMongo with the documented successful response **only after the durable record commits**. Keep the webhook path short; do Lalamove work asynchronously.
6. If the durable write fails, return a failure so PayMongo can retry. Separately reconcile missed or exhausted webhook deliveries by retrieving the Payment Intent and repairing local state.

A transactional outbox is the clearest way to make the payment-state update and fulfillment intent atomic. Do not assume Payload job queueing is atomic with those writes unless that behavior is verified for the deployed configuration.

## 4. Run fulfillment in a durable, monitored worker

- Create a delivery-fulfillment worker that consumes pending outbox records and retries safe failures with backoff.
- Configure and operate the production worker or scheduler explicitly. Payload documents that jobs require a runner; database job tables alone do not run them.
- Make the worker safe to restart, and expose failed, delayed, and stalled work for monitoring and recovery.
- Keep the mobile return flow for status display and polling only. It must not be required to initiate fulfillment.

## 5. Make Lalamove booking safe under retries and concurrency

Maintain a local booking/attempt record **before** calling Lalamove. Use an atomic claim or lease to prevent concurrent workers for the same order. Do not hold a database transaction open during the network call.

Suggested states:

- `PENDING`: waiting for an attempt
- `SUBMITTING`: a worker has claimed the attempt
- `BOOKED`: Lalamove order ID and response are persisted
- `FAILED_RETRYABLE`: a definite, retryable rejection/failure
- `FAILED_FINAL`: invalid data or another condition requiring correction
- `UNKNOWN`: request outcome is ambiguous
- `RECONCILIATION_REQUIRED`: do not resubmit until investigated

Record attempt IDs, timestamps, responses/errors, and the Lalamove `Request-ID` for support diagnostics.

**Do not treat Lalamove `Request-ID` as an idempotency key.** The checked Lalamove documentation describes it as a unique request identifier useful for troubleshooting; it does not establish that replaying a request with the same value prevents a duplicate order.

For an ambiguous timeout or crash after submission, do not blindly create another delivery. Reconcile first. If no Lalamove order ID is available and the provider cannot locate the accepted request through documented mechanisms, stop automatic retries and alert staff for Partner Portal/support investigation.

Require an authorized server-side caller and a verified paid delivery order before booking. A “booking already exists” response should be treated as success only after confirming the existing booking’s state and provider ID.

## 6. Keep payment, order, and delivery lifecycles separate

Payment remains `PAID` after successful payment, regardless of delivery status. Delivery booking has its own lifecycle and error handling. A delivery failure must never reset a paid order to pending payment.

Do not silently rewrite the charged order total after payment. Store the amount charged separately from the actual delivery cost and define a policy for quote changes before launch—for example, an approved cost-absorption limit and manual review above it. Do not automatically charge a customer more than they authorized.

## 7. Reconcile and operate the system

Run an independent periodic reconciliation that:

1. Finds paid delivery orders with no fulfillment intent or booking and creates/repairs the durable local work record.
2. Finds stale `SUBMITTING`, `UNKNOWN`, or `RECONCILIATION_REQUIRED` attempts and prevents unsafe resubmission.
3. Retrieves Lalamove order details when a valid provider order ID is known.
4. Processes Lalamove webhook updates only after authenticating and deduplicating them; safely handle out-of-order events and events that arrive before the booking record.
5. Repairs local records when provider acceptance can be confirmed.
6. Alerts staff when a booking cannot be reconciled automatically and records who resolved it and how.

Track the internal order ID, payment and delivery states, provider order ID, attempt history, last error, reconciliation result, and whether manual action is needed. Alert on paid delivery orders that remain unbooked beyond a defined service threshold.

## 8. Required tests before production

Test the current-path and failure cases, including:

- Customer closes the app or never returns after payment.
- Cart cleanup fails without blocking delivery fulfillment.
- PayMongo webhook has a missing/invalid/stale signature, is duplicated, or arrives out of order.
- PayMongo event is missed; reconciliation finds a succeeded Payment Intent and repairs fulfillment.
- Intent amount/currency does not match the saved order.
- Worker restarts, crashes, retries, or has no active runner.
- Two workers attempt the same order concurrently.
- Lalamove definitively rejects a request versus accepting it while the response times out.
- Local persistence fails after Lalamove accepts an order.
- Lalamove webhook is invalid, duplicated, delayed, out of order, or arrives before the local booking exists.
- A known Lalamove order is recovered; an unknown ambiguous order is escalated rather than resubmitted.
- The Lalamove quote changes after payment and the configured price policy is followed.
- Invalid delivery information is recorded for correction without changing the paid state.

## 9. Acceptance criteria

The solution is ready only when:

- A verified paid delivery order and its durable fulfillment intent are committed atomically.
- App activity is not required to start fulfillment.
- Repeated payment events and concurrent workers cannot create duplicate **local** fulfillment work.
- Ambiguous external booking outcomes are not blindly retried.
- Delivery failures never invalidate payment.
- Failed work remains traceable, retryable when safe, and visible to staff.
- Reconciliation detects missing bookings and unresolved attempts.
- The actual production worker and reconciliation schedule are running and monitored.
- Quote changes cannot silently change what the customer has already paid or authorized.

## Documentation references

- PayMongo [Payment Acceptance quick start](https://docs.paymongo.com/docs/payment-acceptance-quick-start.md), [best practices](https://docs.paymongo.com/docs/payment-acceptance-best-practices.md), [troubleshooting](https://docs.paymongo.com/docs/payment-acceptance-troubleshooting.md), and [Webhook resource](https://docs.paymongo.com/reference/webhook-resource).
- Payload [Jobs Queue overview](https://payloadcms.com/docs/v3/jobs-queue/overview.md), [queues](https://payloadcms.com/docs/v3/jobs-queue/queues.md), [tasks](https://payloadcms.com/docs/v3/jobs-queue/tasks.md), and [database transactions](https://payloadcms.com/docs/v3/database/transactions.md).
- Lalamove [API documentation](https://developers.lalamove.com/), including Place Order, Order Details, authentication headers, and webhooks.
- AWS [Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

This finalizes the architecture recommendation only; **no code was edited**.
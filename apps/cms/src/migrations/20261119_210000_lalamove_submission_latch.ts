import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE delivery_fulfillment_outbox
      ADD COLUMN IF NOT EXISTS submission_started_at timestamptz;

    INSERT INTO delivery_fulfillment_outbox (
      order_id,
      status,
      lalamove_order_id,
      manual_intervention_required,
      reconciliation_note,
      submission_started_at
    )
    SELECT DISTINCT ON (o.id)
      o.id,
      CASE
        WHEN COALESCE(b.lalamove_order_id, o.lalamove_order_id) IS NOT NULL
          THEN 'booked'::enum_delivery_fulfillment_outbox_status
        ELSE 'reconciliation_required'::enum_delivery_fulfillment_outbox_status
      END,
      COALESCE(b.lalamove_order_id, o.lalamove_order_id),
      COALESCE(b.lalamove_order_id, o.lalamove_order_id) IS NULL,
      CASE
        WHEN COALESCE(b.lalamove_order_id, o.lalamove_order_id) IS NULL
          THEN 'Legacy Lalamove booking record found without an order ID. Verify with Lalamove before any new booking.'
        ELSE NULL
      END,
      COALESCE(b.created_at, o.updated_at, o.created_at, now())
    FROM orders o
    JOIN transactions t ON t.order_id = o.id
    LEFT JOIN delivery_bookings b ON b.order_id = o.id
    LEFT JOIN delivery_fulfillment_outbox existing ON existing.order_id = o.id
    WHERE o.fulfillment_type = 'delivery'
      AND t.status = 'paid'
      AND COALESCE(t.transaction_type, 'order') <> 'priority_fee'
      AND existing.id IS NULL
      AND (b.id IS NOT NULL OR o.lalamove_order_id IS NOT NULL)
    ORDER BY o.id, b.created_at DESC NULLS LAST, t.created_at DESC
    ON CONFLICT (order_id) DO NOTHING;

    UPDATE delivery_fulfillment_outbox o
    SET
      submission_started_at = COALESCE(o.last_attempt_at, o.updated_at, o.created_at, now()),
      lalamove_order_id = COALESCE(
        o.lalamove_order_id,
        (
          SELECT b.lalamove_order_id
          FROM delivery_bookings b
          WHERE b.order_id = o.order_id
          ORDER BY b.created_at DESC
          LIMIT 1
        )
      ),
      status = CASE
        WHEN o.status = 'pending'
          AND COALESCE(
            o.lalamove_order_id,
            (
              SELECT b.lalamove_order_id
              FROM delivery_bookings b
              WHERE b.order_id = o.order_id
              ORDER BY b.created_at DESC
              LIMIT 1
            )
          ) IS NOT NULL
          THEN 'booked'::enum_delivery_fulfillment_outbox_status
        WHEN o.status IN ('pending', 'retryable', 'submitting')
          THEN 'reconciliation_required'::enum_delivery_fulfillment_outbox_status
        ELSE o.status
      END,
      manual_intervention_required = CASE
        WHEN o.status IN ('pending', 'retryable', 'submitting')
          AND COALESCE(
            o.lalamove_order_id,
            (
              SELECT b.lalamove_order_id
              FROM delivery_bookings b
              WHERE b.order_id = o.order_id
              ORDER BY b.created_at DESC
              LIMIT 1
            )
          ) IS NULL
          THEN true
        ELSE o.manual_intervention_required
      END,
      manual_alerted_at = CASE
        WHEN o.status IN ('pending', 'retryable', 'submitting')
          AND COALESCE(
            o.lalamove_order_id,
            (
              SELECT b.lalamove_order_id
              FROM delivery_bookings b
              WHERE b.order_id = o.order_id
              ORDER BY b.created_at DESC
              LIMIT 1
            )
          ) IS NULL
          THEN NULL
        ELSE o.manual_alerted_at
      END,
      reconciliation_note = CASE
        WHEN o.status IN ('pending', 'retryable', 'submitting')
          AND COALESCE(
            o.lalamove_order_id,
            (
              SELECT b.lalamove_order_id
              FROM delivery_bookings b
              WHERE b.order_id = o.order_id
              ORDER BY b.created_at DESC
              LIMIT 1
            )
          ) IS NULL
          THEN 'Legacy outbox state may have reached Place Order. Verify with Lalamove before any new booking attempt.'
        ELSE o.reconciliation_note
      END,
      updated_at = now()
    WHERE o.submission_started_at IS NULL
      AND (
        o.status <> 'pending'
        OR o.attempt_count > 0
        OR o.lalamove_order_id IS NOT NULL
        OR EXISTS (
          SELECT 1
          FROM delivery_bookings b
          WHERE b.order_id = o.order_id
        )
        OR EXISTS (
          SELECT 1
          FROM delivery_fulfillment_attempts a
          WHERE a.outbox_id = o.id
        )
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE delivery_fulfillment_outbox
      DROP COLUMN IF EXISTS submission_started_at;
  `)
}

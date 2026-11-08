import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const duplicateEvents = await db.execute(sql`
    WITH ranked_events AS (
      SELECT
        id,
        row_number() OVER (
          PARTITION BY idempotency_key
          ORDER BY created_at, id
        ) AS duplicate_number
      FROM notification_events
      WHERE idempotency_key IS NOT NULL
    )
    UPDATE notification_events AS event
    SET idempotency_key = NULL
    FROM ranked_events
    WHERE event.id = ranked_events.id
      AND ranked_events.duplicate_number > 1
    RETURNING event.id
  `)

  if (duplicateEvents.rows.length > 0) {
    payload.logger.warn({
      msg: 'Cleared duplicate notification idempotency keys while preserving event records.',
      count: duplicateEvents.rows.length,
    })
  }

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idempotencyKey_idx"
      ON notification_events (idempotency_key);

    CREATE UNIQUE INDEX IF NOT EXISTS customer_checkout_idempotency_key_idx
      ON orders (customer_id, checkout_idempotency_key);

    CREATE UNIQUE INDEX IF NOT EXISTS transactions_one_active_priority_fee_per_order_idx
      ON transactions (order_id)
      WHERE transaction_type = 'priority_fee'
        AND (
          status = 'pending'
          OR (
            status = 'paid'
            AND priority_fee_fulfillment_status IN ('pending', 'applying')
          )
        );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS transactions_one_active_priority_fee_per_order_idx;
    DROP INDEX IF EXISTS customer_checkout_idempotency_key_idx;
    DROP INDEX IF EXISTS "idempotencyKey_idx";
  `)
}

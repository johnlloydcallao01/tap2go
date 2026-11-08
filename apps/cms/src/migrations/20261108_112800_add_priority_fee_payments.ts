import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS transaction_type varchar DEFAULT 'order',
      ADD COLUMN IF NOT EXISTS priority_fee_total numeric,
      ADD COLUMN IF NOT EXISTS priority_fee_fulfillment_status varchar DEFAULT 'not_applicable',
      ADD COLUMN IF NOT EXISTS payment_id varchar,
      ADD COLUMN IF NOT EXISTS refund_id varchar;
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
    ALTER TABLE transactions
      DROP COLUMN IF EXISTS refund_id,
      DROP COLUMN IF EXISTS payment_id,
      DROP COLUMN IF EXISTS priority_fee_fulfillment_status,
      DROP COLUMN IF EXISTS priority_fee_total,
      DROP COLUMN IF EXISTS transaction_type;
  `)
}

import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "transactions"
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_attempt_count" numeric DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_next_check_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_last_checked_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_last_status" varchar,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_last_error" varchar,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_alerted_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "paymongo_reconcile_stopped" boolean DEFAULT false NOT NULL;

    CREATE INDEX IF NOT EXISTS "transactions_status_paymongo_reconcile_next_check_at_idx"
      ON "transactions" USING btree (
        "status",
        "paymongo_reconcile_next_check_at"
      );
    CREATE INDEX IF NOT EXISTS "transactions_payment_intent_id_idx"
      ON "transactions" USING btree ("payment_intent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "transactions_status_paymongo_reconcile_next_check_at_idx";
    DROP INDEX "transactions_payment_intent_id_idx";
    ALTER TABLE "transactions"
      DROP COLUMN "paymongo_reconcile_attempt_count",
      DROP COLUMN "paymongo_reconcile_next_check_at",
      DROP COLUMN "paymongo_reconcile_last_checked_at",
      DROP COLUMN "paymongo_reconcile_last_status",
      DROP COLUMN "paymongo_reconcile_last_error",
      DROP COLUMN "paymongo_reconcile_alerted_at",
      DROP COLUMN "paymongo_reconcile_stopped";
  `)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`
    SELECT
      to_regclass('public.delivery_fulfillment_outbox') IS NOT NULL
      AND to_regclass('public.delivery_fulfillment_attempts') IS NOT NULL
      AND to_regclass('public.payload_jobs_stats') IS NOT NULL
      AND to_regtype('public.enum_products_approval_status') IS NOT NULL
      AND to_regtype('public.enum_delivery_fulfillment_outbox_status') IS NOT NULL
      AND to_regtype('public.enum_delivery_fulfillment_attempts_status') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'approval_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'transactions'
          AND column_name = 'priority_fee_fulfillment_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'delivery_bookings'
          AND column_name = 'last_reconciliation_error'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payload_jobs'
          AND column_name = 'meta'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payload_locked_documents_rels'
          AND column_name = 'delivery_fulfillment_attempts_id'
      )
      AND EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_payload_jobs_task_slug'
          AND e.enumlabel = 'delivery-fulfillment'
      ) AS schema_already_present
  `)

  if (rows[0]?.schema_already_present) return

  await db.execute(sql`
   CREATE TYPE "public"."enum_products_approval_status" AS ENUM('pending', 'approved', 'disapproved');
  CREATE TYPE "public"."enum_delivery_fulfillment_outbox_status" AS ENUM('pending', 'submitting', 'booked', 'retryable', 'unknown', 'reconciliation_required', 'failed');
  CREATE TYPE "public"."enum_delivery_fulfillment_attempts_status" AS ENUM('started', 'booked', 'retryable', 'unknown', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'delivery-fulfillment' BEFORE 'notification-fanout';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'delivery-fulfillment' BEFORE 'notification-fanout';
  CREATE TABLE "delivery_fulfillment_outbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"status" "enum_delivery_fulfillment_outbox_status" DEFAULT 'pending' NOT NULL,
  	"attempt_count" numeric DEFAULT 0 NOT NULL,
  	"next_attempt_at" timestamp(3) with time zone,
  	"lease_expires_at" timestamp(3) with time zone,
  	"last_attempt_at" timestamp(3) with time zone,
  	"lalamove_order_id" varchar,
  	"last_request_id" varchar,
  	"last_error" varchar,
  	"manual_intervention_required" boolean DEFAULT false,
  	"manual_alerted_at" timestamp(3) with time zone,
  	"reconciliation_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "delivery_fulfillment_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"outbox_id" integer NOT NULL,
  	"attempt_number" numeric NOT NULL,
  	"status" "enum_delivery_fulfillment_attempts_status" DEFAULT 'started' NOT NULL,
  	"request_id" varchar NOT NULL,
  	"lalamove_order_id" varchar,
  	"http_status" numeric,
  	"error" varchar,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DROP INDEX "idempotencyKey_idx";
  DROP INDEX "customer_checkout_idempotency_key_idx";
  ALTER TABLE "products" ADD COLUMN "approval_status" "enum_products_approval_status" DEFAULT 'pending' NOT NULL;
  ALTER TABLE "transactions" ADD COLUMN "payment_id" varchar;
  ALTER TABLE "transactions" ADD COLUMN "refund_id" varchar;
  ALTER TABLE "transactions" ADD COLUMN "transaction_type" varchar DEFAULT 'order';
  ALTER TABLE "transactions" ADD COLUMN "priority_fee_total" numeric;
  ALTER TABLE "transactions" ADD COLUMN "priority_fee_fulfillment_status" varchar DEFAULT 'not_applicable';
  ALTER TABLE "delivery_bookings" ADD COLUMN "last_reconciled_at" timestamp(3) with time zone;
  ALTER TABLE "delivery_bookings" ADD COLUMN "last_reconciliation_error" varchar;
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "delivery_fulfillment_outbox_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "delivery_fulfillment_attempts_id" integer;
  ALTER TABLE "delivery_fulfillment_outbox" ADD CONSTRAINT "delivery_fulfillment_outbox_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "delivery_fulfillment_attempts" ADD CONSTRAINT "delivery_fulfillment_attempts_outbox_id_delivery_fulfillment_outbox_id_fk" FOREIGN KEY ("outbox_id") REFERENCES "public"."delivery_fulfillment_outbox"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "delivery_fulfillment_outbox_order_idx" ON "delivery_fulfillment_outbox" USING btree ("order_id");
  CREATE INDEX "delivery_fulfillment_outbox_updated_at_idx" ON "delivery_fulfillment_outbox" USING btree ("updated_at");
  CREATE INDEX "delivery_fulfillment_outbox_created_at_idx" ON "delivery_fulfillment_outbox" USING btree ("created_at");
  CREATE INDEX "status_next_attempt_at_idx" ON "delivery_fulfillment_outbox" USING btree ("status","next_attempt_at");
  CREATE INDEX "status_lease_expires_at_idx" ON "delivery_fulfillment_outbox" USING btree ("status","lease_expires_at");
  CREATE INDEX "lalamove_order_id_idx" ON "delivery_fulfillment_outbox" USING btree ("lalamove_order_id");
  CREATE INDEX "status_manual_intervention_required_idx" ON "delivery_fulfillment_outbox" USING btree ("status","manual_intervention_required");
  CREATE INDEX "manual_alerted_at_idx" ON "delivery_fulfillment_outbox" USING btree ("manual_alerted_at");
  CREATE INDEX "delivery_fulfillment_attempts_outbox_idx" ON "delivery_fulfillment_attempts" USING btree ("outbox_id");
  CREATE INDEX "delivery_fulfillment_attempts_updated_at_idx" ON "delivery_fulfillment_attempts" USING btree ("updated_at");
  CREATE INDEX "delivery_fulfillment_attempts_created_at_idx" ON "delivery_fulfillment_attempts" USING btree ("created_at");
  CREATE INDEX "outbox_attempt_number_idx" ON "delivery_fulfillment_attempts" USING btree ("outbox_id","attempt_number");
  CREATE UNIQUE INDEX "request_id_idx" ON "delivery_fulfillment_attempts" USING btree ("request_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_fulfillment_outbox_fk" FOREIGN KEY ("delivery_fulfillment_outbox_id") REFERENCES "public"."delivery_fulfillment_outbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_fulfillment_attempts_fk" FOREIGN KEY ("delivery_fulfillment_attempts_id") REFERENCES "public"."delivery_fulfillment_attempts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "status_last_reconciled_at_idx" ON "delivery_bookings" USING btree ("status","last_reconciled_at");
  CREATE INDEX "payload_locked_documents_rels_delivery_fulfillment_outbox_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_fulfillment_outbox_id");
  CREATE INDEX "payload_locked_documents_rels_delivery_fulfillment_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_fulfillment_attempts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "delivery_fulfillment_outbox" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "delivery_fulfillment_attempts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "delivery_fulfillment_outbox" CASCADE;
  DROP TABLE "delivery_fulfillment_attempts" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_delivery_fulfillment_outbox_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_delivery_fulfillment_attempts_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'notification-fanout');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'notification-fanout');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "status_last_reconciled_at_idx";
  DROP INDEX "payload_locked_documents_rels_delivery_fulfillment_outbox_id_idx";
  DROP INDEX "payload_locked_documents_rels_delivery_fulfillment_attempts_id_idx";
  CREATE UNIQUE INDEX "idempotencyKey_idx" ON "notification_events" USING btree ("idempotency_key");
  CREATE UNIQUE INDEX "customer_checkout_idempotency_key_idx" ON "orders" USING btree ("customer_id","checkout_idempotency_key");
  ALTER TABLE "products" DROP COLUMN "approval_status";
  ALTER TABLE "transactions" DROP COLUMN "payment_id";
  ALTER TABLE "transactions" DROP COLUMN "refund_id";
  ALTER TABLE "transactions" DROP COLUMN "transaction_type";
  ALTER TABLE "transactions" DROP COLUMN "priority_fee_total";
  ALTER TABLE "transactions" DROP COLUMN "priority_fee_fulfillment_status";
  ALTER TABLE "delivery_bookings" DROP COLUMN "last_reconciled_at";
  ALTER TABLE "delivery_bookings" DROP COLUMN "last_reconciliation_error";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "delivery_fulfillment_outbox_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "delivery_fulfillment_attempts_id";
  DROP TYPE "public"."enum_products_approval_status";
  DROP TYPE "public"."enum_delivery_fulfillment_outbox_status";
  DROP TYPE "public"."enum_delivery_fulfillment_attempts_status";`)
}

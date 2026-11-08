import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`
    SELECT
      to_regclass('public.payload_jobs') IS NOT NULL
      AND to_regclass('public.payload_jobs_log') IS NOT NULL
      AND to_regtype('public.enum_payload_jobs_task_slug') IS NOT NULL
      AND to_regtype('public.enum_payload_jobs_log_task_slug') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'checkout_idempotency_key'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notification_events'
          AND column_name = 'idempotency_key'
      ) AS schema_already_present
  `)

  if (rows[0]?.schema_already_present) return

  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'notification-fanout');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'notification-fanout');
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "status_createdAt_idx";
  DROP INDEX "merchant_createdAt_idx";
  DROP INDEX "fulfillment_type_idx";
  DROP INDEX "delivery_status_idx";
  DROP INDEX "placed_at_idx";
  DROP INDEX "status_paid_at_idx";
  DROP INDEX "status_createdAt_1_idx";
  DROP INDEX "payment_method_idx";
  ALTER TABLE "notification_events" ADD COLUMN "idempotency_key" varchar;
  ALTER TABLE "orders" ADD COLUMN "checkout_idempotency_key" varchar;
  ALTER TABLE "orders" ADD COLUMN "checkout_address_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "checkout_context_hash" varchar;
  ALTER TABLE "order_items" ADD COLUMN "checkout_cart_item_id" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_jobs_id" integer;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "idempotencyKey_idx" ON "notification_events" USING btree ("idempotency_key");
  CREATE UNIQUE INDEX "customer_checkout_idempotency_key_idx" ON "orders" USING btree ("customer_id","checkout_idempotency_key");
  CREATE INDEX "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk";
  
  DROP INDEX "idempotencyKey_idx";
  DROP INDEX "customer_checkout_idempotency_key_idx";
  DROP INDEX "payload_locked_documents_rels_payload_jobs_id_idx";
  CREATE INDEX "status_createdAt_idx" ON "orders" USING btree ("status","created_at");
  CREATE INDEX "merchant_createdAt_idx" ON "orders" USING btree ("merchant_id","created_at");
  CREATE INDEX "fulfillment_type_idx" ON "orders" USING btree ("fulfillment_type");
  CREATE INDEX "delivery_status_idx" ON "orders" USING btree ("delivery_status");
  CREATE INDEX "placed_at_idx" ON "orders" USING btree ("placed_at");
  CREATE INDEX "status_paid_at_idx" ON "transactions" USING btree ("status","paid_at");
  CREATE INDEX "status_createdAt_1_idx" ON "transactions" USING btree ("status","created_at");
  CREATE INDEX "payment_method_idx" ON "transactions" USING btree ("payment_method");
  ALTER TABLE "notification_events" DROP COLUMN "idempotency_key";
  ALTER TABLE "orders" DROP COLUMN "checkout_idempotency_key";
  ALTER TABLE "orders" DROP COLUMN "checkout_address_id";
  ALTER TABLE "orders" DROP COLUMN "checkout_context_hash";
  ALTER TABLE "order_items" DROP COLUMN "checkout_cart_item_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_jobs_id";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_wallet_topups_status" AS ENUM('pending', 'paid', 'failed');
  CREATE TYPE "public"."enum_wallet_ledger_entries_entry_type" AS ENUM('topup', 'order_payment', 'refund', 'adjustment');
  CREATE TYPE "public"."enum_wallet_ledger_entries_source_type" AS ENUM('wallet_topup', 'order', 'refund', 'admin_adjustment');
  CREATE TABLE "customer_wallets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_id" integer NOT NULL,
  	"balance_minor" numeric DEFAULT 0 NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wallet_topups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_id" integer NOT NULL,
  	"wallet_id" integer NOT NULL,
  	"amount_minor" numeric NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"status" "enum_wallet_topups_status" DEFAULT 'pending' NOT NULL,
  	"idempotency_key" varchar NOT NULL,
  	"payment_intent_id" varchar,
  	"payment_id" varchar,
  	"payment_method" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wallet_ledger_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"wallet_id" integer NOT NULL,
  	"entry_type" "enum_wallet_ledger_entries_entry_type" NOT NULL,
  	"amount_minor" numeric NOT NULL,
  	"currency" varchar DEFAULT 'PHP' NOT NULL,
  	"source_type" "enum_wallet_ledger_entries_source_type" NOT NULL,
  	"source_id" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customer_wallets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "wallet_topups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "wallet_ledger_entries_id" integer;
  ALTER TABLE "customer_wallets" ADD CONSTRAINT "customer_wallets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallet_topups" ADD CONSTRAINT "wallet_topups_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallet_topups" ADD CONSTRAINT "wallet_topups_wallet_id_customer_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."customer_wallets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_wallet_id_customer_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."customer_wallets"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "customer_wallets_customer_idx" ON "customer_wallets" USING btree ("customer_id");
  CREATE INDEX "customer_wallets_updated_at_idx" ON "customer_wallets" USING btree ("updated_at");
  CREATE INDEX "customer_wallets_created_at_idx" ON "customer_wallets" USING btree ("created_at");
  CREATE INDEX "wallet_topups_customer_idx" ON "wallet_topups" USING btree ("customer_id");
  CREATE INDEX "wallet_topups_wallet_idx" ON "wallet_topups" USING btree ("wallet_id");
  CREATE UNIQUE INDEX "wallet_topups_idempotency_key_idx" ON "wallet_topups" USING btree ("idempotency_key");
  CREATE UNIQUE INDEX "wallet_topups_payment_intent_id_idx" ON "wallet_topups" USING btree ("payment_intent_id");
  CREATE INDEX "wallet_topups_updated_at_idx" ON "wallet_topups" USING btree ("updated_at");
  CREATE INDEX "wallet_topups_created_at_idx" ON "wallet_topups" USING btree ("created_at");
  CREATE INDEX "customer_createdAt_idx" ON "wallet_topups" USING btree ("customer_id","created_at");
  CREATE INDEX "status_createdAt_idx" ON "wallet_topups" USING btree ("status","created_at");
  CREATE INDEX "wallet_ledger_entries_wallet_idx" ON "wallet_ledger_entries" USING btree ("wallet_id");
  CREATE INDEX "wallet_ledger_entries_updated_at_idx" ON "wallet_ledger_entries" USING btree ("updated_at");
  CREATE INDEX "wallet_ledger_entries_created_at_idx" ON "wallet_ledger_entries" USING btree ("created_at");
  CREATE INDEX "wallet_createdAt_idx" ON "wallet_ledger_entries" USING btree ("wallet_id","created_at");
  CREATE UNIQUE INDEX "source_type_source_id_idx" ON "wallet_ledger_entries" USING btree ("source_type","source_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_wallets_fk" FOREIGN KEY ("customer_wallets_id") REFERENCES "public"."customer_wallets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wallet_topups_fk" FOREIGN KEY ("wallet_topups_id") REFERENCES "public"."wallet_topups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wallet_ledger_entries_fk" FOREIGN KEY ("wallet_ledger_entries_id") REFERENCES "public"."wallet_ledger_entries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_customer_wallets_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_wallets_id");
  CREATE INDEX "payload_locked_documents_rels_wallet_topups_id_idx" ON "payload_locked_documents_rels" USING btree ("wallet_topups_id");
  CREATE INDEX "payload_locked_documents_rels_wallet_ledger_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("wallet_ledger_entries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customer_wallets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wallet_topups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wallet_ledger_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customer_wallets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_wallet_topups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_wallet_ledger_entries_fk";
  
  DROP TABLE "wallet_topups";
  DROP TABLE "wallet_ledger_entries";
  DROP TABLE "customer_wallets";
  DROP INDEX "payload_locked_documents_rels_customer_wallets_id_idx";
  DROP INDEX "payload_locked_documents_rels_wallet_topups_id_idx";
  DROP INDEX "payload_locked_documents_rels_wallet_ledger_entries_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customer_wallets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "wallet_topups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "wallet_ledger_entries_id";
  DROP TYPE "public"."enum_wallet_topups_status";
  DROP TYPE "public"."enum_wallet_ledger_entries_entry_type";
  DROP TYPE "public"."enum_wallet_ledger_entries_source_type";`)
}

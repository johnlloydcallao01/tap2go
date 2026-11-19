import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "delivery_location_history" (
      "id" serial PRIMARY KEY NOT NULL,
      "order_id" integer NOT NULL,
      "driver_id" varchar NOT NULL,
      "latitude" numeric NOT NULL,
      "longitude" numeric NOT NULL,
      "provider_updated_at" varchar,
      "observed_at" timestamp(3) with time zone NOT NULL,
      "dedupe_key" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "delivery_location_history_id" integer;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'delivery_location_history_order_id_orders_id_fk'
          AND conrelid = 'delivery_location_history'::regclass
      ) THEN
        ALTER TABLE "delivery_location_history"
          ADD CONSTRAINT "delivery_location_history_order_id_orders_id_fk"
          FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_delivery_location_history_fk'
          AND conrelid = 'payload_locked_documents_rels'::regclass
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_delivery_location_history_fk"
          FOREIGN KEY ("delivery_location_history_id")
          REFERENCES "public"."delivery_location_history"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "delivery_location_history_order_idx"
      ON "delivery_location_history" USING btree ("order_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "delivery_location_history_dedupe_key_idx"
      ON "delivery_location_history" USING btree ("dedupe_key");
    CREATE INDEX IF NOT EXISTS "delivery_location_history_updated_at_idx"
      ON "delivery_location_history" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "delivery_location_history_created_at_idx"
      ON "delivery_location_history" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "order_driver_id_observed_at_idx"
      ON "delivery_location_history" USING btree ("order_id", "driver_id", "observed_at");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_delivery_location_history_id_idx"
      ON "payload_locked_documents_rels" USING btree ("delivery_location_history_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_delivery_location_history_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_delivery_location_history_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN "delivery_location_history_id";
    DROP TABLE "delivery_location_history";
  `)
}

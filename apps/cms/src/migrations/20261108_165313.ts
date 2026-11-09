import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const existingSchema = await db.execute(sql`
    SELECT
      to_regclass('public.app_ratings') IS NOT NULL
      AND to_regclass('public.app_rating_history') IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM pg_index
        WHERE indexrelid = to_regclass('public.app_ratings_customer_idx')
          AND indisunique
      )
      AND EXISTS (
        SELECT 1
        FROM pg_index
        WHERE indexrelid = to_regclass('public.app_rating_history_original_rating_id_idx')
          AND indisunique
      )
      AND NOT EXISTS (
        SELECT 1
        FROM (VALUES
          ('app_ratings', 'customer_id'),
          ('app_rating_history', 'original_rating_id'),
          ('app_rating_history', 'original_created_at'),
          ('app_rating_history', 'original_updated_at')
        ) AS required_columns(table_name, column_name)
        WHERE NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND information_schema.columns.table_name = required_columns.table_name
            AND information_schema.columns.column_name = required_columns.column_name
        )
      ) AS already_migrated
  `)

  if (existingSchema.rows[0]?.already_migrated) {
    payload.logger.info({
      msg: 'App rating schema is already at the migrated state; skipping the data migration and reconciling its ledger entry.',
    })
    return
  }

  await db.execute(sql`
   CREATE TABLE "app_rating_history" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"original_rating_id" numeric NOT NULL,
  	"order_id" integer NOT NULL,
  	"customer_id" integer NOT NULL,
  	"rating" numeric NOT NULL,
  	"comment" varchar,
  	"original_created_at" timestamp(3) with time zone NOT NULL,
  	"original_updated_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "app_rating_history_id" integer;
  ALTER TABLE "app_rating_history" ADD CONSTRAINT "app_rating_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "app_rating_history" ADD CONSTRAINT "app_rating_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "app_rating_history_original_rating_id_idx" ON "app_rating_history" USING btree ("original_rating_id");
  CREATE INDEX "app_rating_history_order_idx" ON "app_rating_history" USING btree ("order_id");
  CREATE INDEX "app_rating_history_customer_idx" ON "app_rating_history" USING btree ("customer_id");
  CREATE INDEX "app_rating_history_updated_at_idx" ON "app_rating_history" USING btree ("updated_at");
  CREATE INDEX "app_rating_history_created_at_idx" ON "app_rating_history" USING btree ("created_at");
  CREATE INDEX "customer_original_created_at_idx" ON "app_rating_history" USING btree ("customer_id","original_created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_rating_history_fk" FOREIGN KEY ("app_rating_history_id") REFERENCES "public"."app_rating_history"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_app_rating_history_id_idx" ON "payload_locked_documents_rels" USING btree ("app_rating_history_id");`)

  await db.execute(sql`
  INSERT INTO "app_rating_history" (
    "original_rating_id",
    "order_id",
    "customer_id",
    "rating",
    "comment",
    "original_created_at",
    "original_updated_at"
  )
  SELECT
    "id",
    "order_id",
    "customer_id",
    "rating",
    "comment",
    "created_at",
    "updated_at"
  FROM "app_ratings";

  WITH ranked AS (
    SELECT
      "id",
      "customer_id",
      FIRST_VALUE("order_id") OVER (
        PARTITION BY "customer_id"
        ORDER BY "created_at" ASC, "id" ASC
      ) AS "first_order_id",
      ROW_NUMBER() OVER (
        PARTITION BY "customer_id"
        ORDER BY "created_at" DESC, "id" DESC
      ) AS "current_rank"
    FROM "app_ratings"
  )
  UPDATE "app_ratings" AS current_rating
  SET "order_id" = ranked."first_order_id"
  FROM ranked
  WHERE current_rating."id" = ranked."id"
    AND ranked."current_rank" = 1;

  WITH ranked AS (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "customer_id"
        ORDER BY "created_at" DESC, "id" DESC
      ) AS "current_rank"
    FROM "app_ratings"
  )
  DELETE FROM "app_ratings" AS duplicate_rating
  USING ranked
  WHERE duplicate_rating."id" = ranked."id"
    AND ranked."current_rank" > 1;`)

  await db.execute(sql`
  DROP INDEX "app_ratings_order_idx";
  DROP INDEX "app_ratings_customer_idx";
  CREATE INDEX "app_ratings_order_idx" ON "app_ratings" USING btree ("order_id");
  CREATE UNIQUE INDEX "app_ratings_customer_idx" ON "app_ratings" USING btree ("customer_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX "app_ratings_customer_idx";
  DROP INDEX "app_ratings_order_idx";

  UPDATE "app_ratings" AS current_rating
  SET "order_id" = history."order_id"
  FROM "app_rating_history" AS history
  WHERE history."original_rating_id" = current_rating."id";

  INSERT INTO "app_ratings" (
    "id",
    "order_id",
    "customer_id",
    "rating",
    "comment",
    "created_at",
    "updated_at"
  )
  SELECT
    history."original_rating_id",
    history."order_id",
    history."customer_id",
    history."rating",
    history."comment",
    history."original_created_at",
    history."original_updated_at"
  FROM "app_rating_history" AS history
  WHERE NOT EXISTS (
    SELECT 1
    FROM "app_ratings" AS current_rating
    WHERE current_rating."id" = history."original_rating_id"
  );
  
  CREATE UNIQUE INDEX "app_ratings_order_idx" ON "app_ratings" USING btree ("order_id");
  CREATE INDEX "app_ratings_customer_idx" ON "app_ratings" USING btree ("customer_id");
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_app_rating_history_fk";
  DROP INDEX "payload_locked_documents_rels_app_rating_history_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "app_rating_history_id";`)

  await db.execute(sql`
  ALTER TABLE "app_rating_history" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "app_rating_history" CASCADE;`)
}

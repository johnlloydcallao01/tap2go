import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "app_ratings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_id" integer NOT NULL,
  	"customer_id" integer NOT NULL,
  	"rating" numeric NOT NULL,
  	"comment" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "app_ratings_id" integer;
  ALTER TABLE "app_ratings" ADD CONSTRAINT "app_ratings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "app_ratings" ADD CONSTRAINT "app_ratings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "app_ratings" ADD CONSTRAINT "app_ratings_rating_range_chk" CHECK ("rating" >= 1 AND "rating" <= 5 AND "rating" = trunc("rating"));
  CREATE UNIQUE INDEX "app_ratings_order_idx" ON "app_ratings" USING btree ("order_id");
  CREATE INDEX "app_ratings_customer_idx" ON "app_ratings" USING btree ("customer_id");
  CREATE INDEX "app_ratings_updated_at_idx" ON "app_ratings" USING btree ("updated_at");
  CREATE INDEX "app_ratings_created_at_idx" ON "app_ratings" USING btree ("created_at");
  CREATE INDEX "rating_createdAt_idx" ON "app_ratings" USING btree ("rating","created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_ratings_fk" FOREIGN KEY ("app_ratings_id") REFERENCES "public"."app_ratings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_app_ratings_id_idx" ON "payload_locked_documents_rels" USING btree ("app_ratings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_app_ratings_fk";
   DROP INDEX "payload_locked_documents_rels_app_ratings_id_idx";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "app_ratings_id";
   DROP TABLE "app_ratings";`)
}

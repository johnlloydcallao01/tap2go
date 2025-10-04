import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_addresses_address_type" AS ENUM('home', 'work', 'billing', 'shipping', 'pickup', 'delivery');
  CREATE TABLE "addresses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"formatted_address" varchar NOT NULL,
  	"google_place_id" varchar,
  	"street_number" varchar,
  	"route" varchar,
  	"subpremise" varchar,
  	"barangay" varchar,
  	"locality" varchar,
  	"administrative_area_level_2" varchar,
  	"administrative_area_level_1" varchar,
  	"country" varchar DEFAULT 'Philippines',
  	"postal_code" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"address_type" "enum_addresses_address_type" DEFAULT 'home' NOT NULL,
  	"is_default" boolean DEFAULT false,
  	"is_verified" boolean DEFAULT false,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "addresses_id" integer;
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");
  CREATE INDEX "addresses_updated_at_idx" ON "addresses" USING btree ("updated_at");
  CREATE INDEX "addresses_created_at_idx" ON "addresses" USING btree ("created_at");
  CREATE INDEX "user_idx" ON "addresses" USING btree ("user_id");
  CREATE INDEX "latitude_longitude_idx" ON "addresses" USING btree ("latitude","longitude");
  CREATE INDEX "locality_administrative_area_level_1_idx" ON "addresses" USING btree ("locality","administrative_area_level_1");
  CREATE INDEX "postal_code_idx" ON "addresses" USING btree ("postal_code");
  CREATE INDEX "google_place_id_idx" ON "addresses" USING btree ("google_place_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_addresses_fk" FOREIGN KEY ("addresses_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_addresses_id_idx" ON "payload_locked_documents_rels" USING btree ("addresses_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "addresses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "addresses" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_addresses_fk";
  
  DROP INDEX "payload_locked_documents_rels_addresses_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "addresses_id";
  DROP TYPE "public"."enum_addresses_address_type";`)
}

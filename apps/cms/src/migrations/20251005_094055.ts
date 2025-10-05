import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" DROP COLUMN "address_street_address";
  ALTER TABLE "merchants" DROP COLUMN "address_barangay";
  ALTER TABLE "merchants" DROP COLUMN "address_city";
  ALTER TABLE "merchants" DROP COLUMN "address_province";
  ALTER TABLE "merchants" DROP COLUMN "address_postal_code";
  ALTER TABLE "merchants" DROP COLUMN "address_country";
  ALTER TABLE "merchants" DROP COLUMN "location_latitude";
  ALTER TABLE "merchants" DROP COLUMN "location_longitude";
  ALTER TABLE "merchants" DROP COLUMN "location_delivery_radius_km";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "address_street_address" varchar NOT NULL;
  ALTER TABLE "merchants" ADD COLUMN "address_barangay" varchar;
  ALTER TABLE "merchants" ADD COLUMN "address_city" varchar NOT NULL;
  ALTER TABLE "merchants" ADD COLUMN "address_province" varchar NOT NULL;
  ALTER TABLE "merchants" ADD COLUMN "address_postal_code" varchar;
  ALTER TABLE "merchants" ADD COLUMN "address_country" varchar DEFAULT 'Philippines';
  ALTER TABLE "merchants" ADD COLUMN "location_latitude" numeric NOT NULL;
  ALTER TABLE "merchants" ADD COLUMN "location_longitude" numeric NOT NULL;
  ALTER TABLE "merchants" ADD COLUMN "location_delivery_radius_km" numeric DEFAULT 5;`)
}

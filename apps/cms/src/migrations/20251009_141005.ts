import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "merchant_latitude_merchant_longitude_idx";
  DROP INDEX "is_location_verified_idx";
  ALTER TABLE "merchants" DROP COLUMN "merchant_coordinates";
  ALTER TABLE "merchants" DROP COLUMN "merchant_latitude";
  ALTER TABLE "merchants" DROP COLUMN "merchant_longitude";
  ALTER TABLE "merchants" DROP COLUMN "is_location_verified";
  ALTER TABLE "merchants" DROP COLUMN "last_location_sync";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "merchant_coordinates" jsonb;
  ALTER TABLE "merchants" ADD COLUMN "merchant_latitude" numeric;
  ALTER TABLE "merchants" ADD COLUMN "merchant_longitude" numeric;
  ALTER TABLE "merchants" ADD COLUMN "is_location_verified" boolean DEFAULT false;
  ALTER TABLE "merchants" ADD COLUMN "last_location_sync" timestamp(3) with time zone;
  CREATE INDEX "merchant_latitude_merchant_longitude_idx" ON "merchants" USING btree ("merchant_latitude","merchant_longitude");
  CREATE INDEX "is_location_verified_idx" ON "merchants" USING btree ("is_location_verified");`)
}

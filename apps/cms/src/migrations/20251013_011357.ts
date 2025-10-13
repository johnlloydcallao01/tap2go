import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ALTER COLUMN "merchant_coordinates" SET DATA TYPE geometry(point, 4326);
  ALTER TABLE "merchants" ALTER COLUMN "service_area_geometry" SET DATA TYPE geometry(polygon, 4326);
  ALTER TABLE "merchants" ALTER COLUMN "priority_zones_geometry" SET DATA TYPE geometry(multipolygon, 4326);
  ALTER TABLE "merchants" ALTER COLUMN "restricted_areas_geometry" SET DATA TYPE geometry(multipolygon, 4326);
  ALTER TABLE "merchants" ALTER COLUMN "delivery_zones_geometry" SET DATA TYPE geometry(multipolygon, 4326);`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ALTER COLUMN "merchant_coordinates" SET DATA TYPE jsonb;
  ALTER TABLE "merchants" ALTER COLUMN "service_area_geometry" SET DATA TYPE jsonb;
  ALTER TABLE "merchants" ALTER COLUMN "priority_zones_geometry" SET DATA TYPE jsonb;
  ALTER TABLE "merchants" ALTER COLUMN "restricted_areas_geometry" SET DATA TYPE jsonb;
  ALTER TABLE "merchants" ALTER COLUMN "delivery_zones_geometry" SET DATA TYPE jsonb;`)
}

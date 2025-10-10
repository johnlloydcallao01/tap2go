import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req: _req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Drop the existing PostGIS geometry column
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "service_area";
  `)

  await payload.db.drizzle.execute(sql`
    -- Add the new jsonb column
    ALTER TABLE "merchants" ADD COLUMN "service_area" jsonb;
  `)
}

export async function down({ payload, req: _req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Drop the jsonb column
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "service_area";
  `)

  await payload.db.drizzle.execute(sql`
    -- Recreate the PostGIS geometry column
    ALTER TABLE "merchants" ADD COLUMN "service_area" geometry(POLYGON, 4326);
  `)
}
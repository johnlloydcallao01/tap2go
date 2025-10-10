import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Since there are no existing address_boundary records, we can simply drop and recreate the column
  // Drop the old geometry column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    DROP COLUMN IF EXISTS "address_boundary";
  `)

  // Create the new jsonb column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    ADD COLUMN "address_boundary" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop the jsonb column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    DROP COLUMN IF EXISTS "address_boundary";
  `)

  // Recreate the geometry column
  await db.execute(sql`
    ALTER TABLE "addresses" 
    ADD COLUMN "address_boundary" geometry;
  `)
}
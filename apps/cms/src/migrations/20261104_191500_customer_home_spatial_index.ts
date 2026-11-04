import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS merchants_customer_home_location_gist_idx
    ON merchants
    USING gist (
      ST_Transform(
        ST_SetSRID(ST_MakePoint(merchant_longitude, merchant_latitude), 4326),
        3857
      )
    )
    WHERE merchant_longitude IS NOT NULL AND merchant_latitude IS NOT NULL
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS merchants_customer_home_location_gist_idx`)
}

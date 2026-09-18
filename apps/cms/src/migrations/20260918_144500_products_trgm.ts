import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Trigram search indexes for product catalog lookup.
 * The products list searches name/slug/sku/shortDescription via Payload
 * `contains` (ILIKE %...%) and merchant-products matches products the same
 * way — both sequential scans without trigram support. Vendors/merchants
 * names were covered in 20260918_143000. See docs/performance.md §16 item 4.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_slug_trgm ON products USING gin (slug gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON products USING gin (sku gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_short_description_trgm ON products USING gin (short_description gin_trgm_ops)`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS idx_products_name_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_products_slug_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_products_sku_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_products_short_description_trgm`)
}

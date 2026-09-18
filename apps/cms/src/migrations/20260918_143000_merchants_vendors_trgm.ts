import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Trigram search indexes for merchant/vendor name lookup.
 * The merchants list resolves vendor businessName matches via
 * `ILIKE %...%` (bounded 200) and Payload `contains` filters compile to
 * `ILIKE %...%` — both sequential scans without trigram support.
 * See docs/performance.md §15 item 4.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_merchants_outlet_name_trgm ON merchants USING gin (outlet_name gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_merchants_outlet_code_trgm ON merchants USING gin (outlet_code gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vendors_business_name_trgm ON vendors USING gin (business_name gin_trgm_ops)`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vendors_legal_name_trgm ON vendors USING gin (legal_name gin_trgm_ops)`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS idx_merchants_outlet_name_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_merchants_outlet_code_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_vendors_business_name_trgm`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_vendors_legal_name_trgm`)
}

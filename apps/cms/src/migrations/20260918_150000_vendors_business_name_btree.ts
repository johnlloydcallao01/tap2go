import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Btree index serving the merchant-products `/products` fast path.
 * Filtered loads run `SELECT DISTINCT v.id ... ORDER BY v.business_name
 * LIMIT/OFFSET` over matched vendors; the trigram GINs cover ILIKE only, so
 * the distinct + sort had no index support (spilled sort-unique). A btree on
 * business_name lets Postgres serve the ORDER BY directly. See performance.md §17.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vendors_business_name_btree ON vendors (business_name)`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS idx_vendors_business_name_btree`)
}
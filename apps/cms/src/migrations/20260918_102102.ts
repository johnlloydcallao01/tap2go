import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "productType_idx" ON "products" USING btree ("product_type");
  CREATE INDEX "isActive_4_idx" ON "products" USING btree ("is_active");
  CREATE INDEX "catalogVisibility_idx" ON "products" USING btree ("catalog_visibility");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "productType_idx";
  DROP INDEX "isActive_4_idx";
  DROP INDEX "catalogVisibility_idx";`)
}

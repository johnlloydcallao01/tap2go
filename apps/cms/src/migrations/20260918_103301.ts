import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "placed_at_idx" ON "orders" USING btree ("placed_at");
  CREATE INDEX "order_timestamp_idx" ON "order_tracking" USING btree ("order_id","timestamp");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "placed_at_idx";
  DROP INDEX "order_timestamp_idx";`)
}

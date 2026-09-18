import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "isActive_operationalStatus_createdAt_idx" ON "merchants" USING btree ("is_active","operational_status","created_at");
  CREATE INDEX "outletName_idx" ON "merchants" USING btree ("outlet_name");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "isActive_operationalStatus_createdAt_idx";
  DROP INDEX "outletName_idx";`)
}

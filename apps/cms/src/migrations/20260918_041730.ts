import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "isActive_1_idx";
  CREATE INDEX "role_idx" ON "users" USING btree ("role");
  CREATE INDEX "isActive_1_idx" ON "merchants" USING btree ("is_active");
  CREATE INDEX "isActive_2_idx" ON "drivers" USING btree ("is_active");
  CREATE INDEX "status_createdAt_idx" ON "orders" USING btree ("status","created_at");
  CREATE INDEX "merchant_createdAt_idx" ON "orders" USING btree ("merchant_id","created_at");
  CREATE INDEX "status_paid_at_idx" ON "transactions" USING btree ("status","paid_at");
  CREATE INDEX "status_createdAt_1_idx" ON "transactions" USING btree ("status","created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "role_idx";
  DROP INDEX "isActive_1_idx";
  DROP INDEX "isActive_2_idx";
  DROP INDEX "status_createdAt_idx";
  DROP INDEX "merchant_createdAt_idx";
  DROP INDEX "status_paid_at_idx";
  DROP INDEX "status_createdAt_1_idx";
  CREATE INDEX "isActive_1_idx" ON "drivers" USING btree ("is_active");`)
}

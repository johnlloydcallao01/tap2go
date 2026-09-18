import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "isActive_1_idx";
  DROP INDEX "isActive_2_idx";
  CREATE INDEX "businessType_idx" ON "vendors" USING btree ("business_type");
  CREATE INDEX "verificationStatus_idx" ON "vendors" USING btree ("verification_status");
  CREATE INDEX "isActive_1_idx" ON "vendors" USING btree ("is_active");
  CREATE INDEX "isActive_2_idx" ON "merchants" USING btree ("is_active");
  CREATE INDEX "isActive_3_idx" ON "drivers" USING btree ("is_active");
  CREATE INDEX "fulfillment_type_idx" ON "orders" USING btree ("fulfillment_type");
  CREATE INDEX "delivery_status_idx" ON "orders" USING btree ("delivery_status");
  CREATE INDEX "payment_method_idx" ON "transactions" USING btree ("payment_method");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "businessType_idx";
  DROP INDEX "verificationStatus_idx";
  DROP INDEX "isActive_1_idx";
  DROP INDEX "isActive_2_idx";
  DROP INDEX "isActive_3_idx";
  DROP INDEX "fulfillment_type_idx";
  DROP INDEX "delivery_status_idx";
  DROP INDEX "payment_method_idx";
  CREATE INDEX "isActive_1_idx" ON "merchants" USING btree ("is_active");
  CREATE INDEX "isActive_2_idx" ON "drivers" USING btree ("is_active");`)
}

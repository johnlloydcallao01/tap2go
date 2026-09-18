import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "isActive_idx";
  DROP INDEX "isActive_1_idx";
  DROP INDEX "isActive_2_idx";
  DROP INDEX "isActive_3_idx";
  DROP INDEX "isActive_4_idx";
  CREATE INDEX "isActive_idx" ON "users" USING btree ("is_active");
  CREATE INDEX "currentLevel_idx" ON "customers" USING btree ("current_level");
  CREATE INDEX "relationship_idx" ON "emergency_contacts" USING btree ("relationship");
  CREATE INDEX "isPrimary_idx" ON "emergency_contacts" USING btree ("is_primary");
  CREATE INDEX "address_type_idx" ON "addresses" USING btree ("address_type");
  CREATE INDEX "is_default_idx" ON "addresses" USING btree ("is_default");
  CREATE INDEX "isActive_1_idx" ON "business_zones" USING btree ("is_active");
  CREATE INDEX "isActive_2_idx" ON "vendors" USING btree ("is_active");
  CREATE INDEX "isActive_3_idx" ON "merchants" USING btree ("is_active");
  CREATE INDEX "isActive_4_idx" ON "drivers" USING btree ("is_active");
  CREATE INDEX "isActive_5_idx" ON "products" USING btree ("is_active");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "isActive_idx";
  DROP INDEX "currentLevel_idx";
  DROP INDEX "relationship_idx";
  DROP INDEX "isPrimary_idx";
  DROP INDEX "address_type_idx";
  DROP INDEX "is_default_idx";
  DROP INDEX "isActive_1_idx";
  DROP INDEX "isActive_2_idx";
  DROP INDEX "isActive_3_idx";
  DROP INDEX "isActive_4_idx";
  DROP INDEX "isActive_5_idx";
  CREATE INDEX "isActive_idx" ON "business_zones" USING btree ("is_active");
  CREATE INDEX "isActive_1_idx" ON "vendors" USING btree ("is_active");
  CREATE INDEX "isActive_2_idx" ON "merchants" USING btree ("is_active");
  CREATE INDEX "isActive_3_idx" ON "drivers" USING btree ("is_active");
  CREATE INDEX "isActive_4_idx" ON "products" USING btree ("is_active");`)
}

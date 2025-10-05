import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "merchants" DROP COLUMN "compliance_business_permit_number";
  ALTER TABLE "merchants" DROP COLUMN "compliance_food_safety_license";
  ALTER TABLE "merchants" DROP COLUMN "compliance_fire_permit_number";
  ALTER TABLE "merchants" DROP COLUMN "compliance_sanitary_permit_number";
  ALTER TABLE "merchants" DROP COLUMN "compliance_last_inspection_date";
  ALTER TABLE "merchants" DROP COLUMN "compliance_inspection_score";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "merchants" ADD COLUMN "compliance_business_permit_number" varchar;
  ALTER TABLE "merchants" ADD COLUMN "compliance_food_safety_license" varchar;
  ALTER TABLE "merchants" ADD COLUMN "compliance_fire_permit_number" varchar;
  ALTER TABLE "merchants" ADD COLUMN "compliance_sanitary_permit_number" varchar;
  ALTER TABLE "merchants" ADD COLUMN "compliance_last_inspection_date" timestamp(3) with time zone;
  ALTER TABLE "merchants" ADD COLUMN "compliance_inspection_score" numeric;`)
}

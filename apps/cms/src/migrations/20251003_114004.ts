import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vendors" DROP COLUMN "compliance_settings_food_safety_license";
  ALTER TABLE "vendors" DROP COLUMN "compliance_settings_halaal_certified";
  ALTER TABLE "vendors" DROP COLUMN "compliance_settings_organic_certified";
  ALTER TABLE "vendors" DROP COLUMN "compliance_settings_allergen_compliance";
  ALTER TABLE "vendors" DROP COLUMN "platform_settings_commission_rate";
  ALTER TABLE "vendors" DROP COLUMN "platform_settings_minimum_order_amount";
  ALTER TABLE "vendors" DROP COLUMN "platform_settings_delivery_fee";`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vendors" ADD COLUMN "compliance_settings_food_safety_license" varchar;
  ALTER TABLE "vendors" ADD COLUMN "compliance_settings_halaal_certified" boolean DEFAULT false;
  ALTER TABLE "vendors" ADD COLUMN "compliance_settings_organic_certified" boolean DEFAULT false;
  ALTER TABLE "vendors" ADD COLUMN "compliance_settings_allergen_compliance" boolean DEFAULT false;
  ALTER TABLE "vendors" ADD COLUMN "platform_settings_commission_rate" numeric DEFAULT 15;
  ALTER TABLE "vendors" ADD COLUMN "platform_settings_minimum_order_amount" numeric DEFAULT 0;
  ALTER TABLE "vendors" ADD COLUMN "platform_settings_delivery_fee" numeric DEFAULT 0;`)
}

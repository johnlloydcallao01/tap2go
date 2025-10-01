import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" DROP COLUMN "features_has_parking";
  ALTER TABLE "merchants" DROP COLUMN "features_has_dine_in";
  ALTER TABLE "merchants" DROP COLUMN "features_has_takeout";
  ALTER TABLE "merchants" DROP COLUMN "features_has_delivery";
  ALTER TABLE "merchants" DROP COLUMN "features_accepts_cash";
  ALTER TABLE "merchants" DROP COLUMN "features_accepts_cards";
  ALTER TABLE "merchants" DROP COLUMN "features_accepts_digital_payments";
  ALTER TABLE "merchants" DROP COLUMN "features_has_wifi";
  ALTER TABLE "merchants" DROP COLUMN "features_is_accessible";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "features_has_parking" boolean DEFAULT false;
  ALTER TABLE "merchants" ADD COLUMN "features_has_dine_in" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_has_takeout" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_has_delivery" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_accepts_cash" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_accepts_cards" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_accepts_digital_payments" boolean DEFAULT true;
  ALTER TABLE "merchants" ADD COLUMN "features_has_wifi" boolean DEFAULT false;
  ALTER TABLE "merchants" ADD COLUMN "features_is_accessible" boolean DEFAULT false;`)
}

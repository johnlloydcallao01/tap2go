import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" DROP COLUMN "metrics_average_rating";
  ALTER TABLE "merchants" DROP COLUMN "metrics_total_reviews";
  ALTER TABLE "merchants" DROP COLUMN "metrics_total_orders";
  ALTER TABLE "merchants" DROP COLUMN "metrics_average_preparation_time_minutes";
  ALTER TABLE "merchants" DROP COLUMN "metrics_order_acceptance_rate";
  ALTER TABLE "merchants" DROP COLUMN "metrics_on_time_delivery_rate";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "metrics_average_rating" numeric DEFAULT 0;
  ALTER TABLE "merchants" ADD COLUMN "metrics_total_reviews" numeric DEFAULT 0;
  ALTER TABLE "merchants" ADD COLUMN "metrics_total_orders" numeric DEFAULT 0;
  ALTER TABLE "merchants" ADD COLUMN "metrics_average_preparation_time_minutes" numeric DEFAULT 20;
  ALTER TABLE "merchants" ADD COLUMN "metrics_order_acceptance_rate" numeric DEFAULT 100;
  ALTER TABLE "merchants" ADD COLUMN "metrics_on_time_delivery_rate" numeric DEFAULT 100;`)
}

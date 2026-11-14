import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cart_items" ADD COLUMN "grouped_product_id" integer;
    ALTER TABLE "cart_items" ADD COLUMN "grouped_product_name" varchar;
    ALTER TABLE "delivery_bookings" ADD COLUMN "rider_remarks" varchar(1500);
    ALTER TABLE "delivery_fulfillment_outbox" ADD COLUMN "rider_remarks" varchar(1500);

    ALTER TABLE "cart_items"
      ADD CONSTRAINT "cart_items_grouped_product_id_products_id_fk"
      FOREIGN KEY ("grouped_product_id") REFERENCES "public"."products"("id")
      ON DELETE set null ON UPDATE no action;
    CREATE INDEX "cart_items_grouped_product_idx"
      ON "cart_items" USING btree ("grouped_product_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "cart_items_grouped_product_idx";
    ALTER TABLE "cart_items"
      DROP CONSTRAINT "cart_items_grouped_product_id_products_id_fk";
    ALTER TABLE "cart_items" DROP COLUMN "grouped_product_id";
    ALTER TABLE "cart_items" DROP COLUMN "grouped_product_name";
    ALTER TABLE "delivery_bookings" DROP COLUMN "rider_remarks";
    ALTER TABLE "delivery_fulfillment_outbox" DROP COLUMN "rider_remarks";
  `)
}

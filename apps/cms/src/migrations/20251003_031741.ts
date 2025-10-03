import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_pricing_price_history" CASCADE;
  DROP TABLE "products_nutrition_vitamins" CASCADE;
  DROP TABLE "products_media_additional_images" CASCADE;
  DROP TABLE "products_seo_keywords" CASCADE;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_pricing_price_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric NOT NULL,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "products_nutrition_vitamins" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"vitamin" varchar,
  	"amount" varchar,
  	"daily_value_percentage" numeric
  );
  
  CREATE TABLE "products_media_additional_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"is_main_image" boolean DEFAULT false
  );
  
  CREATE TABLE "products_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  ALTER TABLE "products_pricing_price_history" ADD CONSTRAINT "products_pricing_price_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_nutrition_vitamins" ADD CONSTRAINT "products_nutrition_vitamins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_media_additional_images" ADD CONSTRAINT "products_media_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_media_additional_images" ADD CONSTRAINT "products_media_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_seo_keywords" ADD CONSTRAINT "products_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_pricing_price_history_order_idx" ON "products_pricing_price_history" USING btree ("_order");
  CREATE INDEX "products_pricing_price_history_parent_id_idx" ON "products_pricing_price_history" USING btree ("_parent_id");
  CREATE INDEX "products_nutrition_vitamins_order_idx" ON "products_nutrition_vitamins" USING btree ("_order");
  CREATE INDEX "products_nutrition_vitamins_parent_id_idx" ON "products_nutrition_vitamins" USING btree ("_parent_id");
  CREATE INDEX "products_media_additional_images_order_idx" ON "products_media_additional_images" USING btree ("_order");
  CREATE INDEX "products_media_additional_images_parent_id_idx" ON "products_media_additional_images" USING btree ("_parent_id");
  CREATE INDEX "products_media_additional_images_image_idx" ON "products_media_additional_images" USING btree ("image_id");
  CREATE INDEX "products_seo_keywords_order_idx" ON "products_seo_keywords" USING btree ("_order");
  CREATE INDEX "products_seo_keywords_parent_id_idx" ON "products_seo_keywords" USING btree ("_parent_id");`)
}

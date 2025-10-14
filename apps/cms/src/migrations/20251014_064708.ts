import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Drop products table and related constraints/indexes if they exist
   ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
   DROP TABLE IF EXISTS "products" CASCADE;
   
   -- Drop constraint only if it exists
   DO $$ 
   BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'payload_locked_documents_rels_products_fk') THEN
       ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
     END IF;
   END $$;
   
   -- Drop index only if it exists
   DROP INDEX IF EXISTS "payload_locked_documents_rels_products_id_idx";
   
   -- Drop column only if it exists
   DO $$
   BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'products_id') THEN
       ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
     END IF;
   END $$;
   
   -- Drop types only if they exist
   DROP TYPE IF EXISTS "public"."enum_products_dietary_spice_level";
   DROP TYPE IF EXISTS "public"."enum_products_preparation_cooking_method";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_dietary_spice_level" AS ENUM('none', 'mild', 'medium', 'hot', 'extra_hot');
  CREATE TYPE "public"."enum_products_preparation_cooking_method" AS ENUM('grilled', 'fried', 'baked', 'steamed', 'boiled', 'raw', 'no_cooking', 'other');
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"merchant_id" integer NOT NULL,
  	"primary_category_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"short_description" varchar,
  	"pricing_base_price" numeric NOT NULL,
  	"pricing_discounted_price" numeric,
  	"pricing_cost_price" numeric,
  	"identification_sku" varchar,
  	"identification_barcode" varchar,
  	"identification_product_code" varchar,
  	"physical_attributes_weight_grams" numeric,
  	"physical_attributes_dimensions_length" numeric,
  	"physical_attributes_dimensions_width" numeric,
  	"physical_attributes_dimensions_height" numeric,
  	"physical_attributes_volume" numeric,
  	"physical_attributes_serving_size" varchar,
  	"nutrition_calories" numeric,
  	"nutrition_macronutrients_protein" numeric,
  	"nutrition_macronutrients_carbohydrates" numeric,
  	"nutrition_macronutrients_fat" numeric,
  	"nutrition_macronutrients_fiber" numeric,
  	"nutrition_macronutrients_sugar" numeric,
  	"nutrition_macronutrients_sodium" numeric,
  	"dietary_is_vegetarian" boolean DEFAULT false,
  	"dietary_is_vegan" boolean DEFAULT false,
  	"dietary_is_gluten_free" boolean DEFAULT false,
  	"dietary_is_halal" boolean DEFAULT false,
  	"dietary_is_kosher" boolean DEFAULT false,
  	"dietary_is_organic" boolean DEFAULT false,
  	"dietary_is_dairy_free" boolean DEFAULT false,
  	"dietary_is_nut_free" boolean DEFAULT false,
  	"dietary_spice_level" "enum_products_dietary_spice_level" DEFAULT 'none',
  	"dietary_allergens" jsonb,
  	"dietary_ingredients" jsonb,
  	"availability_is_available" boolean DEFAULT true,
  	"availability_stock_quantity" numeric,
  	"availability_low_stock_threshold" numeric DEFAULT 5,
  	"availability_max_order_quantity" numeric,
  	"availability_available_hours" jsonb,
  	"availability_seasonal_availability" jsonb,
  	"preparation_preparation_time_minutes" numeric DEFAULT 15,
  	"preparation_cooking_method" "enum_products_preparation_cooking_method",
  	"preparation_special_instructions" varchar,
  	"preparation_requires_special_equipment" boolean DEFAULT false,
  	"media_primary_image_id" integer,
  	"media_video_id" integer,
  	"status_is_featured" boolean DEFAULT false,
  	"status_is_new_item" boolean DEFAULT false,
  	"status_is_popular" boolean DEFAULT false,
  	"status_is_recommended" boolean DEFAULT false,
  	"status_display_order" numeric DEFAULT 0,
  	"metrics_average_rating" numeric DEFAULT 0,
  	"metrics_total_reviews" numeric DEFAULT 0,
  	"metrics_total_orders" numeric DEFAULT 0,
  	"metrics_view_count" numeric DEFAULT 0,
  	"metrics_popularity_score" numeric DEFAULT 0,
  	"metrics_reorder_rate" numeric DEFAULT 0,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"tags" jsonb,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_prod_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."prod_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_media_primary_image_id_media_id_fk" FOREIGN KEY ("media_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_media_video_id_media_id_fk" FOREIGN KEY ("media_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_merchant_idx" ON "products" USING btree ("merchant_id");
  CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE UNIQUE INDEX "products_identification_identification_sku_idx" ON "products" USING btree ("identification_sku");
  CREATE INDEX "products_media_media_primary_image_idx" ON "products" USING btree ("media_primary_image_id");
  CREATE INDEX "products_media_media_video_idx" ON "products" USING btree ("media_video_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");`)
}

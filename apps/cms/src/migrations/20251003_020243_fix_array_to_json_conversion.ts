import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop the only existing array table
    DROP TABLE IF EXISTS "courses_prerequisites" CASCADE;
    
    -- Add JSON columns for all converted array fields
    ALTER TABLE "courses" ADD COLUMN "prerequisites" jsonb;
    ALTER TABLE "vendors" ADD COLUMN "cuisine_types" jsonb;
    ALTER TABLE "merchants" ADD COLUMN "special_hours" jsonb;
    ALTER TABLE "merchants" ADD COLUMN "media_interior_images" jsonb;
    ALTER TABLE "merchants" ADD COLUMN "media_menu_images" jsonb;
    ALTER TABLE "merchants" ADD COLUMN "tags" jsonb;
    ALTER TABLE "prod_categories" ADD COLUMN "styling_gradient_colors" jsonb;
    ALTER TABLE "prod_categories" ADD COLUMN "attributes_dietary_tags" jsonb;
    ALTER TABLE "prod_categories" ADD COLUMN "seo_keywords" jsonb;
    ALTER TABLE "prod_categories" ADD COLUMN "availability_seasonal_availability" jsonb;
    ALTER TABLE "prod_categories" ADD COLUMN "availability_region_restrictions" jsonb;
    ALTER TABLE "products" ADD COLUMN "dietary_allergens" jsonb;
    ALTER TABLE "products" ADD COLUMN "dietary_ingredients" jsonb;
    ALTER TABLE "products" ADD COLUMN "availability_seasonal_availability" jsonb;
    ALTER TABLE "products" ADD COLUMN "tags" jsonb;
    
    -- Drop enum types that are no longer needed (if they exist)
    DROP TYPE IF EXISTS "public"."enum_vendors_cuisine_types_cuisine";
    DROP TYPE IF EXISTS "public"."enum_prod_categories_attributes_dietary_tags_tag";
    DROP TYPE IF EXISTS "public"."enum_prod_categories_availability_seasonal_availability_season";
    DROP TYPE IF EXISTS "public"."enum_products_dietary_allergens_allergen";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove JSON columns
    ALTER TABLE "courses" DROP COLUMN IF EXISTS "prerequisites";
    ALTER TABLE "vendors" DROP COLUMN IF EXISTS "cuisine_types";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "special_hours";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "media_interior_images";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "media_menu_images";
    ALTER TABLE "merchants" DROP COLUMN IF EXISTS "tags";
    ALTER TABLE "prod_categories" DROP COLUMN IF EXISTS "styling_gradient_colors";
    ALTER TABLE "prod_categories" DROP COLUMN IF EXISTS "attributes_dietary_tags";
    ALTER TABLE "prod_categories" DROP COLUMN IF EXISTS "seo_keywords";
    ALTER TABLE "prod_categories" DROP COLUMN IF EXISTS "availability_seasonal_availability";
    ALTER TABLE "prod_categories" DROP COLUMN IF EXISTS "availability_region_restrictions";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "dietary_allergens";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "dietary_ingredients";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "availability_seasonal_availability";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "tags";
    
    -- Recreate enum types
    CREATE TYPE "public"."enum_vendors_cuisine_types_cuisine" AS ENUM('filipino', 'american', 'chinese', 'japanese', 'korean', 'italian', 'mexican', 'thai', 'indian', 'mediterranean', 'seafood', 'bbq', 'desserts', 'healthy', 'vegan', 'other');
    CREATE TYPE "public"."enum_prod_categories_attributes_dietary_tags_tag" AS ENUM('vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'organic', 'low_carb', 'keto', 'dairy_free', 'nut_free', 'spicy', 'healthy');
    CREATE TYPE "public"."enum_prod_categories_availability_seasonal_availability_season" AS ENUM('spring', 'summer', 'fall', 'winter', 'holiday', 'special');
    CREATE TYPE "public"."enum_products_dietary_allergens_allergen" AS ENUM('milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soybeans', 'sesame');
    
    -- Recreate the courses_prerequisites table
    CREATE TABLE "courses_prerequisites" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "prerequisite" varchar
    );
    
    ALTER TABLE "courses_prerequisites" ADD CONSTRAINT "courses_prerequisites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  `)
}

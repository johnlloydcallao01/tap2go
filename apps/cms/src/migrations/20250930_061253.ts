import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_vendors_cuisine_types_cuisine" AS ENUM('filipino', 'american', 'chinese', 'japanese', 'korean', 'italian', 'mexican', 'thai', 'indian', 'mediterranean', 'seafood', 'bbq', 'desserts', 'healthy', 'vegan', 'other');
  CREATE TYPE "public"."enum_vendors_business_type" AS ENUM('restaurant', 'fast_food', 'grocery', 'pharmacy', 'convenience', 'bakery', 'coffee_shop', 'other');
  CREATE TYPE "public"."enum_vendors_verification_status" AS ENUM('pending', 'verified', 'rejected', 'suspended');
  CREATE TYPE "public"."enum_merchants_operational_status" AS ENUM('open', 'closed', 'busy', 'temp_closed', 'maintenance');
  CREATE TYPE "public"."enum_prod_categories_attributes_dietary_tags_tag" AS ENUM('vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'organic', 'low_carb', 'keto', 'dairy_free', 'nut_free', 'spicy', 'healthy');
  CREATE TYPE "public"."enum_prod_categories_availability_seasonal_availability_season" AS ENUM('spring', 'summer', 'fall', 'winter', 'holiday', 'special');
  CREATE TYPE "public"."enum_prod_categories_attributes_category_type" AS ENUM('food', 'beverages', 'desserts', 'snacks', 'groceries', 'pharmacy', 'personal_care', 'household', 'other');
  CREATE TYPE "public"."enum_prod_categories_attributes_age_restriction" AS ENUM('none', '18_plus', '21_plus');
  CREATE TYPE "public"."enum_products_dietary_allergens_allergen" AS ENUM('milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soybeans', 'sesame');
  CREATE TYPE "public"."enum_products_dietary_spice_level" AS ENUM('none', 'mild', 'medium', 'hot', 'extra_hot');
  CREATE TYPE "public"."enum_products_preparation_cooking_method" AS ENUM('grilled', 'fried', 'baked', 'steamed', 'boiled', 'raw', 'no_cooking', 'other');
  CREATE TYPE "public"."enum_prod_variants_availability_available_days_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_prod_variants_variant_type" AS ENUM('single_select', 'multi_select', 'text_input', 'number_input', 'radio', 'checkbox');
  CREATE TYPE "public"."enum_prod_variants_metadata_category" AS ENUM('size', 'addons', 'modifications', 'sides', 'drinks', 'sauces', 'toppings', 'cooking_style', 'temperature', 'other');
  CREATE TYPE "public"."enum_prod_var_options_nutrition_allergen_changes_allergen" AS ENUM('milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soybeans', 'sesame');
  CREATE TYPE "public"."enum_prod_var_options_nutrition_allergen_changes_change" AS ENUM('adds', 'removes');
  CREATE TYPE "public"."enum_prod_var_options_pricing_adjustment_type" AS ENUM('fixed', 'percentage');
  CREATE TYPE "public"."enum_prod_cat_assoc_conditions_customer_segments_segment" AS ENUM('new_customers', 'returning_customers', 'vip_customers', 'premium_members', 'local_customers', 'corporate_customers');
  CREATE TYPE "public"."enum_prod_cat_assoc_association_type" AS ENUM('primary', 'secondary', 'promotional', 'seasonal', 'featured', 'cross_sell', 'upsell');
  CREATE TYPE "public"."enum_prod_cat_assoc_business_rules_priority" AS ENUM('low', 'normal', 'high', 'critical');
  CREATE TABLE "vendors_cuisine_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cuisine" "enum_vendors_cuisine_types_cuisine"
  );
  
  CREATE TABLE "vendors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"business_name" varchar NOT NULL,
  	"legal_name" varchar NOT NULL,
  	"business_registration_number" varchar NOT NULL,
  	"tax_identification_number" varchar,
  	"primary_contact_email" varchar NOT NULL,
  	"primary_contact_phone" varchar NOT NULL,
  	"website_url" varchar,
  	"business_type" "enum_vendors_business_type" NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"verification_status" "enum_vendors_verification_status" DEFAULT 'pending' NOT NULL,
  	"onboarding_date" timestamp(3) with time zone,
  	"average_rating" numeric DEFAULT 0,
  	"total_reviews" numeric DEFAULT 0,
  	"total_orders" numeric DEFAULT 0,
  	"total_merchants" numeric DEFAULT 0,
  	"business_license_id" integer,
  	"tax_certificate_id" integer,
  	"logo_id" integer,
  	"bank_account_name" varchar,
  	"bank_account_number" varchar,
  	"bank_name" varchar,
  	"description" varchar,
  	"operating_hours" jsonb,
  	"social_media_links_facebook" varchar,
  	"social_media_links_instagram" varchar,
  	"social_media_links_twitter" varchar,
  	"social_media_links_website" varchar,
  	"compliance_settings_food_safety_license" varchar,
  	"compliance_settings_halaal_certified" boolean DEFAULT false,
  	"compliance_settings_organic_certified" boolean DEFAULT false,
  	"compliance_settings_allergen_compliance" boolean DEFAULT false,
  	"platform_settings_commission_rate" numeric DEFAULT 15,
  	"platform_settings_minimum_order_amount" numeric DEFAULT 0,
  	"platform_settings_delivery_fee" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "merchants_special_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false,
  	"reason" varchar
  );
  
  CREATE TABLE "merchants_media_interior_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "merchants_media_menu_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "merchants_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "merchants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vendor_id" integer NOT NULL,
  	"outlet_name" varchar NOT NULL,
  	"outlet_code" varchar NOT NULL,
  	"address_street_address" varchar NOT NULL,
  	"address_barangay" varchar,
  	"address_city" varchar NOT NULL,
  	"address_province" varchar NOT NULL,
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'Philippines',
  	"location_latitude" numeric NOT NULL,
  	"location_longitude" numeric NOT NULL,
  	"location_delivery_radius_km" numeric DEFAULT 5,
  	"contact_info_phone" varchar,
  	"contact_info_email" varchar,
  	"contact_info_manager_name" varchar,
  	"contact_info_manager_phone" varchar,
  	"is_active" boolean DEFAULT true,
  	"is_accepting_orders" boolean DEFAULT true,
  	"operational_status" "enum_merchants_operational_status" DEFAULT 'open',
  	"operating_hours" jsonb,
  	"delivery_settings_minimum_order_amount" numeric DEFAULT 0,
  	"delivery_settings_delivery_fee" numeric DEFAULT 0,
  	"delivery_settings_free_delivery_threshold" numeric,
  	"delivery_settings_estimated_delivery_time_minutes" numeric DEFAULT 30,
  	"delivery_settings_max_delivery_time_minutes" numeric DEFAULT 60,
  	"metrics_average_rating" numeric DEFAULT 0,
  	"metrics_total_reviews" numeric DEFAULT 0,
  	"metrics_total_orders" numeric DEFAULT 0,
  	"metrics_average_preparation_time_minutes" numeric DEFAULT 20,
  	"metrics_order_acceptance_rate" numeric DEFAULT 100,
  	"metrics_on_time_delivery_rate" numeric DEFAULT 100,
  	"media_store_front_image_id" integer,
  	"features_has_parking" boolean DEFAULT false,
  	"features_has_dine_in" boolean DEFAULT true,
  	"features_has_takeout" boolean DEFAULT true,
  	"features_has_delivery" boolean DEFAULT true,
  	"features_accepts_cash" boolean DEFAULT true,
  	"features_accepts_cards" boolean DEFAULT true,
  	"features_accepts_digital_payments" boolean DEFAULT true,
  	"features_has_wifi" boolean DEFAULT false,
  	"features_is_accessible" boolean DEFAULT false,
  	"compliance_business_permit_number" varchar,
  	"compliance_food_safety_license" varchar,
  	"compliance_fire_permit_number" varchar,
  	"compliance_sanitary_permit_number" varchar,
  	"compliance_last_inspection_date" timestamp(3) with time zone,
  	"compliance_inspection_score" numeric,
  	"description" varchar,
  	"special_instructions" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_categories_styling_gradient_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar
  );
  
  CREATE TABLE "prod_categories_attributes_dietary_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" "enum_prod_categories_attributes_dietary_tags_tag"
  );
  
  CREATE TABLE "prod_categories_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "prod_categories_availability_seasonal_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season" "enum_prod_categories_availability_seasonal_availability_season",
  	"available" boolean DEFAULT true
  );
  
  CREATE TABLE "prod_categories_availability_region_restrictions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region" varchar,
  	"restricted" boolean DEFAULT false
  );
  
  CREATE TABLE "prod_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"parent_category_id" integer,
  	"category_level" numeric DEFAULT 1,
  	"category_path" varchar,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"is_featured" boolean DEFAULT false,
  	"media_icon_id" integer,
  	"media_banner_image_id" integer,
  	"media_thumbnail_image_id" integer,
  	"styling_color_theme" varchar,
  	"styling_background_color" varchar,
  	"styling_text_color" varchar,
  	"attributes_category_type" "enum_prod_categories_attributes_category_type",
  	"attributes_age_restriction" "enum_prod_categories_attributes_age_restriction" DEFAULT 'none',
  	"attributes_requires_prescription" boolean DEFAULT false,
  	"business_rules_allows_customization" boolean DEFAULT true,
  	"business_rules_requires_special_handling" boolean DEFAULT false,
  	"business_rules_has_expiration_dates" boolean DEFAULT false,
  	"business_rules_requires_refrigeration" boolean DEFAULT false,
  	"business_rules_max_delivery_time_hours" numeric,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical_url" varchar,
  	"metrics_total_products" numeric DEFAULT 0,
  	"metrics_total_orders" numeric DEFAULT 0,
  	"metrics_average_rating" numeric DEFAULT 0,
  	"metrics_popularity_score" numeric DEFAULT 0,
  	"metrics_view_count" numeric DEFAULT 0,
  	"promotions_is_promotional" boolean DEFAULT false,
  	"promotions_promotional_text" varchar,
  	"promotions_discount_percentage" numeric,
  	"promotions_promotion_start_date" timestamp(3) with time zone,
  	"promotions_promotion_end_date" timestamp(3) with time zone,
  	"availability_available_hours" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  CREATE TABLE "products_dietary_allergens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"allergen" "enum_products_dietary_allergens_allergen"
  );
  
  CREATE TABLE "products_dietary_ingredients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ingredient" varchar NOT NULL,
  	"quantity" varchar
  );
  
  CREATE TABLE "products_availability_seasonal_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season" varchar,
  	"available" boolean DEFAULT true
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
  
  CREATE TABLE "products_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
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
  	"availability_is_available" boolean DEFAULT true,
  	"availability_stock_quantity" numeric,
  	"availability_low_stock_threshold" numeric DEFAULT 5,
  	"availability_max_order_quantity" numeric,
  	"availability_available_hours" jsonb,
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
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_variants_availability_available_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_prod_variants_availability_available_days_day"
  );
  
  CREATE TABLE "prod_variants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_name" varchar NOT NULL,
  	"variant_type" "enum_prod_variants_variant_type" NOT NULL,
  	"description" varchar,
  	"settings_is_required" boolean DEFAULT false,
  	"settings_allow_multiple" boolean DEFAULT false,
  	"settings_min_selections" numeric DEFAULT 0,
  	"settings_max_selections" numeric,
  	"settings_display_order" numeric DEFAULT 0,
  	"conditional_display_show_only_if" jsonb,
  	"conditional_display_hide_only_if" jsonb,
  	"availability_is_active" boolean DEFAULT true,
  	"availability_available_hours" jsonb,
  	"metadata_help_text" varchar,
  	"metadata_icon_id" integer,
  	"metadata_category" "enum_prod_variants_metadata_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_var_options_nutrition_allergen_changes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"allergen" "enum_prod_var_options_nutrition_allergen_changes_allergen",
  	"change" "enum_prod_var_options_nutrition_allergen_changes_change"
  );
  
  CREATE TABLE "prod_var_options_settings_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "prod_var_options" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant_id" integer NOT NULL,
  	"option_name" varchar NOT NULL,
  	"option_code" varchar,
  	"description" varchar,
  	"pricing_price_adjustment" numeric DEFAULT 0,
  	"pricing_adjustment_type" "enum_prod_var_options_pricing_adjustment_type" DEFAULT 'fixed',
  	"pricing_cost_adjustment" numeric DEFAULT 0,
  	"availability_is_available" boolean DEFAULT true,
  	"availability_stock_quantity" numeric,
  	"availability_low_stock_threshold" numeric DEFAULT 0,
  	"availability_max_quantity_per_order" numeric,
  	"display_display_order" numeric DEFAULT 0,
  	"display_is_default" boolean DEFAULT false,
  	"display_is_popular" boolean DEFAULT false,
  	"display_is_recommended" boolean DEFAULT false,
  	"media_image_id" integer,
  	"media_icon_id" integer,
  	"media_color_code" varchar,
  	"nutrition_calorie_adjustment" numeric DEFAULT 0,
  	"nutrition_dietary_impact_affects_vegetarian" boolean DEFAULT false,
  	"nutrition_dietary_impact_affects_vegan" boolean DEFAULT false,
  	"nutrition_dietary_impact_affects_gluten_free" boolean DEFAULT false,
  	"nutrition_dietary_impact_affects_halal" boolean DEFAULT false,
  	"preparation_impact_time_adjustment_minutes" numeric DEFAULT 0,
  	"preparation_impact_requires_special_handling" boolean DEFAULT false,
  	"preparation_impact_special_instructions" varchar,
  	"preparation_impact_kitchen_notes" varchar,
  	"analytics_selection_count" numeric DEFAULT 0,
  	"analytics_popularity_score" numeric DEFAULT 0,
  	"analytics_revenue_generated" numeric DEFAULT 0,
  	"settings_is_exclusive" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_var_options_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"prod_var_options_id" integer
  );
  
  CREATE TABLE "prod_cat_assoc_conditions_customer_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"segment" "enum_prod_cat_assoc_conditions_customer_segments_segment"
  );
  
  CREATE TABLE "prod_cat_assoc_metadata_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "prod_cat_assoc" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"category_id" integer NOT NULL,
  	"association_type" "enum_prod_cat_assoc_association_type" DEFAULT 'secondary' NOT NULL,
  	"display_display_order" numeric DEFAULT 0,
  	"display_is_featured" boolean DEFAULT false,
  	"display_is_promoted" boolean DEFAULT false,
  	"timing_is_active" boolean DEFAULT true,
  	"timing_start_date" timestamp(3) with time zone,
  	"timing_end_date" timestamp(3) with time zone,
  	"timing_available_hours" jsonb,
  	"promotional_promotional_text" varchar,
  	"promotional_discount_percentage" numeric,
  	"promotional_badge_text" varchar,
  	"promotional_badge_color" varchar,
  	"analytics_view_count" numeric DEFAULT 0,
  	"analytics_click_count" numeric DEFAULT 0,
  	"analytics_order_count" numeric DEFAULT 0,
  	"analytics_conversion_rate" numeric DEFAULT 0,
  	"business_rules_priority" "enum_prod_cat_assoc_business_rules_priority" DEFAULT 'normal',
  	"business_rules_weight" numeric DEFAULT 50,
  	"business_rules_boost_score" numeric DEFAULT 0,
  	"conditions_show_only_if" jsonb,
  	"conditions_hide_only_if" jsonb,
  	"conditions_requires_minimum_order" numeric,
  	"metadata_notes" varchar,
  	"metadata_created_by_id" integer,
  	"metadata_last_modified_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vendors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "merchants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_variants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_var_options_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_cat_assoc_id" integer;
  ALTER TABLE "vendors_cuisine_types" ADD CONSTRAINT "vendors_cuisine_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vendors" ADD CONSTRAINT "vendors_business_license_id_media_id_fk" FOREIGN KEY ("business_license_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tax_certificate_id_media_id_fk" FOREIGN KEY ("tax_certificate_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vendors" ADD CONSTRAINT "vendors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchants_special_hours" ADD CONSTRAINT "merchants_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merchants_media_interior_images" ADD CONSTRAINT "merchants_media_interior_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchants_media_interior_images" ADD CONSTRAINT "merchants_media_interior_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merchants_media_menu_images" ADD CONSTRAINT "merchants_media_menu_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchants_media_menu_images" ADD CONSTRAINT "merchants_media_menu_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merchants_tags" ADD CONSTRAINT "merchants_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merchants" ADD CONSTRAINT "merchants_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchants" ADD CONSTRAINT "merchants_media_store_front_image_id_media_id_fk" FOREIGN KEY ("media_store_front_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_categories_styling_gradient_colors" ADD CONSTRAINT "prod_categories_styling_gradient_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_categories_attributes_dietary_tags" ADD CONSTRAINT "prod_categories_attributes_dietary_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_categories_seo_keywords" ADD CONSTRAINT "prod_categories_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_categories_availability_seasonal_availability" ADD CONSTRAINT "prod_categories_availability_seasonal_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_categories_availability_region_restrictions" ADD CONSTRAINT "prod_categories_availability_region_restrictions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_categories" ADD CONSTRAINT "prod_categories_parent_category_id_prod_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."prod_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_categories" ADD CONSTRAINT "prod_categories_media_icon_id_media_id_fk" FOREIGN KEY ("media_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_categories" ADD CONSTRAINT "prod_categories_media_banner_image_id_media_id_fk" FOREIGN KEY ("media_banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_categories" ADD CONSTRAINT "prod_categories_media_thumbnail_image_id_media_id_fk" FOREIGN KEY ("media_thumbnail_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_pricing_price_history" ADD CONSTRAINT "products_pricing_price_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_nutrition_vitamins" ADD CONSTRAINT "products_nutrition_vitamins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_dietary_allergens" ADD CONSTRAINT "products_dietary_allergens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_dietary_ingredients" ADD CONSTRAINT "products_dietary_ingredients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_availability_seasonal_availability" ADD CONSTRAINT "products_availability_seasonal_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_media_additional_images" ADD CONSTRAINT "products_media_additional_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_media_additional_images" ADD CONSTRAINT "products_media_additional_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_seo_keywords" ADD CONSTRAINT "products_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_primary_category_id_prod_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."prod_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_media_primary_image_id_media_id_fk" FOREIGN KEY ("media_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_media_video_id_media_id_fk" FOREIGN KEY ("media_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variants_availability_available_days" ADD CONSTRAINT "prod_variants_availability_available_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_variants" ADD CONSTRAINT "prod_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variants" ADD CONSTRAINT "prod_variants_metadata_icon_id_media_id_fk" FOREIGN KEY ("metadata_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_var_options_nutrition_allergen_changes" ADD CONSTRAINT "prod_var_options_nutrition_allergen_changes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_var_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_var_options_settings_tags" ADD CONSTRAINT "prod_var_options_settings_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_var_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_var_options" ADD CONSTRAINT "prod_var_options_variant_id_prod_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."prod_variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_var_options" ADD CONSTRAINT "prod_var_options_media_image_id_media_id_fk" FOREIGN KEY ("media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_var_options" ADD CONSTRAINT "prod_var_options_media_icon_id_media_id_fk" FOREIGN KEY ("media_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_var_options_rels" ADD CONSTRAINT "prod_var_options_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."prod_var_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_var_options_rels" ADD CONSTRAINT "prod_var_options_rels_product_variant_options_fk" FOREIGN KEY ("prod_var_options_id") REFERENCES "public"."prod_var_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc_conditions_customer_segments" ADD CONSTRAINT "prod_cat_assoc_conditions_customer_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_cat_assoc"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc_metadata_tags" ADD CONSTRAINT "prod_cat_assoc_metadata_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prod_cat_assoc"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc" ADD CONSTRAINT "prod_cat_assoc_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc" ADD CONSTRAINT "prod_cat_assoc_category_id_prod_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."prod_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc" ADD CONSTRAINT "prod_cat_assoc_metadata_created_by_id_users_id_fk" FOREIGN KEY ("metadata_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_cat_assoc" ADD CONSTRAINT "prod_cat_assoc_metadata_last_modified_by_id_users_id_fk" FOREIGN KEY ("metadata_last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "vendors_cuisine_types_order_idx" ON "vendors_cuisine_types" USING btree ("_order");
  CREATE INDEX "vendors_cuisine_types_parent_id_idx" ON "vendors_cuisine_types" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "vendors_business_registration_number_idx" ON "vendors" USING btree ("business_registration_number");
  CREATE UNIQUE INDEX "vendors_tax_identification_number_idx" ON "vendors" USING btree ("tax_identification_number");
  CREATE INDEX "vendors_business_license_idx" ON "vendors" USING btree ("business_license_id");
  CREATE INDEX "vendors_tax_certificate_idx" ON "vendors" USING btree ("tax_certificate_id");
  CREATE INDEX "vendors_logo_idx" ON "vendors" USING btree ("logo_id");
  CREATE INDEX "vendors_updated_at_idx" ON "vendors" USING btree ("updated_at");
  CREATE INDEX "vendors_created_at_idx" ON "vendors" USING btree ("created_at");
  CREATE INDEX "merchants_special_hours_order_idx" ON "merchants_special_hours" USING btree ("_order");
  CREATE INDEX "merchants_special_hours_parent_id_idx" ON "merchants_special_hours" USING btree ("_parent_id");
  CREATE INDEX "merchants_media_interior_images_order_idx" ON "merchants_media_interior_images" USING btree ("_order");
  CREATE INDEX "merchants_media_interior_images_parent_id_idx" ON "merchants_media_interior_images" USING btree ("_parent_id");
  CREATE INDEX "merchants_media_interior_images_image_idx" ON "merchants_media_interior_images" USING btree ("image_id");
  CREATE INDEX "merchants_media_menu_images_order_idx" ON "merchants_media_menu_images" USING btree ("_order");
  CREATE INDEX "merchants_media_menu_images_parent_id_idx" ON "merchants_media_menu_images" USING btree ("_parent_id");
  CREATE INDEX "merchants_media_menu_images_image_idx" ON "merchants_media_menu_images" USING btree ("image_id");
  CREATE INDEX "merchants_tags_order_idx" ON "merchants_tags" USING btree ("_order");
  CREATE INDEX "merchants_tags_parent_id_idx" ON "merchants_tags" USING btree ("_parent_id");
  CREATE INDEX "merchants_vendor_idx" ON "merchants" USING btree ("vendor_id");
  CREATE UNIQUE INDEX "merchants_outlet_code_idx" ON "merchants" USING btree ("outlet_code");
  CREATE INDEX "merchants_media_media_store_front_image_idx" ON "merchants" USING btree ("media_store_front_image_id");
  CREATE INDEX "merchants_updated_at_idx" ON "merchants" USING btree ("updated_at");
  CREATE INDEX "merchants_created_at_idx" ON "merchants" USING btree ("created_at");
  CREATE INDEX "prod_categories_styling_gradient_colors_order_idx" ON "prod_categories_styling_gradient_colors" USING btree ("_order");
  CREATE INDEX "prod_categories_styling_gradient_colors_parent_id_idx" ON "prod_categories_styling_gradient_colors" USING btree ("_parent_id");
  CREATE INDEX "prod_categories_attributes_dietary_tags_order_idx" ON "prod_categories_attributes_dietary_tags" USING btree ("_order");
  CREATE INDEX "prod_categories_attributes_dietary_tags_parent_id_idx" ON "prod_categories_attributes_dietary_tags" USING btree ("_parent_id");
  CREATE INDEX "prod_categories_seo_keywords_order_idx" ON "prod_categories_seo_keywords" USING btree ("_order");
  CREATE INDEX "prod_categories_seo_keywords_parent_id_idx" ON "prod_categories_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "prod_categories_availability_seasonal_availability_order_idx" ON "prod_categories_availability_seasonal_availability" USING btree ("_order");
  CREATE INDEX "prod_categories_availability_seasonal_availability_parent_id_idx" ON "prod_categories_availability_seasonal_availability" USING btree ("_parent_id");
  CREATE INDEX "prod_categories_availability_region_restrictions_order_idx" ON "prod_categories_availability_region_restrictions" USING btree ("_order");
  CREATE INDEX "prod_categories_availability_region_restrictions_parent_id_idx" ON "prod_categories_availability_region_restrictions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "prod_categories_slug_idx" ON "prod_categories" USING btree ("slug");
  CREATE INDEX "prod_categories_parent_category_idx" ON "prod_categories" USING btree ("parent_category_id");
  CREATE INDEX "prod_categories_media_media_icon_idx" ON "prod_categories" USING btree ("media_icon_id");
  CREATE INDEX "prod_categories_media_media_banner_image_idx" ON "prod_categories" USING btree ("media_banner_image_id");
  CREATE INDEX "prod_categories_media_media_thumbnail_image_idx" ON "prod_categories" USING btree ("media_thumbnail_image_id");
  CREATE INDEX "prod_categories_updated_at_idx" ON "prod_categories" USING btree ("updated_at");
  CREATE INDEX "prod_categories_created_at_idx" ON "prod_categories" USING btree ("created_at");
  CREATE INDEX "products_pricing_price_history_order_idx" ON "products_pricing_price_history" USING btree ("_order");
  CREATE INDEX "products_pricing_price_history_parent_id_idx" ON "products_pricing_price_history" USING btree ("_parent_id");
  CREATE INDEX "products_nutrition_vitamins_order_idx" ON "products_nutrition_vitamins" USING btree ("_order");
  CREATE INDEX "products_nutrition_vitamins_parent_id_idx" ON "products_nutrition_vitamins" USING btree ("_parent_id");
  CREATE INDEX "products_dietary_allergens_order_idx" ON "products_dietary_allergens" USING btree ("_order");
  CREATE INDEX "products_dietary_allergens_parent_id_idx" ON "products_dietary_allergens" USING btree ("_parent_id");
  CREATE INDEX "products_dietary_ingredients_order_idx" ON "products_dietary_ingredients" USING btree ("_order");
  CREATE INDEX "products_dietary_ingredients_parent_id_idx" ON "products_dietary_ingredients" USING btree ("_parent_id");
  CREATE INDEX "products_availability_seasonal_availability_order_idx" ON "products_availability_seasonal_availability" USING btree ("_order");
  CREATE INDEX "products_availability_seasonal_availability_parent_id_idx" ON "products_availability_seasonal_availability" USING btree ("_parent_id");
  CREATE INDEX "products_media_additional_images_order_idx" ON "products_media_additional_images" USING btree ("_order");
  CREATE INDEX "products_media_additional_images_parent_id_idx" ON "products_media_additional_images" USING btree ("_parent_id");
  CREATE INDEX "products_media_additional_images_image_idx" ON "products_media_additional_images" USING btree ("image_id");
  CREATE INDEX "products_seo_keywords_order_idx" ON "products_seo_keywords" USING btree ("_order");
  CREATE INDEX "products_seo_keywords_parent_id_idx" ON "products_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "products_tags_order_idx" ON "products_tags" USING btree ("_order");
  CREATE INDEX "products_tags_parent_id_idx" ON "products_tags" USING btree ("_parent_id");
  CREATE INDEX "products_merchant_idx" ON "products" USING btree ("merchant_id");
  CREATE INDEX "products_primary_category_idx" ON "products" USING btree ("primary_category_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE UNIQUE INDEX "products_identification_identification_sku_idx" ON "products" USING btree ("identification_sku");
  CREATE INDEX "products_media_media_primary_image_idx" ON "products" USING btree ("media_primary_image_id");
  CREATE INDEX "products_media_media_video_idx" ON "products" USING btree ("media_video_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "prod_variants_availability_available_days_order_idx" ON "prod_variants_availability_available_days" USING btree ("_order");
  CREATE INDEX "prod_variants_availability_available_days_parent_id_idx" ON "prod_variants_availability_available_days" USING btree ("_parent_id");
  CREATE INDEX "prod_variants_product_idx" ON "prod_variants" USING btree ("product_id");
  CREATE INDEX "prod_variants_metadata_metadata_icon_idx" ON "prod_variants" USING btree ("metadata_icon_id");
  CREATE INDEX "prod_variants_updated_at_idx" ON "prod_variants" USING btree ("updated_at");
  CREATE INDEX "prod_variants_created_at_idx" ON "prod_variants" USING btree ("created_at");
  CREATE INDEX "prod_var_options_nutrition_allergen_changes_order_idx" ON "prod_var_options_nutrition_allergen_changes" USING btree ("_order");
  CREATE INDEX "prod_var_options_nutrition_allergen_changes_parent_id_idx" ON "prod_var_options_nutrition_allergen_changes" USING btree ("_parent_id");
  CREATE INDEX "prod_var_options_settings_tags_order_idx" ON "prod_var_options_settings_tags" USING btree ("_order");
  CREATE INDEX "prod_var_options_settings_tags_parent_id_idx" ON "prod_var_options_settings_tags" USING btree ("_parent_id");
  CREATE INDEX "prod_var_options_variant_idx" ON "prod_var_options" USING btree ("variant_id");
  CREATE INDEX "prod_var_options_media_media_image_idx" ON "prod_var_options" USING btree ("media_image_id");
  CREATE INDEX "prod_var_options_media_media_icon_idx" ON "prod_var_options" USING btree ("media_icon_id");
  CREATE INDEX "prod_var_options_updated_at_idx" ON "prod_var_options" USING btree ("updated_at");
  CREATE INDEX "prod_var_options_created_at_idx" ON "prod_var_options" USING btree ("created_at");
  CREATE INDEX "prod_var_options_rels_order_idx" ON "prod_var_options_rels" USING btree ("order");
  CREATE INDEX "prod_var_options_rels_parent_idx" ON "prod_var_options_rels" USING btree ("parent_id");
  CREATE INDEX "prod_var_options_rels_path_idx" ON "prod_var_options_rels" USING btree ("path");
  CREATE INDEX "prod_var_options_rels_prod_var_options_id_idx" ON "prod_var_options_rels" USING btree ("prod_var_options_id");
  CREATE INDEX "prod_cat_assoc_conditions_customer_segments_order_idx" ON "prod_cat_assoc_conditions_customer_segments" USING btree ("_order");
  CREATE INDEX "prod_cat_assoc_conditions_customer_segments_parent_id_idx" ON "prod_cat_assoc_conditions_customer_segments" USING btree ("_parent_id");
  CREATE INDEX "prod_cat_assoc_metadata_tags_order_idx" ON "prod_cat_assoc_metadata_tags" USING btree ("_order");
  CREATE INDEX "prod_cat_assoc_metadata_tags_parent_id_idx" ON "prod_cat_assoc_metadata_tags" USING btree ("_parent_id");
  CREATE INDEX "prod_cat_assoc_product_idx" ON "prod_cat_assoc" USING btree ("product_id");
  CREATE INDEX "prod_cat_assoc_category_idx" ON "prod_cat_assoc" USING btree ("category_id");
  CREATE INDEX "prod_cat_assoc_metadata_metadata_created_by_idx" ON "prod_cat_assoc" USING btree ("metadata_created_by_id");
  CREATE INDEX "prod_cat_assoc_metadata_metadata_last_modified_by_idx" ON "prod_cat_assoc" USING btree ("metadata_last_modified_by_id");
  CREATE INDEX "prod_cat_assoc_updated_at_idx" ON "prod_cat_assoc" USING btree ("updated_at");
  CREATE INDEX "prod_cat_assoc_created_at_idx" ON "prod_cat_assoc" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merchants_fk" FOREIGN KEY ("merchants_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("prod_categories_id") REFERENCES "public"."prod_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variants_fk" FOREIGN KEY ("prod_variants_id") REFERENCES "public"."prod_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_variant_options_fk" FOREIGN KEY ("prod_var_options_id") REFERENCES "public"."prod_var_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_category_associations_fk" FOREIGN KEY ("prod_cat_assoc_id") REFERENCES "public"."prod_cat_assoc"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_vendors_id_idx" ON "payload_locked_documents_rels" USING btree ("vendors_id");
  CREATE INDEX "payload_locked_documents_rels_merchants_id_idx" ON "payload_locked_documents_rels" USING btree ("merchants_id");
  CREATE INDEX "payload_locked_documents_rels_prod_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_categories_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_prod_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_variants_id");
  CREATE INDEX "payload_locked_documents_rels_prod_var_options_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_var_options_id");
  CREATE INDEX "payload_locked_documents_rels_prod_cat_assoc_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_cat_assoc_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vendors_cuisine_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vendors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchants_special_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchants_media_interior_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchants_media_menu_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchants_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories_styling_gradient_colors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories_attributes_dietary_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories_seo_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories_availability_seasonal_availability" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories_availability_region_restrictions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_pricing_price_history" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_nutrition_vitamins" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_dietary_allergens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_dietary_ingredients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_availability_seasonal_availability" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_media_additional_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_seo_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_variants_availability_available_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_variants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_var_options_nutrition_allergen_changes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_var_options_settings_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_var_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_var_options_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_cat_assoc_conditions_customer_segments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_cat_assoc_metadata_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_cat_assoc" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "vendors_cuisine_types" CASCADE;
  DROP TABLE "vendors" CASCADE;
  DROP TABLE "merchants_special_hours" CASCADE;
  DROP TABLE "merchants_media_interior_images" CASCADE;
  DROP TABLE "merchants_media_menu_images" CASCADE;
  DROP TABLE "merchants_tags" CASCADE;
  DROP TABLE "merchants" CASCADE;
  DROP TABLE "prod_categories_styling_gradient_colors" CASCADE;
  DROP TABLE "prod_categories_attributes_dietary_tags" CASCADE;
  DROP TABLE "prod_categories_seo_keywords" CASCADE;
  DROP TABLE "prod_categories_availability_seasonal_availability" CASCADE;
  DROP TABLE "prod_categories_availability_region_restrictions" CASCADE;
  DROP TABLE "prod_categories" CASCADE;
  DROP TABLE "products_pricing_price_history" CASCADE;
  DROP TABLE "products_nutrition_vitamins" CASCADE;
  DROP TABLE "products_dietary_allergens" CASCADE;
  DROP TABLE "products_dietary_ingredients" CASCADE;
  DROP TABLE "products_availability_seasonal_availability" CASCADE;
  DROP TABLE "products_media_additional_images" CASCADE;
  DROP TABLE "products_seo_keywords" CASCADE;
  DROP TABLE "products_tags" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "prod_variants_availability_available_days" CASCADE;
  DROP TABLE "prod_variants" CASCADE;
  DROP TABLE "prod_var_options_nutrition_allergen_changes" CASCADE;
  DROP TABLE "prod_var_options_settings_tags" CASCADE;
  DROP TABLE "prod_var_options" CASCADE;
  DROP TABLE "prod_var_options_rels" CASCADE;
  DROP TABLE "prod_cat_assoc_conditions_customer_segments" CASCADE;
  DROP TABLE "prod_cat_assoc_metadata_tags" CASCADE;
  DROP TABLE "prod_cat_assoc" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vendors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_merchants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_variants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_variant_options_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_category_associations_fk";
  
  DROP INDEX "payload_locked_documents_rels_vendors_id_idx";
  DROP INDEX "payload_locked_documents_rels_merchants_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_variants_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_var_options_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_cat_assoc_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vendors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "merchants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_variants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_var_options_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_cat_assoc_id";
  DROP TYPE "public"."enum_vendors_cuisine_types_cuisine";
  DROP TYPE "public"."enum_vendors_business_type";
  DROP TYPE "public"."enum_vendors_verification_status";
  DROP TYPE "public"."enum_merchants_operational_status";
  DROP TYPE "public"."enum_prod_categories_attributes_dietary_tags_tag";
  DROP TYPE "public"."enum_prod_categories_availability_seasonal_availability_season";
  DROP TYPE "public"."enum_prod_categories_attributes_category_type";
  DROP TYPE "public"."enum_prod_categories_attributes_age_restriction";
  DROP TYPE "public"."enum_products_dietary_allergens_allergen";
  DROP TYPE "public"."enum_products_dietary_spice_level";
  DROP TYPE "public"."enum_products_preparation_cooking_method";
  DROP TYPE "public"."enum_prod_variants_availability_available_days_day";
  DROP TYPE "public"."enum_prod_variants_variant_type";
  DROP TYPE "public"."enum_prod_variants_metadata_category";
  DROP TYPE "public"."enum_prod_var_options_nutrition_allergen_changes_allergen";
  DROP TYPE "public"."enum_prod_var_options_nutrition_allergen_changes_change";
  DROP TYPE "public"."enum_prod_var_options_pricing_adjustment_type";
  DROP TYPE "public"."enum_prod_cat_assoc_conditions_customer_segments_segment";
  DROP TYPE "public"."enum_prod_cat_assoc_association_type";
  DROP TYPE "public"."enum_prod_cat_assoc_business_rules_priority";`)
}

-- CLEANUP SCRIPT: Remove all extra tables that were not requested
-- Only keep: vendors, merchants, products, prod_categories (and their basic relations)

-- Drop all the extra variant and association tables
DROP TABLE IF EXISTS "prod_variants_availability_available_days" CASCADE;
DROP TABLE IF EXISTS "prod_variants" CASCADE;
DROP TABLE IF EXISTS "prod_var_options_nutrition_allergen_changes" CASCADE;
DROP TABLE IF EXISTS "prod_var_options_settings_tags" CASCADE;
DROP TABLE IF EXISTS "prod_var_options" CASCADE;
DROP TABLE IF EXISTS "prod_var_options_rels" CASCADE;
DROP TABLE IF EXISTS "prod_cat_assoc_conditions_customer_segments" CASCADE;
DROP TABLE IF EXISTS "prod_cat_assoc_metadata_tags" CASCADE;
DROP TABLE IF EXISTS "prod_cat_assoc" CASCADE;

-- Drop any other related tables that might exist
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "product_variant_options" CASCADE;
DROP TABLE IF EXISTS "product_category_associations" CASCADE;

-- Clean up payload relations
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "prod_variants_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "prod_var_options_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "prod_cat_assoc_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_variants_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_variant_options_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_category_associations_id";

-- Drop related indexes if they exist
DROP INDEX IF EXISTS "payload_locked_documents_rels_prod_variants_id_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_prod_var_options_id_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_prod_cat_assoc_id_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_product_variants_id_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_product_variant_options_id_idx";
DROP INDEX IF EXISTS "payload_locked_documents_rels_product_category_associations_id_idx";

-- Drop related enums
DROP TYPE IF EXISTS "enum_prod_variants_availability_available_days_day";
DROP TYPE IF EXISTS "enum_prod_variants_variant_type";
DROP TYPE IF EXISTS "enum_prod_variants_metadata_category";
DROP TYPE IF EXISTS "enum_prod_var_options_nutrition_allergen_changes_allergen";
DROP TYPE IF EXISTS "enum_prod_var_options_nutrition_allergen_changes_change";
DROP TYPE IF EXISTS "enum_prod_var_options_pricing_adjustment_type";
DROP TYPE IF EXISTS "enum_prod_cat_assoc_conditions_customer_segments_segment";
DROP TYPE IF EXISTS "enum_prod_cat_assoc_association_type";
DROP TYPE IF EXISTS "enum_prod_cat_assoc_business_rules_priority";

-- Drop any other variant/association related enums
DROP TYPE IF EXISTS "enum_product_variants_variant_type";
DROP TYPE IF EXISTS "enum_product_variant_options_pricing_adjustment_type";
DROP TYPE IF EXISTS "enum_product_category_associations_association_type";

SELECT 'Cleanup completed - only 4 core tables should remain: vendors, merchants, products, prod_categories' as status;
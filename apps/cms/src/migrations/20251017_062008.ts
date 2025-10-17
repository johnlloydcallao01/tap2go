import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_prod_attributes_type" AS ENUM('select', 'color', 'button', 'radio');
  CREATE TYPE "public"."enum_merchant_products_added_by" AS ENUM('vendor', 'merchant');
  CREATE TYPE "public"."enum_modifier_groups_selection_type" AS ENUM('single', 'multiple');
  CREATE TYPE "public"."enum_prod_tags_tag_type" AS ENUM('general', 'dietary', 'cuisine', 'promotion', 'feature', 'allergen', 'spice_level', 'temperature', 'size_category');
  CREATE TYPE "public"."enum_prod_tags_junction_added_by_type" AS ENUM('vendor', 'merchant', 'system');
  CREATE TABLE "prod_attributes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_prod_attributes_type" DEFAULT 'select' NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_attribute_terms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"attribute_id_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"value" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_variations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id_id" integer NOT NULL,
  	"attribute_id_id" integer NOT NULL,
  	"is_used_for_variations" boolean DEFAULT true,
  	"is_visible" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_variation_values" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"variation_product_id_id" integer NOT NULL,
  	"attribute_id_id" integer NOT NULL,
  	"term_id_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_grouped_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_product_id_id" integer NOT NULL,
  	"child_product_id_id" integer NOT NULL,
  	"default_quantity" numeric DEFAULT 1,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vendor_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vendor_id_id" integer NOT NULL,
  	"product_id_id" integer NOT NULL,
  	"auto_assign_to_new_merchants" boolean DEFAULT false,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "merchant_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"merchant_id_id" integer NOT NULL,
  	"product_id_id" integer NOT NULL,
  	"added_by" "enum_merchant_products_added_by" NOT NULL,
  	"price_override" numeric,
  	"is_active" boolean DEFAULT true,
  	"is_available" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "modifier_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"selection_type" "enum_modifier_groups_selection_type" NOT NULL,
  	"is_required" boolean DEFAULT false,
  	"min_selections" numeric DEFAULT 0,
  	"max_selections" numeric,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "modifier_options" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"modifier_group_id_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"price_adjustment" numeric DEFAULT 0,
  	"is_default" boolean DEFAULT false,
  	"is_available" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"tag_type" "enum_prod_tags_tag_type" DEFAULT 'general',
  	"parent_tag_id_id" integer,
  	"usage_count" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"is_featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prod_tags_junction" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id_id" integer NOT NULL,
  	"tag_id_id" integer NOT NULL,
  	"added_by_type" "enum_prod_tags_junction_added_by_type" NOT NULL,
  	"added_by_vendor_id_id" integer,
  	"added_by_merchant_id_id" integer,
  	"priority" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tag_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"icon" varchar,
  	"is_filterable" boolean DEFAULT true,
  	"is_searchable" boolean DEFAULT true,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tag_group_memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag_group_id_id" integer NOT NULL,
  	"tag_id_id" integer NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_attributes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_attribute_terms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_variations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_variation_values_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_grouped_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vendor_products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "merchant_products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "modifier_groups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "modifier_options_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "prod_tags_junction_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tag_groups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tag_group_memberships_id" integer;
  ALTER TABLE "prod_attribute_terms" ADD CONSTRAINT "prod_attribute_terms_attribute_id_id_prod_attributes_id_fk" FOREIGN KEY ("attribute_id_id") REFERENCES "public"."prod_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variations" ADD CONSTRAINT "prod_variations_product_id_id_products_id_fk" FOREIGN KEY ("product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variations" ADD CONSTRAINT "prod_variations_attribute_id_id_prod_attributes_id_fk" FOREIGN KEY ("attribute_id_id") REFERENCES "public"."prod_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variation_values" ADD CONSTRAINT "prod_variation_values_variation_product_id_id_products_id_fk" FOREIGN KEY ("variation_product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variation_values" ADD CONSTRAINT "prod_variation_values_attribute_id_id_prod_attributes_id_fk" FOREIGN KEY ("attribute_id_id") REFERENCES "public"."prod_attributes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_variation_values" ADD CONSTRAINT "prod_variation_values_term_id_id_prod_attribute_terms_id_fk" FOREIGN KEY ("term_id_id") REFERENCES "public"."prod_attribute_terms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_grouped_items" ADD CONSTRAINT "prod_grouped_items_parent_product_id_id_products_id_fk" FOREIGN KEY ("parent_product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_grouped_items" ADD CONSTRAINT "prod_grouped_items_child_product_id_id_products_id_fk" FOREIGN KEY ("child_product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_vendor_id_id_vendors_id_fk" FOREIGN KEY ("vendor_id_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vendor_products" ADD CONSTRAINT "vendor_products_product_id_id_products_id_fk" FOREIGN KEY ("product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchant_products" ADD CONSTRAINT "merchant_products_merchant_id_id_merchants_id_fk" FOREIGN KEY ("merchant_id_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merchant_products" ADD CONSTRAINT "merchant_products_product_id_id_products_id_fk" FOREIGN KEY ("product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_product_id_id_products_id_fk" FOREIGN KEY ("product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_modifier_group_id_id_modifier_groups_id_fk" FOREIGN KEY ("modifier_group_id_id") REFERENCES "public"."modifier_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_tags" ADD CONSTRAINT "prod_tags_parent_tag_id_id_prod_tags_id_fk" FOREIGN KEY ("parent_tag_id_id") REFERENCES "public"."prod_tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_tags_junction" ADD CONSTRAINT "prod_tags_junction_product_id_id_products_id_fk" FOREIGN KEY ("product_id_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_tags_junction" ADD CONSTRAINT "prod_tags_junction_tag_id_id_prod_tags_id_fk" FOREIGN KEY ("tag_id_id") REFERENCES "public"."prod_tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_tags_junction" ADD CONSTRAINT "prod_tags_junction_added_by_vendor_id_id_vendors_id_fk" FOREIGN KEY ("added_by_vendor_id_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prod_tags_junction" ADD CONSTRAINT "prod_tags_junction_added_by_merchant_id_id_merchants_id_fk" FOREIGN KEY ("added_by_merchant_id_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tag_group_memberships" ADD CONSTRAINT "tag_group_memberships_tag_group_id_id_tag_groups_id_fk" FOREIGN KEY ("tag_group_id_id") REFERENCES "public"."tag_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tag_group_memberships" ADD CONSTRAINT "tag_group_memberships_tag_id_id_prod_tags_id_fk" FOREIGN KEY ("tag_id_id") REFERENCES "public"."prod_tags"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "prod_attributes_slug_idx" ON "prod_attributes" USING btree ("slug");
  CREATE INDEX "prod_attributes_updated_at_idx" ON "prod_attributes" USING btree ("updated_at");
  CREATE INDEX "prod_attributes_created_at_idx" ON "prod_attributes" USING btree ("created_at");
  CREATE INDEX "prod_attribute_terms_attribute_id_idx" ON "prod_attribute_terms" USING btree ("attribute_id_id");
  CREATE INDEX "prod_attribute_terms_updated_at_idx" ON "prod_attribute_terms" USING btree ("updated_at");
  CREATE INDEX "prod_attribute_terms_created_at_idx" ON "prod_attribute_terms" USING btree ("created_at");
  CREATE INDEX "prod_variations_product_id_idx" ON "prod_variations" USING btree ("product_id_id");
  CREATE INDEX "prod_variations_attribute_id_idx" ON "prod_variations" USING btree ("attribute_id_id");
  CREATE INDEX "prod_variations_updated_at_idx" ON "prod_variations" USING btree ("updated_at");
  CREATE INDEX "prod_variations_created_at_idx" ON "prod_variations" USING btree ("created_at");
  CREATE INDEX "prod_variation_values_variation_product_id_idx" ON "prod_variation_values" USING btree ("variation_product_id_id");
  CREATE INDEX "prod_variation_values_attribute_id_idx" ON "prod_variation_values" USING btree ("attribute_id_id");
  CREATE INDEX "prod_variation_values_term_id_idx" ON "prod_variation_values" USING btree ("term_id_id");
  CREATE INDEX "prod_variation_values_updated_at_idx" ON "prod_variation_values" USING btree ("updated_at");
  CREATE INDEX "prod_variation_values_created_at_idx" ON "prod_variation_values" USING btree ("created_at");
  CREATE INDEX "prod_grouped_items_parent_product_id_idx" ON "prod_grouped_items" USING btree ("parent_product_id_id");
  CREATE INDEX "prod_grouped_items_child_product_id_idx" ON "prod_grouped_items" USING btree ("child_product_id_id");
  CREATE INDEX "prod_grouped_items_updated_at_idx" ON "prod_grouped_items" USING btree ("updated_at");
  CREATE INDEX "prod_grouped_items_created_at_idx" ON "prod_grouped_items" USING btree ("created_at");
  CREATE INDEX "vendor_products_vendor_id_idx" ON "vendor_products" USING btree ("vendor_id_id");
  CREATE INDEX "vendor_products_product_id_idx" ON "vendor_products" USING btree ("product_id_id");
  CREATE INDEX "vendor_products_updated_at_idx" ON "vendor_products" USING btree ("updated_at");
  CREATE INDEX "vendor_products_created_at_idx" ON "vendor_products" USING btree ("created_at");
  CREATE INDEX "merchant_products_merchant_id_idx" ON "merchant_products" USING btree ("merchant_id_id");
  CREATE INDEX "merchant_products_product_id_idx" ON "merchant_products" USING btree ("product_id_id");
  CREATE INDEX "merchant_products_updated_at_idx" ON "merchant_products" USING btree ("updated_at");
  CREATE INDEX "merchant_products_created_at_idx" ON "merchant_products" USING btree ("created_at");
  CREATE INDEX "modifier_groups_product_id_idx" ON "modifier_groups" USING btree ("product_id_id");
  CREATE INDEX "modifier_groups_updated_at_idx" ON "modifier_groups" USING btree ("updated_at");
  CREATE INDEX "modifier_groups_created_at_idx" ON "modifier_groups" USING btree ("created_at");
  CREATE INDEX "modifier_options_modifier_group_id_idx" ON "modifier_options" USING btree ("modifier_group_id_id");
  CREATE INDEX "modifier_options_updated_at_idx" ON "modifier_options" USING btree ("updated_at");
  CREATE INDEX "modifier_options_created_at_idx" ON "modifier_options" USING btree ("created_at");
  CREATE UNIQUE INDEX "prod_tags_slug_idx" ON "prod_tags" USING btree ("slug");
  CREATE INDEX "prod_tags_parent_tag_id_idx" ON "prod_tags" USING btree ("parent_tag_id_id");
  CREATE INDEX "prod_tags_updated_at_idx" ON "prod_tags" USING btree ("updated_at");
  CREATE INDEX "prod_tags_created_at_idx" ON "prod_tags" USING btree ("created_at");
  CREATE INDEX "prod_tags_junction_product_id_idx" ON "prod_tags_junction" USING btree ("product_id_id");
  CREATE INDEX "prod_tags_junction_tag_id_idx" ON "prod_tags_junction" USING btree ("tag_id_id");
  CREATE INDEX "prod_tags_junction_added_by_vendor_id_idx" ON "prod_tags_junction" USING btree ("added_by_vendor_id_id");
  CREATE INDEX "prod_tags_junction_added_by_merchant_id_idx" ON "prod_tags_junction" USING btree ("added_by_merchant_id_id");
  CREATE INDEX "prod_tags_junction_updated_at_idx" ON "prod_tags_junction" USING btree ("updated_at");
  CREATE INDEX "prod_tags_junction_created_at_idx" ON "prod_tags_junction" USING btree ("created_at");
  CREATE UNIQUE INDEX "tag_groups_slug_idx" ON "tag_groups" USING btree ("slug");
  CREATE INDEX "tag_groups_updated_at_idx" ON "tag_groups" USING btree ("updated_at");
  CREATE INDEX "tag_groups_created_at_idx" ON "tag_groups" USING btree ("created_at");
  CREATE INDEX "tag_group_memberships_tag_group_id_idx" ON "tag_group_memberships" USING btree ("tag_group_id_id");
  CREATE INDEX "tag_group_memberships_tag_id_idx" ON "tag_group_memberships" USING btree ("tag_id_id");
  CREATE INDEX "tag_group_memberships_updated_at_idx" ON "tag_group_memberships" USING btree ("updated_at");
  CREATE INDEX "tag_group_memberships_created_at_idx" ON "tag_group_memberships" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_attributes_fk" FOREIGN KEY ("prod_attributes_id") REFERENCES "public"."prod_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_attribute_terms_fk" FOREIGN KEY ("prod_attribute_terms_id") REFERENCES "public"."prod_attribute_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_variations_fk" FOREIGN KEY ("prod_variations_id") REFERENCES "public"."prod_variations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_variation_values_fk" FOREIGN KEY ("prod_variation_values_id") REFERENCES "public"."prod_variation_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_grouped_items_fk" FOREIGN KEY ("prod_grouped_items_id") REFERENCES "public"."prod_grouped_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vendor_products_fk" FOREIGN KEY ("vendor_products_id") REFERENCES "public"."vendor_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merchant_products_fk" FOREIGN KEY ("merchant_products_id") REFERENCES "public"."merchant_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modifier_groups_fk" FOREIGN KEY ("modifier_groups_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modifier_options_fk" FOREIGN KEY ("modifier_options_id") REFERENCES "public"."modifier_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_tags_fk" FOREIGN KEY ("prod_tags_id") REFERENCES "public"."prod_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prod_tags_junction_fk" FOREIGN KEY ("prod_tags_junction_id") REFERENCES "public"."prod_tags_junction"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tag_groups_fk" FOREIGN KEY ("tag_groups_id") REFERENCES "public"."tag_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tag_group_memberships_fk" FOREIGN KEY ("tag_group_memberships_id") REFERENCES "public"."tag_group_memberships"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_prod_attributes_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_attributes_id");
  CREATE INDEX "payload_locked_documents_rels_prod_attribute_terms_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_attribute_terms_id");
  CREATE INDEX "payload_locked_documents_rels_prod_variations_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_variations_id");
  CREATE INDEX "payload_locked_documents_rels_prod_variation_values_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_variation_values_id");
  CREATE INDEX "payload_locked_documents_rels_prod_grouped_items_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_grouped_items_id");
  CREATE INDEX "payload_locked_documents_rels_vendor_products_id_idx" ON "payload_locked_documents_rels" USING btree ("vendor_products_id");
  CREATE INDEX "payload_locked_documents_rels_merchant_products_id_idx" ON "payload_locked_documents_rels" USING btree ("merchant_products_id");
  CREATE INDEX "payload_locked_documents_rels_modifier_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("modifier_groups_id");
  CREATE INDEX "payload_locked_documents_rels_modifier_options_id_idx" ON "payload_locked_documents_rels" USING btree ("modifier_options_id");
  CREATE INDEX "payload_locked_documents_rels_prod_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_tags_id");
  CREATE INDEX "payload_locked_documents_rels_prod_tags_junction_id_idx" ON "payload_locked_documents_rels" USING btree ("prod_tags_junction_id");
  CREATE INDEX "payload_locked_documents_rels_tag_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("tag_groups_id");
  CREATE INDEX "payload_locked_documents_rels_tag_group_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("tag_group_memberships_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "prod_attributes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_attribute_terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_variations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_variation_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_grouped_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vendor_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merchant_products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modifier_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "modifier_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "prod_tags_junction" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tag_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tag_group_memberships" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "prod_attributes" CASCADE;
  DROP TABLE "prod_attribute_terms" CASCADE;
  DROP TABLE "prod_variations" CASCADE;
  DROP TABLE "prod_variation_values" CASCADE;
  DROP TABLE "prod_grouped_items" CASCADE;
  DROP TABLE "vendor_products" CASCADE;
  DROP TABLE "merchant_products" CASCADE;
  DROP TABLE "modifier_groups" CASCADE;
  DROP TABLE "modifier_options" CASCADE;
  DROP TABLE "prod_tags" CASCADE;
  DROP TABLE "prod_tags_junction" CASCADE;
  DROP TABLE "tag_groups" CASCADE;
  DROP TABLE "tag_group_memberships" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_attributes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_attribute_terms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_variations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_variation_values_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_grouped_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vendor_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_merchant_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_modifier_groups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_modifier_options_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_prod_tags_junction_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tag_groups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tag_group_memberships_fk";
  
  DROP INDEX "payload_locked_documents_rels_prod_attributes_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_attribute_terms_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_variations_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_variation_values_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_grouped_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_vendor_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_merchant_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_modifier_groups_id_idx";
  DROP INDEX "payload_locked_documents_rels_modifier_options_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_prod_tags_junction_id_idx";
  DROP INDEX "payload_locked_documents_rels_tag_groups_id_idx";
  DROP INDEX "payload_locked_documents_rels_tag_group_memberships_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_attributes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_attribute_terms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_variations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_variation_values_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_grouped_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vendor_products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "merchant_products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "modifier_groups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "modifier_options_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "prod_tags_junction_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tag_groups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tag_group_memberships_id";
  DROP TYPE "public"."enum_prod_attributes_type";
  DROP TYPE "public"."enum_merchant_products_added_by";
  DROP TYPE "public"."enum_modifier_groups_selection_type";
  DROP TYPE "public"."enum_prod_tags_tag_type";
  DROP TYPE "public"."enum_prod_tags_junction_added_by_type";`)
}

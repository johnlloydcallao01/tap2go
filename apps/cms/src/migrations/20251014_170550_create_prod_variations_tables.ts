import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
-- Product Variations (links variable products to their attributes)
-- ============================================
CREATE TABLE prod_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- the variable product
    attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
    is_used_for_variations BOOLEAN DEFAULT TRUE, -- whether this attribute is used to create variations
    is_visible BOOLEAN DEFAULT TRUE, -- whether shown on product page
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT prod_variations_unique UNIQUE(product_id, attribute_id)
);

CREATE INDEX idx_prod_variations_product ON prod_variations(product_id);
CREATE INDEX idx_prod_variations_attribute ON prod_variations(attribute_id);


-- Product Variation Values (specific attribute values for each variation)
-- ============================================
CREATE TABLE prod_variation_values (
    id SERIAL PRIMARY KEY,
    variation_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- the variation (child product)
    attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
    term_id INTEGER NOT NULL REFERENCES prod_attribute_terms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT prod_variation_values_unique UNIQUE(variation_product_id, attribute_id)
);

CREATE INDEX idx_prod_variation_values_variation ON prod_variation_values(variation_product_id);
CREATE INDEX idx_prod_variation_values_attribute ON prod_variation_values(attribute_id);
CREATE INDEX idx_prod_variation_values_term ON prod_variation_values(term_id);


-- Grouped Products (for product bundles)
-- ============================================
CREATE TABLE prod_grouped_items (
    id SERIAL PRIMARY KEY,
    parent_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- the grouped product
    child_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, -- individual product in the group
    default_quantity INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT prod_grouped_items_unique UNIQUE(parent_product_id, child_product_id)
);

CREATE INDEX idx_prod_grouped_items_parent ON prod_grouped_items(parent_product_id);
CREATE INDEX idx_prod_grouped_items_child ON prod_grouped_items(child_product_id);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP TABLE IF EXISTS prod_grouped_items CASCADE;
DROP TABLE IF EXISTS prod_variation_values CASCADE;
DROP TABLE IF EXISTS prod_variations CASCADE;`)
}
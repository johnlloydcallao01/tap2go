import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
-- Product Attributes (for variable products - e.g., Size, Color, Flavor)
-- ============================================
CREATE TABLE prod_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- "Size", "Color", "Flavor", etc.
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'select' CHECK (type IN ('select', 'color', 'button', 'radio')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT prod_attributes_slug_unique UNIQUE(slug)
);

CREATE INDEX idx_prod_attributes_slug ON prod_attributes(slug);


-- Product Attribute Terms (values for attributes - e.g., "Small", "Medium", "Large")
-- ============================================
CREATE TABLE prod_attribute_terms (
    id SERIAL PRIMARY KEY,
    attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Small", "Red", "Vanilla"
    slug VARCHAR(100) NOT NULL,
    value VARCHAR(100), -- for color type, stores hex code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT prod_attribute_terms_unique UNIQUE(attribute_id, slug)
);

CREATE INDEX idx_prod_attribute_terms_attribute ON prod_attribute_terms(attribute_id);
CREATE INDEX idx_prod_attribute_terms_slug ON prod_attribute_terms(slug);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP TABLE IF EXISTS prod_attribute_terms CASCADE;
DROP TABLE IF EXISTS prod_attributes CASCADE;`)
}
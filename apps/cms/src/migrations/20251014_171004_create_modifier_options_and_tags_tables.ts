import { sql } from '@payloadcms/db-postgres'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Product Modifiers/Add-ons Options
    -- ============================================
    CREATE TABLE modifier_options (
        id SERIAL PRIMARY KEY,
        modifier_group_id INTEGER NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price_adjustment NUMERIC(10, 2) DEFAULT 0.00,
        is_default BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_modifier_options_group ON modifier_options(modifier_group_id);


    -- Product Tags (for categorization, filtering, and search)
    -- ============================================
    CREATE TABLE prod_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7), -- hex color code for UI display (e.g., #FF5733)
        
        -- Tag Type/Category
        tag_type VARCHAR(50) DEFAULT 'general' CHECK (tag_type IN ('general', 'dietary', 'cuisine', 'promotion', 'feature', 'allergen', 'spice_level', 'temperature', 'size_category')),
        
        -- Hierarchy support (for nested tags)
        parent_tag_id INTEGER REFERENCES prod_tags(id) ON DELETE SET NULL,
        
        -- Usage tracking
        usage_count INTEGER DEFAULT 0, -- auto-updated via triggers
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE, -- for highlighting important tags
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT prod_tags_slug_unique UNIQUE(slug)
    );

    CREATE INDEX idx_prod_tags_slug ON prod_tags(slug);
    CREATE INDEX idx_prod_tags_tag_type ON prod_tags(tag_type);
    CREATE INDEX idx_prod_tags_parent ON prod_tags(parent_tag_id);
    CREATE INDEX idx_prod_tags_is_active ON prod_tags(is_active);
    CREATE INDEX idx_prod_tags_is_featured ON prod_tags(is_featured);
    CREATE INDEX idx_prod_tags_usage_count ON prod_tags(usage_count DESC);


    -- Product Tags Junction Table (Many-to-Many relationship)
    -- ============================================
    CREATE TABLE prod_tags_junction (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES prod_tags(id) ON DELETE CASCADE,
        
        -- Assignment tracking
        added_by_type VARCHAR(20) NOT NULL CHECK (added_by_type IN ('vendor', 'merchant', 'system')),
        added_by_vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
        added_by_merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
        
        -- Constraint to ensure proper assignment tracking
        CONSTRAINT chk_tag_assignment_tracking CHECK (
            (added_by_type = 'vendor' AND added_by_vendor_id IS NOT NULL AND added_by_merchant_id IS NULL) OR
            (added_by_type = 'merchant' AND added_by_merchant_id IS NOT NULL AND added_by_vendor_id IS NULL) OR
            (added_by_type = 'system' AND added_by_vendor_id IS NULL AND added_by_merchant_id IS NULL)
        ),
        
        -- Priority/Weight for tag importance (higher = more important)
        priority INTEGER DEFAULT 0,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT prod_tags_junction_unique UNIQUE(product_id, tag_id)
    );

    CREATE INDEX idx_prod_tags_junction_product ON prod_tags_junction(product_id);
    CREATE INDEX idx_prod_tags_junction_tag ON prod_tags_junction(tag_id);
    CREATE INDEX idx_prod_tags_junction_added_by_vendor ON prod_tags_junction(added_by_vendor_id);
    CREATE INDEX idx_prod_tags_junction_added_by_merchant ON prod_tags_junction(added_by_merchant_id);
    CREATE INDEX idx_prod_tags_junction_priority ON prod_tags_junction(priority DESC);
    CREATE INDEX idx_prod_tags_junction_is_active ON prod_tags_junction(is_active);
    CREATE INDEX idx_prod_tags_junction_created_at ON prod_tags_junction(created_at);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS prod_tags_junction;
    DROP TABLE IF EXISTS prod_tags;
    DROP TABLE IF EXISTS modifier_options;
  `)
}
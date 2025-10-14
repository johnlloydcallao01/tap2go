import { sql } from '@payloadcms/db-postgres'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Tag Groups (for organizing related tags)
    -- ============================================
    CREATE TABLE tag_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7), -- hex color for group display
        icon VARCHAR(50), -- icon class or name
        
        -- Display settings
        is_filterable BOOLEAN DEFAULT TRUE, -- show in filter UI
        is_searchable BOOLEAN DEFAULT TRUE, -- include in search
        display_order INTEGER DEFAULT 0,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT tag_groups_slug_unique UNIQUE(slug)
    );

    CREATE INDEX idx_tag_groups_slug ON tag_groups(slug);
    CREATE INDEX idx_tag_groups_is_active ON tag_groups(is_active);
    CREATE INDEX idx_tag_groups_display_order ON tag_groups(display_order);


    -- Tag Group Memberships (Many-to-Many: Tags can belong to multiple groups)
    -- ============================================
    CREATE TABLE tag_group_memberships (
        id SERIAL PRIMARY KEY,
        tag_group_id INTEGER NOT NULL REFERENCES tag_groups(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES prod_tags(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT tag_group_memberships_unique UNIQUE(tag_group_id, tag_id)
    );

    CREATE INDEX idx_tag_group_memberships_group ON tag_group_memberships(tag_group_id);
    CREATE INDEX idx_tag_group_memberships_tag ON tag_group_memberships(tag_id);
    CREATE INDEX idx_tag_group_memberships_sort ON tag_group_memberships(sort_order);


    -- ============================================
    -- TRIGGERS (matching your existing pattern)
    -- ============================================

    -- Drop existing triggers first to avoid conflicts
    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    DROP TRIGGER IF EXISTS update_vendor_products_updated_at ON vendor_products;
    DROP TRIGGER IF EXISTS update_merchant_products_updated_at ON merchant_products;
    DROP TRIGGER IF EXISTS update_prod_tags_updated_at ON prod_tags;
    DROP TRIGGER IF EXISTS update_tag_groups_updated_at ON tag_groups;
    DROP TRIGGER IF EXISTS update_tag_usage_on_insert ON prod_tags_junction;
    DROP TRIGGER IF EXISTS update_tag_usage_on_delete ON prod_tags_junction;

    -- Auto-update timestamps (if not already exists in your db)
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_products_updated_at 
        BEFORE UPDATE ON products 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_vendor_products_updated_at 
        BEFORE UPDATE ON vendor_products 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_merchant_products_updated_at 
        BEFORE UPDATE ON merchant_products 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_prod_tags_updated_at 
        BEFORE UPDATE ON prod_tags 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_tag_groups_updated_at 
        BEFORE UPDATE ON tag_groups 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


    -- Tag Usage Count Trigger (auto-update usage_count in prod_tags)
    -- ============================================
    CREATE OR REPLACE FUNCTION update_tag_usage_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE prod_tags 
            SET usage_count = usage_count + 1 
            WHERE id = NEW.tag_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE prod_tags 
            SET usage_count = GREATEST(usage_count - 1, 0) 
            WHERE id = OLD.tag_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_tag_usage_on_insert
        AFTER INSERT ON prod_tags_junction
        FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

    CREATE TRIGGER update_tag_usage_on_delete
        AFTER DELETE ON prod_tags_junction
        FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TRIGGER IF EXISTS update_tag_usage_on_delete ON prod_tags_junction;
    DROP TRIGGER IF EXISTS update_tag_usage_on_insert ON prod_tags_junction;
    DROP FUNCTION IF EXISTS update_tag_usage_count();
    
    DROP TRIGGER IF EXISTS update_tag_groups_updated_at ON tag_groups;
    DROP TRIGGER IF EXISTS update_prod_tags_updated_at ON prod_tags;
    DROP TRIGGER IF EXISTS update_merchant_products_updated_at ON merchant_products;
    DROP TRIGGER IF EXISTS update_vendor_products_updated_at ON vendor_products;
    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    DROP FUNCTION IF EXISTS update_updated_at_column();
    
    DROP TABLE IF EXISTS tag_group_memberships;
    DROP TABLE IF EXISTS tag_groups;
  `)
}
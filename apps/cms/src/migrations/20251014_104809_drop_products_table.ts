import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop products_media_images table indexes first
    DROP INDEX IF EXISTS products_media_images_order_idx;
    DROP INDEX IF EXISTS products_media_images_parent_id_idx;
    DROP INDEX IF EXISTS products_media_images_image_idx;
    
    -- Drop products_media_images table
    DROP TABLE IF EXISTS products_media_images CASCADE;
    
    -- Drop all products table indexes (if they exist)
    DROP INDEX IF EXISTS idx_products_created_by_vendor;
    DROP INDEX IF EXISTS idx_products_created_by_merchant;
    DROP INDEX IF EXISTS idx_products_category;
    DROP INDEX IF EXISTS idx_products_is_active;
    DROP INDEX IF EXISTS idx_products_primary_image;
    DROP INDEX IF EXISTS idx_products_created_at;
    DROP INDEX IF EXISTS idx_products_parent;
    DROP INDEX IF EXISTS idx_products_product_type;
    DROP INDEX IF EXISTS idx_products_sku;
    
    -- Drop the products table completely (CASCADE will handle foreign key constraints)
    DROP TABLE IF EXISTS products CASCADE;
    
    -- Drop any related enum types if they exist
    DROP TYPE IF EXISTS enum_products_product_type;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Recreate the products table with the original schema
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        
        -- Ownership tracking (FIX: Use dedicated FKs for data integrity)
        created_by_vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
        created_by_merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL,
        
        -- Constraint to enforce exactly one owner
        CONSTRAINT chk_one_owner_must_exist CHECK (
            (created_by_vendor_id IS NOT NULL AND created_by_merchant_id IS NULL) OR
            (created_by_vendor_id IS NULL AND created_by_merchant_id IS NOT NULL)
        ),
        
        -- Product Type (simple, variable, or group)
        product_type VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (product_type IN ('simple', 'variable', 'grouped')),
        parent_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- for variations, points to parent variable product
        
        -- Basic Info
        name VARCHAR(255) NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        category_id INTEGER REFERENCES prod_categories(id) ON DELETE SET NULL,
        
        -- SKU (unique to prevent duplicates)
        sku VARCHAR(100) UNIQUE,
        
        -- Pricing (for simple products and variations)
        base_price NUMERIC(10, 2) NOT NULL, -- every product must have a base price
        compare_at_price NUMERIC(10, 2), -- original price for showing discounts
        
        -- Media (using your existing media table pattern)
        image_ids JSONB, -- [1, 2, 3] array of media IDs
        primary_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_products_created_by_vendor ON products(created_by_vendor_id);
    CREATE INDEX idx_products_created_by_merchant ON products(created_by_merchant_id);
    CREATE INDEX idx_products_category ON products(category_id);
    CREATE INDEX idx_products_is_active ON products(is_active);
    CREATE INDEX idx_products_primary_image ON products(primary_image_id);
    CREATE INDEX idx_products_created_at ON products(created_at);
    CREATE INDEX idx_products_parent ON products(parent_id);
    CREATE INDEX idx_products_product_type ON products(product_type);
    CREATE INDEX idx_products_sku ON products(sku);
    
    -- Recreate products_media_images table
    CREATE TABLE products_media_images (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL,
        id CHARACTER VARYING NOT NULL,
        image_id INTEGER NOT NULL,
        CONSTRAINT products_media_images_pkey PRIMARY KEY (id),
        CONSTRAINT products_media_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE SET NULL
    );
    
    -- Recreate products_media_images indexes
    CREATE INDEX products_media_images_order_idx ON products_media_images USING btree (_order);
    CREATE INDEX products_media_images_parent_id_idx ON products_media_images USING btree (_parent_id);
    CREATE INDEX products_media_images_image_idx ON products_media_images USING btree (image_id);
  `)
}

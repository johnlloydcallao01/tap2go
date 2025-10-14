import { sql } from '@payloadcms/db-postgres'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Vendor Products (Products owned/managed by vendors)
    -- ============================================
    CREATE TABLE vendor_products (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        
        -- Cascade Settings
        auto_assign_to_new_merchants BOOLEAN DEFAULT FALSE,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT vendor_products_unique UNIQUE(vendor_id, product_id)
    );

    CREATE INDEX idx_vendor_products_vendor ON vendor_products(vendor_id);
    CREATE INDEX idx_vendor_products_product ON vendor_products(product_id);
    CREATE INDEX idx_vendor_products_created_at ON vendor_products(created_at);


    -- Merchant Products (Which merchants sell which products)
    -- ============================================
    CREATE TABLE merchant_products (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        
        -- Assignment tracking
        added_by VARCHAR(20) NOT NULL CHECK (added_by IN ('vendor', 'merchant')),
        
        -- Overrides (null = use product defaults)
        price_override NUMERIC(10, 2),
        
        -- Availability
        is_active BOOLEAN DEFAULT TRUE,
        is_available BOOLEAN DEFAULT TRUE, -- quick toggle on/off
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        
        CONSTRAINT merchant_products_unique UNIQUE(merchant_id, product_id)
    );

    CREATE INDEX idx_merchant_products_merchant ON merchant_products(merchant_id);
    CREATE INDEX idx_merchant_products_product ON merchant_products(product_id);
    CREATE INDEX idx_merchant_products_availability ON merchant_products(is_active, is_available);
    CREATE INDEX idx_merchant_products_created_at ON merchant_products(created_at);


    -- Product Modifiers/Add-ons Groups (e.g., "Size", "Extras")
    -- ============================================
    CREATE TABLE modifier_groups (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        selection_type VARCHAR(20) NOT NULL CHECK (selection_type IN ('single', 'multiple')),
        is_required BOOLEAN DEFAULT FALSE,
        min_selections INTEGER DEFAULT 0,
        max_selections INTEGER, -- null = unlimited
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_modifier_groups_product ON modifier_groups(product_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS modifier_groups;
    DROP TABLE IF EXISTS merchant_products;
    DROP TABLE IF EXISTS vendor_products;
  `)
}
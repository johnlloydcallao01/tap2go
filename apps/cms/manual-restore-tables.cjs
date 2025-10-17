const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URI
});

async function manualRestoreTables() {
    console.log('🔄 Starting manual table restoration...\n');
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        
        // 2. Product Attributes (for variable products - e.g., Size, Color, Flavor)
        console.log('📦 Creating prod_attributes table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_attributes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                type VARCHAR(20) NOT NULL DEFAULT 'select' CHECK (type IN ('select', 'color', 'button', 'radio')),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_attributes_slug_unique UNIQUE(slug)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_attributes_slug ON prod_attributes(slug);`);
        console.log('✅ prod_attributes created\n');

        // 3. Product Attribute Terms
        console.log('📦 Creating prod_attribute_terms table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_attribute_terms (
                id SERIAL PRIMARY KEY,
                attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                value VARCHAR(100),
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_attribute_terms_unique UNIQUE(attribute_id, slug)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_attribute_terms_attribute ON prod_attribute_terms(attribute_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_attribute_terms_slug ON prod_attribute_terms(slug);`);
        console.log('✅ prod_attribute_terms created\n');

        // 4. Product Variations
        console.log('📦 Creating prod_variations table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_variations (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
                is_required BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_variations_unique UNIQUE(product_id, attribute_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_variations_product ON prod_variations(product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_variations_attribute ON prod_variations(attribute_id);`);
        console.log('✅ prod_variations created\n');

        // 5. Product Variation Values
        console.log('📦 Creating prod_variation_values table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_variation_values (
                id SERIAL PRIMARY KEY,
                variation_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                attribute_id INTEGER NOT NULL REFERENCES prod_attributes(id) ON DELETE CASCADE,
                term_id INTEGER NOT NULL REFERENCES prod_attribute_terms(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_variation_values_unique UNIQUE(variation_product_id, attribute_id, term_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_variation_values_product ON prod_variation_values(variation_product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_variation_values_attribute ON prod_variation_values(attribute_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_variation_values_term ON prod_variation_values(term_id);`);
        console.log('✅ prod_variation_values created\n');

        // 6. Product Grouped Items
        console.log('📦 Creating prod_grouped_items table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_grouped_items (
                id SERIAL PRIMARY KEY,
                group_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                child_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_grouped_items_unique UNIQUE(group_product_id, child_product_id),
                CONSTRAINT chk_no_self_reference CHECK (group_product_id != child_product_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_grouped_items_group ON prod_grouped_items(group_product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_grouped_items_child ON prod_grouped_items(child_product_id);`);
        console.log('✅ prod_grouped_items created\n');

        // 7. Vendor Products
        console.log('📦 Creating vendor_products table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS vendor_products (
                id SERIAL PRIMARY KEY,
                vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                vendor_sku VARCHAR(100),
                vendor_price NUMERIC(10, 2),
                is_available BOOLEAN DEFAULT TRUE,
                stock_quantity INTEGER DEFAULT 0,
                min_order_quantity INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT vendor_products_unique UNIQUE(vendor_id, product_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor ON vendor_products(vendor_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vendor_products_product ON vendor_products(product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vendor_products_available ON vendor_products(is_available);`);
        console.log('✅ vendor_products created\n');

        // 8. Merchant Products
        console.log('📦 Creating merchant_products table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS merchant_products (
                id SERIAL PRIMARY KEY,
                merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                merchant_price NUMERIC(10, 2),
                is_featured BOOLEAN DEFAULT FALSE,
                is_available BOOLEAN DEFAULT TRUE,
                stock_quantity INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT merchant_products_unique UNIQUE(merchant_id, product_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant ON merchant_products(merchant_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_products_product ON merchant_products(product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_products_featured ON merchant_products(is_featured);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_merchant_products_available ON merchant_products(is_available);`);
        console.log('✅ merchant_products created\n');

        // 9. Modifier Groups
        console.log('📦 Creating modifier_groups table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS modifier_groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                is_required BOOLEAN DEFAULT FALSE,
                min_selections INTEGER DEFAULT 0,
                max_selections INTEGER DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ modifier_groups created\n');

        // 10. Modifier Options
        console.log('📦 Creating modifier_options table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS modifier_options (
                id SERIAL PRIMARY KEY,
                group_id INTEGER NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                price_adjustment NUMERIC(10, 2) DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_modifier_options_group ON modifier_options(group_id);`);
        console.log('✅ modifier_options created\n');

        // 11. Product Tags
        console.log('📦 Creating prod_tags table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                description TEXT,
                color VARCHAR(7),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_tags_slug_unique UNIQUE(slug)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_tags_slug ON prod_tags(slug);`);
        console.log('✅ prod_tags created\n');

        // 12. Product Tags Junction
        console.log('📦 Creating prod_tags_junction table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prod_tags_junction (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES prod_tags(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT prod_tags_junction_unique UNIQUE(product_id, tag_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_tags_junction_product ON prod_tags_junction(product_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_prod_tags_junction_tag ON prod_tags_junction(tag_id);`);
        console.log('✅ prod_tags_junction created\n');

        // 13. Tag Groups
        console.log('📦 Creating tag_groups table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tag_groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                description TEXT,
                color VARCHAR(7),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT tag_groups_slug_unique UNIQUE(slug)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tag_groups_slug ON tag_groups(slug);`);
        console.log('✅ tag_groups created\n');

        // 14. Tag Group Memberships
        console.log('📦 Creating tag_group_memberships table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tag_group_memberships (
                id SERIAL PRIMARY KEY,
                group_id INTEGER NOT NULL REFERENCES tag_groups(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES prod_tags(id) ON DELETE CASCADE,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT tag_group_memberships_unique UNIQUE(group_id, tag_id)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tag_group_memberships_group ON tag_group_memberships(group_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_tag_group_memberships_tag ON tag_group_memberships(tag_id);`);
        console.log('✅ tag_group_memberships created\n');

        console.log('🎉 All 13 product management tables created successfully!');
        
    } catch (error) {
        console.error('❌ Manual restoration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

// Run the manual restoration
if (require.main === module) {
    manualRestoreTables();
}

module.exports = { manualRestoreTables };
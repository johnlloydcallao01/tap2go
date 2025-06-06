/**
 * Neon PostgreSQL Database Client for Tap2Go
 * Direct connection to Neon database for CMS operations
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Configure WebSocket for Node.js environments (2024 best practice)
if (typeof window === 'undefined') {
  // Server-side: Use ws library for WebSocket support
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
  } catch {
    console.warn('WebSocket library not found. Install with: npm install ws');
  }
}

// Database connection configuration
const DATABASE_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true',
  poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000'),
};

/**
 * Neon Database Client Class
 * Provides direct PostgreSQL operations for CMS content
 */
export class NeonClient {
  private sql: ReturnType<typeof neon> | null;
  private pool: Pool | null;
  private isConnected: boolean;

  constructor() {
    this.sql = null;
    this.pool = null;
    this.isConnected = false;
    this.initializeConnection();
  }

  /**
   * Initialize database connection
   */
  private initializeConnection(): void {
    try {
      if (!DATABASE_CONFIG.connectionString) {
        console.warn('Neon DATABASE_URL not configured. CMS features will be limited.');
        return;
      }

      // Create Neon SQL client
      this.sql = neon(DATABASE_CONFIG.connectionString);
      
      // Create connection pool for better performance
      this.pool = new Pool({
        connectionString: DATABASE_CONFIG.connectionString,
        ssl: DATABASE_CONFIG.ssl,
        min: DATABASE_CONFIG.poolMin,
        max: DATABASE_CONFIG.poolMax,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: DATABASE_CONFIG.connectionTimeout,
      });

      this.isConnected = true;
      console.log('✅ Neon PostgreSQL client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Neon client:', error);
      this.isConnected = false;
    }
  }

  /**
   * Check if database is connected
   */
  isReady(): boolean {
    return this.isConnected && !!this.sql;
  }

  /**
   * Execute SQL query with parameters
   */
  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Neon database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Neon query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute query and return single row
   */
  async queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: (client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Connection pool not available');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('✅ Neon connection test successful:', result[0]);
      return true;
    } catch (error) {
      console.error('❌ Neon connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database information
   */
  async getDatabaseInfo(): Promise<Record<string, unknown>> {
    try {
      const [version, size, tables] = await Promise.all([
        this.queryOne('SELECT version()'),
        this.queryOne(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `),
        this.query(`
          SELECT table_name, table_type 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `)
      ]);

      return {
        version: version?.version,
        size: size?.size,
        tables: tables.map(t => ({ name: t.table_name, type: t.table_type })),
        connectionString: DATABASE_CONFIG.connectionString?.replace(/:[^:@]*@/, ':***@'), // Hide password
        isConnected: this.isConnected
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isConnected: false
      };
    }
  }

  /**
   * Create database schema for CMS
   */
  async createCMSSchema(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Database not connected');
    }

    const schemas = [
      // Restaurant content table
      `
        CREATE TABLE IF NOT EXISTS restaurant_contents (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          story TEXT,
          long_description TEXT,
          hero_image_url TEXT,
          gallery_images JSONB DEFAULT '[]',
          awards JSONB DEFAULT '[]',
          certifications JSONB DEFAULT '[]',
          special_features JSONB DEFAULT '[]',
          social_media JSONB DEFAULT '{}',
          seo_data JSONB DEFAULT '{}',
          is_published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Menu categories table
      `
        CREATE TABLE IF NOT EXISTS menu_categories (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE NOT NULL,
          restaurant_firebase_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Menu items table
      `
        CREATE TABLE IF NOT EXISTS menu_items (
          id SERIAL PRIMARY KEY,
          firebase_id VARCHAR(255) UNIQUE NOT NULL,
          category_firebase_id VARCHAR(255) NOT NULL,
          restaurant_firebase_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          detailed_description TEXT,
          short_description TEXT,
          images JSONB DEFAULT '[]',
          ingredients JSONB DEFAULT '[]',
          allergens JSONB DEFAULT '[]',
          nutritional_info JSONB DEFAULT '{}',
          preparation_steps JSONB DEFAULT '[]',
          chef_notes TEXT,
          tags JSONB DEFAULT '[]',
          is_vegetarian BOOLEAN DEFAULT false,
          is_vegan BOOLEAN DEFAULT false,
          is_gluten_free BOOLEAN DEFAULT false,
          spice_level VARCHAR(50),
          preparation_time INTEGER,
          seo_data JSONB DEFAULT '{}',
          is_published BOOLEAN DEFAULT false,
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Blog posts table
      `
        CREATE TABLE IF NOT EXISTS blog_posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          featured_image_url TEXT,
          author_name VARCHAR(255),
          author_bio TEXT,
          author_avatar_url TEXT,
          categories JSONB DEFAULT '[]',
          tags JSONB DEFAULT '[]',
          related_restaurants JSONB DEFAULT '[]',
          reading_time INTEGER,
          is_published BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          seo_data JSONB DEFAULT '{}',
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Promotions table
      `
        CREATE TABLE IF NOT EXISTS promotions (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          short_description TEXT,
          image_url TEXT,
          banner_image_url TEXT,
          promotion_type VARCHAR(50) NOT NULL,
          discount_type VARCHAR(50),
          discount_value DECIMAL(10,2),
          minimum_order_value DECIMAL(10,2),
          valid_from TIMESTAMP NOT NULL,
          valid_until TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT true,
          target_restaurants JSONB DEFAULT '[]',
          target_categories JSONB DEFAULT '[]',
          target_menu_items JSONB DEFAULT '[]',
          max_usage_per_user INTEGER,
          total_usage_limit INTEGER,
          current_usage_count INTEGER DEFAULT 0,
          promo_code VARCHAR(50),
          terms TEXT,
          seo_data JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Static pages table
      `
        CREATE TABLE IF NOT EXISTS static_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          is_published BOOLEAN DEFAULT false,
          show_in_navigation BOOLEAN DEFAULT false,
          navigation_order INTEGER,
          seo_data JSONB DEFAULT '{}',
          published_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `,
      
      // Homepage banners table
      `
        CREATE TABLE IF NOT EXISTS homepage_banners (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          description TEXT,
          image_url TEXT NOT NULL,
          mobile_image_url TEXT,
          cta_text VARCHAR(100),
          cta_link VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          show_on_mobile BOOLEAN DEFAULT true,
          show_on_desktop BOOLEAN DEFAULT true,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    ];

    try {
      await this.transaction(async (client) => {
        for (const schema of schemas) {
          await client.query(schema);
        }
      });

      // Create indexes for better performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_restaurant_contents_firebase_id ON restaurant_contents(firebase_id)',
        'CREATE INDEX IF NOT EXISTS idx_restaurant_contents_slug ON restaurant_contents(slug)',
        'CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories(restaurant_firebase_id)',
        'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_firebase_id)',
        'CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_firebase_id)',
        'CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)',
        'CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at)',
        'CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, valid_from, valid_until)',
        'CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug)',
        'CREATE INDEX IF NOT EXISTS idx_homepage_banners_active ON homepage_banners(is_active, sort_order)'
      ];

      for (const index of indexes) {
        await this.query(index);
      }

      console.log('✅ CMS database schema created successfully');
    } catch (error) {
      console.error('❌ Error creating CMS schema:', error);
      throw error;
    }
  }

  /**
   * Drop CMS schema (for development/testing)
   */
  async dropCMSSchema(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Database not connected');
    }

    const tables = [
      'homepage_banners',
      'static_pages', 
      'promotions',
      'blog_posts',
      'menu_items',
      'menu_categories',
      'restaurant_contents'
    ];

    try {
      for (const table of tables) {
        await this.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      }
      console.log('✅ CMS schema dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping CMS schema:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.isConnected = false;
    console.log('Neon database connection closed');
  }
}

// Export singleton instance
export const neonClient = new NeonClient();

// Export default client
export default neonClient;

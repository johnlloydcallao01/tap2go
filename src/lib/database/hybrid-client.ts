/**
 * Custom Database Client for Tap2Go
 * Direct Neon SQL for maximum performance and control
 *
 * Strategy:
 * - Use Direct SQL for all operations (performance-critical, full control)
 * - Custom CMS implementation without ORM dependencies
 * - Optimized for serverless environments
 */

import { neon, neonConfig, Pool, Client } from '@neondatabase/serverless';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Detect environment
const isVercel = process.env.VERCEL === '1';
const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || isVercel;

// Professional Vercel + Neon configuration
if (isVercel) {
  // Vercel-specific optimizations for Neon
  neonConfig.webSocketConstructor = undefined; // Force HTTP for Vercel
  neonConfig.useSecureWebSocket = false; // Disable WebSocket entirely
  neonConfig.pipelineConnect = false; // Disable connection pipelining
  console.log('✅ Vercel production mode configured for Neon');
} else if (typeof window === 'undefined' && !isServerless) {
  // Local development with WebSocket support
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
    console.log('✅ WebSocket configured for local development');
  } catch (error) {
    console.warn('WebSocket library not found. Install with: npm install ws');
  }
} else {
  // Other serverless environments
  neonConfig.webSocketConstructor = undefined;
  console.log('✅ HTTP-only mode configured for serverless environment');
}

/**
 * Custom Database Client Class
 * Provides Direct SQL access for maximum performance
 */
export class CustomDatabaseClient {
  private neonSql: ReturnType<typeof neon> | null;
  private neonPool: Pool | null = null;
  private neonClient: Client | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.neonSql = null;
    this.initializeClients();
  }

  /**
   * Helper function to execute Neon SQL with parameters
   * Fixed for Vercel production environment - uses direct neon() function
   */
  private async executeNeonSql<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
    if (!this.neonSql) {
      throw new Error('Neon SQL client not initialized');
    }

    console.log('🔍 executeNeonSql called:', {
      isServerless,
      isVercel,
      hasParams: params.length > 0,
      queryPreview: query.substring(0, 100) + '...'
    });

    if (isVercel || isServerless) {
      // For Vercel, always use the neon() function directly
      // This avoids the parameterized query issues
      console.log('🔍 Using Vercel-optimized neon() function execution');
      try {
        if (params.length === 0) {
          // No parameters - use template literal
          const result = await this.neonSql`${query}`;
          return result as T[];
        } else {
          // With parameters - manually substitute them into the query
          // This is safe because we control the input and use proper escaping
          let processedQuery = query;

          // Replace $1, $2, etc. with actual values
          for (let i = 0; i < params.length; i++) {
            const paramPlaceholder = `$${i + 1}`;
            let paramValue = params[i];

            // Properly escape the parameter based on its type
            if (paramValue === null || paramValue === undefined) {
              paramValue = 'NULL';
            } else if (typeof paramValue === 'string') {
              // Escape single quotes and wrap in quotes
              paramValue = `'${paramValue.replace(/'/g, "''")}'`;
            } else if (typeof paramValue === 'number') {
              paramValue = paramValue.toString();
            } else if (typeof paramValue === 'boolean') {
              paramValue = paramValue ? 'TRUE' : 'FALSE';
            } else {
              // For objects/arrays, stringify and escape
              paramValue = `'${JSON.stringify(paramValue).replace(/'/g, "''")}'`;
            }

            processedQuery = processedQuery.replace(paramPlaceholder, paramValue as string);
          }

          console.log('🔍 Processed query:', processedQuery.substring(0, 200) + '...');

          // Execute the processed query
          const result = await this.neonSql`${processedQuery}`;
          return result as T[];
        }
      } catch (error) {
        console.error('❌ Vercel neon() execution failed:', error);
        console.error('❌ Query was:', query);
        console.error('❌ Params were:', params);
        throw error;
      }
    } else {
      // Local development execution
      console.log('🔍 Using local development execution');
      if (params.length === 0) {
        const result = await this.neonSql`${query}`;
        return result as T[];
      } else {
        // Create a temporary client for parameterized queries
        const tempClient = new Client({
          connectionString: process.env.DATABASE_URL!,
          ssl: process.env.DATABASE_SSL === 'true',
        });
        await tempClient.connect();
        try {
          const result = await tempClient.query(query, params);
          return result.rows as T[];
        } finally {
          await tempClient.end();
        }
      }
    }
  }

  /**
   * Initialize Direct Neon client with Vercel production optimizations
   */
  private initializeClients(): void {
    try {
      // Try multiple environment variable sources for Vercel
      const connectionString = process.env.DATABASE_URL ||
                              process.env.POSTGRES_URL ||
                              process.env.DATABASE_URL_UNPOOLED;

      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required. Check Vercel environment variables.');
      }

      console.log('🔧 Initializing database client...', {
        isServerless,
        isVercel,
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!connectionString,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasUnpooledUrl: !!process.env.DATABASE_URL_UNPOOLED,
        connectionType: connectionString.includes('pooler') ? 'pooled' : 'direct'
      });

      // Initialize Direct Neon SQL client with Vercel optimizations
      if (isVercel) {
        // Use unpooled connection for Vercel if available
        const vercelConnectionString = process.env.DATABASE_URL_UNPOOLED || connectionString;
        this.neonSql = neon(vercelConnectionString);
        console.log('✅ Vercel-optimized Neon client initialized');
      } else {
        this.neonSql = neon(connectionString);
        console.log('✅ Standard Neon client initialized');
      }

      // Initialize Neon connection pool (only for non-serverless environments)
      if (!isServerless) {
        this.neonPool = new Pool({
          connectionString,
          ssl: process.env.DATABASE_SSL === 'true',
          min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
          max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
          connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000'),
        });
        console.log('✅ Connection pool initialized for local development');
      } else {
        // For serverless, we'll use the neon() function directly
        // No persistent client connection needed
        this.neonPool = null;
        this.neonClient = null;
        console.log('✅ Serverless mode configured - using neon() function directly');
      }

      this.isInitialized = true;
      console.log('✅ Custom Database Client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Custom Database Client:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query for performance-critical operations
   * Uses Neon's query method for parameterized queries
   */
  async sql<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
    if (!this.isInitialized) {
      throw new Error('Database client not initialized');
    }

    try {
      console.log('🔍 Executing SQL query...', {
        isServerless,
        hasPool: !!this.neonPool,
        hasNeonSql: !!this.neonSql,
        paramCount: params.length,
        queryPreview: query.substring(0, 100) + (query.length > 100 ? '...' : '')
      });

      if (this.neonPool && !isServerless) {
        // Use connection pool for local development
        const client = await this.neonPool.connect();
        try {
          const result = await client.query(query, params);
          console.log('✅ Query executed successfully via pool');
          return result.rows as T[];
        } finally {
          client.release();
        }
      } else {
        // Use direct SQL for serverless environments
        const result = await this.executeNeonSql<T>(query, params);
        console.log('✅ Query executed successfully via serverless client');
        return result;
      }
    } catch (error) {
      console.error('❌ SQL Query Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: query.substring(0, 200),
        params: params.length,
        isServerless,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  }

  /**
   * Execute single row SQL query
   */
  async sqlOne<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T | null> {
    const result = await this.sql<T>(query, params);
    return result[0] || null;
  }

  /**
   * Execute SQL query with transaction support
   */
  async transaction<T>(callback: (client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) => Promise<T>): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Database client not initialized');
    }

    if (this.neonPool && !isServerless) {
      // Use connection pool for local development
      const client = await this.neonPool.connect();
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
    } else {
      // For serverless, execute without explicit transactions (Neon handles this)
      const mockClient = {
        query: async (sql: string, params?: unknown[]) => {
          const result = await this.executeNeonSql(sql, params || []);
          return { rows: result };
        }
      };
      return await callback(mockClient);
    }
  }

  // ===== PERFORMANCE-CRITICAL QUERIES (Direct SQL) =====

  /**
   * Get popular restaurants with complex analytics
   * Uses direct SQL for optimal performance
   */
  async getPopularRestaurants(limit: number = 20, offset: number = 0) {
    return this.sql(`
      SELECT 
        r.*,
        COUNT(DISTINCT o.id) as total_orders,
        AVG(o."customerRating") as avg_rating,
        COUNT(DISTINCT rev.id) as review_count,
        AVG(rev.rating) as review_rating,
        COALESCE(SUM(o.total), 0) as total_revenue
      FROM tap2go_restaurants r
      LEFT JOIN tap2go_orders o ON r.id = o."restaurantId" 
        AND o.status = 'DELIVERED'
        AND o."deliveredAt" >= NOW() - INTERVAL '30 days'
      LEFT JOIN tap2go_reviews rev ON r.id = rev."restaurantId"
        AND rev."isVisible" = true
      WHERE r."isActive" = true
      GROUP BY r.id
      ORDER BY 
        total_orders DESC,
        avg_rating DESC NULLS LAST,
        review_rating DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
  }

  /**
   * Get restaurant analytics dashboard data
   * Complex query optimized for performance
   */
  async getRestaurantAnalytics(restaurantId: string, days: number = 30) {
    return this.sql(`
      WITH daily_stats AS (
        SELECT 
          DATE(o."deliveredAt") as order_date,
          COUNT(*) as orders_count,
          SUM(o.total) as revenue,
          AVG(o."customerRating") as avg_rating
        FROM tap2go_orders o
        WHERE o."restaurantId" = $1
          AND o.status = 'DELIVERED'
          AND o."deliveredAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(o."deliveredAt")
      ),
      popular_items AS (
        SELECT 
          mi.name,
          mi.id,
          COUNT(oi.id) as order_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi."totalPrice") as total_revenue
        FROM tap2go_menu_items mi
        JOIN tap2go_order_items oi ON mi.id = oi."menuItemId"
        JOIN tap2go_orders o ON oi."orderId" = o.id
        WHERE mi."restaurantId" = $1
          AND o.status = 'DELIVERED'
          AND o."deliveredAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY mi.id, mi.name
        ORDER BY order_count DESC
        LIMIT 10
      )
      SELECT 
        (SELECT json_agg(daily_stats) FROM daily_stats) as daily_stats,
        (SELECT json_agg(popular_items) FROM popular_items) as popular_items,
        (
          SELECT json_build_object(
            'total_orders', COUNT(*),
            'total_revenue', COALESCE(SUM(total), 0),
            'avg_order_value', COALESCE(AVG(total), 0),
            'avg_rating', COALESCE(AVG("customerRating"), 0)
          )
          FROM tap2go_orders 
          WHERE "restaurantId" = $1 
            AND status = 'DELIVERED'
            AND "deliveredAt" >= NOW() - INTERVAL '${days} days'
        ) as summary_stats
    `, [restaurantId]);
  }

  /**
   * Search restaurants with complex filtering and ranking
   * Uses full-text search and geolocation
   */
  async searchRestaurants(params: {
    query?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    cuisineTypes?: string[];
    minRating?: number;
    maxDeliveryFee?: number;
    isOpen?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const {
      query,
      latitude,
      longitude,
      radius = 10,
      cuisineTypes,
      minRating,
      maxDeliveryFee,
      isOpen,
      limit = 20,
      offset = 0
    } = params;

    const whereConditions = ['r."isActive" = true'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    // Text search
    if (query) {
      whereConditions.push(`(
        r.name ILIKE $${paramIndex} OR 
        r.description ILIKE $${paramIndex} OR 
        EXISTS (
          SELECT 1 FROM tap2go_menu_items mi 
          WHERE mi."restaurantId" = r.id 
          AND mi.name ILIKE $${paramIndex}
        )
      )`);
      queryParams.push(`%${query}%`);
      paramIndex++;
    }

    // Geolocation filter
    if (latitude && longitude) {
      whereConditions.push(`
        ST_DWithin(
          ST_Point(
            CAST(r.coordinates->>'longitude' AS FLOAT),
            CAST(r.coordinates->>'latitude' AS FLOAT)
          )::geography,
          ST_Point($${paramIndex}, $${paramIndex + 1})::geography,
          $${paramIndex + 2} * 1000
        )
      `);
      queryParams.push(longitude, latitude, radius);
      paramIndex += 3;
    }

    // Cuisine type filter
    if (cuisineTypes && cuisineTypes.length > 0) {
      whereConditions.push(`r."cuisineType" && $${paramIndex}`);
      queryParams.push(cuisineTypes);
      paramIndex++;
    }

    // Rating filter
    if (minRating) {
      whereConditions.push(`r.rating >= $${paramIndex}`);
      queryParams.push(minRating);
      paramIndex++;
    }

    // Delivery fee filter
    if (maxDeliveryFee) {
      whereConditions.push(`r."deliveryFee" <= $${paramIndex}`);
      queryParams.push(maxDeliveryFee);
      paramIndex++;
    }

    // Add limit and offset
    queryParams.push(limit, offset);

    const sqlQuery = `
      SELECT 
        r.*,
        COUNT(DISTINCT o.id) as recent_orders,
        AVG(rev.rating) as review_rating,
        COUNT(DISTINCT rev.id) as review_count
        ${latitude && longitude ? `, 
        ST_Distance(
          ST_Point(
            CAST(r.coordinates->>'longitude' AS FLOAT),
            CAST(r.coordinates->>'latitude' AS FLOAT)
          )::geography,
          ST_Point($2, $1)::geography
        ) / 1000 as distance_km` : ''}
      FROM tap2go_restaurants r
      LEFT JOIN tap2go_orders o ON r.id = o."restaurantId" 
        AND o.status = 'DELIVERED'
        AND o."deliveredAt" >= NOW() - INTERVAL '7 days'
      LEFT JOIN tap2go_reviews rev ON r.id = rev."restaurantId"
        AND rev."isVisible" = true
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY r.id
      ORDER BY 
        recent_orders DESC,
        review_rating DESC NULLS LAST,
        r.rating DESC NULLS LAST
        ${latitude && longitude ? ', distance_km ASC' : ''}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    return this.sql(sqlQuery, queryParams);
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    if (this.neonPool && !isServerless) {
      await this.neonPool.end();
      console.log('Database pool connections closed');
    }
    if (this.neonClient && isServerless) {
      await this.neonClient.end();
      console.log('Database client connection closed');
    }
    if (!this.neonPool && !this.neonClient) {
      console.log('No persistent connections to close');
    }
  }
}

// Export singleton instance
export const db = new CustomDatabaseClient();

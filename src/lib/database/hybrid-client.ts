/**
 * Hybrid Database Client for Tap2Go
 * Combines Prisma ORM with Direct Neon SQL for maximum scalability
 * 
 * Strategy:
 * - Use Prisma for 80% of operations (CRUD, type safety, developer experience)
 * - Use Direct SQL for 20% of operations (performance-critical, complex queries)
 */

import { PrismaClient } from '@prisma/client';
import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Configure WebSocket for Node.js environments
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    console.warn('WebSocket library not found. Install with: npm install ws');
  }
}

/**
 * Hybrid Database Client Class
 * Provides both Prisma ORM and Direct SQL access
 */
export class HybridDatabaseClient {
  private prisma!: PrismaClient;
  private neonSql: ReturnType<typeof neon> | null;
  private neonPool!: Pool;
  private isInitialized: boolean = false;

  constructor() {
    this.neonSql = null;
    this.initializeClients();
  }

  /**
   * Initialize both Prisma and Direct Neon clients
   */
  private initializeClients(): void {
    try {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      // Initialize Direct Neon SQL client
      this.neonSql = neon(connectionString);
      
      // Initialize Neon connection pool
      this.neonPool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'true',
        min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
        max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
      });

      // Initialize Prisma with Neon adapter using Pool config
      const adapter = new PrismaNeon({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'true',
        min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
        max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
      });
      this.prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
      });

      this.isInitialized = true;
      console.log('✅ Hybrid Database Client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Hybrid Database Client:', error);
      throw error;
    }
  }

  /**
   * Get Prisma client for standard ORM operations
   */
  get orm(): PrismaClient {
    if (!this.isInitialized) {
      throw new Error('Database client not initialized');
    }
    return this.prisma;
  }

  /**
   * Execute raw SQL query for performance-critical operations
   * Uses Neon's query method for parameterized queries
   */
  async sql<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
    if (!this.isInitialized) {
      throw new Error('Database client not initialized');
    }

    const client = await this.neonPool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows as T[];
    } catch (error) {
      console.error('SQL Query Error:', error);
      throw error;
    } finally {
      client.release();
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
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    if (this.neonPool) {
      await this.neonPool.end();
    }
    console.log('Database connections closed');
  }
}

// Export singleton instance
export const db = new HybridDatabaseClient();

// Export types for use in other files
export type { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

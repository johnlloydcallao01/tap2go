import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req: _req }: MigrateUpArgs): Promise<void> {
  console.log('🚀 Starting performance optimization migration...')

  // Create performance indexes for merchants table
  await payload.db.drizzle.execute(sql`
    -- Index for operational_status filtering (frequently used in queries)
    CREATE INDEX IF NOT EXISTS "merchants_operational_status_idx" 
    ON "merchants" ("operational_status");
  `)

  await payload.db.drizzle.execute(sql`
    -- Composite index for location-based queries with operational status
    CREATE INDEX IF NOT EXISTS "merchants_coordinates_operational_idx" 
    ON "merchants" USING gist ("merchant_coordinates") 
    WHERE "operational_status" = 'active';
  `)

  await payload.db.drizzle.execute(sql`
    -- Index for merchant_id lookups (used in joins)
    CREATE INDEX IF NOT EXISTS "merchants_id_operational_idx" 
    ON "merchants" ("id", "operational_status");
  `)

  // Create performance indexes for users table (API key validation)
  await payload.db.drizzle.execute(sql`
    -- Index for API key lookups with role filtering
    CREATE INDEX IF NOT EXISTS "users_api_key_role_idx" 
    ON "users" ("api_key", "role") 
    WHERE "api_key" IS NOT NULL AND "role" IN ('service', 'admin');
  `)

  await payload.db.drizzle.execute(sql`
    -- Index for active users with API keys
    CREATE INDEX IF NOT EXISTS "users_api_key_active_idx" 
    ON "users" ("api_key") 
    WHERE "api_key" IS NOT NULL AND "is_active" = true;
  `)

  // Create performance indexes for addresses table (customer lookups)
  await payload.db.drizzle.execute(sql`
    -- Index for customer address lookups
    CREATE INDEX IF NOT EXISTS "addresses_customer_id_idx" 
    ON "addresses" ("customer_id");
  `)

  await payload.db.drizzle.execute(sql`
    -- Index for address coordinates (if used in distance calculations)
    CREATE INDEX IF NOT EXISTS "addresses_coordinates_idx" 
    ON "addresses" ("latitude", "longitude") 
    WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;
  `)

  // Create performance indexes for customers table
  await payload.db.drizzle.execute(sql`
    -- Index for customer ID lookups
    CREATE INDEX IF NOT EXISTS "customers_id_active_idx" 
    ON "customers" ("id") 
    WHERE "is_active" = true;
  `)

  // Analyze tables to update statistics for query planner
  await payload.db.drizzle.execute(sql`
    ANALYZE "merchants";
    ANALYZE "users";
    ANALYZE "addresses";
    ANALYZE "customers";
  `)

  console.log('✅ Performance optimization migration completed successfully!')
}

export async function down({ payload, req: _req }: MigrateDownArgs): Promise<void> {
  console.log('🔄 Rolling back performance optimization migration...')

  // Drop all created indexes
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "merchants_operational_status_idx";
    DROP INDEX IF EXISTS "merchants_coordinates_operational_idx";
    DROP INDEX IF EXISTS "merchants_id_operational_idx";
    DROP INDEX IF EXISTS "users_api_key_role_idx";
    DROP INDEX IF EXISTS "users_api_key_active_idx";
    DROP INDEX IF EXISTS "addresses_customer_id_idx";
    DROP INDEX IF EXISTS "addresses_coordinates_idx";
    DROP INDEX IF EXISTS "customers_id_active_idx";
  `)

  console.log('✅ Performance optimization migration rollback completed!')
}
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop foreign key constraint first
    ALTER TABLE "courses_prerequisites" DROP CONSTRAINT IF EXISTS "courses_prerequisites_parent_id_fk";
    
    -- Drop indexes
    DROP INDEX IF EXISTS "courses_prerequisites_order_idx";
    DROP INDEX IF EXISTS "courses_prerequisites_parent_id_idx";
    
    -- Drop the table
    DROP TABLE IF EXISTS "courses_prerequisites";
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Recreate the courses_prerequisites table
    CREATE TABLE IF NOT EXISTS "courses_prerequisites" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "prerequisite" varchar NOT NULL
    );
    
    -- Recreate indexes
    CREATE INDEX IF NOT EXISTS "courses_prerequisites_order_idx" ON "courses_prerequisites" ("_order");
    CREATE INDEX IF NOT EXISTS "courses_prerequisites_parent_id_idx" ON "courses_prerequisites" ("_parent_id");
    
    -- Recreate foreign key constraint
    ALTER TABLE "courses_prerequisites" 
    ADD CONSTRAINT "courses_prerequisites_parent_id_fk" 
    FOREIGN KEY ("_parent_id") REFERENCES "courses"("id") ON DELETE CASCADE;
  `)
}
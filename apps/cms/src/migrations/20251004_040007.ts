import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Check if instructors table exists before trying to drop it
  const instructorsTableExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'instructors'
    );
  `)
  
  if ((instructorsTableExists as unknown as { exists: boolean }[])[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE "instructors" DISABLE ROW LEVEL SECURITY;
      DROP TABLE "instructors" CASCADE;
    `)
  }
  
  // Check if the constraint exists before trying to drop it
  const constraintExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'payload_locked_documents_rels_instructors_fk'
    );
  `)
  
  if ((constraintExists as unknown as { exists: boolean }[])[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructors_fk";
    `)
  }
  
  // First, update any existing 'instructor' roles to 'admin' before changing the enum
  await db.execute(sql`
    UPDATE "users" SET "role" = 'admin' WHERE "role" = 'instructor';
  `)
  
  // Update users role enum
  await db.execute(sql`
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'::text;
    DROP TYPE IF EXISTS "public"."enum_users_role";
    CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'customer', 'service');
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'::"public"."enum_users_role";
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  `)
  
  // Check if index exists before dropping
  const indexExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM pg_indexes 
      WHERE indexname = 'payload_locked_documents_rels_instructors_id_idx'
    );
  `)
  
  if ((indexExists as unknown as { exists: boolean }[])[0]?.exists) {
    await db.execute(sql`
      DROP INDEX "payload_locked_documents_rels_instructors_id_idx";
    `)
  }
  
  // Check if column exists before dropping
  const columnExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'payload_locked_documents_rels' 
      AND column_name = 'instructors_id'
    );
  `)
  
  if ((columnExists as unknown as { exists: boolean }[])[0]?.exists) {
    await db.execute(sql`
      ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructors_id";
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_role" ADD VALUE 'instructor' BEFORE 'customer';
  CREATE TABLE "instructors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"specialization" varchar NOT NULL,
  	"years_experience" numeric,
  	"certifications" varchar,
  	"office_hours" varchar,
  	"contact_email" varchar,
  	"teaching_permissions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructors_id" integer;
  ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "instructors_user_idx" ON "instructors" USING btree ("user_id");
  CREATE INDEX "instructors_updated_at_idx" ON "instructors" USING btree ("updated_at");
  CREATE INDEX "instructors_created_at_idx" ON "instructors" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_instructors_id_idx" ON "payload_locked_documents_rels" USING btree ("instructors_id");`)
}

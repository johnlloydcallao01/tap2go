import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Drop constraints only if they exist
  await db.execute(sql`
    DO $$ 
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payload_locked_documents_rels_courses_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payload_locked_documents_rels_course_categories_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_categories_fk";
        END IF;
    END $$;
  `);

  // Drop indexes only if they exist
  await db.execute(sql`DROP INDEX IF EXISTS "payload_locked_documents_rels_courses_id_idx";`);
  await db.execute(sql`DROP INDEX IF EXISTS "payload_locked_documents_rels_course_categories_id_idx";`);

  // Drop columns only if they exist
  await db.execute(sql`
    DO $$ 
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'courses_id') THEN
            ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'course_categories_id') THEN
            ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_categories_id";
        END IF;
    END $$;
  `);

  // Drop tables only if they exist
  await db.execute(sql`
    DO $$ 
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
            ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;
            DROP TABLE "courses" CASCADE;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_categories') THEN
            ALTER TABLE "course_categories" DISABLE ROW LEVEL SECURITY;
            DROP TABLE "course_categories" CASCADE;
        END IF;
    END $$;
  `);

  // Drop enum types only if they exist
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_courses_difficulty_level";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_courses_language";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_courses_status";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_course_categories_category_type";`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_courses_language" AS ENUM('en', 'es', 'fr', 'de');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_course_categories_category_type" AS ENUM('course', 'skill', 'topic', 'industry');
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"course_code" varchar NOT NULL,
  	"excerpt" varchar,
  	"description" jsonb,
  	"instructor_id" integer NOT NULL,
  	"category_id" integer,
  	"thumbnail_id" integer,
  	"banner_image_id" integer,
  	"price" numeric DEFAULT 0,
  	"discounted_price" numeric,
  	"max_students" numeric,
  	"enrollment_start_date" timestamp(3) with time zone,
  	"enrollment_end_date" timestamp(3) with time zone,
  	"course_start_date" timestamp(3) with time zone,
  	"course_end_date" timestamp(3) with time zone,
  	"estimated_duration" numeric,
  	"difficulty_level" "enum_courses_difficulty_level" DEFAULT 'beginner',
  	"language" "enum_courses_language" DEFAULT 'en',
  	"passing_grade" numeric DEFAULT 70,
  	"prerequisites" jsonb,
  	"status" "enum_courses_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"settings" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"parent_id" integer,
  	"category_type" "enum_course_categories_category_type" DEFAULT 'course' NOT NULL,
  	"icon_id" integer,
  	"color_code" varchar,
  	"display_order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_categories_id" integer;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_parent_id_course_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "courses_course_code_idx" ON "courses" USING btree ("course_code");
  CREATE INDEX "courses_instructor_idx" ON "courses" USING btree ("instructor_id");
  CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category_id");
  CREATE INDEX "courses_thumbnail_idx" ON "courses" USING btree ("thumbnail_id");
  CREATE INDEX "courses_banner_image_idx" ON "courses" USING btree ("banner_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE UNIQUE INDEX "course_categories_slug_idx" ON "course_categories" USING btree ("slug");
  CREATE INDEX "course_categories_parent_idx" ON "course_categories" USING btree ("parent_id");
  CREATE INDEX "course_categories_icon_idx" ON "course_categories" USING btree ("icon_id");
  CREATE INDEX "course_categories_updated_at_idx" ON "course_categories" USING btree ("updated_at");
  CREATE INDEX "course_categories_created_at_idx" ON "course_categories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_categories_fk" FOREIGN KEY ("course_categories_id") REFERENCES "public"."course_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_course_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("course_categories_id");`)
}

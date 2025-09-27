import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');
   CREATE TYPE "public"."enum_courses_language" AS ENUM('en', 'id');
   CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published', 'archived');
   
   CREATE TABLE IF NOT EXISTS "courses" (
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
    "max_students" numeric,
    "enrollment_start_date" timestamp(3) with time zone,
    "enrollment_end_date" timestamp(3) with time zone,
    "course_start_date" timestamp(3) with time zone,
    "course_end_date" timestamp(3) with time zone,
    "estimated_duration" numeric,
    "difficulty_level" "enum_courses_difficulty_level" DEFAULT 'beginner',
    "language" "enum_courses_language" DEFAULT 'en',
    "passing_grade" numeric DEFAULT 70,
    "status" "enum_courses_status" DEFAULT 'draft' NOT NULL,
    "published_at" timestamp(3) with time zone,
    "settings" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );
   
   CREATE UNIQUE INDEX "courses_course_code_idx" ON "courses" ("course_code");
   CREATE INDEX "courses_instructor_idx" ON "courses" ("instructor_id");
   CREATE INDEX "courses_category_idx" ON "courses" ("category_id");
   CREATE INDEX "courses_thumbnail_idx" ON "courses" ("thumbnail_id");
   CREATE INDEX "courses_banner_image_idx" ON "courses" ("banner_image_id");
   CREATE INDEX "courses_status_idx" ON "courses" ("status");
   CREATE INDEX "courses_published_at_idx" ON "courses" ("published_at");
   CREATE INDEX "courses_created_at_idx" ON "courses" ("created_at");
   CREATE INDEX "courses_updated_at_idx" ON "courses" ("updated_at");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses";
   DROP TYPE "public"."enum_courses_difficulty_level";
   DROP TYPE "public"."enum_courses_language";
   DROP TYPE "public"."enum_courses_status";`)
}
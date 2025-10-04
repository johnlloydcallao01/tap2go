import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
    // Drop foreign key constraint from payload_locked_documents_rels first
    await db.execute(sql`
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'payload_locked_documents_rels_instructors_fk'
                AND table_name = 'payload_locked_documents_rels'
            ) THEN
                ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructors_fk";
            END IF;
        END $$;
    `);

    // Remove instructors_id column from payload_locked_documents_rels
    await db.execute(sql`
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'payload_locked_documents_rels' 
                AND column_name = 'instructors_id'
            ) THEN
                ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructors_id";
            END IF;
        END $$;
    `);

    // Drop the instructors table
    await db.execute(sql`
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'instructors'
            ) THEN
                DROP TABLE "instructors";
            END IF;
        END $$;
    `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
    // Recreate the instructors table
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "instructors" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL,
            "specialization" varchar NOT NULL,
            "years_experience" numeric,
            "certifications" varchar,
            "office_hours" varchar,
            "contact_email" varchar,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "teaching_permissions" jsonb
        );
    `);

    // Add foreign key constraint
    await db.execute(sql`
        ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
    `);

    // Add instructors_id column back to payload_locked_documents_rels
    await db.execute(sql`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'payload_locked_documents_rels' 
                AND column_name = 'instructors_id'
            ) THEN
                ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructors_id" integer;
            END IF;
        END $$;
    `);

    // Add foreign key constraint back
    await db.execute(sql`
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "instructors"("id") ON DELETE cascade ON UPDATE no action;
    `);
}

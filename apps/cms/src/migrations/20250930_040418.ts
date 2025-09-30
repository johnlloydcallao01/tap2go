import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Drop the table if it exists
   DROP TABLE IF EXISTS "user_certifications" CASCADE;
   
   -- Drop constraint if it exists
   DO $$ 
   BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'payload_locked_documents_rels_user_certifications_fk') THEN
       ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_certifications_fk";
     END IF;
   END $$;
   
   -- Drop index if it exists
   DROP INDEX IF EXISTS "payload_locked_documents_rels_user_certifications_id_idx";
   
   -- Drop column if it exists
   DO $$ 
   BEGIN
     IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'payload_locked_documents_rels' 
                AND column_name = 'user_certifications_id') THEN
       ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_certifications_id";
     END IF;
   END $$;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "user_certifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"certification_name" varchar NOT NULL,
  	"issuing_authority" varchar,
  	"issue_date" timestamp(3) with time zone,
  	"expiry_date" timestamp(3) with time zone,
  	"verification_url" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_certifications_id" integer;
  ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "user_certifications_user_idx" ON "user_certifications" USING btree ("user_id");
  CREATE INDEX "user_certifications_updated_at_idx" ON "user_certifications" USING btree ("updated_at");
  CREATE INDEX "user_certifications_created_at_idx" ON "user_certifications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_certifications_fk" FOREIGN KEY ("user_certifications_id") REFERENCES "public"."user_certifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_user_certifications_id_idx" ON "payload_locked_documents_rels" USING btree ("user_certifications_id");`)
}

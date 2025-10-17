import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add prod_attribute_terms column to payload_locked_documents_rels table
    ALTER TABLE "payload_locked_documents_rels" 
    ADD COLUMN IF NOT EXISTS "prod_attribute_terms_id" INTEGER;

    -- Create foreign key constraint for prod_attribute_terms relationship
    ALTER TABLE "payload_locked_documents_rels" 
    ADD CONSTRAINT IF NOT EXISTS "payload_locked_documents_rels_prod_attribute_terms_fk" 
    FOREIGN KEY ("prod_attribute_terms_id") 
    REFERENCES "prod_attribute_terms"("id") 
    ON DELETE CASCADE ON UPDATE NO ACTION;

    -- Create index for the new prod_attribute_terms relationship
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_prod_attribute_terms_id_idx" 
    ON "payload_locked_documents_rels" USING btree ("prod_attribute_terms_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Remove the index
    DROP INDEX IF EXISTS "payload_locked_documents_rels_prod_attribute_terms_id_idx";

    -- Remove the foreign key constraint
    ALTER TABLE "payload_locked_documents_rels" 
    DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_prod_attribute_terms_fk";

    -- Remove the column
    ALTER TABLE "payload_locked_documents_rels" 
    DROP COLUMN IF EXISTS "prod_attribute_terms_id";
  `)
}
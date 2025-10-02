import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
        -- Rename trainees table to customers
        ALTER TABLE "trainees" RENAME TO "customers";
        
        -- Update payload_locked_documents_rels table to reference customers
        ALTER TABLE "payload_locked_documents_rels" 
        RENAME COLUMN "trainees_id" TO "customers_id";
        
        -- Update constraint names
        ALTER TABLE "payload_locked_documents_rels" 
        DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_trainees_fk";
        
        ALTER TABLE "payload_locked_documents_rels" 
        ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" 
            FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") 
            ON DELETE cascade ON UPDATE no action;
        
        -- Update index names
        DROP INDEX IF EXISTS "payload_locked_documents_rels_trainees_id_idx";
        CREATE INDEX "payload_locked_documents_rels_customers_id_idx" 
            ON "payload_locked_documents_rels" USING btree ("customers_id");
    `);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
        -- Reverse index names
        DROP INDEX IF EXISTS "payload_locked_documents_rels_customers_id_idx";
        CREATE INDEX "payload_locked_documents_rels_trainees_id_idx" 
            ON "payload_locked_documents_rels" USING btree ("trainees_id");
        
        -- Reverse constraint names
        ALTER TABLE "payload_locked_documents_rels" 
        DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_customers_fk";
        
        ALTER TABLE "payload_locked_documents_rels" 
        ADD CONSTRAINT "payload_locked_documents_rels_trainees_fk" 
            FOREIGN KEY ("trainees_id") REFERENCES "public"."trainees"("id") 
            ON DELETE cascade ON UPDATE no action;
        
        -- Reverse payload_locked_documents_rels table
        ALTER TABLE "payload_locked_documents_rels" 
        RENAME COLUMN "customers_id" TO "trainees_id";
        
        -- Reverse trainees table to customers
        ALTER TABLE "customers" RENAME TO "trainees";
    `);
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" ADD COLUMN "active_address_id" integer;
  ALTER TABLE "customers" ADD CONSTRAINT "customers_active_address_id_addresses_id_fk" FOREIGN KEY ("active_address_id") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "customers_active_address_idx" ON "customers" USING btree ("active_address_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" DROP CONSTRAINT "customers_active_address_id_addresses_id_fk";
  
  DROP INDEX "customers_active_address_idx";
  ALTER TABLE "customers" DROP COLUMN "active_address_id";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vendors" ADD COLUMN "user_id" integer;
  ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "vendors_user_idx" ON "vendors" USING btree ("user_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "vendors" DROP CONSTRAINT "vendors_user_id_users_id_fk";
  
  DROP INDEX "vendors_user_idx";
  ALTER TABLE "vendors" DROP COLUMN "user_id";`)
}

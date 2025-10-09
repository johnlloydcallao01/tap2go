import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "merchant_latitude" numeric;
  ALTER TABLE "merchants" ADD COLUMN "merchant_longitude" numeric;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" DROP COLUMN "merchant_latitude";
  ALTER TABLE "merchants" DROP COLUMN "merchant_longitude";`)
}

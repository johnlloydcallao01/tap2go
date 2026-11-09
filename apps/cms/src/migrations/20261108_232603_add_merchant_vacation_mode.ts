import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "vacation_mode" boolean DEFAULT false;
  ALTER TABLE "merchants" ADD COLUMN "vacation_mode_ends_at" timestamp(3) with time zone;
  CREATE INDEX "vacationMode_vacationModeEndsAt_idx" ON "merchants" USING btree ("vacation_mode","vacation_mode_ends_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "vacationMode_vacationModeEndsAt_idx";
  ALTER TABLE "merchants" DROP COLUMN "vacation_mode";
  ALTER TABLE "merchants" DROP COLUMN "vacation_mode_ends_at";`)
}

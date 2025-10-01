import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" ADD COLUMN "media_thumbnail_id" integer;
  ALTER TABLE "merchants" ADD CONSTRAINT "merchants_media_thumbnail_id_media_id_fk" FOREIGN KEY ("media_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "merchants_media_media_thumbnail_idx" ON "merchants" USING btree ("media_thumbnail_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "merchants" DROP CONSTRAINT "merchants_media_thumbnail_id_media_id_fk";
  
  DROP INDEX "merchants_media_media_thumbnail_idx";
  ALTER TABLE "merchants" DROP COLUMN "media_thumbnail_id";`)
}

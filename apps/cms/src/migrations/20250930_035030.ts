import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses_learning_objectives" CASCADE;`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "courses_learning_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"objective" varchar NOT NULL
  );
  
  ALTER TABLE "courses_learning_objectives" ADD CONSTRAINT "courses_learning_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_learning_objectives_order_idx" ON "courses_learning_objectives" USING btree ("_order");
  CREATE INDEX "courses_learning_objectives_parent_id_idx" ON "courses_learning_objectives" USING btree ("_parent_id");`)
}

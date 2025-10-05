import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add the user_id column as nullable first
  await db.execute(sql`
    ALTER TABLE "vendors" ADD COLUMN "user_id" integer;
  `)

  // Step 2: Create the foreign key constraint
  await db.execute(sql`
    ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `)

  // Step 3: Create the unique index
  await db.execute(sql`
    CREATE UNIQUE INDEX "vendors_user_idx" ON "vendors" USING btree ("user_id");
  `)

  console.log('✅ Added user_id column to vendors table with proper constraints')
  console.log('⚠️  Note: Existing vendor records will have NULL user_id values')
  console.log('⚠️  You will need to manually associate existing vendors with user accounts')
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "vendors" DROP CONSTRAINT "vendors_user_id_users_id_fk";
    DROP INDEX "vendors_user_idx";
    ALTER TABLE "vendors" DROP COLUMN "user_id";
  `)
}
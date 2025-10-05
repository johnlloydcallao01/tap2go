import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Make user_id column nullable to handle existing vendor records
    await db.execute(sql`
      ALTER TABLE "vendors" ALTER COLUMN "user_id" DROP NOT NULL;
    `);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Revert user_id column back to NOT NULL (this may fail if there are still null values)
    await db.execute(sql`
      ALTER TABLE "vendors" ALTER COLUMN "user_id" SET NOT NULL;
    `);
}

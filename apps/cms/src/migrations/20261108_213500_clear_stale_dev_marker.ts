import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM payload_migrations
    WHERE name = 'dev'
      AND batch = -1;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}

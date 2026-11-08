import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// The approval_status column is already added by 20261108_103221.
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
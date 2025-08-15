import * as migration_20250815_clean_users_table from './20250815_clean_users_table';

export const migrations = [
  {
    up: migration_20250815_clean_users_table.up,
    down: migration_20250815_clean_users_table.down,
    name: '20250815_clean_users_table'
  },
];

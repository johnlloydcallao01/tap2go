import * as migration_20250815_100800 from './20250815_100800';

export const migrations = [
  {
    up: migration_20250815_100800.up,
    down: migration_20250815_100800.down,
    name: '20250815_100800'
  },
];

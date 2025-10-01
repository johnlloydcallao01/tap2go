import * as migration_20250831_safe_courses_schema_fix from './20250831_safe_courses_schema_fix';
import * as migration_20250904_fix_emergency_contacts from './20250904_fix_emergency_contacts';
import * as migration_20251001_161512 from './20251001_161512';
import * as migration_20251001_163049 from './20251001_163049';

export const migrations = [
  {
    up: migration_20250831_safe_courses_schema_fix.up,
    down: migration_20250831_safe_courses_schema_fix.down,
    name: '20250831_safe_courses_schema_fix',
  },
  {
    up: migration_20250904_fix_emergency_contacts.up,
    down: migration_20250904_fix_emergency_contacts.down,
    name: '20250904_fix_emergency_contacts',
  },
  {
    up: migration_20251001_161512.up,
    down: migration_20251001_161512.down,
    name: '20251001_161512',
  },
  {
    up: migration_20251001_163049.up,
    down: migration_20251001_163049.down,
    name: '20251001_163049',
  },
];

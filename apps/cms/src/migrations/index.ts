import * as migration_20250831_safe_courses_schema_fix from './20250831_safe_courses_schema_fix';
import * as migration_20250904_fix_emergency_contacts from './20250904_fix_emergency_contacts';
import * as migration_20251001_161512 from './20251001_161512';
import * as migration_20251001_163049 from './20251001_163049';
import * as migration_20251002_111510 from './20251002_111510';
import * as migration_20251002_120339 from './20251002_120339';
import * as migration_20251002_123331_fix_trainee_functions from './20251002_123331_fix_trainee_functions';

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
  {
    up: migration_20251002_111510.up,
    down: migration_20251002_111510.down,
    name: '20251002_111510',
  },
  {
    up: migration_20251002_120339.up,
    down: migration_20251002_120339.down,
    name: '20251002_120339',
  },
  {
    up: migration_20251002_123331_fix_trainee_functions.up,
    down: migration_20251002_123331_fix_trainee_functions.down,
    name: '20251002_123331_fix_trainee_functions'
  },
];

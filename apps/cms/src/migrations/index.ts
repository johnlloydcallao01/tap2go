import * as migration_20250904_fix_emergency_contacts from './20250904_fix_emergency_contacts';
import * as migration_20251001_161512 from './20251001_161512';
import * as migration_20251001_163049 from './20251001_163049';
import * as migration_20251002_111510 from './20251002_111510';
import * as migration_20251002_120339 from './20251002_120339';
import * as migration_20251002_123331_fix_trainee_functions from './20251002_123331_fix_trainee_functions';
import * as migration_20251003_020243_fix_array_to_json_conversion from './20251003_020243_fix_array_to_json_conversion';
import * as migration_20251003_023634 from './20251003_023634';
import * as migration_20251003_031741 from './20251003_031741';
import * as migration_20251003_114004 from './20251003_114004';
import * as migration_20251004_040007 from './20251004_040007';
import * as migration_20251004_044320 from './20251004_044320';
import * as migration_20251004_051313_drop_instructors_table_final from './20251004_051313_drop_instructors_table_final';
import * as migration_20251004_112740 from './20251004_112740';
import * as migration_20251005_064849 from './20251005_064849';
import * as migration_20251005_071448 from './20251005_071448';
import * as migration_20251005_094055 from './20251005_094055';
import * as migration_20251005_140115 from './20251005_140115';
import * as migration_20251005_141500_fix_instructor_functions from './20251005_141500_fix_instructor_functions';
import * as migration_20251005_145823 from './20251005_145823';
import * as migration_20251005_152445 from './20251005_152445';
import * as migration_20251006_032130 from './20251006_032130';

export const migrations = [
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
    name: '20251002_123331_fix_trainee_functions',
  },
  {
    up: migration_20251003_020243_fix_array_to_json_conversion.up,
    down: migration_20251003_020243_fix_array_to_json_conversion.down,
    name: '20251003_020243_fix_array_to_json_conversion',
  },
  {
    up: migration_20251003_023634.up,
    down: migration_20251003_023634.down,
    name: '20251003_023634',
  },
  {
    up: migration_20251003_031741.up,
    down: migration_20251003_031741.down,
    name: '20251003_031741',
  },
  {
    up: migration_20251003_114004.up,
    down: migration_20251003_114004.down,
    name: '20251003_114004',
  },
  {
    up: migration_20251004_040007.up,
    down: migration_20251004_040007.down,
    name: '20251004_040007',
  },
  {
    up: migration_20251004_044320.up,
    down: migration_20251004_044320.down,
    name: '20251004_044320',
  },
  {
    up: migration_20251004_051313_drop_instructors_table_final.up,
    down: migration_20251004_051313_drop_instructors_table_final.down,
    name: '20251004_051313_drop_instructors_table_final',
  },
  {
    up: migration_20251004_112740.up,
    down: migration_20251004_112740.down,
    name: '20251004_112740',
  },
  {
    up: migration_20251005_064849.up,
    down: migration_20251005_064849.down,
    name: '20251005_064849',
  },
  {
    up: migration_20251005_071448.up,
    down: migration_20251005_071448.down,
    name: '20251005_071448',
  },
  {
    up: migration_20251005_094055.up,
    down: migration_20251005_094055.down,
    name: '20251005_094055',
  },
  {
    up: migration_20251005_140115.up,
    down: migration_20251005_140115.down,
    name: '20251005_140115',
  },
  {
    up: migration_20251005_141500_fix_instructor_functions.up,
    down: migration_20251005_141500_fix_instructor_functions.down,
    name: '20251005_141500_fix_instructor_functions',
  },
  {
    up: migration_20251005_145823.up,
    down: migration_20251005_145823.down,
    name: '20251005_145823',
  },
  {
    up: migration_20251005_152445.up,
    down: migration_20251005_152445.down,
    name: '20251005_152445',
  },
  {
    up: migration_20251006_032130.up,
    down: migration_20251006_032130.down,
    name: '20251006_032130'
  },
];

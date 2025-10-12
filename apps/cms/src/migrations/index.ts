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
import * as migration_20251006_061818 from './20251006_061818';
import * as migration_20251007_072728 from './20251007_072728';
import * as migration_20251007_125716 from './20251007_125716';
import * as migration_20251008_101508 from './20251008_101508';
import * as migration_20251009_140002 from './20251009_140002';
import * as migration_20251009_141005 from './20251009_141005';
import * as migration_20251009_142718 from './20251009_142718';
import * as migration_20251009_143000_merchant_coordinates_triggers from './20251009_143000_merchant_coordinates_triggers';
import * as migration_20251009_144500_fix_coordinates_jsonb from './20251009_144500_fix_coordinates_jsonb';
import * as migration_20251009_145000_fix_address_boundary_jsonb from './20251009_145000_fix_address_boundary_jsonb';
import * as migration_20251009_145500_fix_service_area_jsonb from './20251009_145500_fix_service_area_jsonb';
import * as migration_20251010_034455_sync_merchants_schema from './20251010_034455_sync_merchants_schema';
import * as migration_20251012_020017 from './20251012_020017';
import * as migration_20251012_072054_fix_merchant_coordinates_for_haversine from './20251012_072054_fix_merchant_coordinates_for_haversine';
import * as migration_20251201_fix_merchant_coordinates_type_conflict from './20251201_fix_merchant_coordinates_type_conflict';
import * as migration_20251201_restore_postgis_geometry from './20251201_restore_postgis_geometry';

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
    name: '20251006_032130',
  },
  {
    up: migration_20251006_061818.up,
    down: migration_20251006_061818.down,
    name: '20251006_061818',
  },
  {
    up: migration_20251007_072728.up,
    down: migration_20251007_072728.down,
    name: '20251007_072728',
  },
  {
    up: migration_20251007_125716.up,
    down: migration_20251007_125716.down,
    name: '20251007_125716',
  },
  {
    up: migration_20251008_101508.up,
    down: migration_20251008_101508.down,
    name: '20251008_101508',
  },
  {
    up: migration_20251009_140002.up,
    down: migration_20251009_140002.down,
    name: '20251009_140002',
  },
  {
    up: migration_20251009_141005.up,
    down: migration_20251009_141005.down,
    name: '20251009_141005',
  },
  {
    up: migration_20251009_142718.up,
    down: migration_20251009_142718.down,
    name: '20251009_142718',
  },
  {
    up: migration_20251009_143000_merchant_coordinates_triggers.up,
    down: migration_20251009_143000_merchant_coordinates_triggers.down,
    name: '20251009_143000_merchant_coordinates_triggers',
  },
  {
    up: migration_20251009_144500_fix_coordinates_jsonb.up,
    down: migration_20251009_144500_fix_coordinates_jsonb.down,
    name: '20251009_144500_fix_coordinates_jsonb',
  },
  {
    up: migration_20251009_145000_fix_address_boundary_jsonb.up,
    down: migration_20251009_145000_fix_address_boundary_jsonb.down,
    name: '20251009_145000_fix_address_boundary_jsonb',
  },
  {
    up: migration_20251009_145500_fix_service_area_jsonb.up,
    down: migration_20251009_145500_fix_service_area_jsonb.down,
    name: '20251009_145500_fix_service_area_jsonb',
  },
  {
    up: migration_20251010_034455_sync_merchants_schema.up,
    down: migration_20251010_034455_sync_merchants_schema.down,
    name: '20251010_034455_sync_merchants_schema',
  },
  {
    up: migration_20251012_020017.up,
    down: migration_20251012_020017.down,
    name: '20251012_020017',
  },
  {
    up: migration_20251012_072054_fix_merchant_coordinates_for_haversine.up,
    down: migration_20251012_072054_fix_merchant_coordinates_for_haversine.down,
    name: '20251012_072054_fix_merchant_coordinates_for_haversine',
  },
  {
    up: migration_20251201_fix_merchant_coordinates_type_conflict.up,
    down: migration_20251201_fix_merchant_coordinates_type_conflict.down,
    name: '20251201_fix_merchant_coordinates_type_conflict',
  },
  {
    up: migration_20251201_restore_postgis_geometry.up,
    down: migration_20251201_restore_postgis_geometry.down,
    name: '20251201_restore_postgis_geometry'
  },
];

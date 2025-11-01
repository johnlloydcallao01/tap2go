import * as migration_20251017_040757 from './20251017_040757';
import * as migration_20251017_042000 from './20251017_042000';
import * as migration_20251017_052855_product_management_tables from './20251017_052855_product_management_tables';
import * as migration_20251101_112210_merchant_products_added_by_optional from './20251101_112210_merchant_products_added_by_optional';

export const migrations = [
  {
    up: migration_20251017_040757.up,
    down: migration_20251017_040757.down,
    name: '20251017_040757',
  },
  {
    up: migration_20251017_042000.up,
    down: migration_20251017_042000.down,
    name: '20251017_042000',
  },
  {
    up: migration_20251017_052855_product_management_tables.up,
    down: migration_20251017_052855_product_management_tables.down,
    name: '20251017_052855_product_management_tables',
  },
  {
    up: migration_20251101_112210_merchant_products_added_by_optional.up,
    down: migration_20251101_112210_merchant_products_added_by_optional.down,
    name: '20251101_112210_merchant_products_added_by_optional',
  },
];

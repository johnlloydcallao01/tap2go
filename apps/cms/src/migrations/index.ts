import * as migration_20250103_category_filtering_indexes from './20250103_category_filtering_indexes';
import * as migration_20251017_040757 from './20251017_040757';
import * as migration_20251017_042000 from './20251017_042000';
import * as migration_20251017_052855_product_management_tables from './20251017_052855_product_management_tables';
import * as migration_20251101_112210_merchant_products_added_by_optional from './20251101_112210_merchant_products_added_by_optional';
import * as migration_20251102_095049_replace_auto_assign_field from './20251102_095049_replace_auto_assign_field';
import * as migration_20251102_161143 from './20251102_161143';
import * as migration_20251108_065341 from './20251108_065341';
import * as migration_20251115_061448 from './20251115_061448';
import * as migration_20251115_130118 from './20251115_130118';
import * as migration_20251115_132619 from './20251115_132619';
import * as migration_20251118_120501_make_base_price_optional_for_grouped from './20251118_120501_make_base_price_optional_for_grouped';
import * as migration_20251119_141500_fix_product_fk_delete_behavior from './20251119_141500_fix_product_fk_delete_behavior';
import * as migration_20251119_200000_fix_product_delete_behavior_cascade from './20251119_200000_fix_product_delete_behavior_cascade';
import * as migration_20251120_120000_add_variation_id_to_variation_values from './20251120_120000_add_variation_id_to_variation_values';
import * as migration_20251120_171500_add_product_attribute_combo_to_prod_variations from './20251120_171500_add_product_attribute_combo_to_prod_variations';
import * as migration_20251120_173100_remove_variation_product_from_variation_values from './20251120_173100_remove_variation_product_from_variation_values';
import * as migration_20251120_174200_drop_attribute_id_from_variation_values from './20251120_174200_drop_attribute_id_from_variation_values';
import * as migration_20251121_180000_update_variations_and_merchant_products from './20251121_180000_update_variations_and_merchant_products';
import * as migration_20251121_193000_backfill_attribute_id_on_prod_variation_values from './20251121_193000_backfill_attribute_id_on_prod_variation_values';
import * as migration_20251121_204000_add_slug_to_products from './20251121_204000_add_slug_to_products';
import * as migration_20251121_214500_add_variation_name from './20251121_214500_add_variation_name';
import * as migration_20251121_220000_backfill_variation_sku from './20251121_220000_backfill_variation_sku';
import * as migration_20251121_222000_add_variation_image from './20251121_222000_add_variation_image';
import * as migration_20251121_230000_update_variation_sku_format from './20251121_230000_update_variation_sku_format';
import * as migration_20251121_231500_backfill_products_sku from './20251121_231500_backfill_products_sku';
import * as migration_20251121_233000_products_sku_trigger from './20251121_233000_products_sku_trigger';
import * as migration_20251121_235000_uppercase_products_sku from './20251121_235000_uppercase_products_sku';
import * as migration_20251122_090515_add_short_description_to_prod_variations from './20251122_090515_add_short_description_to_prod_variations';
import * as migration_20251123_023957_add_merchant_categories from './20251123_023957_add_merchant_categories';
import * as migration_20251202_remove_vendor_products_table from './20251202_remove_vendor_products_table';

export const migrations = [
  {
    up: migration_20250103_category_filtering_indexes.up,
    down: migration_20250103_category_filtering_indexes.down,
    name: '20250103_category_filtering_indexes',
  },
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
  {
    up: migration_20251102_095049_replace_auto_assign_field.up,
    down: migration_20251102_095049_replace_auto_assign_field.down,
    name: '20251102_095049_replace_auto_assign_field',
  },
  {
    up: migration_20251102_161143.up,
    down: migration_20251102_161143.down,
    name: '20251102_161143',
  },
  {
    up: migration_20251108_065341.up,
    down: migration_20251108_065341.down,
    name: '20251108_065341',
  },
  {
    up: migration_20251115_061448.up,
    down: migration_20251115_061448.down,
    name: '20251115_061448',
  },
  {
    up: migration_20251115_130118.up,
    down: migration_20251115_130118.down,
    name: '20251115_130118',
  },
  {
    up: migration_20251115_132619.up,
    down: migration_20251115_132619.down,
    name: '20251115_132619',
  },
  {
    up: migration_20251118_120501_make_base_price_optional_for_grouped.up,
    down: migration_20251118_120501_make_base_price_optional_for_grouped.down,
    name: '20251118_120501_make_base_price_optional_for_grouped',
  },
  {
    up: migration_20251119_141500_fix_product_fk_delete_behavior.up,
    down: migration_20251119_141500_fix_product_fk_delete_behavior.down,
    name: '20251119_141500_fix_product_fk_delete_behavior',
  },
  {
    up: migration_20251119_200000_fix_product_delete_behavior_cascade.up,
    down: migration_20251119_200000_fix_product_delete_behavior_cascade.down,
    name: '20251119_200000_fix_product_delete_behavior_cascade',
  },
  {
    up: migration_20251120_120000_add_variation_id_to_variation_values.up,
    down: migration_20251120_120000_add_variation_id_to_variation_values.down,
    name: '20251120_120000_add_variation_id_to_variation_values',
  },
  {
    up: migration_20251120_171500_add_product_attribute_combo_to_prod_variations.up,
    down: migration_20251120_171500_add_product_attribute_combo_to_prod_variations.down,
    name: '20251120_171500_add_product_attribute_combo_to_prod_variations',
  },
  {
    up: migration_20251120_173100_remove_variation_product_from_variation_values.up,
    down: migration_20251120_173100_remove_variation_product_from_variation_values.down,
    name: '20251120_173100_remove_variation_product_from_variation_values',
  },
  {
    up: migration_20251120_174200_drop_attribute_id_from_variation_values.up,
    down: migration_20251120_174200_drop_attribute_id_from_variation_values.down,
    name: '20251120_174200_drop_attribute_id_from_variation_values',
  },
  {
    up: migration_20251121_180000_update_variations_and_merchant_products.up,
    down: migration_20251121_180000_update_variations_and_merchant_products.down,
    name: '20251121_180000_update_variations_and_merchant_products',
  },
  {
    up: migration_20251121_193000_backfill_attribute_id_on_prod_variation_values.up,
    down: migration_20251121_193000_backfill_attribute_id_on_prod_variation_values.down,
    name: '20251121_193000_backfill_attribute_id_on_prod_variation_values',
  },
  {
    up: migration_20251121_204000_add_slug_to_products.up,
    down: migration_20251121_204000_add_slug_to_products.down,
    name: '20251121_204000_add_slug_to_products',
  },
  {
    up: migration_20251121_214500_add_variation_name.up,
    down: migration_20251121_214500_add_variation_name.down,
    name: '20251121_214500_add_variation_name',
  },
  {
    up: migration_20251121_220000_backfill_variation_sku.up,
    down: migration_20251121_220000_backfill_variation_sku.down,
    name: '20251121_220000_backfill_variation_sku',
  },
  {
    up: migration_20251121_222000_add_variation_image.up,
    down: migration_20251121_222000_add_variation_image.down,
    name: '20251121_222000_add_variation_image',
  },
  {
    up: migration_20251121_230000_update_variation_sku_format.up,
    down: migration_20251121_230000_update_variation_sku_format.down,
    name: '20251121_230000_update_variation_sku_format',
  },
  {
    up: migration_20251121_231500_backfill_products_sku.up,
    down: migration_20251121_231500_backfill_products_sku.down,
    name: '20251121_231500_backfill_products_sku',
  },
  {
    up: migration_20251121_233000_products_sku_trigger.up,
    down: migration_20251121_233000_products_sku_trigger.down,
    name: '20251121_233000_products_sku_trigger',
  },
  {
    up: migration_20251121_235000_uppercase_products_sku.up,
    down: migration_20251121_235000_uppercase_products_sku.down,
    name: '20251121_235000_uppercase_products_sku',
  },
  {
    up: migration_20251122_090515_add_short_description_to_prod_variations.up,
    down: migration_20251122_090515_add_short_description_to_prod_variations.down,
    name: '20251122_090515_add_short_description_to_prod_variations',
  },
  {
    up: migration_20251123_023957_add_merchant_categories.up,
    down: migration_20251123_023957_add_merchant_categories.down,
    name: '20251123_023957_add_merchant_categories',
  },
  {
    up: migration_20251202_remove_vendor_products_table.up,
    down: migration_20251202_remove_vendor_products_table.down,
    name: '20251202_remove_vendor_products_table'
  },
];

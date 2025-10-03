import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
    // Remove unwanted JSON columns
    await db.execute(sql`ALTER TABLE vendors DROP COLUMN IF EXISTS cuisine_types;`);
    await db.execute(sql`ALTER TABLE merchants DROP COLUMN IF EXISTS special_hours;`);
    await db.execute(sql`ALTER TABLE merchants DROP COLUMN IF EXISTS media_interior_images;`);
    await db.execute(sql`ALTER TABLE merchants DROP COLUMN IF EXISTS media_menu_images;`);
    await db.execute(sql`ALTER TABLE merchants DROP COLUMN IF EXISTS tags;`);
    await db.execute(sql`ALTER TABLE prod_categories DROP COLUMN IF EXISTS styling_gradient_colors;`);
    await db.execute(sql`ALTER TABLE prod_categories DROP COLUMN IF EXISTS attributes_dietary_tags;`);
    await db.execute(sql`ALTER TABLE prod_categories DROP COLUMN IF EXISTS seo_keywords;`);
    await db.execute(sql`ALTER TABLE prod_categories DROP COLUMN IF EXISTS availability_seasonal_availability;`);
    await db.execute(sql`ALTER TABLE prod_categories DROP COLUMN IF EXISTS availability_region_restrictions;`);
    await db.execute(sql`ALTER TABLE products DROP COLUMN IF EXISTS dietary_allergens;`);
    await db.execute(sql`ALTER TABLE products DROP COLUMN IF EXISTS dietary_ingredients;`);
    await db.execute(sql`ALTER TABLE products DROP COLUMN IF EXISTS availability_seasonal_availability;`);
    await db.execute(sql`ALTER TABLE products DROP COLUMN IF EXISTS tags;`);
}

export async function down(): Promise<void> {
    // This migration is not reversible as we're removing unwanted columns
    throw new Error('This migration cannot be reversed');
}

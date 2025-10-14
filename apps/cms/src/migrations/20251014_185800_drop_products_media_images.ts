import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop products_media_images table indexes first
    DROP INDEX IF EXISTS products_media_images_order_idx;
    DROP INDEX IF EXISTS products_media_images_parent_id_idx;
    DROP INDEX IF EXISTS products_media_images_image_idx;
    
    -- Drop products_media_images table
    DROP TABLE IF EXISTS products_media_images CASCADE;
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Recreate products_media_images table
    CREATE TABLE products_media_images (
        _order INTEGER NOT NULL,
        _parent_id INTEGER NOT NULL,
        id CHARACTER VARYING NOT NULL,
        image_id INTEGER NOT NULL,
        CONSTRAINT products_media_images_pkey PRIMARY KEY (id),
        CONSTRAINT products_media_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE SET NULL
    );
    
    -- Recreate products_media_images indexes
    CREATE INDEX products_media_images_order_idx ON products_media_images USING btree (_order);
    CREATE INDEX products_media_images_parent_id_idx ON products_media_images USING btree (_parent_id);
    CREATE INDEX products_media_images_image_idx ON products_media_images USING btree (image_id);
  `)
}
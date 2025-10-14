import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db: _db, payload, req: _req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Fix products description column type conversion
    -- First, create a temporary column
    ALTER TABLE "products" ADD COLUMN "description_temp" jsonb;
    
    -- Convert existing text data to proper richText JSONB format
    UPDATE "products" 
    SET "description_temp" = CASE 
      WHEN "description" IS NULL OR "description" = '' THEN NULL
      ELSE json_build_object(
        'root', json_build_object(
          'children', json_build_array(
            json_build_object(
              'children', json_build_array(
                json_build_object(
                  'detail', 0,
                  'format', 0,
                  'mode', 'normal',
                  'style', '',
                  'text', "description",
                  'type', 'text',
                  'version', 1
                )
              ),
              'direction', 'ltr',
              'format', '',
              'indent', 0,
              'type', 'paragraph',
              'version', 1
            )
          ),
          'direction', 'ltr',
          'format', '',
          'indent', 0,
          'type', 'root',
          'version', 1
        )
      )
    END;
    
    -- Drop the old column
    ALTER TABLE "products" DROP COLUMN "description";
    
    -- Rename the temp column
    ALTER TABLE "products" RENAME COLUMN "description_temp" TO "description";
  `)
}

export async function down({ db: _db, payload, req: _req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Revert the description column back to TEXT
    -- First, create a temporary column
    ALTER TABLE "products" ADD COLUMN "description_temp" text;
    
    -- Convert JSONB back to text (extract text content from richText structure)
    UPDATE "products" 
    SET "description_temp" = CASE 
      WHEN "description" IS NULL THEN NULL
      ELSE COALESCE(
        (SELECT string_agg(child->>'text', ' ')
         FROM jsonb_array_elements("description"->'root'->'children') AS paragraph,
              jsonb_array_elements(paragraph->'children') AS child
         WHERE child->>'type' = 'text'),
        ''
      )
    END;
    
    -- Drop the old column
    ALTER TABLE "products" DROP COLUMN "description";
    
    -- Rename the temp column
    ALTER TABLE "products" RENAME COLUMN "description_temp" TO "description";
  `)
}

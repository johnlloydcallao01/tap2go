import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Fix type mismatches found in schema comparison
    
    // 1. Fix operational_status: Convert from USER-DEFINED enum to varchar
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN operational_status TYPE varchar(50) 
        USING operational_status::text;
    `);
    
    // 2. Fix description: Convert from varchar to text
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN description TYPE text;
    `);
    
    // 3. Fix special_instructions: Convert from varchar to text  
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN special_instructions TYPE text;
    `);
    
    // 4. Fix priority_zones: Convert from USER-DEFINED to jsonb
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN priority_zones TYPE jsonb 
        USING CASE 
            WHEN priority_zones IS NULL THEN NULL 
            ELSE priority_zones::text::jsonb 
        END;
    `);
    
    // 5. Fix restricted_areas: Convert from USER-DEFINED to jsonb
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN restricted_areas TYPE jsonb 
        USING CASE 
            WHEN restricted_areas IS NULL THEN NULL 
            ELSE restricted_areas::text::jsonb 
        END;
    `);
    
    // 6. Fix delivery_zones: Convert from USER-DEFINED to jsonb
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN delivery_zones TYPE jsonb 
        USING CASE 
            WHEN delivery_zones IS NULL THEN NULL 
            ELSE delivery_zones::text::jsonb 
        END;
    `);
    
    console.log('✅ Merchants schema synchronized with current code');
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Reverse the changes (note: some conversions may not be perfectly reversible)
    
    // Revert to original types (best effort)
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN operational_status TYPE varchar(255);
    `);
    
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN description TYPE varchar(255);
    `);
    
    await db.execute(sql`
        ALTER TABLE merchants 
        ALTER COLUMN special_instructions TYPE varchar(255);
    `);
    
    // Note: Converting back from jsonb to USER-DEFINED types is complex
    // and may require recreating the original enum types
    console.log('⚠️ Partial rollback completed - some type conversions may not be fully reversible');
}

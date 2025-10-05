import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Fix create_role_record function to remove instructor case
    CREATE OR REPLACE FUNCTION create_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Create corresponding record based on user role
        CASE NEW.role
            WHEN 'admin' THEN
                INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                VALUES (NEW.id, 'content', NOW(), NOW());

            WHEN 'customer' THEN
                INSERT INTO customers (user_id, srn, current_level, created_at, updated_at)
                VALUES (NEW.id, 'CUS-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());

            WHEN 'service' THEN
                -- Service accounts don't need role-specific records
                -- They are used for API key authentication only
                NULL;
                
            WHEN 'vendor' THEN
                -- Vendors don't need role-specific records for now
                NULL;
        END CASE;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  await payload.db.drizzle.execute(`
    -- Fix cleanup_role_record function to remove instructor case
    CREATE OR REPLACE FUNCTION cleanup_role_record()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Remove role-specific record
        CASE OLD.role
            WHEN 'admin' THEN
                DELETE FROM admins WHERE user_id = OLD.id;
            WHEN 'customer' THEN
                DELETE FROM customers WHERE user_id = OLD.id;
            -- Remove instructor and trainee cases as they no longer exist
        END CASE;

        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `)

  await payload.db.drizzle.execute(`
    -- Fix handle_role_change function to remove instructor references
    CREATE OR REPLACE FUNCTION handle_role_change()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Handle role changes
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            -- Delete old role-specific record
            CASE OLD.role
                WHEN 'admin' THEN
                    DELETE FROM admins WHERE user_id = OLD.id;
                WHEN 'customer' THEN
                    DELETE FROM customers WHERE user_id = OLD.id;
                -- Remove instructor and trainee cases
            END CASE;

            -- Create new role-specific record
            CASE NEW.role
                WHEN 'admin' THEN
                    INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                    VALUES (NEW.id, 'content', NOW(), NOW());

                WHEN 'customer' THEN
                    INSERT INTO customers (user_id, srn, current_level, created_at, updated_at)
                    VALUES (NEW.id, 'CUS-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());

                WHEN 'service' THEN
                    -- Service accounts don't need role-specific records
                    NULL;
                    
                WHEN 'vendor' THEN
                    -- Vendors don't need role-specific records for now
                    NULL;
            END CASE;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  await payload.db.drizzle.execute(`
    -- Fix get_user_statistics function to remove instructor references
    CREATE OR REPLACE FUNCTION get_user_statistics()
    RETURNS JSON AS $$
    DECLARE
        stats JSON;
    BEGIN
        SELECT json_build_object(
            'total_users', COUNT(*),
            'active_users', COUNT(*) FILTER (WHERE is_active = true),
            'admins', COUNT(*) FILTER (WHERE role = 'admin'),
            'customers', COUNT(*) FILTER (WHERE role = 'customer'),
            'vendors', COUNT(*) FILTER (WHERE role = 'vendor'),
            'service_accounts', COUNT(*) FILTER (WHERE role = 'service')
        ) INTO stats
        FROM users;

        RETURN stats;
    END;
    $$ LANGUAGE plpgsql;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Note: This down migration would restore the original functions with instructor references
  // However, since we're removing instructor functionality, we'll keep the fixed versions
  // If you need to restore the original functions, you would need to recreate them with instructor cases
  
  await payload.db.drizzle.execute(`
    -- This is a placeholder down migration
    -- The original functions with instructor references would be restored here if needed
    SELECT 1;
  `)
}
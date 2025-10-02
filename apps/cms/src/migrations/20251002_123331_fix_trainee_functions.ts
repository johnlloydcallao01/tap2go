import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
    // Drop and recreate the handle_role_change function to reference customers instead of trainees
    await db.execute(sql`
        DROP FUNCTION IF EXISTS handle_role_change() CASCADE;
    `);

    await db.execute(sql`
        CREATE OR REPLACE FUNCTION handle_role_change()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Handle role changes
            IF OLD.role IS DISTINCT FROM NEW.role THEN
                -- Delete old role-specific record
                CASE OLD.role
                    WHEN 'admin' THEN
                        DELETE FROM admins WHERE user_id = OLD.id;
                    WHEN 'instructor' THEN
                        DELETE FROM instructors WHERE user_id = OLD.id;
                    WHEN 'trainee' THEN
                        DELETE FROM customers WHERE user_id = OLD.id;
                    WHEN 'customer' THEN
                        DELETE FROM customers WHERE user_id = OLD.id;
                END CASE;

                -- Create new role-specific record
                CASE NEW.role
                    WHEN 'admin' THEN
                        INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                        VALUES (NEW.id, 'content', NOW(), NOW());
                    WHEN 'instructor' THEN
                        INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at)
                        VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
                    WHEN 'customer' THEN
                        -- Create customer record with auto-generated SRN
                        INSERT INTO customers (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                        VALUES (
                          NEW.id,
                          'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()),
                          'beginner',
                          NOW(),
                          NOW(),
                          NOW()
                        );
                END CASE;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Drop and recreate the create_role_record function to reference customers instead of trainees
    await db.execute(sql`
        DROP FUNCTION IF EXISTS create_role_record() CASCADE;
    `);

    await db.execute(sql`
        CREATE OR REPLACE FUNCTION create_role_record()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Create corresponding record based on user role
            CASE NEW.role
                WHEN 'admin' THEN
                    INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                    VALUES (NEW.id, 'content', NOW(), NOW());

                WHEN 'instructor' THEN
                    INSERT INTO instructors (user_id, specialization, created_at, updated_at)
                    VALUES (NEW.id, 'General', NOW(), NOW());

                WHEN 'customer' THEN
                    INSERT INTO customers (user_id, srn, current_level, created_at, updated_at)
                    VALUES (NEW.id, 'CUS-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());

                WHEN 'service' THEN
                    -- Service accounts don't need role-specific records
                    -- They are used for API key authentication only  
                    NULL;
            END CASE;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Recreate the triggers
    await db.execute(sql`
        DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
        CREATE TRIGGER user_role_change_trigger
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION handle_role_change();
    `);

    await db.execute(sql`
        DROP TRIGGER IF EXISTS user_role_creation_trigger ON users;
        CREATE TRIGGER user_role_creation_trigger
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION create_role_record();
    `);
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
    // Revert the functions back to reference trainees
    await db.execute(sql`
        DROP FUNCTION IF EXISTS handle_role_change() CASCADE;
    `);

    await db.execute(sql`
        CREATE OR REPLACE FUNCTION handle_role_change()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Handle role changes
            IF OLD.role IS DISTINCT FROM NEW.role THEN
                -- Delete old role-specific record
                CASE OLD.role
                    WHEN 'admin' THEN
                        DELETE FROM admins WHERE user_id = OLD.id;
                    WHEN 'instructor' THEN
                        DELETE FROM instructors WHERE user_id = OLD.id;
                    WHEN 'trainee' THEN
                        DELETE FROM trainees WHERE user_id = OLD.id;
                    WHEN 'customer' THEN
                        DELETE FROM trainees WHERE user_id = OLD.id;
                END CASE;

                -- Create new role-specific record
                CASE NEW.role
                    WHEN 'admin' THEN
                        INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                        VALUES (NEW.id, 'content', NOW(), NOW());
                    WHEN 'instructor' THEN
                        INSERT INTO instructors (user_id, specialization, teaching_permissions, created_at, updated_at)
                        VALUES (NEW.id, 'General', '{"course_creation": true, "student_management": true}', NOW(), NOW());
                    WHEN 'trainee' THEN
                        INSERT INTO trainees (user_id, srn, current_level, enrollment_date, created_at, updated_at)
                        VALUES (
                          NEW.id,
                          'SRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()),
                          'beginner',
                          NOW(),
                          NOW(),
                          NOW()
                        );
                END CASE;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    await db.execute(sql`
        DROP FUNCTION IF EXISTS create_role_record() CASCADE;
    `);

    await db.execute(sql`
        CREATE OR REPLACE FUNCTION create_role_record()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Create corresponding record based on user role
            CASE NEW.role
                WHEN 'admin' THEN
                    INSERT INTO admins (user_id, admin_level, created_at, updated_at)
                    VALUES (NEW.id, 'content', NOW(), NOW());

                WHEN 'instructor' THEN
                    INSERT INTO instructors (user_id, specialization, created_at, updated_at)
                    VALUES (NEW.id, 'General', NOW(), NOW());

                WHEN 'trainee' THEN
                    INSERT INTO trainees (user_id, srn, current_level, created_at, updated_at)
                    VALUES (NEW.id, 'TRN-' || NEW.id || '-' || EXTRACT(YEAR FROM NOW()), 'beginner', NOW(), NOW());

                WHEN 'service' THEN
                    -- Service accounts don't need role-specific records
                    -- They are used for API key authentication only  
                    NULL;
            END CASE;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Recreate the triggers
    await db.execute(sql`
        DROP TRIGGER IF EXISTS user_role_change_trigger ON users;
        CREATE TRIGGER user_role_change_trigger
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION handle_role_change();
    `);

    await db.execute(sql`
        DROP TRIGGER IF EXISTS user_role_creation_trigger ON users;
        CREATE TRIGGER user_role_creation_trigger
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION create_role_record();
    `);
}

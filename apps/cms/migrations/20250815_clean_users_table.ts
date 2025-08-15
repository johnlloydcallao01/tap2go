import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Safe migration to remove role-specific fields while preserving existing users
  
  await payload.db.drizzle.execute(sql`
    -- First, check if the columns exist before trying to drop them
    -- This prevents errors if the migration is run multiple times
    
    -- Remove phone column if it exists
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users DROP COLUMN phone;
      END IF;
    END $$;
    
    -- Remove driver profile columns if they exist
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_license_number') THEN
        ALTER TABLE users DROP COLUMN driver_profile_license_number;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_vehicle_type') THEN
        ALTER TABLE users DROP COLUMN driver_profile_vehicle_type;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_vehicle_plate_number') THEN
        ALTER TABLE users DROP COLUMN driver_profile_vehicle_plate_number;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_bank_account_bank_name') THEN
        ALTER TABLE users DROP COLUMN driver_profile_bank_account_bank_name;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_bank_account_account_number') THEN
        ALTER TABLE users DROP COLUMN driver_profile_bank_account_account_number;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_bank_account_account_holder_name') THEN
        ALTER TABLE users DROP COLUMN driver_profile_bank_account_account_holder_name;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_is_online') THEN
        ALTER TABLE users DROP COLUMN driver_profile_is_online;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_rating') THEN
        ALTER TABLE users DROP COLUMN driver_profile_rating;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'driver_profile_total_deliveries') THEN
        ALTER TABLE users DROP COLUMN driver_profile_total_deliveries;
      END IF;
    END $$;
    
    -- Remove vendor profile columns if they exist
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_name') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_name;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_registration_number') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_registration_number;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_type') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_type;
      END IF;
    END $$;
    
    -- Remove all vendor business address columns
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_address_street') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_address_street;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_address_city') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_address_city;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_address_state') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_address_state;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_address_zip_code') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_address_zip_code;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_business_address_country') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_business_address_country;
      END IF;
    END $$;
    
    -- Remove vendor bank account columns
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_bank_account_bank_name') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_bank_account_bank_name;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_bank_account_account_number') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_bank_account_account_number;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_bank_account_account_holder_name') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_bank_account_account_holder_name;
      END IF;
    END $$;
    
    -- Remove other vendor columns
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_commission_rate') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_commission_rate;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_rating') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_rating;
      END IF;
    END $$;
    
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'vendor_profile_total_orders') THEN
        ALTER TABLE users DROP COLUMN vendor_profile_total_orders;
      END IF;
    END $$;
    
    -- Ensure isVerified column exists (it should already exist, but add if missing)
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
      END IF;
    END $$;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // This migration is not easily reversible since we're dropping columns
  // If you need to rollback, you would need to restore from a backup
  throw new Error('This migration cannot be automatically reversed. Please restore from backup if needed.')
}

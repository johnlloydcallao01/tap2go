import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create trigger function to update merchant coordinates
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION update_merchant_coordinates()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      -- Handle address updates (latitude/longitude changes)
      IF TG_TABLE_NAME = 'addresses' THEN
        -- Update all merchants that reference this address
        UPDATE merchants 
        SET 
          merchant_latitude = NEW.latitude,
          merchant_longitude = NEW.longitude,
          updated_at = NOW()
        WHERE active_address_id = NEW.id;
        
        RETURN NEW;
      END IF;
      
      -- Handle merchant active_address_id changes
      IF TG_TABLE_NAME = 'merchants' THEN
        -- Only update if active_address_id actually changed
        IF OLD.active_address_id IS DISTINCT FROM NEW.active_address_id THEN
          -- Update merchant coordinates from the new address
          UPDATE merchants 
          SET 
            merchant_latitude = addr.latitude,
            merchant_longitude = addr.longitude,
            updated_at = NOW()
          FROM addresses addr
          WHERE merchants.id = NEW.id 
            AND addr.id = NEW.active_address_id;
        END IF;
        
        RETURN NEW;
      END IF;
      
      RETURN NULL;
    END;
    $$;
  `)

  // Create trigger on addresses table for latitude/longitude updates
  await db.execute(sql`
    CREATE TRIGGER trigger_address_coordinates_update
    AFTER UPDATE OF latitude, longitude ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_coordinates();
  `)

  // Create trigger on merchants table for active_address_id changes
  await db.execute(sql`
    CREATE TRIGGER trigger_merchant_address_change
    AFTER UPDATE OF active_address_id ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_merchant_coordinates();
  `)

  // Initial sync: Update all existing merchants with coordinates from their active addresses
  await db.execute(sql`
    UPDATE merchants 
    SET 
      merchant_latitude = addr.latitude,
      merchant_longitude = addr.longitude,
      updated_at = NOW()
    FROM addresses addr
    WHERE merchants.active_address_id = addr.id
      AND (
        merchants.merchant_latitude IS DISTINCT FROM addr.latitude 
        OR merchants.merchant_longitude IS DISTINCT FROM addr.longitude
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop triggers
  await db.execute(sql`DROP TRIGGER IF EXISTS trigger_address_coordinates_update ON addresses;`)
  await db.execute(sql`DROP TRIGGER IF EXISTS trigger_merchant_address_change ON merchants;`)
  
  // Drop function
  await db.execute(sql`DROP FUNCTION IF EXISTS update_merchant_coordinates();`)
}
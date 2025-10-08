# Geocoding Merchants Implementation

## Overview
Implementation guide to enable automatic geospatial coordinate extraction for merchants using Google Maps API when `active_address_id` is set.

## Flow
1. `active_address_id` in merchants table → references addresses table
2. Google Maps API geocodes the address data
3. Coordinates automatically populate in merchants table

## Implementation Steps

### 1. Environment Configuration

Add to `apps/cms/.env`:
```env
GOOGLE_MAPS_API_KEY=AIzaSyAMJO82LtLjj81N1sfQkQVZLygmF4hggEQ
```

### 2. Google Maps Geocoding Service

Create `apps/cms/src/services/GoogleMapsService.ts`:
```typescript
import axios from 'axios';

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY!;
  }

  async geocodeAddress(address: string) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: this.apiKey
      }
    });

    const result = response.data.results[0];
    if (!result) throw new Error('Address not found');

    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      google_place_id: result.place_id,
      geocoding_accuracy: result.geometry.location_type,
      address_components: result.address_components
    };
  }
}
```

### 3. Address Collection Hook Enhancement

Update `apps/cms/src/collections/Addresses.ts` afterChange hook:
```typescript
afterChange: [
  async ({ doc, req, operation }) => {
    if (operation === 'create' || operation === 'update') {
      // If address has raw text but no coordinates, geocode it
      if (doc.formatted_address && (!doc.latitude || !doc.longitude)) {
        try {
          const googleMaps = new GoogleMapsService();
          const geocoded = await googleMaps.geocodeAddress(doc.formatted_address);
          
          // Update address with geocoded data
          await req.payload.update({
            collection: 'addresses',
            id: doc.id,
            data: {
              latitude: geocoded.latitude,
              longitude: geocoded.longitude,
              google_place_id: geocoded.google_place_id,
              geocoding_accuracy: geocoded.geocoding_accuracy,
              coordinate_source: 'GOOGLE_GEOCODING',
              last_geocoded_at: new Date().toISOString(),
              coordinates: {
                type: 'Point',
                coordinates: [geocoded.longitude, geocoded.latitude]
              }
            }
          });
        } catch (error) {
          console.error('Geocoding failed:', error);
        }
      }

      // Propagate coordinates to merchants
      if (doc.latitude && doc.longitude) {
        const merchants = await req.payload.find({
          collection: 'merchants',
          where: {
            active_address_id: { equals: doc.id }
          }
        });

        for (const merchant of merchants.docs) {
          await req.payload.update({
            collection: 'merchants',
            id: merchant.id,
            data: {
              merchant_latitude: doc.latitude,
              merchant_longitude: doc.longitude,
              merchant_coordinates: {
                type: 'Point',
                coordinates: [doc.longitude, doc.latitude]
              },
              last_location_sync: new Date().toISOString(),
              is_location_verified: true
            }
          });
        }
      }
    }
  }
]
```

### 4. Merchant Collection Hook

Update `apps/cms/src/collections/Merchants.ts` afterChange hook:
```typescript
afterChange: [
  async ({ doc, req, operation }) => {
    if (operation === 'update' && doc.active_address_id) {
      // Get the address
      const address = await req.payload.findByID({
        collection: 'addresses',
        id: doc.active_address_id
      });

      if (address) {
        // If address has coordinates, sync to merchant
        if (address.latitude && address.longitude) {
          await req.payload.update({
            collection: 'merchants',
            id: doc.id,
            data: {
              merchant_latitude: address.latitude,
              merchant_longitude: address.longitude,
              merchant_coordinates: {
                type: 'Point',
                coordinates: [address.longitude, address.latitude]
              },
              last_location_sync: new Date().toISOString(),
              is_location_verified: true
            }
          });
        }
        // If address has no coordinates but has formatted_address, trigger geocoding
        else if (address.formatted_address) {
          try {
            const googleMaps = new GoogleMapsService();
            const geocoded = await googleMaps.geocodeAddress(address.formatted_address);
            
            // Update address first
            await req.payload.update({
              collection: 'addresses',
              id: address.id,
              data: {
                latitude: geocoded.latitude,
                longitude: geocoded.longitude,
                coordinate_source: 'GOOGLE_GEOCODING',
                last_geocoded_at: new Date().toISOString()
              }
            });

            // Then update merchant
            await req.payload.update({
              collection: 'merchants',
              id: doc.id,
              data: {
                merchant_latitude: geocoded.latitude,
                merchant_longitude: geocoded.longitude,
                merchant_coordinates: {
                  type: 'Point',
                  coordinates: [geocoded.longitude, geocoded.latitude]
                },
                last_location_sync: new Date().toISOString(),
                is_location_verified: true
              }
            });
          } catch (error) {
            console.error('Geocoding failed for merchant:', error);
          }
        }
      }
    }
  }
]
```

### 5. Package Dependencies

Add to `apps/cms/package.json`:
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

## Expected Result

When you set `active_address_id` in merchants table:
1. System checks if the referenced address has coordinates
2. If no coordinates but has formatted_address, Google Maps API geocodes it
3. Coordinates automatically populate in both addresses and merchants tables
4. PostGIS geometry fields are created for spatial queries

## Testing

```javascript
// Test by updating a merchant's active_address_id
await payload.update({
  collection: 'merchants',
  id: 'merchant_id',
  data: {
    active_address_id: 'address_id_with_raw_address'
  }
});

// Check if coordinates were automatically populated
const merchant = await payload.findByID({
  collection: 'merchants',
  id: 'merchant_id'
});

console.log(merchant.merchant_latitude, merchant.merchant_longitude);
```
# Nearby Restaurants Feature Analysis

## CMS Endpoint for Merchant Data

**Endpoint URL:** `/merchant/location-based-display`

**File:** `apps/cms/src/endpoints/merchantLocationBasedDisplay.ts`

## Complete Payload Data Structure

When fetching the `/merchant/location-based-display` endpoint, the response contains the following complete data structure:

### Success Response Format
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": number,
      "activeAddressId": number
    },
    "address": {
      "id": number,
      "latitude": number,
      "longitude": number
    },
    "merchants": [
      {
        "id": number,
        "outletName": string,
        "outletCode": string,
        "merchant_latitude": number,
        "merchant_longitude": number,
        "delivery_radius_meters": number,
        "avg_delivery_time_minutes": number,
        "average_rating": number,
        "total_orders": number,
        "isActive": boolean,
        "isAcceptingOrders": boolean,
        "operationalStatus": "open" | "closed" | "busy" | "temp_closed" | "maintenance",
        "service_area": object,
        "priority_zones": object,
        "restricted_areas": object,
        "delivery_zones": object,
        "vendor_id": number,
        "createdAt": string,
        "updatedAt": string,
        "media": {
          "thumbnail": {
            "id": number,
            "cloudinary_public_id": string,
            "cloudinary_url": string,
            "url": string,
            "thumbnail_url": string,
            "filename": string,
            "alt": string
          } | null,
          "storeFrontImage": {
            "id": number,
            "cloudinary_public_id": string,
            "cloudinary_url": string,
            "url": string,
            "thumbnail_url": string,
            "filename": string,
            "alt": string
          } | null
        },
        "distanceMeters": number,
        "distanceKm": number,
        "isWithinDeliveryRadius": boolean,
        "estimatedDeliveryTime": number,
        "vendor": {
          "id": number,
          "businessName": string,
          "average_rating": number,
          "total_orders": number,
          "cuisineTypes": array,
          "logo": {
            "id": number,
            "cloudinary_public_id": string,
            "cloudinary_url": string,
            "url": string,
            "thumbnail_url": string,
            "filename": string,
            "alt": string
          } | null
        }
      }
    ],
    "totalCount": number,
    "pagination": {
      "totalDocs": number,
      "limit": number,
      "totalPages": number,
      "page": number,
      "pagingCounter": number,
      "hasPrevPage": boolean,
      "hasNextPage": boolean,
      "prevPage": number | null,
      "nextPage": number | null
    },
    "performance": {
      "queryTimeMs": number,
      "searchRadius": number,
      "withinSearchRadius": number,
      "proximityScore": number,
      "optimizationUsed": "postgis_spatial_index"
    }
  },
  "timestamp": string,
  "requestId": string,
  "responseTime": number
}
```

### Request Parameters
- **customerId** (required): Customer ID to get location-based merchants for
- **Authentication**: Requires API key with `service` or `admin` role

### Key Features
- Uses PostGIS spatial queries for accurate distance calculations
- Returns merchants within 50km radius
- Includes complete merchant, vendor, and media information
- Provides distance calculations and delivery estimates
- Includes pagination and performance metrics
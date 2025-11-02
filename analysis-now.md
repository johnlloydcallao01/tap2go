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







# Products Table Payload Data

## Product
```typescript
interface Product {
  id: string;
  createdByVendor?: string | Vendor;
  createdByMerchant?: string | Merchant;
  productType: 'simple' | 'variable' | 'grouped';
  name: string;
  description?: any; // richText
  shortDescription?: string;
  category?: string | ProductCategory;
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  media?: {
    primaryImage?: string | Media;
    images?: (string | Media)[];
  };
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## ProductCategory
```typescript
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | ProductCategory;
  categoryLevel?: number;
  categoryPath?: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Media
```typescript
interface Media {
  id: string;
  alt?: string;
  updatedAt: string;
  createdAt: string;
  url?: string;
  thumbnailURL?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  focalX?: number;
  focalY?: number;
}
```

## Vendor
```typescript
interface Vendor {
  id: string;
  user: string | User;
  businessName: string;
  legalName?: string;
  businessType?: 'restaurant' | 'cafe' | 'bakery' | 'grocery' | 'pharmacy' | 'retail' | 'other';
  cuisineTypes?: ('filipino' | 'chinese' | 'japanese' | 'korean' | 'italian' | 'american' | 'mexican' | 'thai' | 'indian' | 'mediterranean' | 'fast_food' | 'desserts' | 'beverages' | 'healthy' | 'vegetarian' | 'vegan' | 'halal' | 'other')[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

# Vendors Table Payload Data

## Vendor
```typescript
interface Vendor {
  id: string;
  user: string | User;
  businessName: string;
  legalName: string;
  businessRegistrationNumber: string;
  taxIdentificationNumber?: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  websiteUrl?: string;
  businessType: 'restaurant' | 'fast_food' | 'grocery' | 'pharmacy' | 'convenience' | 'bakery' | 'coffee_shop' | 'other';
  cuisineTypes?: any; // JSON array
  isActive?: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  onboardingDate?: string;
  averageRating?: number;
  totalReviews?: number;
  totalOrders?: number;
  totalMerchants?: number;
  businessLicense?: string | Media;
  taxCertificate?: string | Media;
  logo?: string | Media;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  description?: string;
  operatingHours?: any; // JSON
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## User
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer' | 'service';
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

# Merchant Products Table Payload Data

## MerchantProduct
```typescript
interface MerchantProduct {
  id: string;
  merchant_id: string | Merchant;
  product_id: string | Product;
  added_by?: 'vendor' | 'merchant';
  price_override?: number;
  is_active?: boolean;
  is_available?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

# Merchants Table Payload Data

## Merchant
```typescript
interface Merchant {
  id: string;
  vendor: string | Vendor;
  outletName: string;
  outletCode: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    managerName?: string;
    managerPhone?: string;
  };
  isActive?: boolean;
  isAcceptingOrders?: boolean;
  operationalStatus?: 'open' | 'closed' | 'busy' | 'temp_closed' | 'maintenance';
  operatingHours?: any; // JSON
  specialHours?: any; // JSON
  deliverySettings?: {
    minimumOrderAmount?: number;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
    estimatedDeliveryTimeMinutes?: number;
    maxDeliveryTimeMinutes?: number;
  };
  media?: {
    thumbnail?: string | Media;
    storeFrontImage?: string | Media;
    interiorImages?: any; // JSON array
    menuImages?: any; // JSON array
  };
  description?: string;
  specialInstructions?: string;
  tags?: any; // JSON array
  activeAddress?: string | Address;
  merchant_latitude?: number;
  merchant_longitude?: number;
  location_accuracy_radius?: number;
  delivery_radius_meters?: number;
  max_delivery_radius_meters?: number;
  min_order_amount?: number;
  delivery_fee_base?: number;
  delivery_fee_per_km?: number;
  free_delivery_threshold?: number;
  merchant_coordinates?: any; // GeoJSON Point
  service_area_geometry?: any; // PostGIS GEOMETRY
  priority_zones_geometry?: any; // PostGIS GEOMETRY
  restricted_areas_geometry?: any; // PostGIS GEOMETRY
  delivery_zones_geometry?: any; // PostGIS GEOMETRY
  service_area?: any; // GeoJSON
  priority_zones?: any; // GeoJSON
  restricted_areas?: any; // GeoJSON
  delivery_zones?: any; // JSON
  avg_delivery_time_minutes?: number;
  delivery_success_rate?: number;
  peak_hours_multiplier?: number;
  delivery_hours?: any; // JSON
  is_currently_delivering?: boolean;
  next_available_slot?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Address
```typescript
interface Address {
  id: string;
  user: string | User;
  type: 'home' | 'work' | 'business' | 'other';
  label?: string;
  street: string;
  barangay?: string;
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```
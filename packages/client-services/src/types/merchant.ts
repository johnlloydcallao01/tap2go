// Centralized merchant-related type definitions
// This file consolidates all merchant and media interfaces
// to eliminate duplication across components and services

// Media interface from CMS API (reused from course types)
export interface Media {
  id: number | string;
  alt?: string | null;
  cloudinaryPublicId?: string | null;
  cloudinaryURL?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}

// Contact Info interface
export interface ContactInfo {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

// Operating Hours interface
export interface OperatingHours {
  monday?: StoreHoursPeriod[];
  tuesday?: StoreHoursPeriod[];
  wednesday?: StoreHoursPeriod[];
  thursday?: StoreHoursPeriod[];
  friday?: StoreHoursPeriod[];
  saturday?: StoreHoursPeriod[];
  sunday?: StoreHoursPeriod[];
}

export interface SpecialStoreHour {
  date: string;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
  reason?: string;
}

export interface StoreHoursPeriod {
  open: string;
  close: string;
}

// Delivery Settings interface
export interface DeliverySettings {
  deliveryRadius?: number | null;
  minimumOrderAmount?: number | null;
  deliveryFee?: number | null;
  estimatedDeliveryTime?: string | null;
  freeDeliveryThreshold?: number | null;
  estimatedDeliveryTimeMinutes?: number | null;
  maxDeliveryTimeMinutes?: number | null;
}

// Metrics interface
export interface Metrics {
  totalOrders?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  responseTime?: string | null;
}

// Media Collection interface
export interface MerchantMedia {
  thumbnail?: Media | null;
  storeFrontImage?: Media | null;
}

// Compliance interface
export interface Compliance {
  businessPermit?: string | null;
  safetyLicense?: string | null;
  lastInspectionDate?: string | null;
}

// Vendor interface
export interface Vendor {
  id: number;
  businessName: string;
  businessType?: string | null;
  logo?: Media | null;
  description?: string | null;
  isActive?: boolean | null;
}

// Main Merchant interface
export interface Merchant {
  id: string;
  vendor?: Vendor | null;
  outletName: string;
  contactInfo?: ContactInfo | null;
  isActive?: boolean | null;
  isAcceptingOrders?: boolean | null;
  vacationMode?: boolean | null;
  vacationModeEndsAt?: string | null;
  operationalStatus?: 'open' | 'closed' | 'busy' | null;
  operatingHours?: OperatingHours | null;
  delivery_hours?: OperatingHours | null;
  specialHours?: SpecialStoreHour[] | null;
  deliverySettings?: DeliverySettings | null;
  metrics?: Metrics | null;
  media?: MerchantMedia | null;
  menuImages?: Media[] | null;
  compliance?: Compliance | null;
  description?: string | null;
  specialInstructions?: string | null;
  merchant_categories?: Array<{ id?: number | string; name?: string; slug?: string }> | null;
  is_currently_delivering?: boolean | null;
  delivery_radius_meters?: number | null;
  min_order_amount?: number | null;
  delivery_fee_base?: number | null;
  delivery_fee_per_km?: number | null;
  free_delivery_threshold?: number | null;
  avg_delivery_time_minutes?: number | null;
  tags?: string[] | null;
  activeAddress?: {
    formatted_address?: string | null;
    street?: string | null;
    street_number?: string | null;
    route?: string | null;
    subpremise?: string | null;
    floor_unit_room?: string | null;
    barangay?: string | null;
    city?: string | null;
    locality?: string | null;
    administrative_area_level_2?: string | null;
    administrative_area_level_1?: string | null;
    postal_code?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    [key: string]: any;
  } | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  isOpenNow?: boolean;
  nextOpeningAt?: string | null;
  storeHoursStatus?: { isOpen: boolean; reason: string; nextOpeningAt?: string | null };
  timezone?: string | null;
}

// Product Display Interface for Merchant Menu
export interface MerchantProductDisplay {
  id: string | number;
  merchantProductId?: string | number;
  name: string;
  productType: string;
  basePrice: number | null;
  compareAtPrice: number | null;
  shortDescription: string | null;
  imageUrl: string | null;
  categoryIds?: (number | string)[];
  hasRequiredModifiers?: boolean;
}

// Category Display Interface for Merchant Menu
export interface MerchantCategoryDisplay {
  id: number | string;
  name: string;
  slug: string;
  media?: { icon?: Media | null };
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

// Response structure for Merchant Menu
export interface MerchantMenuData {
  products: MerchantProductDisplay[];
  categories: MerchantCategoryDisplay[];
  pagination?: {
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Query parameters for merchant API
export interface MerchantQueryParams {
  isActive?: boolean;
  limit?: number;
  page?: number;
}

// Response interface for merchants API
export interface MerchantsResponse {
  docs: Merchant[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

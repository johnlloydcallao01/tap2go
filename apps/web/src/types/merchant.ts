// Centralized merchant-related type definitions
// This file consolidates all merchant and media interfaces
// to eliminate duplication across components and services

// Media interface from CMS API (reused from course types)
export interface Media {
  id: number;
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

// Address interface matching CMS structure
export interface Address {
  streetAddress: string;
  barangay?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
  country?: string | null;
}

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
}

// Contact Info interface
export interface ContactInfo {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

// Operating Hours interface
export interface OperatingHours {
  monday?: string | null;
  tuesday?: string | null;
  wednesday?: string | null;
  thursday?: string | null;
  friday?: string | null;
  saturday?: string | null;
  sunday?: string | null;
}

// Delivery Settings interface
export interface DeliverySettings {
  deliveryRadius?: number | null;
  minimumOrderAmount?: number | null;
  deliveryFee?: number | null;
  estimatedDeliveryTime?: string | null;
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
  address?: Address | null;
  location?: Location | null;
  contactInfo?: ContactInfo | null;
  isActive?: boolean | null;
  isAcceptingOrders?: boolean | null;
  operationalStatus?: 'open' | 'closed' | 'busy' | null;
  operatingHours?: OperatingHours | null;
  deliverySettings?: DeliverySettings | null;
  metrics?: Metrics | null;
  media?: MerchantMedia | null;
  menuImages?: Media[] | null;
  compliance?: Compliance | null;
  description?: string | null;
  specialInstructions?: string | null;
  tags?: string[] | null;
  updatedAt?: string | null;
  createdAt?: string | null;
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

import { dataCache, CACHE_KEYS, CACHE_TTL } from '../cache/data-cache';

// Interface matching Google Maps Place Result (minimal subset needed for parsing)
export interface GooglePlaceLike {
  formatted_address?: string;
  place_id?: string;
  geometry?: {
    location?: {
      lat: (() => number) | number;
      lng: (() => number) | number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface AddressData {
  formatted_address: string;
  google_place_id: string;
  street_number?: string;
  route?: string;
  barangay?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  address_type?: 'home' | 'work' | 'other';
  is_default?: boolean;
  notes?: string;
  user?: string | number;
}

export interface AddressCreateRequest {
  place: GooglePlaceLike;
  address_type?: 'home' | 'work' | 'other';
  is_default?: boolean;
  notes?: string;
  userId: string | number; // Required for direct CMS creation
}

export interface AddressResponse {
  success: boolean;
  address?: any;
  addresses?: any[];
  total?: number;
  message?: string;
  error?: string;
  details?: any;
}

export class AddressService {
  // Cross-platform API URL handling
  private static readonly API_BASE = 
    process.env.NEXT_PUBLIC_API_URL || 
    process.env.EXPO_PUBLIC_API_URL || 
    'https://cms.tap2goph.com/api';

  private static readonly COLLECTION_SLUG = 'addresses';

  private static readonly PAYLOAD_API_KEY =
    process.env.NEXT_PUBLIC_PAYLOAD_API_KEY ||
    process.env.EXPO_PUBLIC_PAYLOAD_API_KEY ||
    '';

  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.PAYLOAD_API_KEY) {
      headers['Authorization'] = `users API-Key ${this.PAYLOAD_API_KEY}`;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Parse Google Place data into PayloadCMS AddressData structure
   * Replicates logic from apps/web/src/app/api/addresses/route.ts
   */
  private static parsePlaceData(
    place: GooglePlaceLike, 
    extras: { address_type?: 'home' | 'work' | 'other'; is_default?: boolean; notes?: string; userId: string | number }
  ): AddressData {
    const { address_type = 'other', is_default = false, notes, userId } = extras;

    const addressData: AddressData = {
      formatted_address: place.formatted_address || '',
      google_place_id: place.place_id || '',
      
      // Handle both function-based (Google Maps JS API) and direct property access (React Native / serialized)
      latitude: typeof place.geometry?.location?.lat === 'function' 
        ? place.geometry.location.lat() 
        : (place.geometry?.location?.lat as number | undefined),
      longitude: typeof place.geometry?.location?.lng === 'function' 
        ? place.geometry.location.lng() 
        : (place.geometry?.location?.lng as number | undefined),
      
      address_type,
      is_default,
      notes,
      country: 'Philippines', // Default
      user: userId,
    };

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        
        if (types.includes('street_number')) {
          addressData.street_number = component.long_name;
        } else if (types.includes('route')) {
          addressData.route = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          addressData.barangay = component.long_name;
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          addressData.locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressData.administrative_area_level_1 = component.long_name;
        } else if (types.includes('country')) {
          addressData.country = component.long_name;
        } else if (types.includes('postal_code')) {
          addressData.postal_code = component.long_name;
        }
      }
    }

    return addressData;
  }

  /**
   * Save a new address directly to CMS
   */
  static async saveAddress(request: AddressCreateRequest, token: string): Promise<AddressResponse> {
    try {
      // Parse the place data client-side
      const addressData = this.parsePlaceData(request.place, {
        address_type: request.address_type,
        is_default: request.is_default,
        notes: request.notes,
        userId: request.userId
      });

      // If default, we might need to unset other defaults. 
      // This is complex to do in one request without a custom endpoint.
      // For now, we'll just create the address. The backend hook or separate call should handle default toggling.
      // Ideally, we replicate the "unset others" logic if possible, but that requires multiple calls.
      if (request.is_default) {
        try {
          // Unset other defaults for this user
          await fetch(`${this.API_BASE}/${this.COLLECTION_SLUG}?where[user][equals]=${request.userId}&where[is_default][equals]=true`, {
            method: 'PATCH',
            headers: this.getHeaders(token),
            body: JSON.stringify({ is_default: false })
          });
        } catch (e) {
          console.warn('Failed to unset default addresses', e);
        }
      }

      const response = await fetch(`${this.API_BASE}/${this.COLLECTION_SLUG}`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Failed to create address');
      }

      // Update cache
      this.clearCache();

      return {
        success: true,
        address: data.doc || data, // Payload response structure
        message: 'Address created successfully'
      };
    } catch (error) {
      console.error('Error saving address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user addresses
   */
  static async getUserAddresses(userId: string | number, token: string, useCache: boolean = true): Promise<AddressResponse> {
    try {
      if (useCache) {
        const cached = this.getCachedAddresses();
        if (cached) return { success: true, addresses: cached };
      }

      const response = await fetch(`${this.API_BASE}/${this.COLLECTION_SLUG}?where[user][equals]=${userId}&sort=-createdAt`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Failed to fetch addresses');
      }

      const addresses = data.docs || [];
      this.updateCache(addresses);

      return {
        success: true,
        addresses,
        total: data.totalDocs
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete address
   */
  static async deleteAddress(addressId: string, token: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${this.COLLECTION_SLUG}/${addressId}`, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Failed to delete address');
      }

      this.removeAddressFromCache(addressId);

      return {
        success: true,
        message: 'Address deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get active address for a user (via Customer relation)
   */
  static async getActiveAddress(userId: string | number, token: string): Promise<AddressResponse> {
    try {
      // 1. Fetch customer for this user
      const customerRes = await fetch(`${this.API_BASE}/customers?where[user][equals]=${userId}&depth=1`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      const customerData = await customerRes.json();
      
      if (!customerRes.ok) {
        throw new Error('Failed to fetch customer profile');
      }

      const customer = customerData.docs?.[0];
      
      if (!customer) {
        // No customer profile yet
        return { success: false, message: 'Customer profile not found' };
      }

      // 2. Return active address if exists
      if (customer.activeAddress && typeof customer.activeAddress === 'object') {
        return {
          success: true,
          address: customer.activeAddress
        };
      } else if (customer.activeAddress) {
        // If it's just an ID (shouldn't be with depth=1, but safety check)
         // Fetch the address details
         const addressRes = await fetch(`${this.API_BASE}/${this.COLLECTION_SLUG}/${customer.activeAddress}`, {
           headers: this.getHeaders(token)
         });
         const addressData = await addressRes.json();
         if (addressRes.ok) {
           return { success: true, address: addressData };
         }
      }

      return { success: false, message: 'No active address set' };
    } catch (error) {
      console.error('Error fetching active address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Set active address for a user (Look up customer first)
   */
  static async setActiveAddressForUser(userId: string | number, addressId: string | number, token: string): Promise<AddressResponse> {
    try {
      // 1. Fetch customer for this user to get ID
      const customerRes = await fetch(`${this.API_BASE}/customers?where[user][equals]=${userId}&depth=0`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      const customerData = await customerRes.json();
      
      if (!customerRes.ok) {
        throw new Error('Failed to fetch customer profile');
      }

      const customer = customerData.docs?.[0];
      
      if (!customer) {
        return { success: false, message: 'Customer profile not found' };
      }

      // 2. Set active address
      return this.setActiveAddress(customer.id, addressId, token);
    } catch (error) {
      console.error('Error setting active address for user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Set active address (Customer level)
   * Note: This interacts with the 'customers' collection, matching logic in apps/web/src/lib/services/address-service.ts
   * But here we call CMS directly.
   */
  static async setActiveAddress(customerId: string | number, addressId: string | number, token: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/customers/${customerId}`, {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify({ activeAddress: addressId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'Failed to set active address');
      }

      return {
        success: true,
        address: data.doc?.activeAddress || data.activeAddress,
        message: 'Active address updated'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === Cache Helpers ===

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < (CACHE_TTL.ADDRESSES * 60 * 1000);
  }

  static getCachedAddresses(): any[] | null {
    const cached = dataCache.get<{ addresses: any[], timestamp: number }>(CACHE_KEYS.ADDRESSES);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.addresses;
    }
    return null;
  }

  static updateCache(addresses: any[]): void {
    dataCache.set(CACHE_KEYS.ADDRESSES, {
      addresses,
      timestamp: Date.now()
    }, CACHE_TTL.ADDRESSES);
  }

  static clearCache(): void {
    dataCache.delete(CACHE_KEYS.ADDRESSES);
  }

  static removeAddressFromCache(addressId: string): void {
    const cached = this.getCachedAddresses();
    if (cached) {
      const updated = cached.filter(a => a.id !== addressId);
      this.updateCache(updated);
    }
  }
}

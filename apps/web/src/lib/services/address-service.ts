/**
 * @file apps/web/src/lib/services/address-service.ts
 * @description Client-side service for address operations
 * Handles API calls for storing and retrieving user addresses
 */

import { dataCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/data-cache';

interface AddressCreateRequest {
  place: google.maps.places.PlaceResult;
  address_type?: 'home' | 'work' | 'billing' | 'shipping' | 'pickup' | 'delivery';
  is_default?: boolean;
  notes?: string;
}

interface AddressResponse {
  success: boolean;
  address?: any;
  addresses?: any[];
  total?: number;
  message?: string;
  error?: string;
  details?: any;
}

interface AddressCache {
  addresses: any[];
  timestamp: number;
  userId?: string | number;
}

export class AddressService {
  private static readonly API_BASE = '/api/addresses';
  private static readonly CACHE_DURATION = CACHE_TTL.ADDRESSES * 60 * 1000; // Convert minutes to milliseconds

  /**
   * Get the authorization token from localStorage
   */
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('grandline_auth_token');
    console.log('🔑 Auth token retrieved:', token ? 'Token exists' : 'No token found');
    return token;
  }

  /**
   * Get headers for API requests
   */
  private static getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
    console.log('📋 Creating headers with token:', token ? 'Token present' : 'No token');
    console.log('🔑 API key available:', apiKey ? 'Yes' : 'No');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header added (Bearer token)');
    } else if (apiKey) {
      // Fallback to API key if no user token (same format as MerchantClientService)
      headers['Authorization'] = `users API-Key ${apiKey}`;
      console.log('✅ Authorization header added (API Key fallback)');
    } else {
      console.warn('⚠️ No authorization token or API key available');
    }

    return headers;
  }

  /**
   * Save a new address
   */
  static async saveAddress(request: AddressCreateRequest): Promise<AddressResponse> {
    try {
      console.log('🏠 Starting address save request:', {
        hasPlace: !!request.place,
        addressType: request.address_type,
        isDefault: request.is_default,
        hasNotes: !!request.notes
      });

      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        // Handle error response more robustly
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.log('📋 Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details || errorData;
        } catch (parseError) {
          console.warn('⚠️ Failed to parse error response as JSON:', parseError);
          // Try to get response as text
          try {
            const errorText = await response.text();
            console.log('📋 Error response text:', errorText);
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            console.warn('⚠️ Failed to get error response as text:', textError);
          }
        }

        console.error('❌ Address save failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails
        });
        
        throw new Error(errorMessage);
      }

      const data: AddressResponse = await response.json();
      console.log('📋 API Response data:', data);

      // Update cache with new address if successful
      if (data.success && data.address) {
        this.updateCacheOptimized(data.address);
        
        // If this is set as default, clear cache to force refresh
        if (request.is_default) {
          this.clearCache();
        }
      }

      console.log('✅ Address saved successfully');
      return data;
    } catch (error) {
      console.error('💥 Error saving address:', error);
      throw error;
    }
  }

  /**
   * Get all addresses for the current user with improved error handling
   */
  static async getUserAddresses(useCache: boolean = true): Promise<AddressResponse> {
    try {
      // Check cache first if enabled
      if (useCache) {
        const cachedAddresses = this.getCachedAddresses();
        if (cachedAddresses) {
          console.log('📦 Using cached addresses:', cachedAddresses.length);
          return { success: true, addresses: cachedAddresses };
        }
      }

      console.log('🌐 Fetching addresses from API');
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // Use default error message if parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const data: AddressResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch addresses');
      }

      // Update cache with fetched addresses
      if (data.addresses) {
        console.log('✅ Fetched addresses successfully:', data.addresses.length);
        this.updateCache(data.addresses);
      } else {
        console.log('✅ No addresses found for user');
        this.updateCache([]);
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      
      // If we have cached data and the error is network-related, use cache as fallback
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') || 
        error.message.includes('Server error')
      )) {
        const cachedAddresses = this.getCachedAddresses();
        if (cachedAddresses) {
          console.log('🔄 Using cached addresses as fallback due to network error');
          return { success: true, addresses: cachedAddresses };
        }
      }
      
      throw error;
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(addressId: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${addressId}/default`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Clear cache to force refresh since default status changed
      if (data.success) {
        this.clearCache();
      }

      return data;
    } catch (error) {
      console.error('Error setting default address:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set default address' 
      };
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${addressId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data: AddressResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Remove from cache if successful
      if (data.success) {
        this.removeAddressFromCache(addressId);
      }

      return data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Update an address
   */
  static async updateAddress(addressId: string, updates: Partial<AddressCreateRequest>): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${addressId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const data: AddressResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Clear cache to force refresh since address was updated
      if (data.success) {
        this.clearCache();
      }

      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // === ACTIVE ADDRESS MANAGEMENT ===
  
  /**
   * Get customer ID from user ID using Next.js API route
   */
  private static async getCustomerIdFromUserId(userId: string | number): Promise<string | null> {
    try {
      // Use Next.js API route instead of direct PayloadCMS call
      const response = await fetch(`/api/customers/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch customer by user ID:', response.status);
        return null;
      }

      const data = await response.json();
      if (data.success && data.customer) {
        return data.customer.id;
      }
      
      console.error('No customer found for user ID:', userId);
      return null;
    } catch (error) {
      console.error('Error getting customer ID from user ID:', error);
      return null;
    }
  }
  
  // Set customer's active address (truly persistent) - Using customers table instead of users
  static async setActiveAddress(userId: string | number, addressId: string | number | null): Promise<AddressResponse> {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🔄 [${requestId}] === SET ACTIVE ADDRESS REQUEST STARTED ===`);
    
    // DEBUG: Check environment variables
    console.log(`🔍 [${requestId}] Environment Check:`, {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      API_BASE: this.API_BASE,
      windowLocation: typeof window !== 'undefined' ? window.location.origin : 'SSR'
    });
    
    console.log(`📋 [${requestId}] Request Details:`, {
      userId,
      addressId,
      userIdType: typeof userId,
      addressIdType: typeof addressId,
    });

    try {
      // Step 1: Get customer ID from user ID
      console.log(`🔍 [${requestId}] Getting customer ID from user ID...`);
      const customerId = await this.getCustomerIdFromUserId(userId);
      
      if (!customerId) {
        throw new Error('Customer record not found for this user');
      }
      
      console.log(`✅ [${requestId}] Customer ID found:`, customerId);

      const headers = this.getHeaders();
      console.log(`📤 [${requestId}] Request Headers:`, {
        hasAuth: !!headers['Authorization'],
        contentType: headers['Content-Type'],
        authPreview: headers['Authorization'] ? `${headers['Authorization'].substring(0, 20)}...` : 'None'
      });

      const requestBody = { activeAddress: addressId };
      console.log(`📦 [${requestId}] Request Body:`, requestBody);

      const startTime = Date.now();
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseTime = Date.now() - startTime;
      console.log(`📡 [${requestId}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${responseTime}ms`,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      let data: any;
      try {
        data = await response.json();
        console.log(`📄 [${requestId}] Response Data:`, data);
      } catch (parseError) {
        console.error(`❌ [${requestId}] Failed to parse response JSON:`, parseError);
        const responseText = await response.text();
        console.error(`📄 [${requestId}] Raw Response Text:`, responseText);
        throw new Error(`Failed to parse response: ${parseError}`);
      }

      if (!response.ok) {
        console.error(`❌ [${requestId}] Request failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: data.error || data.errors,
          data
        });
        throw new Error(data.error || data.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`✅ [${requestId}] === SET ACTIVE ADDRESS SUCCESS ===`);
      
      // Update active address cache if successful
      if (data.success) {
        const activeAddress = data.customer?.activeAddress || data.activeAddress;
        if (activeAddress) {
          this.updateActiveAddressInCache(userId, activeAddress);
        } else {
          // Clear active address cache if set to null
          const cacheKey = CACHE_KEYS.ACTIVE_ADDRESS(userId);
          dataCache.delete(cacheKey);
        }
      }
      
      return { 
        success: true, 
        message: 'Active address updated successfully',
        address: data.customer?.activeAddress || data.activeAddress 
      };
    } catch (error) {
      console.error(`💥 [${requestId}] === SET ACTIVE ADDRESS ERROR ===`);
      console.error(`❌ [${requestId}] Error Details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        userId,
        addressId,
        endpoint: `/api/customers/[customerId]`
      });
      throw error;
    }
  }

  // Get customer's active address (from database, not localStorage) - Using Next.js API route proxy
  static async getActiveAddress(userId: string | number, useCache: boolean = true): Promise<AddressResponse> {
    try {
      // Check cache first if enabled
      if (useCache) {
        const cachedAddress = this.getCachedActiveAddress(userId);
        if (cachedAddress) {
          return { success: true, address: cachedAddress };
        }
      }

      console.log('🌐 Fetching active address from API');
      
      // Simplified approach: Get customer ID and active address in one call
      const customerId = await this.getCustomerIdFromUserId(userId);
      
      if (!customerId) {
        console.log('No customer found for user ID:', userId);
        // Fallback: try to get the most recent address from user addresses
        try {
          const addressesResponse = await this.getUserAddresses(useCache);
          if (addressesResponse.success && addressesResponse.addresses && addressesResponse.addresses.length > 0) {
            // Use the most recent address as fallback
            const mostRecentAddress = addressesResponse.addresses
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
            // Update cache with fallback address
            this.updateActiveAddressInCache(userId, mostRecentAddress);
            return { success: true, address: mostRecentAddress };
          }
        } catch (fallbackError) {
          console.error('Fallback address fetch failed:', fallbackError);
        }
        
        return { success: true, address: null };
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, address: null }; // Customer not found or no active address
        }
        const data = await response.json();
        throw new Error(data.error || data.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const activeAddress = responseData.customer?.activeAddress || responseData.activeAddress;
      
      // Update cache with fetched active address
      if (activeAddress) {
        this.updateActiveAddressInCache(userId, activeAddress);
      }
      
      return { success: true, address: activeAddress };
    } catch (error) {
      console.error('Error getting active address:', error);
      
      // Enhanced fallback: try to get any saved address
      try {
        console.log('🔄 Attempting fallback to user addresses...');
        const addressesResponse = await this.getUserAddresses(false); // Skip cache for fallback
        if (addressesResponse.success && addressesResponse.addresses && addressesResponse.addresses.length > 0) {
          // Use the most recent address as fallback
          const mostRecentAddress = addressesResponse.addresses
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          
          console.log('✅ Using fallback address:', mostRecentAddress.formatted_address);
          return { success: true, address: mostRecentAddress };
        }
      } catch (fallbackError) {
        console.error('Fallback address fetch failed:', fallbackError);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get active address' 
      };
    }
  }

  // Caching methods
  static clearCache(): void {
    dataCache.delete(CACHE_KEYS.ADDRESSES);
    // Clear all active address caches
    const cacheKeys = Array.from((dataCache as any).cache.keys()) as string[];
    cacheKeys.forEach(key => {
      if (key.startsWith('active-address-')) {
        dataCache.delete(key);
      }
    });
  }

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  static getCachedAddresses(): any[] | null {
    const cached = dataCache.get<AddressCache>(CACHE_KEYS.ADDRESSES);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.addresses;
    }
    return null;
  }

  static getCachedActiveAddress(userId: string | number): any | null {
    const cacheKey = CACHE_KEYS.ACTIVE_ADDRESS(userId);
    const cached = dataCache.get<{ address: any; timestamp: number }>(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.address;
    }
    return null;
  }

  static updateCache(addresses: any[], userId?: string | number): void {
    const cacheData: AddressCache = {
      addresses,
      timestamp: Date.now(),
      userId
    };
    dataCache.set(CACHE_KEYS.ADDRESSES, cacheData, CACHE_TTL.ADDRESSES);
  }

  static updateCacheOptimized(newAddress: any, userId?: string | number): void {
    const cached = dataCache.get<AddressCache>(CACHE_KEYS.ADDRESSES);
    if (cached && this.isCacheValid(cached.timestamp)) {
      // Ensure the new address has all required fields before adding to cache
      if (newAddress && newAddress.formatted_address && newAddress.id) {
        // Add new address to existing cache
        const updatedAddresses = [...cached.addresses, newAddress];
        this.updateCache(updatedAddresses, userId);
      } else {
        // If new address is incomplete, clear cache to force fresh fetch
        console.warn('New address is incomplete, clearing cache to force fresh fetch:', newAddress);
        this.clearCache();
      }
    }
  }

  static removeAddressFromCache(addressId: string): void {
    const cached = dataCache.get<AddressCache>(CACHE_KEYS.ADDRESSES);
    if (cached && this.isCacheValid(cached.timestamp)) {
      const updatedAddresses = cached.addresses.filter(addr => addr.id !== addressId);
      this.updateCache(updatedAddresses, cached.userId);
    }
  }

  static updateActiveAddressInCache(userId: string | number, address: any): void {
    const cacheKey = CACHE_KEYS.ACTIVE_ADDRESS(userId);
    const cacheData = {
      address,
      timestamp: Date.now()
    };
    dataCache.set(cacheKey, cacheData, CACHE_TTL.ACTIVE_ADDRESS);
  }
}

export default AddressService;
/**
 * @file apps/web/src/lib/services/address-service.ts
 * @description Client-side service for address operations
 * Handles API calls for storing and retrieving user addresses
 */

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

// Cache interface for addresses
interface AddressCache {
  addresses: any[];
  activeAddress: any | null;
  timestamp: number;
  userId: string | number;
}

export class AddressService {
  private static readonly API_BASE = '/api/addresses';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private static addressCache: AddressCache | null = null;

  /**
   * Clear the address cache
   */
  private static clearCache(): void {
    console.log('🗑️ Clearing address cache');
    this.addressCache = null;
  }

  /**
   * Check if cache is valid for the given user
   */
  private static isCacheValid(userId: string | number): boolean {
    if (!this.addressCache) return false;
    if (this.addressCache.userId !== userId) return false;
    
    const now = Date.now();
    const isValid = (now - this.addressCache.timestamp) < this.CACHE_DURATION;
    
    console.log('🔍 Cache validity check:', {
      hasCache: !!this.addressCache,
      userMatch: this.addressCache.userId === userId,
      age: now - this.addressCache.timestamp,
      maxAge: this.CACHE_DURATION,
      isValid
    });
    
    return isValid;
  }

  /**
   * Get cached addresses for user
   */
  private static getCachedAddresses(userId: string | number): any[] | null {
    if (!this.isCacheValid(userId)) return null;
    
    // Don't return empty arrays as valid cache - let it fetch fresh data
    if (!this.addressCache?.addresses || this.addressCache.addresses.length === 0) {
      console.log('📦 Cache has no addresses, will fetch fresh data');
      return null;
    }
    
    console.log('📦 Using cached addresses:', this.addressCache.addresses.length);
    return this.addressCache.addresses;
  }

  /**
   * Get cached active address for user
   */
  private static getCachedActiveAddress(userId: string | number): any | null {
    if (!this.isCacheValid(userId)) return null;
    console.log('📦 Using cached active address:', !!this.addressCache?.activeAddress);
    return this.addressCache?.activeAddress || null;
  }

  /**
   * Update cache with new data
   */
  private static updateCache(userId: string | number, addresses?: any[], activeAddress?: any): void {
    const now = Date.now();
    
    if (!this.addressCache || this.addressCache.userId !== userId) {
      // Create new cache entry
      this.addressCache = {
        userId,
        addresses: addresses || [],
        activeAddress: activeAddress || null,
        timestamp: now
      };
    } else {
      // Update existing cache
      if (addresses !== undefined) {
        this.addressCache.addresses = addresses;
      }
      if (activeAddress !== undefined) {
        this.addressCache.activeAddress = activeAddress;
      }
      this.addressCache.timestamp = now;
    }
    
    console.log('💾 Cache updated:', {
      userId,
      addressCount: this.addressCache.addresses.length,
      hasActiveAddress: !!this.addressCache.activeAddress,
      timestamp: new Date(this.addressCache.timestamp).toISOString()
    });
    
    // If we're caching empty addresses, clear the cache instead
    if (this.addressCache.addresses.length === 0) {
      console.log('🗑️ Clearing cache due to empty addresses array');
      this.addressCache = null;
    }
  }

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
   * Save a new address (with cache invalidation)
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

      // Clear cache when address is saved to force refresh
      this.clearCache();

      console.log('✅ Address saved successfully');
      return data;
    } catch (error) {
      console.error('💥 Error saving address:', error);
      throw error;
    }
  }

  /**
   * Get all addresses for the current user (with caching)
   */
  static async getUserAddresses(userId?: string | number): Promise<AddressResponse> {
    try {
      // Try to get from cache first if userId is provided
      if (userId) {
        const cachedAddresses = this.getCachedAddresses(userId);
        if (cachedAddresses) {
          console.log('📦 Returning cached addresses');
          return { success: true, addresses: cachedAddresses };
        }
      }

      console.log('🌐 Fetching addresses from API');
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data: AddressResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Update cache if userId is provided and we have addresses
      if (userId && data.addresses) {
        this.updateCache(userId, data.addresses);
      }

      return data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(addressId: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/${addressId}/set-default`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      const data: AddressResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  /**
   * Delete an address (with cache invalidation)
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

      // Clear cache when address is deleted to force refresh
      this.clearCache();

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

      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // === ACTIVE ADDRESS MANAGEMENT ===
  
  /**
   * Get customer ID from user ID
   */
  private static async getCustomerIdFromUserId(userId: string | number): Promise<string | null> {
    try {
      // Use proper authentication headers for PayloadCMS API
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${process.env.NEXT_PUBLIC_PAYLOAD_API_KEY}`,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api'}/customers?where[user][equals]=${userId}&limit=1`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error('Failed to fetch customer by user ID:', response.status);
        return null;
      }

      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        return data.docs[0].id;
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
      
      // Clear cache when active address is updated to force refresh
      this.clearCache();
      
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

  // Get customer's active address (from database, not localStorage) - Using Next.js API route proxy (with caching)
  static async getActiveAddress(userId: string | number): Promise<AddressResponse> {
    try {
      // Try to get from cache first
      const cachedActiveAddress = this.getCachedActiveAddress(userId);
      if (cachedActiveAddress) {
        console.log('📦 Returning cached active address');
        return { success: true, address: cachedActiveAddress };
      }

      console.log('🌐 Fetching active address from API');
      
      // Step 1: Get customer ID from user ID
      const customerId = await this.getCustomerIdFromUserId(userId);
      
      if (!customerId) {
        console.log('No customer found for user ID:', userId);
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
      
      // Update cache with the active address
      this.updateCache(userId, undefined, activeAddress);
      
      return { success: true, address: activeAddress };
    } catch (error) {
      console.error('Error getting active address:', error);
      throw error;
    }
  }

  /**
   * Update cache with optimized partial updates
   */
  private static updateCacheOptimized(
    userId: string | number, 
    addresses?: any[], 
    activeAddress?: any,
    operation?: 'delete' | 'setActive' | 'add'
  ) {
    const now = Date.now();
    
    // Initialize cache if it doesn't exist
    if (!this.addressCache) {
      this.addressCache = {
        userId: userId.toString(),
        addresses: addresses || [],
        activeAddress: activeAddress || null,
        timestamp: now
      };
      return;
    }

    // Update timestamp
    this.addressCache.timestamp = now;

    // Handle different operations
    if (operation === 'delete' && addresses) {
      this.addressCache.addresses = addresses;
      // Clear active address if it was deleted
      const activeAddress = this.addressCache.activeAddress;
      if (activeAddress && !addresses.find(addr => addr.id === activeAddress.id)) {
        this.addressCache.activeAddress = null;
      }
    } else if (operation === 'setActive' && activeAddress) {
      this.addressCache.activeAddress = activeAddress;
      // Update the address in the addresses array to reflect active status
      const addressIndex = this.addressCache.addresses.findIndex(addr => addr.id === activeAddress.id);
      if (addressIndex !== -1) {
        this.addressCache.addresses[addressIndex] = { ...this.addressCache.addresses[addressIndex], ...activeAddress };
      }
    } else if (operation === 'add' && addresses) {
      this.addressCache.addresses = addresses;
      if (activeAddress) {
        this.addressCache.activeAddress = activeAddress;
      }
    }

    console.log('💾 Cache updated optimized:', {
      userId,
      operation,
      addressCount: this.addressCache.addresses.length,
      hasActiveAddress: !!this.addressCache.activeAddress
    });
  }

  /**
   * Remove a specific address from cache
   */
  private static removeAddressFromCache(userId: string | number, addressId: string) {
    if (!this.addressCache || this.addressCache.userId !== userId.toString()) {
      return;
    }

    // Remove the address from the addresses array
    this.addressCache.addresses = this.addressCache.addresses.filter(addr => addr.id !== addressId);
    
    // Clear active address if it was the one deleted
    if (this.addressCache.activeAddress?.id === addressId) {
      this.addressCache.activeAddress = null;
    }

    this.addressCache.timestamp = Date.now();

    console.log('🗑️ Address removed from cache:', {
      userId,
      addressId,
      remainingCount: this.addressCache.addresses.length
    });
  }

  /**
   * Update active address in cache
   */
  private static updateActiveAddressInCache(userId: string | number, addressId: string) {
    if (!this.addressCache || this.addressCache.userId !== userId.toString()) {
      return;
    }

    // Find and set the active address
    const address = this.addressCache.addresses.find(addr => addr.id === addressId);
    if (address) {
      this.addressCache.activeAddress = { ...address, is_active: true };
      this.addressCache.timestamp = Date.now();

      console.log('🎯 Active address updated in cache:', {
        userId,
        addressId,
        activeAddress: this.addressCache.activeAddress
      });
    }
  }
}

export default AddressService;
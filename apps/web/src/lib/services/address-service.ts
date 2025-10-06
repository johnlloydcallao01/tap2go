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

export class AddressService {
  private static readonly API_BASE = '/api/addresses';

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

      console.log('✅ Address saved successfully');
      return data;
    } catch (error) {
      console.error('💥 Error saving address:', error);
      throw error;
    }
  }

  /**
   * Get all addresses for the current user
   */
  static async getUserAddresses(): Promise<AddressResponse> {
    try {
      console.log('🌐 Fetching addresses from API');
      const response = await fetch(this.API_BASE, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data: AddressResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
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
  static async getActiveAddress(userId: string | number): Promise<AddressResponse> {
    try {
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
      
      return { success: true, address: activeAddress };
    } catch (error) {
      console.error('Error getting active address:', error);
      throw error;
    }
  }
}

export default AddressService;
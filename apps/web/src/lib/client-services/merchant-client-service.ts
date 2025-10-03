"use client";

import type { Merchant } from '@/types/merchant';

export interface MerchantsResponse {
  docs: Merchant[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MerchantServiceOptions {
  isActive?: boolean;
  limit?: number;
  page?: number;
}

export class MerchantClientService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
  
  /**
   * Fetch merchants from CMS (Client-side)
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getMerchants(options: MerchantServiceOptions = {}): Promise<Merchant[]> {
    const {
      isActive = true,
      limit = 8,
      page = 1
    } = options;

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add isActive filter if specified
      if (isActive !== undefined) {
        params.append('where[isActive][equals]', isActive.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants?${params}&depth=2`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merchants: ${response.status}`);
      }
      
      const data: MerchantsResponse = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching merchants:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Fetch individual merchant by ID from CMS (Client-side)
   */
  static async getMerchantById(id: string): Promise<Merchant | null> {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants/${id}?depth=3`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Merchant not found
        }
        throw new Error(`Failed to fetch merchant: ${response.status}`);
      }
      
      const merchant: Merchant = await response.json();
      return merchant;
    } catch (error) {
      console.error('Error fetching merchant by ID:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Get merchant count for pagination/display purposes (Client-side)
   */
  static async getMerchantCount(isActive: boolean = true): Promise<number> {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const params = new URLSearchParams({
        limit: '1', // Minimal fetch for count
        page: '1',
      });

      // Add isActive filter if specified
      if (isActive !== undefined) {
        params.append('where[isActive][equals]', isActive.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant count: ${response.status}`);
      }
      
      const data: MerchantsResponse = await response.json();
      return data.totalDocs || 0;
    } catch (error) {
      console.error('Error fetching merchant count:', error);
      return 0;
    }
  }
}

// Export convenience functions
export const getMerchantsClient = MerchantClientService.getMerchants;
export const getMerchantByIdClient = MerchantClientService.getMerchantById;
export const getMerchantCountClient = MerchantClientService.getMerchantCount;
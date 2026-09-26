import { useQuery } from '@tanstack/react-query';
import { AddressService } from '../services/address-service';

export const ADDRESS_KEYS = {
  all: ['addresses'] as const,
  active: (userId: string) => [...ADDRESS_KEYS.all, 'active', userId] as const,
};

interface ActiveAddressOptions {
  /** Gate the fetch (e.g. only when a modal is visible). Default true. */
  enabled?: boolean;
}

export function useActiveAddress(userId?: string, token?: string, options?: ActiveAddressOptions) {
  return useQuery({
    queryKey: ADDRESS_KEYS.active(userId || ''),
    queryFn: async () => {
      if (!userId || !token) return null;
      
      // 1. Try to get explicitly active address
      const response = await AddressService.getActiveAddress(userId, token);
      if (response.success && response.address) {
        return response.address;
      }
      
      // 2. Fallback: Get most recent user address
      const addressesResponse = await AddressService.getUserAddresses(userId, token, false);
      if (addressesResponse.success && addressesResponse.addresses && addressesResponse.addresses.length > 0) {
        return addressesResponse.addresses[0];
      }
      
      return null;
    },
    enabled: (options?.enabled ?? true) && !!userId && !!token,
  });
}

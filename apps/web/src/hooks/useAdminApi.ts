import { useState } from 'react';
import { auth } from '@/lib/firebase';

// Custom hook for admin API operations
export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAdminRequest = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Get the user's ID token from Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const token = await currentUser.getIdToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/admin${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Driver operations - DEPRECATED: Moved to apps/web-driver
  const approveDriver = async (driverUid: string) => {
    console.warn('Driver operations have been moved to apps/web-driver');
    throw new Error('Driver operations have been moved to apps/web-driver');
  };

  const rejectDriver = async (driverUid: string, reason?: string) => {
    console.warn('Driver operations have been moved to apps/web-driver');
    throw new Error('Driver operations have been moved to apps/web-driver');
  };

  const getPendingDrivers = async () => {
    console.warn('Driver operations have been moved to apps/web-driver');
    throw new Error('Driver operations have been moved to apps/web-driver');
  };

  const getDriverAnalytics = async () => {
    console.warn('Driver operations have been moved to apps/web-driver');
    throw new Error('Driver operations have been moved to apps/web-driver');
  };

  // Vendor operations
  const approveVendor = async (vendorUid: string) => {
    return makeAdminRequest('/vendors/approve', {
      method: 'POST',
      body: JSON.stringify({ vendorUid }),
    });
  };

  const rejectVendor = async (vendorUid: string, reason?: string) => {
    return makeAdminRequest('/vendors/reject', {
      method: 'POST',
      body: JSON.stringify({ vendorUid, reason }),
    });
  };

  const getPendingVendors = async () => {
    return makeAdminRequest('/vendors/pending');
  };

  const getVendorAnalytics = async () => {
    return makeAdminRequest('/vendors/analytics');
  };

  // Order operations
  const getOrderAnalytics = async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return makeAdminRequest(`/orders/analytics${queryString ? `?${queryString}` : ''}`);
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    return makeAdminRequest('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason }),
    });
  };

  // User operations
  const suspendUser = async (userUid: string, reason: string) => {
    return makeAdminRequest('/users/suspend', {
      method: 'POST',
      body: JSON.stringify({ userUid, reason }),
    });
  };

  const getUserAnalytics = async () => {
    return makeAdminRequest('/users/analytics');
  };

  const searchUsers = async (searchTerm: string) => {
    return makeAdminRequest(`/users/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return {
    loading,
    error,
    // Driver operations
    approveDriver,
    rejectDriver,
    getPendingDrivers,
    getDriverAnalytics,
    // Vendor operations
    approveVendor,
    rejectVendor,
    getPendingVendors,
    getVendorAnalytics,
    // Order operations
    getOrderAnalytics,
    cancelOrder,
    // User operations
    suspendUser,
    getUserAnalytics,
    searchUsers,
  };
};

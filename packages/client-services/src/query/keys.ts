/**
 * Shared query keys — single source of truth so web-admin, web-merchant,
 * web-driver etc. never diverge and never double-cache the same resource.
 */
export const QUERY_KEYS = {
  adminDashboard: ['admin', 'dashboard', 'overview'] as const,
  adminAnalytics: (params?: string) =>
    ['admin', 'dashboard', 'analytics', params ?? 'default'] as const,
  adminReports: (range?: string) =>
    ['admin', 'dashboard', 'reports', range ?? 'default'] as const,
  adminVendors: (params?: string) =>
    ['admin', 'vendors', params ?? 'default'] as const,
  merchantDashboard: (merchantId?: string) =>
    ['merchant', 'dashboard', merchantId ?? 'me'] as const,
} as const;

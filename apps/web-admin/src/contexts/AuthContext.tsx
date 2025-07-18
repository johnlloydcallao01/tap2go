/**
 * Admin Authentication Context - Using Shared Auth Package
 * This file uses the shared authentication package for consistency across apps
 */

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Import from shared authentication package
import { AdminAuthProvider, useAdminAuth } from '@tap2go/shared-auth';

// Re-export for backward compatibility and app-specific usage
export { AdminAuthProvider, useAdminAuth };

// Default export for convenience
export default AdminAuthProvider;

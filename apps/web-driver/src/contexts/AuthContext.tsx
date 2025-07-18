/**
 * Driver Authentication Context - Using Shared Auth Package
 * This file now uses the shared authentication package for consistency across apps
 */

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Import from shared authentication package
import { DriverAuthProvider, useDriverAuth } from '@tap2go/shared-auth';

// Re-export for backward compatibility
export { DriverAuthProvider, useDriverAuth };

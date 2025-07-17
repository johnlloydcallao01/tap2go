/**
 * Authentication types for Driver App - Using Shared Auth Package
 * Re-exports types from shared authentication package for backward compatibility
 */

// Import from shared authentication package
import {
  DriverUser,
  DriverAuthContextType,
  AuthProviderProps
} from 'shared-auth';

// Re-export for backward compatibility
export type { DriverUser, DriverAuthContextType, AuthProviderProps };

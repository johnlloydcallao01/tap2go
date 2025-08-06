/**
 * Authentication Utilities
 * 
 * Utility functions for authentication, authorization, and user management.
 */

import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../types/user';

/**
 * Get current user from session/token
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Try to get token from cookies first
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    // Verify the session token
    const decodedToken = await getAuth().verifySessionCookie(sessionToken, true);
    
    // Get user data from database
    const user = await getUserById(decodedToken.uid);
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // TODO: Implement actual database lookup
    // This is a placeholder - replace with your actual user service
    
    // For now, get user from Firebase Auth
    const userRecord = await getAuth().getUser(userId);
    
    const user: User = {
      id: userRecord.uid,
      email: userRecord.email || '',
      name: userRecord.displayName || userRecord.email || 'Unknown User',
      role: (userRecord.customClaims?.role as 'customer' | 'vendor' | 'driver' | 'admin') || 'customer',
      phone: userRecord.phoneNumber || undefined,
      profileImage: userRecord.photoURL || undefined,
      isActive: !userRecord.disabled,
      isVerified: userRecord.emailVerified,
      createdAt: new Date(userRecord.metadata.creationTime),
      updatedAt: new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime),
    };

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: string | string[]): boolean {
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user has vendor privileges
 */
export function isVendor(user: User | null): boolean {
  return hasRole(user, ['vendor', 'admin']);
}

/**
 * Check if user has driver privileges
 */
export function isDriver(user: User | null): boolean {
  return hasRole(user, ['driver', 'admin']);
}

/**
 * Check if user has customer privileges
 */
export function isCustomer(user: User | null): boolean {
  return hasRole(user, ['customer', 'admin']);
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  user: User | null,
  resource: string,
  action: 'read' | 'write' | 'delete' = 'read'
): boolean {
  if (!user || !user.isActive) return false;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Define resource access rules
  const accessRules: Record<string, Record<string, string[]>> = {
    orders: {
      read: ['customer', 'vendor', 'driver', 'admin'],
      write: ['customer', 'vendor', 'driver', 'admin'],
      delete: ['admin']
    },
    restaurants: {
      read: ['customer', 'vendor', 'driver', 'admin'],
      write: ['vendor', 'admin'],
      delete: ['admin']
    },
    users: {
      read: ['admin'],
      write: ['admin'],
      delete: ['admin']
    },
    analytics: {
      read: ['vendor', 'admin'],
      write: ['admin'],
      delete: ['admin']
    }
  };
  
  const resourceRules = accessRules[resource];
  if (!resourceRules) return false;
  
  const allowedRoles = resourceRules[action];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(user.role);
}

/**
 * Generate secure session token
 */
export async function createSessionToken(userId: string, expiresIn: number = 3600): Promise<string> {
  try {
    // Create custom token
    const customToken = await getAuth().createCustomToken(userId);
    
    // In a real implementation, you might want to create a session cookie
    // For now, return the custom token
    return customToken;
  } catch (error) {
    console.error('Error creating session token:', error);
    throw new Error('Failed to create session token');
  }
}

/**
 * Revoke user session
 */
export async function revokeUserSession(userId: string): Promise<void> {
  try {
    // Revoke all refresh tokens for the user
    await getAuth().revokeRefreshTokens(userId);
  } catch (error) {
    console.error('Error revoking user session:', error);
    throw new Error('Failed to revoke user session');
  }
}

/**
 * Update user custom claims
 */
export async function updateUserClaims(userId: string, claims: Record<string, unknown>): Promise<void> {
  try {
    await getAuth().setCustomUserClaims(userId, claims);
  } catch (error) {
    console.error('Error updating user claims:', error);
    throw new Error('Failed to update user claims');
  }
}

/**
 * Disable user account
 */
export async function disableUser(userId: string): Promise<void> {
  try {
    await getAuth().updateUser(userId, { disabled: true });
  } catch (error) {
    console.error('Error disabling user:', error);
    throw new Error('Failed to disable user');
  }
}

/**
 * Enable user account
 */
export async function enableUser(userId: string): Promise<void> {
  try {
    await getAuth().updateUser(userId, { disabled: false });
  } catch (error) {
    console.error('Error enabling user:', error);
    throw new Error('Failed to enable user');
  }
}

/**
 * Validate user permissions for specific action
 */
export function validateUserPermissions(
  user: User | null,
  requiredRole: string | string[],
  resource?: string,
  action?: 'read' | 'write' | 'delete'
): { valid: boolean; error?: string } {
  if (!user) {
    return { valid: false, error: 'Authentication required' };
  }
  
  if (!user.isActive) {
    return { valid: false, error: 'Account is deactivated' };
  }
  
  if (!hasRole(user, requiredRole)) {
    const roles = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
    return { valid: false, error: `Required role: ${roles}` };
  }
  
  if (resource && action && !canAccessResource(user, resource, action)) {
    return { valid: false, error: `Insufficient permissions for ${action} on ${resource}` };
  }
  
  return { valid: true };
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.email || 'Unknown User';
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: User): boolean {
  return user.isVerified;
}

/**
 * Check if user phone is verified
 */
export function isPhoneVerified(user: User): boolean {
  // TODO: Implement phone verification check
  return Boolean(user.phone);
}

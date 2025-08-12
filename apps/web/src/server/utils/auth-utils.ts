/**
 * Authentication Utilities - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * This file is maintained for future use if authentication is needed.
 */

import { User } from '../types/user';

/**
 * Placeholder function - authentication disabled
 */
export async function getCurrentUser(): Promise<User | null> {
  console.warn('Authentication is disabled in the public web app');
  return null;
}

/**
 * Placeholder function - authentication disabled
 */
export async function getUserById(userId: string): Promise<User | null> {
  console.warn('Authentication is disabled in the public web app');
  return null;
}

/**
 * Placeholder functions - authentication disabled, always return false/true as appropriate
 */
export function hasRole(user: User | null, role: string | string[]): boolean {
  return true; // Allow all access since authentication is disabled
}

export function isAdmin(user: User | null): boolean {
  return false; // No admin functionality in customer app
}

export function isVendor(user: User | null): boolean {
  return false; // No vendor privileges in public app
}

export function isDriver(user: User | null): boolean {
  return false; // No driver privileges in public app
}

export function isCustomer(user: User | null): boolean {
  return true; // Treat everyone as customer in public app
}

/**
 * Placeholder function - allow all access since authentication is disabled
 */
export function canAccessResource(
  user: User | null,
  resource: string,
  action: 'read' | 'write' | 'delete' = 'read'
): boolean {
  // Allow read access to public resources, restrict write/delete
  if (action === 'read') return true;
  return false; // No write/delete access in public app
}

// Placeholder functions - authentication disabled
export async function createSessionToken(userId: string, expiresIn: number = 3600): Promise<string> {
  console.warn('Authentication is disabled in the public web app');
  throw new Error('Authentication is disabled');
}

export async function revokeUserSession(userId: string): Promise<void> {
  console.warn('Authentication is disabled in the public web app');
}

export async function updateUserClaims(userId: string, claims: Record<string, unknown>): Promise<void> {
  console.warn('Authentication is disabled in the public web app');
}

export async function disableUser(userId: string): Promise<void> {
  console.warn('Authentication is disabled in the public web app');
}

export async function enableUser(userId: string): Promise<void> {
  console.warn('Authentication is disabled in the public web app');
}

/**
 * Placeholder function - always allow access since authentication is disabled
 */
export function validateUserPermissions(
  user: User | null,
  requiredRole: string | string[],
  resource?: string,
  action?: 'read' | 'write' | 'delete'
): { valid: boolean; error?: string } {
  // Allow read access, restrict write/delete
  if (action === 'read' || !action) return { valid: true };
  return { valid: false, error: 'Write operations not allowed in public app' };
}

/**
 * Utility functions that can work without authentication
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest User';
  return user.name || user.email || 'Unknown User';
}

export function isEmailVerified(user: User | null): boolean {
  return user?.isVerified || false;
}

export function isPhoneVerified(user: User | null): boolean {
  return Boolean(user?.phone);
}

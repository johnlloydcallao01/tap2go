/**
 * Authentication Middleware - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * This file is maintained for future use if authentication is needed.
 */

import { NextRequest } from 'next/server';
import { User } from '../types/user';

// Placeholder interfaces for maintaining structure
export interface AuthenticatedRequest extends NextRequest {
  user: User | null;
  token: string;
}

export interface AuthOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * Placeholder function - authentication disabled
 */
async function extractAndValidateToken(request: NextRequest): Promise<{ token: string; decodedToken: any }> {
  console.warn('Authentication is disabled in the public web app');
  throw new Error('Authentication is disabled');
}

/**
 * Placeholder function - authentication disabled
 */
async function getUserFromToken(decodedToken: any): Promise<User> {
  console.warn('Authentication is disabled in the public web app');
  throw new Error('Authentication is disabled');
}

/**
 * Check if user has required role
 */
function hasRequiredRole(user: User, requiredRoles?: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.includes(user.role);
}

/**
 * Check if user has required permissions
 */
function hasRequiredPermissions(user: User, requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // TODO: Implement permission checking logic
  // This would typically check against a permissions table or user claims
  return true;
}

/**
 * Placeholder authentication middleware - always returns null (no authentication)
 */
export async function authenticateRequest(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<{ user: User; token: string } | null> {
  console.warn('Authentication is disabled in the public web app');
  return null;
}

/**
 * Placeholder middleware wrapper - passes through without authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: { user: User | null; token: string }, ...args: T) => Promise<Response>,
  options: AuthOptions = { required: false }
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    // Always pass through with no user (public access)
    return await handler(request, { user: null, token: '' }, ...args);
  };
}

/**
 * Role-based access control decorators
 */
interface AuthResult {
  user: User | null;
  token: string;
}

type AuthHandler = (request: NextRequest, auth: AuthResult, ...args: unknown[]) => Promise<Response>;

export const requireAdmin = (handler: AuthHandler) => withAuth(handler, { required: false });
export const requireVendor = (handler: AuthHandler) => withAuth(handler, { required: false });
export const requireDriver = (handler: AuthHandler) => withAuth(handler, { required: false });
export const requireCustomer = (handler: AuthHandler) => withAuth(handler, { required: false });

/**
 * Optional authentication (for public endpoints that can benefit from user context)
 */
export const optionalAuth = (handler: AuthHandler) => withAuth(handler, { required: false });

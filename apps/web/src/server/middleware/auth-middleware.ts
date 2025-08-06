/**
 * Authentication Middleware
 * 
 * Middleware for handling authentication, authorization, and user context.
 * This is the server-side middleware (different from Next.js middleware.ts).
 */

import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { User } from '../types/user';
import { createApiError } from '../utils/error-utils';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
  token: string;
}

export interface AuthOptions {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * Extract and validate JWT token from request
 */
async function extractAndValidateToken(request: NextRequest): Promise<{ token: string; decodedToken: any }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format. Expected: Bearer <token>');
  }

  const token = authHeader.substring(7);
  
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Verify token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token, true);
    return { token, decodedToken };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('Token has expired');
      }
      if (error.message.includes('invalid')) {
        throw new Error('Invalid token');
      }
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Get user data from decoded token
 */
async function getUserFromToken(decodedToken: any): Promise<User> {
  // TODO: Implement proper user lookup from your database
  // This is a placeholder - replace with your actual user service
  
  const user: User = {
    id: decodedToken.uid,
    email: decodedToken.email || '',
    name: decodedToken.name || decodedToken.email || 'Unknown User',
    role: decodedToken.role || 'customer',
    isActive: true,
    isVerified: Boolean(decodedToken.email_verified),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return user;
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
 * Main authentication middleware
 */
export async function authenticateRequest(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<{ user: User; token: string } | null> {
  
  // If authentication is not required, try to authenticate but don't fail
  if (!options.required) {
    try {
      const { token, decodedToken } = await extractAndValidateToken(request);
      const user = await getUserFromToken(decodedToken);
      return { user, token };
    } catch {
      return null;
    }
  }

  // Authentication is required
  try {
    const { token, decodedToken } = await extractAndValidateToken(request);
    const user = await getUserFromToken(decodedToken);

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    // Check role requirements
    if (!hasRequiredRole(user, options.roles)) {
      throw new Error(`Access denied. Required roles: ${options.roles?.join(', ')}`);
    }

    // Check permission requirements
    if (!hasRequiredPermissions(user, options.permissions)) {
      throw new Error(`Access denied. Required permissions: ${options.permissions?.join(', ')}`);
    }

    return { user, token };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    throw createApiError(message, 401);
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: { user: User; token: string }, ...args: T) => Promise<Response>,
  options: AuthOptions = { required: true }
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const authResult = await authenticateRequest(request, options);
      
      if (options.required && !authResult) {
        return Response.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      return await handler(request, authResult || { user: null as unknown as User, token: '' }, ...args);
    } catch (error) {
      if (error instanceof Error) {
        return Response.json(
          { error: error.message },
          { status: 401 }
        );
      }
      return Response.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
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

export const requireAdmin = (handler: AuthHandler) => withAuth(handler, { required: true, roles: ['admin'] });
export const requireVendor = (handler: AuthHandler) => withAuth(handler, { required: true, roles: ['vendor', 'admin'] });
export const requireDriver = (handler: AuthHandler) => withAuth(handler, { required: true, roles: ['driver', 'admin'] });
export const requireCustomer = (handler: AuthHandler) => withAuth(handler, { required: true, roles: ['customer', 'admin'] });

/**
 * Optional authentication (for public endpoints that can benefit from user context)
 */
export const optionalAuth = (handler: AuthHandler) => withAuth(handler, { required: false });

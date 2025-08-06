/**
 * Admin Authentication Middleware
 * 
 * Middleware for handling admin authentication, authorization, and access control.
 * Provides enhanced security for administrative operations.
 */

import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { AdminUser } from '../types/admin-user';
import { createApiError } from '../utils/error-utils';

export interface AuthenticatedAdminRequest extends NextRequest {
  admin: AdminUser;
  token: string;
}

export interface AdminAuthOptions {
  required?: boolean;
  accessLevel?: 'read' | 'write' | 'admin' | 'super_admin';
  permissions?: string[];
  department?: string[];
}

/**
 * Extract and validate admin JWT token from request
 */
async function extractAndValidateAdminToken(request: NextRequest): Promise<{ token: string; decodedToken: any }> {
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
    
    // Check if user has admin role
    if (decodedToken.role !== 'admin') {
      throw new Error('Admin access required');
    }
    
    return { token, decodedToken };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('Admin token has expired');
      }
      if (error.message.includes('invalid')) {
        throw new Error('Invalid admin token');
      }
    }
    throw new Error('Admin token verification failed');
  }
}

/**
 * Get admin user data from decoded token
 */
async function getAdminFromToken(decodedToken: any): Promise<AdminUser> {
  // TODO: Implement proper admin lookup from your database
  // This is a placeholder - replace with your actual admin service
  
  const admin: AdminUser = {
    id: decodedToken.uid,
    email: decodedToken.email || '',
    name: decodedToken.name || decodedToken.email || 'Unknown Admin',
    role: 'admin',
    isActive: true,
    isVerified: Boolean(decodedToken.email_verified),
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: decodedToken.permissions || [],
    department: decodedToken.department,
    lastActiveAt: new Date(),
    accessLevel: decodedToken.accessLevel || 'read'
  };

  return admin;
}

/**
 * Check if admin has required access level
 */
function hasRequiredAccessLevel(admin: AdminUser, requiredLevel?: string): boolean {
  if (!requiredLevel) return true;
  
  const accessLevels = ['read', 'write', 'admin', 'super_admin'];
  const adminLevelIndex = accessLevels.indexOf(admin.accessLevel);
  const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
  
  return adminLevelIndex >= requiredLevelIndex;
}

/**
 * Check if admin has required permissions
 */
function hasRequiredPermissions(admin: AdminUser, requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Super admin has all permissions
  if (admin.accessLevel === 'super_admin') {
    return true;
  }

  return requiredPermissions.every(permission => 
    admin.permissions.includes(permission)
  );
}

/**
 * Check if admin belongs to required department
 */
function hasRequiredDepartment(admin: AdminUser, requiredDepartments?: string[]): boolean {
  if (!requiredDepartments || requiredDepartments.length === 0) {
    return true;
  }

  if (!admin.department) {
    return false;
  }

  return requiredDepartments.includes(admin.department);
}

/**
 * Main admin authentication middleware
 */
export async function authenticateAdminRequest(
  request: NextRequest,
  options: AdminAuthOptions = {}
): Promise<{ admin: AdminUser; token: string } | null> {
  
  // If authentication is not required, try to authenticate but don't fail
  if (!options.required) {
    try {
      const { token, decodedToken } = await extractAndValidateAdminToken(request);
      const admin = await getAdminFromToken(decodedToken);
      return { admin, token };
    } catch {
      return null;
    }
  }

  // Authentication is required
  try {
    const { token, decodedToken } = await extractAndValidateAdminToken(request);
    const admin = await getAdminFromToken(decodedToken);

    // Check if admin is active
    if (!admin.isActive) {
      throw new Error('Admin account is deactivated');
    }

    // Check access level requirements
    if (!hasRequiredAccessLevel(admin, options.accessLevel)) {
      throw new Error(`Access denied. Required access level: ${options.accessLevel}`);
    }

    // Check permission requirements
    if (!hasRequiredPermissions(admin, options.permissions)) {
      throw new Error(`Access denied. Required permissions: ${options.permissions?.join(', ')}`);
    }

    // Check department requirements
    if (!hasRequiredDepartment(admin, options.department)) {
      throw new Error(`Access denied. Required department: ${options.department?.join(', ')}`);
    }

    return { admin, token };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin authentication failed';
    throw createApiError(message, 401);
  }
}

/**
 * Middleware wrapper for admin API routes
 */
export function withAdminAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: { admin: AdminUser; token: string }, ...args: T) => Promise<Response>,
  options: AdminAuthOptions = { required: true }
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const authResult = await authenticateAdminRequest(request, options);
      
      if (options.required && !authResult) {
        return Response.json(
          { error: 'Admin authentication required' },
          { status: 401 }
        );
      }

      return await handler(request, authResult || { admin: null as unknown as AdminUser, token: '' }, ...args);
    } catch (error) {
      if (error instanceof Error) {
        return Response.json(
          { error: error.message },
          { status: 401 }
        );
      }
      return Response.json(
        { error: 'Admin authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Access level-based decorators
 */
interface AdminAuthResult {
  admin: AdminUser | null;
  token: string;
}

type AdminAuthHandler = (request: NextRequest, auth: AdminAuthResult, ...args: unknown[]) => Promise<Response>;

export const requireSuperAdmin = (handler: AdminAuthHandler) => 
  withAdminAuth(handler, { required: true, accessLevel: 'super_admin' });

export const requireAdminLevel = (handler: AdminAuthHandler) => 
  withAdminAuth(handler, { required: true, accessLevel: 'admin' });

export const requireWriteAccess = (handler: AdminAuthHandler) => 
  withAdminAuth(handler, { required: true, accessLevel: 'write' });

export const requireReadAccess = (handler: AdminAuthHandler) => 
  withAdminAuth(handler, { required: true, accessLevel: 'read' });

/**
 * Permission-based decorators
 */
export const requirePermissions = (permissions: string[]) => (handler: AdminAuthHandler) =>
  withAdminAuth(handler, { required: true, permissions });

export const requireDepartment = (departments: string[]) => (handler: AdminAuthHandler) =>
  withAdminAuth(handler, { required: true, department: departments });

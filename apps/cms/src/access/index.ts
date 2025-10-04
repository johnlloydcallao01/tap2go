import type { Access, FieldAccess } from 'payload'

// LMS role hierarchy levels
export const ROLE_LEVELS = {
  CUSTOMER: 1,
  SERVICE: 3, // Step 2: Add service account role level (between customer and admin)
  ADMIN: 10,
} as const

// Legacy role mapping for backward compatibility
export const LEGACY_ROLE_LEVELS = {
  'customer': ROLE_LEVELS.CUSTOMER,
  'service': ROLE_LEVELS.SERVICE, // Step 2: Map service role for API key users
  'admin': ROLE_LEVELS.ADMIN,
} as const

/**
 * Check if user has minimum role level
 */
export const hasMinimumRoleLevel = (userRole: string, minimumLevel: number): boolean => {
  const userLevel = LEGACY_ROLE_LEVELS[userRole as keyof typeof LEGACY_ROLE_LEVELS] || 0
  return userLevel >= minimumLevel
}

/**
 * Access control for admins only
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

/**
 * Access control for authenticated users
 */
export const authenticatedUsers: Access = ({ req: { user } }) => {
  return !!user
}

/**
 * API key-only access control - bypasses user authentication
 * Allows access if valid API key is provided in Authorization header
 */
export const apiKeyOnly: Access = async ({ req }) => {
  const authHeader = req.headers?.get('authorization')
  if (!authHeader) return false
  
  // Check for API key format: "users API-Key <key>"
  const apiKeyMatch = authHeader.match(/^users API-Key (.+)$/)
  if (!apiKeyMatch) return false
  
  const providedKey = apiKeyMatch[1]
  
  try {
    // Professional approach: Validate API key against database
    const payload = req.payload
    if (!payload) return false
    
    // Find user with matching API key
    const users = await payload.find({
      collection: 'users',
      where: {
        apiKey: {
          equals: providedKey
        },
        // Ensure user is active and has service role
        role: {
          in: ['service', 'admin']
        }
      },
      limit: 1,
      depth: 0
    })
    
    // API key is valid if we found exactly one matching user
    return users.docs.length === 1
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}

/**
 * Access control for users to read their own data
 */
export const usersOwnData: Access = ({ req: { user } }) => {
  if (!user) return false
  
  // Admins can access all user data
  if (user.role === 'admin') {
    return true
  }
  
  // Users can only access their own data
  return {
    id: {
      equals: user.id,
    },
  }
}

/**
 * Access control for course content based on user role and enrollment
 */
export const courseContentAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admins can access all course content
  if (user.role === 'admin') {
    return true
  }

  // Service accounts can access course content
  if (user.role === 'service') {
    return true
  }

  // Customers can access content they're enrolled in
  return {
    enrolledUsers: {
      contains: user.id,
    },
  }
}

/**
 * Field access for sensitive data
 */
export const sensitiveData: FieldAccess = ({ req: { user } }) => {
  // Only admins can access sensitive data
  return user?.role === 'admin'
}

/**
 * Access control for media based on user role
 */
export const mediaAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admins can access all media
  if (user.role === 'admin') {
    return true
  }

  // Service accounts and customers can access media
  return true // Simplified for now
}

/**
 * Dynamic access control based on user roles
 */
export const dynamicRoleAccess = (resource: string, action: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    
    switch (action) {
      case 'create':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.SERVICE)
      case 'read':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.CUSTOMER)
      case 'update':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.SERVICE)
      case 'delete':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.ADMIN)
      default:
        return false
    }
  }
}

/**
 * LMS-specific access control
 */
export const lmsAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  
  // All authenticated users have basic LMS access
  return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.CUSTOMER)
}

/**
 * Access control for service accounts or above (service, admin)
 */
export const serviceOrAbove: Access = ({ req: { user } }) => {
  return hasMinimumRoleLevel(user?.role || '', ROLE_LEVELS.SERVICE)
}

const accessControls = {
  adminOnly,
  serviceOrAbove, // Service or above access control
  authenticatedUsers,
  apiKeyOnly, // API key-only access control
  usersOwnData,
  courseContentAccess,
  sensitiveData,
  mediaAccess,
  dynamicRoleAccess,
  lmsAccess,
}

export default accessControls

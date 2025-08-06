/**
 * Admin User Types
 * 
 * TypeScript types for admin users and administrative roles.
 */

/**
 * Base admin user interface
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Admin-specific fields
  permissions: string[];
  department?: string;
  lastActiveAt: Date;
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin';
  
  // Optional admin metadata
  employeeId?: string;
  phoneNumber?: string;
  profileImage?: string;
  timezone?: string;
  language?: string;
  
  // Security fields
  lastLoginAt?: Date;
  loginCount?: number;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  twoFactorEnabled?: boolean;
  
  // Audit fields
  createdBy?: string;
  updatedBy?: string;
  deactivatedAt?: Date;
  deactivatedBy?: string;
  deactivationReason?: string;
}

/**
 * Admin permissions enum
 */
export enum AdminPermission {
  // User management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  SUSPEND_USERS = 'suspend_users',
  
  // Vendor management
  VIEW_VENDORS = 'view_vendors',
  APPROVE_VENDORS = 'approve_vendors',
  SUSPEND_VENDORS = 'suspend_vendors',
  EDIT_VENDORS = 'edit_vendors',
  
  // Driver management
  VIEW_DRIVERS = 'view_drivers',
  APPROVE_DRIVERS = 'approve_drivers',
  SUSPEND_DRIVERS = 'suspend_drivers',
  EDIT_DRIVERS = 'edit_drivers',
  
  // Order management
  VIEW_ORDERS = 'view_orders',
  EDIT_ORDERS = 'edit_orders',
  CANCEL_ORDERS = 'cancel_orders',
  REFUND_ORDERS = 'refund_orders',
  
  // Content management
  VIEW_CONTENT = 'view_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  MODERATE_CONTENT = 'moderate_content',
  
  // Analytics and reports
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_REPORTS = 'export_reports',
  VIEW_FINANCIAL_DATA = 'view_financial_data',
  
  // System management
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_SYSTEM_CONFIG = 'manage_system_config',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  
  // Admin management
  VIEW_ADMINS = 'view_admins',
  CREATE_ADMINS = 'create_admins',
  EDIT_ADMINS = 'edit_admins',
  DELETE_ADMINS = 'delete_admins',
  
  // Audit and compliance
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  EXPORT_AUDIT_LOGS = 'export_audit_logs',
  MANAGE_COMPLIANCE = 'manage_compliance'
}

/**
 * Admin departments
 */
export enum AdminDepartment {
  CUSTOMER_SERVICE = 'customer_service',
  OPERATIONS = 'operations',
  FINANCE = 'finance',
  MARKETING = 'marketing',
  TECHNICAL = 'technical',
  LEGAL = 'legal',
  COMPLIANCE = 'compliance',
  MANAGEMENT = 'management'
}

/**
 * Admin access levels with descriptions
 */
export interface AdminAccessLevel {
  level: 'read' | 'write' | 'admin' | 'super_admin';
  description: string;
  permissions: AdminPermission[];
}

/**
 * Admin session information
 */
export interface AdminSession {
  adminId: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    device: string;
    os: string;
    browser: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
  location?: {
    country: string;
    city: string;
    region: string;
  };
}

/**
 * Admin activity log
 */
export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Admin notification preferences
 */
export interface AdminNotificationPreferences {
  email: {
    systemAlerts: boolean;
    userReports: boolean;
    securityAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  push: {
    criticalAlerts: boolean;
    userActions: boolean;
    systemEvents: boolean;
  };
  sms: {
    emergencyAlerts: boolean;
    securityBreaches: boolean;
  };
}

/**
 * Admin dashboard preferences
 */
export interface AdminDashboardPreferences {
  defaultView: 'overview' | 'users' | 'orders' | 'analytics';
  widgets: string[];
  refreshInterval: number;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Admin role template
 */
export interface AdminRoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: AdminPermission[];
  accessLevel: 'read' | 'write' | 'admin';
  department?: AdminDepartment;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin invitation
 */
export interface AdminInvitation {
  id: string;
  email: string;
  name: string;
  department?: AdminDepartment;
  accessLevel: 'read' | 'write' | 'admin';
  permissions: AdminPermission[];
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}

/**
 * Admin password policy
 */
export interface AdminPasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  maxAge: number; // days
  historyCount: number; // number of previous passwords to remember
}

/**
 * Admin security settings
 */
export interface AdminSecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number; // minutes
  maxFailedLogins: number;
  lockoutDuration: number; // minutes
  passwordPolicy: AdminPasswordPolicy;
  allowedIpRanges?: string[];
  requireVpn?: boolean;
}

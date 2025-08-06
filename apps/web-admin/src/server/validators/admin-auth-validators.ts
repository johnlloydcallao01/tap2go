/**
 * Admin Authentication Validators
 * 
 * Validation functions for admin authentication and authorization data.
 * These validators ensure secure and valid admin authentication.
 */

import { ValidationResult } from '../types/validation';
import { AdminPermission, AdminDepartment } from '../types/admin-user';

/**
 * Validate admin email address (stricter than regular email validation)
 */
export function validateEmail(email: string): ValidationResult<string> {
  if (!email) {
    return { success: false, errors: ['Email is required'] };
  }

  if (typeof email !== 'string') {
    return { success: false, errors: ['Email must be a string'] };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    return { success: false, errors: ['Email cannot be empty'] };
  }

  if (trimmedEmail.length > 254) {
    return { success: false, errors: ['Email is too long (max 254 characters)'] };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, errors: ['Invalid email address format'] };
  }

  // Check for disposable email domains (stricter for admins)
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'yopmail.com'
  ];

  const domain = trimmedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { success: false, errors: ['Corporate email addresses are required for admin accounts'] };
  }

  // Require corporate domains (optional - customize based on your needs)
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  if (personalDomains.includes(domain)) {
    return { success: false, errors: ['Corporate email addresses are preferred for admin accounts'] };
  }

  return { success: true, data: trimmedEmail };
}

/**
 * Validate admin password (stricter requirements than regular users)
 */
export function validatePassword(password: string): ValidationResult<string> {
  if (!password) {
    return { success: false, errors: ['Password is required'] };
  }

  if (typeof password !== 'string') {
    return { success: false, errors: ['Password must be a string'] };
  }

  const errors: string[] = [];

  // Length requirements (stricter for admins)
  if (password.length < 12) {
    errors.push('Admin password must be at least 12 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
  }

  // Character requirements (all required for admins)
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Additional requirements for admin passwords
  if (!/(?=.*[a-z].*[a-z])/.test(password)) {
    errors.push('Password must contain at least two lowercase letters');
  }

  if (!/(?=.*[A-Z].*[A-Z])/.test(password)) {
    errors.push('Password must contain at least two uppercase letters');
  }

  if (!/(?=.*\d.*\d)/.test(password)) {
    errors.push('Password must contain at least two numbers');
  }

  // Common password checks (stricter list for admins)
  const commonPasswords = [
    'password',
    'admin',
    'administrator',
    '12345678',
    'qwerty123',
    'admin123',
    'password123',
    'welcome123',
    'letmein123',
    'changeme123',
    'temp123456',
    'newpassword'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password cannot contain common words or patterns');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }

  // Sequential keyboard patterns
  const sequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  if (sequences.some(seq => password.toLowerCase().includes(seq))) {
    errors.push('Password cannot contain keyboard sequences');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: password };
}

/**
 * Validate admin access level
 */
export function validateAccessLevel(accessLevel: string): ValidationResult<'read' | 'write' | 'admin' | 'super_admin'> {
  if (!accessLevel) {
    return { success: false, errors: ['Access level is required'] };
  }

  if (typeof accessLevel !== 'string') {
    return { success: false, errors: ['Access level must be a string'] };
  }

  const validLevels = ['read', 'write', 'admin', 'super_admin'] as const;
  const normalizedLevel = accessLevel.toLowerCase().trim();

  if (!validLevels.includes(normalizedLevel as any)) {
    return { success: false, errors: [`Invalid access level. Must be one of: ${validLevels.join(', ')}`] };
  }

  return { success: true, data: normalizedLevel as 'read' | 'write' | 'admin' | 'super_admin' };
}

/**
 * Validate admin permissions
 */
export function validatePermissions(permissions: string[]): ValidationResult<AdminPermission[]> {
  if (!Array.isArray(permissions)) {
    return { success: false, errors: ['Permissions must be an array'] };
  }

  const validPermissions = Object.values(AdminPermission);
  const errors: string[] = [];
  const validatedPermissions: AdminPermission[] = [];

  for (const permission of permissions) {
    if (typeof permission !== 'string') {
      errors.push('All permissions must be strings');
      continue;
    }

    if (!validPermissions.includes(permission as AdminPermission)) {
      errors.push(`Invalid permission: ${permission}`);
      continue;
    }

    validatedPermissions.push(permission as AdminPermission);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedPermissions };
}

/**
 * Validate admin department
 */
export function validateDepartment(department: string): ValidationResult<AdminDepartment> {
  if (!department) {
    return { success: false, errors: ['Department is required'] };
  }

  if (typeof department !== 'string') {
    return { success: false, errors: ['Department must be a string'] };
  }

  const validDepartments = Object.values(AdminDepartment);
  const normalizedDepartment = department.toLowerCase().trim();

  if (!validDepartments.includes(normalizedDepartment as AdminDepartment)) {
    return { success: false, errors: [`Invalid department. Must be one of: ${validDepartments.join(', ')}`] };
  }

  return { success: true, data: normalizedDepartment as AdminDepartment };
}

/**
 * Validate admin name (stricter than regular name validation)
 */
export function validateAdminName(name: string): ValidationResult<string> {
  if (!name) {
    return { success: false, errors: ['Name is required'] };
  }

  if (typeof name !== 'string') {
    return { success: false, errors: ['Name must be a string'] };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { success: false, errors: ['Name cannot be empty'] };
  }

  if (trimmedName.length < 2) {
    return { success: false, errors: ['Name must be at least 2 characters long'] };
  }

  if (trimmedName.length > 100) {
    return { success: false, errors: ['Name is too long (max 100 characters)'] };
  }

  // Allow letters, spaces, hyphens, apostrophes, and periods
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;

  if (!nameRegex.test(trimmedName)) {
    return { success: false, errors: ['Name can only contain letters, spaces, hyphens, apostrophes, and periods'] };
  }

  // Check for excessive spaces
  if (/\s{2,}/.test(trimmedName)) {
    return { success: false, errors: ['Name cannot contain multiple consecutive spaces'] };
  }

  // Require at least first and last name for admins
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) {
    return { success: false, errors: ['Please provide both first and last name'] };
  }

  return { success: true, data: trimmedName };
}

/**
 * Validate admin creation data
 */
export function validateAdminCreationData(data: {
  email: string;
  password: string;
  name: string;
  department?: string;
  accessLevel?: string;
  permissions?: string[];
}): ValidationResult<{
  email: string;
  password: string;
  name: string;
  department?: AdminDepartment;
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin';
  permissions: AdminPermission[];
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.success) {
    errors.push(...(emailValidation.errors || []));
  } else {
    validatedData.email = emailValidation.data;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.success) {
    errors.push(...(passwordValidation.errors || []));
  } else {
    validatedData.password = passwordValidation.data;
  }

  // Validate name
  const nameValidation = validateAdminName(data.name);
  if (!nameValidation.success) {
    errors.push(...(nameValidation.errors || []));
  } else {
    validatedData.name = nameValidation.data;
  }

  // Validate department (optional)
  if (data.department) {
    const departmentValidation = validateDepartment(data.department);
    if (!departmentValidation.success) {
      errors.push(...(departmentValidation.errors || []));
    } else {
      validatedData.department = departmentValidation.data;
    }
  }

  // Validate access level (default to read)
  const accessLevelValidation = validateAccessLevel(data.accessLevel || 'read');
  if (!accessLevelValidation.success) {
    errors.push(...(accessLevelValidation.errors || []));
  } else {
    validatedData.accessLevel = accessLevelValidation.data;
  }

  // Validate permissions (default to empty array)
  const permissionsValidation = validatePermissions(data.permissions || []);
  if (!permissionsValidation.success) {
    errors.push(...(permissionsValidation.errors || []));
  } else {
    validatedData.permissions = permissionsValidation.data;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

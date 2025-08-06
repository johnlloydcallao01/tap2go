/**
 * Authentication Validators
 * 
 * Validation functions for authentication-related data.
 * These validators ensure secure and valid authentication data.
 */

import { ValidationResult } from '../types/validation';

/**
 * Validate email address
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

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, errors: ['Invalid email address format'] };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];

  const domain = trimmedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { success: false, errors: ['Disposable email addresses are not allowed'] };
  }

  return { success: true, data: trimmedEmail };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult<string> {
  if (!password) {
    return { success: false, errors: ['Password is required'] };
  }

  if (typeof password !== 'string') {
    return { success: false, errors: ['Password must be a string'] };
  }

  const errors: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
  }

  // Character requirements
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

  // Common password checks
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty123',
    'admin123',
    'password123',
    'welcome123'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: password };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult<string> {
  if (!phone) {
    return { success: false, errors: ['Phone number is required'] };
  }

  if (typeof phone !== 'string') {
    return { success: false, errors: ['Phone number must be a string'] };
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length === 0) {
    return { success: false, errors: ['Phone number cannot be empty'] };
  }

  // Remove all non-digit characters except + at the beginning
  const cleanPhone = trimmedPhone.replace(/[^\d+]/g, '');

  // International format validation (E.164)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return { success: false, errors: ['Invalid phone number format. Use international format (e.g., +1234567890)'] };
  }

  return { success: true, data: cleanPhone };
}

/**
 * Validate user name
 */
export function validateName(name: string): ValidationResult<string> {
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

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;

  if (!nameRegex.test(trimmedName)) {
    return { success: false, errors: ['Name can only contain letters, spaces, hyphens, and apostrophes'] };
  }

  // Check for excessive spaces
  if (/\s{2,}/.test(trimmedName)) {
    return { success: false, errors: ['Name cannot contain multiple consecutive spaces'] };
  }

  return { success: true, data: trimmedName };
}

/**
 * Validate user role
 */
export function validateRole(role: string): ValidationResult<'customer' | 'vendor' | 'driver' | 'admin'> {
  if (!role) {
    return { success: false, errors: ['Role is required'] };
  }

  if (typeof role !== 'string') {
    return { success: false, errors: ['Role must be a string'] };
  }

  const validRoles = ['customer', 'vendor', 'driver', 'admin'] as const;
  const normalizedRole = role.toLowerCase().trim();

  if (!validRoles.includes(normalizedRole as any)) {
    return { success: false, errors: [`Invalid role. Must be one of: ${validRoles.join(', ')}`] };
  }

  return { success: true, data: normalizedRole as 'customer' | 'vendor' | 'driver' | 'admin' };
}

/**
 * Validate registration data
 */
export function validateRegistrationData(data: {
  email: string;
  password: string;
  name: string;
  role?: string;
}): ValidationResult<{
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'vendor' | 'driver' | 'admin';
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
  const nameValidation = validateName(data.name);
  if (!nameValidation.success) {
    errors.push(...(nameValidation.errors || []));
  } else {
    validatedData.name = nameValidation.data;
  }

  // Validate role (default to customer)
  const roleValidation = validateRole(data.role || 'customer');
  if (!roleValidation.success) {
    errors.push(...(roleValidation.errors || []));
  } else {
    validatedData.role = roleValidation.data;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate login data
 */
export function validateLoginData(data: {
  email: string;
  password: string;
}): ValidationResult<{
  email: string;
  password: string;
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

  // Basic password validation for login (just check if provided)
  if (!data.password || typeof data.password !== 'string' || data.password.trim().length === 0) {
    errors.push('Password is required');
  } else {
    validatedData.password = data.password;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

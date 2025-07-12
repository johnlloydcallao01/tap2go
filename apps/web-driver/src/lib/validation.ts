/**
 * Enterprise-grade Input Validation Utilities
 * Provides comprehensive validation for API inputs and forms
 * Using native TypeScript validation for maximum compatibility
 */

// Validation interfaces
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Common validation functions
export function validateEmail(email: string): ValidationResult<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, errors: ['Invalid email address'] };
  }
  return { success: true, data: email };
}

export function validatePhone(phone: string): ValidationResult<string> {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { success: false, errors: ['Invalid phone number'] };
  }
  return { success: true, data: phone };
}

export function validatePassword(password: string): ValidationResult<string> {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: password };
}

// File validation
export function validateFileUpload(file: File): ValidationResult<File> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'application/pdf',
  ];

  if (file.size > MAX_SIZE) {
    return {
      success: false,
      errors: ['File size exceeds 10MB limit'],
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      errors: ['File type not allowed'],
    };
  }

  return {
    success: true,
    data: file,
  };
}

// Utility validation functions
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Complex object validation
export interface RestaurantData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: {
    min: number;
    max: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateRestaurant(data: unknown): ValidationResult<RestaurantData> {
  const errors: string[] = [];

  if (!isRecord(data)) {
    errors.push('Invalid data format');
    return { success: false, errors };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
    errors.push('Restaurant name must be between 2 and 100 characters');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.length < 10 || data.description.length > 500) {
    errors.push('Description must be between 10 and 500 characters');
  }

  if (!data.address || typeof data.address !== 'string' || data.address.length < 10) {
    errors.push('Address must be at least 10 characters');
  }

  const phoneValidation = validatePhone(data.phone as string);
  if (!phoneValidation.success) {
    errors.push(...(phoneValidation.errors || []));
  }

  const emailValidation = validateEmail(data.email as string);
  if (!emailValidation.success) {
    errors.push(...(emailValidation.errors || []));
  }

  if (!data.cuisine || typeof data.cuisine !== 'string' || data.cuisine.length < 2) {
    errors.push('Cuisine type is required');
  }

  if (!['$', '$$', '$$$', '$$$$'].includes(data.priceRange as string)) {
    errors.push('Invalid price range');
  }

  if (typeof data.deliveryFee !== 'number' || data.deliveryFee < 0 || data.deliveryFee > 50) {
    errors.push('Delivery fee must be between 0 and 50');
  }

  if (typeof data.minimumOrder !== 'number' || data.minimumOrder < 0 || data.minimumOrder > 100) {
    errors.push('Minimum order must be between 0 and 100');
  }

  if (!isRecord(data.deliveryTime) ||
      typeof data.deliveryTime.min !== 'number' ||
      typeof data.deliveryTime.max !== 'number' ||
      data.deliveryTime.min < 10 || data.deliveryTime.min > 120 ||
      data.deliveryTime.max < 15 || data.deliveryTime.max > 180) {
    errors.push('Invalid delivery time range');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as unknown as RestaurantData };
}

// Menu item validation
export interface MenuItemData {
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  allergens?: string[];
}

export function validateMenuItem(data: unknown): ValidationResult<MenuItemData> {
  const errors: string[] = [];

  if (!isRecord(data)) {
    errors.push('Invalid data format');
    return { success: false, errors };
  }

  if (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 100) {
    errors.push('Item name must be between 2 and 100 characters');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.length < 10 || data.description.length > 300) {
    errors.push('Description must be between 10 and 300 characters');
  }

  if (typeof data.price !== 'number' || data.price <= 0 || data.price > 1000) {
    errors.push('Price must be between 0.01 and 1000');
  }

  if (!data.category || typeof data.category !== 'string' || data.category.length < 2) {
    errors.push('Category is required');
  }

  if (typeof data.isAvailable !== 'boolean') {
    errors.push('Availability status is required');
  }

  if (typeof data.preparationTime !== 'number' || data.preparationTime < 5 || data.preparationTime > 60) {
    errors.push('Preparation time must be between 5 and 60 minutes');
  }

  if (data.allergens && (!Array.isArray(data.allergens) || !data.allergens.every((a: unknown) => typeof a === 'string'))) {
    errors.push('Allergens must be an array of strings');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: data as unknown as MenuItemData };
}

// Generic validation helper
export function validateWithSchema<T>(
  data: unknown,
  validator: (data: unknown) => ValidationResult<T>
): ValidationResult<T> {
  try {
    return validator(data);
  } catch (error) {
    return {
      success: false,
      errors: ['Validation error: ' + (error instanceof Error ? error.message : 'Unknown error')],
    };
  }
}

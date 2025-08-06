/**
 * Restaurant Validators
 * 
 * Validation functions for restaurant-related data and operations.
 */

import { ValidationResult } from '../types/validation';

/**
 * Validate restaurant name
 */
export function validateRestaurantName(name: string): ValidationResult<string> {
  if (!name) {
    return { success: false, errors: ['Restaurant name is required'] };
  }

  if (typeof name !== 'string') {
    return { success: false, errors: ['Restaurant name must be a string'] };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { success: false, errors: ['Restaurant name cannot be empty'] };
  }

  if (trimmedName.length < 2) {
    return { success: false, errors: ['Restaurant name must be at least 2 characters long'] };
  }

  if (trimmedName.length > 100) {
    return { success: false, errors: ['Restaurant name cannot exceed 100 characters'] };
  }

  // Allow letters, numbers, spaces, and common punctuation
  const nameRegex = /^[a-zA-Z0-9\s\-'&.()]+$/;

  if (!nameRegex.test(trimmedName)) {
    return { success: false, errors: ['Restaurant name contains invalid characters'] };
  }

  return { success: true, data: trimmedName };
}

/**
 * Validate restaurant description
 */
export function validateRestaurantDescription(description: string): ValidationResult<string> {
  if (!description) {
    return { success: false, errors: ['Restaurant description is required'] };
  }

  if (typeof description !== 'string') {
    return { success: false, errors: ['Restaurant description must be a string'] };
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length === 0) {
    return { success: false, errors: ['Restaurant description cannot be empty'] };
  }

  if (trimmedDescription.length < 10) {
    return { success: false, errors: ['Restaurant description must be at least 10 characters long'] };
  }

  if (trimmedDescription.length > 500) {
    return { success: false, errors: ['Restaurant description cannot exceed 500 characters'] };
  }

  return { success: true, data: trimmedDescription };
}

/**
 * Validate restaurant address
 */
export function validateRestaurantAddress(address: string): ValidationResult<string> {
  if (!address) {
    return { success: false, errors: ['Restaurant address is required'] };
  }

  if (typeof address !== 'string') {
    return { success: false, errors: ['Restaurant address must be a string'] };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length === 0) {
    return { success: false, errors: ['Restaurant address cannot be empty'] };
  }

  if (trimmedAddress.length < 10) {
    return { success: false, errors: ['Restaurant address must be at least 10 characters long'] };
  }

  if (trimmedAddress.length > 200) {
    return { success: false, errors: ['Restaurant address cannot exceed 200 characters'] };
  }

  return { success: true, data: trimmedAddress };
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): ValidationResult<string> {
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
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult<string> {
  if (!email) {
    return { success: false, errors: ['Email address is required'] };
  }

  if (typeof email !== 'string') {
    return { success: false, errors: ['Email address must be a string'] };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    return { success: false, errors: ['Email address cannot be empty'] };
  }

  if (trimmedEmail.length > 254) {
    return { success: false, errors: ['Email address is too long (max 254 characters)'] };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, errors: ['Invalid email address format'] };
  }

  return { success: true, data: trimmedEmail };
}

/**
 * Validate cuisine types
 */
export function validateCuisineTypes(cuisines: string[]): ValidationResult<string[]> {
  if (!Array.isArray(cuisines)) {
    return { success: false, errors: ['Cuisine types must be an array'] };
  }

  if (cuisines.length === 0) {
    return { success: false, errors: ['At least one cuisine type is required'] };
  }

  if (cuisines.length > 5) {
    return { success: false, errors: ['Maximum 5 cuisine types allowed'] };
  }

  const validCuisines = [
    'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian', 'thai',
    'french', 'mediterranean', 'korean', 'vietnamese', 'greek', 'spanish',
    'middle_eastern', 'filipino', 'brazilian', 'german', 'british', 'caribbean',
    'african', 'fusion', 'vegetarian', 'vegan', 'healthy', 'fast_food',
    'pizza', 'burgers', 'seafood', 'steakhouse', 'bakery', 'desserts',
    'coffee', 'breakfast', 'brunch', 'bbq', 'sandwiches', 'salads'
  ];

  const errors: string[] = [];
  const validatedCuisines: string[] = [];

  for (const cuisine of cuisines) {
    if (typeof cuisine !== 'string') {
      errors.push('All cuisine types must be strings');
      continue;
    }

    const normalizedCuisine = cuisine.toLowerCase().trim();

    if (!validCuisines.includes(normalizedCuisine)) {
      errors.push(`Invalid cuisine type: ${cuisine}`);
      continue;
    }

    if (!validatedCuisines.includes(normalizedCuisine)) {
      validatedCuisines.push(normalizedCuisine);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedCuisines };
}

/**
 * Validate price range
 */
export function validatePriceRange(priceRange: string): ValidationResult<'$' | '$$' | '$$$' | '$$$$'> {
  if (!priceRange) {
    return { success: false, errors: ['Price range is required'] };
  }

  if (typeof priceRange !== 'string') {
    return { success: false, errors: ['Price range must be a string'] };
  }

  const validRanges = ['$', '$$', '$$$', '$$$$'] as const;

  if (!validRanges.includes(priceRange as any)) {
    return { success: false, errors: [`Invalid price range. Must be one of: ${validRanges.join(', ')}`] };
  }

  return { success: true, data: priceRange as '$' | '$$' | '$$$' | '$$$$' };
}

/**
 * Validate delivery fee
 */
export function validateDeliveryFee(fee: number): ValidationResult<number> {
  if (typeof fee !== 'number') {
    return { success: false, errors: ['Delivery fee must be a number'] };
  }

  if (fee < 0) {
    return { success: false, errors: ['Delivery fee cannot be negative'] };
  }

  if (fee > 50) {
    return { success: false, errors: ['Delivery fee cannot exceed $50'] };
  }

  return { success: true, data: Number(fee.toFixed(2)) };
}

/**
 * Validate minimum order amount
 */
export function validateMinimumOrder(amount: number): ValidationResult<number> {
  if (typeof amount !== 'number') {
    return { success: false, errors: ['Minimum order amount must be a number'] };
  }

  if (amount < 0) {
    return { success: false, errors: ['Minimum order amount cannot be negative'] };
  }

  if (amount > 100) {
    return { success: false, errors: ['Minimum order amount cannot exceed $100'] };
  }

  return { success: true, data: Number(amount.toFixed(2)) };
}

/**
 * Validate delivery time
 */
export function validateDeliveryTime(deliveryTime: { min: number; max: number }): ValidationResult<{ min: number; max: number }> {
  if (!deliveryTime || typeof deliveryTime !== 'object') {
    return { success: false, errors: ['Delivery time must be an object with min and max values'] };
  }

  const { min, max } = deliveryTime;

  if (typeof min !== 'number' || typeof max !== 'number') {
    return { success: false, errors: ['Delivery time min and max must be numbers'] };
  }

  if (min < 10) {
    return { success: false, errors: ['Minimum delivery time cannot be less than 10 minutes'] };
  }

  if (max > 120) {
    return { success: false, errors: ['Maximum delivery time cannot exceed 120 minutes'] };
  }

  if (min >= max) {
    return { success: false, errors: ['Minimum delivery time must be less than maximum delivery time'] };
  }

  if (max - min < 10) {
    return { success: false, errors: ['Delivery time range must be at least 10 minutes'] };
  }

  return { success: true, data: { min: Math.round(min), max: Math.round(max) } };
}

/**
 * Validate restaurant creation data
 */
export function validateRestaurantData(data: {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string[];
  priceRange: string;
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: { min: number; max: number };
  image?: File;
}): ValidationResult<{
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: { min: number; max: number };
  image?: File;
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate name
  const nameValidation = validateRestaurantName(data.name);
  if (!nameValidation.success) {
    errors.push(...(nameValidation.errors || []));
  } else {
    validatedData.name = nameValidation.data;
  }

  // Validate description
  const descriptionValidation = validateRestaurantDescription(data.description);
  if (!descriptionValidation.success) {
    errors.push(...(descriptionValidation.errors || []));
  } else {
    validatedData.description = descriptionValidation.data;
  }

  // Validate address
  const addressValidation = validateRestaurantAddress(data.address);
  if (!addressValidation.success) {
    errors.push(...(addressValidation.errors || []));
  } else {
    validatedData.address = addressValidation.data;
  }

  // Validate phone
  const phoneValidation = validatePhoneNumber(data.phone);
  if (!phoneValidation.success) {
    errors.push(...(phoneValidation.errors || []));
  } else {
    validatedData.phone = phoneValidation.data;
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.success) {
    errors.push(...(emailValidation.errors || []));
  } else {
    validatedData.email = emailValidation.data;
  }

  // Validate cuisine
  const cuisineValidation = validateCuisineTypes(data.cuisine);
  if (!cuisineValidation.success) {
    errors.push(...(cuisineValidation.errors || []));
  } else {
    validatedData.cuisine = cuisineValidation.data;
  }

  // Validate price range
  const priceRangeValidation = validatePriceRange(data.priceRange);
  if (!priceRangeValidation.success) {
    errors.push(...(priceRangeValidation.errors || []));
  } else {
    validatedData.priceRange = priceRangeValidation.data;
  }

  // Validate delivery fee
  const deliveryFeeValidation = validateDeliveryFee(data.deliveryFee);
  if (!deliveryFeeValidation.success) {
    errors.push(...(deliveryFeeValidation.errors || []));
  } else {
    validatedData.deliveryFee = deliveryFeeValidation.data;
  }

  // Validate minimum order
  const minimumOrderValidation = validateMinimumOrder(data.minimumOrder);
  if (!minimumOrderValidation.success) {
    errors.push(...(minimumOrderValidation.errors || []));
  } else {
    validatedData.minimumOrder = minimumOrderValidation.data;
  }

  // Validate delivery time
  const deliveryTimeValidation = validateDeliveryTime(data.deliveryTime);
  if (!deliveryTimeValidation.success) {
    errors.push(...(deliveryTimeValidation.errors || []));
  } else {
    validatedData.deliveryTime = deliveryTimeValidation.data;
  }

  // Validate image (optional)
  if (data.image) {
    if (!(data.image instanceof File)) {
      errors.push('Restaurant image must be a valid file');
    } else {
      // Check file size (max 5MB)
      if (data.image.size > 5 * 1024 * 1024) {
        errors.push('Restaurant image file size cannot exceed 5MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.image.type)) {
        errors.push('Restaurant image must be JPEG, PNG, or WebP format');
      }

      if (errors.length === 0) {
        validatedData.image = data.image;
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate restaurant update data
 */
export function validateRestaurantUpdate(data: {
  restaurantId: string;
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  cuisine?: string[];
  priceRange?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  deliveryTime?: { min: number; max: number };
  isOpen?: boolean;
}): ValidationResult<any> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate restaurant ID
  if (!data.restaurantId || typeof data.restaurantId !== 'string') {
    errors.push('Valid restaurant ID is required');
  } else {
    validatedData.restaurantId = data.restaurantId.trim();
  }

  // Validate optional fields
  if (data.name !== undefined) {
    const nameValidation = validateRestaurantName(data.name);
    if (!nameValidation.success) {
      errors.push(...(nameValidation.errors || []));
    } else {
      validatedData.name = nameValidation.data;
    }
  }

  if (data.description !== undefined) {
    const descriptionValidation = validateRestaurantDescription(data.description);
    if (!descriptionValidation.success) {
      errors.push(...(descriptionValidation.errors || []));
    } else {
      validatedData.description = descriptionValidation.data;
    }
  }

  if (data.phone !== undefined) {
    const phoneValidation = validatePhoneNumber(data.phone);
    if (!phoneValidation.success) {
      errors.push(...(phoneValidation.errors || []));
    } else {
      validatedData.phone = phoneValidation.data;
    }
  }

  if (data.email !== undefined) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.success) {
      errors.push(...(emailValidation.errors || []));
    } else {
      validatedData.email = emailValidation.data;
    }
  }

  if (data.cuisine !== undefined) {
    const cuisineValidation = validateCuisineTypes(data.cuisine);
    if (!cuisineValidation.success) {
      errors.push(...(cuisineValidation.errors || []));
    } else {
      validatedData.cuisine = cuisineValidation.data;
    }
  }

  if (data.priceRange !== undefined) {
    const priceRangeValidation = validatePriceRange(data.priceRange);
    if (!priceRangeValidation.success) {
      errors.push(...(priceRangeValidation.errors || []));
    } else {
      validatedData.priceRange = priceRangeValidation.data;
    }
  }

  if (data.deliveryFee !== undefined) {
    const deliveryFeeValidation = validateDeliveryFee(data.deliveryFee);
    if (!deliveryFeeValidation.success) {
      errors.push(...(deliveryFeeValidation.errors || []));
    } else {
      validatedData.deliveryFee = deliveryFeeValidation.data;
    }
  }

  if (data.minimumOrder !== undefined) {
    const minimumOrderValidation = validateMinimumOrder(data.minimumOrder);
    if (!minimumOrderValidation.success) {
      errors.push(...(minimumOrderValidation.errors || []));
    } else {
      validatedData.minimumOrder = minimumOrderValidation.data;
    }
  }

  if (data.deliveryTime !== undefined) {
    const deliveryTimeValidation = validateDeliveryTime(data.deliveryTime);
    if (!deliveryTimeValidation.success) {
      errors.push(...(deliveryTimeValidation.errors || []));
    } else {
      validatedData.deliveryTime = deliveryTimeValidation.data;
    }
  }

  if (data.isOpen !== undefined) {
    if (typeof data.isOpen !== 'boolean') {
      errors.push('Restaurant open status must be a boolean');
    } else {
      validatedData.isOpen = data.isOpen;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

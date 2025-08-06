/**
 * Delivery Validators
 * 
 * Validation functions for delivery-related data and operations.
 */

import { ValidationResult } from '../types/validation';

/**
 * Validate delivery status
 */
export function validateDeliveryStatus(status: string): ValidationResult<string> {
  if (!status) {
    return { success: false, errors: ['Delivery status is required'] };
  }

  if (typeof status !== 'string') {
    return { success: false, errors: ['Delivery status must be a string'] };
  }

  const validStatuses = [
    'assigned',
    'accepted',
    'picked_up',
    'in_transit',
    'arrived',
    'delivered',
    'cancelled',
    'failed'
  ];

  const normalizedStatus = status.toLowerCase().trim();

  if (!validStatuses.includes(normalizedStatus)) {
    return { success: false, errors: [`Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`] };
  }

  return { success: true, data: normalizedStatus };
}

/**
 * Validate location coordinates
 */
export function validateLocation(location: { lat: number; lng: number }): ValidationResult<{ lat: number; lng: number }> {
  if (!location) {
    return { success: false, errors: ['Location is required'] };
  }

  if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return { success: false, errors: ['Location coordinates must be numbers'] };
  }

  if (location.lat < -90 || location.lat > 90) {
    return { success: false, errors: ['Latitude must be between -90 and 90'] };
  }

  if (location.lng < -180 || location.lng > 180) {
    return { success: false, errors: ['Longitude must be between -180 and 180'] };
  }

  return { success: true, data: location };
}

/**
 * Validate delivery update data
 */
export function validateDeliveryUpdate(data: {
  deliveryId: string;
  status: string;
  notes?: string;
  location?: { lat: number; lng: number };
}): ValidationResult<{
  deliveryId: string;
  status: string;
  notes?: string;
  location?: { lat: number; lng: number };
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate delivery ID
  if (!data.deliveryId || typeof data.deliveryId !== 'string') {
    errors.push('Valid delivery ID is required');
  } else {
    validatedData.deliveryId = data.deliveryId.trim();
  }

  // Validate status
  const statusValidation = validateDeliveryStatus(data.status);
  if (!statusValidation.success) {
    errors.push(...(statusValidation.errors || []));
  } else {
    validatedData.status = statusValidation.data;
  }

  // Validate notes (optional)
  if (data.notes) {
    if (typeof data.notes !== 'string') {
      errors.push('Notes must be a string');
    } else if (data.notes.trim().length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    } else {
      validatedData.notes = data.notes.trim();
    }
  }

  // Validate location (optional)
  if (data.location) {
    const locationValidation = validateLocation(data.location);
    if (!locationValidation.success) {
      errors.push(...(locationValidation.errors || []));
    } else {
      validatedData.location = locationValidation.data;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate location update data
 */
export function validateLocationUpdate(data: {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}): ValidationResult<{
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate coordinates
  const locationValidation = validateLocation({ lat: data.lat, lng: data.lng });
  if (!locationValidation.success) {
    errors.push(...(locationValidation.errors || []));
  } else {
    validatedData.lat = locationValidation.data.lat;
    validatedData.lng = locationValidation.data.lng;
  }

  // Validate heading (optional)
  if (data.heading !== undefined) {
    if (typeof data.heading !== 'number') {
      errors.push('Heading must be a number');
    } else if (data.heading < 0 || data.heading >= 360) {
      errors.push('Heading must be between 0 and 359 degrees');
    } else {
      validatedData.heading = data.heading;
    }
  }

  // Validate speed (optional)
  if (data.speed !== undefined) {
    if (typeof data.speed !== 'number') {
      errors.push('Speed must be a number');
    } else if (data.speed < 0) {
      errors.push('Speed cannot be negative');
    } else if (data.speed > 200) { // 200 km/h max reasonable speed
      errors.push('Speed seems unreasonably high');
    } else {
      validatedData.speed = data.speed;
    }
  }

  // Validate accuracy (optional)
  if (data.accuracy !== undefined) {
    if (typeof data.accuracy !== 'number') {
      errors.push('Accuracy must be a number');
    } else if (data.accuracy < 0) {
      errors.push('Accuracy cannot be negative');
    } else {
      validatedData.accuracy = data.accuracy;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate delivery issue report
 */
export function validateDeliveryIssue(data: {
  type: string;
  description: string;
  severity?: string;
}): ValidationResult<{
  type: string;
  description: string;
  severity: string;
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate issue type
  const validIssueTypes = [
    'customer_not_available',
    'wrong_address',
    'damaged_order',
    'missing_items',
    'payment_issue',
    'vehicle_breakdown',
    'accident',
    'safety_concern',
    'other'
  ];

  if (!data.type || typeof data.type !== 'string') {
    errors.push('Issue type is required');
  } else if (!validIssueTypes.includes(data.type)) {
    errors.push(`Invalid issue type. Must be one of: ${validIssueTypes.join(', ')}`);
  } else {
    validatedData.type = data.type;
  }

  // Validate description
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Issue description is required');
  } else {
    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length < 10) {
      errors.push('Issue description must be at least 10 characters');
    } else if (trimmedDescription.length > 1000) {
      errors.push('Issue description cannot exceed 1000 characters');
    } else {
      validatedData.description = trimmedDescription;
    }
  }

  // Validate severity (optional, with default)
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  const severity = data.severity || 'medium';

  if (!validSeverities.includes(severity)) {
    errors.push(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`);
  } else {
    validatedData.severity = severity;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate delivery completion data
 */
export function validateDeliveryCompletion(data: {
  deliveryId: string;
  notes?: string;
  signature?: string;
  photo?: File;
}): ValidationResult<{
  deliveryId: string;
  notes?: string;
  signature?: string;
  photo?: File;
}> {
  const errors: string[] = [];
  let validatedData: any = {};

  // Validate delivery ID
  if (!data.deliveryId || typeof data.deliveryId !== 'string') {
    errors.push('Valid delivery ID is required');
  } else {
    validatedData.deliveryId = data.deliveryId.trim();
  }

  // Validate notes (optional)
  if (data.notes) {
    if (typeof data.notes !== 'string') {
      errors.push('Completion notes must be a string');
    } else if (data.notes.trim().length > 500) {
      errors.push('Completion notes cannot exceed 500 characters');
    } else {
      validatedData.notes = data.notes.trim();
    }
  }

  // Validate signature (optional)
  if (data.signature) {
    if (typeof data.signature !== 'string') {
      errors.push('Signature must be a string');
    } else {
      validatedData.signature = data.signature;
    }
  }

  // Validate photo (optional)
  if (data.photo) {
    if (!(data.photo instanceof File)) {
      errors.push('Photo must be a valid file');
    } else {
      // Check file size (max 5MB)
      if (data.photo.size > 5 * 1024 * 1024) {
        errors.push('Photo file size cannot exceed 5MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.photo.type)) {
        errors.push('Photo must be a JPEG, PNG, or WebP image');
      }

      if (errors.length === 0) {
        validatedData.photo = data.photo;
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData };
}

/**
 * Validate delivery time estimate
 */
export function validateDeliveryTimeEstimate(estimatedMinutes: number): ValidationResult<number> {
  if (typeof estimatedMinutes !== 'number') {
    return { success: false, errors: ['Estimated delivery time must be a number'] };
  }

  if (estimatedMinutes < 5) {
    return { success: false, errors: ['Estimated delivery time must be at least 5 minutes'] };
  }

  if (estimatedMinutes > 180) {
    return { success: false, errors: ['Estimated delivery time cannot exceed 3 hours'] };
  }

  return { success: true, data: Math.round(estimatedMinutes) };
}

/**
 * Validate delivery distance
 */
export function validateDeliveryDistance(distanceKm: number): ValidationResult<number> {
  if (typeof distanceKm !== 'number') {
    return { success: false, errors: ['Delivery distance must be a number'] };
  }

  if (distanceKm < 0) {
    return { success: false, errors: ['Delivery distance cannot be negative'] };
  }

  if (distanceKm > 50) {
    return { success: false, errors: ['Delivery distance cannot exceed 50km'] };
  }

  return { success: true, data: Number(distanceKm.toFixed(2)) };
}

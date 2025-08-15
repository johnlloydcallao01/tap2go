/**
 * Serialization utilities for Redux data
 * Firestore Timestamp handling removed - use PayloadCMS collections instead
 */

import { User } from '@/types';

/**
 * Serialize user data for Redux
 */
export const serializeUser = (user: User | null): User | null => {
  if (!user) return null;

  return {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
  } as User;
};

/**
 * Serialize document data for Redux
 */
export const serializeDoc = (doc: Record<string, unknown> | null): Record<string, unknown> | null => {
  if (!doc) return null;

  const serialized = { ...doc };

  // Convert all Date fields to ISO strings
  Object.keys(serialized).forEach(key => {
    if (serialized[key] instanceof Date) {
      serialized[key] = (serialized[key] as Date).toISOString();
    }
  });

  return serialized;
};

/**
 * Deserialize ISO strings back to Date objects when needed
 */
export const deserializeTimestamps = (data: Record<string, unknown> | null): Record<string, unknown> | null => {
  if (!data) return null;
  
  const deserialized = { ...data };
  
  // Convert ISO strings back to Date objects for common timestamp fields
  const timestampFields = ['createdAt', 'updatedAt', 'lastLoginAt', 'emailVerified'];
  
  timestampFields.forEach(field => {
    if (deserialized[field] && typeof deserialized[field] === 'string') {
      deserialized[field] = new Date(deserialized[field]);
    }
  });
  
  return deserialized;
};

/**
 * Check if a value is serializable for Redux
 */
export const isSerializable = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (value instanceof Date) return false;
  if (value instanceof Timestamp) return false;
  if (Array.isArray(value)) return value.every(isSerializable);
  if (typeof value === 'object') return Object.values(value).every(isSerializable);
  return false;
};

/**
 * Serialization Middleware - Automatically handles Firebase Timestamps
 * Converts all Firebase Timestamps to ISO strings before they reach Redux
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';

/**
 * Recursively serialize Firebase Timestamps in any object
 */
const serializeFirebaseData = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Firebase Timestamp
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeFirebaseData);
  }

  // Handle objects
  if (typeof obj === 'object' && obj !== null && obj.constructor === Object) {
    const serialized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeFirebaseData((obj as Record<string, unknown>)[key]);
      }
    }
    return serialized;
  }

  // Return primitive values as-is
  return obj;
};

/**
 * Middleware that automatically serializes Firebase data in actions
 */
export const serializationMiddleware: Middleware = () => (next) => (action) => {
  // Type assertion for action
  const typedAction = action as AnyAction;

  // List of actions that might contain Firebase data
  const actionsToSerialize = [
    'auth/setUser',
    'auth/syncAuthState',
    'auth/updateUserData',
    'auth/signIn/fulfilled',
    'auth/signUp/fulfilled',
    'auth/updateUserProfile/fulfilled',
  ];

  // Check if this action needs serialization
  if (actionsToSerialize.includes(typedAction.type)) {
    // Create a new action with serialized payload
    const serializedAction: AnyAction = {
      ...typedAction,
      payload: serializeFirebaseData(typedAction.payload),
    };

    return next(serializedAction);
  }

  // For other actions, just pass them through
  return next(action);
};

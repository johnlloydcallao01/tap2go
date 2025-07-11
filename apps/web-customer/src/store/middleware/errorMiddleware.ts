/**
 * Error Middleware - Centralized error handling
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { showErrorNotification } from '../slices/uiSlice';

export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  // Type assertion for action
  const typedAction = action as AnyAction;

  // Handle rejected async thunks
  if (typedAction.type.endsWith('/rejected')) {
    const error = typedAction.payload || typedAction.error?.message || 'An error occurred';

    // Show error notification
    store.dispatch(showErrorNotification({
      title: 'Error',
      message: error,
    }));

    // Log error for debugging
    console.error('Redux Error:', {
      action: typedAction.type,
      error: error,
      timestamp: new Date().toISOString(),
    });
  }

  return next(action);
};

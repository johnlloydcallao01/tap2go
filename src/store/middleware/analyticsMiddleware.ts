/**
 * Analytics Middleware - Track user actions and events
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';

export const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  // Type assertion for action
  const typedAction = action as AnyAction;

  // Track specific actions for analytics
  const trackableActions = [
    'cart/addToCart',
    'cart/removeFromCart',
    'orders/createOrder',
    'auth/signIn',
    'auth/signUp',
    'restaurants/setCurrentRestaurant',
  ];

  if (trackableActions.includes(typedAction.type)) {
    // Send analytics event
    try {
      // TODO: Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
      console.log('Analytics Event:', {
        action: typedAction.type,
        payload: typedAction.payload,
        timestamp: new Date().toISOString(),
        userId: store.getState().auth.user?.id,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  return next(action);
};

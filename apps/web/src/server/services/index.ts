/**
 * Services Index
 * 
 * This file exports all business logic services for the web application.
 * Services contain the core business logic and handle data operations.
 */

// Export all services
export * from './auth-service';
export * from './order-service';
export * from './restaurant-service';
export * from './user-service';
export * from './payment-service';
export * from './notification-service';
export * from './analytics-service';
export * from './search-service';
export * from './file-service';

// Re-export existing services with new names for consistency
export { default as deliveryService } from './deliveryService';
export { default as mapsService } from './mapsService';
export { default as paymongoService } from './paymongoService';

// Legacy exports (to be refactored)
export * from './orders';
export * from './users';
export * from './vendors';

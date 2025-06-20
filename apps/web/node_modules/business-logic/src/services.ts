// Order business logic utilities

/**
 * Generates a unique order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
};

/**
 * Calculates the total order amount including all fees and discounts
 */
export const calculateOrderTotal = (
  subtotal: number,
  taxes: number,
  deliveryFee: number,
  serviceFee: number,
  discount: number,
  tip: number = 0
): number => {
  return subtotal + taxes + deliveryFee + serviceFee - discount + tip;
};

/**
 * Calculates delivery fee based on distance and restaurant settings
 */
export const calculateDeliveryFee = (
  distance: number,
  baseDeliveryFee: number,
  perKmRate: number = 0.5
): number => {
  if (distance <= 2) return baseDeliveryFee;
  return baseDeliveryFee + ((distance - 2) * perKmRate);
};

/**
 * Calculates estimated delivery time based on preparation time and distance
 */
export const calculateEstimatedDeliveryTime = (
  preparationTime: number,
  distance: number,
  averageSpeed: number = 30 // km/h
): number => {
  const travelTime = (distance / averageSpeed) * 60; // Convert to minutes
  return Math.ceil(preparationTime + travelTime + 5); // Add 5 min buffer
};

/**
 * Validates if an order can be placed
 */
export const validateOrder = (orderData: {
  items: Array<{ quantity: number; price: number }>;
  restaurantId: string;
  deliveryAddress: string;
  minimumOrder: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if items exist
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  // Check quantities
  const hasInvalidQuantity = orderData.items.some(item => item.quantity <= 0);
  if (hasInvalidQuantity) {
    errors.push('All items must have a quantity greater than 0');
  }

  // Check minimum order amount
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal < orderData.minimumOrder) {
    errors.push(`Order must meet minimum amount of $${orderData.minimumOrder}`);
  }

  // Check required fields
  if (!orderData.restaurantId) {
    errors.push('Restaurant ID is required');
  }

  if (!orderData.deliveryAddress) {
    errors.push('Delivery address is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates platform commission based on order total and restaurant commission rate
 */
export const calculatePlatformCommission = (
  orderTotal: number,
  commissionRate: number
): number => {
  return orderTotal * (commissionRate / 100);
};

/**
 * Calculates vendor earnings after platform commission
 */
export const calculateVendorEarnings = (
  orderSubtotal: number,
  commissionRate: number
): number => {
  const commission = calculatePlatformCommission(orderSubtotal, commissionRate);
  return orderSubtotal - commission;
};

/**
 * Calculates driver earnings based on delivery fee and distance
 */
export const calculateDriverEarnings = (
  deliveryFee: number,
  distance: number,
  basePay: number = 3,
  perKmRate: number = 0.8
): number => {
  const distancePay = distance * perKmRate;
  return Math.max(basePay + distancePay, deliveryFee * 0.8); // Driver gets 80% of delivery fee minimum
};

/**
 * Determines if a restaurant is currently open
 */
export const isRestaurantOpen = (openingHours: {
  [key: string]: { open: string; close: string; isClosed: boolean };
}): boolean => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

  const todayHours = openingHours[currentDay];
  if (!todayHours || todayHours.isClosed) return false;

  const openTime = parseInt(todayHours.open.replace(':', ''));
  const closeTime = parseInt(todayHours.close.replace(':', ''));

  // Handle overnight hours (e.g., 22:00 - 02:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }

  return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * User service with business logic
 */
export const userService = {
  validateUserData: (userData: {
    email: string;
    phone?: string;
    name: string;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (userData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(userData.phone)) {
      errors.push('Valid phone number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

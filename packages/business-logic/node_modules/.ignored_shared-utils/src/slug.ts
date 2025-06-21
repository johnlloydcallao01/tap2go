/**
 * Professional slug generation utilities for enterprise-grade URL architecture
 * Following industry standards from UberEats, DoorDash, Amazon, etc.
 */

/**
 * Generates a SEO-friendly slug from a string
 * @param text - The text to convert to slug
 * @param maxLength - Maximum length of the slug (default: 50)
 * @returns Clean, URL-safe slug
 */
export const generateSlug = (text: string, maxLength: number = 50): string => {
  return text
    .toLowerCase()
    .trim()
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, maxLength)
    // Remove trailing hyphen if cut off mid-word
    .replace(/-+$/, '');
};

/**
 * Generates a unique slug by checking against existing slugs
 * @param text - The text to convert to slug
 * @param existingSlugs - Array of existing slugs to check against
 * @param maxLength - Maximum length of the slug (default: 50)
 * @returns Unique slug
 */
export const generateUniqueSlug = (
  text: string,
  existingSlugs: string[] = [],
  maxLength: number = 50
): string => {
  const baseSlug = generateSlug(text, maxLength - 3); // Reserve space for counter
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Find unique slug by appending counter
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
};

/**
 * Validates if a slug meets professional standards
 * @param slug - The slug to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateSlug = (slug: string): { isValid: boolean; error?: string } => {
  if (!slug || slug.trim().length === 0) {
    return { isValid: false, error: 'Slug cannot be empty' };
  }
  
  if (slug.length < 3) {
    return { isValid: false, error: 'Slug must be at least 3 characters long' };
  }
  
  if (slug.length > 60) {
    return { isValid: false, error: 'Slug must be 60 characters or less' };
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }
  
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, error: 'Slug cannot start or end with a hyphen' };
  }
  
  if (slug.includes('--')) {
    return { isValid: false, error: 'Slug cannot contain consecutive hyphens' };
  }
  
  return { isValid: true };
};

/**
 * Converts a slug back to a readable title (for display purposes)
 * @param slug - The slug to convert
 * @returns Human-readable title
 */
export const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Professional slug examples for different food categories
 */
export const SLUG_EXAMPLES = {
  pizza: 'margherita-pizza',
  burger: 'classic-cheeseburger',
  pasta: 'creamy-carbonara',
  salad: 'caesar-salad',
  dessert: 'chocolate-lava-cake',
  drink: 'iced-caramel-macchiato',
  appetizer: 'buffalo-chicken-wings',
  sandwich: 'grilled-chicken-sandwich'
} as const;

/**
 * Reserved slugs that should not be used (to avoid conflicts with system routes)
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'cart',
  'checkout',
  'dashboard',
  'home',
  'login',
  'logout',
  'menu',
  'order',
  'orders',
  'payment',
  'profile',
  'restaurant',
  'restaurants',
  'search',
  'settings',
  'signup',
  'user',
  'users'
] as const;

/**
 * Checks if a slug is reserved
 * @param slug - The slug to check
 * @returns True if slug is reserved
 */
export const isReservedSlug = (slug: string): boolean => {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
};

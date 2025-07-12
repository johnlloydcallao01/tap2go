/**
 * Professional slug usage examples for enterprise-grade food delivery app
 * This file demonstrates how to implement slug-based URLs like UberEats, DoorDash, etc.
 */

import { generateSlug, generateUniqueSlug, validateSlug, isReservedSlug } from '@/lib/utils/slug';
import { MenuItem } from '@/types';

/**
 * Example: Creating slugs for new menu items
 */
export const createMenuItemWithSlug = (
  name: string,
  existingItems: MenuItem[] = []
): { slug: string; isValid: boolean; error?: string } => {
  
  // Check if name would create a reserved slug
  const potentialSlug = generateSlug(name);
  if (isReservedSlug(potentialSlug)) {
    return {
      slug: '',
      isValid: false,
      error: `"${potentialSlug}" is a reserved slug. Please use a different name.`
    };
  }

  // Get existing slugs to ensure uniqueness
  const existingSlugs = existingItems.map(item => item.slug);
  
  // Generate unique slug
  const slug = generateUniqueSlug(name, existingSlugs);
  
  // Validate the generated slug
  const validation = validateSlug(slug);
  
  return {
    slug,
    isValid: validation.isValid,
    error: validation.error
  };
};

/**
 * Example: Professional food item slug generation
 */
export const PROFESSIONAL_FOOD_SLUGS = {
  // Pizza variations
  'Margherita Pizza': 'margherita-pizza',
  'Pepperoni Pizza': 'pepperoni-pizza',
  'Hawaiian Pizza': 'hawaiian-pizza',
  'Meat Lovers Pizza': 'meat-lovers-pizza',
  'Veggie Supreme Pizza': 'veggie-supreme-pizza',
  
  // Burgers
  'Classic Cheeseburger': 'classic-cheeseburger',
  'Big Mac': 'big-mac',
  'Whopper': 'whopper',
  'Double Bacon Burger': 'double-bacon-burger',
  'Veggie Burger': 'veggie-burger',
  
  // Asian dishes
  'Chicken Teriyaki Bowl': 'chicken-teriyaki-bowl',
  'Beef Bulgogi': 'beef-bulgogi',
  'Pad Thai': 'pad-thai',
  'General Tso\'s Chicken': 'general-tsos-chicken',
  'Kung Pao Chicken': 'kung-pao-chicken',
  
  // Beverages
  'Iced Caramel Macchiato': 'iced-caramel-macchiato',
  'Green Tea Latte': 'green-tea-latte',
  'Fresh Orange Juice': 'fresh-orange-juice',
  'Chocolate Milkshake': 'chocolate-milkshake',
  
  // Desserts
  'Chocolate Lava Cake': 'chocolate-lava-cake',
  'New York Cheesecake': 'new-york-cheesecake',
  'Tiramisu': 'tiramisu',
  'Ice Cream Sundae': 'ice-cream-sundae'
} as const;

/**
 * Example: Bulk slug generation for existing menu items
 */
export const generateSlugsForExistingItems = (items: Omit<MenuItem, 'slug'>[]): MenuItem[] => {
  const existingSlugs: string[] = [];
  
  return items.map(item => {
    const slug = generateUniqueSlug(item.name, existingSlugs);
    existingSlugs.push(slug);
    
    return {
      ...item,
      slug
    };
  });
};

/**
 * Example: URL generation helpers
 */
export const generateFoodItemURL = (restaurantSlug: string, itemSlug: string): string => {
  return `/restaurant/${restaurantSlug}/item/${itemSlug}`;
};

export const generateRestaurantURL = (restaurantSlug: string): string => {
  return `/restaurant/${restaurantSlug}`;
};

/**
 * Example: SEO-friendly URL patterns used by major platforms
 */
export const INDUSTRY_URL_PATTERNS = {
  // UberEats style
  uberEats: (restaurantSlug: string, itemSlug: string) => 
    `/stores/${restaurantSlug}/items/${itemSlug}`,
  
  // DoorDash style
  doorDash: (restaurantSlug: string, itemSlug: string) => 
    `/restaurant/${restaurantSlug}/menu/${itemSlug}`,
  
  // Grubhub style
  grubhub: (restaurantSlug: string, itemSlug: string) => 
    `/restaurant/${restaurantSlug}/menu/${itemSlug}`,
  
  // Our implementation (professional and clean)
  tap2go: (restaurantSlug: string, itemSlug: string) => 
    `/restaurant/${restaurantSlug}/item/${itemSlug}`
} as const;

/**
 * Example: Handling special characters in food names
 */
export const SPECIAL_FOOD_NAME_EXAMPLES = {
  // Names with special characters
  'Café au Lait': 'cafe-au-lait',
  'Piña Colada': 'pina-colada',
  'Crème Brûlée': 'creme-brulee',
  'Jalapeño Poppers': 'jalapeno-poppers',
  'Açaí Bowl': 'acai-bowl',
  
  // Names with numbers
  '3-Cheese Pizza': '3-cheese-pizza',
  '24oz Ribeye Steak': '24oz-ribeye-steak',
  '12-Hour Smoked Brisket': '12-hour-smoked-brisket',
  
  // Long names
  'Grilled Chicken Caesar Salad with Parmesan Croutons': 'grilled-chicken-caesar-salad-with-parmesan-croutons',
  'Double Bacon Cheeseburger with Avocado and Sweet Potato Fries': 'double-bacon-cheeseburger-with-avocado-and-sweet-potato-fries'
} as const;

/**
 * Example: Migration helper for existing apps
 */
export const migrateFromIdToSlug = (items: MenuItem[]): { 
  success: MenuItem[]; 
  errors: { item: MenuItem; error: string }[] 
} => {
  const success: MenuItem[] = [];
  const errors: { item: MenuItem; error: string }[] = [];
  const usedSlugs: string[] = [];
  
  items.forEach(item => {
    try {
      // Generate slug if it doesn't exist
      if (!item.slug) {
        const slug = generateUniqueSlug(item.name, usedSlugs);
        const validation = validateSlug(slug);
        
        if (!validation.isValid) {
          errors.push({ item, error: validation.error || 'Invalid slug generated' });
          return;
        }
        
        usedSlugs.push(slug);
        success.push({ ...item, slug });
      } else {
        // Validate existing slug
        const validation = validateSlug(item.slug);
        if (!validation.isValid) {
          errors.push({ item, error: validation.error || 'Invalid existing slug' });
          return;
        }
        
        if (usedSlugs.includes(item.slug)) {
          errors.push({ item, error: 'Duplicate slug detected' });
          return;
        }
        
        usedSlugs.push(item.slug);
        success.push(item);
      }
    } catch (error) {
      errors.push({ item, error: `Unexpected error: ${error}` });
    }
  });
  
  return { success, errors };
};

/**
 * Example: Search and filtering with slugs
 */
export const findItemBySlug = (items: MenuItem[], slug: string): MenuItem | null => {
  return items.find(item => item.slug === slug) || null;
};

export const searchItemsBySlug = (items: MenuItem[], searchTerm: string): MenuItem[] => {
  const searchSlug = generateSlug(searchTerm);
  return items.filter(item => 
    item.slug.includes(searchSlug) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

/**
 * Example: Analytics tracking with slugs
 */
export const trackFoodItemView = (restaurantSlug: string, itemSlug: string) => {
  // Example analytics event
  console.log('Analytics: Food item viewed', {
    restaurant: restaurantSlug,
    item: itemSlug,
    url: generateFoodItemURL(restaurantSlug, itemSlug),
    timestamp: new Date().toISOString()
  });
};

/**
 * Example: Sitemap generation for SEO
 */
export const generateSitemapUrls = (restaurants: { slug: string; items: MenuItem[] }[]): string[] => {
  const urls: string[] = [];
  
  restaurants.forEach(restaurant => {
    // Add restaurant URL
    urls.push(generateRestaurantURL(restaurant.slug));
    
    // Add all food item URLs
    restaurant.items.forEach(item => {
      urls.push(generateFoodItemURL(restaurant.slug, item.slug));
    });
  });
  
  return urls;
};

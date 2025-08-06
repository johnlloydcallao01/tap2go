'use server';

/**
 * Restaurant Management Server Actions
 * 
 * Server actions for restaurant creation, updates, and management operations.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { restaurantService } from '../services/restaurant-service';
import { validateRestaurantData, validateRestaurantUpdate } from '../validators/restaurant-validators';
import { ActionResult } from '../types/actions';
import { getCurrentVendor } from '../utils/vendor-auth-utils';

/**
 * Create restaurant action
 */
export async function createRestaurant(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    // Extract restaurant data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const cuisineTypes = formData.getAll('cuisine') as string[];
    const priceRange = formData.get('priceRange') as '$' | '$$' | '$$$' | '$$$$';
    const deliveryFee = parseFloat(formData.get('deliveryFee') as string);
    const minimumOrder = parseFloat(formData.get('minimumOrder') as string);
    const deliveryTimeMin = parseInt(formData.get('deliveryTimeMin') as string);
    const deliveryTimeMax = parseInt(formData.get('deliveryTimeMax') as string);
    const image = formData.get('image') as File;

    // Validate restaurant data
    const validation = validateRestaurantData({
      name,
      description,
      address,
      phone,
      email,
      cuisine: cuisineTypes,
      priceRange,
      deliveryFee,
      minimumOrder,
      deliveryTime: {
        min: deliveryTimeMin,
        max: deliveryTimeMax
      },
      image
    });

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Create restaurant
    const result = await restaurantService.createRestaurant({
      ...validation.data!,
      ownerId: vendor.id
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to create restaurant'] };
    }

    // Revalidate vendor pages
    revalidatePath('/dashboard');
    revalidatePath('/restaurants');
    
    // Redirect to restaurant management
    redirect(`/restaurants/${result.data?.restaurantId}`);
  } catch (error) {
    console.error('Create restaurant error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while creating restaurant'] 
    };
  }
}

/**
 * Update restaurant action
 */
export async function updateRestaurant(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    const restaurantId = formData.get('restaurantId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const cuisineTypes = formData.getAll('cuisine') as string[];
    const priceRange = formData.get('priceRange') as '$' | '$$' | '$$$' | '$$$$';
    const deliveryFee = formData.get('deliveryFee') ? parseFloat(formData.get('deliveryFee') as string) : undefined;
    const minimumOrder = formData.get('minimumOrder') ? parseFloat(formData.get('minimumOrder') as string) : undefined;
    const deliveryTimeMin = formData.get('deliveryTimeMin') ? parseInt(formData.get('deliveryTimeMin') as string) : undefined;
    const deliveryTimeMax = formData.get('deliveryTimeMax') ? parseInt(formData.get('deliveryTimeMax') as string) : undefined;
    const isOpen = formData.get('isOpen') === 'true';

    // Validate restaurant update data
    const validation = validateRestaurantUpdate({
      restaurantId,
      name,
      description,
      phone,
      email,
      cuisine: cuisineTypes.length > 0 ? cuisineTypes : undefined,
      priceRange,
      deliveryFee,
      minimumOrder,
      deliveryTime: (deliveryTimeMin && deliveryTimeMax) ? {
        min: deliveryTimeMin,
        max: deliveryTimeMax
      } : undefined,
      isOpen
    });

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Update restaurant
    const result = await restaurantService.updateRestaurant(restaurantId, validation.data!, vendor.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update restaurant'] };
    }

    // Revalidate restaurant pages
    revalidatePath('/dashboard');
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${restaurantId}`);
    
    return { success: true, message: 'Restaurant updated successfully' };
  } catch (error) {
    console.error('Update restaurant error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating restaurant'] 
    };
  }
}

/**
 * Toggle restaurant status action
 */
export async function toggleRestaurantStatus(
  restaurantId: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    if (!restaurantId) {
      return { success: false, errors: ['Restaurant ID is required'] };
    }

    // Toggle restaurant status
    const result = await restaurantService.toggleRestaurantStatus(restaurantId, vendor.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to toggle restaurant status'] };
    }

    // Revalidate restaurant pages
    revalidatePath('/dashboard');
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${restaurantId}`);
    
    const newStatus = result.data?.isOpen ? 'opened' : 'closed';
    return { success: true, message: `Restaurant ${newStatus} successfully` };
  } catch (error) {
    console.error('Toggle restaurant status error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while toggling restaurant status'] 
    };
  }
}

/**
 * Update restaurant hours action
 */
export async function updateRestaurantHours(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    const restaurantId = formData.get('restaurantId') as string;
    
    if (!restaurantId) {
      return { success: false, errors: ['Restaurant ID is required'] };
    }

    // Extract opening hours data
    const openingHours: any = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const isOpen = formData.get(`${day}_open`) === 'true';
      if (isOpen) {
        const openTime = formData.get(`${day}_open_time`) as string;
        const closeTime = formData.get(`${day}_close_time`) as string;
        
        if (openTime && closeTime) {
          openingHours[day] = {
            open: openTime,
            close: closeTime,
            isOpen: true
          };
        }
      } else {
        openingHours[day] = { isOpen: false };
      }
    }

    // Update restaurant hours
    const result = await restaurantService.updateRestaurantHours(restaurantId, openingHours, vendor.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update restaurant hours'] };
    }

    // Revalidate restaurant pages
    revalidatePath(`/restaurants/${restaurantId}`);
    
    return { success: true, message: 'Restaurant hours updated successfully' };
  } catch (error) {
    console.error('Update restaurant hours error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating restaurant hours'] 
    };
  }
}

/**
 * Upload restaurant image action
 */
export async function uploadRestaurantImage(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    const restaurantId = formData.get('restaurantId') as string;
    const image = formData.get('image') as File;
    const imageType = formData.get('imageType') as 'main' | 'cover' | 'gallery';

    if (!restaurantId) {
      return { success: false, errors: ['Restaurant ID is required'] };
    }

    if (!image || !(image instanceof File)) {
      return { success: false, errors: ['Valid image file is required'] };
    }

    // Validate image file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return { success: false, errors: ['Image file size cannot exceed 5MB'] };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return { success: false, errors: ['Image must be JPEG, PNG, or WebP format'] };
    }

    // Upload restaurant image
    const result = await restaurantService.uploadRestaurantImage(
      restaurantId,
      image,
      imageType || 'main',
      vendor.id
    );

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to upload restaurant image'] };
    }

    // Revalidate restaurant pages
    revalidatePath(`/restaurants/${restaurantId}`);
    
    return { success: true, message: 'Restaurant image uploaded successfully' };
  } catch (error) {
    console.error('Upload restaurant image error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while uploading restaurant image'] 
    };
  }
}

/**
 * Delete restaurant action
 */
export async function deleteRestaurant(
  restaurantId: string,
  reason: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current vendor
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return { success: false, errors: ['Vendor authentication required'] };
    }

    if (!restaurantId) {
      return { success: false, errors: ['Restaurant ID is required'] };
    }

    if (!reason || reason.trim().length < 10) {
      return { success: false, errors: ['Deletion reason must be at least 10 characters'] };
    }

    // Delete restaurant
    const result = await restaurantService.deleteRestaurant(restaurantId, vendor.id, reason.trim());

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to delete restaurant'] };
    }

    // Revalidate restaurant pages
    revalidatePath('/dashboard');
    revalidatePath('/restaurants');
    
    return { success: true, message: 'Restaurant deleted successfully' };
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while deleting restaurant'] 
    };
  }
}

'use server';

/**
 * Delivery Management Server Actions
 * 
 * Server actions for delivery operations, status updates, and route management.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deliveryService } from '../services/delivery-service';
import { validateDeliveryUpdate, validateLocationUpdate } from '../validators/delivery-validators';
import { ActionResult } from '../types/actions';
import { getCurrentDriver } from '../utils/driver-auth-utils';

/**
 * Accept delivery assignment action
 */
export async function acceptDelivery(
  deliveryId: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    if (!driver.isOnline) {
      return { success: false, errors: ['Driver must be online to accept deliveries'] };
    }

    // Accept delivery
    const result = await deliveryService.acceptDelivery(deliveryId, driver.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to accept delivery'] };
    }

    // Revalidate driver pages
    revalidatePath('/dashboard');
    revalidatePath('/current');
    
    return { success: true, message: 'Delivery accepted successfully' };
  } catch (error) {
    console.error('Accept delivery error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while accepting delivery'] 
    };
  }
}

/**
 * Update delivery status action
 */
export async function updateDeliveryStatus(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    const deliveryId = formData.get('deliveryId') as string;
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;
    const locationLat = formData.get('locationLat') as string;
    const locationLng = formData.get('locationLng') as string;

    // Validate delivery update data
    const validation = validateDeliveryUpdate({
      deliveryId,
      status,
      notes,
      location: locationLat && locationLng ? {
        lat: parseFloat(locationLat),
        lng: parseFloat(locationLng)
      } : undefined
    });

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Update delivery status
    const result = await deliveryService.updateDeliveryStatus(
      deliveryId,
      status,
      driver.id,
      {
        notes: notes || undefined,
        location: validation.data!.location
      }
    );

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update delivery status'] };
    }

    // Revalidate relevant pages
    revalidatePath('/current');
    revalidatePath('/orders');
    
    return { success: true, message: 'Delivery status updated successfully' };
  } catch (error) {
    console.error('Update delivery status error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating delivery status'] 
    };
  }
}

/**
 * Start delivery action
 */
export async function startDelivery(
  deliveryId: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    // Start delivery
    const result = await deliveryService.startDelivery(deliveryId, driver.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to start delivery'] };
    }

    // Revalidate driver pages
    revalidatePath('/current');
    revalidatePath('/orders');
    
    return { success: true, message: 'Delivery started successfully' };
  } catch (error) {
    console.error('Start delivery error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while starting delivery'] 
    };
  }
}

/**
 * Complete delivery action
 */
export async function completeDelivery(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    const deliveryId = formData.get('deliveryId') as string;
    const completionNotes = formData.get('completionNotes') as string;
    const customerSignature = formData.get('customerSignature') as string;
    const deliveryPhoto = formData.get('deliveryPhoto') as File;

    if (!deliveryId) {
      return { success: false, errors: ['Delivery ID is required'] };
    }

    // Complete delivery
    const result = await deliveryService.completeDelivery(deliveryId, driver.id, {
      notes: completionNotes || undefined,
      signature: customerSignature || undefined,
      photo: deliveryPhoto || undefined
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to complete delivery'] };
    }

    // Revalidate driver pages
    revalidatePath('/current');
    revalidatePath('/orders');
    revalidatePath('/earnings');
    
    return { success: true, message: 'Delivery completed successfully' };
  } catch (error) {
    console.error('Complete delivery error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while completing delivery'] 
    };
  }
}

/**
 * Report delivery issue action
 */
export async function reportDeliveryIssue(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    const deliveryId = formData.get('deliveryId') as string;
    const issueType = formData.get('issueType') as string;
    const description = formData.get('description') as string;
    const photos = formData.getAll('photos') as File[];

    if (!deliveryId) {
      return { success: false, errors: ['Delivery ID is required'] };
    }

    if (!issueType) {
      return { success: false, errors: ['Issue type is required'] };
    }

    if (!description || description.trim().length < 10) {
      return { success: false, errors: ['Issue description must be at least 10 characters'] };
    }

    // Report delivery issue
    const result = await deliveryService.reportDeliveryIssue(deliveryId, driver.id, {
      type: issueType,
      description: description.trim(),
      photos: photos.length > 0 ? photos : undefined
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to report delivery issue'] };
    }

    // Revalidate driver pages
    revalidatePath('/current');
    revalidatePath('/orders');
    
    return { success: true, message: 'Delivery issue reported successfully' };
  } catch (error) {
    console.error('Report delivery issue error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while reporting delivery issue'] 
    };
  }
}

/**
 * Update driver location action
 */
export async function updateDriverLocation(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;
    const heading = formData.get('heading') as string;
    const speed = formData.get('speed') as string;

    // Validate location data
    const validation = validateLocationUpdate({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      heading: heading ? parseFloat(heading) : undefined,
      speed: speed ? parseFloat(speed) : undefined
    });

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Update driver location
    const result = await deliveryService.updateDriverLocation(driver.id, validation.data!);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update location'] };
    }

    return { success: true, message: 'Location updated successfully' };
  } catch (error) {
    console.error('Update driver location error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating location'] 
    };
  }
}

/**
 * Toggle driver online status action
 */
export async function toggleDriverOnlineStatus(
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current driver
    const driver = await getCurrentDriver();
    if (!driver) {
      return { success: false, errors: ['Driver authentication required'] };
    }

    // Toggle online status
    const result = await deliveryService.toggleDriverOnlineStatus(driver.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update online status'] };
    }

    // Revalidate driver pages
    revalidatePath('/dashboard');
    revalidatePath('/current');
    
    const newStatus = result.data?.isOnline ? 'online' : 'offline';
    return { success: true, message: `Driver status updated to ${newStatus}` };
  } catch (error) {
    console.error('Toggle driver online status error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating online status'] 
    };
  }
}

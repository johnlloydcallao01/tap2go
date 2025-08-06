'use server';

/**
 * Order Management Server Actions
 * 
 * Server actions for order creation, updates, and management.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { orderService } from '../services/order-service';
import { validateOrderData } from '../validators/order-validators';
import { ActionResult } from '../types/actions';
import { getCurrentUser } from '../utils/auth-utils';

/**
 * Create new order action
 */
export async function createOrder(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, errors: ['Authentication required'] };
    }

    // Extract order data
    const restaurantId = formData.get('restaurantId') as string;
    const itemsJson = formData.get('items') as string;
    const deliveryAddress = formData.get('deliveryAddress') as string;
    const paymentMethodId = formData.get('paymentMethodId') as string;
    const specialInstructions = formData.get('specialInstructions') as string;

    let items;
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return { success: false, errors: ['Invalid order items format'] };
    }

    // Validate order data
    const validation = validateOrderData({
      restaurantId,
      items,
      deliveryAddress,
      paymentMethodId,
      specialInstructions
    });

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // Create order
    const result = await orderService.createOrder({
      customerId: user.id,
      restaurantId,
      items,
      deliveryAddress,
      paymentMethodId,
      specialInstructions: specialInstructions || undefined
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to create order'] };
    }

    // Revalidate orders page
    revalidatePath('/orders');
    
    // Redirect to order confirmation
    redirect(`/orders/${result.data?.orderId}`);
  } catch (error) {
    console.error('Create order error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while creating the order'] 
    };
  }
}

/**
 * Update order status action (for vendors/drivers)
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, errors: ['Authentication required'] };
    }

    // Check if user has permission to update orders
    if (!['vendor', 'driver', 'admin'].includes(user.role)) {
      return { success: false, errors: ['Insufficient permissions'] };
    }

    // Update order status
    const result = await orderService.updateOrderStatus(orderId, status, user.id);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update order status'] };
    }

    // Revalidate relevant pages
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, message: 'Order status updated successfully' };
  } catch (error) {
    console.error('Update order status error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating order status'] 
    };
  }
}

/**
 * Cancel order action
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, errors: ['Authentication required'] };
    }

    // Cancel order
    const result = await orderService.cancelOrder(orderId, user.id, reason);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to cancel order'] };
    }

    // Revalidate orders page
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, message: 'Order cancelled successfully' };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while cancelling the order'] 
    };
  }
}

/**
 * Rate order action
 */
export async function rateOrder(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, errors: ['Authentication required'] };
    }

    const orderId = formData.get('orderId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const review = formData.get('review') as string;

    // Validate rating
    if (!orderId || !rating || rating < 1 || rating > 5) {
      return { success: false, errors: ['Valid order ID and rating (1-5) are required'] };
    }

    // Submit rating
    const result = await orderService.rateOrder(orderId, user.id, {
      rating,
      review: review || undefined
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to submit rating'] };
    }

    // Revalidate order page
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, message: 'Rating submitted successfully' };
  } catch (error) {
    console.error('Rate order error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while submitting rating'] 
    };
  }
}

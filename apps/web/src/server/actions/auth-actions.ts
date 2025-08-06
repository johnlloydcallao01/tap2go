'use server';

/**
 * Authentication Server Actions
 * 
 * Server actions for user authentication, registration, and profile management.
 * These actions run on the server and can be called directly from client components.
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateEmail, validatePassword } from '../validators/auth-validators';
import { authService } from '../services/auth-service';
import { ActionResult } from '../types/actions';

/**
 * User registration action
 */
export async function registerUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as 'customer' | 'vendor' | 'driver';

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.success) {
      return { success: false, errors: emailValidation.errors };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.success) {
      return { success: false, errors: passwordValidation.errors };
    }

    if (!name || name.trim().length < 2) {
      return { success: false, errors: ['Name must be at least 2 characters'] };
    }

    // Register user
    const result = await authService.registerUser({
      email,
      password,
      name: name.trim(),
      role: role || 'customer'
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Registration failed'] };
    }

    // Revalidate auth-related pages
    revalidatePath('/auth');
    
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred during registration'] 
    };
  }
}

/**
 * User login action
 */
export async function loginUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.success) {
      return { success: false, errors: emailValidation.errors };
    }

    if (!password) {
      return { success: false, errors: ['Password is required'] };
    }

    // Authenticate user
    const result = await authService.loginUser({ email, password });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Login failed'] };
    }

    // Revalidate auth-related pages
    revalidatePath('/auth');
    revalidatePath('/profile');
    
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred during login'] 
    };
  }
}

/**
 * User logout action
 */
export async function logoutUser(): Promise<void> {
  try {
    await authService.logoutUser();
    
    // Revalidate all pages that might show user data
    revalidatePath('/', 'layout');
    
    redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    redirect('/');
  }
}

/**
 * Update user profile action
 */
export async function updateProfile(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    if (!name || name.trim().length < 2) {
      return { success: false, errors: ['Name must be at least 2 characters'] };
    }

    const result = await authService.updateProfile({
      name: name.trim(),
      phone: phone?.trim() || undefined
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Profile update failed'] };
    }

    // Revalidate profile page
    revalidatePath('/profile');
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating profile'] 
    };
  }
}

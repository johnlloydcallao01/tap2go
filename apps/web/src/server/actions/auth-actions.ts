'use server';

/**
 * Authentication Server Actions - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * These actions are maintained for future use if authentication is needed.
 */

import { ActionResult } from '../types/actions';

/**
 * Placeholder registration action - authentication disabled
 */
export async function registerUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return {
    success: false,
    errors: ['Authentication is disabled in the public web app. Please use the appropriate app for your role.']
  };
}

/**
 * Placeholder login action - authentication disabled
 */
export async function loginUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return {
    success: false,
    errors: ['Authentication is disabled in the public web app. Please use the appropriate app for your role.']
  };
}

/**
 * Placeholder logout action - authentication disabled
 */
export async function logoutUser(): Promise<void> {
  console.warn('Authentication is disabled in the public web app');
}

/**
 * Placeholder profile update action - authentication disabled
 */
export async function updateProfile(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return {
    success: false,
    errors: ['Authentication is disabled in the public web app. Please use the appropriate app for your role.']
  };
}

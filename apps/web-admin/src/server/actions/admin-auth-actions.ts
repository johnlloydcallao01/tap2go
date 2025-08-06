'use server';

/**
 * Admin Authentication Server Actions
 * 
 * Server actions for admin authentication and session management.
 * These actions handle admin-specific authentication flows.
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateEmail, validatePassword } from '../validators/admin-auth-validators';
import { adminAuthService } from '../services/admin-auth-service';
import { ActionResult } from '../types/actions';

/**
 * Admin login action
 */
export async function adminLogin(
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.success) {
      return { success: false, errors: passwordValidation.errors };
    }

    // Authenticate admin
    const result = await adminAuthService.loginAdmin({ email, password });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Admin login failed'] };
    }

    // Log admin login
    await adminAuthService.logAdminActivity(result.data!.user.id, 'admin_login', {
      ip: 'unknown', // TODO: Get real IP
      userAgent: 'unknown' // TODO: Get real user agent
    });

    // Revalidate admin pages
    revalidatePath('/dashboard');
    
    return { success: true, message: 'Admin login successful' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred during admin login'] 
    };
  }
}

/**
 * Admin logout action
 */
export async function adminLogout(): Promise<void> {
  try {
    await adminAuthService.logoutAdmin();
    
    // Revalidate all admin pages
    revalidatePath('/', 'layout');
    
    redirect('/login');
  } catch (error) {
    console.error('Admin logout error:', error);
    redirect('/login');
  }
}

/**
 * Create admin user action (super admin only)
 */
export async function createAdminUser(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const department = formData.get('department') as string;
    const accessLevel = formData.get('accessLevel') as 'read' | 'write' | 'admin';

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

    // Create admin user
    const result = await adminAuthService.createAdminUser({
      email,
      password,
      name: name.trim(),
      department: department || undefined,
      accessLevel: accessLevel || 'read'
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to create admin user'] };
    }

    // Revalidate admin users page
    revalidatePath('/dashboard/users');
    
    return { success: true, message: 'Admin user created successfully' };
  } catch (error) {
    console.error('Create admin user error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while creating admin user'] 
    };
  }
}

/**
 * Update admin permissions action
 */
export async function updateAdminPermissions(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const adminId = formData.get('adminId') as string;
    const permissions = formData.getAll('permissions') as string[];
    const accessLevel = formData.get('accessLevel') as 'read' | 'write' | 'admin';

    if (!adminId) {
      return { success: false, errors: ['Admin ID is required'] };
    }

    // Update admin permissions
    const result = await adminAuthService.updateAdminPermissions(adminId, {
      permissions,
      accessLevel
    });

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to update admin permissions'] };
    }

    // Revalidate admin users page
    revalidatePath('/dashboard/users');
    
    return { success: true, message: 'Admin permissions updated successfully' };
  } catch (error) {
    console.error('Update admin permissions error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while updating admin permissions'] 
    };
  }
}

/**
 * Deactivate admin user action
 */
export async function deactivateAdminUser(
  adminId: string,
  reason: string,
  prevState: ActionResult | null
): Promise<ActionResult> {
  try {
    if (!adminId) {
      return { success: false, errors: ['Admin ID is required'] };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, errors: ['Deactivation reason must be at least 5 characters'] };
    }

    // Deactivate admin user
    const result = await adminAuthService.deactivateAdminUser(adminId, reason.trim());

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to deactivate admin user'] };
    }

    // Revalidate admin users page
    revalidatePath('/dashboard/users');
    
    return { success: true, message: 'Admin user deactivated successfully' };
  } catch (error) {
    console.error('Deactivate admin user error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while deactivating admin user'] 
    };
  }
}

/**
 * Reset admin password action
 */
export async function resetAdminPassword(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const adminId = formData.get('adminId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!adminId) {
      return { success: false, errors: ['Admin ID is required'] };
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.success) {
      return { success: false, errors: passwordValidation.errors };
    }

    // Reset admin password
    const result = await adminAuthService.resetAdminPassword(adminId, newPassword);

    if (!result.success) {
      return { success: false, errors: [result.error || 'Failed to reset admin password'] };
    }

    // Revalidate admin users page
    revalidatePath('/dashboard/users');
    
    return { success: true, message: 'Admin password reset successfully' };
  } catch (error) {
    console.error('Reset admin password error:', error);
    return { 
      success: false, 
      errors: ['An unexpected error occurred while resetting admin password'] 
    };
  }
}

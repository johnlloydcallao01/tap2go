/**
 * Authentication Service - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * This service is maintained for future use if authentication is needed.
 */

import { User } from '../types/user';
import { ServiceResult } from '../types/services';

// Placeholder interfaces for maintaining structure
export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'vendor' | 'driver';
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

class AuthService {
  /**
   * Placeholder method - authentication disabled
   */
  async registerUser(data: RegisterUserData): Promise<ServiceResult<{ userId: string; user: User }>> {
    console.warn('Authentication is disabled in the public web app');
    return {
      success: false,
      error: 'Authentication is disabled in the public web app'
    };
  }

  // All methods are placeholders - authentication disabled
  async loginUser(data: LoginUserData): Promise<ServiceResult<{ user: User; token: string }>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }

  async logoutUser(): Promise<ServiceResult<void>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: true };
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<ServiceResult<User>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }

  async getUserById(userId: string): Promise<ServiceResult<User>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }

  async deleteUser(userId: string): Promise<ServiceResult<void>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }

  async sendPasswordResetEmail(email: string): Promise<ServiceResult<void>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }

  async verifyEmail(userId: string): Promise<ServiceResult<void>> {
    console.warn('Authentication is disabled in the public web app');
    return { success: false, error: 'Authentication is disabled in the public web app' };
  }
}

// Export singleton instance
export const authService = new AuthService();

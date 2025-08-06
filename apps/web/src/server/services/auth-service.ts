/**
 * Authentication Service
 * 
 * Service for handling user authentication, registration, and session management.
 */

import { getAuth } from 'firebase-admin/auth';
import { User } from '../types/user';
import { ServiceResult } from '../types/services';
import { validateRegistrationData, validateLoginData } from '../validators/auth-validators';

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
   * Register a new user
   */
  async registerUser(data: RegisterUserData): Promise<ServiceResult<{ userId: string; user: User }>> {
    try {
      // Validate input data
      const validation = validateRegistrationData(data);
      if (!validation.success) {
        return { success: false, error: validation.errors?.join(', ') };
      }

      const validatedData = validation.data!;

      // Check if user already exists
      try {
        await getAuth().getUserByEmail(validatedData.email);
        return { success: false, error: 'User with this email already exists' };
      } catch (error: any) {
        // User doesn't exist, which is what we want
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Create user in Firebase Auth
      const userRecord = await getAuth().createUser({
        email: validatedData.email,
        password: validatedData.password,
        displayName: validatedData.name,
        emailVerified: false,
        disabled: false
      });

      // Set custom claims for role
      await getAuth().setCustomUserClaims(userRecord.uid, {
        role: validatedData.role
      });

      // TODO: Create user record in your database
      // This would typically involve saving additional user data to Firestore/database

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.displayName!,
        role: validatedData.role,
        isActive: true,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        updatedAt: new Date(userRecord.metadata.creationTime)
      };

      return {
        success: true,
        data: {
          userId: userRecord.uid,
          user
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(data: LoginUserData): Promise<ServiceResult<{ user: User; token: string }>> {
    try {
      // Validate input data
      const validation = validateLoginData(data);
      if (!validation.success) {
        return { success: false, error: validation.errors?.join(', ') };
      }

      const validatedData = validation.data!;

      // Get user by email
      const userRecord = await getAuth().getUserByEmail(validatedData.email);

      // Check if user is disabled
      if (userRecord.disabled) {
        return { success: false, error: 'Account is disabled' };
      }

      // Create custom token for the user
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      // TODO: Verify password (Firebase Admin SDK doesn't have password verification)
      // In a real implementation, you might use Firebase Client SDK or implement your own password verification

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.displayName || userRecord.email!,
        role: (userRecord.customClaims?.role as 'customer' | 'vendor' | 'driver' | 'admin') || 'customer',
        phone: userRecord.phoneNumber || undefined,
        profileImage: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        updatedAt: new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime)
      };

      return {
        success: true,
        data: {
          user,
          token: customToken
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'Invalid email or password' };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Logout user
   */
  async logoutUser(): Promise<ServiceResult<void>> {
    try {
      // TODO: Implement logout logic
      // This might involve invalidating session tokens, clearing cookies, etc.
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<ServiceResult<User>> {
    try {
      // Update user in Firebase Auth
      const updateData: any = {};
      
      if (data.name) {
        updateData.displayName = data.name;
      }
      
      if (data.phone) {
        updateData.phoneNumber = data.phone;
      }

      const userRecord = await getAuth().updateUser(userId, updateData);

      // TODO: Update user record in your database
      // This would typically involve updating additional user data in Firestore/database

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.displayName || userRecord.email!,
        role: (userRecord.customClaims?.role as 'customer' | 'vendor' | 'driver' | 'admin') || 'customer',
        phone: userRecord.phoneNumber || undefined,
        profileImage: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ServiceResult<User>> {
    try {
      const userRecord = await getAuth().getUser(userId);

      const user: User = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.displayName || userRecord.email!,
        role: (userRecord.customClaims?.role as 'customer' | 'vendor' | 'driver' | 'admin') || 'customer',
        phone: userRecord.phoneNumber || undefined,
        profileImage: userRecord.photoURL || undefined,
        isActive: !userRecord.disabled,
        isVerified: userRecord.emailVerified,
        createdAt: new Date(userRecord.metadata.creationTime),
        updatedAt: new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime)
      };

      return {
        success: true,
        data: user
      };
    } catch (error: any) {
      console.error('Get user error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'User not found' };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<ServiceResult<void>> {
    try {
      // Delete user from Firebase Auth
      await getAuth().deleteUser(userId);

      // TODO: Delete user data from your database
      // This would typically involve deleting user records from Firestore/database

      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<ServiceResult<void>> {
    try {
      // Generate password reset link
      const link = await getAuth().generatePasswordResetLink(email);

      // TODO: Send email using your email service
      // For now, just log the link
      console.log('Password reset link:', link);

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'No user found with this email address' };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(userId: string): Promise<ServiceResult<void>> {
    try {
      await getAuth().updateUser(userId, {
        emailVerified: true
      });

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify email'
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

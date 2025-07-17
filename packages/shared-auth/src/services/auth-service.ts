/**
 * Core Firebase Authentication Service
 * Centralized authentication logic for all apps in the monorepo
 */

import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  Auth,
} from 'firebase/auth';
import { getFirebaseAuth } from 'firebase-config';
import { User } from 'shared-types';
import { AuthServiceConfig, AuthError, AuthErrorCode } from '../types/auth';

/**
 * Core Authentication Service Class
 * Provides centralized Firebase authentication operations
 */
export class AuthService {
  private auth: Auth | null = null;
  private config: AuthServiceConfig;

  constructor(config: AuthServiceConfig) {
    this.config = config;
    // Auth will be initialized lazily when needed
  }

  /**
   * Get Firebase Auth instance (lazy initialization)
   */
  private getAuth(): Auth {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('Authentication operations can only be performed on the client side');
    }

    if (!this.auth) {
      try {
        this.auth = getFirebaseAuth();
      } catch (error) {
        console.error('Failed to get Firebase auth:', error);
        throw new Error('Firebase authentication is not available. Please try again.');
      }
    }
    return this.auth!;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const result = await signInWithEmailAndPassword(this.getAuth(), email, password);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create new user with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
    try {
      const result = await createUserWithEmailAndPassword(this.getAuth(), email, password);
      
      // Update Firebase Auth profile if displayName provided
      if (displayName) {
        await updateFirebaseProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google (if enabled)
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    if (!this.config.enableGoogleAuth) {
      throw new Error('Google authentication is not enabled for this app');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.getAuth(), provider);
      return result.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.getAuth());
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user's ID token
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.getAuth().currentUser;
    if (!user) return null;

    try {
      return await getIdToken(user, forceRefresh);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update Firebase user profile
   */
  async updateProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    const user = this.getAuth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      await updateFirebaseProfile(user, updates);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.getAuth(), callback);
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.getAuth().currentUser;
  }

  /**
   * Handle and normalize Firebase auth errors
   */
  private handleAuthError(error: any): AuthError {
    const firebaseError = error as { code?: string; message?: string };
    
    let code: AuthErrorCode;
    let message: string;

    switch (firebaseError.code) {
      case 'auth/user-not-found':
        code = 'auth/user-not-found';
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        code = 'auth/wrong-password';
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        code = 'auth/email-already-in-use';
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        code = 'auth/weak-password';
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        code = 'auth/invalid-email';
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        code = 'auth/user-disabled';
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/too-many-requests':
        code = 'auth/too-many-requests';
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        code = 'auth/network-request-failed';
        message = 'Network error. Please check your connection and try again.';
        break;
      case 'auth/invalid-credential':
        code = 'auth/invalid-credential';
        message = 'Invalid credentials. Please check your email and password.';
        break;
      default:
        code = 'auth/network-request-failed';
        message = firebaseError.message || 'An unexpected error occurred. Please try again.';
    }

    return {
      code,
      message,
      originalError: error instanceof Error ? error : new Error(String(error))
    };
  }

  /**
   * Validate user role matches expected role
   */
  validateUserRole(user: any, expectedRole: User['role']): boolean {
    return user?.role === expectedRole;
  }

  /**
   * Create custom auth error
   */
  createCustomError(code: AuthErrorCode, message: string): AuthError {
    return {
      code,
      message,
      originalError: new Error(message)
    };
  }
}

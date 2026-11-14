/**
 * @file packages/client-services/src/services/auth-service.ts
 * @description Shared Authentication Service
 */

import type {
  AuthResponse,
  LoginCredentials,
  PayloadAuthResponse,
  User,
} from '../types/auth';

export class AuthService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  private static readonly COLLECTION_SLUG = 'users';

  private static get headers() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Parse a JSON response safely. Proxies / CDNs (e.g. Cloudflare) can return
   * plain-text or HTML error pages (e.g. "error code: 1033") with a non-2xx
   * status — surface those as readable errors instead of a cryptic JSON parse failure.
   */
  private static async parseResponseData(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) {
      throw new Error(`Server returned an empty response (HTTP ${response.status}). The API may be down.`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server returned a non-JSON response (HTTP ${response.status}): ${text.slice(0, 120)}`);
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const url = `${this.API_BASE}/${this.COLLECTION_SLUG}/login`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(credentials),
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      throw new Error(data.message || data.errors?.[0]?.message || 'Login failed');
    }

    // Role check
    if (data.user?.role !== 'customer') {
      throw new Error('Access denied. Only customers can access this application.');
    }

    return data as AuthResponse;
  }

  /**
   * Get current user (me)
   */
  static async me(token: string): Promise<User> {
    const url = `${this.API_BASE}/${this.COLLECTION_SLUG}/me`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.headers,
        'Authorization': `JWT ${token}`,
      },
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    if (!data.user) {
      throw new Error('User not found');
    }

    return data.user as User;
  }

  /**
   * Logout user
   */
  static async logout(token?: string): Promise<void> {
    const url = `${this.API_BASE}/${this.COLLECTION_SLUG}/logout`;
    
    const headers: Record<string, string> = { ...this.headers };
    if (token) {
      headers['Authorization'] = `JWT ${token}`;
    }

    await fetch(url, {
      method: 'POST',
      headers,
    });
  }

  /**
   * Refresh token
   */
  static async refreshToken(token: string): Promise<AuthResponse> {
    const url = `${this.API_BASE}/${this.COLLECTION_SLUG}/refresh-token`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Authorization': `JWT ${token}`,
      },
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    return data as AuthResponse;
  }

  /**
   * Register user
   */
  static async register(data: any): Promise<AuthResponse> {
    const url = `${this.API_BASE}/${this.COLLECTION_SLUG}`; // POST /api/users
    
    // Ensure role is customer
    const payload = {
      ...data,
      role: 'customer',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    const responseData = await this.parseResponseData(response);

    if (!response.ok) {
      throw new Error(responseData.message || responseData.errors?.[0]?.message || 'Registration failed');
    }

    return responseData as AuthResponse;
  }

  /**
   * Forgot Password
   */
  static async forgotPassword(email: string, app?: 'customer'): Promise<void> {
    const url = `${this.API_BASE}/forgot-password`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, ...(app ? { app } : {}) }),
    });

    if (!response.ok) {
      const data = await this.parseResponseData(response);
      throw new Error(
        data.message ||
          data.error ||
          data.errors?.[0]?.message ||
          `Password reset request failed (HTTP ${response.status})`
      );
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/reset-password`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const data = await this.parseResponseData(response);
      throw new Error(
        data.message ||
          data.error ||
          data.errors?.[0]?.message ||
          `Password reset failed (HTTP ${response.status})`
      );
    }
  }
}

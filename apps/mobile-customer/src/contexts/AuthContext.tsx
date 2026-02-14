/**
 * @file apps/mobile-customer/src/contexts/AuthContext.tsx
 * @description Authentication Context Provider for Mobile
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AuthState,
  AuthContextType,
  LoginCredentials,
  AuthService,
} from '@encreasl/client-services';

// ========================================
// AUTHENTICATION REDUCER
// ========================================

type AuthAction =
  | { type: 'AUTH_INIT_SUCCESS'; payload: { user: User | null } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_ERROR'; payload: { error: string } }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SESSION_EXPIRED' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading initially
  isInitialized: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.user !== null,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SESSION_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): React.ReactNode => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ========================================
  // INITIALIZATION
  // ========================================

  const initializeAuth = useCallback(async () => {
    try {
      // Check for stored token
      const token = await AsyncStorage.getItem('grandline_auth_token');
      const storedUser = await AsyncStorage.getItem('grandline_auth_user');

      if (token && storedUser) {
        try {
          // Verify token validity by fetching me? 
          // For faster startup, we can trust stored user first, then verify in background.
          // Or just check if token exists.
          const user = JSON.parse(storedUser);
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user } });
          
          // Optional: Verify token in background
          // try {
          //   const freshUser = await AuthService.me(token);
          //   dispatch({ type: 'REFRESH_SUCCESS', payload: { user: freshUser } });
          //   await AsyncStorage.setItem('grandline_auth_user', JSON.stringify(freshUser));
          // } catch (e) {
          //   // Token invalid?
          //   // For now, let's just keep the stored user unless it fails hard later
          // }
        } catch {
          // Invalid JSON
          await AsyncStorage.multiRemove(['grandline_auth_token', 'grandline_auth_user']);
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
        }
      } else {
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      }
    } catch (error) {
      console.error('Auth initialization failed', error);
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log('[AuthContext] Login started');
    dispatch({ type: 'LOGIN_START' });

    try {
      console.log('[AuthContext] Calling AuthService.login...');
      const response = await AuthService.login(credentials);
      console.log('[AuthContext] AuthService.login success', { hasToken: !!response.token, hasUser: !!response.user });
      
      if (response.token) {
        console.log('[AuthContext] Saving token...');
        await AsyncStorage.setItem('grandline_auth_token', response.token);
      }
      if (response.user) {
        console.log('[AuthContext] Saving user...');
        await AsyncStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
      }
      
      console.log('[AuthContext] Dispatching LOGIN_SUCCESS');
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.user } });
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('grandline_auth_token');
      if (token) {
        await AuthService.logout(token);
      }
    } catch {
      // Ignore logout errors
    } finally {
      await AsyncStorage.multiRemove(['grandline_auth_token', 'grandline_auth_user', 'current-customer-id']);
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    // Implementation for refresh token if needed
    // For now, we rely on the token validity
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const token = await AsyncStorage.getItem('grandline_auth_token');
    return !!token;
  }, []);

  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('grandline_auth_token').then(setToken);
  }, [state.isAuthenticated]); // Update token when auth state changes

  const contextValue: AuthContextType & { token: string | null } = {
    ...state,
    token, // Expose token
    login,
    logout,
    refreshSession,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

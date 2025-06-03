/**
 * Auth Slice - Integrates with existing Firebase Auth Context
 * Maintains compatibility with your enterprise-grade auth system
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { serializeUser } from '../utils/serialization';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  // Multi-tab sync state
  lastSyncTimestamp: number;
  // Token management
  tokenRefreshInProgress: boolean;
  // Session management
  sessionExpiry: number | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  isInitialized: false,
  lastSyncTimestamp: 0,
  tokenRefreshInProgress: false,
  sessionExpiry: null,
};

// Async thunks for auth operations
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // This will be called by your existing AuthContext
      // Just return success - the actual auth logic stays in AuthContext
      return { initialized: true };
    } catch {
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // This will be handled by your existing AuthContext
      // Redux just tracks the state changes
      return { email };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({
    email,
    name,
    role
  }: {
    email: string;
    password: string;
    name: string;
    role: User['role'];
  }, { rejectWithValue }) => {
    try {
      // This will be handled by your existing AuthContext
      return { email, name, role };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign up failed');
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      // This will be handled by your existing AuthContext
      return {};
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign out failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      // This will be handled by your existing AuthContext
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Sync actions called by AuthContext
    setUser: (state, action: PayloadAction<User | null>) => {
      // Serialize user data to handle Firebase Timestamps
      state.user = action.payload ? serializeUser(action.payload) : null;
      state.isAuthenticated = !!action.payload;
      state.error = null;
      state.lastSyncTimestamp = Date.now();
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    
    // Multi-tab synchronization
    syncAuthState: (state, action: PayloadAction<{ user: User | null; timestamp: number }>) => {
      const { user, timestamp } = action.payload;
      // Only update if this is a newer change
      if (timestamp > state.lastSyncTimestamp) {
        // Serialize user data to handle Firebase Timestamps
        state.user = user ? serializeUser(user) : null;
        state.isAuthenticated = !!user;
        state.lastSyncTimestamp = timestamp;
      }
    },
    
    // Token management
    setTokenRefreshInProgress: (state, action: PayloadAction<boolean>) => {
      state.tokenRefreshInProgress = action.payload;
    },
    
    setSessionExpiry: (state, action: PayloadAction<number | null>) => {
      state.sessionExpiry = action.payload;
    },
    
    // Clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.sessionExpiry = null;
      state.lastSyncTimestamp = Date.now();
    },
    
    // Update user data without full re-auth
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        state.user = serializeUser(updatedUser);
        state.lastSyncTimestamp = Date.now();
      }
    },
  },
  
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Sign in
    builder
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state) => {
        state.loading = false;
        // User will be set by AuthContext via setUser action
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Sign up
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false;
        // User will be set by AuthContext via setUser action
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Sign out
    builder
      .addCase(signOutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.sessionExpiry = null;
        state.lastSyncTimestamp = Date.now();
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          const updatedUser = { ...state.user, ...action.payload };
          state.user = serializeUser(updatedUser);
          state.lastSyncTimestamp = Date.now();
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setUser,
  setLoading,
  setError,
  setInitialized,
  syncAuthState,
  setTokenRefreshInProgress,
  setSessionExpiry,
  clearAuth,
  updateUserData,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

export default authSlice;

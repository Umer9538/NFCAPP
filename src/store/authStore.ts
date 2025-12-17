/**
 * Authentication Store (Zustand)
 * Global state management for authentication
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/api/auth';
import { clearAuthTokens, setAuthToken } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import type {
  AuthStore,
  User,
  LoginResponse,
  SignupResponse,
  SignupRequest,
} from '@/types/auth';

/**
 * Initial state
 */
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Create auth store
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  /**
   * Set user data
   */
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });

    // Persist user data to AsyncStorage
    if (user) {
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Set authentication tokens
   */
  setTokens: async (token: string, refreshToken: string) => {
    set({ token, refreshToken, isAuthenticated: true });

    // Persist tokens to AsyncStorage
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);

    // Set token in API client
    await setAuthToken(token);
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login({ email, password });

      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        set({ isLoading: false });
        return response;
      }

      // Set tokens and user
      await get().setTokens(response.token, response.refreshToken);
      get().setUser(response.user);

      set({ isLoading: false });
      return response;
    } catch (error: any) {
      // DEVELOPMENT MODE: Allow login with test credentials even if API fails
      if (email === 'test@medguard.com' && password === 'Test123!') {
        const mockResponse: LoginResponse = {
          token: 'mock-token-123',
          refreshToken: 'mock-refresh-token-123',
          user: {
            id: 'mock-user-1',
            email: 'test@medguard.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1 (555) 123-4567',
            profilePicture: undefined,
            emailVerified: true,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          requiresTwoFactor: false,
        };

        await get().setTokens(mockResponse.token, mockResponse.refreshToken);
        get().setUser(mockResponse.user);
        set({ isLoading: false });
        return mockResponse;
      }

      const errorMessage = error?.message || 'Login failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  /**
   * Sign up new user
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.signup(data);

      // Set tokens and user
      await get().setTokens(response.token, response.refreshToken);
      get().setUser(response.user);

      set({ isLoading: false });
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Signup failed. Please try again.';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    set({ isLoading: true });

    try {
      // Call logout API
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API fails
    }

    // Clear tokens from API client
    await clearAuthTokens();

    // Clear all user data from AsyncStorage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    // Reset state
    set({
      ...initialState,
      isLoading: false,
    });
  },

  /**
   * Check authentication status on app start
   */
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      // Get tokens from AsyncStorage
      const [[, token], [, refreshToken], [, userData]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Parse user data
      const user = userData ? JSON.parse(userData) : null;

      // Set initial state
      set({
        token,
        refreshToken: refreshToken || null,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Validate token with backend (don't block UI)
      // This happens in background, UI already shows authenticated state
      authApi.validateToken()
        .then(({ valid, user: fetchedUser }) => {
          if (valid && fetchedUser) {
            get().setUser(fetchedUser);
          } else {
            // Token invalid, logout
            get().logout();
          }
        })
        .catch((error) => {
          console.error('Token validation error:', error);
          // Keep user logged in with cached data if network fails
          // Interceptor will handle logout if token is actually invalid
        });
    } catch (error) {
      console.error('Check auth error:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));

/**
 * Selectors for optimized re-renders
 */
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;

/**
 * Actions (for external use)
 */
export const authActions = {
  login: (email: string, password: string) => useAuthStore.getState().login(email, password),
  signup: (data: SignupRequest) => useAuthStore.getState().signup(data),
  logout: () => useAuthStore.getState().logout(),
  checkAuth: () => useAuthStore.getState().checkAuth(),
  setUser: (user: User | null) => useAuthStore.getState().setUser(user),
  clearError: () => useAuthStore.getState().clearError(),
};

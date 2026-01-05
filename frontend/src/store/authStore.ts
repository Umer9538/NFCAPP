/**
 * Authentication Store (Zustand)
 * Global state management for authentication with multi-tenant support
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/api/auth';
import { clearAuthTokens, setAuthToken } from '@/api/client';
import { STORAGE_KEYS } from '@/constants';
import type { AccountType } from '@/config/dashboardConfig';
import type {
  AuthStore,
  User,
  LoginResponse,
  SignupResponse,
  SignupRequest,
} from '@/types/auth';

/**
 * Secure storage keys for sensitive data
 */
const SECURE_KEYS = {
  ACCOUNT_TYPE: 'medguard_account_type',
  ORGANIZATION_ID: 'medguard_organization_id',
};

/**
 * Initial state
 */
const initialState = {
  user: null as User | null,
  token: null as string | null,
  refreshToken: null as string | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  accountType: null as AccountType | null,
  organizationId: null as string | null,
  isOrgAdmin: false,
  suspended: false,
};

/**
 * Helper function to safely store in SecureStore
 */
const secureStoreSet = async (key: string, value: string | null) => {
  try {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails (e.g., on some emulators)
    console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
    if (value) {
      await AsyncStorage.setItem(key, value);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

/**
 * Helper function to safely get from SecureStore
 */
const secureStoreGet = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails
    console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
    return await AsyncStorage.getItem(key);
  }
};

/**
 * Create auth store
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  /**
   * Set user data and extract account information
   */
  setUser: (user: User | null) => {
    if (user) {
      console.log('🔐 Setting user:', { email: user.email, accountType: user.accountType, role: user.role, organizationId: user.organizationId });
      const accountType = user.accountType || 'individual';
      const organizationId = user.organizationId || null;
      const isOrgAdmin = user.role === 'admin' && accountType !== 'individual';
      const suspended = user.suspended || false;

      set({
        user,
        isAuthenticated: true,
        accountType,
        organizationId,
        isOrgAdmin,
        suspended,
      });

      // Persist user data
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      // Persist account type in secure storage
      secureStoreSet(SECURE_KEYS.ACCOUNT_TYPE, accountType);
      if (organizationId) {
        secureStoreSet(SECURE_KEYS.ORGANIZATION_ID, organizationId);
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
        accountType: null,
        organizationId: null,
        isOrgAdmin: false,
        suspended: false,
      });

      // Clear persisted data
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      secureStoreSet(SECURE_KEYS.ACCOUNT_TYPE, null);
      secureStoreSet(SECURE_KEYS.ORGANIZATION_ID, null);
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
   * Check if user belongs to an organization (not individual)
   */
  isOrganizationUser: () => {
    const { accountType } = get();
    return accountType !== null && accountType !== 'individual';
  },

  /**
   * Check if user account is suspended
   */
  isSuspended: () => {
    const { suspended } = get();
    return suspended;
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
      console.log('🔐 Login failed, checking for test credentials...', { email });

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
            emailVerified: true,
            twoFactorEnabled: false,
            accountType: 'individual',
            organizationId: undefined,
            role: undefined,
            suspended: false,
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

      // Test corporate user (multiple email aliases)
      if ((email === 'admin@company.com' || email === 'corp.admin@test.com' || email === 'admin-corp@test.com') && password === 'Test123!') {
        const mockResponse: LoginResponse = {
          token: 'mock-corp-token-123',
          refreshToken: 'mock-corp-refresh-token-123',
          user: {
            id: 'mock-corp-admin-1',
            email: 'admin@company.com',
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '+1 (555) 987-6543',
            emailVerified: true,
            twoFactorEnabled: false,
            accountType: 'corporate',
            organizationId: 'org-123',
            role: 'admin',
            suspended: false,
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

      // Test construction user (multiple email aliases)
      if ((email === 'worker@construction.com' || email === 'construction-admin@test.com') && password === 'Test123!') {
        const isAdmin = email.includes('admin');
        const mockResponse: LoginResponse = {
          token: 'mock-construction-token-123',
          refreshToken: 'mock-construction-refresh-token-123',
          user: {
            id: 'mock-construction-user-1',
            email: email,
            firstName: isAdmin ? 'Construction' : 'Mike',
            lastName: isAdmin ? 'Admin' : 'Builder',
            phoneNumber: '+1 (555) 456-7890',
            emailVerified: true,
            twoFactorEnabled: false,
            accountType: 'construction',
            organizationId: 'construction-org-456',
            role: isAdmin ? 'admin' : 'user',
            suspended: false,
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

      // Test education user
      if (email === 'student@university.edu' && password === 'Test123!') {
        const mockResponse: LoginResponse = {
          token: 'mock-edu-token-123',
          refreshToken: 'mock-edu-refresh-token-123',
          user: {
            id: 'mock-edu-user-1',
            email: 'student@university.edu',
            firstName: 'Sarah',
            lastName: 'Student',
            phoneNumber: '+1 (555) 321-9876',
            emailVerified: true,
            twoFactorEnabled: false,
            accountType: 'education',
            organizationId: 'edu-org-789',
            role: 'user',
            suspended: false,
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

      // Extract error message properly
      let errorMessage = 'Login failed. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.log('🔐 Login error:', errorMessage);
      set({ isLoading: false, error: errorMessage });

      // Throw an error with the message so UI can catch it
      const loginError = new Error(errorMessage);
      throw loginError;
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
    console.log('🔐 Starting logout...');

    try {
      // Call logout API (don't wait for it, just fire and forget)
      authApi.logout().catch((error) => {
        console.error('Logout API error (ignored):', error);
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    try {
      // Clear tokens from API client
      await clearAuthTokens();

      // Clear all user data from AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ACCOUNT_TYPE,
        STORAGE_KEYS.ORGANIZATION_ID,
      ]);

      // Clear secure storage
      await secureStoreSet(SECURE_KEYS.ACCOUNT_TYPE, null);
      await secureStoreSet(SECURE_KEYS.ORGANIZATION_ID, null);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }

    // Reset state - this MUST happen to trigger navigation
    console.log('🔐 Resetting auth state...');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accountType: null,
      organizationId: null,
      isOrgAdmin: false,
      suspended: false,
    });
    console.log('🔐 Logout complete');
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
      const user: User | null = userData ? JSON.parse(userData) : null;

      // Get account type from secure storage
      const storedAccountType = await secureStoreGet(SECURE_KEYS.ACCOUNT_TYPE);
      const storedOrgId = await secureStoreGet(SECURE_KEYS.ORGANIZATION_ID);

      // Determine account info from user or stored values
      const accountType = (user?.accountType || storedAccountType || 'individual') as AccountType;
      const organizationId = user?.organizationId || storedOrgId || null;
      const isOrgAdmin = user?.role === 'admin' && accountType !== 'individual';
      const suspended = user?.suspended || false;

      // Set initial state
      set({
        token,
        refreshToken: refreshToken || null,
        user,
        isAuthenticated: true,
        isLoading: false,
        accountType,
        organizationId,
        isOrgAdmin,
        suspended,
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
export const selectAccountType = (state: AuthStore) => state.accountType;
export const selectOrganizationId = (state: AuthStore) => state.organizationId;
export const selectIsOrgAdmin = (state: AuthStore) => state.isOrgAdmin;
export const selectSuspended = (state: AuthStore) => state.suspended;
export const selectIsOrganizationUser = (state: AuthStore) =>
  state.accountType !== null && state.accountType !== 'individual';

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
  isOrganizationUser: () => useAuthStore.getState().isOrganizationUser(),
  isSuspended: () => useAuthStore.getState().isSuspended(),
};

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
 * Mock login credentials for development/testing
 * Returns LoginResponse if credentials match, null otherwise
 */
function getMockLoginResponse(email: string, password: string): LoginResponse | null {
  if (password !== 'Test123!') return null;

  const mockCredentials: Record<string, { user: User; token: string }> = {
    // Individual user
    'test@medguard.com': {
      token: 'mock-token-individual',
      user: {
        id: 'mock-user-1',
        email: 'test@medguard.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1 (555) 123-4567',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'individual' as AccountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Corporate Admin
    'admin@company.com': {
      token: 'mock-token-corp-admin',
      user: {
        id: 'mock-corp-admin-1',
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'corporate' as AccountType,
        organizationId: 'mock-org-corp-1',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Corporate Employee
    'employee@company.com': {
      token: 'mock-token-corp-employee',
      user: {
        id: 'mock-corp-employee-1',
        email: 'employee@company.com',
        firstName: 'Jane',
        lastName: 'Employee',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'corporate' as AccountType,
        organizationId: 'mock-org-corp-1',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Construction Admin
    'admin@construction.com': {
      token: 'mock-token-const-admin',
      user: {
        id: 'mock-const-admin-1',
        email: 'admin@construction.com',
        firstName: 'Construction',
        lastName: 'Admin',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'construction' as AccountType,
        organizationId: 'mock-org-const-1',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Construction Supervisor
    'supervisor@construction.com': {
      token: 'mock-token-const-supervisor',
      user: {
        id: 'mock-const-supervisor-1',
        email: 'supervisor@construction.com',
        firstName: 'Bob',
        lastName: 'Supervisor',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'construction' as AccountType,
        organizationId: 'mock-org-const-1',
        role: 'supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Construction Worker
    'worker@construction.com': {
      token: 'mock-token-const-worker',
      user: {
        id: 'mock-const-worker-1',
        email: 'worker@construction.com',
        firstName: 'Mike',
        lastName: 'Builder',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'construction' as AccountType,
        organizationId: 'mock-org-const-1',
        role: 'worker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Education Admin
    'admin@school.edu': {
      token: 'mock-token-edu-admin',
      user: {
        id: 'mock-edu-admin-1',
        email: 'admin@school.edu',
        firstName: 'Principal',
        lastName: 'Smith',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'education' as AccountType,
        organizationId: 'mock-org-edu-1',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Education Teacher
    'teacher@school.edu': {
      token: 'mock-token-edu-teacher',
      user: {
        id: 'mock-edu-teacher-1',
        email: 'teacher@school.edu',
        firstName: 'Jane',
        lastName: 'Teacher',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'education' as AccountType,
        organizationId: 'mock-org-edu-1',
        role: 'teacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Education Parent
    'parent@family.com': {
      token: 'mock-token-edu-parent',
      user: {
        id: 'mock-edu-parent-1',
        email: 'parent@family.com',
        firstName: 'Mary',
        lastName: 'Parent',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'education' as AccountType,
        organizationId: 'mock-org-edu-1',
        role: 'parent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    // Education Student
    'student@school.edu': {
      token: 'mock-token-edu-student',
      user: {
        id: 'mock-edu-student-1',
        email: 'student@school.edu',
        firstName: 'Tommy',
        lastName: 'Student',
        emailVerified: true,
        twoFactorEnabled: false,
        accountType: 'education' as AccountType,
        organizationId: 'mock-org-edu-1',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };

  const credential = mockCredentials[email.toLowerCase()];
  if (!credential) return null;

  return {
    token: credential.token,
    refreshToken: `${credential.token}-refresh`,
    user: credential.user,
    requiresTwoFactor: false,
  };
}

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

    // DEVELOPMENT MODE: Check for mock credentials FIRST to avoid API timeout
    const mockResponse = getMockLoginResponse(email, password);
    if (mockResponse) {
      console.log('🔐 Using mock login for:', email);
      await get().setTokens(mockResponse.token, mockResponse.refreshToken);
      get().setUser(mockResponse.user);
      set({ isLoading: false });
      return mockResponse;
    }

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
      // Note: Mock credentials are checked BEFORE the API call (see above),
      // so this catch block only handles real API errors for non-mock users
      console.log('🔐 Login API failed:', { email });

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
      throw new Error(errorMessage);
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

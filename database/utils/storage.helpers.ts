// Storage helper utilities for mobile app
// These can be adapted for AsyncStorage (React Native) or other storage solutions

/**
 * Storage keys used in the app
 */
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@medid/auth_token',
  REFRESH_TOKEN: '@medid/refresh_token',
  USER_DATA: '@medid/user_data',
  SESSION_EXPIRY: '@medid/session_expiry',
  
  // User preferences
  THEME: '@medid/theme',
  LANGUAGE: '@medid/language',
  BIOMETRICS_ENABLED: '@medid/biometrics_enabled',
  NOTIFICATIONS_ENABLED: '@medid/notifications_enabled',
  
  // Cache
  DASHBOARD_STATS_CACHE: '@medid/dashboard_stats',
  MEDICAL_PROFILE_CACHE: '@medid/medical_profile',
  ACTIVITIES_CACHE: '@medid/activities',
  
  // App state
  ONBOARDING_COMPLETE: '@medid/onboarding_complete',
  LAST_SYNC: '@medid/last_sync',
  APP_VERSION: '@medid/app_version'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Storage interface (to be implemented with AsyncStorage or other)
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiRemove(keys: string[]): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Create a typed storage helper
 */
export function createStorageHelper(storage: StorageAdapter) {
  return {
    // String operations
    async getString(key: StorageKey): Promise<string | null> {
      return storage.getItem(key);
    },

    async setString(key: StorageKey, value: string): Promise<void> {
      return storage.setItem(key, value);
    },

    // JSON operations
    async getJSON<T>(key: StorageKey): Promise<T | null> {
      const value = await storage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },

    async setJSON<T>(key: StorageKey, value: T): Promise<void> {
      return storage.setItem(key, JSON.stringify(value));
    },

    // Boolean operations
    async getBoolean(key: StorageKey): Promise<boolean> {
      const value = await storage.getItem(key);
      return value === 'true';
    },

    async setBoolean(key: StorageKey, value: boolean): Promise<void> {
      return storage.setItem(key, value.toString());
    },

    // Remove operations
    async remove(key: StorageKey): Promise<void> {
      return storage.removeItem(key);
    },

    async removeMultiple(keys: StorageKey[]): Promise<void> {
      return storage.multiRemove(keys);
    },

    // Clear auth data
    async clearAuth(): Promise<void> {
      return storage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.SESSION_EXPIRY
      ]);
    },

    // Clear all cache
    async clearCache(): Promise<void> {
      return storage.multiRemove([
        STORAGE_KEYS.DASHBOARD_STATS_CACHE,
        STORAGE_KEYS.MEDICAL_PROFILE_CACHE,
        STORAGE_KEYS.ACTIVITIES_CACHE
      ]);
    },

    // Clear all data
    async clearAll(): Promise<void> {
      return storage.clear();
    }
  };
}

/**
 * User data structure stored in AsyncStorage
 */
export interface StoredUserData {
  id: string;
  fullName: string;
  email: string;
  username: string;
  accountType: string;
  organizationId?: string | null;
  role?: string | null;
  profileComplete: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  organization?: {
    id: string;
    name: string;
    type: string;
  } | null;
}


/**
 * Storage Utilities
 * AsyncStorage wrapper functions for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@medguard:auth_token',
  REFRESH_TOKEN: '@medguard:refresh_token',
  USER: '@medguard:user',
  BIOMETRIC_ENABLED: '@medguard:biometric_enabled',
  THEME: '@medguard:theme',
  LANGUAGE: '@medguard:language',
  ONBOARDING_COMPLETED: '@medguard:onboarding_completed',
  LAST_SYNC: '@medguard:last_sync',
} as const;

/**
 * Save auth token
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
}

/**
 * Get auth token
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Remove auth token
 */
export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing token:', error);
    throw error;
  }
}

/**
 * Save refresh token
 */
export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Remove refresh token
 */
export async function removeRefreshToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
}

/**
 * Save user data
 */
export async function saveUser(user: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

/**
 * Get user data
 */
export async function getUser(): Promise<any | null> {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Remove user data
 */
export async function removeUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
}

/**
 * Save biometric preference
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving biometric preference:', error);
    throw error;
  }
}

/**
 * Get biometric preference
 */
export async function getBiometricPreference(): Promise<boolean> {
  try {
    const preference = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return preference ? JSON.parse(preference) : false;
  } catch (error) {
    console.error('Error getting biometric preference:', error);
    return false;
  }
}

/**
 * Save theme preference
 */
export async function saveTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
    throw error;
  }
}

/**
 * Get theme preference
 */
export async function getTheme(): Promise<'light' | 'dark' | 'system'> {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark' | 'system') || 'system';
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'system';
  }
}

/**
 * Save language preference
 */
export async function saveLanguage(language: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error saving language:', error);
    throw error;
  }
}

/**
 * Get language preference
 */
export async function getLanguage(): Promise<string> {
  try {
    const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return language || 'en';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'en';
  }
}

/**
 * Mark onboarding as completed
 */
export async function setOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
    throw error;
  }
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
}

/**
 * Save last sync time
 */
export async function saveLastSync(timestamp: Date | string): Promise<void> {
  try {
    const isoString = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, isoString);
  } catch (error) {
    console.error('Error saving last sync:', error);
    throw error;
  }
}

/**
 * Get last sync time
 */
export async function getLastSync(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Error getting last sync:', error);
    return null;
  }
}

/**
 * Clear all app data
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

/**
 * Clear auth data only
 */
export async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
}

/**
 * Generic save function
 */
export async function saveData(key: string, value: any): Promise<void> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Generic get function
 */
export async function getData<T = any>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
}

/**
 * Generic remove function
 */
export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
}

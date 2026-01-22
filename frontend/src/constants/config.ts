/**
 * App Configuration
 * Central configuration for API endpoints, timeouts, and feature flags
 * Uses shared database module for types and endpoints
 */

import * as Application from 'expo-application';

// Re-export database module types and endpoints
export {
  ACTIVITY_ENDPOINTS, AUTH_ENDPOINTS, BRACELET_ENDPOINTS, buildUrl, DASHBOARD_ENDPOINTS, HEALTH_ENDPOINTS, HTTP_STATUS, ORGANIZATION_ENDPOINTS, PROFILE_ENDPOINTS, SETTINGS_ENDPOINTS,
  SUBSCRIPTION_ENDPOINTS
} from '@database/config/api.endpoints';

export { STORAGE_KEYS } from '@database/utils/storage.helpers';

export {
  ALLERGY_SEVERITIES, BLOOD_TYPES, MEDICATION_FREQUENCIES
} from '@database/types/medical.types';

export { SUBSCRIPTION_PLANS } from '@database/types/subscription.types';

/**
 * Get the correct API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Use environment variable if set (priority)
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    console.log('📡 Using API URL from env:', envUrl);
    return envUrl;
  }

  // Default: Use deployed Vercel backend (works for both dev and production)
  // This ensures the app always connects to the real backend with real data
  // Note: Do NOT include /api here - endpoints already have /api prefix
  const VERCEL_API_URL = 'https://nfc-medical-profile-platform.vercel.app';

  // Uncomment below to use local backend during development:
  // if (__DEV__) {
  //   const { manifest } = Constants;
  //   if (manifest && 'debuggerHost' in manifest) {
  //     const debuggerHost = manifest.debuggerHost;
  //     if (debuggerHost) {
  //       const host = debuggerHost.split(':')[0];
  //       return `http://${host}:3000`;
  //     }
  //   }
  //   if (Platform.OS === 'android') {
  //     return 'http://10.0.2.2:3000';
  //   }
  //   return 'http://localhost:3000';
  // }

  return VERCEL_API_URL;
}

// Environment variables
const ENV = {
  API_BASE_URL: getApiBaseUrl(),
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
  ENABLE_MOCK_DATA: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  VERSION: 'v1',

  // Legacy endpoints (for backward compatibility - use database module endpoints instead)
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/signup',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      SESSION: '/api/auth/session',
      VERIFY_EMAIL: '/api/auth/verify-email',
      RESEND_OTP: '/api/auth/resend-otp',
      ENABLE_2FA: '/api/auth/enable-2fa',
      VERIFY_2FA: '/api/auth/verify-2fa',
      DISABLE_2FA: '/api/auth/disable-2fa',
      PROFILE_SETUP: '/api/auth/profile-setup',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
      REFRESH: '/api/auth/refresh',
    },
    PROFILE: {
      GET: '/api/profile',
      UPDATE: '/api/profile',
    },
  },
} as const;

/**
 * App Information
 */
export const APP_INFO = {
  NAME: 'MedID',
  VERSION: Application.nativeApplicationVersion || '1.0.0',
  BUILD_NUMBER: Application.nativeBuildVersion || '1',
  BUNDLE_ID: Application.applicationId || 'com.medid.app',
  ENVIRONMENT: ENV.ENVIRONMENT,
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_BIOMETRIC: true,
  ENABLE_TWO_FACTOR: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: ENV.ENVIRONMENT === 'production',
  ENABLE_CRASH_REPORTING: ENV.ENVIRONMENT === 'production',
  ENABLE_MOCK_DATA: ENV.ENABLE_MOCK_DATA,
  ENABLE_DEV_TOOLS: ENV.ENVIRONMENT === 'development',
} as const;

/**
 * Timeouts and Intervals (in milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: ENV.API_TIMEOUT,
  TOAST_DURATION: 3000,
  DEBOUNCE: 500,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_INTERVAL: 5 * 60 * 1000, // 5 minutes
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PHONE_MIN_LENGTH: 10,
  EMAIL_MAX_LENGTH: 255,
} as const;

/**
 * NFC Configuration
 */
export const NFC_CONFIG = {
  SCAN_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  TAG_ID_FORMAT: /^NFC-[A-Z0-9]{5,10}$/i,
} as const;

/**
 * Activity Types
 */
export const ACTIVITY_TYPES = ['access', 'update', 'system', 'security', 'login', 'scan'] as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  PROFILE_ACCESS: 'profile_access',
  HEALTH_REMINDER: 'health_reminder',
  SUBSCRIPTION: 'subscription',
  SECURITY: 'security',
  MARKETING: 'marketing',
} as const;

/**
 * External Links
 */
export const EXTERNAL_LINKS = {
  PRIVACY_POLICY: 'https://medid.com/privacy',
  TERMS_OF_SERVICE: 'https://medid.com/terms',
  HELP_CENTER: 'https://help.medid.com',
  CONTACT_SUPPORT: 'mailto:support@medid.com',
  WEBSITE: 'https://medid.com',
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  LANGUAGE: 'en',
  THEME: 'system' as const,
  NOTIFICATIONS_ENABLED: true,
  BIOMETRIC_ENABLED: false,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  LOGOUT_SUCCESS: 'You have been logged out.',
} as const;

/**
 * Debug mode
 */
export const IS_DEV = __DEV__;
export const ENABLE_LOGGING = IS_DEV || FEATURE_FLAGS.ENABLE_DEV_TOOLS;

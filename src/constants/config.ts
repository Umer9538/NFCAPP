/**
 * App Configuration
 * Central configuration for API endpoints, timeouts, and feature flags
 */

import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

  // Development mode - auto-detect correct URL
  if (__DEV__) {
    const { manifest } = Constants;

    // For Expo Go on physical device
    if (manifest && 'debuggerHost' in manifest) {
      const debuggerHost = manifest.debuggerHost;
      if (debuggerHost) {
        const host = debuggerHost.split(':')[0];
        return `http://${host}:3001`;
      }
    }

    // For Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }

    // For iOS simulator and default
    return 'http://localhost:3001';
  }

  // Production mode - use environment variable or default
  return 'https://api.medguard.com';
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

  // API Endpoints (matching backend Prisma structure)
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
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

    // User Profile
    PROFILE: {
      GET: '/api/profile',
      UPDATE: '/api/profile',
      MEDICAL: '/api/profile/medical',
      PASSWORD: '/api/profile/password',
    },

    // User Settings
    USER: {
      CHANGE_PASSWORD: '/api/settings/password',
      DELETE: '/api/settings/delete-account',
    },

    // Emergency
    EMERGENCY: {
      PROFILE: '/emergency/:braceletId',
      ACCESS_LOG: '/emergency/:braceletId/access',
    },

    // Contacts
    CONTACTS: {
      LIST: '/emergency-contacts',
      GET: '/emergency-contacts/:id',
      CREATE: '/emergency-contacts',
      UPDATE: '/emergency-contacts/:id',
      DELETE: '/emergency-contacts/:id',
    },

    // Doctor
    DOCTOR: {
      GET: '/doctor-info',
      UPDATE: '/doctor-info',
    },

    // Dashboard
    DASHBOARD: {
      OVERVIEW: '/dashboard',
      STATS: '/dashboard/stats',
      REMINDERS: '/dashboard/reminders',
      ACTIVITIES: '/dashboard/activities',
    },

    // Activities
    ACTIVITIES: {
      LIST: '/activities',
      GET: '/activities/:id',
      EXPORT: '/activities/export',
    },

    // Settings
    SETTINGS: {
      NOTIFICATIONS: '/settings/notifications',
      SECURITY: '/settings/security',
      SESSIONS: '/settings/sessions',
      TWO_FACTOR: {
        ENABLE: '/settings/2fa/enable',
        VERIFY: '/settings/2fa/verify',
        DISABLE: '/settings/2fa/disable',
      },
      BIOMETRIC: {
        ENABLE: '/settings/biometric/enable',
        DISABLE: '/settings/biometric/disable',
      },
      EXPORT_DATA: '/settings/export-data',
      DELETE_ACCOUNT: '/settings/delete-account',
      CLEAR_CACHE: '/settings/clear-cache',
    },

    // App
    APP: {
      INFO: '/app/info',
      CHECK_UPDATE: '/app/check-update',
    },
  },
} as const;

/**
 * App Information
 */
export const APP_INFO = {
  NAME: 'MedGuard',
  VERSION: Application.nativeApplicationVersion || '1.0.0',
  BUILD_NUMBER: Application.nativeBuildVersion || '1',
  BUNDLE_ID: Application.applicationId || 'com.medguard.app',
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
 * Blood Types
 */
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

/**
 * Allergy Severity Levels
 */
export const ALLERGY_SEVERITY = ['mild', 'moderate', 'severe', 'life-threatening'] as const;

/**
 * Medical Condition Status
 */
export const CONDITION_STATUS = ['active', 'chronic', 'resolved'] as const;

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
  PRIVACY_POLICY: 'https://medguard.com/privacy',
  TERMS_OF_SERVICE: 'https://medguard.com/terms',
  HELP_CENTER: 'https://help.medguard.com',
  CONTACT_SUPPORT: 'mailto:support@medguard.com',
  WEBSITE: 'https://medguard.com',
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

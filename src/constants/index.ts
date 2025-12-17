/**
 * Constants Module - Central Export
 * Application-wide constants and configurations
 */

// Export all constants
export * from './colors';
export * from './styles';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
      DELETE: '/user/delete',
      CHANGE_PASSWORD: '/user/change-password',
    },
    EMERGENCY_PROFILE: {
      GET: '/emergency-profile',
      GET_BY_ID: '/emergency-profile/:id',
      CREATE: '/emergency-profile',
      UPDATE: '/emergency-profile/:id',
      DELETE: '/emergency-profile/:id',
    },
    MEDICAL: {
      CONDITIONS: '/medical/conditions',
      MEDICATIONS: '/medical/medications',
      ALLERGIES: '/medical/allergies',
    },
    CONTACTS: {
      LIST: '/emergency-contacts',
      CREATE: '/emergency-contacts',
      UPDATE: '/emergency-contacts/:id',
      DELETE: '/emergency-contacts/:id',
    },
    NFC: {
      REGISTER: '/nfc/register',
      SCAN: '/nfc/scan/:tagId',
      DEACTIVATE: '/nfc/deactivate/:tagId',
      LIST: '/nfc/tags',
    },
    QR: {
      GENERATE: '/qr/generate',
      SCAN: '/qr/scan/:code',
    },
  },
};

// Blood Types
export const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

// Allergy Severity Levels
export const ALLERGY_SEVERITY = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
] as const;

// Relationship Types
export const RELATIONSHIP_TYPES = [
  'Spouse',
  'Partner',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Doctor',
  'Caregiver',
  'Other',
] as const;

// Medical Condition Categories
export const MEDICAL_CONDITION_CATEGORIES = [
  'Cardiovascular',
  'Respiratory',
  'Neurological',
  'Endocrine',
  'Gastrointestinal',
  'Musculoskeletal',
  'Autoimmune',
  'Mental Health',
  'Cancer',
  'Other',
] as const;

// Medication Frequency Options
export const MEDICATION_FREQUENCY = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'As needed',
  'Weekly',
  'Monthly',
  'Other',
] as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'MedGuard',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@medguard.com',
  PRIVACY_POLICY_URL: 'https://medguard.com/privacy',
  TERMS_URL: 'https://medguard.com/terms',
};

// Storage Keys (for AsyncStorage)
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@medguard:auth_token',
  REFRESH_TOKEN: '@medguard:refresh_token',
  USER_DATA: '@medguard:user_data',
  THEME_PREFERENCE: '@medguard:theme',
  BIOMETRIC_ENABLED: '@medguard:biometric_enabled',
  LAST_SYNC: '@medguard:last_sync',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// Type exports
export type BloodType = (typeof BLOOD_TYPES)[number];
export type AllergySeverity = (typeof ALLERGY_SEVERITY)[number]['value'];
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];
export type MedicalConditionCategory = (typeof MEDICAL_CONDITION_CATEGORIES)[number];
export type MedicationFrequency = (typeof MEDICATION_FREQUENCY)[number];

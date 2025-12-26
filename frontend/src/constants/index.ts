/**
 * Constants Module - Central Export
 * Application-wide constants and configurations
 */

// Export all constants
export * from './colors';
export * from './styles';

// API Configuration - Re-export from config.ts for single source of truth
export { API_CONFIG } from './config';

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
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'every_4_hours', label: 'Every 4 hours' },
  { value: 'every_6_hours', label: 'Every 6 hours' },
  { value: 'every_8_hours', label: 'Every 8 hours' },
  { value: 'once_weekly', label: 'Once weekly' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'custom', label: 'Custom' },
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
  ACCOUNT_TYPE: '@medguard:account_type',
  ORGANIZATION_ID: '@medguard:organization_id',
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
export type MedicationFrequency = (typeof MEDICATION_FREQUENCY)[number]['value'];

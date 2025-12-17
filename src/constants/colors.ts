/**
 * MedGuard Color System
 * Matches the web app design tokens exactly
 */

// Primary Color Scale (Red) - Main brand color
export const PRIMARY = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // Base primary
  600: '#dc2626',  // Primary red
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const;

// Gray Scale - UI elements
export const GRAY = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

// Medical Category Colors
export const MEDICAL_COLORS = {
  // Blood Type / Critical
  red: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
    text: '#7f1d1d',
  },
  // Medication / Information
  blue: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
    text: '#1e40af',
  },
  // Allergies / Warning
  yellow: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
    text: '#92400e',
  },
  // Conditions / Emergency
  purple: {
    light: '#f3e8ff',
    main: '#a855f7',
    dark: '#9333ea',
    text: '#6b21a8',
  },
  // Contacts / Success
  green: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#16a34a',
    text: '#166534',
  },
} as const;

// Status Colors
export const STATUS = {
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#16a34a',
    text: '#166534',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
    text: '#92400e',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
    text: '#7f1d1d',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
    text: '#1e40af',
  },
} as const;

// Semantic Colors
export const SEMANTIC = {
  // Backgrounds
  background: {
    default: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  // Surfaces
  surface: {
    default: '#ffffff',
    elevated: '#ffffff',
    overlay: '#f9fafb',
  },
  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
    inverse: '#ffffff',
    link: '#2563eb',
  },
  // Borders
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6',
    medium: '#d1d5db',
    dark: '#9ca3af',
    focus: '#3b82f6',
    error: '#ef4444',
  },
  // Interactive
  interactive: {
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryActive: '#991b1b',
    secondary: '#f3f4f6',
    secondaryHover: '#e5e7eb',
    secondaryActive: '#d1d5db',
    disabled: '#f3f4f6',
    disabledText: '#d1d5db',
  },
} as const;

// Dark Mode Colors
export const DARK = {
  background: {
    default: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    elevated: '#1f2937',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  surface: {
    default: '#1f2937',
    elevated: '#374151',
    overlay: '#4b5563',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    disabled: '#6b7280',
    inverse: '#111827',
    link: '#60a5fa',
  },
  border: {
    default: '#374151',
    light: '#4b5563',
    medium: '#6b7280',
    dark: '#9ca3af',
    focus: '#60a5fa',
    error: '#ef4444',
  },
  interactive: {
    primary: '#ef4444',
    primaryHover: '#f87171',
    primaryActive: '#fca5a5',
    secondary: '#374151',
    secondaryHover: '#4b5563',
    secondaryActive: '#6b7280',
    disabled: '#374151',
    disabledText: '#6b7280',
  },
} as const;

// NFC Tag Status Colors
export const NFC_STATUS = {
  active: {
    background: '#dcfce7',
    text: '#166534',
    icon: '#22c55e',
  },
  inactive: {
    background: '#f3f4f6',
    text: '#6b7280',
    icon: '#9ca3af',
  },
  scanning: {
    background: '#dbeafe',
    text: '#1e40af',
    icon: '#3b82f6',
  },
  error: {
    background: '#fee2e2',
    text: '#7f1d1d',
    icon: '#ef4444',
  },
} as const;

// Emergency Alert Colors
export const EMERGENCY = {
  critical: {
    background: '#fee2e2',
    border: '#fca5a5',
    text: '#7f1d1d',
    icon: '#dc2626',
  },
  high: {
    background: '#fef3c7',
    border: '#fde68a',
    text: '#92400e',
    icon: '#f59e0b',
  },
  medium: {
    background: '#dbeafe',
    border: '#bfdbfe',
    text: '#1e40af',
    icon: '#3b82f6',
  },
  low: {
    background: '#f3f4f6',
    border: '#e5e7eb',
    text: '#4b5563',
    icon: '#6b7280',
  },
} as const;

// Gradient Colors
export const GRADIENTS = {
  primary: ['#dc2626', '#b91c1c'],
  secondary: ['#3b82f6', '#2563eb'],
  success: ['#22c55e', '#16a34a'],
  warning: ['#f59e0b', '#d97706'],
  dark: ['#1f2937', '#111827'],
} as const;

// Export default color scheme
export const COLORS = {
  primary: PRIMARY[600],
  primaryLight: PRIMARY[500],
  primaryDark: PRIMARY[700],

  secondary: GRAY[600],
  secondaryLight: GRAY[500],
  secondaryDark: GRAY[700],

  success: STATUS.success.main,
  warning: STATUS.warning.main,
  error: STATUS.error.main,
  info: STATUS.info.main,

  background: SEMANTIC.background.default,
  surface: SEMANTIC.surface.default,
  text: SEMANTIC.text.primary,
  textSecondary: SEMANTIC.text.secondary,
  border: SEMANTIC.border.default,

  // Quick access to medical colors
  bloodRed: MEDICAL_COLORS.red.main,
  medicationBlue: MEDICAL_COLORS.blue.main,
  allergyYellow: MEDICAL_COLORS.yellow.main,
  conditionPurple: MEDICAL_COLORS.purple.main,
  contactGreen: MEDICAL_COLORS.green.main,
} as const;

export type ColorScheme = 'light' | 'dark';
export type PrimaryColor = keyof typeof PRIMARY;
export type GrayColor = keyof typeof GRAY;
export type MedicalColorKey = keyof typeof MEDICAL_COLORS;
export type StatusColorKey = keyof typeof STATUS;

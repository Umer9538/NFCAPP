/**
 * Form Validation Schemas
 * Zod schemas for form validation
 */

import { z } from 'zod';
import { VALIDATION } from '@/constants';

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup Schema
 */
export const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(VALIDATION.NAME_MIN_LENGTH, `First name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `First name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(VALIDATION.NAME_MIN_LENGTH, `Last name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Last name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(
      VALIDATION.PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || VALIDATION.PHONE_REGEX.test(val),
      'Invalid phone number'
    ),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(
      VALIDATION.PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Email Verification Schema
 */
export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

/**
 * Password Strength Calculator
 */
export function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[@$!%*?&#]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'fair';
  } else if (score <= 6) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return { strength, score, feedback };
}

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
 * Password Requirement Interface
 */
export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

/**
 * Password Strength Result Interface
 */
export interface PasswordStrengthResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  percentage: number;
  requirements: PasswordRequirement[];
  feedback: string[];
}

/**
 * Password Strength Calculator
 * Returns real-time feedback with checklist of requirements
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  // Define requirements
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: '8+ characters',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: '1 uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: '1 lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: '1 number',
      met: /\d/.test(password),
    },
    {
      id: 'special',
      label: '1 special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  // Calculate score based on met requirements
  const metCount = requirements.filter(r => r.met).length;
  const score = metCount;
  const percentage = (metCount / requirements.length) * 100;

  // Bonus for extra length
  let bonusScore = 0;
  if (password.length >= 12) bonusScore += 1;
  if (password.length >= 16) bonusScore += 1;

  // Determine strength based on requirements met
  let strength: 'weak' | 'medium' | 'strong';
  if (metCount <= 2) {
    strength = 'weak';
  } else if (metCount <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Generate feedback for unmet requirements
  const feedback = requirements
    .filter(r => !r.met)
    .map(r => `Add ${r.label.toLowerCase()}`);

  return {
    strength,
    score: score + bonusScore,
    percentage,
    requirements,
    feedback
  };
}

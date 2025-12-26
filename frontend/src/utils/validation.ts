/**
 * Validation Utilities
 * Common validation functions and Zod schemas
 */

import { z } from 'zod';

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength check
 * Returns: weak, medium, strong
 */
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
    return { strength: 'weak', score: 0, feedback };
  }

  // Check for different character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Check length bonus
  if (password.length >= 12) score++;

  // Provide feedback
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  return { strength, score, feedback };
}

/**
 * Phone number validation (US format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10 or 11 digits for US)
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * NFC ID format validation
 * Expects format: NFC-XXXXX or similar
 */
export function isValidNFCId(nfcId: string): boolean {
  const nfcIdRegex = /^[A-Z]{3}-[A-Z0-9]{5,10}$/i;
  return nfcIdRegex.test(nfcId);
}

/**
 * Username validation
 */
export function isValidUsername(username: string): boolean {
  // Alphanumeric, underscores, hyphens, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Blood type validation
 */
export function isValidBloodType(bloodType: string): boolean {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType);
}

// Zod Schemas for Forms

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(isValidPhoneNumber, 'Invalid phone number format');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const nfcIdSchema = z
  .string()
  .min(1, 'NFC ID is required')
  .refine(isValidNFCId, 'Invalid NFC ID format (expected: NFC-XXXXX)');

export const bloodTypeSchema = z
  .string()
  .refine(isValidBloodType, 'Invalid blood type');

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  username: usernameSchema.optional().or(z.literal('')),
});

/**
 * Utilities
 * Export all utility functions for easy imports
 */

// Validation utilities
export * from './validation';

// Formatting utilities
export * from './formatting';

// Storage utilities
export * from './storage';

// Responsive utilities
export * from './responsive';

// Legacy utility functions (kept for backward compatibility)
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Formatting Utilities
 * Functions for formatting dates, times, phone numbers, etc.
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  parseISO,
} from 'date-fns';

/**
 * Format date in a readable format
 * @param date - Date string or Date object
 * @param formatString - Optional custom format (default: 'MMM d, yyyy')
 */
export function formatDate(
  date: string | Date | undefined | null,
  formatString: string = 'MMM d, yyyy'
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    return '';
  }
}

/**
 * Format date and time
 * @param date - Date string or Date object
 * @param formatString - Optional custom format (default: 'MMM d, yyyy h:mm a')
 */
export function formatDateTime(
  date: string | Date | undefined | null,
  formatString: string = 'MMM d, yyyy h:mm a'
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    return '';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @param addSuffix - Whether to add "ago" suffix (default: true)
 */
export function formatRelativeTime(
  date: string | Date | undefined | null,
  addSuffix: boolean = true
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix });
  } catch (error) {
    return '';
  }
}

/**
 * Format date with smart context
 * - Today: "Today at 3:30 PM"
 * - Yesterday: "Yesterday at 3:30 PM"
 * - This week: "Monday at 3:30 PM"
 * - This year: "Mar 15 at 3:30 PM"
 * - Other: "Mar 15, 2023"
 */
export function formatSmartDate(date: string | Date | undefined | null): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'h:mm a')}`;
    }

    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'h:mm a')}`;
    }

    if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE \'at\' h:mm a');
    }

    if (isThisYear(dateObj)) {
      return format(dateObj, 'MMM d \'at\' h:mm a');
    }

    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    return '';
  }
}

/**
 * Format blood type with proper styling
 * @param bloodType - Blood type string (e.g., "A+", "O-")
 */
export function formatBloodType(bloodType: string | undefined | null): string {
  if (!bloodType) return '';

  // Ensure proper format (uppercase with + or -)
  return bloodType.toUpperCase().replace(/POSITIVE/i, '+').replace(/NEGATIVE/i, '-');
}

/**
 * Format phone number to US format
 * @param phone - Phone number string
 * @param format - Format style: 'national' or 'international'
 */
export function formatPhoneNumber(
  phone: string | undefined | null,
  format: 'national' | 'international' = 'national'
): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different lengths
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    if (format === 'national') {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    // With country code
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return as-is if format doesn't match
  return phone;
}

/**
 * Format currency
 * @param amount - Amount in cents or dollars
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale (default: 'en-US')
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amount === undefined || amount === null) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format file size
 * @param bytes - Size in bytes
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format percentage
 * @param value - Value between 0 and 1 (or 0-100 if isPercentage is true)
 * @param decimals - Number of decimal places (default: 0)
 * @param isPercentage - Whether value is already a percentage (default: false)
 */
export function formatPercentage(
  value: number | undefined | null,
  decimals: number = 0,
  isPercentage: boolean = false
): string {
  if (value === undefined || value === null) return '';

  const percentage = isPercentage ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 */
export function truncate(text: string | undefined | null, maxLength: number = 50): string {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 */
export function capitalize(text: string | undefined | null): string {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Title case (capitalize each word)
 * @param text - Text to convert to title case
 */
export function titleCase(text: string | undefined | null): string {
  if (!text) return '';

  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Format initials from name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 */
export function formatInitials(name: string | undefined | null, maxInitials: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(' ');
  const initials = words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return initials;
}

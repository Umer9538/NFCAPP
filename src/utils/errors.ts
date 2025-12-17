/**
 * Error Handling Utilities
 * Parse and format error messages
 */

import { AxiosError } from 'axios';
import { ERROR_MESSAGES } from '@/constants/config';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  field?: string;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: any): string {
  // Handle null/undefined
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    return getAxiosErrorMessage(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle API error response
  if (error.message) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Check if error is an Axios error
 */
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

/**
 * Get error message from Axios error
 */
function getAxiosErrorMessage(error: AxiosError<any>): string {
  // No response (network error, timeout, etc.)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;

  // Extract message from response data
  const message = data?.message || data?.error || data?.detail;

  // Handle specific status codes
  switch (status) {
    case 400:
      return message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return message || ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 403:
      return message || ERROR_MESSAGES.UNAUTHORIZED;
    case 404:
      return message || 'Resource not found';
    case 409:
      return message || 'Conflict: Resource already exists';
    case 422:
      return message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 429:
      return message || 'Too many requests. Please try again later.';
    case 500:
      return message || ERROR_MESSAGES.SERVER_ERROR;
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. Please try again later.';
    default:
      return message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Parse validation errors from API response
 */
export function parseValidationErrors(error: any): Record<string, string> {
  if (!error.response || !error.response.data) {
    return {};
  }

  const { data } = error.response;

  // Handle different validation error formats
  if (data.errors && typeof data.errors === 'object') {
    const errors: Record<string, string> = {};

    Object.keys(data.errors).forEach((field) => {
      const fieldErrors = data.errors[field];
      if (Array.isArray(fieldErrors)) {
        errors[field] = fieldErrors[0];
      } else if (typeof fieldErrors === 'string') {
        errors[field] = fieldErrors;
      }
    });

    return errors;
  }

  // Handle single field error
  if (data.field && data.message) {
    return {
      [data.field]: data.message,
    };
  }

  return {};
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (isAxiosError(error)) {
    return !error.response || error.message === 'Network Error';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status === 400 || status === 422;
  }
  return false;
}

/**
 * Check if error is a server error
 */
export function isServerError(error: any): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status ? status >= 500 : false;
  }
  return false;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: any): {
  title: string;
  message: string;
  action?: string;
} {
  if (isNetworkError(error)) {
    return {
      title: 'No Internet Connection',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      action: 'Retry',
    };
  }

  if (isAuthError(error)) {
    return {
      title: 'Authentication Required',
      message: ERROR_MESSAGES.SESSION_EXPIRED,
      action: 'Login',
    };
  }

  if (isServerError(error)) {
    return {
      title: 'Server Error',
      message: ERROR_MESSAGES.SERVER_ERROR,
      action: 'Retry',
    };
  }

  return {
    title: 'Error',
    message: getErrorMessage(error),
    action: 'Dismiss',
  };
}

/**
 * Log error for debugging
 */
export function logError(error: any, context?: string) {
  if (__DEV__) {
    console.group(`Error ${context ? `in ${context}` : ''}`);
    console.error(error);
    if (isAxiosError(error)) {
      console.log('Response:', error.response?.data);
      console.log('Status:', error.response?.status);
      console.log('Headers:', error.response?.headers);
    }
    console.groupEnd();
  }

  // TODO: Send to error reporting service in production
  // if (!__DEV__) {
  //   Sentry.captureException(error, {
  //     tags: { context },
  //   });
  // }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on auth or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

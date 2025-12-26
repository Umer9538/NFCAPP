// Response helper utilities for mobile app

import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create an error response
 */
export function errorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(response: ApiResponse): response is ApiResponse & { success: false; error: string } {
  return response.success === false;
}

/**
 * Extract error message from response or error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.error === 'string') {
      return obj.error;
    }
    if (typeof obj.message === 'string') {
      return obj.message;
    }
  }
  return 'An unexpected error occurred';
}

/**
 * Format API error for display
 */
export function formatApiError(statusCode: number, defaultMessage?: string): string {
  const errorMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Please login to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'Unable to process the request.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Unable to reach the server.',
    503: 'Service temporarily unavailable.'
  };

  return errorMessages[statusCode] || defaultMessage || 'An error occurred';
}


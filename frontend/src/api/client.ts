/**
 * API Client Configuration
 * Axios instance with authentication and error handling
 * Supports cookie-based authentication for backend (Prisma + SQLite)
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { API_CONFIG, STORAGE_KEYS } from '@/constants';

/**
 * Create axios instance with base configuration
 * Note: baseURL is set dynamically in interceptor to ensure latest config is used
 */
const apiClient: AxiosInstance = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for session-based auth
});

/**
 * Request interceptor - Add JWT token and set baseURL dynamically
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Always use the latest BASE_URL from config
      config.baseURL = API_CONFIG.BASE_URL;

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log error in development
    if (__DEV__) {
      if (error.response) {
        console.error(
          `❌ API Error: ${originalRequest?.url}`,
          error.response.status,
          error.response.data
        );
      } else {
        console.error(
          `❌ Network Error: ${originalRequest?.url}`,
          error.message || 'No response from server'
        );
      }
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          // No refresh token, logout user
          await handleLogout();
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(handleError(error));
  }
);

/**
 * Handle logout - Clear storage and redirect
 */
async function handleLogout() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    // Optionally, you can emit an event or update global state here
    // to trigger navigation to login screen
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Enhanced error handler with user-friendly messages
 */
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  // Special fields for email verification flow
  requiresEmailVerification?: boolean;
  userId?: string;
}

/**
 * Convert technical error messages to human-readable format
 */
function humanizeErrorMessage(technicalMessage: string, context?: string): string {
  const lowerMessage = technicalMessage.toLowerCase();

  // Authentication errors
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('wrong password')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lowerMessage.includes('user not found') || lowerMessage.includes('no user')) {
    return 'No account found with this email address.';
  }
  if (lowerMessage.includes('email already') || lowerMessage.includes('already registered')) {
    return 'This email is already registered. Please try logging in instead.';
  }
  if (lowerMessage.includes('email not verified')) {
    return 'Please verify your email address before logging in.';
  }
  if (lowerMessage.includes('account suspended') || lowerMessage.includes('suspended')) {
    return 'Your account has been suspended. Please contact support.';
  }
  if (lowerMessage.includes('invalid token') || lowerMessage.includes('token expired')) {
    return 'Your session has expired. Please log in again.';
  }

  // Validation errors
  if (lowerMessage.includes('required') && lowerMessage.includes('field')) {
    return 'Please fill in all required fields.';
  }
  if (lowerMessage.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short'))) {
    return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
  }
  if (lowerMessage.includes('phone') && lowerMessage.includes('invalid')) {
    return 'Please enter a valid phone number.';
  }

  // Organization errors
  if (lowerMessage.includes('organization not found')) {
    return 'Organization not found. Please check your details.';
  }
  if (lowerMessage.includes('not part of an organization')) {
    return 'You are not associated with any organization.';
  }
  if (lowerMessage.includes('only admin') || lowerMessage.includes('administrator')) {
    return 'Only administrators can perform this action.';
  }

  // Profile errors
  if (lowerMessage.includes('profile not found')) {
    return 'Profile not found. Please complete your profile setup.';
  }
  if (lowerMessage.includes('profile incomplete')) {
    return 'Please complete your profile before continuing.';
  }

  // Medical data errors
  if (lowerMessage.includes('allergy') && lowerMessage.includes('already')) {
    return 'This allergy has already been added to your profile.';
  }
  if (lowerMessage.includes('medication') && lowerMessage.includes('already')) {
    return 'This medication has already been added to your profile.';
  }

  // Generic data errors
  if (lowerMessage.includes('already exists')) {
    return 'This item already exists. Please try a different one.';
  }
  if (lowerMessage.includes('not found')) {
    return 'The requested item was not found.';
  }
  if (lowerMessage.includes('validation failed') || lowerMessage.includes('invalid')) {
    return 'Please check your input and try again.';
  }

  // If no match, clean up the message
  // Remove technical prefixes and make it more readable
  let cleanMessage = technicalMessage
    .replace(/^(error:|exception:|failed:)\s*/i, '')
    .replace(/\[.*?\]/g, '') // Remove bracketed content like [object Object]
    .replace(/\{.*?\}/g, '') // Remove JSON-like content
    .trim();

  // Capitalize first letter
  if (cleanMessage.length > 0) {
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  }

  // Add period if missing
  if (cleanMessage && !cleanMessage.endsWith('.') && !cleanMessage.endsWith('!') && !cleanMessage.endsWith('?')) {
    cleanMessage += '.';
  }

  return cleanMessage || 'Something went wrong. Please try again.';
}

function handleError(error: AxiosError): ApiError {
  // Network error - no response received
  if (!error.response) {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'The request is taking too long. Please check your internet connection and try again.',
        code: 'TIMEOUT',
      };
    }

    // Handle cancelled requests
    if (axios.isCancel(error)) {
      return {
        message: 'Request was cancelled.',
        code: 'CANCELLED',
      };
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return {
        message: 'Unable to connect. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }

    // Generic connection error
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      code: 'CONNECTION_ERROR',
    };
  }

  const status = error.response.status;
  const data = error.response.data as any;

  // Extract error message from response
  const rawMessage = data?.message || data?.error || error.message || '';

  // Create standardized error object
  const apiError: ApiError = {
    message: humanizeErrorMessage(rawMessage),
    status,
    code: data?.code || `HTTP_${status}`,
    details: data?.details || data,
  };

  // Handle specific status codes with user-friendly messages
  switch (status) {
    case 400:
      // Use the humanized version of the actual error message
      apiError.message = humanizeErrorMessage(rawMessage) || 'Please check your input and try again.';
      break;
    case 401:
      apiError.message = 'Your session has expired. Please log in again.';
      break;
    case 403:
      // Check for email verification requirement
      if (data?.requiresEmailVerification) {
        apiError.message = 'Please verify your email address before logging in.';
        apiError.requiresEmailVerification = true;
        apiError.userId = data?.userId;
      } else if (data?.error?.toLowerCase().includes('suspended')) {
        apiError.message = 'Your account has been suspended. Please contact your administrator.';
      } else {
        apiError.message = humanizeErrorMessage(rawMessage) || 'You don\'t have permission to do this.';
      }
      break;
    case 404:
      apiError.message = humanizeErrorMessage(rawMessage) || 'The requested item was not found.';
      break;
    case 409:
      apiError.message = humanizeErrorMessage(rawMessage) || 'This item already exists.';
      break;
    case 422:
      apiError.message = humanizeErrorMessage(rawMessage) || 'Please check your input and try again.';
      break;
    case 429:
      apiError.message = 'You\'re doing that too often. Please wait a moment and try again.';
      break;
    case 500:
      apiError.message = 'Something went wrong on our end. Please try again in a moment.';
      break;
    case 502:
    case 503:
      apiError.message = 'The service is temporarily unavailable. Please try again in a moment.';
      break;
    case 504:
      apiError.message = 'The request is taking too long. Please try again.';
      break;
    default:
      if (status >= 500) {
        apiError.message = 'Something went wrong. Please try again later.';
      } else {
        apiError.message = humanizeErrorMessage(rawMessage) || 'Something went wrong. Please try again.';
      }
  }

  return apiError;
}

/**
 * Helper function to set auth token manually
 */
export async function setAuthToken(token: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

/**
 * Helper function to get auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Helper function to clear auth tokens
 */
export async function clearAuthTokens() {
  await handleLogout();
}

/**
 * Type-safe API client with common methods
 */
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
export type { ApiError };

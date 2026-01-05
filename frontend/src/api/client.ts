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
}

function handleError(error: AxiosError): ApiError {
  // Network error - no response received
  if (!error.response) {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout. The server is taking too long to respond.',
        code: 'TIMEOUT',
      };
    }

    // Handle cancelled requests
    if (axios.isCancel(error)) {
      return {
        message: 'Request cancelled',
        code: 'CANCELLED',
      };
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // Generic connection error
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'CONNECTION_ERROR',
    };
  }

  const status = error.response.status;
  const data = error.response.data as any;

  // Extract error message from response
  const errorMessage =
    data?.message || data?.error || error.message || 'An unexpected error occurred';

  // Create standardized error object
  const apiError: ApiError = {
    message: errorMessage,
    status,
    code: data?.code || `HTTP_${status}`,
    details: data?.details || data,
  };

  // Handle specific status codes with user-friendly messages
  switch (status) {
    case 400:
      apiError.message = data?.message || 'Invalid request. Please check your input.';
      break;
    case 401:
      apiError.message = 'Your session has expired. Please log in again.';
      break;
    case 403:
      apiError.message = 'Access denied. You do not have permission to perform this action.';
      break;
    case 404:
      apiError.message = 'The requested resource was not found.';
      break;
    case 409:
      apiError.message = data?.message || 'This resource already exists.';
      break;
    case 422:
      apiError.message = data?.message || 'Validation failed. Please check your input.';
      break;
    case 429:
      apiError.message = 'Too many requests. Please slow down and try again later.';
      break;
    case 500:
      apiError.message = 'Server error. Our team has been notified. Please try again later.';
      break;
    case 502:
      apiError.message = 'Bad gateway. The server is temporarily unavailable.';
      break;
    case 503:
      apiError.message = 'Service unavailable. We are performing maintenance. Please try again later.';
      break;
    case 504:
      apiError.message = 'Gateway timeout. The server is taking too long to respond.';
      break;
    default:
      if (status >= 500) {
        apiError.message = 'Server error. Please try again later.';
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

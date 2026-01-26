/**
 * API Module - Central Export
 * All API endpoints and utilities
 */

// Export API client
export { default as apiClient, api, setAuthToken, getAuthToken, clearAuthTokens } from './client';
export type { ApiError } from './client';

// Export all API modules
export * from './auth';
export * from './emergencyProfile';
export * from './nfc';
export * from './qr';
export * from './organizations';
export * from './location';
export { default as locationApi } from './location';

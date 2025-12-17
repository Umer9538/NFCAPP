/**
 * QR Code API
 * API calls for QR code generation and scanning
 */

import { api } from './client';
import { API_CONFIG } from '@/constants';

/**
 * Generate QR code for emergency profile
 */
export async function generateQRCode(profileId: string): Promise<{
  qrCode: string; // Base64 encoded image or URL
  code: string; // The code string
  expiresAt?: string;
}> {
  return api.post(API_CONFIG.ENDPOINTS.QR.GENERATE, { profileId });
}

/**
 * Scan QR code and get emergency profile
 */
export async function scanQRCode(code: string): Promise<{
  profile: any;
  valid: boolean;
}> {
  const endpoint = API_CONFIG.ENDPOINTS.QR.SCAN.replace(':code', code);
  return api.get(endpoint);
}

/**
 * Regenerate QR code (invalidate old one)
 */
export async function regenerateQRCode(profileId: string): Promise<{
  qrCode: string;
  code: string;
}> {
  return api.post('/qr/regenerate', { profileId });
}

/**
 * Get QR code for profile
 */
export async function getQRCode(profileId: string): Promise<{
  qrCode: string;
  code: string;
  createdAt: string;
}> {
  return api.get(`/qr/${profileId}`);
}

/**
 * Deactivate QR code
 */
export async function deactivateQRCode(code: string): Promise<{ message: string }> {
  return api.post('/qr/deactivate', { code });
}

export const qrApi = {
  generateQRCode,
  scanQRCode,
  regenerateQRCode,
  getQRCode,
  deactivateQRCode,
};

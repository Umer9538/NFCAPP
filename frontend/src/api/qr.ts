/**
 * QR Code API
 * API calls for QR code generation and scanning - Connected to real backend
 */

import { api } from './client';

/**
 * Generate QR code for emergency profile
 */
export async function generateQRCode(): Promise<{
  qrCode: string; // Base64 encoded image or URL
  code: string; // The code string
  expiresAt?: string;
}> {
  return api.post('/api/qr/generate');
}

/**
 * Scan QR code and get emergency profile
 */
export async function scanQRCode(code: string): Promise<{
  profile: any;
  valid: boolean;
}> {
  return api.get(`/api/qr/${code}`);
}

/**
 * Regenerate QR code (invalidate old one)
 */
export async function regenerateQRCode(): Promise<{
  qrCode: string;
  code: string;
}> {
  return api.post('/api/qr/regenerate');
}

/**
 * Get QR code for current user's profile
 */
export async function getQRCode(): Promise<{
  qrCode: string;
  code: string;
  createdAt: string;
}> {
  return api.get('/api/qr');
}

/**
 * Deactivate QR code
 */
export async function deactivateQRCode(code: string): Promise<{ message: string }> {
  return api.post('/api/qr/deactivate', { code });
}

export const qrApi = {
  generateQRCode,
  scanQRCode,
  regenerateQRCode,
  getQRCode,
  deactivateQRCode,
};

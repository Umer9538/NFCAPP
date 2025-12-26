/**
 * NFC API
 * API calls for NFC tag/bracelet management - Connected to real backend
 */

import { api } from './client';
import type { NFCTag, ScanLog } from '@/types';

/**
 * Register/Link NFC bracelet to user's profile
 */
export async function registerNFCTag(data: {
  nfcId: string;
  deviceInfo?: string;
}): Promise<NFCTag> {
  return api.post<NFCTag>('/api/bracelet/link', data);
}

/**
 * Scan NFC tag and get emergency profile
 */
export async function scanNFCTag(nfcId: string): Promise<{
  profile: any;
  tag: NFCTag;
  scanLog: ScanLog;
}> {
  return api.get(`/api/nfc/${nfcId}`);
}

/**
 * Unlink/Deactivate NFC bracelet
 */
export async function deactivateNFCTag(): Promise<{ message: string }> {
  return api.post('/api/bracelet/unlink');
}

/**
 * Get user's bracelet info
 */
export async function getNFCTags(): Promise<NFCTag[]> {
  const bracelet = await api.get<NFCTag | null>('/api/bracelet');
  return bracelet ? [bracelet] : [];
}

/**
 * Get bracelet details
 */
export async function getNFCTagDetails(): Promise<NFCTag | null> {
  return api.get<NFCTag | null>('/api/bracelet');
}

/**
 * Update bracelet status
 */
export async function updateNFCTag(
  data: { status?: 'active' | 'inactive' | 'lost' }
): Promise<NFCTag> {
  return api.patch<NFCTag>('/api/bracelet', data);
}

/**
 * Unlink bracelet
 */
export async function deleteNFCTag(): Promise<{ message: string }> {
  return api.post('/api/bracelet/unlink');
}

/**
 * Get access logs for bracelet
 */
export async function getScanLogs(): Promise<ScanLog[]> {
  return api.get<ScanLog[]>('/api/audit-logs');
}

/**
 * Get all access logs for user
 */
export async function getAllScanLogs(): Promise<ScanLog[]> {
  return api.get<ScanLog[]>('/api/activities');
}

export const nfcApi = {
  registerNFCTag,
  scanNFCTag,
  deactivateNFCTag,
  getNFCTags,
  getNFCTagDetails,
  updateNFCTag,
  deleteNFCTag,
  getScanLogs,
  getAllScanLogs,
};

/**
 * NFC API
 * API calls for NFC tag management
 */

import { api } from './client';
import { API_CONFIG } from '@/constants';
import type { NFCTag, ScanLog } from '@/types';

/**
 * Register NFC tag to user's profile
 */
export async function registerNFCTag(data: {
  tagId: string;
  profileId: string;
}): Promise<NFCTag> {
  return api.post<NFCTag>(API_CONFIG.ENDPOINTS.NFC.REGISTER, data);
}

/**
 * Scan NFC tag and get emergency profile
 */
export async function scanNFCTag(tagId: string): Promise<{
  profile: any;
  tag: NFCTag;
  scanLog: ScanLog;
}> {
  const endpoint = API_CONFIG.ENDPOINTS.NFC.SCAN.replace(':tagId', tagId);
  return api.get(endpoint);
}

/**
 * Deactivate NFC tag
 */
export async function deactivateNFCTag(tagId: string): Promise<{ message: string }> {
  const endpoint = API_CONFIG.ENDPOINTS.NFC.DEACTIVATE.replace(':tagId', tagId);
  return api.post(endpoint);
}

/**
 * Get user's NFC tags
 */
export async function getNFCTags(): Promise<NFCTag[]> {
  return api.get<NFCTag[]>(API_CONFIG.ENDPOINTS.NFC.LIST);
}

/**
 * Get NFC tag details
 */
export async function getNFCTagDetails(tagId: string): Promise<NFCTag> {
  return api.get<NFCTag>(`${API_CONFIG.ENDPOINTS.NFC.LIST}/${tagId}`);
}

/**
 * Update NFC tag
 */
export async function updateNFCTag(
  tagId: string,
  data: { isActive?: boolean; profileId?: string }
): Promise<NFCTag> {
  return api.patch<NFCTag>(`${API_CONFIG.ENDPOINTS.NFC.LIST}/${tagId}`, data);
}

/**
 * Delete NFC tag
 */
export async function deleteNFCTag(tagId: string): Promise<{ message: string }> {
  return api.delete(`${API_CONFIG.ENDPOINTS.NFC.LIST}/${tagId}`);
}

/**
 * Get scan logs for a tag
 */
export async function getScanLogs(tagId: string): Promise<ScanLog[]> {
  return api.get<ScanLog[]>(`${API_CONFIG.ENDPOINTS.NFC.LIST}/${tagId}/scans`);
}

/**
 * Get all scan logs for user
 */
export async function getAllScanLogs(): Promise<ScanLog[]> {
  return api.get<ScanLog[]>('/nfc/scans');
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

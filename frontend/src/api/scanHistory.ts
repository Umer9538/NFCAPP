/**
 * Scan History API
 * API endpoints for NFC bracelet and QR code scan history
 */

import { api } from './client';

export interface ScanRecord {
  id: string;
  type: 'nfc' | 'qr';
  timestamp: string;
  location?: {
    city?: string;
    country?: string;
  } | null;
  device?: string;
  accessedBy?: string;
  ipAddress?: string | null;
  action?: string;
}

export interface ScanStats {
  totalScans: number;
  nfcScans: number;
  qrScans: number;
  thisMonth: number;
}

export interface ScanHistoryResponse {
  success: boolean;
  scans: ScanRecord[];
  stats: ScanStats;
}

/**
 * Get scan history
 * GET /api/scan-history
 */
export async function getScanHistory(
  limit: number = 50,
  type?: 'nfc' | 'qr' | 'all'
): Promise<ScanHistoryResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (type && type !== 'all') {
      params.append('type', type);
    }

    const response = await api.get<ScanHistoryResponse>(
      `/api/scan-history?${params.toString()}`
    );

    return response;
  } catch (error: any) {
    console.error('[Scan History API] Error getting scan history:', error);

    // Return empty response on error
    return {
      success: false,
      scans: [],
      stats: {
        totalScans: 0,
        nfcScans: 0,
        qrScans: 0,
        thisMonth: 0,
      },
    };
  }
}

export const scanHistoryApi = {
  getScanHistory,
};

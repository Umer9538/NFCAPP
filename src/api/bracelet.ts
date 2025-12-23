/**
 * Bracelet API
 * API endpoints for NFC bracelet management - Using Backend API
 * Matches website implementation
 */

import { api } from './client';
import type {
  BraceletInfo,
  LinkBraceletRequest,
  BraceletAccessLog,
  QRCodeData,
} from '@/types/bracelet';

/**
 * Backend API Response Types
 */
interface BraceletResponse {
  id: string;
  userId: string;
  nfcId: string;
  status: 'active' | 'inactive' | 'lost';
  linkedDate: string;
  lastAccessed: string | null;
  accessCount: number;
  qrCodeUrl?: string;
  emergencyUrl?: string;
  deviceInfo?: {
    model?: string;
    os?: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface LinkBraceletResponse {
  success: boolean;
  message: string;
  bracelet: BraceletResponse;
}

interface UnlinkBraceletResponse {
  success: boolean;
  message: string;
}

interface UpdateStatusResponse {
  success: boolean;
  message: string;
  bracelet: BraceletResponse;
}

interface QRCodeResponse {
  qrCode: string;
  qrCodeDataUrl: string;
  profileUrl: string;
  emergencyId: string;
  expiresAt?: string;
}

interface AccessLogsResponse {
  logs: BraceletAccessLog[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get bracelet status and information
 * GET /api/bracelet
 */
export async function getBraceletStatus(): Promise<BraceletInfo | null> {
  try {
    const response = await api.get<any>('/api/bracelet');
    console.log('[Bracelet API] Response:', JSON.stringify(response, null, 2));

    if (!response) {
      return null;
    }

    // Handle different response formats
    // Backend might return { bracelet: {...} } or direct object
    const bracelet = response.bracelet || response;

    if (!bracelet || !bracelet.id) {
      console.log('[Bracelet API] No bracelet data found');
      return null;
    }

    return {
      id: bracelet.id,
      userId: bracelet.userId,
      nfcId: bracelet.nfcId || bracelet.nfc_id || bracelet.tagId,
      status: bracelet.status || 'active',
      linkedDate: bracelet.linkedDate || bracelet.linked_date || bracelet.createdAt,
      lastAccessed: bracelet.lastAccessed || bracelet.last_accessed || undefined,
      accessCount: bracelet.accessCount || bracelet.access_count || 0,
      qrCodeUrl: bracelet.qrCodeUrl || bracelet.qr_code_url,
      emergencyUrl: bracelet.emergencyUrl || bracelet.emergency_url,
      deviceInfo: bracelet.deviceInfo || bracelet.device_info,
      createdAt: bracelet.createdAt || bracelet.created_at,
      updatedAt: bracelet.updatedAt || bracelet.updated_at,
    };
  } catch (error: any) {
    console.error('[Bracelet API] Error getting bracelet status:', error);
    console.error('[Bracelet API] Error details:', error.response?.data || error.message);

    // If 404, no bracelet linked
    if (error.response?.status === 404 || error.code === 'HTTP_404') {
      return null;
    }

    throw error;
  }
}

/**
 * Link NFC bracelet to user profile
 * POST /api/bracelet/link
 */
export async function linkBracelet(data: LinkBraceletRequest): Promise<BraceletInfo> {
  try {
    const response = await api.post<LinkBraceletResponse>('/api/bracelet/link', {
      nfcId: data.nfcId,
      deviceInfo: data.deviceInfo,
    });

    const bracelet = response.bracelet;

    return {
      id: bracelet.id,
      userId: bracelet.userId,
      nfcId: bracelet.nfcId,
      status: bracelet.status,
      linkedDate: bracelet.linkedDate,
      lastAccessed: bracelet.lastAccessed || undefined,
      accessCount: bracelet.accessCount,
      qrCodeUrl: bracelet.qrCodeUrl,
      emergencyUrl: bracelet.emergencyUrl,
      deviceInfo: bracelet.deviceInfo,
      createdAt: bracelet.createdAt,
      updatedAt: bracelet.updatedAt,
    };
  } catch (error: any) {
    console.error('[Bracelet API] Error linking bracelet:', error);
    throw error;
  }
}

/**
 * Unlink bracelet from user profile
 * POST /api/bracelet/unlink
 */
export async function unlinkBracelet(): Promise<{ message: string }> {
  try {
    const response = await api.post<UnlinkBraceletResponse>('/api/bracelet/unlink');
    return { message: response.message || 'Bracelet unlinked successfully' };
  } catch (error: any) {
    console.error('[Bracelet API] Error unlinking bracelet:', error);
    throw error;
  }
}

/**
 * Update bracelet status (activate/deactivate/lost)
 * PATCH /api/bracelet/status
 */
export async function updateBraceletStatus(
  status: 'active' | 'inactive' | 'lost'
): Promise<BraceletInfo> {
  try {
    const response = await api.patch<UpdateStatusResponse>('/api/bracelet/status', {
      status,
    });

    const bracelet = response.bracelet;

    return {
      id: bracelet.id,
      userId: bracelet.userId,
      nfcId: bracelet.nfcId,
      status: bracelet.status,
      linkedDate: bracelet.linkedDate,
      lastAccessed: bracelet.lastAccessed || undefined,
      accessCount: bracelet.accessCount,
      qrCodeUrl: bracelet.qrCodeUrl,
      emergencyUrl: bracelet.emergencyUrl,
      deviceInfo: bracelet.deviceInfo,
      createdAt: bracelet.createdAt,
      updatedAt: bracelet.updatedAt,
    };
  } catch (error: any) {
    console.error('[Bracelet API] Error updating bracelet status:', error);
    throw error;
  }
}

/**
 * Replace bracelet with a new one
 * POST /api/bracelet/replace
 */
export async function replaceBracelet(newNfcId: string): Promise<BraceletInfo> {
  try {
    const response = await api.post<LinkBraceletResponse>('/api/bracelet/replace', {
      nfcId: newNfcId,
    });

    const bracelet = response.bracelet;

    return {
      id: bracelet.id,
      userId: bracelet.userId,
      nfcId: bracelet.nfcId,
      status: bracelet.status,
      linkedDate: bracelet.linkedDate,
      lastAccessed: bracelet.lastAccessed || undefined,
      accessCount: bracelet.accessCount,
      qrCodeUrl: bracelet.qrCodeUrl,
      emergencyUrl: bracelet.emergencyUrl,
      deviceInfo: bracelet.deviceInfo,
      createdAt: bracelet.createdAt,
      updatedAt: bracelet.updatedAt,
    };
  } catch (error: any) {
    console.error('[Bracelet API] Error replacing bracelet:', error);
    throw error;
  }
}

/**
 * Generate QR code for emergency profile
 * GET /api/bracelet/qr-code
 */
export async function generateQRCode(): Promise<QRCodeData> {
  try {
    const response = await api.get<QRCodeResponse>('/api/bracelet/qr-code');

    return {
      qrCode: response.qrCode,
      qrCodeDataUrl: response.qrCodeDataUrl,
      profileUrl: response.profileUrl,
      emergencyId: response.emergencyId,
      expiresAt: response.expiresAt,
    };
  } catch (error: any) {
    console.error('[Bracelet API] Error generating QR code:', error);
    throw error;
  }
}

/**
 * Get bracelet access logs
 * GET /api/bracelet/access-logs
 */
export async function getAccessLogs(
  page: number = 1,
  pageSize: number = 20
): Promise<BraceletAccessLog[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await api.get<AccessLogsResponse>(
      `/api/bracelet/access-logs?${params.toString()}`
    );

    return response.logs || [];
  } catch (error: any) {
    console.error('[Bracelet API] Error getting access logs:', error);

    // Return empty array if no logs found
    if (error.response?.status === 404) {
      return [];
    }

    throw error;
  }
}

/**
 * Test emergency profile link
 * GET /api/bracelet/test
 */
export async function testEmergencyProfile(): Promise<{ url: string; valid: boolean }> {
  try {
    const response = await api.get<{ url: string; valid: boolean }>('/api/bracelet/test');
    return response;
  } catch (error: any) {
    console.error('[Bracelet API] Error testing emergency profile:', error);
    return { url: '', valid: false };
  }
}

/**
 * Verify bracelet (test scan)
 * POST /api/bracelet/verify
 */
export async function verifyBracelet(nfcId: string): Promise<{
  verified: boolean;
  message: string;
  isCurrentBracelet: boolean;
}> {
  try {
    const response = await api.post<{
      verified: boolean;
      message: string;
      isCurrentBracelet: boolean;
    }>('/api/bracelet/verify', { nfcId });

    return response;
  } catch (error: any) {
    console.error('[Bracelet API] Error verifying bracelet:', error);
    return {
      verified: false,
      message: error.message || 'Verification failed',
      isCurrentBracelet: false,
    };
  }
}

export const braceletApi = {
  getBraceletStatus,
  linkBracelet,
  unlinkBracelet,
  updateBraceletStatus,
  replaceBracelet,
  generateQRCode,
  getAccessLogs,
  testEmergencyProfile,
  verifyBracelet,
};

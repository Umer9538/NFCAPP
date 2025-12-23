/**
 * Bracelet Types
 * TypeScript types for NFC bracelet management
 */

export type BraceletStatus = 'active' | 'inactive' | 'lost';

export interface BraceletInfo {
  id: string;
  nfcId: string;
  userId: string;
  status: BraceletStatus;
  linkedDate: string;
  lastAccessed?: string;
  accessCount: number;
  deviceInfo?: {
    model?: string;
    os?: string;
    location?: string;
  };
  qrCodeUrl?: string;
  emergencyUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkBraceletRequest {
  nfcId: string;
  deviceInfo?: {
    model?: string;
    os?: string;
    location?: string;
  };
}

export interface BraceletAccessLog {
  id: string;
  timestamp: string;
  location?: string;
  deviceInfo?: string;
  accessType: 'nfc' | 'qr' | 'web';
}

export interface QRCodeData {
  qrCode: string;
  qrCodeDataUrl: string;
  profileUrl: string;
  emergencyId: string;
  expiresAt?: string;
}

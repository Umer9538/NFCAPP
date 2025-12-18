// Core types for the MedGuard application
import type { AccountType } from '@/config/dashboardConfig';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountType: AccountType;
  organizationId?: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}

export interface EmergencyProfile {
  id: string;
  userId: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  emergencyContacts: EmergencyContact[];
  additionalNotes?: string;
  isActive: boolean;
  nfcTagId?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NFCTag {
  id: string;
  tagId: string;
  userId: string;
  profileId: string;
  isActive: boolean;
  createdAt: string;
  lastScannedAt?: string;
}

export interface ScanLog {
  id: string;
  tagId: string;
  scannedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

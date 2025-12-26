import { BraceletStatus } from './common.types';

export interface Bracelet {
  id: string;
  userId: string;
  nfcId: string;
  status: BraceletStatus;
  linkedDate: Date;
  lastAccessed?: Date | null;
  accessCount: number;
  deviceInfo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkBraceletInput {
  nfcId: string;
  deviceInfo?: string;
}

export interface BraceletAccessLog {
  braceletId: string;
  nfcId: string;
  accessedAt: Date;
  accessedBy?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  deviceInfo?: string;
}

export interface EmergencyProfileAccess {
  user: {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    height?: string;
    phoneNumber?: string;
  };
  medicalProfile: {
    bloodType: string;
    height: string;
    weight: string;
    allergies: Array<{
      name: string;
      severity: string;
      notes?: string;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      notes?: string;
    }>;
    medicalConditions: Array<{
      name: string;
      diagnosisDate?: string;
      notes?: string;
    }>;
    emergencyNotes?: string;
    isOrganDonor: boolean;
    hasDNR: boolean;
  };
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
    email?: string;
  }>;
  doctorInfo?: {
    doctorName: string;
    doctorPhone?: string;
    doctorEmail?: string;
    doctorSpecialty?: string;
    doctorAddress?: string;
  };
}


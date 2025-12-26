/**
 * Profile Types
 * TypeScript types for medical profile data
 */

import type { BloodType, AllergySeverity, MedicationFrequency } from '@/constants';

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // Can be preset value or custom text
  prescribedBy?: string;
  startDate?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string | null;
  isPrimary: boolean;
}

export interface MedicalProfile {
  id: string;
  userId: string;

  // Basic Information
  bloodType?: BloodType | string | null;
  height?: number | null; // in cm
  weight?: number | null; // in kg
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;

  // Medical Data
  conditions: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
  emergencyContacts: EmergencyContact[];

  // Emergency Information
  emergencyNotes?: string | null;

  // Medical Directives
  isOrganDonor: boolean;
  hasDNR: boolean; // Do Not Resuscitate

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  bloodType?: BloodType;
  height?: number;
  weight?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyNotes?: string;
  isOrganDonor?: boolean;
  hasDNR?: boolean;
}

export interface AddAllergyRequest {
  allergen: string;
  severity: AllergySeverity;
  reaction: string;
}

export interface AddMedicationRequest {
  name: string;
  dosage: string;
  frequency: string; // Preset value or custom text
  prescribedBy?: string;
  startDate?: string;
  notes?: string;
}

export interface AddConditionRequest {
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

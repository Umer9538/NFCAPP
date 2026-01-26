/**
 * Profile API
 * API endpoints for medical profile management - Connected to real backend
 */

import { api } from './client';
import { API_CONFIG } from '@/constants';
import type {
  MedicalProfile,
  UpdateProfileRequest,
  AddAllergyRequest,
  AddMedicationRequest,
  AddConditionRequest,
  Allergy,
  Medication,
  MedicalCondition,
} from '@/types/profile';

/**
 * Backend response structure
 */
interface ProfileApiResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      username: string;
      email: string;
      phoneNumber?: string;
      gender?: string;
      dateOfBirth?: string;
      address?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      height?: string;
    };
    medicalProfile: {
      id: string;
      userId: string;
      bloodType: string;
      height: string;
      weight: string;
      allergies: { allergen: string; severity: string; reaction: string }[];
      medicalConditions: string[];
      medications: { name: string; dosage: string; frequency: string }[];
      emergencyNotes?: string;
      isOrganDonor: boolean;
      hasDNR: boolean;
    } | null;
    doctorInfo: any;
    emergencyContacts: {
      id: string;
      name: string;
      relation: string;
      phone: string;
      email?: string;
    }[];
    prescriptions: any[];
  };
}

/**
 * Get user's medical profile
 * Transforms backend response to match frontend MedicalProfile type
 */
export async function getProfile(): Promise<MedicalProfile> {
  const response = await api.get<ProfileApiResponse>(API_CONFIG.ENDPOINTS.PROFILE.GET);

  // Transform backend response to frontend format
  const { user, medicalProfile, emergencyContacts } = response.data;

  // Parse height/weight from strings like "180cm" to numbers
  const parseNumber = (value: string | undefined): number | null => {
    if (!value) return null;
    const num = parseInt(value.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? null : num;
  };

  return {
    id: medicalProfile?.id || '',
    userId: user.id,
    // User info
    firstName: user.fullName?.split(' ')[0] || '',
    lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
    phone: user.phoneNumber || null,
    gender: user.gender?.toLowerCase() as any || null,
    dateOfBirth: user.dateOfBirth || null,
    // Medical info
    bloodType: medicalProfile?.bloodType as any || null,
    height: parseNumber(medicalProfile?.height),
    weight: parseNumber(medicalProfile?.weight),
    isOrganDonor: medicalProfile?.isOrganDonor || false,
    hasDNR: medicalProfile?.hasDNR || false,
    emergencyNotes: medicalProfile?.emergencyNotes || null,
    // Arrays - transform to frontend format
    // Handle both string arrays (from profile-setup) and object arrays (from edit)
    conditions: (medicalProfile?.medicalConditions || []).map((item, index) => {
      // Handle string format (from profile-setup): ["Diabetes", "Asthma"]
      if (typeof item === 'string') {
        return {
          id: `condition-${index}`,
          name: item,
        };
      }
      // Handle object format - preserve actual ID from backend
      return {
        id: item.id || `condition-${index}`,
        name: item.name,
        status: item.status,
        diagnosedDate: item.diagnosedDate,
        notes: item.notes,
      };
    }),
    allergies: (medicalProfile?.allergies || []).map((item, index) => {
      // Handle string format (from profile-setup): ["Peanuts", "Latex"]
      if (typeof item === 'string') {
        return {
          id: `allergy-${index}`,
          allergen: item,
          severity: 'moderate' as any,
          reaction: '',
        };
      }
      // Handle object format (from edit profile) - preserve actual ID from backend
      return {
        id: item.id || `allergy-${index}`,
        allergen: item.allergen || item.name || 'Unknown',
        severity: (item.severity || 'moderate') as any,
        reaction: item.reaction || '',
        notes: item.notes,
      };
    }),
    medications: (medicalProfile?.medications || []).map((item, index) => {
      // Handle string format (from profile-setup): ["Aspirin", "Metformin"]
      if (typeof item === 'string') {
        return {
          id: `medication-${index}`,
          name: item,
          dosage: '',
          frequency: '',
        };
      }
      // Handle object format - preserve actual ID from backend
      return {
        id: item.id || `medication-${index}`,
        name: item.name || 'Unknown',
        dosage: item.dosage || '',
        frequency: item.frequency || '',
        prescribedBy: item.prescribedBy,
        notes: item.notes,
      };
    }),
    emergencyContacts: (emergencyContacts || []).map(c => ({
      id: c.id,
      name: c.name,
      relationship: c.relation,
      phone: c.phone,
      email: c.email || null,
      isPrimary: false,
    })),
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update medical profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<MedicalProfile> {
  return await api.put<MedicalProfile>(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, data);
}

/**
 * Add medical condition
 */
export async function addCondition(data: AddConditionRequest): Promise<MedicalCondition> {
  return await api.post<MedicalCondition>('/api/profile/conditions', data);
}

/**
 * Remove medical condition
 */
export async function removeCondition(id: string): Promise<{ message: string }> {
  return await api.delete(`/api/profile/conditions/${id}`);
}

/**
 * Add allergy
 */
export async function addAllergy(data: AddAllergyRequest): Promise<Allergy> {
  return await api.post<Allergy>('/api/profile/allergies', data);
}

/**
 * Remove allergy
 */
export async function removeAllergy(id: string): Promise<{ message: string }> {
  return await api.delete(`/api/profile/allergies/${id}`);
}

/**
 * Add medication
 */
export async function addMedication(data: AddMedicationRequest): Promise<Medication> {
  return await api.post<Medication>('/api/profile/medications', data);
}

/**
 * Remove medication
 */
export async function removeMedication(id: string): Promise<{ message: string }> {
  return await api.delete(`/api/profile/medications/${id}`);
}

export const profileApi = {
  getProfile,
  updateProfile,
  addCondition,
  removeCondition,
  addAllergy,
  removeAllergy,
  addMedication,
  removeMedication,
};

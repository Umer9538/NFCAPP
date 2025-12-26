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
 * Get user's medical profile
 */
export async function getProfile(): Promise<MedicalProfile> {
  return await api.get<MedicalProfile>(API_CONFIG.ENDPOINTS.PROFILE.GET);
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
  return await api.post<MedicalCondition>('/profile/conditions', data);
}

/**
 * Remove medical condition
 */
export async function removeCondition(id: string): Promise<{ message: string }> {
  return await api.delete(`/profile/conditions/${id}`);
}

/**
 * Add allergy
 */
export async function addAllergy(data: AddAllergyRequest): Promise<Allergy> {
  return await api.post<Allergy>('/profile/allergies', data);
}

/**
 * Remove allergy
 */
export async function removeAllergy(id: string): Promise<{ message: string }> {
  return await api.delete(`/profile/allergies/${id}`);
}

/**
 * Add medication
 */
export async function addMedication(data: AddMedicationRequest): Promise<Medication> {
  return await api.post<Medication>('/profile/medications', data);
}

/**
 * Remove medication
 */
export async function removeMedication(id: string): Promise<{ message: string }> {
  return await api.delete(`/profile/medications/${id}`);
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

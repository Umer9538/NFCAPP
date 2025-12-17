/**
 * Emergency Profile API
 * API calls for emergency profile management
 */

import { api } from './client';
import { API_CONFIG } from '@/constants';
import type { EmergencyProfile } from '@/types';

/**
 * Get user's emergency profile
 */
export async function getEmergencyProfile(): Promise<EmergencyProfile> {
  return api.get<EmergencyProfile>(API_CONFIG.ENDPOINTS.EMERGENCY_PROFILE.GET);
}

/**
 * Get emergency profile by ID (public access via NFC/QR scan)
 */
export async function getEmergencyProfileById(id: string): Promise<EmergencyProfile> {
  const endpoint = API_CONFIG.ENDPOINTS.EMERGENCY_PROFILE.GET_BY_ID.replace(':id', id);
  return api.get<EmergencyProfile>(endpoint);
}

/**
 * Create emergency profile
 */
export async function createEmergencyProfile(
  data: Partial<EmergencyProfile>
): Promise<EmergencyProfile> {
  return api.post<EmergencyProfile>(API_CONFIG.ENDPOINTS.EMERGENCY_PROFILE.CREATE, data);
}

/**
 * Update emergency profile
 */
export async function updateEmergencyProfile(
  id: string,
  data: Partial<EmergencyProfile>
): Promise<EmergencyProfile> {
  const endpoint = API_CONFIG.ENDPOINTS.EMERGENCY_PROFILE.UPDATE.replace(':id', id);
  return api.patch<EmergencyProfile>(endpoint, data);
}

/**
 * Delete emergency profile
 */
export async function deleteEmergencyProfile(id: string): Promise<{ message: string }> {
  const endpoint = API_CONFIG.ENDPOINTS.EMERGENCY_PROFILE.DELETE.replace(':id', id);
  return api.delete(endpoint);
}

/**
 * Medical Conditions API
 */
export async function getMedicalConditions() {
  return api.get(API_CONFIG.ENDPOINTS.MEDICAL.CONDITIONS);
}

export async function addMedicalCondition(data: {
  name: string;
  diagnosedDate?: string;
  notes?: string;
}) {
  return api.post(API_CONFIG.ENDPOINTS.MEDICAL.CONDITIONS, data);
}

export async function updateMedicalCondition(
  id: string,
  data: { name?: string; diagnosedDate?: string; notes?: string }
) {
  return api.patch(`${API_CONFIG.ENDPOINTS.MEDICAL.CONDITIONS}/${id}`, data);
}

export async function deleteMedicalCondition(id: string) {
  return api.delete(`${API_CONFIG.ENDPOINTS.MEDICAL.CONDITIONS}/${id}`);
}

/**
 * Medications API
 */
export async function getMedications() {
  return api.get(API_CONFIG.ENDPOINTS.MEDICAL.MEDICATIONS);
}

export async function addMedication(data: {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
}) {
  return api.post(API_CONFIG.ENDPOINTS.MEDICAL.MEDICATIONS, data);
}

export async function updateMedication(
  id: string,
  data: {
    name?: string;
    dosage?: string;
    frequency?: string;
    prescribedBy?: string;
    startDate?: string;
  }
) {
  return api.patch(`${API_CONFIG.ENDPOINTS.MEDICAL.MEDICATIONS}/${id}`, data);
}

export async function deleteMedication(id: string) {
  return api.delete(`${API_CONFIG.ENDPOINTS.MEDICAL.MEDICATIONS}/${id}`);
}

/**
 * Allergies API
 */
export async function getAllergies() {
  return api.get(API_CONFIG.ENDPOINTS.MEDICAL.ALLERGIES);
}

export async function addAllergy(data: {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}) {
  return api.post(API_CONFIG.ENDPOINTS.MEDICAL.ALLERGIES, data);
}

export async function updateAllergy(
  id: string,
  data: {
    allergen?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    reaction?: string;
  }
) {
  return api.patch(`${API_CONFIG.ENDPOINTS.MEDICAL.ALLERGIES}/${id}`, data);
}

export async function deleteAllergy(id: string) {
  return api.delete(`${API_CONFIG.ENDPOINTS.MEDICAL.ALLERGIES}/${id}`);
}

/**
 * Emergency Contacts API
 */
export async function getEmergencyContacts() {
  return api.get(API_CONFIG.ENDPOINTS.CONTACTS.LIST);
}

export async function addEmergencyContact(data: {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}) {
  return api.post(API_CONFIG.ENDPOINTS.CONTACTS.CREATE, data);
}

export async function updateEmergencyContact(
  id: string,
  data: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
    email?: string;
  }
) {
  const endpoint = API_CONFIG.ENDPOINTS.CONTACTS.UPDATE.replace(':id', id);
  return api.patch(endpoint, data);
}

export async function deleteEmergencyContact(id: string) {
  const endpoint = API_CONFIG.ENDPOINTS.CONTACTS.DELETE.replace(':id', id);
  return api.delete(endpoint);
}

export const emergencyProfileApi = {
  getEmergencyProfile,
  getEmergencyProfileById,
  createEmergencyProfile,
  updateEmergencyProfile,
  deleteEmergencyProfile,
  getMedicalConditions,
  addMedicalCondition,
  updateMedicalCondition,
  deleteMedicalCondition,
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getAllergies,
  addAllergy,
  updateAllergy,
  deleteAllergy,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
};

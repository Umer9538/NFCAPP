/**
 * Emergency Profile API
 * API calls for emergency profile management - Connected to real backend
 */

import { api } from './client';
import type { EmergencyProfile } from '@/types';

/**
 * Get user's emergency profile
 */
export async function getEmergencyProfile(): Promise<EmergencyProfile> {
  return api.get<EmergencyProfile>('/api/profile');
}

/**
 * Get emergency profile by bracelet ID (public access via NFC/QR scan)
 */
export async function getEmergencyProfileById(braceletId: string): Promise<EmergencyProfile> {
  return api.get<EmergencyProfile>(`/api/emergency/${braceletId}`);
}

/**
 * Update emergency profile
 */
export async function updateEmergencyProfile(
  data: Partial<EmergencyProfile>
): Promise<EmergencyProfile> {
  return api.put<EmergencyProfile>('/api/profile', data);
}

/**
 * Medical Conditions API
 */
export async function getMedicalConditions() {
  return api.get('/api/profile/conditions');
}

export async function addMedicalCondition(data: {
  name: string;
  diagnosedDate?: string;
  notes?: string;
}) {
  return api.post('/api/profile/conditions', data);
}

export async function updateMedicalCondition(
  id: string,
  data: { name?: string; diagnosedDate?: string; notes?: string }
) {
  return api.patch(`/api/profile/conditions/${id}`, data);
}

export async function deleteMedicalCondition(id: string) {
  return api.delete(`/api/profile/conditions/${id}`);
}

/**
 * Medications API
 */
export async function getMedications() {
  return api.get('/api/profile/medications');
}

export async function addMedication(data: {
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
}) {
  return api.post('/api/profile/medications', data);
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
  return api.patch(`/api/profile/medications/${id}`, data);
}

export async function deleteMedication(id: string) {
  return api.delete(`/api/profile/medications/${id}`);
}

/**
 * Allergies API
 */
export async function getAllergies() {
  return api.get('/api/profile/allergies');
}

export async function addAllergy(data: {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;
}) {
  return api.post('/api/profile/allergies', data);
}

export async function updateAllergy(
  id: string,
  data: {
    allergen?: string;
    severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    reaction?: string;
  }
) {
  return api.patch(`/api/profile/allergies/${id}`, data);
}

export async function deleteAllergy(id: string) {
  return api.delete(`/api/profile/allergies/${id}`);
}

/**
 * Emergency Contacts API
 */
export async function getEmergencyContacts() {
  return api.get('/api/emergency-contacts');
}

export async function addEmergencyContact(data: {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}) {
  return api.post('/api/emergency-contacts', data);
}

export async function updateEmergencyContact(
  id: string,
  data: {
    name?: string;
    relation?: string;
    phone?: string;
    email?: string;
  }
) {
  return api.patch(`/api/emergency-contacts/${id}`, data);
}

export async function deleteEmergencyContact(id: string) {
  return api.delete(`/api/emergency-contacts/${id}`);
}

export const emergencyProfileApi = {
  getEmergencyProfile,
  getEmergencyProfileById,
  updateEmergencyProfile,
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

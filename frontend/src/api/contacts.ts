/**
 * Contacts API
 * API endpoints for emergency contacts and doctor information - Connected to real backend
 */

import { api } from './client';
import type {
  EmergencyContact,
  EmergencyContactInput,
  DoctorInfo,
  DoctorInfoInput,
} from '@/types/dashboard';

/**
 * Get all emergency contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return await api.get<EmergencyContact[]>('/contacts');
}

/**
 * Get a single emergency contact
 */
export async function getEmergencyContact(id: string): Promise<EmergencyContact> {
  return await api.get<EmergencyContact>(`/contacts/${id}`);
}

/**
 * Add a new emergency contact
 */
export async function addEmergencyContact(
  data: EmergencyContactInput
): Promise<EmergencyContact> {
  return await api.post<EmergencyContact>('/contacts', data);
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(
  id: string,
  data: Partial<EmergencyContactInput>
): Promise<EmergencyContact> {
  return await api.put<EmergencyContact>(`/contacts/${id}`, data);
}

/**
 * Delete an emergency contact
 */
export async function deleteEmergencyContact(id: string): Promise<{ message: string }> {
  return await api.delete<{ message: string }>(`/contacts/${id}`);
}

/**
 * Get doctor information
 */
export async function getDoctorInfo(): Promise<DoctorInfo | null> {
  return await api.get<DoctorInfo | null>('/contacts/doctor');
}

/**
 * Update doctor information
 */
export async function updateDoctorInfo(data: DoctorInfoInput): Promise<DoctorInfo> {
  return await api.put<DoctorInfo>('/contacts/doctor', data);
}

export const contactsApi = {
  getEmergencyContacts,
  getEmergencyContact,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getDoctorInfo,
  updateDoctorInfo,
};

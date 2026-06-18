/**
 * Medical Profile API
 * Wraps the web's GET /api/profile and shared sub-resource endpoints.
 * Same backend the web uses — never mock or fabricate endpoints here.
 */

import { api } from './client';
import type {
  MedicalProfileResponse,
  UpdateMedicalProfileBody,
} from '@/types/medicalProfile';

export async function getMedicalProfile(): Promise<MedicalProfileResponse> {
  const res = await api.get<{ success: boolean; data: MedicalProfileResponse }>(
    '/api/profile',
  );
  return res.data;
}

export async function updateMedicalProfile(
  body: UpdateMedicalProfileBody,
): Promise<void> {
  await api.put('/api/profile', body);
}

export const medicalProfileApi = {
  getMedicalProfile,
  updateMedicalProfile,
};

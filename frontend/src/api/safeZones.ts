/**
 * Safe Zones API — same backend the web uses (no separate mobile backend).
 *
 * Endpoints (mirrors app/api/safe-zones/* in the Next.js platform):
 *   GET    /api/safe-zones
 *   POST   /api/safe-zones
 *   PATCH  /api/safe-zones/:id
 *   DELETE /api/safe-zones/:id
 */

import { api } from './client';

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  alertOnExit: boolean;
  alertOnEntry: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafeZoneListResponse {
  success: boolean;
  data: SafeZone[];
  meta: { count: number; limit: number };
}

export interface SafeZoneInput {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  alertOnExit: boolean;
  alertOnEntry: boolean;
}

export async function listSafeZones(): Promise<SafeZoneListResponse> {
  return api.get<SafeZoneListResponse>('/api/safe-zones');
}

export async function createSafeZone(body: SafeZoneInput): Promise<SafeZone> {
  const res = await api.post<{ success: boolean; data: SafeZone }>(
    '/api/safe-zones',
    body,
  );
  return res.data;
}

export async function updateSafeZone(
  id: string,
  patch: Partial<SafeZoneInput> & { isActive?: boolean },
): Promise<SafeZone> {
  const res = await api.patch<{ success: boolean; data: SafeZone }>(
    `/api/safe-zones/${id}`,
    patch,
  );
  return res.data;
}

export async function deleteSafeZone(id: string): Promise<void> {
  await api.delete(`/api/safe-zones/${id}`);
}

export const safeZonesApi = {
  listSafeZones,
  createSafeZone,
  updateSafeZone,
  deleteSafeZone,
};

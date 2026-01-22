/**
 * Emergency API
 * API endpoints for emergency profile access
 */

import { api } from './client';
import type { EmergencyProfile } from '@/types/dashboard';

/**
 * Get emergency profile by bracelet ID
 * This is a public endpoint that doesn't require authentication
 */
export async function getEmergencyProfile(braceletId: string): Promise<EmergencyProfile> {
  return api.get<EmergencyProfile>(`/api/emergency/${braceletId}`);
}

/**
 * Log emergency profile access
 * Records when a profile is accessed for audit purposes
 */
export async function logProfileAccess(
  braceletId: string,
  metadata?: {
    location?: string;
    userAgent?: string;
  }
): Promise<{ message: string }> {
  return api.post(`/api/emergency/${braceletId}/access`, metadata);
}

export const emergencyApi = {
  getEmergencyProfile,
  logProfileAccess,
};

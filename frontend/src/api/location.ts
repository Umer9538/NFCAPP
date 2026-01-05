/**
 * Location API
 * Handles location sharing endpoints
 */

import { api } from './client';

// Types
export interface LocationShare {
  id: string;
  shareToken: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  isActive: boolean;
  expiresAt: string;
  accessCount: number;
  lastAccessedAt?: string;
  createdAt: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'pharmacy' | 'fire_station';
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  phone?: string;
  openingHours?: string;
}

export interface CreateLocationShareRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  expiresInHours?: number;
}

export interface CreateLocationShareResponse {
  success: boolean;
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface LocationHistoryResponse {
  success: boolean;
  shares: LocationShare[];
  stats: {
    totalShares: number;
    totalViews: number;
  };
}

export interface SharedLocationResponse {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  patient: {
    fullName: string;
    phoneNumber?: string;
    bloodType?: string;
    allergies?: string[];
    medicalConditions?: string[];
    emergencyContacts?: Array<{
      name: string;
      relation: string;
      phone: string;
    }>;
  };
  nearbyPlaces: NearbyPlace[];
  shareInfo: {
    createdAt: string;
    expiresAt: string;
    accessCount: number;
  };
}

export interface NearbyPlacesResponse {
  success: boolean;
  places: NearbyPlace[];
}

/**
 * Create a new location share
 */
export async function createLocationShare(
  data: CreateLocationShareRequest
): Promise<CreateLocationShareResponse> {
  return api.post<CreateLocationShareResponse>('/api/location/share', data);
}

/**
 * Get location share history for current user
 */
export async function getLocationHistory(
  limit: number = 20,
  includeExpired: boolean = false
): Promise<LocationHistoryResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    includeExpired: includeExpired.toString(),
  });
  return api.get<LocationHistoryResponse>(`/api/location/history?${params}`);
}

/**
 * Get a shared location by token (public endpoint)
 */
export async function getSharedLocation(
  shareToken: string
): Promise<SharedLocationResponse> {
  return api.get<SharedLocationResponse>(`/api/location/${shareToken}`);
}

/**
 * Deactivate a location share
 */
export async function deactivateLocationShare(
  shareToken: string
): Promise<{ success: boolean; message: string }> {
  return api.delete<{ success: boolean; message: string }>(
    `/api/location/${shareToken}`
  );
}

/**
 * Get nearby emergency services
 */
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 5000,
  type?: 'hospital' | 'police' | 'pharmacy' | 'fire_station'
): Promise<NearbyPlacesResponse> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lng: longitude.toString(),
    radius: radius.toString(),
  });
  if (type) {
    params.append('type', type);
  }
  return api.get<NearbyPlacesResponse>(`/api/location/nearby?${params}`);
}

export default {
  createLocationShare,
  getLocationHistory,
  getSharedLocation,
  deactivateLocationShare,
  getNearbyPlaces,
};

/**
 * Activities API
 * API endpoints for activity/audit logs
 */

import { api } from './client';
import type { Activity, ActivityFilters, ActivitiesResponse } from '@/types/dashboard';

/**
 * Get activities with filters and pagination
 */
export async function getActivities(
  filters: ActivityFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<ActivitiesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo);
  }
  if (filters.types && filters.types.length > 0) {
    params.append('types', filters.types.join(','));
  }
  if (filters.search) {
    params.append('search', filters.search);
  }

  return api.get<ActivitiesResponse>(`/activities?${params.toString()}`);
}

/**
 * Get single activity details
 */
export async function getActivityDetails(id: string): Promise<Activity> {
  return api.get<Activity>(`/activities/${id}`);
}

/**
 * Export activities
 */
export async function exportActivities(
  format: 'pdf' | 'csv',
  filters: ActivityFilters = {}
): Promise<Blob> {
  const params = new URLSearchParams({
    format,
  });

  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo);
  }
  if (filters.types && filters.types.length > 0) {
    params.append('types', filters.types.join(','));
  }

  // This would normally return a blob for download
  // For now, we'll just call the endpoint
  return api.get<Blob>(`/activities/export?${params.toString()}`);
}

/**
 * Delete activity log
 */
export async function deleteActivity(id: string): Promise<{ message: string }> {
  return api.delete(`/activities/${id}`);
}

export const activitiesApi = {
  getActivities,
  getActivityDetails,
  exportActivities,
  deleteActivity,
};

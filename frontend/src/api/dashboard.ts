/**
 * Dashboard API
 * API endpoints for dashboard data - Connected to real backend
 */

import { api } from './client';
import type {
  DashboardResponse,
  DashboardStats,
  HealthReminder,
  RecentActivity,
} from '@/types/dashboard';

/**
 * Get dashboard overview data
 * Note: Backend doesn't have a single /dashboard endpoint,
 * so we fetch stats and return it as DashboardResponse
 */
export async function getDashboardOverview(): Promise<DashboardResponse> {
  // Use /api/dashboard/stats as the main dashboard endpoint
  const response = await api.get<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats');
  return {
    stats: response.stats,
    reminders: [],
    recentActivity: [],
  };
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return await api.get<DashboardStats>('/api/dashboard/stats');
}

/**
 * Get health reminders
 */
export async function getHealthReminders(): Promise<HealthReminder[]> {
  const response = await api.get<{ success: boolean; reminders: HealthReminder[] }>('/api/health-reminders');
  return response.reminders || [];
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
  const response = await api.get<{ success: boolean; activities: RecentActivity[] }>(`/api/activities?limit=${limit}`);
  return response.activities || [];
}

/**
 * Complete a health reminder
 */
export async function completeReminder(id: string): Promise<{ message: string }> {
  return await api.put('/api/health-reminders', { id, completed: true });
}

/**
 * Dismiss a health reminder
 */
export async function dismissReminder(id: string): Promise<{ message: string }> {
  return await api.put('/api/health-reminders', { id, completed: true });
}

/**
 * Snooze a health reminder (mark as incomplete to show again later)
 */
export async function snoozeReminder(id: string, snoozeUntil: string): Promise<{ message: string }> {
  return await api.put('/api/health-reminders', { id, completed: false });
}

export const dashboardApi = {
  getDashboardOverview,
  getDashboardStats,
  getHealthReminders,
  getRecentActivities,
  completeReminder,
  dismissReminder,
  snoozeReminder,
};

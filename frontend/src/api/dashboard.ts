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
 */
export async function getDashboardOverview(): Promise<DashboardResponse> {
  return await api.get<DashboardResponse>('/dashboard');
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return await api.get<DashboardStats>('/dashboard/stats');
}

/**
 * Get health reminders
 */
export async function getHealthReminders(): Promise<HealthReminder[]> {
  return await api.get<HealthReminder[]>('/dashboard/reminders');
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
  return await api.get<RecentActivity[]>(`/dashboard/activities?limit=${limit}`);
}

/**
 * Complete a health reminder
 */
export async function completeReminder(id: string): Promise<{ message: string }> {
  return await api.patch(`/dashboard/reminders/${id}/complete`);
}

/**
 * Dismiss a health reminder
 */
export async function dismissReminder(id: string): Promise<{ message: string }> {
  return await api.patch(`/dashboard/reminders/${id}/dismiss`);
}

/**
 * Snooze a health reminder
 */
export async function snoozeReminder(id: string, snoozeUntil: string): Promise<{ message: string }> {
  return await api.patch(`/dashboard/reminders/${id}/snooze`, { snoozeUntil });
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

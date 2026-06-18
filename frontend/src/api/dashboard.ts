/**
 * Dashboard API
 * Mirrors the web companion endpoints — same backend, same response shapes.
 */

import { api } from './client';
import type {
  DashboardResponse,
  DashboardStats,
  HealthReminder,
  MedicationWidgetData,
  RecentActivity,
} from '@/types/dashboard';

export async function getDashboardOverview(): Promise<DashboardResponse> {
  const [stats, reminders, recentActivity] = await Promise.all([
    getDashboardStats(),
    getHealthReminders().catch(() => []),
    getRecentActivities(5).catch(() => []),
  ]);
  return { stats, reminders, recentActivity };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<{ success: boolean; stats: DashboardStats }>(
    '/api/dashboard/stats',
  );
  return res.stats;
}

export async function getTodaysMedications(): Promise<MedicationWidgetData | null> {
  const res = await api.get<{ success: boolean; data: MedicationWidgetData }>(
    '/api/medications/today',
  );
  return res.data ?? null;
}

export async function getHealthReminders(): Promise<HealthReminder[]> {
  const res = await api.get<{ success: boolean; reminders: HealthReminder[] }>(
    '/api/health-reminders',
  );
  return res.reminders ?? [];
}

export async function getRecentActivities(limit = 5): Promise<RecentActivity[]> {
  const res = await api.get<{ success: boolean; activities: RecentActivity[] }>(
    `/api/activities?limit=${limit}`,
  );
  return res.activities ?? [];
}

export async function completeReminder(id: string): Promise<void> {
  await api.put('/api/health-reminders', { id, completed: true });
}

export async function doseAction(
  medicationId: string,
  doseId: string,
  action: 'take' | 'skip' | 'snooze',
  snoozeDuration?: number,
): Promise<void> {
  await api.post(`/api/medications/${medicationId}/dose`, {
    doseId,
    action,
    ...(action === 'snooze' && snoozeDuration ? { snoozeDuration } : {}),
  });
}

export const dashboardApi = {
  getDashboardOverview,
  getDashboardStats,
  getTodaysMedications,
  getHealthReminders,
  getRecentActivities,
  completeReminder,
  doseAction,
};

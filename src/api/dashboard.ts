/**
 * Dashboard API
 * API endpoints for dashboard data - Using SQLite database
 */

import { dashboardService, activityLogsService, userService, braceletService, subscriptionService } from '@/db/services';
import type {
  DashboardResponse,
  DashboardStats,
  HealthReminder,
  RecentActivity,
} from '@/types/dashboard';

// Demo user ID for local development
const DEMO_USER_ID = 'user-demo-001';

/**
 * Get dashboard overview data
 */
export async function getDashboardOverview(): Promise<DashboardResponse> {
  try {
    const stats = await getDashboardStats();
    const reminders = await getHealthReminders();
    const recentActivities = await getRecentActivities();

    return {
      stats,
      reminders,
      recentActivities,
    };
  } catch (error) {
    console.error('[Dashboard API] Error getting overview:', error);
    throw error;
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const user = await userService.getById(DEMO_USER_ID);
    const stats = await dashboardService.getStats(DEMO_USER_ID);
    const bracelet = await braceletService.getByUserId(DEMO_USER_ID);
    const subscription = await subscriptionService.getByUserId(DEMO_USER_ID);

    // Calculate missing fields
    const missingFields: string[] = [];
    if (!user?.phone) missingFields.push('phone');
    if (!user?.dateOfBirth) missingFields.push('dateOfBirth');

    return {
      profileCompleteness: {
        percentage: stats.profileCompleteness,
        missingFields,
      },
      braceletStatus: {
        isActive: bracelet?.status === 'active',
        lastScan: bracelet?.lastAccessed,
        tagId: bracelet?.nfcId,
      },
      recentAccesses: stats.recentAccesses,
      subscription: {
        isActive: subscription?.status === 'active',
        plan: subscription?.plan || 'Free',
        expiresAt: subscription?.currentPeriodEnd,
      },
    };
  } catch (error) {
    console.error('[Dashboard API] Error getting stats:', error);
    throw error;
  }
}

/**
 * Get health reminders
 */
export async function getHealthReminders(): Promise<HealthReminder[]> {
  // TODO: Implement reminders table in database
  // For now, return empty array
  return [];
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
  try {
    const activities = await activityLogsService.getByUserId(DEMO_USER_ID, limit);

    return activities.map((activity) => ({
      id: activity.id,
      action: activity.type,
      description: activity.description,
      timestamp: activity.timestamp,
      location: activity.metadata ? JSON.parse(activity.metadata).location : undefined,
      type: activity.type as any,
      icon: getActivityIcon(activity.type),
    }));
  } catch (error) {
    console.error('[Dashboard API] Error getting activities:', error);
    throw error;
  }
}

/**
 * Complete a health reminder
 */
export async function completeReminder(id: string): Promise<{ message: string }> {
  // TODO: Implement reminders table in database
  return { message: 'Reminder completed' };
}

/**
 * Dismiss a health reminder
 */
export async function dismissReminder(id: string): Promise<{ message: string }> {
  // TODO: Implement reminders table in database
  return { message: 'Reminder dismissed' };
}

/**
 * Snooze a health reminder
 */
export async function snoozeReminder(
  id: string,
  snoozeUntil: string
): Promise<{ message: string }> {
  // TODO: Implement reminders table in database
  return { message: 'Reminder snoozed' };
}

/**
 * Helper to get activity icon based on type
 */
function getActivityIcon(type: string): string {
  switch (type) {
    case 'scan':
      return 'scan-outline';
    case 'update':
      return 'create-outline';
    case 'login':
      return 'log-in-outline';
    default:
      return 'information-circle-outline';
  }
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

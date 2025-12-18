/**
 * Notifications API
 * API endpoints for managing push notifications and notification settings
 */

import apiClient from './client';
import type { PushNotificationToken, NotificationSettings, NotificationType } from '@/services/notificationService';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Register push notification token with backend
 */
export async function registerPushToken(tokenData: PushNotificationToken): Promise<void> {
  try {
    await apiClient.post('/notifications/register-device', tokenData);
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
}

/**
 * Unregister push notification token
 */
export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await apiClient.post('/notifications/unregister-device', { token });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    throw error;
  }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const response = await apiClient.get<NotificationSettings>('/notifications/settings');
    return response.data;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    // Return default settings on error
    return {
      enabled: true,
      notifyProfileAccess: true,
      notifySubscriptionUpdates: true,
      notifySecurityAlerts: true,
      notifyMarketingEmails: false,
      sound: true,
      vibration: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  try {
    const response = await apiClient.put<NotificationSettings>('/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}

/**
 * Get all notifications with pagination
 */
export async function getNotifications(
  page: number = 1,
  pageSize: number = 20,
  type?: NotificationType
): Promise<NotificationListResponse> {
  try {
    const params: Record<string, any> = { page, pageSize };
    if (type) {
      params.type = type;
    }

    const response = await apiClient.get<NotificationListResponse>('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting notifications:', error);
    // Return mock data for development
    return getMockNotifications(page, pageSize, type);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await apiClient.put('/notifications/read-all');
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  try {
    await apiClient.delete('/notifications/all');
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}

/**
 * Test push notification (for development)
 */
export async function sendTestNotification(type: NotificationType): Promise<void> {
  try {
    await apiClient.post('/notifications/test', { type });
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

// Mock data for development
function getMockNotifications(
  page: number,
  pageSize: number,
  type?: NotificationType
): NotificationListResponse {
  const allNotifications: Notification[] = [
    {
      id: '1',
      type: 'profile_access',
      title: 'Emergency Profile Accessed',
      message: 'Your emergency profile was accessed by a first responder in San Francisco, CA',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      actionUrl: '/activity/logs',
      data: {
        location: 'San Francisco, CA',
        accessedBy: 'EMS Unit 42',
      },
    },
    {
      id: '2',
      type: 'health_reminder',
      title: 'Medication Reminder',
      message: 'Time to take your evening medication',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      actionUrl: '/dashboard',
    },
    {
      id: '3',
      type: 'security',
      title: 'New Login Detected',
      message: 'A new login was detected from iPhone 15 Pro in New York, NY',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      actionUrl: '/settings/security',
      data: {
        device: 'iPhone 15 Pro',
        location: 'New York, NY',
      },
    },
    {
      id: '4',
      type: 'subscription',
      title: 'Subscription Expiring Soon',
      message: 'Your MedGuard Premium subscription expires in 7 days',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      actionUrl: '/settings/subscription',
    },
    {
      id: '5',
      type: 'health_reminder',
      title: 'Weekly Health Check',
      message: "Don't forget to update your health information",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      actionUrl: '/dashboard',
    },
    {
      id: '6',
      type: 'marketing',
      title: 'New Feature Available',
      message: 'Check out our new medication tracking feature!',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      actionUrl: '/dashboard',
    },
  ];

  // Filter by type if provided
  const filteredNotifications = type
    ? allNotifications.filter((n) => n.type === type)
    : allNotifications;

  // Paginate
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedNotifications = filteredNotifications.slice(start, end);

  return {
    notifications: paginatedNotifications,
    unreadCount: filteredNotifications.filter((n) => !n.read).length,
    total: filteredNotifications.length,
    page,
    pageSize,
  };
}

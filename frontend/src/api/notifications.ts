/**
 * Notifications API
 * API endpoints for managing push notifications and notification settings - Connected to real backend
 */

import { api } from './client';
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
  await api.post('/notifications/register-device', tokenData);
}

/**
 * Unregister push notification token
 */
export async function unregisterPushToken(token: string): Promise<void> {
  await api.post('/notifications/unregister-device', { token });
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return await api.get<NotificationSettings>('/notifications/settings');
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  return await api.put<NotificationSettings>('/notifications/settings', settings);
}

/**
 * Get all notifications with pagination
 */
export async function getNotifications(
  page: number = 1,
  pageSize: number = 20,
  type?: NotificationType
): Promise<NotificationListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (type) {
    params.append('type', type);
  }
  return await api.get<NotificationListResponse>(`/notifications?${params.toString()}`);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<{ count: number }>('/notifications/unread-count');
  return response.count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await api.put(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await api.put('/notifications/read-all');
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await api.delete(`/notifications/${notificationId}`);
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  await api.delete('/notifications/all');
}

/**
 * Test push notification (for development)
 */
export async function sendTestNotification(type: NotificationType): Promise<void> {
  await api.post('/notifications/test', { type });
}

export const notificationsApi = {
  registerPushToken,
  unregisterPushToken,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendTestNotification,
};

/**
 * Notification Service
 * Handles push notifications, local notifications, and notification management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type NotificationType =
  | 'profile_access'
  | 'health_reminder'
  | 'subscription'
  | 'security'
  | 'marketing';

export interface PushNotificationToken {
  token: string;
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
}

export interface NotificationSettings {
  enabled: boolean;
  // API field names matching web
  notifyProfileAccess: boolean;
  notifySubscriptionUpdates: boolean;
  notifySecurityAlerts: boolean;
  notifyMarketingEmails: boolean;
  // Local preferences
  sound: boolean;
  vibration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
}

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Check if notifications are supported on this device
 */
export function isNotificationSupported(): boolean {
  return Device.isDevice;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log('Notifications are not supported on this device');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get push notification token (Expo Push Token)
 */
export async function getPushNotificationToken(): Promise<PushNotificationToken | null> {
  if (!isNotificationSupported()) {
    console.log('Cannot get push token - not a physical device');
    return null;
  }

  try {
    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Get device info
    const deviceInfo: PushNotificationToken = {
      token: tokenData.data,
      deviceId: Device.modelId || 'unknown',
      deviceName: Device.deviceName || 'Unknown Device',
      platform: Platform.OS as 'ios' | 'android',
      appVersion: Constants.expoConfig?.version || '1.0.0',
    };

    return deviceInfo;
  } catch (error) {
    console.error('Error getting push notification token:', error);
    return null;
  }
}

/**
 * Register device for push notifications
 * Call this after user logs in or enables notifications
 */
export async function registerForPushNotifications(): Promise<PushNotificationToken | null> {
  // Request permissions
  const hasPermission = await requestNotificationPermissions();

  if (!hasPermission) {
    return null;
  }

  // Get push token
  const tokenData = await getPushNotificationToken();

  if (!tokenData) {
    return null;
  }

  // Configure notification channels for Android
  if (Platform.OS === 'android') {
    await configureAndroidChannels();
  }

  return tokenData;
}

/**
 * Configure Android notification channels
 */
async function configureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  // Profile Access Channel
  await Notifications.setNotificationChannelAsync('profile_access', {
    name: 'Profile Access',
    description: 'Notifications when your emergency profile is accessed',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#EF4444',
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
    showBadge: true,
  });

  // Health Reminders Channel
  await Notifications.setNotificationChannelAsync('health_reminder', {
    name: 'Health Reminders',
    description: 'Medication and health check reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B82F6',
    sound: 'default',
    enableVibrate: true,
    showBadge: true,
  });

  // Security Alerts Channel
  await Notifications.setNotificationChannelAsync('security', {
    name: 'Security Alerts',
    description: 'Important security notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: '#F59E0B',
    sound: 'default',
    enableVibrate: true,
    enableLights: true,
    showBadge: true,
  });

  // Subscription Channel
  await Notifications.setNotificationChannelAsync('subscription', {
    name: 'Subscription',
    description: 'Subscription and billing notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#10B981',
    sound: 'default',
    showBadge: true,
  });

  // Marketing Channel
  await Notifications.setNotificationChannelAsync('marketing', {
    name: 'Marketing',
    description: 'New features and promotional content',
    importance: Notifications.AndroidImportance.LOW,
    lightColor: '#8B5CF6',
    showBadge: false,
  });
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  notification: ScheduledNotification
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: notification.trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

/**
 * Schedule daily health reminder
 */
export async function scheduleDailyReminder(
  title: string,
  body: string,
  hour: number,
  minute: number,
  data?: Record<string, any>
): Promise<string> {
  return scheduleNotification({
    id: `daily_reminder_${hour}_${minute}`,
    title,
    body,
    data: {
      type: 'health_reminder',
      ...data,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Schedule medication reminder
 */
export async function scheduleMedicationReminder(
  medicationName: string,
  hour: number,
  minute: number,
  days?: number[]
): Promise<string> {
  const trigger: Notifications.NotificationTriggerInput = {
    hour,
    minute,
    repeats: true,
  };

  // Add weekday filter if specified
  if (days && days.length > 0) {
    (trigger as any).weekday = days; // 1 = Sunday, 2 = Monday, etc.
  }

  return scheduleNotification({
    id: `medication_${medicationName}_${hour}_${minute}`,
    title: 'Medication Reminder',
    body: `Time to take your ${medicationName}`,
    data: {
      type: 'health_reminder',
      subType: 'medication',
      medicationName,
    },
    trigger,
  });
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Clear notification badge count
 */
export async function clearBadgeCount(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge count:', error);
  }
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Get current notification settings from device
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

/**
 * Add notification received listener (foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (user tapped notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listener
 */
export function removeNotificationListener(subscription: Notifications.Subscription): void {
  subscription.remove();
}

/**
 * Present a local notification immediately
 */
export async function presentNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // null = show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error presenting notification:', error);
    throw error;
  }
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

/**
 * Check if in quiet hours
 */
export function isInQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = settings.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  // Regular quiet hours (e.g., 13:00 - 15:00)
  return currentTime >= startTime && currentTime < endTime;
}

/**
 * Get notification type icon
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'profile_access':
      return 'alert-circle';
    case 'health_reminder':
      return 'medical';
    case 'subscription':
      return 'card';
    case 'security':
      return 'shield-checkmark';
    case 'marketing':
      return 'megaphone';
    default:
      return 'notifications';
  }
}

/**
 * Get notification type color
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'profile_access':
      return '#EF4444'; // Red
    case 'health_reminder':
      return '#3B82F6'; // Blue
    case 'subscription':
      return '#10B981'; // Green
    case 'security':
      return '#F59E0B'; // Amber
    case 'marketing':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

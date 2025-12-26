/**
 * useNotifications Hook
 * Manage push notifications, listeners, and notification state
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';

import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  removeNotificationListener,
  clearBadgeCount,
  setBadgeCount,
} from '@/services/notificationService';
import { registerPushToken, getUnreadCount } from '@/api/notifications';
import { getNavigationFromNotification } from '@/navigation/linkingConfig';

export interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  unreadCount: number;
  registerDevice: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(
    null
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Register device for push notifications
  const registerDevice = async () => {
    try {
      const tokenData = await registerForPushNotifications();

      if (tokenData) {
        setExpoPushToken(tokenData.token);

        // Send token to backend
        await registerPushToken(tokenData);

        console.log('Push notification token registered:', tokenData.token);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Refresh unread count
  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
      await setBadgeCount(count);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  };

  useEffect(() => {
    // Register for push notifications on mount
    registerDevice();

    // Load initial unread count
    refreshUnreadCount();

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      setNotification(notification);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Invalidate notifications query to refresh list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Listen for user interactions with notifications (tapped)
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      // Navigate based on notification data
      const navigationData = getNavigationFromNotification(data);

      if (navigationData) {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          (navigation as any).navigate(navigationData.screen, navigationData.params);
        }, 100);
      }

      // Refresh notifications list and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      refreshUnreadCount();
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        removeNotificationListener(notificationListener.current);
      }
      if (responseListener.current) {
        removeNotificationListener(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    unreadCount,
    registerDevice,
    refreshUnreadCount,
  };
}

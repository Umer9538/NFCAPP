/**
 * Deep Linking Configuration
 * Configure deep links for notifications and external URLs
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linkingConfig: LinkingOptions<any> = {
  prefixes: [prefix, 'medguard://', 'https://medguard.com', 'https://app.medguard.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Signup: 'signup',
          ForgotPassword: 'forgot-password',
          ResetPassword: {
            path: 'reset-password/:token',
            parse: {
              token: (token: string) => token,
            },
          },
          TwoFactorAuth: '2fa',
          BiometricSetup: 'biometric-setup',
        },
      },
      MainTabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home',
              EmergencyContacts: 'emergency-contacts',
              AddEditContact: 'add-contact',
              DoctorInfo: 'doctor-info',
              Notifications: 'notifications',
            },
          },
          Activity: {
            screens: {
              AuditLogs: 'activity',
            },
          },
          Settings: {
            screens: {
              SettingsScreen: 'settings',
              ChangePassword: 'settings/password',
              SecuritySettings: 'settings/security',
              NotificationSettings: 'settings/notifications',
              PrivacySettings: 'settings/privacy',
            },
          },
        },
      },
      EmergencyProfile: 'emergency/:braceletId',
    },
  },
  async getInitialURL() {
    // Check if app was opened by a deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    // Check if there's a notification that opened the app
    // This will be handled by notification response listener
    return null;
  },
  subscribe(listener) {
    // Listen for deep links while app is running
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    // Add listener for deep links
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      // Clean up
      linkingSubscription.remove();
    };
  },
};

/**
 * Parse notification data to get navigation route
 */
export function getNavigationFromNotification(data: any): {
  screen: string;
  params?: any;
} | null {
  if (!data || !data.actionUrl) {
    return null;
  }

  const actionUrl = data.actionUrl as string;

  // Map action URLs to navigation routes
  const routeMap: Record<string, { screen: string; params?: any }> = {
    '/dashboard': { screen: 'HomeScreen' },
    '/activity/logs': { screen: 'AuditLogs' },
    '/emergency-contacts': { screen: 'EmergencyContacts' },
    '/settings': { screen: 'SettingsScreen' },
    '/settings/security': { screen: 'SecuritySettings' },
    '/settings/notifications': { screen: 'NotificationSettings' },
    '/settings/subscription': { screen: 'SettingsScreen' },
    '/forgot-password': { screen: 'ForgotPassword' },
  };

  // Check for direct match
  if (routeMap[actionUrl]) {
    return routeMap[actionUrl];
  }

  // Check for dynamic routes (e.g., /emergency/:id)
  const emergencyMatch = actionUrl.match(/^\/emergency\/(.+)$/);
  if (emergencyMatch) {
    return {
      screen: 'EmergencyProfile',
      params: { braceletId: emergencyMatch[1] },
    };
  }

  // Check for reset-password with token
  const resetPasswordMatch = actionUrl.match(/^\/reset-password\/(.+)$/);
  if (resetPasswordMatch) {
    return {
      screen: 'ResetPassword',
      params: { token: resetPasswordMatch[1] },
    };
  }

  // Check for reset-password with query param
  const resetPasswordQueryMatch = actionUrl.match(/^\/reset-password\?token=(.+)$/);
  if (resetPasswordQueryMatch) {
    return {
      screen: 'ResetPassword',
      params: { token: resetPasswordQueryMatch[1] },
    };
  }

  return null;
}

/**
 * Settings API
 * API endpoints for settings and account management
 * Using local AsyncStorage for demo mode
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '@/db/services';
import type {
  UserProfile,
  ProfileUpdateInput,
  PasswordChangeInput,
  NotificationSettings,
  SecuritySettings,
  ActiveSession,
  AppInfo,
} from '@/types/settings';

const DEMO_USER_ID = 'user-demo-001';
const NOTIFICATION_SETTINGS_KEY = '@medguard_notification_settings';

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  emergencyAlerts: true,
  scanAlerts: true,
  profileUpdates: true,
  subscriptionUpdates: true,
  marketingEmails: false,
};

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  const user = await userService.getById(DEMO_USER_ID);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    profilePicture: user.profilePicture || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileUpdateInput): Promise<UserProfile> {
  await userService.update(DEMO_USER_ID, {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phoneNumber,
    dateOfBirth: data.dateOfBirth,
    profilePicture: data.profilePicture,
  });

  return getProfile();
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file: FormData): Promise<{ url: string }> {
  // In demo mode, return a placeholder URL
  return { url: 'https://via.placeholder.com/150' };
}

/**
 * Change password
 */
export async function changePassword(data: PasswordChangeInput): Promise<{ message: string }> {
  // In demo mode, just return success
  return { message: 'Password changed successfully' };
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('[Settings] Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[Settings] Error updating notification settings:', error);
    throw error;
  }
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  return {
    twoFactorEnabled: false,
    biometricEnabled: false,
    loginAlerts: true,
    deviceManagement: true,
    sessionTimeout: 30,
  };
}

/**
 * Enable two-factor authentication
 */
export async function enable2FA(): Promise<{ secret: string; qrCode: string }> {
  return {
    secret: 'DEMO-SECRET-KEY',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };
}

/**
 * Verify and confirm 2FA
 */
export async function verify2FA(code: string): Promise<{ message: string }> {
  return { message: 'Two-factor authentication enabled successfully' };
}

/**
 * Disable two-factor authentication
 */
export async function disable2FA(password: string): Promise<{ message: string }> {
  return { message: 'Two-factor authentication disabled successfully' };
}

/**
 * Enable biometric login
 */
export async function enableBiometricLogin(): Promise<{ message: string }> {
  return { message: 'Biometric login enabled successfully' };
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<{ message: string }> {
  return { message: 'Biometric login disabled successfully' };
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  return [
    {
      id: 'session-1',
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      lastActive: new Date().toISOString(),
      current: true,
    },
  ];
}

/**
 * Revoke session
 */
export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  return { message: 'Session revoked successfully' };
}

/**
 * Export user data
 */
export async function exportData(): Promise<Blob> {
  const data = JSON.stringify({ message: 'User data export' });
  return new Blob([data], { type: 'application/json' });
}

/**
 * Delete account
 */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  return { message: 'Account deletion request received' };
}

/**
 * Get app info
 */
export async function getAppInfo(): Promise<AppInfo> {
  return {
    version: '1.0.0',
    buildNumber: '1',
    platform: 'iOS',
    apiVersion: '1.0',
  };
}

/**
 * Clear cache
 */
export async function clearCache(): Promise<{ message: string }> {
  return { message: 'Cache cleared successfully' };
}

export const settingsApi = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  enable2FA,
  verify2FA,
  disable2FA,
  enableBiometricLogin,
  disableBiometricLogin,
  getActiveSessions,
  revokeSession,
  exportData,
  deleteAccount,
  getAppInfo,
  clearCache,
};

/**
 * Settings Types
 * TypeScript types for settings and account management
 */

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}

export interface PasswordChangeInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  profileAccessAlerts: boolean;
  healthReminders: boolean;
  subscriptionUpdates: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricLoginEnabled: boolean;
  sessionTimeout: number;
}

export interface ActiveSession {
  id: string;
  device: string;
  location?: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export interface AppInfo {
  version: string;
  buildNumber: string;
  latestVersion?: string;
  updateAvailable: boolean;
}

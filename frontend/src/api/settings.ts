/**
 * Settings API
 * API endpoints for settings and account management - Connected to real backend
 */

import { api } from './client';
import type {
  UserProfile,
  ProfileUpdateInput,
  PasswordChangeInput,
  NotificationSettings,
  SecuritySettings,
  ActiveSession,
  AppInfo,
} from '@/types/settings';

export interface ProfileUpdateResponse extends UserProfile {
  requiresEmailVerification?: boolean;
  pendingEmail?: string;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfile> {
  return await api.get<UserProfile>('/api/settings/profile');
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileUpdateInput): Promise<ProfileUpdateResponse> {
  return await api.put<ProfileUpdateResponse>('/api/settings/profile', data);
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file: FormData): Promise<{ url: string }> {
  return await api.post<{ url: string }>('/api/settings/profile/picture', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/**
 * Change password
 */
export async function changePassword(data: PasswordChangeInput): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/settings/password', data);
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return await api.get<NotificationSettings>('/api/settings/notifications');
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  return await api.put<NotificationSettings>('/api/settings/notifications', settings);
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  return await api.get<SecuritySettings>('/api/settings/security');
}

/**
 * Enable two-factor authentication
 */
export async function enable2FA(): Promise<{ secret: string; qrCode: string }> {
  return await api.post<{ secret: string; qrCode: string }>('/api/auth/2fa/enable');
}

/**
 * Verify and confirm 2FA
 */
export async function verify2FA(code: string): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/auth/2fa/verify', { code });
}

/**
 * Disable two-factor authentication
 */
export async function disable2FA(password: string): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/auth/2fa/disable', { password });
}

/**
 * Enable biometric login
 */
export async function enableBiometricLogin(): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/settings/biometric/enable');
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/settings/biometric/disable');
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  return await api.get<ActiveSession[]>('/api/auth/sessions');
}

/**
 * Revoke session
 */
export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  return await api.delete<{ message: string }>(`/api/auth/sessions/${sessionId}`);
}

/**
 * Export user data
 */
export async function exportData(): Promise<Blob> {
  const response = await api.get<Blob>('/api/settings/export', {
    responseType: 'blob',
  });
  return response;
}

/**
 * Delete account
 */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  return await api.delete<{ message: string }>('/api/auth/account', { data: { password } });
}

/**
 * Get app info
 */
export async function getAppInfo(): Promise<AppInfo> {
  return await api.get<AppInfo>('/api/settings/app-info');
}

/**
 * Clear cache
 */
export async function clearCache(): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/settings/clear-cache');
}

/**
 * Verify email change with OTP code
 */
export async function verifyEmailChange(data: {
  code: string;
  newEmail: string;
}): Promise<{ message: string; email: string }> {
  return await api.post<{ message: string; email: string }>('/api/settings/verify-email-change', data);
}

/**
 * Resend email change verification code
 */
export async function resendEmailVerificationCode(email: string): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/api/settings/resend-email-verification', { email });
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
  verifyEmailChange,
  resendEmailVerificationCode,
};

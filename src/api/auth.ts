/**
 * Authentication API
 * All auth-related API calls - Connected to backend (Prisma + SQLite)
 */

import { api } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '@/constants';
import type { AccountType } from '@/config/dashboardConfig';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  Enable2FAResponse,
  Verify2FARequest,
  Verify2FAResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/types/auth';

/**
 * Helper to get database instance
 */
async function getDb() {
  const { db } = await import('@/db/database');
  return db;
}

/**
 * Login with email and password
 * Connects to website backend API
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    // Call backend API for authentication
    const response = await api.post<{
      success: boolean;
      user: {
        id: string;
        email: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        accountType?: string;
        organizationId?: string;
        role?: string;
        suspended?: boolean;
        createdAt: string;
        updatedAt: string;
      };
      token?: string;
      accessToken?: string;
      refreshToken?: string;
    }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email: data.email,
      password: data.password,
    });

    const backendUser = response.user;
    const token = response.token || response.accessToken || 'authenticated';

    // Parse name - backend might return fullName or firstName/lastName
    let firstName = backendUser.firstName || '';
    let lastName = backendUser.lastName || '';
    if (!firstName && backendUser.fullName) {
      const nameParts = backendUser.fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const user: User = {
      id: backendUser.id,
      email: backendUser.email,
      firstName,
      lastName,
      phoneNumber: backendUser.phoneNumber,
      emailVerified: backendUser.emailVerified,
      twoFactorEnabled: backendUser.twoFactorEnabled,
      accountType: (backendUser.accountType as AccountType) || 'individual',
      organizationId: backendUser.organizationId,
      role: backendUser.role,
      suspended: backendUser.suspended,
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };

    // Store tokens and user data
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (response.refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return {
      token,
      refreshToken: response.refreshToken || '',
      user,
    };
  } catch (error: any) {
    console.error('[Auth API] Login error:', error);

    // If backend is unavailable, try local SQLite fallback for offline mode
    if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
      console.log('[Auth API] Backend unavailable, trying local database...');
      try {
        const db = await getDb();
        const localUser = await db.getFirstAsync<any>(
          'SELECT * FROM user WHERE email = ? AND password = ?',
          [data.email, data.password]
        );

        if (localUser) {
          const nameParts = (localUser.fullName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const user: User = {
            id: localUser.id,
            email: localUser.email,
            firstName,
            lastName,
            phoneNumber: localUser.phoneNumber,
            emailVerified: localUser.emailVerified === 1,
            twoFactorEnabled: localUser.twoFactorEnabled === 1,
            accountType: (localUser.accountType as AccountType) || 'individual',
            organizationId: localUser.organizationId,
            role: localUser.role,
            createdAt: localUser.createdAt,
            updatedAt: localUser.updatedAt,
          };

          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'offline-authenticated');
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

          return {
            token: 'offline-authenticated',
            refreshToken: '',
            user,
          };
        }
      } catch (dbError) {
        console.error('[Auth API] Local DB fallback failed:', dbError);
      }
    }

    throw new Error(error.message || 'Invalid email or password');
  }
}

/**
 * Sign up new user
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  try {
    // Prepare signup data for backend
    const signupData = {
      fullName: `${data.firstName} ${data.lastName}`,
      username: data.email.split('@')[0], // Generate username from email
      email: data.email,
      password: data.password,
      confirmPassword: data.password,
      accountType: data.accountType || 'individual',
      organizationId: data.organizationId,
    };

    // Call backend API
    const response = await api.post<{
      success: boolean;
      message: string;
      userId: string;
      email: string;
    }>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, signupData);

    return {
      token: '',
      refreshToken: '',
      user: {
        id: response.userId,
        email: response.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        emailVerified: false,
        twoFactorEnabled: false,
        accountType: data.accountType || 'individual',
        organizationId: data.organizationId,
        role: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Please check your email to verify your account',
    };
  } catch (error: any) {
    console.error('[Auth API] Signup error:', error);
    throw new Error(error.message || 'Signup failed');
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('[Auth API] Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }

    // Clear local storage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.ACCOUNT_TYPE,
      STORAGE_KEYS.ORGANIZATION_ID,
    ]);
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
  }
}

/**
 * Verify email with code
 */
export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  // Local demo - auto verify
  return {
    success: true,
    message: 'Email verified successfully',
  };
}

/**
 * Resend email verification code
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  // Local demo - not implemented
  return { message: 'Verification email sent' };
}

/**
 * Enable two-factor authentication
 */
export async function enable2FA(): Promise<Enable2FAResponse> {
  // Local demo - not implemented
  throw new Error('Two-factor authentication not available in demo mode');
}

/**
 * Verify two-factor authentication code
 */
export async function verify2FA(data: Verify2FARequest): Promise<Verify2FAResponse> {
  // Local demo - not implemented
  throw new Error('Two-factor authentication not available in demo mode');
}

/**
 * Disable two-factor authentication
 */
export async function disable2FA(password: string): Promise<{ message: string }> {
  // Local demo - not implemented
  throw new Error('Two-factor authentication not available in demo mode');
}

/**
 * Get current authenticated user
 * Fetches from backend API, falls back to cached data
 */
export async function getMe(): Promise<User> {
  try {
    // Check if user is authenticated
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      throw new Error('Not authenticated');
    }

    // Skip API call for offline tokens
    if (token === 'offline-authenticated') {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        return JSON.parse(userData);
      }
      throw new Error('Not authenticated');
    }

    // Fetch fresh user data from backend
    try {
      const response = await api.get<{
        user?: {
          id: string;
          email: string;
          fullName?: string;
          firstName?: string;
          lastName?: string;
          phoneNumber?: string;
          emailVerified: boolean;
          twoFactorEnabled: boolean;
          accountType?: string;
          organizationId?: string;
          role?: string;
          suspended?: boolean;
          createdAt: string;
          updatedAt: string;
        };
        id?: string;
        email?: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
      }>(API_CONFIG.ENDPOINTS.AUTH.ME);

      // Handle both { user: {...} } and direct user object responses
      const backendUser = response.user || response;

      // Parse name
      let firstName = backendUser.firstName || '';
      let lastName = backendUser.lastName || '';
      if (!firstName && backendUser.fullName) {
        const nameParts = backendUser.fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      const currentUser: User = {
        id: backendUser.id!,
        email: backendUser.email!,
        firstName,
        lastName,
        phoneNumber: (backendUser as any).phoneNumber,
        emailVerified: (backendUser as any).emailVerified ?? true,
        twoFactorEnabled: (backendUser as any).twoFactorEnabled ?? false,
        accountType: ((backendUser as any).accountType as AccountType) || 'individual',
        organizationId: (backendUser as any).organizationId,
        role: (backendUser as any).role,
        suspended: (backendUser as any).suspended,
        createdAt: (backendUser as any).createdAt || new Date().toISOString(),
        updatedAt: (backendUser as any).updatedAt || new Date().toISOString(),
      };

      // Update cached user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));

      return currentUser;
    } catch (apiError: any) {
      console.log('[Auth API] Backend getMe failed, using cached data:', apiError.message);
      // Fall through to cached data
    }

    // Return cached data if API call fails
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }

    throw new Error('Not authenticated');
  } catch (error: any) {
    console.error('[Auth API] Get me error:', error);
    throw new Error(error.message || 'Failed to get user data');
  }
}

/**
 * Forgot password - Send reset code to email
 */
export async function forgotPassword(
  email: string
): Promise<ForgotPasswordResponse> {
  try {
    // Call backend API
    const response = await api.post<ForgotPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response;
  } catch (error: any) {
    console.error('[Auth API] Forgot password error:', error);
    // For security, always return success message (don't reveal if email exists)
    return {
      success: true,
      message: 'If an account exists with this email, a reset code has been sent',
    };
  }
}

/**
 * Verify reset code
 */
export async function verifyResetCode(
  data: VerifyResetCodeRequest
): Promise<VerifyResetCodeResponse> {
  try {
    // Call backend API
    const response = await api.post<VerifyResetCodeResponse>(
      '/auth/verify-reset-code',
      data
    );
    return response;
  } catch (error: any) {
    console.error('[Auth API] Verify reset code error:', error);

    // For demo mode, accept any 6-digit code
    if (data.code.length === 6 && /^\d{6}$/.test(data.code)) {
      return {
        success: true,
        message: 'Code verified successfully',
      };
    }

    throw new Error(error.message || 'Invalid verification code');
  }
}

/**
 * Reset password with code
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Call backend API
    const response = await api.post<ResetPasswordResponse>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response;
  } catch (error: any) {
    console.error('[Auth API] Reset password error:', error);

    // For demo mode, update password in local database if code is valid
    if (data.code.length === 6 && /^\d{6}$/.test(data.code)) {
      try {
        const db = await getDb();
        await db.runAsync(
          'UPDATE user SET password = ?, updatedAt = ? WHERE email = ?',
          [data.newPassword, new Date().toISOString(), data.email]
        );
        return {
          success: true,
          message: 'Password reset successfully',
        };
      } catch (dbError) {
        console.error('[Auth API] DB update error:', dbError);
      }
    }

    throw new Error(error.message || 'Failed to reset password');
  }
}

/**
 * Change password (for authenticated user)
 */
export async function changePassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      throw new Error('User not found');
    }

    const user = JSON.parse(userData);
    const db = await getDb();

    // Verify current password
    const dbUser = await db.getFirstAsync<any>(
      'SELECT * FROM user WHERE id = ?',
      [user.id]
    );

    if (!dbUser || dbUser.password !== data.currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password in database
    await db.runAsync(
      'UPDATE user SET password = ?, updatedAt = ? WHERE id = ?',
      [data.newPassword, new Date().toISOString(), user.id]
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('[Auth API] Change password error:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  // Local demo - just return same token
  return {
    token: 'demo-token',
    refreshToken: 'demo-refresh-token',
  };
}

/**
 * Validate token (check if still valid)
 */
export async function validateToken(): Promise<{ valid: boolean; user?: User }> {
  try {
    const user = await getMe();
    return { valid: true, user };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(password: string): Promise<{ message: string }> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      throw new Error('User not found');
    }

    const user = JSON.parse(userData);
    const db = await getDb();

    // Verify password
    const dbUser = await db.getFirstAsync<any>(
      'SELECT * FROM user WHERE id = ?',
      [user.id]
    );

    if (!dbUser || dbUser.password !== password) {
      throw new Error('Incorrect password');
    }

    // Delete user and related data
    await db.runAsync('DELETE FROM user WHERE id = ?', [user.id]);

    // Clear AsyncStorage
    await logout();

    return { message: 'Account deleted successfully' };
  } catch (error) {
    console.error('[Auth API] Delete account error:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): Promise<User> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }

    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      throw new Error('User not found');
    }

    const user = JSON.parse(userData);
    const now = new Date().toISOString();
    const db = await getDb();

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (data.firstName || data.lastName) {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      updates.push('fullName = ?');
      values.push(fullName);
    }

    if (data.phoneNumber !== undefined) {
      updates.push('phoneNumber = ?');
      values.push(data.phoneNumber);
    }

    updates.push('updatedAt = ?');
    values.push(now);

    // Add user ID for WHERE clause
    values.push(user.id);

    // Update database
    await db.runAsync(
      `UPDATE user SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user from database
    const updatedUser = await db.getFirstAsync<any>(
      'SELECT * FROM user WHERE id = ?',
      [user.id]
    );

    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    // Update AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

    // Return updated user
    return await getMe();
  } catch (error) {
    console.error('[Auth API] Update profile error:', error);
    throw error;
  }
}

/**
 * Check if email is available
 */
export async function checkEmailAvailability(
  email: string
): Promise<{ available: boolean }> {
  try {
    const db = await getDb();
    const user = await db.getFirstAsync<any>(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );
    return { available: !user };
  } catch (error) {
    console.error('[Auth API] Check email error:', error);
    return { available: false };
  }
}

/**
 * Get user sessions (active login sessions)
 */
export async function getUserSessions(): Promise<
  Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>
> {
  // Local demo - return mock session
  return [
    {
      id: 'session-1',
      device: 'iOS Mobile App',
      location: 'Current Device',
      lastActive: new Date().toISOString(),
      current: true,
    },
  ];
}

/**
 * Revoke specific session
 */
export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  // Local demo - not implemented
  return { message: 'Session revoked' };
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllSessions(): Promise<{ message: string }> {
  // Local demo - not implemented
  return { message: 'All sessions revoked' };
}

/**
 * OTP Type for resend
 */
export type OtpType = 'EMAIL_VERIFICATION' | 'TWO_FACTOR';

/**
 * Resend OTP Request
 */
export interface ResendOtpRequest {
  userId?: string;
  email?: string;
  type: OtpType;
}

/**
 * Resend OTP Response
 */
export interface ResendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until OTP expires
}

/**
 * Resend OTP (verification code)
 */
export async function resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
  try {
    // Call backend API
    const response = await api.post<ResendOtpResponse>('/auth/resend-otp', {
      userId: data.userId,
      email: data.email,
      type: data.type,
    });

    return response;
  } catch (error: any) {
    console.error('[Auth API] Resend OTP error:', error);

    // For demo mode, return success
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        success: true,
        message: data.type === 'EMAIL_VERIFICATION'
          ? 'Verification code sent to your email'
          : 'Authentication code sent',
        expiresIn: 600, // 10 minutes
      };
    }

    throw new Error(error.message || 'Failed to resend code');
  }
}

export const authApi = {
  login,
  signup,
  logout,
  verifyEmail,
  resendVerificationEmail,
  resendOtp,
  enable2FA,
  verify2FA,
  disable2FA,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
  refreshToken,
  validateToken,
  deleteAccount,
  updateProfile,
  checkEmailAvailability,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
};

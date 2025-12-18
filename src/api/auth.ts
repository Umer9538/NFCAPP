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
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const db = await getDb();

    // Check credentials against local SQLite database
    const user = await db.getFirstAsync<any>(
      'SELECT * FROM user WHERE email = ? AND password = ?',
      [data.email, data.password]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Store user data in AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'local-authenticated');

    // Split fullName into firstName and lastName
    const nameParts = (user.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      token: 'local-authenticated',
      refreshToken: 'local-refresh',
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        phoneNumber: user.phoneNumber || undefined,
        emailVerified: user.emailVerified === 1,
        twoFactorEnabled: user.twoFactorEnabled === 1,
        accountType: (user.accountType as AccountType) || 'individual',
        organizationId: user.organizationId || undefined,
        role: user.role || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error: any) {
    console.error('[Auth API] Login error:', error);

    // Fallback to test credentials for development
    if (data.email === 'test@medguard.com' && data.password === 'Test123!') {
      const mockUser = {
        id: 'test-user-1',
        email: 'test@medguard.com',
        fullName: 'John Doe',
        phoneNumber: '+1 (555) 123-4567',
        emailVerified: 1,
        twoFactorEnabled: 0,
        accountType: 'individual' as AccountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-authenticated');

      return {
        token: 'test-authenticated',
        refreshToken: 'test-refresh',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: mockUser.phoneNumber,
          emailVerified: true,
          twoFactorEnabled: false,
          accountType: 'individual',
          organizationId: undefined,
          role: undefined,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };
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
 */
export async function getMe(): Promise<User> {
  try {
    // Check if user is authenticated
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (!token || !userData) {
      throw new Error('Not authenticated');
    }

    // Parse stored user data
    const user = JSON.parse(userData);

    // Import database to get latest user data
    const db = await getDb();

    // Get fresh user data from database
    const dbUser = await db.getFirstAsync<any>(
      'SELECT * FROM user WHERE id = ?',
      [user.id]
    );

    if (!dbUser) {
      throw new Error('User not found');
    }

    // Split fullName into firstName and lastName
    const nameParts = (dbUser.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const currentUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      firstName,
      lastName,
      phoneNumber: dbUser.phoneNumber || undefined,
      emailVerified: dbUser.emailVerified === 1,
      twoFactorEnabled: dbUser.twoFactorEnabled === 1,
      accountType: (dbUser.accountType as AccountType) || 'individual',
      organizationId: dbUser.organizationId || undefined,
      role: dbUser.role || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    // Update cached user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));

    return currentUser;
  } catch (error: any) {
    console.error('[Auth API] Get me error:', error);
    // Return cached data if database fails
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    throw new Error(error.message || 'Failed to get user data');
  }
}

/**
 * Forgot password - Send reset email
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  // Local demo - not implemented
  return {
    success: true,
    message: 'Password reset link sent to your email',
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  // Local demo - not implemented
  return {
    success: true,
    message: 'Password reset successfully',
  };
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

/**
 * Authentication API
 * All auth-related API calls - Connected to real backend
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
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
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
      profileComplete?: boolean;
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
  const token = response.token || response.accessToken || '';

  // Debug: Log what we received from backend
  console.log('🔐 Backend login response:', {
    hasUser: !!backendUser,
    accountType: backendUser?.accountType,
    organizationId: backendUser?.organizationId,
    role: backendUser?.role,
    email: backendUser?.email,
  });

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
    profileComplete: backendUser.profileComplete ?? false,
    accountType: (backendUser.accountType as AccountType) || 'individual',
    organizationId: backendUser.organizationId,
    role: backendUser.role || undefined,
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
}

/**
 * Sign up new user
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  // Generate username from email, replacing invalid characters with underscores
  // Backend only allows letters, numbers, and underscores
  const rawUsername = data.email.split('@')[0];
  const sanitizedUsername = rawUsername.replace(/[^a-zA-Z0-9_]/g, '_');

  const signupData = {
    fullName: `${data.firstName} ${data.lastName}`,
    username: sanitizedUsername,
    email: data.email,
    password: data.password,
    confirmPassword: data.password,
    accountType: data.accountType || 'individual',
    organizationId: data.organizationId,
  };

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
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('[Auth API] Logout API call failed:', error);
  }

  // Clear local storage
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.ACCOUNT_TYPE,
    STORAGE_KEYS.ORGANIZATION_ID,
  ]);
}

/**
 * Verify email with code
 */
export async function verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  return await api.post<VerifyEmailResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, data);
}

/**
 * Resend email verification code
 */
export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  // Backend uses resend-otp endpoint with type parameter
  return await api.post(API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP, {
    email,
    type: 'EMAIL_VERIFICATION',
  });
}

/**
 * Enable two-factor authentication
 */
export async function enable2FA(): Promise<Enable2FAResponse> {
  return await api.post<Enable2FAResponse>(API_CONFIG.ENDPOINTS.AUTH.ENABLE_2FA);
}

/**
 * Verify two-factor authentication code
 */
export async function verify2FA(data: Verify2FARequest): Promise<Verify2FAResponse> {
  return await api.post<Verify2FAResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA, data);
}

/**
 * Disable two-factor authentication
 */
export async function disable2FA(password: string): Promise<{ message: string }> {
  return await api.post(API_CONFIG.ENDPOINTS.AUTH.DISABLE_2FA, { password });
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<User> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await api.get<{
      user?: any;
      id?: string;
      email?: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
    }>(API_CONFIG.ENDPOINTS.AUTH.ME);

    const backendUser = response.user || response;

    // Debug: Log what we received from /auth/me
    console.log('🔐 getMe response:', {
      hasUser: !!backendUser,
      accountType: backendUser?.accountType,
      organizationId: backendUser?.organizationId,
      role: backendUser?.role,
      email: backendUser?.email,
    });

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
      phoneNumber: backendUser.phoneNumber,
      emailVerified: backendUser.emailVerified ?? true,
      twoFactorEnabled: backendUser.twoFactorEnabled ?? false,
      profileComplete: backendUser.profileComplete ?? false,
      accountType: (backendUser.accountType as AccountType) || 'individual',
      organizationId: backendUser.organizationId,
      role: backendUser.role,
      suspended: backendUser.suspended,
      createdAt: backendUser.createdAt || new Date().toISOString(),
      updatedAt: backendUser.updatedAt || new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    // Return cached data if API fails
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    throw new Error('Not authenticated');
  }
}

/**
 * Forgot password - Send reset code to email
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return await api.post<ForgotPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

/**
 * Verify reset code
 */
export async function verifyResetCode(data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> {
  return await api.post<VerifyResetCodeResponse>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_RESET_CODE, data);
}

/**
 * Reset password with code
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  return await api.post<ResetPasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data);
}

/**
 * Change password (for authenticated user)
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  return await api.post<ChangePasswordResponse>('/api/auth/change-password', data);
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  return await api.post<RefreshTokenResponse>(API_CONFIG.ENDPOINTS.AUTH.REFRESH, data);
}

/**
 * Validate token
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
  const response = await api.delete<{ message: string }>('/api/auth/account', { data: { password } });
  await logout();
  return response;
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): Promise<User> {
  await api.patch('/api/auth/profile', data);
  return await getMe();
}

/**
 * Check if email is available
 */
export async function checkEmailAvailability(email: string): Promise<{ available: boolean }> {
  return await api.post('/api/auth/check-email', { email });
}

/**
 * Get user sessions
 */
export async function getUserSessions(): Promise<{
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}[]> {
  return await api.get('/api/auth/sessions');
}

/**
 * Revoke specific session
 */
export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  return await api.delete(`/api/auth/sessions/${sessionId}`);
}

/**
 * Revoke all sessions except current
 */
export async function revokeAllSessions(): Promise<{ message: string }> {
  return await api.delete('/api/auth/sessions');
}

/**
 * OTP Types
 */
export type OtpType = 'EMAIL_VERIFICATION' | 'TWO_FACTOR';

export interface ResendOtpRequest {
  userId?: string;
  email?: string;
  type: OtpType;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

/**
 * Resend OTP
 */
export async function resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
  return await api.post<ResendOtpResponse>('/api/auth/resend-otp', data);
}

/**
 * Profile Setup Request
 */
export interface ProfileSetupRequest {
  email: string;
  userInfo: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  medicalProfile?: {
    bloodType?: string;
    height?: string;
    weight?: string;
    isOrganDonor?: boolean;
    hasDNR?: boolean;
    allergies?: { allergen: string; severity: string; reaction: string }[];
    medicalConditions?: string[];
    medications?: { name: string; dosage: string; frequency: string }[];
    emergencyNotes?: string;
  };
  emergencyContacts?: {
    name: string;
    relation: string;
    phone: string;
    email?: string;
  }[];
}

/**
 * Profile Setup Response
 */
export interface ProfileSetupResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

/**
 * Complete profile setup after email verification
 * This creates the user profile and session
 */
export async function profileSetup(data: ProfileSetupRequest): Promise<ProfileSetupResponse> {
  const response = await api.post<ProfileSetupResponse>(API_CONFIG.ENDPOINTS.AUTH.PROFILE_SETUP, data);

  // Store tokens and user data
  if (response.token) {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
  }
  if (response.refreshToken) {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
  }
  if (response.user) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
  }

  return response;
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
  profileSetup,
};

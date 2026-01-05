/**
 * Authentication Types
 * Matching Next.js backend schema
 */

import type { AccountType } from '@/config/dashboardConfig';

/**
 * User role within an organization
 * - admin: Full access to organization
 * - supervisor: Construction - can view workers, training, incidents
 * - teacher: Education - can view assigned students only
 * - parent: Education - can view own children only
 * - user/employee/worker/student: Basic access to own profile
 */
export type UserRole = 'admin' | 'supervisor' | 'teacher' | 'parent' | 'user' | 'employee' | 'worker' | 'student';

/**
 * User model matching backend
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountType: AccountType;
  organizationId?: string;
  role?: UserRole;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor?: boolean;
}

/**
 * Signup Request
 */
export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  accountType?: AccountType;
  organizationId?: string;
}

/**
 * Signup Response
 */
export interface SignupResponse {
  token: string;
  refreshToken: string;
  user: User;
  message?: string;
}

/**
 * Email Verification Request
 */
export interface VerifyEmailRequest {
  code: string;
  email: string;
}

/**
 * Email Verification Response
 */
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Two-Factor Authentication
 */
export interface Enable2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface Verify2FARequest {
  code: string;
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
  backupCodes?: string[];
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Verify Reset Code Request
 */
export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  success: boolean;
  message: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

/**
 * Session Data
 */
export interface SessionData {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Auth State (for Zustand store)
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accountType: AccountType | null;
  organizationId: string | null;
  isOrgAdmin: boolean;
  suspended: boolean;
}

/**
 * Auth Actions (for Zustand store)
 */
export interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<LoginResponse>;
  signup: (data: SignupRequest) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  isOrganizationUser: () => boolean;
  isSuspended: () => boolean;
}

/**
 * Complete Auth Store Type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Biometric Authentication
 */
export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

/**
 * User Update Request
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

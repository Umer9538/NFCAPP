/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import { useCallback } from 'react';
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading, selectError } from '@/store/authStore';
import { authApi } from '@/api/auth';
import type { SignupRequest, LoginResponse } from '@/types/auth';

/**
 * Authentication hook
 */
export function useAuth() {
  // Selectors for optimized re-renders
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const error = useAuthStore(selectError);

  // Actions
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const clearError = useAuthStore((state) => state.clearError);

  /**
   * Login handler with email and password
   */
  const handleLogin = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      return await login(email, password);
    },
    [login]
  );

  /**
   * Signup handler
   */
  const handleSignup = useCallback(
    async (data: SignupRequest) => {
      return await signup(data);
    },
    [signup]
  );

  /**
   * Logout handler
   */
  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
      try {
        const updatedUser = await authApi.updateProfile(data);
        setUser(updatedUser);
        return updatedUser;
      } catch (error: any) {
        throw error;
      }
    },
    [setUser]
  );

  /**
   * Change password
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      return await authApi.changePassword({ currentPassword, newPassword });
    },
    []
  );

  /**
   * Verify email
   */
  const verifyEmail = useCallback(async (code: string) => {
    if (!user?.email) {
      throw new Error('No email found');
    }
    return await authApi.verifyEmail({ code, email: user.email });
  }, [user]);

  /**
   * Resend verification email
   */
  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) {
      throw new Error('No email found');
    }
    return await authApi.resendVerificationEmail(user.email);
  }, [user]);

  /**
   * Enable two-factor authentication
   */
  const enable2FA = useCallback(async () => {
    return await authApi.enable2FA();
  }, []);

  /**
   * Verify two-factor authentication
   */
  const verify2FA = useCallback(async (code: string) => {
    const result = await authApi.verify2FA({ code });

    // Update user to reflect 2FA is enabled
    if (result.success && user) {
      setUser({ ...user, twoFactorEnabled: true });
    }

    return result;
  }, [user, setUser]);

  /**
   * Disable two-factor authentication
   */
  const disable2FA = useCallback(
    async (password: string) => {
      const result = await authApi.disable2FA(password);

      // Update user to reflect 2FA is disabled
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }

      return result;
    },
    [user, setUser]
  );

  /**
   * Request password reset
   */
  const forgotPassword = useCallback(async (email: string) => {
    return await authApi.forgotPassword({ email });
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    return await authApi.resetPassword({ token, newPassword });
  }, []);

  /**
   * Delete account
   */
  const deleteAccount = useCallback(
    async (password: string) => {
      await authApi.deleteAccount(password);
      await logout();
    },
    [logout]
  );

  /**
   * Check if email is available
   */
  const checkEmailAvailability = useCallback(async (email: string) => {
    return await authApi.checkEmailAvailability(email);
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerificationEmail,
    enable2FA,
    verify2FA,
    disable2FA,
    forgotPassword,
    resetPassword,
    deleteAccount,
    checkEmailAvailability,
    clearError,
  };
}

/**
 * Hook to check if user is authenticated (simple version)
 */
export function useIsAuthenticated() {
  return useAuthStore(selectIsAuthenticated);
}

/**
 * Hook to get current user (simple version)
 */
export function useCurrentUser() {
  return useAuthStore(selectUser);
}

/**
 * Hook to check auth loading state
 */
export function useAuthLoading() {
  return useAuthStore(selectIsLoading);
}

/**
 * Hook to get auth error
 */
export function useAuthError() {
  return useAuthStore(selectError);
}

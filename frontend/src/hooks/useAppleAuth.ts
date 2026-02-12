/**
 * useAppleAuth Hook
 * Handles Apple Sign-In authentication using expo-apple-authentication
 */

import { useCallback, useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

// Apple user data returned when signup is needed
export interface AppleUserData {
  email: string;
  fullName: string;
  appleId: string;
  emailVerified: boolean;
  identityToken: string;
}

export interface AppleAuthResult {
  success: boolean;
  needsSignup?: boolean;
  appleData?: AppleUserData;
  isNewUser?: boolean;
  requiresProfileSetup?: boolean;
  error?: string;
}

export interface CompleteAppleSignupData {
  fullName: string;
  username: string;
  email: string;
  appleId: string;
  identityToken: string;
  accountType?: 'INDIVIDUAL' | 'CORPORATE' | 'CONSTRUCTION' | 'EDUCATION';
}

/**
 * Hook for Apple Sign-In authentication
 */
export function useAppleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);

  // Check if Apple Sign-In is available on mount
  useEffect(() => {
    const checkAvailability = async () => {
      // Apple Sign-In is only available on iOS
      if (Platform.OS !== 'ios') {
        setIsAvailable(false);
        return;
      }

      try {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAvailable(available);
        console.log('🍎 Apple Sign-In available:', available);
      } catch (err) {
        console.error('Failed to check Apple Sign-In availability:', err);
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  /**
   * Handle Apple sign-in response from backend
   */
  const handleAppleResponse = useCallback(async (
    identityToken: string,
    user?: AppleAuthentication.AppleAuthenticationCredential['fullName'],
    email?: string | null
  ): Promise<AppleAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Build user data object for the API
      const appleUserData = {
        fullName: user ? {
          givenName: user.givenName,
          familyName: user.familyName,
        } : undefined,
        email: email,
      };

      // Send the identity token to our backend for verification
      const result = await api.post<{
        success: boolean;
        needsSignup?: boolean;
        appleData?: AppleUserData;
        isNewUser?: boolean;
        requiresProfileSetup?: boolean;
        token?: string;
        accessToken?: string;
        user?: any;
        message: string;
      }>('/api/auth/apple/mobile', {
        identityToken,
        user: appleUserData,
      });

      // New user - needs to complete signup
      if (result.success && result.needsSignup && result.appleData) {
        setIsLoading(false);
        return {
          success: true,
          needsSignup: true,
          appleData: result.appleData,
        };
      }

      // Existing user - logged in successfully
      if (result.success && result.token && result.user) {
        // Set tokens in auth store
        await setTokens(result.token, result.token);

        // Set user data
        setUser(result.user);

        return {
          success: true,
          needsSignup: false,
          isNewUser: result.isNewUser,
          requiresProfileSetup: result.requiresProfileSetup,
        };
      }

      return {
        success: false,
        error: 'Apple Sign-In failed. Please try again.',
      };
    } catch (err: any) {
      console.error('Apple auth error:', err);
      const errorMessage = err?.message || 'Apple Sign-In failed. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [setTokens, setUser]);

  /**
   * Complete Apple signup with username
   */
  const completeAppleSignup = useCallback(async (
    data: CompleteAppleSignupData
  ): Promise<AppleAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.post<{
        success: boolean;
        isNewUser: boolean;
        requiresProfileSetup: boolean;
        token: string;
        accessToken: string;
        user: any;
        message: string;
        error?: string;
      }>('/api/auth/apple/mobile/complete', data);

      if (result.success && result.token && result.user) {
        // Set tokens in auth store
        await setTokens(result.token, result.token);

        // Set user data
        setUser(result.user);

        return {
          success: true,
          needsSignup: false,
          isNewUser: true,
          requiresProfileSetup: result.requiresProfileSetup,
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to complete signup. Please try again.',
      };
    } catch (err: any) {
      console.error('Apple signup completion error:', err);
      const errorMessage = err?.message || 'Failed to complete signup. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [setTokens, setUser]);

  /**
   * Initiate Apple Sign-In
   */
  const signInWithApple = useCallback(async (): Promise<AppleAuthResult> => {
    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign-In is not available on this device.',
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, fullName, email } = credential;

      if (!identityToken) {
        setIsLoading(false);
        return {
          success: false,
          error: 'No identity token received from Apple. Please try again.',
        };
      }

      return await handleAppleResponse(identityToken, fullName, email);
    } catch (err: any) {
      setIsLoading(false);

      let errorMessage = 'Apple Sign-In failed. Please try again.';

      if (err.code === 'ERR_REQUEST_CANCELED') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (err.code === 'ERR_INVALID_RESPONSE') {
        errorMessage = 'Invalid response from Apple. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [isAvailable, handleAppleResponse]);

  return {
    signInWithApple,
    completeAppleSignup,
    isLoading,
    error,
    isAvailable,
    clearError: () => setError(null),
  };
}

export default useAppleAuth;

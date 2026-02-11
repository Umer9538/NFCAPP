/**
 * useGoogleAuth Hook
 * Handles Google OAuth authentication using native Google Sign-In
 */

import { useCallback, useEffect, useState } from 'react';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

// Google OAuth Client IDs
const WEB_CLIENT_ID = '522012003528-41fip6qmov18st5idr1hg2cb1bptmqk5.apps.googleusercontent.com';
const IOS_CLIENT_ID = '522012003528-424bqdvhplqo1e0ie7o95l34pe4tr2hf.apps.googleusercontent.com';

interface GoogleAuthResult {
  success: boolean;
  isNewUser?: boolean;
  requiresProfileSetup?: boolean;
  error?: string;
}

/**
 * Hook for Google OAuth authentication
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);

  // Configure Google Sign-In on mount
  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID, // Required for ID token
        iosClientId: IOS_CLIENT_ID, // iOS specific
        offlineAccess: true, // Get refresh token
        scopes: ['profile', 'email'],
      });
      setIsConfigured(true);
      console.log('🔐 Google Sign-In configured');
    } catch (err) {
      console.error('Failed to configure Google Sign-In:', err);
      setError('Google Sign-In configuration failed');
    }
  }, []);

  /**
   * Handle successful Google sign-in
   */
  const handleGoogleResponse = useCallback(async (
    idToken: string,
    accessToken?: string | null
  ): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Send the ID token to our backend for verification
      const result = await api.post<{
        success: boolean;
        isNewUser: boolean;
        requiresProfileSetup: boolean;
        token: string;
        accessToken: string;
        user: any;
        message: string;
      }>('/api/auth/google/mobile', {
        idToken,
        accessToken,
      });

      if (result.success) {
        // Set tokens in auth store
        await setTokens(result.token, result.token);

        // Set user data
        setUser(result.user);

        return {
          success: true,
          isNewUser: result.isNewUser,
          requiresProfileSetup: result.requiresProfileSetup,
        };
      }

      return {
        success: false,
        error: 'Google sign-in failed. Please try again.',
      };
    } catch (err: any) {
      console.error('Google auth error:', err);
      const errorMessage = err?.message || 'Google sign-in failed. Please try again.';
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
   * Initiate Google sign-in
   */
  const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    if (!isConfigured) {
      return {
        success: false,
        error: 'Google Sign-In is not configured. Please try again later.',
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        if (!idToken) {
          setIsLoading(false);
          return {
            success: false,
            error: 'No ID token received from Google. Please try again.',
          };
        }

        // Get access token if available
        const tokens = await GoogleSignin.getTokens();

        return await handleGoogleResponse(idToken, tokens?.accessToken);
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: 'Google sign-in failed. Please try again.',
        };
      }
    } catch (err: any) {
      setIsLoading(false);

      let errorMessage = 'Google sign-in failed. Please try again.';

      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'Sign-in was cancelled.';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Sign-in is already in progress.';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Google Play Services is not available. Please update it.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [isConfigured, handleGoogleResponse]);

  /**
   * Sign out from Google
   */
  const signOutFromGoogle = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch (err) {
      console.error('Google sign-out error:', err);
    }
  }, []);

  return {
    signInWithGoogle,
    signOutFromGoogle,
    isLoading,
    error,
    isReady: isConfigured,
    clearError: () => setError(null),
  };
}

export default useGoogleAuth;

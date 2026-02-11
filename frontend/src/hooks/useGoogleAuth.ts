/**
 * useGoogleAuth Hook
 * Handles Google OAuth authentication using expo-auth-session
 */

import { useCallback, useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from '@/constants';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
// Web Client ID is used for Expo Go development (needs https:// redirect URI in Google Console)
// iOS/Android Client IDs are used for standalone/development builds
const WEB_CLIENT_ID = '522012003528-41fip6qmov18st5idr1hg2cb1bptmqk5.apps.googleusercontent.com';
const IOS_CLIENT_ID = '522012003528-424bqdvhplqo1e0ie7o95l34pe4tr2hf.apps.googleusercontent.com';
// EAS Build Android Client ID (SHA-1: 45:F8:60:21:8A:B2:01:32:27:1E:F1:ED:0F:DB:3D:CE:33:89:AE:04)
const ANDROID_CLIENT_ID = '522012003528-uv62nf03jhg8qs7mbt8v68nram8qjn8i.apps.googleusercontent.com';

interface GoogleAuthResult {
  success: boolean;
  isNewUser?: boolean;
  requiresProfileSetup?: boolean;
  error?: string;
}

interface GoogleAuthTokens {
  accessToken?: string;
  idToken?: string;
}

/**
 * Hook for Google OAuth authentication
 */
export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);

  // Configure Google auth request
  // The provider automatically handles redirect URIs based on platform
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  // Log configuration for debugging
  useEffect(() => {
    if (__DEV__ && request) {
      console.log('🔐 Google OAuth configured');
      console.log('🔐 Platform:', Platform.OS);
      console.log('🔐 Using Client ID:', Platform.select({
        ios: IOS_CLIENT_ID,
        android: ANDROID_CLIENT_ID,
        default: WEB_CLIENT_ID,
      }));
    }
  }, [request]);

  /**
   * Handle Google sign-in response
   */
  const handleGoogleResponse = useCallback(async (
    authentication: GoogleAuthTokens
  ): Promise<GoogleAuthResult> => {
    setIsLoading(true);
    setError(null);

    // Ensure we have an ID token
    if (!authentication.idToken) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No ID token received from Google. Please try again.',
      };
    }

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
        idToken: authentication.idToken,
        accessToken: authentication.accessToken,
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
   * Process auth response when it changes
   */
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      handleGoogleResponse({
        accessToken: response.authentication.accessToken,
        idToken: response.authentication.idToken,
      });
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Google sign-in was cancelled or failed.');
    }
  }, [response, handleGoogleResponse]);

  /**
   * Initiate Google sign-in
   */
  const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
    if (!request) {
      return {
        success: false,
        error: 'Google sign-in is not available. Please try again later.',
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await promptAsync();

      if (result.type === 'success' && result.authentication) {
        return await handleGoogleResponse({
          accessToken: result.authentication.accessToken,
          idToken: result.authentication.idToken,
        });
      } else if (result.type === 'cancel') {
        setIsLoading(false);
        return {
          success: false,
          error: 'Sign-in was cancelled.',
        };
      } else {
        setIsLoading(false);
        return {
          success: false,
          error: 'Google sign-in failed. Please try again.',
        };
      }
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err?.message || 'Google sign-in failed. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [request, promptAsync, handleGoogleResponse]);

  return {
    signInWithGoogle,
    isLoading,
    error,
    isReady: !!request,
    clearError: () => setError(null),
  };
}

export default useGoogleAuth;

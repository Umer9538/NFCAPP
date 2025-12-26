/**
 * Biometric Service
 * Handles biometric authentication with secure token storage
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Secure storage keys
const SECURE_KEYS = {
  AUTH_TOKEN: 'medguard_auth_token',
  BIOMETRIC_ENABLED: 'medguard_biometric_enabled',
  USER_EMAIL: 'medguard_user_email',
} as const;

export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'Biometric';

export interface BiometricAvailability {
  available: boolean;
  enrolled: boolean;
  biometricType: BiometricType | null;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  token?: string;
}

/**
 * Check if biometric authentication is available and enrolled
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    // Check if device has biometric hardware
    const hasHardware = await LocalAuthentication.hasHardwareAsync();

    if (!hasHardware) {
      return {
        available: false,
        enrolled: false,
        biometricType: null,
        error: 'Biometric hardware not available on this device',
      };
    }

    // Check if biometrics are enrolled
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      return {
        available: true,
        enrolled: false,
        biometricType: null,
        error: 'No biometric credentials enrolled. Please set up Face ID, Touch ID, or Fingerprint in your device settings.',
      };
    }

    // Get supported biometric types
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const biometricType = getBiometricTypeName(supportedTypes);

    return {
      available: true,
      enrolled: true,
      biometricType,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      enrolled: false,
      biometricType: null,
      error: 'Failed to check biometric availability',
    };
  }
}

/**
 * Get human-readable biometric type name
 */
function getBiometricTypeName(
  types: LocalAuthentication.AuthenticationType[]
): BiometricType {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return Platform.OS === 'ios' ? 'FaceID' : 'Biometric';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometric';
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometric(
  promptMessage?: string
): Promise<BiometricAuthResult> {
  try {
    // Check availability first
    const availability = await checkBiometricAvailability();

    if (!availability.available) {
      return {
        success: false,
        error: availability.error || 'Biometric authentication not available',
      };
    }

    if (!availability.enrolled) {
      return {
        success: false,
        error: availability.error || 'No biometric credentials enrolled',
      };
    }

    // Perform biometric authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || `Authenticate with ${availability.biometricType}`,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      return {
        success: false,
        error: getAuthErrorMessage(result.error),
      };
    }

    // If authentication successful, retrieve stored token
    const token = await getSecureToken();

    if (!token) {
      return {
        success: false,
        error: 'No saved credentials found. Please log in with your password.',
      };
    }

    return {
      success: true,
      token,
    };
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error?.message || 'Authentication failed',
    };
  }
}

/**
 * Get user-friendly error message
 */
function getAuthErrorMessage(error?: string): string {
  if (!error) return 'Authentication failed';

  if (error.includes('canceled') || error.includes('cancelled')) {
    return 'Authentication was cancelled';
  }
  if (error.includes('lockout')) {
    return 'Too many failed attempts. Please try again later.';
  }
  if (error.includes('not_enrolled')) {
    return 'No biometric credentials enrolled';
  }
  if (error.includes('user_cancel')) {
    return 'Authentication cancelled by user';
  }

  return 'Authentication failed. Please try again.';
}

/**
 * Save auth token securely for biometric login
 */
export async function saveSecureToken(token: string, userEmail: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.AUTH_TOKEN, token);
    await SecureStore.setItemAsync(SECURE_KEYS.USER_EMAIL, userEmail);
  } catch (error) {
    console.error('Error saving secure token:', error);
    throw new Error('Failed to save credentials securely');
  }
}

/**
 * Get stored auth token
 */
export async function getSecureToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting secure token:', error);
    return null;
  }
}

/**
 * Get stored user email
 */
export async function getSecureUserEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.USER_EMAIL);
  } catch (error) {
    console.error('Error getting secure user email:', error);
    return null;
  }
}

/**
 * Remove stored token (when logging out or disabling biometric)
 */
export async function removeSecureToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.USER_EMAIL);
  } catch (error) {
    console.error('Error removing secure token:', error);
    throw new Error('Failed to remove secure credentials');
  }
}

/**
 * Enable biometric authentication
 */
export async function enableBiometric(token: string, userEmail: string): Promise<BiometricAuthResult> {
  try {
    // First check if biometric is available
    const availability = await checkBiometricAvailability();

    if (!availability.available || !availability.enrolled) {
      return {
        success: false,
        error: availability.error || 'Biometric authentication not available',
      };
    }

    // Authenticate to confirm user intent
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: `Enable ${availability.biometricType} login`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (!authResult.success) {
      return {
        success: false,
        error: 'Authentication required to enable biometric login',
      };
    }

    // Save token securely
    await saveSecureToken(token, userEmail);

    // Mark biometric as enabled
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED, 'true');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error enabling biometric:', error);
    return {
      success: false,
      error: error?.message || 'Failed to enable biometric authentication',
    };
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<void> {
  try {
    await removeSecureToken();
    await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
  } catch (error) {
    console.error('Error disabling biometric:', error);
    throw new Error('Failed to disable biometric authentication');
  }
}

/**
 * Check if biometric is enabled for this user
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
    const hasToken = await getSecureToken();

    return enabled === 'true' && hasToken !== null;
  } catch (error) {
    console.error('Error checking biometric enabled:', error);
    return false;
  }
}

/**
 * Get biometric icon name for UI
 */
export function getBiometricIcon(biometricType: BiometricType | null): string {
  switch (biometricType) {
    case 'FaceID':
      return 'scan-outline';
    case 'TouchID':
    case 'Fingerprint':
      return 'finger-print-outline';
    case 'Iris':
      return 'eye-outline';
    default:
      return 'lock-closed-outline';
  }
}

/**
 * Get biometric display name for UI
 */
export function getBiometricDisplayName(biometricType: BiometricType | null): string {
  if (!biometricType) return 'Biometric';

  switch (biometricType) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Fingerprint';
    case 'Iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
}

/**
 * useBiometric Hook
 * Hook for biometric authentication
 */

import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { saveBiometricPreference, getBiometricPreference } from '@/utils/storage';

interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

interface UseBiometricReturn {
  isAvailable: boolean;
  isEnrolled: boolean;
  isEnabled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  authenticate: (options?: BiometricOptions) => Promise<boolean>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  checkAvailability: () => Promise<void>;
}

/**
 * Biometric authentication hook
 */
export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  const checkAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setSupportedTypes(types);

        const enabled = await getBiometricPreference();
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setIsEnrolled(false);
    }
  };

  useEffect(() => {
    checkAvailability();
  }, []);

  const authenticate = async (options: BiometricOptions = {}): Promise<boolean> => {
    try {
      if (!isAvailable || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options.promptMessage || 'Authenticate to continue',
        cancelLabel: options.cancelLabel || 'Cancel',
        fallbackLabel: options.fallbackLabel || 'Use Password',
        disableDeviceFallback: options.disableDeviceFallback || false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const enable = async () => {
    try {
      // First authenticate to enable
      const authenticated = await authenticate({
        promptMessage: 'Authenticate to enable biometric login',
      });

      if (authenticated) {
        await saveBiometricPreference(true);
        setIsEnabled(true);
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  };

  const disable = async () => {
    try {
      await saveBiometricPreference(false);
      setIsEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  };

  return {
    isAvailable,
    isEnrolled,
    isEnabled,
    supportedTypes,
    authenticate,
    enable,
    disable,
    checkAvailability,
  };
}

/**
 * Get biometric type name for display
 */
export function getBiometricTypeName(
  types: LocalAuthentication.AuthenticationType[]
): string {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Touch ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometric';
}

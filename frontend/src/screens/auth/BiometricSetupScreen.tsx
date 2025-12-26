/**
 * Biometric Setup Screen
 * Onboarding screen for enabling biometric authentication
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Button, Toast, useToast } from '@/components/ui';
import {
  checkBiometricAvailability,
  enableBiometric,
  getBiometricIcon,
  getBiometricDisplayName,
  type BiometricType,
} from '@/services/biometricService';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

type RouteParams = {
  BiometricSetup: {
    token: string;
    userEmail: string;
  };
};

export default function BiometricSetupScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'BiometricSetup'>>();
  const { toastConfig, hideToast, error: showError } = useToast();

  const { token, userEmail } = route.params || {};

  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const availability = await checkBiometricAvailability();

    setIsAvailable(availability.available && availability.enrolled);
    setBiometricType(availability.biometricType);

    if (!availability.available || !availability.enrolled) {
      setErrorMessage(availability.error || 'Biometric authentication not available');
    }
  };

  const handleEnable = async () => {
    if (!token || !userEmail) {
      showError('Missing authentication credentials');
      return;
    }

    setIsLoading(true);

    try {
      const result = await enableBiometric(token, userEmail);

      if (result.success) {
        // Navigate to main app
        navigation.navigate('MainTabs');
      } else {
        showError(result.error || 'Failed to enable biometric authentication');
      }
    } catch (error: any) {
      showError(error?.message || 'Failed to enable biometric authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to main app without enabling biometric
    navigation.navigate('MainTabs');
  };

  const getBiometricIllustration = () => {
    const iconName = getBiometricIcon(biometricType);
    return <Ionicons name={iconName as any} size={120} color={PRIMARY[600]} />;
  };

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={120} color={SEMANTIC.text.tertiary} />
          </View>

          <Text style={styles.title}>Biometric Not Available</Text>
          <Text style={styles.description}>{errorMessage}</Text>

          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleSkip}
            />
          </View>
        </View>

        <Toast {...toastConfig} onDismiss={hideToast} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.iconContainer}>
          {getBiometricIllustration()}
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Enable {getBiometricDisplayName(biometricType)}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Quickly and securely log in to your account using {getBiometricDisplayName(biometricType)} instead of your password.
        </Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Ionicons name="flash" size={24} color={PRIMARY[600]} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Fast & Convenient</Text>
              <Text style={styles.benefitDescription}>
                Sign in with just a glance or touch
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Ionicons name="shield-checkmark" size={24} color={PRIMARY[600]} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Secure</Text>
              <Text style={styles.benefitDescription}>
                Your biometric data never leaves your device
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Ionicons name="lock-closed" size={24} color={PRIMARY[600]} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Privacy Protected</Text>
              <Text style={styles.benefitDescription}>
                Stored securely using device encryption
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={`Enable ${getBiometricDisplayName(biometricType)}`}
            onPress={handleEnable}
            loading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Skip for Now"
            variant="ghost"
            onPress={handleSkip}
            disabled={isLoading}
          />
        </View>

        {/* Note */}
        <Text style={styles.note}>
          You can enable or disable this feature anytime in Settings
        </Text>
      </View>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  description: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 24,
    paddingHorizontal: spacing[4],
  },
  benefits: {
    marginBottom: spacing[8],
    gap: spacing[4],
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  benefitDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  note: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

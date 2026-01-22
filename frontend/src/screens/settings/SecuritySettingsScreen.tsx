/**
 * Security Settings Screen
 * Manage biometric authentication, 2FA, sessions, and password
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Header, ConfirmDialog } from '@/components/shared';
import { Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import {
  isBiometricEnabled,
  checkBiometricAvailability,
  enableBiometric,
  disableBiometric,
  getBiometricDisplayName,
  getBiometricIcon,
  type BiometricType,
} from '@/services/biometricService';
import { getToken } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface SecurityOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'toggle' | 'link';
  enabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

export default function SecuritySettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const user = useAuthStore((state) => state.user);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Check biometric availability
      const availability = await checkBiometricAvailability();
      setBiometricAvailable(availability.available && availability.enrolled);
      setBiometricType(availability.biometricType);

      // Check if biometric is enabled
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);

      // TODO: Load 2FA status from API
      // For now, using mock data
      setTwoFactorEnabled(false);
    } catch (error) {
      console.error('Error loading security settings:', error);
      showError('Unable to load security settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      // Enable biometric
      await handleEnableBiometric();
    } else {
      // Show confirmation dialog before disabling
      setShowDisableDialog(true);
    }
  };

  const handleEnableBiometric = async () => {
    setBiometricLoading(true);

    try {
      // Check availability again
      const availability = await checkBiometricAvailability();

      if (!availability.available) {
        showError(availability.error || 'Biometric authentication not available');
        return;
      }

      if (!availability.enrolled) {
        showError(
          'No biometric credentials enrolled. Please set up Face ID, Touch ID, or Fingerprint in your device settings.'
        );
        return;
      }

      // Get current auth token and email
      const token = await getToken();
      const email = user?.email;

      if (!token || !email) {
        showError('Please log in again to enable biometric authentication');
        return;
      }

      // Enable biometric
      const result = await enableBiometric(token, email);

      if (result.success) {
        setBiometricEnabled(true);
        success(`${getBiometricDisplayName(biometricType)} is now enabled!`);
      } else {
        showError(result.error || 'Unable to enable biometric login. Please try again.');
      }
    } catch (error: any) {
      console.error('Error enabling biometric:', error);
      const message = error?.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('connect')) {
        showError('Unable to connect. Please check your internet.');
      } else {
        showError('Unable to enable biometric login. Please try again.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleDisableBiometric = async () => {
    setShowDisableDialog(false);
    setBiometricLoading(true);

    try {
      await disableBiometric();
      setBiometricEnabled(false);
      success(`${getBiometricDisplayName(biometricType)} has been disabled.`);
    } catch (error: any) {
      console.error('Error disabling biometric:', error);
      const message = error?.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('connect')) {
        showError('Unable to connect. Please check your internet.');
      } else {
        showError('Unable to disable biometric login. Please try again.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleToggleTwoFactor = async (value: boolean) => {
    if (value) {
      // Navigate to 2FA setup screen
      navigation.navigate('Enable2FA');
    } else {
      // Show confirmation
      Alert.alert(
        'Disable Two-Factor Authentication',
        'This will make your account less secure. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              // TODO: Implement 2FA disable
              setTwoFactorEnabled(false);
              success('Two-factor authentication has been disabled.');
            },
          },
        ]
      );
    }
  };

  const biometricSection: SecurityOption[] = [
    {
      id: 'biometric',
      title: getBiometricDisplayName(biometricType),
      description: biometricAvailable
        ? `Use ${getBiometricDisplayName(biometricType)} to quickly and securely sign in`
        : 'Not available on this device',
      icon: getBiometricIcon(biometricType),
      type: 'toggle',
      enabled: biometricEnabled,
      loading: biometricLoading,
      onPress: biometricAvailable ? undefined : () => {
        Alert.alert(
          'Not Available',
          'Biometric authentication is not available on this device. Please ensure you have Face ID, Touch ID, or Fingerprint set up in your device settings.',
          [{ text: 'OK' }]
        );
      },
    },
  ];

  const authenticationSection: SecurityOption[] = [
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: 'key-outline',
      type: 'link',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: '2fa',
      title: 'Two-Factor Authentication',
      description: twoFactorEnabled
        ? 'Extra security for your account'
        : 'Add an extra layer of security',
      icon: 'shield-checkmark-outline',
      type: 'toggle',
      enabled: twoFactorEnabled,
      onPress: undefined,
    },
  ];

  const sessionsSection: SecurityOption[] = [
    {
      id: 'sessions',
      title: 'Active Sessions',
      description: 'Manage devices where you are logged in',
      icon: 'phone-portrait-outline',
      type: 'link',
      onPress: () => {
        // TODO: Navigate to sessions screen
        showError('This feature is coming soon!');
      },
    },
  ];

  const renderOption = (option: SecurityOption) => {
    const isDisabled = option.id === 'biometric' && !biometricAvailable;

    return (
      <Pressable
        key={option.id}
        style={({ pressed }) => [
          styles.option,
          pressed && !isDisabled && styles.optionPressed,
          isDisabled && styles.optionDisabled,
        ]}
        onPress={
          option.type === 'link'
            ? option.onPress
            : isDisabled
            ? option.onPress
            : undefined
        }
        disabled={option.loading}
      >
        <View style={styles.optionIcon}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={isDisabled ? SEMANTIC.text.tertiary : PRIMARY[600]}
          />
        </View>

        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionTitle,
              isDisabled && styles.optionTitleDisabled,
            ]}
          >
            {option.title}
          </Text>
          <Text
            style={[
              styles.optionDescription,
              isDisabled && styles.optionDescriptionDisabled,
            ]}
          >
            {option.description}
          </Text>
        </View>

        {option.type === 'toggle' ? (
          <Switch
            value={option.enabled}
            onValueChange={
              option.id === 'biometric'
                ? handleToggleBiometric
                : option.id === '2fa'
                ? handleToggleTwoFactor
                : undefined
            }
            disabled={isDisabled || option.loading}
            trackColor={{
              false: SEMANTIC.border.default,
              true: PRIMARY[600],
            }}
            thumbColor="#ffffff"
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={SEMANTIC.text.tertiary}
          />
        )}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Security" showBackButton />
        <LoadingSpinner visible />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Security" showBackButton />

      <ScrollView style={styles.content}>
        {/* Biometric Authentication */}
        {biometricType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biometric Authentication</Text>
            <Card variant="elevated" padding="none">
              {biometricSection.map(renderOption)}
            </Card>

            {biometricEnabled && (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={PRIMARY[600]}
                />
                <Text style={styles.infoText}>
                  Your biometric data is stored securely on your device and never
                  leaves it. You can disable this feature at any time.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <Card variant="elevated" padding="none">
            {authenticationSection.map(renderOption)}
          </Card>
        </View>

        {/* Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessions</Text>
          <Card variant="elevated" padding="none">
            {sessionsSection.map(renderOption)}
          </Card>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={24} color={PRIMARY[600]} />
              <Text style={styles.tipsTitle}>Security Tips</Text>
            </View>
            <View style={styles.tips}>
              <Text style={styles.tipText}>
                • Use a strong, unique password for your account
              </Text>
              <Text style={styles.tipText}>
                • Enable two-factor authentication for extra security
              </Text>
              <Text style={styles.tipText}>
                • Review your active sessions regularly
              </Text>
              <Text style={styles.tipText}>
                • Never share your password with anyone
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Disable Biometric Dialog */}
      <ConfirmDialog
        visible={showDisableDialog}
        title={`Disable ${getBiometricDisplayName(biometricType)}`}
        message={`You will need to enter your password to sign in. You can re-enable ${getBiometricDisplayName(
          biometricType
        )} at any time.`}
        confirmLabel="Disable"
        destructive
        onConfirm={handleDisableBiometric}
        onCancel={() => setShowDisableDialog(false)}
      />

      {/* Toast */}
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
  },
  section: {
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  optionPressed: {
    backgroundColor: SEMANTIC.background.secondary,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  optionTitleDisabled: {
    color: SEMANTIC.text.tertiary,
  },
  optionDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  optionDescriptionDisabled: {
    color: SEMANTIC.text.tertiary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PRIMARY[50],
    borderRadius: 12,
    padding: spacing[3],
    marginTop: spacing[3],
    gap: spacing[2],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: PRIMARY[800],
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: SEMANTIC.background.elevated,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  tips: {
    gap: spacing[2],
  },
  tipText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
});

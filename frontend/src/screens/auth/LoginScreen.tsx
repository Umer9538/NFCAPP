/**
 * Login Screen
 * User authentication with email/password and biometric options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AuthScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/utils/validationSchemas';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import {
  isBiometricEnabled,
  authenticateWithBiometric,
  checkBiometricAvailability,
  getBiometricIcon,
  getBiometricDisplayName,
  getSecureUserEmail,
  type BiometricType,
} from '@/services/biometricService';

export default function LoginScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { login, logout, isLoading, error, clearError } = useAuth();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Check biometric availability and auto-trigger
  useEffect(() => {
    checkBiometric();
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error]);

  const checkBiometric = async () => {
    try {
      // Check if user has biometric enabled
      const enabled = await isBiometricEnabled();

      if (enabled) {
        // Get availability and biometric type
        const availability = await checkBiometricAvailability();
        setBiometricEnabled(availability.available && availability.enrolled);
        setBiometricType(availability.biometricType);

        // Auto-trigger biometric authentication on first mount
        if (availability.available && availability.enrolled && !autoTriggered) {
          setAutoTriggered(true);
          // Small delay to let UI render first
          setTimeout(() => {
            handleBiometricLogin(true);
          }, 500);
        }

        // Pre-fill email from secure storage
        const email = await getSecureUserEmail();
        if (email) {
          setValue('email', email);
        }
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleBiometricLogin = async (isAutoTrigger: boolean = false) => {
    setBiometricLoading(true);

    try {
      const result = await authenticateWithBiometric('Login to MedGuard');

      if (result.success && result.token) {
        // Get stored email
        const email = await getSecureUserEmail();

        if (email) {
          // Use the stored token to authenticate
          // In a real app, you'd validate this token with your backend
          success('Biometric authentication successful!');

          // Auto-login with stored credentials
          // The useAuth hook should handle token-based login
          // For now, we'll just show success
          // TODO: Implement token-based login in useAuth hook

          // Navigate to main app (this would normally be handled by auth state)
          // navigation.navigate('MainTabs');
        } else {
          showError('No saved credentials found. Please log in with your password.');
        }
      } else if (!isAutoTrigger) {
        // Only show error if user explicitly pressed the button
        // Don't show error on auto-trigger (user might have cancelled)
        if (result.error && !result.error.includes('cancel')) {
          showError(result.error);
        }
      }
    } catch (err: any) {
      if (!isAutoTrigger) {
        showError(err?.message || 'Biometric authentication failed');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password);

      if (response.requiresTwoFactor) {
        navigation.navigate('TwoFactorAuth', {
          email: data.email,
          tempToken: response.token,
        });
      } else {
        // Check if user is suspended
        if (response.user?.suspended) {
          Alert.alert(
            'Account Suspended',
            'Your account has been suspended by your organization administrator. Please contact your administrator for assistance.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await logout();
                },
              },
            ]
          );
          return;
        }

        success('Login successful!');
        // Navigation handled by RootNavigator
      }
    } catch (err: any) {
      showError(err?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="medical" size={64} color={PRIMARY[600]} />
          </View>
          <Text style={[text.h2, styles.title]}>Welcome Back</Text>
          <Text style={[text.bodySmall, styles.subtitle]}>
            Sign in to access your emergency profile
          </Text>
        </View>

        {/* Login Form */}
        <Card variant="elevated" padding="lg">
          <View style={styles.form}>
            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />}
                  required
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={SEMANTIC.text.tertiary} />}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={SEMANTIC.text.tertiary}
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  required
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => onChange(!value)}
                  >
                    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                      {value && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </Pressable>
                )}
              />

              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Button
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.loginButton}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Biometric Login */}
            {biometricEnabled && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => handleBiometricLogin(false)}
                  loading={biometricLoading}
                  disabled={biometricLoading || isLoading}
                  icon={
                    <Ionicons
                      name={getBiometricIcon(biometricType) as any}
                      size={20}
                      color={PRIMARY[600]}
                    />
                  }
                >
                  {biometricLoading
                    ? 'Authenticating...'
                    : `Sign in with ${getBiometricDisplayName(biometricType)}`}
                </Button>
              </>
            )}
          </View>
        </Card>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('AccountType')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {isLoading && <LoadingSpinner visible overlay />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing[4],
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -spacing[2],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    borderRadius: 4,
    marginRight: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  forgotPassword: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing[2],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SEMANTIC.border.default,
  },
  dividerText: {
    marginHorizontal: spacing[3],
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  signupText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  signupLink: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
});

/**
 * Login Screen
 * User authentication with email/password and biometric options
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AuthScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
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
  const {
    signInWithGoogle,
    isLoading: googleLoading,
    error: googleError,
    isReady: googleReady,
  } = useGoogleAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Inline error state for better UX
  const [loginError, setLoginError] = useState<{
    type: 'none' | 'not_found' | 'wrong_password' | 'not_verified' | 'locked' | 'general';
    message: string;
    userId?: string;
  }>({ type: 'none', message: '' });

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Run entrance animations
  useEffect(() => {
    const animationSequence = Animated.stagger(150, [
      // Logo animation - scale and fade
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Header text animation
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Form card animation
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(formTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Footer animation
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, []);

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

  // Show Google error toast
  useEffect(() => {
    if (googleError) {
      showError(googleError);
    }
  }, [googleError]);

  /**
   * Handle Google sign-in
   */
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        // New user - needs to complete signup
        if (result.needsSignup && result.googleData) {
          success('Please complete your registration');
          // Navigate to signup with Google data pre-filled
          navigation.navigate('Signup', {
            googleOAuth: result.googleData,
          });
          return;
        }

        // Existing user - logged in
        if (result.requiresProfileSetup) {
          success('Signed in with Google! Please complete your profile.');
        } else {
          success('Signed in with Google!');
        }
        // Navigation is handled by RootNavigator based on auth state
      } else if (result.error && !result.error.includes('cancelled')) {
        showError(result.error);
      }
    } catch (err: any) {
      showError(err?.message || 'Google sign-in failed. Please try again.');
    }
  };

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
    // Clear previous errors
    setLoginError({ type: 'none', message: '' });

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
          setLoginError({
            type: 'locked',
            message: 'Your account has been suspended. Please contact your administrator.',
          });
          await logout();
          return;
        }

        success('Login successful!');
        // Navigation handled by RootNavigator
      }
    } catch (err: any) {
      const errorMessage = err?.message?.toLowerCase() || '';

      // Check specific error types for inline display
      if (err?.requiresEmailVerification && err?.userId) {
        setLoginError({
          type: 'not_verified',
          message: 'Please verify your email first.',
          userId: err.userId,
        });
      } else if (errorMessage.includes('not found') || errorMessage.includes('no account') || errorMessage.includes('user not found')) {
        setLoginError({
          type: 'not_found',
          message: 'No account with this email exists.',
        });
      } else if (errorMessage.includes('password') || errorMessage.includes('incorrect') || errorMessage.includes('invalid credentials')) {
        setLoginError({
          type: 'wrong_password',
          message: 'Incorrect password, please try again.',
        });
      } else if (errorMessage.includes('locked') || errorMessage.includes('too many attempts')) {
        setLoginError({
          type: 'locked',
          message: 'Account locked due to too many failed attempts. Please try again later.',
        });
      } else {
        setLoginError({
          type: 'general',
          message: err?.message || 'Unable to sign in. Please check your credentials and try again.',
        });
      }
    }
  };

  // Handle resend verification email
  const handleResendVerification = () => {
    if (loginError.userId) {
      const email = control._formValues.email;
      navigation.navigate('VerifyEmail', {
        email: email,
        userId: loginError.userId,
      });
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
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Ionicons name="medical" size={64} color={PRIMARY[600]} />
          </Animated.View>
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <Text style={[text.h2, styles.title]}>Welcome Back</Text>
            <Text style={[text.bodySmall, styles.subtitle]}>
              Sign in to access your emergency profile
            </Text>
          </Animated.View>
        </View>

        {/* Login Form */}
        <Animated.View
          style={{
            opacity: formOpacity,
            transform: [{ translateY: formTranslateY }],
          }}
        >
        <Card variant="elevated" padding="lg">
          <View style={styles.form}>
            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <Button
                variant="outline"
                fullWidth
                onPress={handleGoogleSignIn}
                loading={googleLoading}
                disabled={!googleReady || googleLoading || isLoading}
                icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
                style={styles.socialButton}
              >
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onPress={() => showError('Apple Sign-In coming soon')}
                icon={<Ionicons name="logo-apple" size={20} color="#000000" />}
                style={styles.socialButton}
              >
                Continue with Apple
              </Button>
            </View>

            {/* Divider - or sign in with email */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Inline Error Message */}
            {loginError.type !== 'none' && (
              <View style={[
                styles.errorContainer,
                loginError.type === 'not_verified' && styles.errorContainerWarning
              ]}>
                <Ionicons
                  name={loginError.type === 'not_verified' ? 'warning' : 'alert-circle'}
                  size={20}
                  color={loginError.type === 'not_verified' ? '#F59E0B' : '#DC2626'}
                />
                <View style={styles.errorTextContainer}>
                  <Text style={[
                    styles.errorText,
                    loginError.type === 'not_verified' && styles.errorTextWarning
                  ]}>
                    {loginError.message}
                  </Text>
                  {loginError.type === 'not_verified' && (
                    <Pressable onPress={handleResendVerification}>
                      <Text style={styles.resendLink}>Verify email now →</Text>
                    </Pressable>
                  )}
                  {loginError.type === 'not_found' && (
                    <Pressable onPress={() => navigation.navigate('AccountType')}>
                      <Text style={styles.resendLink}>Create an account →</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    if (loginError.type !== 'none') setLoginError({ type: 'none', message: '' });
                  }}
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
                  onChangeText={(text) => {
                    onChange(text);
                    if (loginError.type !== 'none') setLoginError({ type: 'none', message: '' });
                  }}
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
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View style={[styles.signupContainer, { opacity: footerOpacity }]}>
          <Text style={styles.signupText}>{"Don't have an account? "}</Text>
          <Pressable onPress={() => navigation.navigate('AccountType')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </Animated.View>
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
  socialButtonsContainer: {
    gap: spacing[3],
  },
  socialButton: {
    backgroundColor: SEMANTIC.background.default,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: spacing[3],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorContainerWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  errorTextContainer: {
    flex: 1,
    gap: spacing[1],
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  errorTextWarning: {
    color: '#B45309',
  },
  resendLink: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
    marginTop: spacing[1],
  },
});

/**
 * Signup Screen
 * User registration with password strength indicator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  User,
  Building2,
  HardHat,
  GraduationCap,
} from 'lucide-react-native';
import type { AuthScreenNavigationProp, AuthScreenRouteProp } from '@/navigation/types';
import { getDashboardConfig, type AccountType } from '@/config/dashboardConfig';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';
import { checkEmailAvailability } from '@/api/auth';
import * as WebBrowser from 'expo-web-browser';
import { signupSchema, type SignupFormData, calculatePasswordStrength, type PasswordStrengthResult } from '@/utils/validationSchemas';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function SignupScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const route = useRoute<AuthScreenRouteProp<'Signup'>>();
  const { signup, isLoading, error, clearError } = useAuth();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const {
    signInWithGoogle,
    completeGoogleSignup,
    isLoading: googleLoading,
    error: googleError,
    isReady: googleReady,
  } = useGoogleAuth();

  const {
    signInWithApple,
    completeAppleSignup,
    isLoading: appleLoading,
    error: appleError,
    isAvailable: appleAvailable,
  } = useAppleAuth();

  // Get account type and OAuth data from route params
  const accountType = route.params?.accountType || 'individual';
  const googleOAuth = route.params?.googleOAuth;
  const appleOAuth = route.params?.appleOAuth;
  const isGoogleSignup = !!googleOAuth;
  const isAppleSignup = !!appleOAuth;
  const isOAuthSignup = isGoogleSignup || isAppleSignup;
  const dashboardConfig = getDashboardConfig(accountType);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);

  // Email validation state
  const [emailStatus, setEmailStatus] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid' | 'taken';
    message?: string;
  }>({ status: 'idle' });
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Password match state for real-time validation
  const [passwordMatchStatus, setPasswordMatchStatus] = useState<{
    status: 'idle' | 'match' | 'mismatch';
    message?: string;
  }>({ status: 'idle' });

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
    const animationSequence = Animated.stagger(100, [
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
    watch,
    setValue,
  // Parse Apple fullName into first/last name
  const appleFirstName = appleOAuth?.fullName?.split(' ')[0] || '';
  const appleLastName = appleOAuth?.fullName?.split(' ').slice(1).join(' ') || '';

  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: googleOAuth?.firstName || appleFirstName || '',
      lastName: googleOAuth?.lastName || appleLastName || '',
      email: googleOAuth?.email || appleOAuth?.email || '',
      password: isOAuthSignup ? 'OAuthPlaceholder123!' : '', // Placeholder for OAuth signup (not used)
      confirmPassword: isOAuthSignup ? 'OAuthPlaceholder123!' : '', // Placeholder for OAuth signup (not used)
      phoneNumber: '',
      acceptTerms: false,
    },
  });

  // Username state for Google signup
  const [username, setUsername] = useState('');

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Calculate password strength as user types
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Real-time password match validation
  useEffect(() => {
    if (!confirmPassword || confirmPassword.length === 0) {
      setPasswordMatchStatus({ status: 'idle' });
      return;
    }

    if (!password || password.length === 0) {
      setPasswordMatchStatus({ status: 'idle' });
      return;
    }

    if (password === confirmPassword) {
      setPasswordMatchStatus({ status: 'match', message: 'Passwords match' });
    } else {
      setPasswordMatchStatus({ status: 'mismatch', message: 'Passwords do not match' });
    }
  }, [password, confirmPassword]);

  // Email format validation regex
  const isValidEmailFormat = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Check email availability (debounced, on blur)
  const checkEmail = useCallback(async (email: string) => {
    // Clear any pending timeout
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // Reset if empty
    if (!email || email.trim() === '') {
      setEmailStatus({ status: 'idle' });
      return;
    }

    // Check format first
    if (!isValidEmailFormat(email)) {
      setEmailStatus({ status: 'invalid', message: 'Invalid email format' });
      return;
    }

    // Set checking status
    setEmailStatus({ status: 'checking' });

    try {
      const result = await checkEmailAvailability(email);
      if (result.available) {
        setEmailStatus({ status: 'valid', message: 'Email is available' });
      } else {
        setEmailStatus({ status: 'taken', message: 'Email is already registered' });
      }
    } catch {
      // If API fails, just validate format
      setEmailStatus({ status: 'valid', message: 'Email format is valid' });
    }
  }, [isValidEmailFormat]);

  // Real-time email format validation as user types
  const handleEmailChange = useCallback((email: string, onChange: (value: string) => void) => {
    onChange(email);

    // Clear any pending check
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    if (!email || email.trim() === '') {
      setEmailStatus({ status: 'idle' });
      return;
    }

    // Check format as user types (debounced)
    emailCheckTimeoutRef.current = setTimeout(() => {
      if (!isValidEmailFormat(email)) {
        setEmailStatus({ status: 'invalid', message: 'Invalid email format' });
      } else {
        // Valid format, but don't check availability until blur
        setEmailStatus({ status: 'idle' });
      }
    }, 500);
  }, [isValidEmailFormat]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
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

  // Show Apple error toast
  useEffect(() => {
    if (appleError) {
      showError(appleError);
    }
  }, [appleError]);

  /**
   * Handle Google sign-up button click
   */
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        // New user - stay on this page with pre-filled data
        if (result.needsSignup && result.googleData) {
          // Re-navigate to this screen with Google data
          navigation.setParams({ googleOAuth: result.googleData });
          // Pre-fill the form fields
          setValue('firstName', result.googleData.firstName || '');
          setValue('lastName', result.googleData.lastName || '');
          setValue('email', result.googleData.email);
          success('Please enter a username to complete your registration');
          return;
        }

        // Existing user logged in
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
      showError(err?.message || 'Google sign-up failed. Please try again.');
    }
  };

  /**
   * Handle Apple sign-up button click
   */
  const handleAppleSignUp = async () => {
    try {
      const result = await signInWithApple();

      if (result.success) {
        // New user - stay on this page with pre-filled data
        if (result.needsSignup && result.appleData) {
          // Re-navigate to this screen with Apple data
          navigation.setParams({ appleOAuth: result.appleData });
          // Pre-fill the form fields
          const nameParts = (result.appleData.fullName || '').split(' ');
          setValue('firstName', nameParts[0] || '');
          setValue('lastName', nameParts.slice(1).join(' ') || '');
          setValue('email', result.appleData.email);
          success('Please enter a username to complete your registration');
          return;
        }

        // Existing user logged in
        if (result.requiresProfileSetup) {
          success('Signed in with Apple! Please complete your profile.');
        } else {
          success('Signed in with Apple!');
        }
        // Navigation is handled by RootNavigator based on auth state
      } else if (result.error && !result.error.includes('cancelled')) {
        showError(result.error);
      }
    } catch (err: any) {
      showError(err?.message || 'Apple sign-up failed. Please try again.');
    }
  };

  /**
   * Handle Google signup completion (when user enters username)
   */
  const handleCompleteGoogleSignup = async () => {
    if (!googleOAuth) return;

    if (!username || username.trim().length < 3) {
      showError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showError('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      const result = await completeGoogleSignup({
        fullName: `${googleOAuth.firstName} ${googleOAuth.lastName}`.trim() || googleOAuth.fullName,
        username: username.trim(),
        email: googleOAuth.email,
        googleId: googleOAuth.googleId,
        idToken: googleOAuth.idToken,
        accessToken: googleOAuth.accessToken,
        accountType: accountType.toUpperCase() as 'INDIVIDUAL' | 'CORPORATE' | 'CONSTRUCTION' | 'EDUCATION',
      });

      if (result.success) {
        success('Account created successfully!');
        // Navigation is handled by RootNavigator based on auth state
      } else {
        showError(result.error || 'Failed to create account');
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to complete signup');
    }
  };

  /**
   * Handle Apple signup completion (when user enters username)
   */
  const handleCompleteAppleSignup = async () => {
    if (!appleOAuth) return;

    if (!username || username.trim().length < 3) {
      showError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showError('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      const result = await completeAppleSignup({
        fullName: appleOAuth.fullName || `${appleFirstName} ${appleLastName}`.trim(),
        username: username.trim(),
        email: appleOAuth.email,
        appleId: appleOAuth.appleId,
        identityToken: appleOAuth.identityToken,
        accountType: accountType.toUpperCase() as 'INDIVIDUAL' | 'CORPORATE' | 'CONSTRUCTION' | 'EDUCATION',
      });

      if (result.success) {
        success('Account created successfully!');
        // Navigation is handled by RootNavigator based on auth state
      } else {
        showError(result.error || 'Failed to create account');
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to complete signup');
    }
  };

  /**
   * Handle OAuth signup completion (Google or Apple)
   */
  const handleCompleteOAuthSignup = () => {
    if (isGoogleSignup) {
      handleCompleteGoogleSignup();
    } else if (isAppleSignup) {
      handleCompleteAppleSignup();
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        accountType: accountType,
      });

      success('Account created! Please verify your email.');

      // Navigate to email verification with userId for profile setup later
      navigation.navigate('VerifyEmail', {
        email: data.email,
        userId: response.user?.id,
      });
    } catch (err: any) {
      // The authStore already provides human-readable messages
      showError(err?.message || 'Unable to create account. Please try again.');
    }
  };

  // Open Terms of Service in browser
  const openTermsOfService = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync('https://medguard.app/terms-of-service', {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: PRIMARY[600],
      });
    } catch {
      // Fallback to navigation if browser fails
      navigation.navigate('TermsOfService');
    }
  }, [navigation]);

  // Open Privacy Policy in browser
  const openPrivacyPolicy = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync('https://medguard.app/privacy-policy', {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: PRIMARY[600],
      });
    } catch {
      // Fallback to navigation if browser fails
      navigation.navigate('PrivacyPolicy');
    }
  }, [navigation]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return STATUS.error; // Red
      case 'medium':
        return STATUS.warning; // Yellow/Orange
      case 'strong':
        return STATUS.success; // Green
      default:
        return SEMANTIC.border.default;
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  // Get account type icon
  const getAccountTypeIcon = (type: AccountType) => {
    const iconProps = { size: 20, color: dashboardConfig.themeColors.primary };
    switch (type) {
      case 'corporate':
        return <Building2 {...iconProps} />;
      case 'construction':
        return <HardHat {...iconProps} />;
      case 'education':
        return <GraduationCap {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  // Handle change account type
  const handleChangeAccountType = () => {
    navigation.navigate('AccountType');
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
              { backgroundColor: `${dashboardConfig.themeColors.primary}15` },
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Ionicons name="medical" size={64} color={dashboardConfig.themeColors.primary} />
          </Animated.View>
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }}
          >
            <Text style={[text.h2, styles.title]}>Create Account</Text>
            <Text style={[text.bodySmall, styles.subtitle]}>
              Join MedGuard to protect your medical information
            </Text>
          </Animated.View>
        </View>

        {/* Signup Form */}
        <Animated.View
          style={{
            opacity: formOpacity,
            transform: [{ translateY: formTranslateY }],
          }}
        >
        <Card variant="elevated" padding="lg">
          <View style={styles.form}>
            {/* Account Type Badge */}
            <View style={[styles.accountTypeCard, { borderColor: `${dashboardConfig.themeColors.primary}30` }]}>
              <View style={styles.accountTypeCardLeft}>
                <View style={[styles.accountTypeIconContainer, { backgroundColor: `${dashboardConfig.themeColors.primary}15` }]}>
                  {getAccountTypeIcon(accountType)}
                </View>
                <View style={styles.accountTypeInfo}>
                  <Text style={styles.accountTypeLabel}>Account Type</Text>
                  <Text style={[styles.accountTypeName, { color: dashboardConfig.themeColors.primary }]}>
                    {dashboardConfig.displayName}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleChangeAccountType} style={styles.changeButton}>
                <Text style={[styles.changeButtonText, { color: dashboardConfig.themeColors.primary }]}>
                  Change
                </Text>
              </Pressable>
            </View>

            {/* OAuth Banner (when signing up with Google or Apple) */}
            {isOAuthSignup && (
              <View style={[styles.googleBanner, { backgroundColor: `${dashboardConfig.themeColors.primary}10` }]}>
                <Ionicons
                  name={isGoogleSignup ? "logo-google" : "logo-apple"}
                  size={24}
                  color={isGoogleSignup ? "#DB4437" : "#000000"}
                />
                <View style={styles.googleBannerText}>
                  <Text style={styles.googleBannerTitle}>
                    Signing up with {isGoogleSignup ? 'Google' : 'Apple'}
                  </Text>
                  <Text style={styles.googleBannerEmail}>
                    {googleOAuth?.email || appleOAuth?.email}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={STATUS.success} />
              </View>
            )}

            {/* Social Sign Up Buttons - Only show when NOT in OAuth signup mode */}
            {!isOAuthSignup && (
              <>
                <View style={styles.socialButtonsContainer}>
                  <Button
                    variant="outline"
                    fullWidth
                    onPress={handleGoogleSignUp}
                    loading={googleLoading}
                    disabled={!googleReady || googleLoading || isLoading}
                    icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
                    style={styles.socialButton}
                  >
                    {googleLoading ? 'Signing up...' : 'Continue with Google'}
                  </Button>
                  {appleAvailable && (
                    <Button
                      variant="outline"
                      fullWidth
                      onPress={handleAppleSignUp}
                      loading={appleLoading}
                      disabled={appleLoading || isLoading}
                      icon={<Ionicons name="logo-apple" size={20} color="#000000" />}
                      style={styles.socialButton}
                    >
                      {appleLoading ? 'Signing up...' : 'Continue with Apple'}
                    </Button>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign up with email</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {/* Name Row */}
            <View style={styles.nameRow}>
              {/* First Name */}
              <View style={styles.nameInput}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.firstName?.message}
                      autoCapitalize="words"
                      leftIcon={<Ionicons name="person-outline" size={20} color={SEMANTIC.text.tertiary} />}
                      required
                    />
                  )}
                />
              </View>

              {/* Last Name */}
              <View style={styles.nameInput}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.lastName?.message}
                      autoCapitalize="words"
                      required
                    />
                  )}
                />
              </View>
            </View>

            {/* Username Input (Only for Google signup) */}
            {isGoogleSignup && (
              <Input
                label="Username"
                placeholder="johndoe"
                value={username}
                onChangeText={setUsername}
                error={username.length > 0 && username.length < 3 ? 'Username must be at least 3 characters' : undefined}
                autoCapitalize="none"
                autoComplete="username"
                leftIcon={<Ionicons name="at-outline" size={20} color={SEMANTIC.text.tertiary} />}
                rightIcon={
                  username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username) ? (
                    <Ionicons name="checkmark-circle" size={20} color={STATUS.success} />
                  ) : null
                }
                required
              />
            )}

            {/* Email Input with Real-time Validation */}
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="john.doe@example.com"
                    value={value}
                    onChangeText={isGoogleSignup ? undefined : (text) => handleEmailChange(text, onChange)}
                    onBlur={isGoogleSignup ? undefined : () => {
                      onBlur();
                      checkEmail(value);
                    }}
                    error={errors.email?.message || (emailStatus.status === 'taken' ? emailStatus.message : undefined)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isGoogleSignup}
                    leftIcon={<Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />}
                    rightIcon={
                      isGoogleSignup ? (
                        <Ionicons name="lock-closed" size={20} color={SEMANTIC.text.tertiary} />
                      ) : emailStatus.status === 'checking' ? (
                        <ActivityIndicator size="small" color={PRIMARY[600]} />
                      ) : emailStatus.status === 'valid' ? (
                        <Ionicons name="checkmark-circle" size={20} color={STATUS.success} />
                      ) : emailStatus.status === 'taken' ? (
                        <Ionicons name="close-circle" size={20} color={STATUS.error} />
                      ) : emailStatus.status === 'invalid' ? (
                        <Ionicons name="alert-circle" size={20} color={STATUS.error} />
                      ) : null
                    }
                    required
                  />
                )}
              />
              {/* Email Status Message */}
              {!isGoogleSignup && emailStatus.status === 'valid' && emailStatus.message && (
                <View style={styles.emailStatusContainer}>
                  <Ionicons name="checkmark-circle" size={14} color={STATUS.success} />
                  <Text style={styles.emailStatusValid}>{emailStatus.message}</Text>
                </View>
              )}
              {!isGoogleSignup && emailStatus.status === 'invalid' && emailStatus.message && !errors.email?.message && (
                <View style={styles.emailStatusContainer}>
                  <Ionicons name="alert-circle" size={14} color={STATUS.error} />
                  <Text style={styles.emailStatusInvalid}>{emailStatus.message}</Text>
                </View>
              )}
            </View>

            {/* Phone Number Input (Optional) */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  leftIcon={<Ionicons name="call-outline" size={20} color={SEMANTIC.text.tertiary} />}
                />
              )}
            />

            {/* Password Input - Hidden for Google signup */}
            {!isGoogleSignup && (
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
            )}

            {/* Password Strength Indicator - Hidden for Google signup */}
            {!isGoogleSignup && passwordStrength && (
              <View style={styles.strengthContainer}>
                {/* Strength Bar */}
                <View style={styles.strengthBarContainer}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${passwordStrength.percentage}%`,
                          backgroundColor: getStrengthColor(passwordStrength.strength),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: getStrengthColor(passwordStrength.strength) },
                    ]}
                  >
                    {getStrengthLabel(passwordStrength.strength)}
                  </Text>
                </View>

                {/* Requirements Checklist */}
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password must have:</Text>
                  <View style={styles.requirementsList}>
                    {passwordStrength.requirements.map((req) => (
                      <View key={req.id} style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementIcon,
                            req.met ? styles.requirementMet : styles.requirementUnmet,
                          ]}
                        >
                          <Ionicons
                            name={req.met ? 'checkmark' : 'close'}
                            size={12}
                            color={req.met ? '#ffffff' : SEMANTIC.text.tertiary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            req.met && styles.requirementTextMet,
                          ]}
                        >
                          {req.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Confirm Password Input with Real-time Match Validation - Hidden for Google signup */}
            {!isGoogleSignup && (
            <View>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message || (passwordMatchStatus.status === 'mismatch' && value.length > 0 ? passwordMatchStatus.message : undefined)}
                    secureTextEntry={!showConfirmPassword}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={SEMANTIC.text.tertiary} />}
                    rightIcon={
                      <View style={styles.confirmPasswordIcons}>
                        {/* Match Status Icon */}
                        {passwordMatchStatus.status === 'match' && (
                          <Ionicons name="checkmark-circle" size={20} color={STATUS.success} style={styles.matchIcon} />
                        )}
                        {passwordMatchStatus.status === 'mismatch' && value.length > 0 && (
                          <Ionicons name="close-circle" size={20} color={STATUS.error} style={styles.matchIcon} />
                        )}
                        {/* Show/Hide Password Icon */}
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={SEMANTIC.text.tertiary}
                          />
                        </Pressable>
                      </View>
                    }
                    required
                  />
                )}
              />
              {/* Password Match Status Message */}
              {passwordMatchStatus.status === 'match' && (
                <View style={styles.passwordMatchContainer}>
                  <Ionicons name="checkmark-circle" size={14} color={STATUS.success} />
                  <Text style={styles.passwordMatchValid}>{passwordMatchStatus.message}</Text>
                </View>
              )}
            </View>
            )}

            {/* Terms and Conditions */}
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Pressable
                    style={styles.termsContainer}
                    onPress={() => onChange(!value)}
                  >
                    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                      {value && (
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      )}
                    </View>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={(e) => {
                          e.stopPropagation();
                          openTermsOfService();
                        }}
                      >
                        Terms of Service
                      </Text>
                      {' '}and{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={(e) => {
                          e.stopPropagation();
                          openPrivacyPolicy();
                        }}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </Pressable>
                  {errors.acceptTerms && (
                    <Text style={styles.termsError}>{errors.acceptTerms.message}</Text>
                  )}
                </View>
              )}
            />

            {/* Signup Button */}
            <Button
              fullWidth
              onPress={isOAuthSignup ? handleCompleteOAuthSignup : handleSubmit(onSubmit)}
              loading={isLoading || googleLoading}
              disabled={isGoogleSignup ? (!username || username.length < 3) : false}
              style={styles.signupButton}
            >
              {isLoading || googleLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </View>
        </Card>
        </Animated.View>

        {/* Login Link */}
        <Animated.View style={[styles.loginContainer, { opacity: footerOpacity }]}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
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
  accountTypeBadge: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
  },
  accountTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing[2],
  },
  accountTypeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  accountTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTypeInfo: {
    gap: 2,
  },
  accountTypeLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  accountTypeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: spacing[4],
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  nameInput: {
    flex: 1,
  },
  emailStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
    paddingHorizontal: spacing[1],
  },
  emailStatusValid: {
    fontSize: 12,
    color: STATUS.success,
    fontWeight: '500',
  },
  emailStatusInvalid: {
    fontSize: 12,
    color: STATUS.error,
    fontWeight: '500',
  },
  confirmPasswordIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  matchIcon: {
    marginRight: spacing[1],
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
    paddingHorizontal: spacing[1],
  },
  passwordMatchValid: {
    fontSize: 12,
    color: STATUS.success,
    fontWeight: '500',
  },
  strengthContainer: {
    marginTop: -spacing[2],
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: spacing[3],
  },
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: SEMANTIC.border.default,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  requirementsContainer: {
    gap: spacing[2],
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[1],
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: '45%',
  },
  requirementIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementMet: {
    backgroundColor: STATUS.success,
  },
  requirementUnmet: {
    backgroundColor: SEMANTIC.border.default,
  },
  requirementText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  requirementTextMet: {
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    borderRadius: 4,
    marginRight: spacing[2],
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: SEMANTIC.text.primary,
    lineHeight: 20,
  },
  termsLink: {
    color: PRIMARY[600],
    fontWeight: '600',
  },
  termsError: {
    fontSize: 12,
    color: STATUS.error,
    marginTop: spacing[1],
    marginLeft: spacing[7],
  },
  signupButton: {
    marginTop: spacing[2],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  loginText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  loginLink: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[2],
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
  googleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  googleBannerText: {
    flex: 1,
  },
  googleBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  googleBannerEmail: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
});

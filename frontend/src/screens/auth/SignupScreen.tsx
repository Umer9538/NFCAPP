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

  // Get account type from route params (defaults to 'individual')
  const accountType = route.params?.accountType || 'individual';
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
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      acceptTerms: false,
    },
  });

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
                    onChangeText={(text) => handleEmailChange(text, onChange)}
                    onBlur={() => {
                      onBlur();
                      checkEmail(value);
                    }}
                    error={errors.email?.message || (emailStatus.status === 'taken' ? emailStatus.message : undefined)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon={<Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />}
                    rightIcon={
                      emailStatus.status === 'checking' ? (
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
              {emailStatus.status === 'valid' && emailStatus.message && (
                <View style={styles.emailStatusContainer}>
                  <Ionicons name="checkmark-circle" size={14} color={STATUS.success} />
                  <Text style={styles.emailStatusValid}>{emailStatus.message}</Text>
                </View>
              )}
              {emailStatus.status === 'invalid' && emailStatus.message && !errors.email?.message && (
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

            {/* Password Strength Indicator */}
            {passwordStrength && (
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

            {/* Confirm Password Input with Real-time Match Validation */}
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
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.signupButton}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
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
});

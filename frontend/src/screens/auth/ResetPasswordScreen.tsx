/**
 * Reset Password Screen
 * Token-based password reset via email link
 * URL: /reset-password?token=xyz123 or /reset-password/:token
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
  Animated,
  Easing,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import type { AuthScreenNavigationProp, AuthStackParamList } from '@/navigation/types';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, GRAY, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { api } from '@/api/client';
import { calculatePasswordStrength, type PasswordStrengthResult } from '@/utils/validationSchemas';

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

// Password schema with validation
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least 1 number')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least 1 special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type TokenStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'used';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const token = route.params?.token;

  // Token validation state
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [tokenEmail, setTokenEmail] = useState<string>('');

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  // Run entrance animations
  useEffect(() => {
    const animationSequence = Animated.stagger(100, [
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
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
    ]);

    animationSequence.start();
  }, [tokenStatus, isSuccess]);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      return;
    }
    validateToken();
  }, [token]);

  // Countdown timer for redirect
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigation.navigate('Login');
    }
  }, [isSuccess, countdown]);

  // Validate reset token
  const validateToken = async () => {
    try {
      const response = await api.post<{
        valid: boolean;
        email?: string;
        expired?: boolean;
        used?: boolean;
      }>('/api/auth/validate-reset-token', { token });

      if (response.valid && response.email) {
        setTokenStatus('valid');
        setTokenEmail(response.email);
      } else if (response.expired) {
        setTokenStatus('expired');
      } else if (response.used) {
        setTokenStatus('used');
      } else {
        setTokenStatus('invalid');
      }
    } catch (error: any) {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('expired')) {
        setTokenStatus('expired');
      } else if (msg.includes('used') || msg.includes('already')) {
        setTokenStatus('used');
      } else {
        setTokenStatus('invalid');
      }
    }
  };

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      api.post('/api/auth/reset-password-token', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      setIsSuccess(true);
      success('Password updated successfully!');
    },
    onError: (error: any) => {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('expired')) {
        setTokenStatus('expired');
        showError('This reset link has expired. Please request a new one.');
      } else if (msg.includes('used') || msg.includes('already')) {
        setTokenStatus('used');
        showError('This reset link has already been used.');
      } else if (msg.includes('same') || msg.includes('previous')) {
        showError('Please choose a different password than your previous one.');
      } else if (msg.includes('weak')) {
        showError('Password is too weak. Please use a stronger password.');
      } else {
        showError('Unable to reset password. Please try again.');
      }
    },
  });

  // Handle form submit
  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  // Render invalid/expired token screen
  const renderTokenError = () => {
    const isExpired = tokenStatus === 'expired';
    const isUsed = tokenStatus === 'used';

    return (
      <View style={styles.errorContent}>
        <Animated.View
          style={[
            styles.iconContainer,
            styles.iconContainerError,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Ionicons
            name={isExpired ? 'time-outline' : isUsed ? 'checkmark-done' : 'close-circle-outline'}
            size={64}
            color={isExpired ? STATUS.warning.main : STATUS.error.main}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={[text.h2, styles.title]}>
            {isExpired
              ? 'Link Expired'
              : isUsed
              ? 'Link Already Used'
              : 'Invalid Link'}
          </Text>
          <Text style={[text.bodySmall, styles.subtitle]}>
            {isExpired
              ? 'This password reset link has expired. Reset links are valid for 15 minutes.'
              : isUsed
              ? 'This password reset link has already been used. Each link can only be used once.'
              : 'This password reset link is invalid or has been corrupted.'}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: formOpacity,
            transform: [{ translateY: formTranslateY }],
            width: '100%',
          }}
        >
          <Button
            fullWidth
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.actionButton}
          >
            Request New Reset Link
          </Button>

          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={20} color={PRIMARY[600]} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  // Render success screen
  const renderSuccess = () => (
    <View style={styles.successContent}>
      <Animated.View
        style={[
          styles.iconContainer,
          styles.iconContainerSuccess,
          {
            opacity: iconOpacity,
            transform: [{ scale: iconScale }],
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={64} color={STATUS.success.main} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
          alignItems: 'center',
        }}
      >
        <Text style={[text.h2, styles.title]}>Password Updated!</Text>
        <Text style={[text.bodySmall, styles.subtitle]}>
          Your password has been successfully reset. You can now sign in with your new password.
        </Text>
        <Text style={styles.countdownText}>
          Redirecting to login in {countdown}...
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: formOpacity,
          transform: [{ translateY: formTranslateY }],
          width: '100%',
        }}
      >
        <Button
          fullWidth
          onPress={() => navigation.navigate('Login')}
          style={styles.actionButton}
        >
          Sign In Now
        </Button>
      </Animated.View>
    </View>
  );

  // Render loading state
  if (tokenStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible />
          <Text style={styles.loadingText}>Validating reset link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render token error states
  if (tokenStatus === 'invalid' || tokenStatus === 'expired' || tokenStatus === 'used') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderTokenError()}
        </ScrollView>
        <Toast {...toastConfig} onDismiss={hideToast} />
      </SafeAreaView>
    );
  }

  // Render success state
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSuccess()}
        </ScrollView>
        <Toast {...toastConfig} onDismiss={hideToast} />
      </SafeAreaView>
    );
  }

  // Render password reset form
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
                styles.iconContainer,
                {
                  opacity: iconOpacity,
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Ionicons name="lock-closed" size={64} color={PRIMARY[600]} />
            </Animated.View>
            <Animated.View
              style={{
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
                alignItems: 'center',
              }}
            >
              <Text style={[text.h2, styles.title]}>Create New Password</Text>
              <Text style={[text.bodySmall, styles.subtitle]}>
                Enter a new password for {tokenEmail}
              </Text>
            </Animated.View>
          </View>

          {/* Password Form */}
          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            <Card variant="elevated" padding="lg">
              <View style={styles.form}>
                {/* New Password */}
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="New Password"
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        if (text.length > 0) {
                          setPasswordStrength(calculatePasswordStrength(text));
                        } else {
                          setPasswordStrength(null);
                        }
                      }}
                      onBlur={onBlur}
                      error={errors.newPassword?.message}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoFocus
                      leftIcon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={SEMANTIC.text.tertiary}
                        />
                      }
                      rightIcon={
                        <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                          <Ionicons
                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={SEMANTIC.text.tertiary}
                          />
                        </Pressable>
                      }
                      required
                    />
                  )}
                />

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <View style={styles.strengthContainer}>
                    {/* Strength Bar */}
                    <View style={styles.strengthBarContainer}>
                      <View
                        style={[
                          styles.strengthBar,
                          {
                            width: `${passwordStrength.percentage}%`,
                            backgroundColor:
                              passwordStrength.strength === 'weak'
                                ? STATUS.error.main
                                : passwordStrength.strength === 'medium'
                                ? STATUS.warning.main
                                : STATUS.success.main,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.strengthLabel,
                        {
                          color:
                            passwordStrength.strength === 'weak'
                              ? STATUS.error.main
                              : passwordStrength.strength === 'medium'
                              ? STATUS.warning.main
                              : STATUS.success.main,
                        },
                      ]}
                    >
                      {passwordStrength.strength.charAt(0).toUpperCase() +
                        passwordStrength.strength.slice(1)}
                    </Text>

                    {/* Requirements Checklist */}
                    <View style={styles.requirementsList}>
                      {passwordStrength.requirements.map((req) => (
                        <View key={req.id} style={styles.requirementItem}>
                          <Ionicons
                            name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                            size={16}
                            color={req.met ? STATUS.success.main : GRAY[400]}
                          />
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
                )}

                {/* Confirm Password */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      leftIcon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color={SEMANTIC.text.tertiary}
                        />
                      }
                      rightIcon={
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={SEMANTIC.text.tertiary}
                          />
                        </Pressable>
                      }
                      required
                    />
                  )}
                />

                <Button
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  loading={resetPasswordMutation.isPending}
                  style={styles.submitButton}
                >
                  Reset Password
                </Button>

                <Pressable
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Ionicons name="arrow-back" size={20} color={PRIMARY[600]} />
                  <Text style={styles.backText}>Back to Sign In</Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={SEMANTIC.text.tertiary}
            />
            <Text style={styles.helpText}>
              Choose a password you have not used before. Your password should be unique to this account.
            </Text>
          </View>
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {resetPasswordMutation.isPending && <LoadingSpinner visible overlay />}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  loadingText: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  iconContainerError: {
    backgroundColor: STATUS.error.light,
  },
  iconContainerSuccess: {
    backgroundColor: STATUS.success.light,
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  form: {
    gap: spacing[4],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  actionButton: {
    marginTop: spacing[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  backText: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  // Password Strength Indicator
  strengthContainer: {
    gap: spacing[2],
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: GRAY[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirementsList: {
    gap: spacing[1],
    marginTop: spacing[1],
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  requirementText: {
    fontSize: 13,
    color: GRAY[500],
  },
  requirementTextMet: {
    color: SEMANTIC.text.primary,
  },
  // Error/Success content
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  countdownText: {
    marginTop: spacing[4],
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
  },
  // Help
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    lineHeight: 18,
  },
});

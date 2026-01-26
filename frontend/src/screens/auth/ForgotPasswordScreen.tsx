/**
 * Forgot Password Screen
 * 3-step password reset flow: Email → OTP → New Password
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
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import type { AuthScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, GRAY, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { authApi } from '@/api/auth';

// Step types
type Step = 'email' | 'otp' | 'password';

// Email schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Password schema with validation
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Current step
  const [step, setStep] = useState<Step>('email');

  // Stored data between steps
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP input refs
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const stepIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const helpOpacity = useRef(new Animated.Value(0)).current;

  // Run entrance animations
  useEffect(() => {
    // Reset animations for new step
    iconScale.setValue(0);
    iconOpacity.setValue(0);
    headerOpacity.setValue(0);
    headerTranslateY.setValue(20);
    formOpacity.setValue(0);
    formTranslateY.setValue(30);

    const animationSequence = Animated.stagger(100, [
      // Icon animation - scale and fade
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
      // Step indicator animation
      Animated.timing(stepIndicatorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
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
      // Help text animation
      Animated.timing(helpOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, [step]);

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Forgot password mutation (Step 1)
  const forgotPasswordMutation = useMutation({
    mutationFn: (emailValue: string) => authApi.forgotPassword(emailValue),
    onSuccess: (response) => {
      setStep('otp');
      setResendCooldown(60);
      success('If an account exists, a reset code has been sent');
    },
    onError: (error: any) => {
      // For security, still show success message
      setStep('otp');
      setResendCooldown(60);
      success('If an account exists, a reset code has been sent');
    },
  });

  // Verify code mutation (Step 2)
  const verifyCodeMutation = useMutation({
    mutationFn: (code: string) =>
      authApi.verifyResetCode({ email, code }),
    onSuccess: () => {
      setStep('password');
      success('Code verified! Create your new password.');
    },
    onError: (error: any) => {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('wrong')) {
        showError('Invalid code. Please check and try again.');
      } else if (msg.includes('expired')) {
        showError('This code has expired. Please request a new one.');
      } else {
        showError('Unable to verify code. Please try again.');
      }
    },
  });

  // Reset password mutation (Step 3)
  const resetPasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.resetPassword({
        email,
        code: otpCode.join(''),
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      success('Password reset! You can now sign in.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    },
    onError: (error: any) => {
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('password') && msg.includes('same')) {
        showError('Please choose a different password than your previous one.');
      } else if (msg.includes('expired') || msg.includes('invalid code')) {
        showError('Your reset session has expired. Please start over.');
      } else if (msg.includes('weak') || msg.includes('strong')) {
        showError('Password is too weak. Please use a stronger password.');
      } else {
        showError('Unable to reset password. Please try again.');
      }
    },
  });

  // Handle email submit (Step 1)
  const handleEmailSubmit = (data: EmailFormData) => {
    setEmail(data.email);
    forgotPasswordMutation.mutate(data.email);
  };

  // Handle OTP change
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newOtp = [...otpCode];
      digits.split('').forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otpCode];
      newOtp[index] = value.replace(/\D/g, '');
      setOtpCode(newOtp);

      // Auto-focus next input
      if (value && index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP key press
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP submit (Step 2)
  const handleOtpSubmit = () => {
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      showError('Please enter the complete 6-digit code');
      return;
    }
    verifyCodeMutation.mutate(code);
  };

  // Handle resend code
  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    forgotPasswordMutation.mutate(email);
  };

  // Handle password submit (Step 3)
  const handlePasswordSubmit = (data: PasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  // Get step icon
  const getStepIcon = () => {
    switch (step) {
      case 'email':
        return 'mail';
      case 'otp':
        return 'keypad';
      case 'password':
        return 'lock-closed';
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password?';
      case 'otp':
        return 'Enter Reset Code';
      case 'password':
        return 'Create New Password';
    }
  };

  // Get step subtitle
  const getStepSubtitle = () => {
    switch (step) {
      case 'email':
        return "Enter your email and we'll send you a code to reset your password";
      case 'otp':
        return `We sent a 6-digit code to ${email}`;
      case 'password':
        return 'Create a strong password for your account';
    }
  };

  const isLoading =
    forgotPasswordMutation.isPending ||
    verifyCodeMutation.isPending ||
    resetPasswordMutation.isPending;

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
              <Ionicons name={getStepIcon()} size={64} color={PRIMARY[600]} />
            </Animated.View>
            <Animated.View
              style={{
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
                alignItems: 'center',
              }}
            >
              <Text style={[text.h2, styles.title]}>{getStepTitle()}</Text>
              <Text style={[text.bodySmall, styles.subtitle]}>{getStepSubtitle()}</Text>
            </Animated.View>

            {/* Step indicator */}
            <Animated.View style={[styles.stepIndicator, { opacity: stepIndicatorOpacity }]}>
              <View style={[styles.stepDot, step === 'email' && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step === 'password' && styles.stepDotActive]} />
            </Animated.View>
          </View>

          {/* Step 1: Email */}
          {step === 'email' && (
            <Animated.View
              style={{
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              }}
            >
            <Card variant="elevated" padding="lg">
              <View style={styles.form}>
                <Controller
                  control={emailForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={emailForm.formState.errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoFocus
                      leftIcon={
                        <Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />
                      }
                      required
                    />
                  )}
                />

                <Button
                  fullWidth
                  onPress={emailForm.handleSubmit(handleEmailSubmit)}
                  loading={forgotPasswordMutation.isPending}
                  style={styles.submitButton}
                >
                  Send Reset Code
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
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <Animated.View
              style={{
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              }}
            >
            <Card variant="elevated" padding="lg">
              <View style={styles.form}>
                {/* OTP Input */}
                <View style={styles.otpContainer}>
                  {otpCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref: TextInput | null) => {
                        otpInputRefs.current[index] = ref;
                      }}
                      style={[styles.otpInput, digit && styles.otpInputFilled]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* Resend */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendLabel}>{"Didn't receive the code?"}</Text>
                  <Pressable
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || forgotPasswordMutation.isPending}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        (resendCooldown > 0 || forgotPasswordMutation.isPending) &&
                          styles.resendLinkDisabled,
                      ]}
                    >
                      {forgotPasswordMutation.isPending
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Code'}
                    </Text>
                  </Pressable>
                </View>

                <Button
                  fullWidth
                  onPress={handleOtpSubmit}
                  loading={verifyCodeMutation.isPending}
                  disabled={otpCode.join('').length !== OTP_LENGTH}
                  style={styles.submitButton}
                >
                  Verify Code
                </Button>

                <Pressable style={styles.backButton} onPress={() => setStep('email')}>
                  <Ionicons name="arrow-back" size={20} color={PRIMARY[600]} />
                  <Text style={styles.backText}>Change Email</Text>
                </Pressable>
              </View>
            </Card>
            </Animated.View>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
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
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="New Password"
                      placeholder="Enter new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={passwordForm.formState.errors.newPassword?.message}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
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

                {/* Confirm Password */}
                <Controller
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={passwordForm.formState.errors.confirmPassword?.message}
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

                {/* Password requirements */}
                <View style={styles.passwordHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={SEMANTIC.text.tertiary}
                  />
                  <Text style={styles.passwordHintText}>
                    Min 8 characters, 1 uppercase, 1 lowercase, 1 number
                  </Text>
                </View>

                <Button
                  fullWidth
                  onPress={passwordForm.handleSubmit(handlePasswordSubmit)}
                  loading={resetPasswordMutation.isPending}
                  style={styles.submitButton}
                >
                  Reset Password
                </Button>
              </View>
            </Card>
            </Animated.View>
          )}

          {/* Help Text */}
          <Animated.View style={[styles.helpContainer, { opacity: helpOpacity }]}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={SEMANTIC.text.tertiary}
            />
            <Text style={styles.helpText}>
              {step === 'email'
                ? "If you don't receive an email within 5 minutes, check your spam folder"
                : step === 'otp'
                ? 'The code expires in 10 minutes'
                : 'Choose a password you have not used before'}
            </Text>
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
  iconContainer: {
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
    textAlign: 'center',
  },
  subtitle: {
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GRAY[300],
  },
  stepDotActive: {
    backgroundColor: PRIMARY[600],
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: GRAY[300],
  },
  form: {
    gap: spacing[4],
  },
  submitButton: {
    marginTop: spacing[2],
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
  // OTP Styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginVertical: spacing[4],
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: GRAY[300],
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: SEMANTIC.text.primary,
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: PRIMARY[600],
    backgroundColor: PRIMARY[50],
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  resendLabel: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  resendLinkDisabled: {
    color: GRAY[400],
  },
  // Password hint
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: GRAY[50],
    padding: spacing[3],
    borderRadius: 8,
  },
  passwordHintText: {
    flex: 1,
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    lineHeight: 18,
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

/**
 * Signup Screen
 * User registration with password strength indicator
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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AuthScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { signupSchema, type SignupFormData, calculatePasswordStrength } from '@/utils/validationSchemas';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function SignupScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { signup, isLoading, error, clearError } = useAuth();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: 'weak' | 'fair' | 'good' | 'strong';
    score: number;
    feedback: string[];
  } | null>(null);

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

  // Calculate password strength as user types
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phoneNumber
      );

      success('Account created! Please verify your email.');

      // Navigate to email verification
      navigation.navigate('VerifyEmail', {
        email: data.email,
      });
    } catch (err: any) {
      showError(err?.message || 'Signup failed. Please try again.');
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return STATUS.error;
      case 'fair':
        return STATUS.warning;
      case 'good':
        return '#3b82f6'; // blue
      case 'strong':
        return STATUS.success;
      default:
        return SEMANTIC.border.default;
    }
  };

  const getStrengthWidth = (score: number) => {
    return `${(score / 7) * 100}%`;
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
          <Text style={[text.h2, styles.title]}>Create Account</Text>
          <Text style={[text.bodySmall, styles.subtitle]}>
            Join MedGuard to protect your medical information
          </Text>
        </View>

        {/* Signup Form */}
        <Card variant="elevated" padding="lg">
          <View style={styles.form}>
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

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="john.doe@example.com"
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
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: getStrengthWidth(passwordStrength.score),
                        backgroundColor: getStrengthColor(passwordStrength.strength),
                      },
                    ]}
                  />
                </View>
                <View style={styles.strengthInfo}>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: getStrengthColor(passwordStrength.strength) },
                    ]}
                  >
                    Password strength: {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </Text>
                  {passwordStrength.feedback.length > 0 && (
                    <View style={styles.feedbackContainer}>
                      {passwordStrength.feedback.map((item, index) => (
                        <Text key={index} style={styles.feedbackText}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Confirm Password Input */}
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
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={SEMANTIC.text.tertiary} />}
                  rightIcon={
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={SEMANTIC.text.tertiary}
                    />
                  }
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  required
                />
              )}
            />

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
                          navigation.navigate('TermsOfService');
                        }}
                      >
                        Terms of Service
                      </Text>
                      {' '}and{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={(e) => {
                          e.stopPropagation();
                          navigation.navigate('PrivacyPolicy');
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

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
  strengthContainer: {
    marginTop: -spacing[2],
  },
  strengthBar: {
    height: 4,
    backgroundColor: SEMANTIC.border.default,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  strengthInfo: {
    gap: spacing[1],
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: spacing[1],
  },
  feedbackText: {
    fontSize: 11,
    color: SEMANTIC.text.tertiary,
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

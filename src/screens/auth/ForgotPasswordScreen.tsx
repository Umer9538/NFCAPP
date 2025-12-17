/**
 * Forgot Password Screen
 * Request password reset link via email
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
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validationSchemas';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { authApi } from '@/api/auth';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword({ email: data.email });

      setEmailSent(true);
      success('Password reset link sent! Check your email.');
    } catch (err: any) {
      showError(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const email = getValues('email');
    if (email) {
      try {
        setIsLoading(true);
        await authApi.forgotPassword({ email });
        success('Reset link resent! Check your email.');
      } catch (err: any) {
        showError(err?.message || 'Failed to resend link. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
          <View style={styles.iconContainer}>
            <Ionicons name="key" size={64} color={PRIMARY[600]} />
          </View>
          <Text style={[text.h2, styles.title]}>
            {emailSent ? 'Check Your Email' : 'Forgot Password?'}
          </Text>
          <Text style={[text.bodySmall, styles.subtitle]}>
            {emailSent
              ? 'We\'ve sent a password reset link to your email address'
              : 'Enter your email and we\'ll send you a link to reset your password'}
          </Text>
        </View>

        {!emailSent ? (
          /* Forgot Password Form */
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
                    autoFocus
                    leftIcon={<Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                )}
              />

              {/* Send Link Button */}
              <Button
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                style={styles.submitButton}
              >
                {isLoading ? 'Sending link...' : 'Send Reset Link'}
              </Button>

              {/* Back to Login */}
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="arrow-back" size={20} color={PRIMARY[600]} />
                <Text style={styles.backText}>Back to Sign In</Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          /* Success State */
          <Card variant="elevated" padding="lg">
            <View style={styles.successContainer}>
              {/* Success Icon */}
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color={PRIMARY[600]} />
              </View>

              {/* Instructions */}
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>What's next?</Text>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionNumber}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Check your email inbox for the reset link
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionNumber}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Click the link to reset your password
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionNumber}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Create a new secure password
                  </Text>
                </View>
              </View>

              {/* Didn't receive email */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the email?</Text>
                <Pressable onPress={handleResend} disabled={isLoading}>
                  <Text style={[styles.resendLink, isLoading && styles.resendLinkDisabled]}>
                    Resend Link
                  </Text>
                </Pressable>
              </View>

              {/* Back to Login */}
              <Button
                variant="outline"
                fullWidth
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginButton}
              >
                Back to Sign In
              </Button>
            </View>
          </Card>
        )}

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={16} color={SEMANTIC.text.tertiary} />
          <Text style={styles.helpText}>
            If you don't receive an email within 5 minutes, check your spam folder
          </Text>
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
  successContainer: {
    alignItems: 'center',
    gap: spacing[6],
  },
  successIcon: {
    marginVertical: spacing[4],
  },
  instructions: {
    width: '100%',
    gap: spacing[4],
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  instructionBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
    paddingTop: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  resendText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  backToLoginButton: {
    marginTop: spacing[2],
  },
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

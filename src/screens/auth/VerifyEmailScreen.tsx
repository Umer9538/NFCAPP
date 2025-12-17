/**
 * Verify Email Screen
 * Enter 6-digit verification code sent via email
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
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '@/navigation/types';

import { Button, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/utils/validationSchemas';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { authApi } from '@/api/auth';

export default function VerifyEmailScreen() {
  const navigation = useNavigation<AuthScreenProps<'VerifyEmail'>['navigation']>();
  const route = useRoute<AuthScreenProps<'VerifyEmail'>['route']>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const email = route.params?.email || '';

  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      setValue('code', fullCode);
      handleSubmit(onSubmit)();
    }
  }, [code]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (pastedText: string) => {
    // Extract only digits from pasted text
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < digits.length; i++) {
      newCode[i] = digits[i];
    }

    setCode(newCode);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      setIsLoading(true);
      await authApi.verifyEmail({ email, code: data.code });

      success('Email verified successfully!');

      // Navigate to dashboard after successful verification
      // The RootNavigator will handle switching to App stack
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1000);
    } catch (err: any) {
      showError(err?.message || 'Invalid verification code. Please try again.');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);
      await authApi.resendVerificationEmail(email);

      success('Verification code resent! Check your email.');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={containers.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={64} color={PRIMARY[600]} />
          </View>
          <Text style={[text.h2, styles.title]}>Verify Your Email</Text>
          <Text style={[text.bodySmall, styles.subtitle]}>
            We've sent a 6-digit code to
          </Text>
          <Text style={[text.bodySmall, styles.email]}>{email}</Text>
        </View>

        {/* Verification Form */}
        <Card variant="elevated" padding="lg">
          <View style={styles.form}>
            {/* Code Input */}
            <View style={styles.codeContainer}>
              <Text style={styles.label}>Enter Verification Code</Text>
              <View style={styles.codeInputs}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      errors.code && styles.codeInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    onPaste={(e) => {
                      if (index === 0) {
                        const pastedText = e.nativeEvent.data || '';
                        handlePaste(pastedText);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {errors.code && (
                <Text style={styles.errorText}>{errors.code.message}</Text>
              )}
            </View>

            {/* Verify Button */}
            <Button
              fullWidth
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={code.join('').length !== 6}
              style={styles.verifyButton}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              {canResend ? (
                <Pressable onPress={handleResend} disabled={isLoading}>
                  <Text style={[styles.resendLink, isLoading && styles.resendLinkDisabled]}>
                    Resend Code
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.resendTimer}>Resend in {formatTimer(resendTimer)}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={16} color={SEMANTIC.text.tertiary} />
          <Text style={styles.helpText}>
            The verification code is valid for 10 minutes. Check your spam folder if you don't see it.
          </Text>
        </View>

        {/* Change Email */}
        <Pressable
          style={styles.changeEmailButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="pencil" size={16} color={PRIMARY[600]} />
          <Text style={styles.changeEmailText}>Change Email Address</Text>
        </Pressable>
      </ScrollView>

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />

      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner visible overlay />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
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
    marginBottom: spacing[1],
  },
  email: {
    color: PRIMARY[600],
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    gap: spacing[6],
  },
  codeContainer: {
    gap: spacing[3],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
  codeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    borderRadius: 12,
    backgroundColor: SEMANTIC.background.default,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: SEMANTIC.text.primary,
  },
  codeInputFilled: {
    borderColor: PRIMARY[600],
    backgroundColor: PRIMARY[50],
  },
  codeInputError: {
    borderColor: STATUS.error,
  },
  errorText: {
    fontSize: 12,
    color: STATUS.error,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  verifyButton: {
    marginTop: spacing[2],
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
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
  resendTimer: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    fontWeight: '600',
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
  changeEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingVertical: spacing[3],
  },
  changeEmailText: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
});

/**
 * Change Password Screen
 * Form for changing user password with validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Toast, useToast } from '@/components/ui';
import { settingsApi } from '@/api/settings';
import type { PasswordChangeInput } from '@/types/settings';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

// Validation schema
const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ChangePasswordScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [formData, setFormData] = useState<PasswordChangeInput>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PasswordChangeInput, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PasswordChangeInput, boolean>>>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      success('Password changed successfully');
      setTimeout(() => navigation.goBack(), 1500);
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to change password');
    },
  });

  const handleChange = (field: keyof PasswordChangeInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof PasswordChangeInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof PasswordChangeInput) => {
    try {
      // Validate the full form since we have refinements
      passwordSchema.parse(formData);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find error for this specific field
        const fieldError = error.errors.find(e => e.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      passwordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof PasswordChangeInput, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof PasswordChangeInput;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);

        // Mark all fields as touched
        setTouched({
          oldPassword: true,
          newPassword: true,
          confirmPassword: true,
        });
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    changePasswordMutation.mutate(formData);
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 8) return { strength: 'Weak', color: '#EF4444' };

    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;

    if (score === 4 && password.length >= 12) {
      return { strength: 'Strong', color: '#10B981' };
    } else if (score >= 3) {
      return { strength: 'Medium', color: '#F59E0B' };
    } else {
      return { strength: 'Weak', color: '#EF4444' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.appBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.appBarTitle}>Change Password</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={32} color={PRIMARY[600]} />
            </View>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Choose a strong password to keep your account secure
            </Text>
          </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Current Password */}
          <Input
            label="Current Password"
            placeholder="Enter your current password"
            value={formData.oldPassword}
            onChangeText={(value) => handleChange('oldPassword', value)}
            onBlur={() => handleBlur('oldPassword')}
            error={touched.oldPassword ? errors.oldPassword : undefined}
            leftIcon="lock-closed-outline"
            secureTextEntry={!showOldPassword}
            rightIcon={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowOldPassword(!showOldPassword)}
            autoCapitalize="none"
          />

          {/* New Password */}
          <Input
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChangeText={(value) => handleChange('newPassword', value)}
            onBlur={() => handleBlur('newPassword')}
            error={touched.newPassword ? errors.newPassword : undefined}
            leftIcon="lock-closed-outline"
            secureTextEntry={!showNewPassword}
            rightIcon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
            autoCapitalize="none"
          />

          {/* Password Strength Indicator */}
          {formData.newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password strength:</Text>
              <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
                {passwordStrength.strength}
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <Input
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            leftIcon="lock-closed-outline"
            secureTextEntry={!showConfirmPassword}
            rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            autoCapitalize="none"
          />

          {/* Password Requirements */}
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={formData.newPassword.length >= 8 ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={formData.newPassword.length >= 8 ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[A-Z]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={/[A-Z]/.test(formData.newPassword) ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.requirementText}>One uppercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[a-z]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={/[a-z]/.test(formData.newPassword) ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.requirementText}>One lowercase letter</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[0-9]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={/[0-9]/.test(formData.newPassword) ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.requirementText}>One number</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[@$!%*?&#]/.test(formData.newPassword) ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={/[@$!%*?&#]/.test(formData.newPassword) ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.requirementText}>One special character (@$!%*?&#)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            onPress={handleSubmit}
            loading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
          >
            Change Password
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={changePasswordMutation.isPending}
          >
            Cancel
          </Button>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  headerWrapper: {
    backgroundColor: SEMANTIC.background.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: spacing[6],
    marginTop: spacing[4],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: -spacing[2],
  },
  strengthLabel: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  requirements: {
    backgroundColor: SEMANTIC.background.secondary,
    padding: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  requirementsList: {
    gap: spacing[2],
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  requirementText: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  actions: {
    gap: spacing[3],
  },
});

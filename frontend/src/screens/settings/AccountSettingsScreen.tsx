/**
 * Account Settings Screen
 * Edit user profile information with email change verification
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AppScreenNavigationProp } from '@/navigation/types';
import { Button, Input, Card, Toast, useToast, Avatar, LoadingSpinner } from '@/components/ui';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import {
  getProfile,
  updateProfile,
  verifyEmailChange,
  resendEmailVerificationCode,
} from '@/api/settings';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const OTP_LENGTH = 6;

export default function AccountSettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [originalEmail, setOriginalEmail] = useState('');

  // Email verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: '',
    },
  });

  const currentEmail = watch('email');

  useEffect(() => {
    loadProfile();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP input when modal opens
  useEffect(() => {
    if (showVerificationModal) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showVerificationModal]);

  const loadProfile = async () => {
    // Set original email from user data as fallback
    if (user?.email) {
      setOriginalEmail(user.email);
    }

    try {
      setIsLoading(true);
      const profile = await getProfile();
      setValue('firstName', profile.firstName || user?.firstName || '');
      setValue('lastName', profile.lastName || user?.lastName || '');
      setValue('email', profile.email || user?.email || '');
      setValue('phoneNumber', profile.phone || user?.phoneNumber || '');
      setValue('dateOfBirth', profile.dateOfBirth || '');
      setProfileImage(profile.profilePicture);
      setOriginalEmail(profile.email || user?.email || '');
    } catch (err: any) {
      // Silently handle 401 errors (user will be logged out by API client)
      // Also don't show error if we have user data from auth store
      if (err?.status !== 401 && !user?.firstName && !user?.email) {
        console.error('[AccountSettings] Failed to load profile:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
      }
    } catch (err) {
      showError('Unable to select photo. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showError('Camera access is needed to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
      }
    } catch (err) {
      showError('Unable to take photo. Please try again.');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      const response = await updateProfile({
        ...data,
        profilePicture: profileImage,
      });

      // Check if email verification is required
      if (response.requiresEmailVerification && response.pendingEmail) {
        setPendingEmail(response.pendingEmail);
        setOtpCode(['', '', '', '', '', '']);
        setShowVerificationModal(true);
        setResendCooldown(60); // Start 60 second cooldown
        setIsSaving(false);
        return;
      }

      // Refresh the auth store to update user data everywhere
      await checkAuth();

      success('Your changes have been saved!');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err: any) {
      // Silently handle 401 errors (user will be logged out by API client)
      if (err?.status === 401) {
        setIsSaving(false);
        return;
      }
      console.error('[AccountSettings] Failed to update profile:', err);
      const message = err?.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('connect')) {
        showError('Unable to connect. Please check your internet.');
      } else {
        showError('Unable to save changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      showError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      setIsVerifying(true);
      const result = await verifyEmailChange({
        code,
        newEmail: pendingEmail,
      });

      // Update auth store with new email
      if (user) {
        setUser({
          ...user,
          email: result.email,
        });
      }

      setShowVerificationModal(false);
      success('Your email has been updated!');
      setOriginalEmail(pendingEmail);
      setValue('email', pendingEmail);

      // Refresh auth
      await checkAuth();

      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      const message = err?.message?.toLowerCase() || '';
      if (message.includes('invalid') || message.includes('incorrect') || message.includes('wrong')) {
        showError('Incorrect code. Please check and try again.');
      } else if (message.includes('expired')) {
        showError('Code has expired. Please request a new one.');
      } else if (message.includes('network') || message.includes('connect')) {
        showError('Unable to connect. Please check your internet.');
      } else {
        showError('Unable to verify email. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsResending(true);
      await resendEmailVerificationCode(pendingEmail);
      success('A new verification code has been sent!');
      setResendCooldown(60);
    } catch (err: any) {
      const message = err?.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('connect')) {
        showError('Unable to connect. Please check your internet.');
      } else {
        showError('Unable to send code. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCancelVerification = () => {
    setShowVerificationModal(false);
    setPendingEmail('');
    setOtpCode(['', '', '', '', '', '']);
    // Revert email to original
    setValue('email', originalEmail);
  };

  const isEmailChanged = currentEmail !== originalEmail;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <Avatar
            size="xl"
            initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
            imageUri={profileImage}
          />
          <View style={styles.avatarButtons}>
            <Pressable style={styles.avatarButton} onPress={handlePickImage}>
              <Ionicons name="images-outline" size={20} color={PRIMARY[600]} />
              <Text style={styles.avatarButtonText}>Choose Photo</Text>
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={20} color={PRIMARY[600]} />
              <Text style={styles.avatarButtonText}>Take Photo</Text>
            </Pressable>
          </View>
        </View>

        {/* Form */}
        <Card variant="outlined" padding="lg">
          <View style={styles.form}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  leftIcon={<Ionicons name="person-outline" size={20} color={SEMANTIC.text.tertiary} />}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  leftIcon={<Ionicons name="person-outline" size={20} color={SEMANTIC.text.tertiary} />}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    label="Email"
                    placeholder="Enter email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="mail-outline" size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                  {isEmailChanged && (
                    <View style={styles.emailChangeNote}>
                      <Ionicons name="information-circle" size={16} color={PRIMARY[600]} />
                      <Text style={styles.emailChangeNoteText}>
                        Email change requires verification
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                  leftIcon={<Ionicons name="call-outline" size={20} color={SEMANTIC.text.tertiary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.dateOfBirth?.message}
                  leftIcon={<Ionicons name="calendar-outline" size={20} color={SEMANTIC.text.tertiary} />}
                />
              )}
            />
          </View>
        </Card>

        {/* Save Button */}
        <Button
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={isSaving}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </ScrollView>

      {/* Email Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelVerification}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="mail" size={32} color={PRIMARY[600]} />
              </View>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <Text style={styles.modalSubtitle}>
                {"We've sent a verification code to"}{'\n'}
                <Text style={styles.emailText}>{pendingEmail}</Text>
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: TextInput | null) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Link */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>{"Didn't receive the code?"}</Text>
              <Pressable
                onPress={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendCooldown > 0 || isResending) && styles.resendLinkDisabled,
                  ]}
                >
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Code'}
                </Text>
              </Pressable>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelVerification}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.verifyButton,
                  (isVerifying || otpCode.join('').length !== OTP_LENGTH) &&
                    styles.verifyButtonDisabled,
                ]}
                onPress={handleVerifyEmail}
                disabled={isVerifying || otpCode.join('').length !== OTP_LENGTH}
              >
                {isVerifying ? (
                  <LoadingSpinner visible size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  header: {
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
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: PRIMARY[300],
    borderRadius: 8,
    backgroundColor: PRIMARY[50],
  },
  avatarButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: PRIMARY[700],
  },
  form: {
    gap: spacing[4],
  },
  emailChangeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  emailChangeNoteText: {
    fontSize: 12,
    color: PRIMARY[600],
  },
  saveButton: {
    marginTop: spacing[6],
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: spacing[6],
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: PRIMARY[600],
  },
  otpContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: GRAY[300],
    borderRadius: 10,
    fontSize: 20,
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
    gap: spacing[1],
    marginBottom: spacing[6],
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
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  verifyButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: 10,
    backgroundColor: PRIMARY[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: PRIMARY[300],
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

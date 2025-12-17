/**
 * Account Settings Screen
 * Edit user profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AppScreenNavigationProp } from '@/navigation/types';
import { Button, Input, Card, Toast, useToast, Avatar } from '@/components/ui';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import { getProfile, updateProfile } from '@/api/settings';
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

export default function AccountSettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      setValue('firstName', profile.firstName);
      setValue('lastName', profile.lastName);
      setValue('email', profile.email);
      setValue('phoneNumber', profile.phoneNumber || '');
      setValue('dateOfBirth', profile.dateOfBirth || '');
      setProfileImage(profile.profilePicture);
    } catch (err) {
      showError('Failed to load profile');
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
        console.log('[AccountSettings] Image selected:', imageUri);
      }
    } catch (err) {
      console.error('[AccountSettings] Failed to pick image:', err);
      showError('Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showError('Camera permission is required');
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
        console.log('[AccountSettings] Photo taken:', imageUri);
      }
    } catch (err) {
      console.error('[AccountSettings] Failed to take photo:', err);
      showError('Failed to take photo');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      await updateProfile({
        ...data,
        profilePicture: profileImage,
      });

      // Refresh the auth store to update user data everywhere
      await checkAuth();

      success('Profile updated successfully');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      console.error('[AccountSettings] Failed to update profile:', err);
      showError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <Avatar
            size="xl"
            initials="U"
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
        <Card variant="outline" padding="lg">
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
                  editable={false}
                />
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

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
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
  saveButton: {
    marginTop: spacing[6],
  },
});

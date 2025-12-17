/**
 * Edit Profile Screen
 * Comprehensive profile editing with all user information fields
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
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Button, Input, Card, Toast, useToast, LoadingSpinner, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { containers, text } from '@/constants/styles';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { db } from '@/db/database';
import { z } from 'zod';

// Form validation schema
const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
  organDonor: z.boolean().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      gender: '',
      dateOfBirth: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      height: '',
      weight: '',
      bloodType: '',
      organDonor: false,
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  });

  // Load existing profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      if (!user?.id) return;

      // Get user details from database
      const userDetails = await db.getFirstAsync<any>(
        'SELECT * FROM user WHERE id = ?',
        [user.id]
      );

      if (userDetails) {
        setValue('firstName', userDetails.fullName?.split(' ')[0] || '');
        setValue('lastName', userDetails.fullName?.split(' ').slice(1).join(' ') || '');
        setValue('phoneNumber', userDetails.phoneNumber || '');
        setValue('gender', userDetails.gender || '');
        setValue('dateOfBirth', userDetails.dateOfBirth || '');
        setValue('address', userDetails.address || '');
        setValue('city', userDetails.city || '');
        setValue('province', userDetails.province || '');
        setValue('postalCode', userDetails.postalCode || '');
        setValue('height', userDetails.height || '');
        setProfileImage(userDetails.profilePicture || null);

        if (userDetails.dateOfBirth) {
          setSelectedDate(new Date(userDetails.dateOfBirth));
        }
      }

      // Get medical profile
      const medicalProfile = await db.getFirstAsync<any>(
        'SELECT * FROM medical_profile WHERE userId = ?',
        [user.id]
      );

      if (medicalProfile) {
        setValue('weight', medicalProfile.weight?.toString() || '');
        setValue('bloodType', medicalProfile.bloodType || '');
        setValue('organDonor', medicalProfile.organDonor === 1);
      }

      // Get emergency contact
      const emergencyContact = await db.getFirstAsync<any>(
        'SELECT * FROM emergency_contacts WHERE userId = ? AND isPrimary = 1',
        [user.id]
      );

      if (emergencyContact) {
        setValue('emergencyContact', {
          name: emergencyContact.name || '',
          relationship: emergencyContact.relationship || '',
          phone: emergencyContact.phone || '',
        });
      }
    } catch (error) {
      console.error('[EditProfile] Error loading profile data:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[EditProfile] Failed to pick image:', err);
      showError('Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('[EditProfile] Failed to take photo:', err);
      showError('Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const onDateChange = (event: any, date?: Date) => {
    // On Android, the picker is dismissed automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      setSelectedDate(date);
      setValue('dateOfBirth', format(date, 'yyyy-MM-dd'));

      // On iOS, we need to manually close the picker
      if (Platform.OS === 'ios') {
        // Keep it open for iOS to allow users to confirm
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true);

      if (!user?.id) {
        throw new Error('User not found');
      }

      const now = new Date().toISOString();

      // Update user table
      await db.runAsync(
        `UPDATE user SET
          fullName = ?,
          phoneNumber = ?,
          gender = ?,
          dateOfBirth = ?,
          address = ?,
          city = ?,
          province = ?,
          postalCode = ?,
          height = ?,
          profilePicture = ?,
          updatedAt = ?
        WHERE id = ?`,
        [
          `${data.firstName} ${data.lastName}`,
          data.phoneNumber || null,
          data.gender || null,
          data.dateOfBirth || null,
          data.address || null,
          data.city || null,
          data.province || null,
          data.postalCode || null,
          data.height || null,
          profileImage || null,
          now,
          user.id,
        ]
      );

      // Update or create medical profile
      const existingProfile = await db.getFirstAsync<any>(
        'SELECT id FROM medical_profile WHERE userId = ?',
        [user.id]
      );

      if (existingProfile) {
        await db.runAsync(
          `UPDATE medical_profile SET
            bloodType = ?,
            weight = ?,
            organDonor = ?,
            updatedAt = ?
          WHERE userId = ?`,
          [
            data.bloodType || null,
            data.weight ? parseFloat(data.weight) : null,
            data.organDonor ? 1 : 0,
            now,
            user.id,
          ]
        );
      } else {
        const profileId = Math.random().toString(36).substring(2, 15);
        await db.runAsync(
          `INSERT INTO medical_profile (id, userId, bloodType, weight, organDonor, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            profileId,
            user.id,
            data.bloodType || null,
            data.weight ? parseFloat(data.weight) : null,
            data.organDonor ? 1 : 0,
            now,
            now,
          ]
        );
      }

      // Update or create emergency contact
      if (data.emergencyContact?.name) {
        const existingContact = await db.getFirstAsync<any>(
          'SELECT id FROM emergency_contacts WHERE userId = ? AND isPrimary = 1',
          [user.id]
        );

        if (existingContact) {
          await db.runAsync(
            `UPDATE emergency_contacts SET
              name = ?,
              relationship = ?,
              phone = ?
            WHERE id = ?`,
            [
              data.emergencyContact.name,
              data.emergencyContact.relationship || '',
              data.emergencyContact.phone || '',
              existingContact.id,
            ]
          );
        } else {
          const contactId = Math.random().toString(36).substring(2, 15);
          await db.runAsync(
            `INSERT INTO emergency_contacts (id, userId, name, relationship, phone, isPrimary, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              contactId,
              user.id,
              data.emergencyContact.name,
              data.emergencyContact.relationship || '',
              data.emergencyContact.phone || '',
              1,
              now,
            ]
          );
        }
      }

      // Refresh auth store with updated user data
      await checkAuth();

      success('Profile updated successfully!');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      console.error('[EditProfile] Failed to update profile:', err);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
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
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <Avatar
              size="xl"
              initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
              imageUri={profileImage}
            />
            <Button
              variant="outline"
              size="sm"
              onPress={showImageOptions}
              style={styles.changePictureButton}
              icon={<Ionicons name="camera" size={16} color={PRIMARY[600]} />}
            >
              Change Picture
            </Button>
          </View>

          {/* Personal Information */}
          <Card variant="elevated" padding="lg" style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
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
                      required
                    />
                  )}
                />
              </View>
              <View style={styles.halfField}>
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
                      required
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                  style={styles.disabledInput}
                  required
                />
              )}
            />

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
                />
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.genderOptions}>
                    {['male', 'female', 'other', 'prefer_not_to_say'].map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.genderOption,
                          value === option && styles.genderOptionSelected,
                        ]}
                        onPress={() => onChange(option)}
                      >
                        <Text
                          style={[
                            styles.genderOptionText,
                            value === option && styles.genderOptionTextSelected,
                          ]}
                        >
                          {option === 'prefer_not_to_say'
                            ? 'Prefer not to say'
                            : option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Pressable
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {value ? format(new Date(value), 'MMMM dd, yyyy') : 'Select date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={SEMANTIC.text.tertiary} />
                  </Pressable>
                </View>
              )}
            />

            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {showDatePicker && Platform.OS === 'ios' && (
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setValue('dateOfBirth', format(selectedDate, 'yyyy-MM-dd'));
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.datePickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Controller
                  control={control}
                  name="height"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Height (cm)"
                      placeholder="180"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View style={styles.halfField}>
                <Controller
                  control={control}
                  name="weight"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Weight (kg)"
                      placeholder="75"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
            </View>
          </Card>

          {/* Address Information */}
          <Card variant="elevated" padding="lg" style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Street Address"
                  placeholder="123 Main St"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="City"
                      placeholder="Toronto"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              <View style={styles.halfField}>
                <Controller
                  control={control}
                  name="province"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Province/State"
                      placeholder="ON"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Postal/ZIP Code"
                  placeholder="M5V 3A8"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                />
              )}
            />
          </Card>

          {/* Medical Information */}
          <Card variant="elevated" padding="lg" style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>

            <Controller
              control={control}
              name="bloodType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Blood Type</Text>
                  <View style={styles.bloodTypeGrid}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.bloodTypeOption,
                          value === type && styles.bloodTypeOptionSelected,
                        ]}
                        onPress={() => onChange(type)}
                      >
                        <Text
                          style={[
                            styles.bloodTypeText,
                            value === type && styles.bloodTypeTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="organDonor"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => onChange(!value)}
                >
                  <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                    {value && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>I am an organ donor</Text>
                </Pressable>
              )}
            />
          </Card>

          {/* Emergency Contact */}
          <Card variant="elevated" padding="lg" style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>

            <Controller
              control={control}
              name="emergencyContact.name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contact Name"
                  placeholder="Jane Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContact.relationship"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Relationship"
                  placeholder="Spouse, Parent, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <Controller
              control={control}
              name="emergencyContact.phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contact Phone"
                  placeholder="+1 (555) 987-6543"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isDirty || isLoading}
              style={styles.saveButton}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />

      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner visible overlay />}
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
    paddingBottom: spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: SEMANTIC.background.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  backButton: {
    padding: spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  placeholder: {
    width: 40,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  changePictureButton: {
    marginTop: spacing[3],
  },
  section: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  genderOption: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  genderOptionSelected: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  genderOptionText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  genderOptionTextSelected: {
    color: '#ffffff',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.surface.default,
  },
  dateText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  bloodTypeOption: {
    width: '23%',
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  bloodTypeOptionSelected: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  bloodTypeTextSelected: {
    color: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    borderRadius: 4,
    marginRight: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  disabledInput: {
    opacity: 0.6,
  },
  datePickerContainer: {
    backgroundColor: SEMANTIC.background.default,
    borderRadius: 12,
    marginVertical: spacing[2],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: SEMANTIC.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  datePickerCancel: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
  },
  datePickerDone: {
    fontSize: 16,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
});
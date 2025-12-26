/**
 * Doctor Info Screen
 * Displays and manages doctor information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import type { AppScreenNavigationProp } from '@/navigation/types';

import {
  Button,
  Input,
  LoadingSpinner,
  Toast,
  useToast,
  Card,
} from '@/components/ui';
import { contactsApi } from '@/api/contacts';
import type { DoctorInfo, DoctorInfoInput } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

// Validation schema
const doctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required').max(100, 'Name is too long'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      'Invalid phone number'
    ),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  specialty: z.string().max(100, 'Specialty is too long').optional().or(z.literal('')),
  address: z.string().max(200, 'Address is too long').optional().or(z.literal('')),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export default function DoctorInfoScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    address: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DoctorFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DoctorFormData, boolean>>>({});

  // Fetch doctor info
  const { data: doctorInfo, isLoading, error } = useQuery({
    queryKey: ['doctorInfo'],
    queryFn: contactsApi.getDoctorInfo,
    // Mock data for development
    placeholderData: getMockDoctorInfo(),
  });

  // Update form data when doctor info is loaded
  useEffect(() => {
    if (doctorInfo) {
      setFormData({
        name: doctorInfo.name || '',
        phone: doctorInfo.phone || '',
        email: doctorInfo.email || '',
        specialty: doctorInfo.specialty || '',
        address: doctorInfo.address || '',
      });
    }
  }, [doctorInfo]);

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: contactsApi.updateDoctorInfo,
    onSuccess: () => {
      success('Doctor information updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctorInfo'] });
      setIsEditing(false);
    },
    onError: () => {
      showError('Failed to update doctor information');
    },
  });

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          showError('Phone calls are not supported on this device');
        }
      })
      .catch(() => {
        showError('Failed to make call');
      });
  };

  const handleEmail = (email: string) => {
    const emailUrl = `mailto:${email}`;
    Linking.openURL(emailUrl).catch(() => {
      showError('Failed to open email');
    });
  };

  const handleChange = (field: keyof DoctorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof DoctorFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof DoctorFormData) => {
    try {
      const fieldSchema = doctorSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(formData[field]);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message,
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      doctorSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof DoctorFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof DoctorFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);

        // Mark all fields as touched
        setTouched({
          name: true,
          phone: true,
          email: true,
          specialty: true,
          address: true,
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

    const submitData: DoctorInfoInput = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      specialty: formData.specialty || undefined,
      address: formData.address || undefined,
    };

    updateDoctorMutation.mutate(submitData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (doctorInfo) {
      setFormData({
        name: doctorInfo.name || '',
        phone: doctorInfo.phone || '',
        email: doctorInfo.email || '',
        specialty: doctorInfo.specialty || '',
        address: doctorInfo.address || '',
      });
    }
    setErrors({});
    setTouched({});
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading doctor information..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={STATUS.error} />
        <Text style={styles.errorText}>Failed to load doctor information</Text>
      </View>
    );
  }

  // Empty state - no doctor info yet
  if (!doctorInfo && !isEditing) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyStateContainer}
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="medical" size={64} color={PRIMARY[600]} />
            </View>
            <Text style={styles.emptyStateTitle}>No Doctor Information</Text>
            <Text style={styles.emptyStateText}>
              Add your primary doctor's information for quick access during emergencies.
            </Text>
            <Button
              title="Add Doctor Information"
              onPress={() => setIsEditing(true)}
              leftIcon="add"
            />
          </View>
        </ScrollView>
        <Toast {...toastConfig} onDismiss={hideToast} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="medical" size={32} color={PRIMARY[600]} />
          </View>
          <Text style={styles.title}>Doctor Information</Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? 'Update your primary doctor information'
              : 'Your primary doctor details'}
          </Text>
        </View>

        {isEditing ? (
          // Edit mode - Form
          <>
            <View style={styles.form}>
              {/* Name */}
              <Input
                label="Doctor Name"
                placeholder="Dr. John Smith"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : undefined}
                leftIcon="person-outline"
                autoCapitalize="words"
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                onBlur={() => handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
                leftIcon="call-outline"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              {/* Email */}
              <Input
                label="Email (Optional)"
                placeholder="doctor@clinic.com"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : undefined}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Specialty */}
              <Input
                label="Specialty (Optional)"
                placeholder="Cardiology, Neurology, etc."
                value={formData.specialty}
                onChangeText={(value) => handleChange('specialty', value)}
                onBlur={() => handleBlur('specialty')}
                error={touched.specialty ? errors.specialty : undefined}
                leftIcon="medical-outline"
                autoCapitalize="words"
              />

              {/* Address */}
              <Input
                label="Address (Optional)"
                placeholder="123 Medical Center Dr, City, State"
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                onBlur={() => handleBlur('address')}
                error={touched.address ? errors.address : undefined}
                leftIcon="location-outline"
                multiline
                numberOfLines={3}
                autoCapitalize="words"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Save Changes"
                onPress={handleSubmit}
                loading={updateDoctorMutation.isPending}
                disabled={updateDoctorMutation.isPending}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCancel}
                disabled={updateDoctorMutation.isPending}
              />
            </View>
          </>
        ) : (
          // View mode - Display
          <>
            <Card variant="elevated" padding="lg" style={styles.doctorCard}>
              {/* Doctor Header */}
              <View style={styles.doctorHeader}>
                <View style={styles.doctorAvatar}>
                  <Ionicons name="person" size={32} color={PRIMARY[600]} />
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctorInfo?.name}</Text>
                  {doctorInfo?.specialty && (
                    <Text style={styles.doctorSpecialty}>{doctorInfo.specialty}</Text>
                  )}
                </View>
              </View>

              {/* Contact Methods */}
              <View style={styles.contactMethods}>
                {/* Phone */}
                <Pressable
                  style={styles.contactMethod}
                  onPress={() => handleCall(doctorInfo!.phone)}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: MEDICAL_COLORS.blue[50] },
                    ]}
                  >
                    <Ionicons name="call" size={20} color={MEDICAL_COLORS.blue[600]} />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={styles.methodLabel}>Phone</Text>
                    <Text style={styles.methodValue}>{doctorInfo?.phone}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={SEMANTIC.text.tertiary}
                  />
                </Pressable>

                {/* Email */}
                {doctorInfo?.email && (
                  <Pressable
                    style={styles.contactMethod}
                    onPress={() => handleEmail(doctorInfo.email!)}
                  >
                    <View
                      style={[
                        styles.methodIcon,
                        { backgroundColor: MEDICAL_COLORS.purple[50] },
                      ]}
                    >
                      <Ionicons
                        name="mail"
                        size={20}
                        color={MEDICAL_COLORS.purple[600]}
                      />
                    </View>
                    <View style={styles.methodContent}>
                      <Text style={styles.methodLabel}>Email</Text>
                      <Text style={styles.methodValue}>{doctorInfo.email}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={SEMANTIC.text.tertiary}
                    />
                  </Pressable>
                )}

                {/* Address */}
                {doctorInfo?.address && (
                  <View style={styles.contactMethod}>
                    <View
                      style={[
                        styles.methodIcon,
                        { backgroundColor: MEDICAL_COLORS.green[50] },
                      ]}
                    >
                      <Ionicons
                        name="location"
                        size={20}
                        color={MEDICAL_COLORS.green[600]}
                      />
                    </View>
                    <View style={styles.methodContent}>
                      <Text style={styles.methodLabel}>Address</Text>
                      <Text style={styles.methodValue}>{doctorInfo.address}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>

            {/* Edit Button */}
            <View style={styles.actions}>
              <Button
                title="Edit Doctor Information"
                onPress={handleEdit}
                variant="outline"
                leftIcon="create-outline"
              />
            </View>
          </>
        )}
      </ScrollView>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </KeyboardAvoidingView>
  );
}

function getMockDoctorInfo(): DoctorInfo {
  return {
    id: '1',
    name: 'Dr. Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah.johnson@medicalcenter.com',
    specialty: 'Cardiology',
    address: '456 Medical Center Drive, Suite 200, San Francisco, CA 94102',
    updatedAt: new Date().toISOString(),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: SEMANTIC.background.default,
  },
  errorText: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[4],
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PRIMARY[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
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
  actions: {
    gap: spacing[3],
  },
  doctorCard: {
    marginBottom: spacing[6],
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  doctorSpecialty: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    fontWeight: '500',
  },
  contactMethods: {
    gap: spacing[3],
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.default,
    borderRadius: 8,
    gap: spacing[3],
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginBottom: 2,
  },
  methodValue: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
});

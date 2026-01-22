/**
 * Add Employee Screen
 * Invite new employees/workers/students to the organization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  CheckCircle,
  Info,
  UserPlus,
  Building2,
  Briefcase,
} from 'lucide-react-native';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { organizationsApi } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { text } from '@/constants/styles';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Validation schema
const addEmployeeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]{10,}$/.test(val),
      'Please enter a valid phone number'
    ),
  department: z.string().optional(),
  position: z.string().optional(),
});

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema>;

export default function AddEmployeeScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, error: showError } = useToast();

  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      department: '',
      position: '',
    },
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: (data: AddEmployeeFormData) =>
      organizationsApi.addEmployee({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        department: data.department || undefined,
        position: data.position || undefined,
      }),
    onSuccess: (_, variables) => {
      // Invalidate employees query to refresh list
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      // Show success modal
      setInvitedEmail(variables.email);
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      let friendlyMessage = `Unable to add ${dashboardConfig.terminology.user.toLowerCase()}. Please try again.`;

      if (message.includes('not authorized') || message.includes('unauthorized') || message.includes('permission')) {
        friendlyMessage = "You don't have permission to add team members.";
      } else if (message.includes('network') || message.includes('connection')) {
        friendlyMessage = 'No internet connection. Please check your network and try again.';
      } else if (message.includes('already exists') || message.includes('duplicate') || message.includes('already a member')) {
        friendlyMessage = 'This email address is already registered in your organization.';
      } else if (message.includes('invalid email')) {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (message.includes('organization not found')) {
        friendlyMessage = 'Organization not found. Please try again later.';
      }

      showError(friendlyMessage);
    },
  });

  const onSubmit = (data: AddEmployeeFormData) => {
    addEmployeeMutation.mutate(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    reset();
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            Add {dashboardConfig.terminology.user}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Mail size={20} color={PRIMARY[600]} />
            <Text style={styles.infoBannerText}>
              An invitation email will be sent with login credentials
            </Text>
          </View>

          {/* Form */}
          <Card variant="elevated" padding="lg">
            <View style={styles.form}>
              {/* Icon Header */}
              <View style={styles.formHeader}>
                <View style={[styles.formIcon, { backgroundColor: `${dashboardConfig.themeColors.primary}15` }]}>
                  <UserPlus size={32} color={dashboardConfig.themeColors.primary} />
                </View>
                <Text style={styles.formTitle}>
                  {dashboardConfig.terminology.user} Information
                </Text>
                <Text style={styles.formSubtitle}>
                  Enter the details for the new {dashboardConfig.terminology.user.toLowerCase()}
                </Text>
              </View>

              {/* Full Name */}
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Enter full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    autoCapitalize="words"
                    leftIcon={<User size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                )}
              />

              {/* Email Address */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter email address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon={<Mail size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                )}
              />

              {/* Phone Number */}
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="+1 (555) 123-4567"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phoneNumber?.message}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    leftIcon={<Phone size={20} color={SEMANTIC.text.tertiary} />}
                  />
                )}
              />

              {/* Department */}
              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Department (Optional)"
                    placeholder="e.g., Sales, IT, HR"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.department?.message}
                    autoCapitalize="words"
                    leftIcon={<Building2 size={20} color={SEMANTIC.text.tertiary} />}
                  />
                )}
              />

              {/* Position */}
              <Controller
                control={control}
                name="position"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Position (Optional)"
                    placeholder="e.g., Manager, Developer"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.position?.message}
                    autoCapitalize="words"
                    leftIcon={<Briefcase size={20} color={SEMANTIC.text.tertiary} />}
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={addEmployeeMutation.isPending}
                disabled={addEmployeeMutation.isPending}
                style={styles.submitButton}
                icon={<Mail size={20} color="#fff" />}
              >
                {addEmployeeMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </View>
          </Card>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Info size={16} color={SEMANTIC.text.tertiary} />
            <Text style={styles.helperText}>
              The {dashboardConfig.terminology.user.toLowerCase()} will receive an email with instructions to set up their account and complete their medical profile.
            </Text>
          </View>
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {addEmployeeMutation.isPending && <LoadingSpinner visible overlay />}

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <CheckCircle size={64} color={STATUS.success.main} />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Invitation Sent!</Text>

              {/* Message */}
              <Text style={styles.modalMessage}>
                An email has been sent to{'\n'}
                <Text style={styles.modalEmail}>{invitedEmail}</Text>
                {'\n'}with login instructions
              </Text>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.modalButtonSecondary}
                  onPress={handleAddAnother}
                >
                  <Text style={styles.modalButtonSecondaryText}>Add Another</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButtonPrimary, { backgroundColor: dashboardConfig.themeColors.primary }]}
                  onPress={handleDone}
                >
                  <Text style={styles.modalButtonPrimaryText}>Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: PRIMARY[700],
    lineHeight: 20,
  },
  form: {
    gap: spacing[5],
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  formIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[4],
    paddingHorizontal: spacing[2],
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: spacing[6],
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${STATUS.success.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  modalMessage: {
    fontSize: 15,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  modalEmail: {
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

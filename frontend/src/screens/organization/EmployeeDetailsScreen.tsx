/**
 * Employee Details Screen
 * View and manage individual employee information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Pencil,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Droplets,
  AlertTriangle,
  Pill,
  Users,
  Trash2,
  UserX,
  UserCheck,
} from 'lucide-react-native';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import {
  organizationsApi,
  type Employee,
  type EmployeeMedicalInfo,
} from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type {
  AppScreenNavigationProp,
  AppScreenRouteProp,
} from '@/navigation/types';

// Validation schema for editing
const editEmployeeSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]{10,}$/.test(val),
      'Please enter a valid phone number'
    ),
});

type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>;

export default function EmployeeDetailsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<AppScreenRouteProp<'EmployeeDetails'>>();
  const { employeeId } = route.params;

  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch employees to get this employee's data
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => organizationsApi.getEmployees(1, 100),
  });

  // Fetch medical info to get medical summary
  const { data: medicalData, isLoading: isLoadingMedical } = useQuery({
    queryKey: ['medical-info'],
    queryFn: () => organizationsApi.getMedicalInfo(1, 100),
  });

  // Find the employee and their medical info
  const employee = employeesData?.data.find((e) => e.id === employeeId);
  const medicalInfo = medicalData?.data.find((m) => m.userId === employeeId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditEmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
  });

  // Set form values when employee data is loaded
  useEffect(() => {
    if (employee) {
      setValue('fullName', employee.fullName);
      setValue('email', employee.email);
      setValue('phoneNumber', employee.phoneNumber || '');
    }
  }, [employee, setValue]);

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: (data: EditEmployeeFormData) =>
      organizationsApi.updateEmployee({
        employeeId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['medical-info'] });
      success('Profile has been updated successfully.');
      setIsEditMode(false);
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      let friendlyMessage = 'Unable to update profile. Please try again.';

      if (message.includes('not authorized') || message.includes('unauthorized') || message.includes('permission')) {
        friendlyMessage = "You don't have permission to update this profile.";
      } else if (message.includes('network') || message.includes('connection')) {
        friendlyMessage = 'No internet connection. Please check your network and try again.';
      } else if (message.includes('not found')) {
        friendlyMessage = 'This team member was not found. They may have been removed.';
      } else if (message.includes('email') && (message.includes('exists') || message.includes('taken'))) {
        friendlyMessage = 'This email address is already in use.';
      }

      showError(friendlyMessage);
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: () => organizationsApi.deleteEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['medical-info'] });
      success('Team member has been removed from the organization.');
      navigation.goBack();
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      let friendlyMessage = 'Unable to remove team member. Please try again.';

      if (message.includes('not authorized') || message.includes('unauthorized') || message.includes('permission')) {
        friendlyMessage = "You don't have permission to remove team members.";
      } else if (message.includes('network') || message.includes('connection')) {
        friendlyMessage = 'No internet connection. Please check your network and try again.';
      } else if (message.includes('not found')) {
        friendlyMessage = 'This team member was not found. They may have already been removed.';
      }

      showError(friendlyMessage);
    },
  });

  // Suspend employee mutation
  const suspendEmployeeMutation = useMutation({
    mutationFn: (suspend: boolean) => organizationsApi.suspendEmployee(employeeId, suspend),
    onSuccess: (_, suspend) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['medical-info'] });
      success(suspend ? 'Access has been suspended for this team member.' : 'Access has been restored for this team member.');
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      let friendlyMessage = 'Unable to update access status. Please try again.';

      if (message.includes('not authorized') || message.includes('unauthorized') || message.includes('permission')) {
        friendlyMessage = "You don't have permission to change access status.";
      } else if (message.includes('network') || message.includes('connection')) {
        friendlyMessage = 'No internet connection. Please check your network and try again.';
      } else if (message.includes('not found')) {
        friendlyMessage = 'This team member was not found. Please refresh and try again.';
      }

      showError(friendlyMessage);
    },
  });

  const handleBack = () => {
    if (isEditMode) {
      setIsEditMode(false);
      if (employee) {
        reset({
          fullName: employee.fullName,
          email: employee.email,
          phoneNumber: employee.phoneNumber || '',
        });
      }
    } else {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (employee) {
      reset({
        fullName: employee.fullName,
        email: employee.email,
        phoneNumber: employee.phoneNumber || '',
      });
    }
  };

  const onSubmit = (data: EditEmployeeFormData) => {
    updateEmployeeMutation.mutate(data);
  };

  const handleDelete = () => {
    if (!employee) return;

    Alert.alert(
      'Remove Employee?',
      `This will remove ${employee.fullName} from your organization. They will lose access to organization features but keep their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteEmployeeMutation.mutate(),
        },
      ]
    );
  };

  const handleSuspend = () => {
    if (!employee) return;

    Alert.alert(
      'Suspend Employee?',
      `This will temporarily block ${employee.fullName} from accessing the app. They can be unsuspended later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'default',
          onPress: () => suspendEmployeeMutation.mutate(true),
        },
      ]
    );
  };

  const handleReactivate = () => {
    suspendEmployeeMutation.mutate(false);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isLoading = isLoadingEmployees || isLoadingMedical;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {dashboardConfig.terminology.user} Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible />
        </View>
      </SafeAreaView>
    );
  }

  if (!employee) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {dashboardConfig.terminology.user} Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={STATUS.error.main} />
          <Text style={styles.errorTitle}>Employee Not Found</Text>
          <Text style={styles.errorSubtitle}>
            This employee may have been removed from the organization.
          </Text>
          <Button onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

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
            {isEditMode ? (
              <X size={24} color={SEMANTIC.text.primary} />
            ) : (
              <ArrowLeft size={24} color={SEMANTIC.text.primary} />
            )}
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isEditMode ? 'Edit Profile' : employee.fullName}
          </Text>
          {!isEditMode ? (
            <Pressable onPress={handleEdit} style={styles.editButton}>
              <Pencil size={20} color={PRIMARY[600]} />
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isEditMode ? (
            // Edit Mode
            <Card variant="elevated" padding="lg">
              <View style={styles.form}>
                {/* Avatar */}
                <View style={styles.editAvatarContainer}>
                  <View
                    style={[
                      styles.largeAvatar,
                      { backgroundColor: `${dashboardConfig.themeColors.primary}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.largeAvatarText,
                        { color: dashboardConfig.themeColors.primary },
                      ]}
                    >
                      {getInitials(employee.fullName)}
                    </Text>
                  </View>
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
                      label="Phone Number"
                      placeholder="Enter phone number (optional)"
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

                {/* Buttons */}
                <View style={styles.editButtonsRow}>
                  <Button
                    variant="outline"
                    onPress={handleCancelEdit}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={handleSubmit(onSubmit)}
                    loading={updateEmployeeMutation.isPending}
                    disabled={updateEmployeeMutation.isPending}
                    style={styles.saveButton}
                  >
                    Save Changes
                  </Button>
                </View>
              </View>
            </Card>
          ) : (
            // View Mode
            <>
              {/* Suspended Banner */}
              {employee.suspended && (
                <View style={styles.suspendedBanner}>
                  <AlertTriangle size={20} color={STATUS.warning.main} />
                  <Text style={styles.suspendedBannerText}>
                    This employee's access is currently suspended
                  </Text>
                </View>
              )}

              {/* Profile Info Card */}
              <Card variant="elevated" padding="lg" style={styles.profileCard}>
                {/* Avatar and Name */}
                <View style={styles.profileHeader}>
                  <View
                    style={[
                      styles.largeAvatar,
                      { backgroundColor: `${dashboardConfig.themeColors.primary}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.largeAvatarText,
                        { color: dashboardConfig.themeColors.primary },
                      ]}
                    >
                      {getInitials(employee.fullName)}
                    </Text>
                  </View>
                  <Text style={styles.profileName}>{employee.fullName}</Text>

                  {/* Profile Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: employee.profileComplete
                          ? `${STATUS.success.main}15`
                          : `${STATUS.warning.main}15`,
                      },
                    ]}
                  >
                    {employee.profileComplete ? (
                      <CheckCircle size={14} color={STATUS.success.main} />
                    ) : (
                      <AlertCircle size={14} color={STATUS.warning.main} />
                    )}
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: employee.profileComplete
                            ? STATUS.success.main
                            : STATUS.warning.main,
                        },
                      ]}
                    >
                      {employee.profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                    </Text>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Mail size={18} color={SEMANTIC.text.tertiary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{employee.email}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Phone size={18} color={SEMANTIC.text.tertiary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue}>
                        {employee.phoneNumber || 'Not provided'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Calendar size={18} color={SEMANTIC.text.tertiary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Joined</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(employee.joinedAt || employee.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Medical Summary Card */}
              <Card variant="elevated" padding="lg" style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Medical Summary</Text>

                <View style={styles.medicalGrid}>
                  {/* Blood Type */}
                  <View style={styles.medicalItem}>
                    <View
                      style={[
                        styles.medicalIconContainer,
                        { backgroundColor: `${STATUS.error.main}15` },
                      ]}
                    >
                      <Droplets size={20} color={STATUS.error.main} />
                    </View>
                    <Text style={styles.medicalValue}>
                      {medicalInfo?.bloodType || '—'}
                    </Text>
                    <Text style={styles.medicalLabel}>Blood Type</Text>
                  </View>

                  {/* Allergies */}
                  <View style={styles.medicalItem}>
                    <View
                      style={[
                        styles.medicalIconContainer,
                        { backgroundColor: `${STATUS.warning.main}15` },
                      ]}
                    >
                      <AlertTriangle size={20} color={STATUS.warning.main} />
                    </View>
                    <Text style={styles.medicalValue}>
                      {medicalInfo?.allergies?.length || 0}
                    </Text>
                    <Text style={styles.medicalLabel}>Allergies</Text>
                  </View>

                  {/* Medications */}
                  <View style={styles.medicalItem}>
                    <View
                      style={[
                        styles.medicalIconContainer,
                        { backgroundColor: `${PRIMARY[600]}15` },
                      ]}
                    >
                      <Pill size={20} color={PRIMARY[600]} />
                    </View>
                    <Text style={styles.medicalValue}>
                      {medicalInfo?.medications?.length || 0}
                    </Text>
                    <Text style={styles.medicalLabel}>Medications</Text>
                  </View>

                  {/* Emergency Contacts */}
                  <View style={styles.medicalItem}>
                    <View
                      style={[
                        styles.medicalIconContainer,
                        { backgroundColor: `${STATUS.success.main}15` },
                      ]}
                    >
                      <Users size={20} color={STATUS.success.main} />
                    </View>
                    <Text style={styles.medicalValue}>
                      {medicalInfo?.emergencyContactsCount || 0}
                    </Text>
                    <Text style={styles.medicalLabel}>Emergency Contacts</Text>
                  </View>
                </View>

                {!medicalInfo?.profileComplete && (
                  <View style={styles.incompleteNotice}>
                    <AlertCircle size={16} color={STATUS.warning.main} />
                    <Text style={styles.incompleteNoticeText}>
                      This {dashboardConfig.terminology.user.toLowerCase()} hasn't completed their medical profile yet.
                    </Text>
                  </View>
                )}
              </Card>

              {/* Suspend/Reactivate Button */}
              {employee.suspended ? (
                <Pressable
                  style={styles.reactivateButton}
                  onPress={handleReactivate}
                  disabled={suspendEmployeeMutation.isPending}
                >
                  <UserCheck size={20} color={STATUS.success.main} />
                  <Text style={styles.reactivateButtonText}>Reactivate Access</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.suspendButton}
                  onPress={handleSuspend}
                  disabled={suspendEmployeeMutation.isPending}
                >
                  <UserX size={20} color={STATUS.warning.main} />
                  <Text style={styles.suspendButtonText}>Suspend Access</Text>
                </Pressable>
              )}

              {/* Delete Button */}
              <Pressable
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleteEmployeeMutation.isPending}
              >
                <Trash2 size={20} color={STATUS.error.main} />
                <Text style={styles.deleteButtonText}>
                  Remove {dashboardConfig.terminology.user}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {(updateEmployeeMutation.isPending || deleteEmployeeMutation.isPending || suspendEmployeeMutation.isPending) && (
          <LoadingSpinner visible overlay />
        )}
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginHorizontal: spacing[2],
  },
  editButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[4],
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  errorSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  // Profile Card
  profileCard: {
    marginBottom: spacing[4],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  largeAvatarText: {
    fontSize: 28,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoSection: {
    gap: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
  // Medical Summary
  sectionCard: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  medicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  medicalItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: GRAY[50],
    borderRadius: 12,
    padding: spacing[4],
  },
  medicalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  medicalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  medicalLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    textAlign: 'center',
  },
  incompleteNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: `${STATUS.warning.main}10`,
    borderRadius: 8,
    padding: spacing[3],
    marginTop: spacing[4],
  },
  incompleteNoticeText: {
    flex: 1,
    fontSize: 13,
    color: STATUS.warning.main,
    lineHeight: 18,
  },
  // Edit Mode
  form: {
    gap: spacing[5],
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  // Suspended Banner
  suspendedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  suspendedBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: STATUS.warning.main,
    lineHeight: 20,
  },
  // Suspend Button
  suspendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: `${STATUS.warning.main}10`,
    borderWidth: 1,
    borderColor: `${STATUS.warning.main}30`,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  suspendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: STATUS.warning.main,
  },
  // Reactivate Button
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: `${STATUS.success.main}10`,
    borderWidth: 1,
    borderColor: `${STATUS.success.main}30`,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  reactivateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: STATUS.success.main,
  },
  // Delete Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: `${STATUS.error.main}10`,
    borderWidth: 1,
    borderColor: `${STATUS.error.main}30`,
    borderRadius: 12,
    padding: spacing[4],
    marginTop: spacing[2],
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: STATUS.error.main,
  },
});

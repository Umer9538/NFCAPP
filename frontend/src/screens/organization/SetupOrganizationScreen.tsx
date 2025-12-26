/**
 * Setup Organization Screen
 * Allows organization users to create their organization
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Building2, ArrowLeft } from 'lucide-react-native';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { organizationsApi } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { text } from '@/constants/styles';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Validation schema
const setupOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  domain: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(val),
      'Please enter a valid domain (e.g., company.com)'
    ),
});

type SetupOrgFormData = z.infer<typeof setupOrgSchema>;

export default function SetupOrganizationScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Get user and account type from auth store
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const accountType = user?.accountType || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupOrgFormData>({
    resolver: zodResolver(setupOrgSchema),
    defaultValues: {
      name: '',
      domain: '',
    },
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: (data: SetupOrgFormData) =>
      organizationsApi.createMyOrg({
        name: data.name,
        type: accountType === 'individual' ? 'corporate' : accountType,
        domain: data.domain || undefined,
      }),
    onSuccess: (org) => {
      success('Organization created successfully!');

      // Update user with organization ID
      if (user) {
        setUser({
          ...user,
          organizationId: org.id,
        });
      }

      // Navigate to home/dashboard
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }, 1000);
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to create organization');
    },
  });

  const onSubmit = (data: SetupOrgFormData) => {
    createOrgMutation.mutate(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Get terminology based on account type
  const getOrgTypeLabel = () => {
    switch (accountType) {
      case 'corporate':
        return 'Corporate';
      case 'construction':
        return 'Construction';
      case 'education':
        return 'Educational Institution';
      default:
        return 'Organization';
    }
  };

  const getOrgTypeDescription = () => {
    switch (accountType) {
      case 'corporate':
        return 'Manage employee health records and workplace safety';
      case 'construction':
        return 'Track worker safety and site health compliance';
      case 'education':
        return 'Manage student health records and campus safety';
      default:
        return 'Manage member health records';
    }
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
          <Text style={styles.headerTitle}>Setup Organization</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon and Title */}
          <View style={styles.titleSection}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${dashboardConfig.themeColors.primary}15` },
              ]}
            >
              <Building2 size={64} color={dashboardConfig.themeColors.primary} />
            </View>
            <Text style={[text.h2, styles.title]}>Create Your Organization</Text>
            <Text style={[text.bodySmall, styles.subtitle]}>
              Set up your organization to manage {dashboardConfig.terminology.users.toLowerCase()} and their medical profiles
            </Text>
          </View>

          {/* Form */}
          <Card variant="elevated" padding="lg">
            <View style={styles.form}>
              {/* Organization Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Organization Name"
                    placeholder="Enter organization name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    autoCapitalize="words"
                    required
                  />
                )}
              />

              {/* Organization Type (Read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Organization Type</Text>
                <View
                  style={[
                    styles.typeBadgeContainer,
                    { backgroundColor: `${dashboardConfig.themeColors.primary}10` },
                  ]}
                >
                  <View
                    style={[
                      styles.typeBadgeIcon,
                      { backgroundColor: `${dashboardConfig.themeColors.primary}20` },
                    ]}
                  >
                    <Building2 size={20} color={dashboardConfig.themeColors.primary} />
                  </View>
                  <View style={styles.typeBadgeText}>
                    <Text
                      style={[
                        styles.typeBadgeTitle,
                        { color: dashboardConfig.themeColors.primary },
                      ]}
                    >
                      {getOrgTypeLabel()}
                    </Text>
                    <Text style={styles.typeBadgeDescription}>
                      {getOrgTypeDescription()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Email Domain */}
              <Controller
                control={control}
                name="domain"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Email Domain"
                      placeholder="company.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.domain?.message}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    <Text style={styles.helperText}>
                      Optional. {dashboardConfig.terminology.users} with matching email domains can easily join your organization.
                    </Text>
                  </View>
                )}
              />

              {/* Create Button */}
              <Button
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={createOrgMutation.isPending}
                disabled={createOrgMutation.isPending}
                style={styles.createButton}
              >
                {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
              </Button>
            </View>
          </Card>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              After creating your organization, you'll be able to invite{' '}
              {dashboardConfig.terminology.users.toLowerCase()} and manage their medical profiles.
            </Text>
          </View>
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {createOrgMutation.isPending && <LoadingSpinner visible overlay />}
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
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  form: {
    gap: spacing[5],
  },
  fieldContainer: {
    gap: spacing[2],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  typeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    gap: spacing[3],
  },
  typeBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: {
    flex: 1,
    gap: 2,
  },
  typeBadgeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeBadgeDescription: {
    fontSize: 12,
    color: SEMANTIC.text.secondary,
  },
  helperText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: spacing[2],
    lineHeight: 18,
  },
  createButton: {
    marginTop: spacing[2],
  },
  infoContainer: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  infoText: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

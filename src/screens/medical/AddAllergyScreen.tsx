/**
 * Add Allergy Screen
 * Form to add or edit allergies
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { profileApi } from '@/api/profile';
import { ALLERGY_SEVERITY } from '@/constants';
import type { AllergySeverity } from '@/constants';
import { SEMANTIC, STATUS, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppStackParamList, AppScreenNavigationProp } from '@/navigation/types';

// Severity colors matching the design
const SEVERITY_COLORS = {
  mild: { bg: '#fef9c3', text: '#854d0e', border: '#fbbf24' },
  moderate: { bg: '#fed7aa', text: '#9a3412', border: '#f97316' },
  severe: { bg: '#fecaca', text: '#991b1b', border: '#ef4444' },
};

// Validation schema
const allergySchema = z.object({
  allergen: z
    .string()
    .min(2, 'Allergen must be at least 2 characters')
    .max(100, 'Allergen must be less than 100 characters'),
  severity: z.enum(['mild', 'moderate', 'severe'], {
    required_error: 'Please select a severity level',
  }),
  reaction: z
    .string()
    .min(5, 'Please describe the reaction (at least 5 characters)')
    .max(500, 'Reaction description must be less than 500 characters'),
});

type AllergyFormData = z.infer<typeof allergySchema>;

type AddAllergyRouteProp = RouteProp<AppStackParamList, 'AddAllergy'>;

export default function AddAllergyScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<AddAllergyRouteProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const allergyId = route.params?.allergyId;
  const isEditing = !!allergyId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      allergen: '',
      severity: 'mild',
      reaction: '',
    },
  });

  const selectedSeverity = watch('severity');

  // Add allergy mutation
  const addAllergyMutation = useMutation({
    mutationFn: (data: AllergyFormData) =>
      profileApi.addAllergy({
        allergen: data.allergen,
        severity: data.severity,
        reaction: data.reaction,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
      success('Allergy added successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to add allergy');
    },
  });

  const onSubmit = (data: AllergyFormData) => {
    addAllergyMutation.mutate(data);
  };

  const handleBack = () => {
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
            {isEditing ? 'Edit Allergy' : 'Add Allergy'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color={STATUS.error.main} />
            <Text style={styles.warningText}>
              Accurate allergy information can be life-saving in emergencies
            </Text>
          </View>

          {/* Form Card */}
          <Card variant="elevated" padding="lg">
            <View style={styles.form}>
              {/* Icon Header */}
              <View style={styles.formHeader}>
                <View style={[styles.formIcon, { backgroundColor: `${STATUS.error.main}15` }]}>
                  <AlertTriangle size={32} color={STATUS.error.main} />
                </View>
                <Text style={styles.formTitle}>Allergy Details</Text>
              </View>

              {/* Allergen Name */}
              <Controller
                control={control}
                name="allergen"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Allergen"
                    placeholder="e.g., Penicillin, Peanuts, Latex"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.allergen?.message}
                    autoCapitalize="words"
                    required
                  />
                )}
              />

              {/* Severity Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Severity <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="severity"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.severityContainer}>
                      {ALLERGY_SEVERITY.map((option) => {
                        const isSelected = value === option.value;
                        const colors = SEVERITY_COLORS[option.value as AllergySeverity];

                        return (
                          <Pressable
                            key={option.value}
                            style={[
                              styles.severityOption,
                              isSelected && {
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                              },
                            ]}
                            onPress={() => onChange(option.value)}
                          >
                            <Text
                              style={[
                                styles.severityText,
                                isSelected && { color: colors.text, fontWeight: '600' },
                              ]}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
                {errors.severity?.message && (
                  <Text style={styles.errorText}>{errors.severity.message}</Text>
                )}
              </View>

              {/* Reaction Description */}
              <Controller
                control={control}
                name="reaction"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Reaction"
                    placeholder="Describe what happens during an allergic reaction"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.reaction?.message}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    leftIcon={<Activity size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                )}
              />

              {/* Selected Severity Preview */}
              {selectedSeverity && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Severity Level:</Text>
                  <View
                    style={[
                      styles.previewBadge,
                      { backgroundColor: SEVERITY_COLORS[selectedSeverity].bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewBadgeText,
                        { color: SEVERITY_COLORS[selectedSeverity].text },
                      ]}
                    >
                      {selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <Button
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={addAllergyMutation.isPending}
                disabled={addAllergyMutation.isPending}
                style={styles.submitButton}
              >
                {addAllergyMutation.isPending ? 'Saving...' : isEditing ? 'Update Allergy' : 'Add Allergy'}
              </Button>
            </View>
          </Card>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Text style={styles.helperText}>
              Common allergens include medications (penicillin, aspirin), foods (peanuts, shellfish, eggs),
              insect stings (bees, wasps), and materials (latex, nickel).
            </Text>
          </View>
        </ScrollView>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {addAllergyMutation.isPending && <LoadingSpinner visible overlay />}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: STATUS.error.main,
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
  fieldContainer: {
    gap: spacing[2],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  required: {
    color: STATUS.error.main,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  severityOption: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  severityText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  errorText: {
    fontSize: 12,
    color: STATUS.error.main,
    marginTop: spacing[1],
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: GRAY[50],
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  previewBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
  previewBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing[2],
  },
  helperContainer: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[2],
  },
  helperText: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    lineHeight: 20,
    textAlign: 'center',
  },
});

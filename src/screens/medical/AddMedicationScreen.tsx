/**
 * Add Medication Screen
 * Form to add or edit medications with frequency presets
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
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Pill,
  Clock,
  ChevronDown,
  Check,
  User,
  Calendar,
  FileText,
  X,
} from 'lucide-react-native';

import { Button, Input, Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import { profileApi } from '@/api/profile';
import { MEDICATION_FREQUENCY } from '@/constants';
import { SEMANTIC, STATUS, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppStackParamList, AppScreenNavigationProp } from '@/navigation/types';

// Validation schema
const medicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Medication name must be at least 2 characters')
    .max(100, 'Medication name must be less than 100 characters'),
  dosage: z
    .string()
    .min(1, 'Please enter the dosage')
    .max(50, 'Dosage must be less than 50 characters'),
  frequencyPreset: z.string().min(1, 'Please select a frequency'),
  customFrequency: z.string().optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.frequencyPreset === 'custom') {
      return data.customFrequency && data.customFrequency.length >= 2;
    }
    return true;
  },
  {
    message: 'Please enter a custom frequency',
    path: ['customFrequency'],
  }
);

type MedicationFormData = z.infer<typeof medicationSchema>;

type AddMedicationRouteProp = RouteProp<AppStackParamList, 'AddMedication'>;

// Helper to get frequency label from value
const getFrequencyLabel = (value: string): string => {
  const preset = MEDICATION_FREQUENCY.find((f) => f.value === value);
  return preset?.label || value;
};

export default function AddMedicationScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<AddMedicationRouteProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const medicationId = route.params?.medicationId;
  const isEditing = !!medicationId;

  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequencyPreset: '',
      customFrequency: '',
      prescribedBy: '',
      notes: '',
    },
  });

  const selectedPreset = watch('frequencyPreset');
  const isCustom = selectedPreset === 'custom';

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: (data: MedicationFormData) => {
      const frequency = data.frequencyPreset === 'custom'
        ? data.customFrequency!
        : getFrequencyLabel(data.frequencyPreset);

      return profileApi.addMedication({
        name: data.name,
        dosage: data.dosage,
        frequency,
        prescribedBy: data.prescribedBy || undefined,
        notes: data.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      success('Medication added successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to add medication');
    },
  });

  const onSubmit = (data: MedicationFormData) => {
    addMedicationMutation.mutate(data);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectFrequency = (value: string) => {
    setValue('frequencyPreset', value);
    if (value !== 'custom') {
      setValue('customFrequency', '');
    }
    setShowFrequencyPicker(false);
  };

  const renderFrequencyOption = ({ item }: { item: typeof MEDICATION_FREQUENCY[number] }) => {
    const isSelected = selectedPreset === item.value;
    return (
      <Pressable
        style={[styles.frequencyOption, isSelected && styles.frequencyOptionSelected]}
        onPress={() => handleSelectFrequency(item.value)}
      >
        <Text style={[styles.frequencyOptionText, isSelected && styles.frequencyOptionTextSelected]}>
          {item.label}
        </Text>
        {isSelected && <Check size={20} color={PRIMARY[600]} />}
      </Pressable>
    );
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
            {isEditing ? 'Edit Medication' : 'Add Medication'}
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
            <Pill size={20} color={PRIMARY[600]} />
            <Text style={styles.infoBannerText}>
              Keep your medication list up to date for accurate emergency care
            </Text>
          </View>

          {/* Form Card */}
          <Card variant="elevated" padding="lg">
            <View style={styles.form}>
              {/* Icon Header */}
              <View style={styles.formHeader}>
                <View style={[styles.formIcon, { backgroundColor: `${PRIMARY[600]}15` }]}>
                  <Pill size={32} color={PRIMARY[600]} />
                </View>
                <Text style={styles.formTitle}>Medication Details</Text>
              </View>

              {/* Medication Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Medication Name"
                    placeholder="e.g., Lisinopril, Metformin"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    autoCapitalize="words"
                    leftIcon={<Pill size={20} color={SEMANTIC.text.tertiary} />}
                    required
                  />
                )}
              />

              {/* Dosage */}
              <Controller
                control={control}
                name="dosage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Dosage"
                    placeholder="e.g., 10mg, 500mg"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.dosage?.message}
                    required
                  />
                )}
              />

              {/* Frequency Selector */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Frequency <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="frequencyPreset"
                  render={({ field: { value } }) => (
                    <Pressable
                      style={[
                        styles.frequencySelector,
                        errors.frequencyPreset && styles.frequencySelectorError,
                      ]}
                      onPress={() => setShowFrequencyPicker(true)}
                    >
                      <Clock size={20} color={SEMANTIC.text.tertiary} />
                      <Text
                        style={[
                          styles.frequencySelectorText,
                          !value && styles.frequencySelectorPlaceholder,
                        ]}
                      >
                        {value ? getFrequencyLabel(value) : 'Select frequency'}
                      </Text>
                      <ChevronDown size={20} color={SEMANTIC.text.tertiary} />
                    </Pressable>
                  )}
                />
                {errors.frequencyPreset?.message && (
                  <Text style={styles.errorText}>{errors.frequencyPreset.message}</Text>
                )}
              </View>

              {/* Custom Frequency Input (shown when "Custom" is selected) */}
              {isCustom && (
                <Controller
                  control={control}
                  name="customFrequency"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Custom Frequency"
                      placeholder="e.g., Every 12 hours with food"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.customFrequency?.message}
                      leftIcon={<Clock size={20} color={SEMANTIC.text.tertiary} />}
                      required
                    />
                  )}
                />
              )}

              {/* Prescribed By */}
              <Controller
                control={control}
                name="prescribedBy"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Prescribed By"
                    placeholder="Doctor's name (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.prescribedBy?.message}
                    autoCapitalize="words"
                    leftIcon={<User size={20} color={SEMANTIC.text.tertiary} />}
                  />
                )}
              />

              {/* Notes */}
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Notes"
                    placeholder="Additional instructions or notes (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.notes?.message}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    leftIcon={<FileText size={20} color={SEMANTIC.text.tertiary} />}
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                fullWidth
                onPress={handleSubmit(onSubmit)}
                loading={addMedicationMutation.isPending}
                disabled={addMedicationMutation.isPending}
                style={styles.submitButton}
              >
                {addMedicationMutation.isPending ? 'Saving...' : isEditing ? 'Update Medication' : 'Add Medication'}
              </Button>
            </View>
          </Card>
        </ScrollView>

        {/* Frequency Picker Modal */}
        <Modal
          visible={showFrequencyPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFrequencyPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Frequency</Text>
                <Pressable
                  onPress={() => setShowFrequencyPicker(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={SEMANTIC.text.primary} />
                </Pressable>
              </View>
              <FlatList
                data={MEDICATION_FREQUENCY}
                keyExtractor={(item) => item.value}
                renderItem={renderFrequencyOption}
                ItemSeparatorComponent={() => <View style={styles.frequencyDivider} />}
                style={styles.frequencyList}
              />
            </View>
          </View>
        </Modal>

        {/* Toast */}
        <Toast {...toastConfig} onDismiss={hideToast} />

        {/* Loading Overlay */}
        {addMedicationMutation.isPending && <LoadingSpinner visible overlay />}
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
  frequencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  frequencySelectorError: {
    borderColor: STATUS.error.main,
  },
  frequencySelectorText: {
    flex: 1,
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  frequencySelectorPlaceholder: {
    color: GRAY[400],
  },
  errorText: {
    fontSize: 12,
    color: STATUS.error.main,
    marginTop: spacing[1],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  modalCloseButton: {
    padding: spacing[1],
  },
  frequencyList: {
    paddingHorizontal: spacing[4],
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
  },
  frequencyOptionSelected: {
    backgroundColor: `${PRIMARY[600]}08`,
  },
  frequencyOptionText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  frequencyOptionTextSelected: {
    color: PRIMARY[600],
    fontWeight: '600',
  },
  frequencyDivider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
  },
});

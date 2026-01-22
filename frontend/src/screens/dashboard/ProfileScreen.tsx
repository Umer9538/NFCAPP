/**
 * Profile Screen (Medical Profile Editor)
 * Complete medical profile management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Input,
  Card,
  Select,
  TextArea,
  Modal,
  Toast,
  useToast,
  LoadingSpinner,
} from '@/components/ui';
import { profileApi } from '@/api/profile';
import { useResponsive } from '@/hooks/useResponsive';
import type {
  UpdateProfileRequest,
  AddAllergyRequest,
  Allergy,
  Medication,
  MedicalCondition,
} from '@/types/profile';
import {
  BLOOD_TYPES,
  ALLERGY_SEVERITY,
  MEDICATION_FREQUENCY,
  PRIMARY,
  SEMANTIC,
  STATUS,
  MEDICAL_COLORS,
} from '@/constants';
import { text } from '@/constants/styles';
import { spacing } from '@/theme/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { containerPadding, maxContentWidth, fontSize, sp, isTablet, isSmallDevice } = useResponsive();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [newAllergy, setNewAllergy] = useState<AddAllergyRequest>({
    allergen: '',
    severity: 'mild',
    reaction: '',
  });

  // Fetch profile - no placeholder data, show real data only
  const { data: profile, isLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  // Handle profile fetch errors with friendly messages
  React.useEffect(() => {
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      const errorMsg = (profileError as any)?.message || '';

      // Provide user-friendly error messages
      if (errorMsg.toLowerCase().includes('not found')) {
        showError('Profile not found. Please complete your profile setup.');
      } else if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('connection')) {
        showError('Unable to load profile. Please check your internet connection.');
      } else if (errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('session')) {
        showError('Your session has expired. Please log in again.');
      } else {
        showError('Unable to load your profile. Please try again.');
      }
    }
  }, [profileError]);

  // Form
  const { control, handleSubmit, setValue, watch, reset } = useForm<UpdateProfileRequest>({
    defaultValues: {
      bloodType: undefined,
      height: undefined,
      weight: undefined,
      dateOfBirth: undefined,
      gender: undefined,
      emergencyNotes: '',
      isOrganDonor: false,
      hasDNR: false,
    },
  });

  // Reset form when profile data loads
  React.useEffect(() => {
    if (profile) {
      reset({
        bloodType: profile.bloodType,
        height: profile.height,
        weight: profile.weight,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        emergencyNotes: profile.emergencyNotes || '',
        isOrganDonor: profile.isOrganDonor || false,
        hasDNR: profile.hasDNR || false,
      });
    }
  }, [profile, reset]);

  const dateOfBirth = watch('dateOfBirth');
  const emergencyNotes = watch('emergencyNotes');

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      success('Your profile has been updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('network') || msg.includes('connection')) {
        showError('Unable to save changes. Please check your internet connection.');
      } else {
        showError('Unable to save your profile. Please try again.');
      }
    },
  });

  // Add allergy mutation
  const addAllergyMutation = useMutation({
    mutationFn: profileApi.addAllergy,
    onSuccess: () => {
      success('Allergy added to your profile!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowAllergyModal(false);
      setNewAllergy({ allergen: '', severity: 'mild', reaction: '' });
    },
    onError: (error: any) => {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('already')) {
        showError('This allergy is already in your profile.');
      } else {
        showError('Unable to add allergy. Please try again.');
      }
    },
  });

  // Remove allergy mutation
  const removeAllergyMutation = useMutation({
    mutationFn: profileApi.removeAllergy,
    onSuccess: () => {
      success('Allergy removed from your profile.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showError('Unable to remove allergy. Please try again.');
    },
  });

  // Remove condition mutation
  const removeConditionMutation = useMutation({
    mutationFn: profileApi.removeCondition,
    onSuccess: () => {
      success('Medical condition removed.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showError('Unable to remove condition. Please try again.');
    },
  });

  // Remove medication mutation
  const removeMedicationMutation = useMutation({
    mutationFn: profileApi.removeMedication,
    onSuccess: () => {
      success('Medication removed from your profile.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showError('Unable to remove medication. Please try again.');
    },
  });

  const onSubmit = (data: any) => {
    // Build request body matching backend schema
    const requestBody = {
      medicalProfile: {
        bloodType: (data.bloodType || profile?.bloodType || 'O+') as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
        height: data.height ? `${data.height}cm` : `${profile?.height || 0}cm`,
        weight: data.weight ? `${data.weight}kg` : `${profile?.weight || 0}kg`,
        isOrganDonor: data.isOrganDonor ?? profile?.isOrganDonor ?? false,
        hasDNR: data.hasDNR ?? profile?.hasDNR ?? false,
        emergencyNotes: data.emergencyNotes || profile?.emergencyNotes || '',
        // Include existing arrays from profile
        allergies: (profile?.allergies || []).map((a: Allergy) => ({
          allergen: a.allergen,
          severity: a.severity,
          reaction: a.reaction,
        })),
        medicalConditions: (profile?.conditions || []).map((c: MedicalCondition) => c.name),
        medications: (profile?.medications || []).map((m: Medication) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
      },
      emergencyContacts: (profile?.emergencyContacts || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        relation: c.relationship,
        phone: c.phone,
        email: c.email || '',
      })),
    };

    updateMutation.mutate(requestBody as any);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('dateOfBirth', selectedDate.toISOString());
    }
  };

  const handleAddAllergy = () => {
    if (!newAllergy.allergen.trim()) {
      showError('Please enter allergen name');
      return;
    }
    addAllergyMutation.mutate(newAllergy);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return STATUS.error;
      case 'moderate':
        return STATUS.warning;
      case 'mild':
        return STATUS.info;
      default:
        return SEMANTIC.text.tertiary;
    }
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading profile..." />;
  }

  // Responsive styles
  const responsiveContentStyle = {
    padding: containerPadding,
    paddingTop: insets.top + sp(24),
    paddingBottom: spacing[8],
    ...(maxContentWidth && {
      maxWidth: maxContentWidth,
      alignSelf: 'center' as const,
      width: '100%' as const,
    }),
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, responsiveContentStyle]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="medical" size={sp(32)} color={PRIMARY[600]} />
          <Text style={[styles.headerTitle, { fontSize: fontSize(24) }]}>Medical Profile</Text>
          <Text style={[styles.headerSubtitle, { fontSize: fontSize(14) }]}>
            Keep your medical information up to date
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('EditProfile' as any)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={sp(24)} color={PRIMARY[600]} />
          <Text style={[styles.editButtonText, { fontSize: fontSize(14) }]}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Basic Information */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        {/* Blood Type */}
        <Controller
          control={control}
          name="bloodType"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Blood Type"
              value={value}
              onValueChange={onChange}
              options={BLOOD_TYPES.map((type) => ({
                label: type,
                value: type,
              }))}
              placeholder="Select blood type"
            />
          )}
        />

        {/* Height & Weight Row */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Height (cm)"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || undefined)}
                  keyboardType="numeric"
                  placeholder="170"
                />
              )}
            />
          </View>
          <View style={styles.halfWidth}>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Weight (kg)"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || undefined)}
                  keyboardType="numeric"
                  placeholder="70"
                />
              )}
            />
          </View>
        </View>

        {/* Date of Birth */}
        <View>
          <Text style={styles.label}>Date of Birth</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={SEMANTIC.text.tertiary} />
            <Text style={styles.dateButtonText}>
              {dateOfBirth ? format(new Date(dateOfBirth), 'MMM d, yyyy') : 'Select date'}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Gender */}
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Gender"
              value={value}
              onValueChange={onChange}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
                { label: 'Prefer not to say', value: 'prefer_not_to_say' },
              ]}
              placeholder="Select gender"
            />
          )}
        />
      </Card>

      {/* Medical Conditions */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          <Pressable style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={PRIMARY[600]} />
          </Pressable>
        </View>

        {profile?.conditions && profile.conditions.length > 0 ? (
          <View style={styles.list}>
            {profile.conditions.map((condition) => (
              <View key={condition.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{condition.name}</Text>
                  {condition.diagnosedDate && (
                    <Text style={styles.listItemMeta}>
                      Diagnosed: {format(new Date(condition.diagnosedDate), 'MMM yyyy')}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => removeConditionMutation.mutate(condition.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No medical conditions added</Text>
        )}
      </Card>

      {/* Allergies */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAllergyModal(true)}
          >
            <Ionicons name="add-circle" size={24} color={PRIMARY[600]} />
          </Pressable>
        </View>

        {profile?.allergies && profile.allergies.length > 0 ? (
          <View style={styles.list}>
            {profile.allergies.map((allergy) => (
              <View key={allergy.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <View style={styles.allergyHeader}>
                    <Text style={styles.listItemTitle}>{allergy.allergen}</Text>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(allergy.severity) },
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {(allergy.severity || 'unknown').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {allergy.reaction && (
                    <Text style={styles.listItemMeta}>
                      Reaction: {allergy.reaction}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => removeAllergyMutation.mutate(allergy.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No allergies added</Text>
        )}
      </Card>

      {/* Medications */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Medications</Text>
          <Pressable style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={PRIMARY[600]} />
          </Pressable>
        </View>

        {profile?.medications && profile.medications.length > 0 ? (
          <View style={styles.list}>
            {profile.medications.map((medication) => (
              <View key={medication.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{medication.name}</Text>
                  <Text style={styles.listItemMeta}>
                    {medication.dosage} • {medication.frequency}
                  </Text>
                  {medication.prescribedBy && (
                    <Text style={styles.listItemMeta}>
                      Prescribed by: {medication.prescribedBy}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => removeMedicationMutation.mutate(medication.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No medications added</Text>
        )}
      </Card>

      {/* Emergency Notes */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Notes</Text>
        <Text style={styles.sectionDescription}>
          Important information for first responders
        </Text>

        <Controller
          control={control}
          name="emergencyNotes"
          render={({ field: { onChange, value } }) => (
            <>
              <TextArea
                value={value}
                onChangeText={onChange}
                placeholder="e.g., Deaf in left ear, allergic to latex gloves, etc."
                maxLength={500}
                numberOfLines={5}
              />
              <Text style={styles.charCount}>
                {value?.length || 0} / 500 characters
              </Text>
            </>
          )}
        />
      </Card>

      {/* Medical Directives */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Directives</Text>

        <Controller
          control={control}
          name="isOrganDonor"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="heart" size={24} color={MEDICAL_COLORS.red[600]} />
                <Text style={styles.switchText}>Organ Donor</Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: MEDICAL_COLORS.green[600],
                }}
                thumbColor="#ffffff"
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="hasDNR"
          render={({ field: { onChange, value } }) => (
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Ionicons name="alert-circle" size={24} color={STATUS.warning} />
                <Text style={styles.switchText}>Do Not Resuscitate (DNR)</Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: STATUS.warning,
                }}
                thumbColor="#ffffff"
              />
            </View>
          )}
        />
      </Card>

      {/* Save Button */}
      <Button
        fullWidth
        onPress={handleSubmit(onSubmit)}
        loading={updateMutation.isPending}
        style={styles.saveButton}
      >
        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
      </Button>

      {/* Add Allergy Modal */}
      <Modal
        visible={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        title="Add Allergy"
      >
        <View style={styles.modalContent}>
          <Input
            label="Allergen"
            value={newAllergy.allergen}
            onChangeText={(text) => setNewAllergy({ ...newAllergy, allergen: text })}
            placeholder="e.g., Penicillin, Peanuts"
            autoFocus
            required
          />

          <View>
            <Text style={styles.label}>Severity</Text>
            <View style={styles.severityButtons}>
              {ALLERGY_SEVERITY.map((sev) => (
                <Pressable
                  key={sev.value}
                  style={[
                    styles.severityButton,
                    newAllergy.severity === sev.value && styles.severityButtonActive,
                  ]}
                  onPress={() =>
                    setNewAllergy({ ...newAllergy, severity: sev.value })
                  }
                >
                  <Text
                    style={[
                      styles.severityButtonText,
                      newAllergy.severity === sev.value &&
                        styles.severityButtonTextActive,
                    ]}
                  >
                    {sev.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input
            label="Reaction (Optional)"
            value={newAllergy.reaction}
            onChangeText={(text) => setNewAllergy({ ...newAllergy, reaction: text })}
            placeholder="e.g., Hives, difficulty breathing"
          />

          <View style={styles.modalButtons}>
            <Button
              variant="outline"
              onPress={() => setShowAllergyModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleAddAllergy}
              loading={addAllergyMutation.isPending}
              style={styles.modalButton}
            >
              Add Allergy
            </Button>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />
    </ScrollView>
  );
}

// No mock data - using real data from API only

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  contentContainer: {
    flexGrow: 1,
    // Padding is set dynamically via responsiveContentStyle
  },
  header: {
    marginBottom: spacing[6],
  },
  headerContent: {
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: PRIMARY[50],
    borderRadius: 20,
    alignSelf: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  sectionDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 8,
    backgroundColor: SEMANTIC.background.default,
  },
  dateButtonText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  addButton: {
    padding: spacing[1],
  },
  list: {
    gap: spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  listItemMeta: {
    fontSize: 12,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  severityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  deleteButton: {
    padding: spacing[2],
  },
  emptyText: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  charCount: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  saveButton: {
    marginTop: spacing[4],
  },
  modalContent: {
    gap: spacing[4],
  },
  severityButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  severityButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
  },
  severityButtonActive: {
    borderColor: PRIMARY[600],
    backgroundColor: PRIMARY[50],
  },
  severityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  severityButtonTextActive: {
    color: PRIMARY[600],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalButton: {
    flex: 1,
  },
});

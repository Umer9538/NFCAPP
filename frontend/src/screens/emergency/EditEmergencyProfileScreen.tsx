/**
 * Edit Emergency Profile Screen (Medical Profile)
 * Tabbed interface for editing medical profile information
 * Matches website implementation at /dashboard/profile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import {
  Heart,
  AlertCircle,
  Pill,
  Activity,
  Users,
  FileText,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Button, LoadingSpinner, Toast, useToast } from '@/components/ui';
import { profileApi } from '@/api/profile';
import type { MedicalProfile, UpdateProfileRequest } from '@/types/profile';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

// Tab types
type TabKey = 'basic' | 'allergies' | 'medications' | 'conditions' | 'contacts' | 'notes';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { key: 'basic', label: 'Basic Info', icon: <Heart size={16} color={PRIMARY[600]} /> },
  { key: 'allergies', label: 'Allergies', icon: <AlertCircle size={16} color={PRIMARY[600]} /> },
  { key: 'medications', label: 'Medications', icon: <Pill size={16} color={PRIMARY[600]} /> },
  { key: 'conditions', label: 'Conditions', icon: <Activity size={16} color={PRIMARY[600]} /> },
  { key: 'contacts', label: 'Emergency Contacts', icon: <Users size={16} color={PRIMARY[600]} /> },
  { key: 'notes', label: 'Additional Notes', icon: <FileText size={16} color={PRIMARY[600]} /> },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditEmergencyProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [showOrganDonorDropdown, setShowOrganDonorDropdown] = useState(false);
  const [showDNRDropdown, setShowDNRDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bloodType: '' as string,
    height: '' as string,
    weight: '' as string,
    isOrganDonor: false,
    hasDNR: false,
    emergencyNotes: '' as string,
  });

  // Fetch profile
  const { data: profile, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['medicalProfile'],
    queryFn: profileApi.getProfile,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: () => {
      success('Your medical profile has been saved successfully.');
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['medicalProfile'] });
    },
    onError: (err: any) => {
      // Convert technical errors to human-readable messages
      const errorMessage = err.message?.toLowerCase() || '';
      let friendlyMessage = 'Unable to save your changes. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        friendlyMessage = 'Unable to connect. Please check your internet connection and try again.';
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        friendlyMessage = 'Your session has expired. Please log in again.';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        friendlyMessage = 'Some information appears to be incorrect. Please check your entries and try again.';
      } else if (errorMessage.includes('timeout')) {
        friendlyMessage = 'The request took too long. Please try again.';
      }

      showError(friendlyMessage);
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        bloodType: profile.bloodType || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        isOrganDonor: profile.isOrganDonor || false,
        hasDNR: profile.hasDNR || false,
        emergencyNotes: profile.emergencyNotes || '',
      });
    }
  }, [profile]);

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Build request body matching backend schema
    const requestBody = {
      medicalProfile: {
        bloodType: (formData.bloodType || 'O+') as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
        height: formData.height ? `${formData.height}cm` : '0cm',
        weight: formData.weight ? `${formData.weight}kg` : '0kg',
        isOrganDonor: formData.isOrganDonor,
        hasDNR: formData.hasDNR,
        emergencyNotes: formData.emergencyNotes || '',
        // Include existing allergies, medications, conditions from profile
        allergies: (profile?.allergies || []).map(a => ({
          allergen: a.allergen,
          severity: a.severity,
          reaction: a.reaction,
        })),
        medicalConditions: (profile?.conditions || []).map(c => c.name),
        medications: (profile?.medications || []).map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
      },
      emergencyContacts: (profile?.emergencyContacts || []).map(c => ({
        id: c.id,
        name: c.name,
        relation: c.relationship,
        phone: c.phone,
        email: c.email || '',
      })),
    };

    updateMutation.mutate(requestBody);
  };

  const navigateToAddItem = (type: 'allergy' | 'medication' | 'condition' | 'contact') => {
    switch (type) {
      case 'allergy':
        (navigation as any).navigate('AddAllergy');
        break;
      case 'medication':
        (navigation as any).navigate('AddMedication');
        break;
      case 'condition':
        (navigation as any).navigate('AddMedicalCondition');
        break;
      case 'contact':
        (navigation as any).navigate('AddEmergencyContact');
        break;
    }
  };

  const renderBasicInfoTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      {/* Blood Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Blood Type <Text style={styles.required}>*</Text>
        </Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}
        >
          <Text style={formData.bloodType ? styles.dropdownText : styles.dropdownPlaceholder}>
            {formData.bloodType || 'Select blood type'}
          </Text>
          <Ionicons
            name={showBloodTypeDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={GRAY[500]}
          />
        </Pressable>
        {showBloodTypeDropdown && (
          <View style={styles.dropdownMenu}>
            {BLOOD_TYPES.map(type => (
              <Pressable
                key={type}
                style={[
                  styles.dropdownItem,
                  formData.bloodType === type && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  handleFieldChange('bloodType', type);
                  setShowBloodTypeDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    formData.bloodType === type && styles.dropdownItemTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Height & Weight Row */}
      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={formData.height}
            onChangeText={(text) => handleFieldChange('height', text)}
            placeholder="e.g., 180"
            placeholderTextColor={GRAY[400]}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => handleFieldChange('weight', text)}
            placeholder="e.g., 75"
            placeholderTextColor={GRAY[400]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Organ Donor */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Organ Donor</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowOrganDonorDropdown(!showOrganDonorDropdown)}
        >
          <Text style={styles.dropdownText}>
            {formData.isOrganDonor ? 'Yes' : 'No'}
          </Text>
          <Ionicons
            name={showOrganDonorDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={GRAY[500]}
          />
        </Pressable>
        {showOrganDonorDropdown && (
          <View style={styles.dropdownMenu}>
            <Pressable
              style={[styles.dropdownItem, !formData.isOrganDonor && styles.dropdownItemActive]}
              onPress={() => {
                handleFieldChange('isOrganDonor', false);
                setShowOrganDonorDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, !formData.isOrganDonor && styles.dropdownItemTextActive]}>
                No
              </Text>
            </Pressable>
            <Pressable
              style={[styles.dropdownItem, formData.isOrganDonor && styles.dropdownItemActive]}
              onPress={() => {
                handleFieldChange('isOrganDonor', true);
                setShowOrganDonorDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, formData.isOrganDonor && styles.dropdownItemTextActive]}>
                Yes
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* DNR */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Do Not Resuscitate (DNR)</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => setShowDNRDropdown(!showDNRDropdown)}
        >
          <Text style={styles.dropdownText}>
            {formData.hasDNR ? 'Yes' : 'No'}
          </Text>
          <Ionicons
            name={showDNRDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={GRAY[500]}
          />
        </Pressable>
        {showDNRDropdown && (
          <View style={styles.dropdownMenu}>
            <Pressable
              style={[styles.dropdownItem, !formData.hasDNR && styles.dropdownItemActive]}
              onPress={() => {
                handleFieldChange('hasDNR', false);
                setShowDNRDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, !formData.hasDNR && styles.dropdownItemTextActive]}>
                No
              </Text>
            </Pressable>
            <Pressable
              style={[styles.dropdownItem, formData.hasDNR && styles.dropdownItemActive]}
              onPress={() => {
                handleFieldChange('hasDNR', true);
                setShowDNRDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, formData.hasDNR && styles.dropdownItemTextActive]}>
                Yes
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  const renderAllergiesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => navigateToAddItem('allergy')}
          icon={<Ionicons name="add" size={18} color={PRIMARY[600]} />}
        >
          Add Allergy
        </Button>
      </View>

      {profile?.allergies && profile.allergies.length > 0 ? (
        <View style={styles.itemsList}>
          {profile.allergies.map((allergy) => (
            <View key={allergy.id} style={styles.listItem}>
              <View style={styles.listItemIcon}>
                <AlertCircle size={20} color={STATUS.error.main} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{allergy.allergen}</Text>
                {allergy.severity && (
                  <Text style={styles.listItemSubtitle}>Severity: {allergy.severity}</Text>
                )}
                {allergy.reaction && (
                  <Text style={styles.listItemSubtitle}>Reaction: {allergy.reaction}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No allergies added</Text>
          <Text style={styles.emptyText}>Add your allergies so they can be displayed in emergencies</Text>
        </View>
      )}
    </View>
  );

  const renderMedicationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => navigateToAddItem('medication')}
          icon={<Ionicons name="add" size={18} color={PRIMARY[600]} />}
        >
          Add Medication
        </Button>
      </View>

      {profile?.medications && profile.medications.length > 0 ? (
        <View style={styles.itemsList}>
          {profile.medications.map((medication) => (
            <View key={medication.id} style={styles.listItem}>
              <View style={[styles.listItemIcon, { backgroundColor: '#E0F2FE' }]}>
                <Pill size={20} color="#0284C7" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{medication.name}</Text>
                {medication.dosage && (
                  <Text style={styles.listItemSubtitle}>Dosage: {medication.dosage}</Text>
                )}
                {medication.frequency && (
                  <Text style={styles.listItemSubtitle}>Frequency: {medication.frequency}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Pill size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No medications added</Text>
          <Text style={styles.emptyText}>Add your medications so responders know what you're taking</Text>
        </View>
      )}
    </View>
  );

  const renderConditionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Medical Conditions</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => navigateToAddItem('condition')}
          icon={<Ionicons name="add" size={18} color={PRIMARY[600]} />}
        >
          Add Condition
        </Button>
      </View>

      {profile?.conditions && profile.conditions.length > 0 ? (
        <View style={styles.itemsList}>
          {profile.conditions.map((condition) => (
            <View key={condition.id} style={styles.listItem}>
              <View style={[styles.listItemIcon, { backgroundColor: '#FEF3C7' }]}>
                <Activity size={20} color="#D97706" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{condition.name}</Text>
                {condition.diagnosedDate && (
                  <Text style={styles.listItemSubtitle}>Diagnosed: {condition.diagnosedDate}</Text>
                )}
                {condition.notes && (
                  <Text style={styles.listItemSubtitle}>{condition.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Activity size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No conditions added</Text>
          <Text style={styles.emptyText}>Add your medical conditions for emergency responders</Text>
        </View>
      )}
    </View>
  );

  const renderContactsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => navigateToAddItem('contact')}
          icon={<Ionicons name="add" size={18} color={PRIMARY[600]} />}
        >
          Add Contact
        </Button>
      </View>

      {profile?.emergencyContacts && profile.emergencyContacts.length > 0 ? (
        <View style={styles.itemsList}>
          {profile.emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.listItem}>
              <View style={[styles.listItemIcon, { backgroundColor: '#F3E8FF' }]}>
                <Users size={20} color="#9333EA" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>
                  {contact.name}
                  {contact.isPrimary && (
                    <Text style={styles.primaryBadge}> (Primary)</Text>
                  )}
                </Text>
                <Text style={styles.listItemSubtitle}>{contact.relationship}</Text>
                <Text style={styles.listItemSubtitle}>{contact.phone}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Users size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No emergency contacts</Text>
          <Text style={styles.emptyText}>Add emergency contacts who can be reached in an emergency</Text>
        </View>
      )}
    </View>
  );

  const renderNotesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Additional Notes</Text>
      <Text style={styles.sectionSubtitle}>
        Any additional information that emergency responders should know
      </Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.emergencyNotes}
        onChangeText={(text) => handleFieldChange('emergencyNotes', text)}
        placeholder="Enter any additional medical information, instructions, or notes..."
        placeholderTextColor={GRAY[400]}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfoTab();
      case 'allergies':
        return renderAllergiesTab();
      case 'medications':
        return renderMedicationsTab();
      case 'conditions':
        return renderConditionsTab();
      case 'contacts':
        return renderContactsTab();
      case 'notes':
        return renderNotesTab();
      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading your medical profile..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Medical Profile</Text>
            <Text style={styles.subtitle}>
              Keep your emergency medical information up to date. This information will be accessible via your NFC bracelet.
            </Text>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.tabActive,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <Card variant="elevated" padding="lg" style={styles.contentCard}>
            {renderTabContent()}
          </Card>
        </ScrollView>

        {/* Save Button - Fixed at bottom */}
        <View style={styles.saveContainer}>
          <Button
            fullWidth
            onPress={handleSave}
            loading={updateMutation.isPending}
            disabled={!hasChanges}
            style={!hasChanges ? styles.saveButtonDisabled : undefined}
          >
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </Button>
        </View>
      </KeyboardAvoidingView>

      <Toast {...toastConfig} onDismiss={hideToast} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[4],
  },
  header: {
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  tabsContainer: {
    maxHeight: 50,
    marginBottom: spacing[4],
  },
  tabsContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    marginRight: spacing[2],
  },
  tabActive: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentCard: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  tabContent: {
    minHeight: 300,
  },
  tabHeader: {
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
  sectionSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    marginTop: -spacing[3],
    marginBottom: spacing[4],
  },
  formGroup: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  required: {
    color: STATUS.error.main,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: 15,
    color: SEMANTIC.text.primary,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 15,
    color: SEMANTIC.text.primary,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: GRAY[400],
  },
  dropdownMenu: {
    marginTop: spacing[2],
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  dropdownItemActive: {
    backgroundColor: PRIMARY[50],
  },
  dropdownItemText: {
    fontSize: 15,
    color: SEMANTIC.text.primary,
  },
  dropdownItemTextActive: {
    color: PRIMARY[600],
    fontWeight: '500',
  },
  itemsList: {
    gap: spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: 10,
    padding: spacing[3],
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  primaryBadge: {
    fontSize: 12,
    color: PRIMARY[600],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  saveContainer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    backgroundColor: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});

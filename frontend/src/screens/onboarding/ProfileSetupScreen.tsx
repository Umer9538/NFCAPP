/**
 * Profile Setup Screen
 * Comprehensive wizard for setting up user profile matching backend schema
 * User must complete this before accessing the dashboard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { api } from '@/api/client';
import { PRIMARY, GRAY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

// Types matching backend schema
interface BasicInfo {
  phoneNumber: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface MedicalProfile {
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  emergencyNotes: string;
  isOrganDonor: boolean;
  hasDNR: boolean;
}

interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  email: string;
}

interface DoctorInfo {
  doctorName: string;
  doctorPhone: string;
  doctorEmail: string;
  doctorSpecialty: string;
  doctorAddress: string;
}

const TOTAL_STEPS = 5;
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function ProfileSetupScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Get userId from route params or user state
  const userId = route.params?.userId || user?.id || '';
  const email = route.params?.email || user?.email || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    medicalConditions: [],
    medications: [],
    emergencyNotes: '',
    isOrganDonor: false,
    hasDNR: false,
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relation: '', phone: '', email: '' },
  ]);

  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    doctorName: '',
    doctorPhone: '',
    doctorEmail: '',
    doctorSpecialty: '',
    doctorAddress: '',
  });

  // Temp inputs for array fields
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const updateBasicInfo = (field: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      updateBasicInfo('dateOfBirth', formattedDate);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getMaxDate = (): Date => {
    // Maximum date is 13 years ago (minimum age)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 13);
    return maxDate;
  };

  const getMinDate = (): Date => {
    // Minimum date is 120 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    return minDate;
  };

  const updateMedicalProfile = (field: keyof MedicalProfile, value: any) => {
    setMedicalProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: '', relation: '', phone: '', email: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addToArray = (field: 'allergies' | 'medicalConditions' | 'medications', value: string) => {
    if (value.trim()) {
      updateMedicalProfile(field, [...medicalProfile[field], value.trim()]);
    }
  };

  const removeFromArray = (field: 'allergies' | 'medicalConditions' | 'medications', index: number) => {
    updateMedicalProfile(field, medicalProfile[field].filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        if (!basicInfo.phoneNumber.trim()) {
          Alert.alert('Required', 'Please enter your phone number');
          return false;
        }
        if (!basicInfo.gender) {
          Alert.alert('Required', 'Please select your gender');
          return false;
        }
        if (!basicInfo.dateOfBirth.trim()) {
          Alert.alert('Required', 'Please enter your date of birth');
          return false;
        }
        return true;

      case 2: // Address
        if (!basicInfo.address.trim()) {
          Alert.alert('Required', 'Please enter your address');
          return false;
        }
        if (!basicInfo.city.trim()) {
          Alert.alert('Required', 'Please enter your city');
          return false;
        }
        if (!basicInfo.province.trim()) {
          Alert.alert('Required', 'Please enter your province/state');
          return false;
        }
        if (!basicInfo.postalCode.trim()) {
          Alert.alert('Required', 'Please enter your postal code');
          return false;
        }
        return true;

      case 3: // Medical Profile
        if (!medicalProfile.bloodType) {
          Alert.alert('Required', 'Please select your blood type');
          return false;
        }
        if (!medicalProfile.height.trim()) {
          Alert.alert('Required', 'Please enter your height');
          return false;
        }
        if (!medicalProfile.weight.trim()) {
          Alert.alert('Required', 'Please enter your weight');
          return false;
        }
        return true;

      case 4: // Emergency Contacts
        const validContact = emergencyContacts.find(
          (c) => c.name.trim() && c.phone.trim()
        );
        if (!validContact) {
          Alert.alert('Required', 'Please add at least one emergency contact with name and phone');
          return false;
        }
        return true;

      case 5: // Doctor Info (optional)
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!userId) {
      Alert.alert('Session Error', 'Your session has expired. Please log in again to continue.');
      return;
    }

    setLoading(true);
    try {
      // Filter valid emergency contacts
      const validContacts = emergencyContacts.filter(
        (c) => c.name.trim() && c.phone.trim()
      );

      // Build request matching backend schema
      const requestData = {
        userId,
        basicInfo: {
          phoneNumber: basicInfo.phoneNumber,
          gender: basicInfo.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say',
          dateOfBirth: basicInfo.dateOfBirth,
          address: basicInfo.address,
          city: basicInfo.city,
          province: basicInfo.province,
          postalCode: basicInfo.postalCode,
        },
        medicalProfile: {
          bloodType: medicalProfile.bloodType as any,
          height: medicalProfile.height,
          weight: medicalProfile.weight,
          allergies: medicalProfile.allergies,
          medicalConditions: medicalProfile.medicalConditions,
          medications: medicalProfile.medications,
          emergencyNotes: medicalProfile.emergencyNotes,
          isOrganDonor: medicalProfile.isOrganDonor,
          hasDNR: medicalProfile.hasDNR,
        },
        doctorInfo: {
          doctorName: doctorInfo.doctorName || undefined,
          doctorPhone: doctorInfo.doctorPhone || undefined,
          doctorEmail: doctorInfo.doctorEmail || undefined,
          doctorSpecialty: doctorInfo.doctorSpecialty || undefined,
          doctorAddress: doctorInfo.doctorAddress || undefined,
        },
        emergencyContacts: validContacts.map((c) => ({
          name: c.name,
          relation: c.relation || undefined,
          phone: c.phone,
          email: c.email || undefined,
        })),
        prescriptions: [],
      };

      // Call backend profile setup endpoint
      const response = await api.post<{ success: boolean; message?: string; error?: string }>(
        '/api/auth/profile-setup',
        requestData
      );

      if (response.success) {
        if (isAuthenticated) {
          // User is already authenticated (came from RootNavigator check)
          // Refresh user data to get profileComplete = true
          const updatedUser = await authApi.getMe();
          setUser(updatedUser);
        } else {
          // User is not authenticated (came from VerifyEmail)
          // Navigate to Login - profileComplete is now true in backend
          Alert.alert(
            'Profile Complete!',
            'Your profile has been set up. Please login to continue.',
            [
              {
                text: 'Login',
                onPress: () => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    })
                  );
                },
              },
            ]
          );
        }
      } else {
        throw new Error(response.error || 'Profile setup failed');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t save your profile. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Unable to connect. Please check your internet connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'The request took too long. Please try again.';
      } else if (errorMessage.includes('validation')) {
        userMessage = 'Please check your information and try again.';
      }

      Alert.alert('Unable to Save Profile', userMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="person" size={40} color={PRIMARY[500]} />
        </View>
        <Text style={styles.stepTitle}>Personal Information</Text>
        <Text style={styles.stepDescription}>Tell us about yourself</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.phoneNumber}
            onChangeText={(v) => updateBasicInfo('phoneNumber', v)}
            placeholder="+1-555-123-4567"
            placeholderTextColor={GRAY[400]}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.optionsGrid}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  basicInfo.gender === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => updateBasicInfo('gender', option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    basicInfo.gender === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <Pressable
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={GRAY[500]} />
            <Text
              style={[
                styles.datePickerText,
                !basicInfo.dateOfBirth && styles.datePickerPlaceholder,
              ]}
            >
              {basicInfo.dateOfBirth
                ? formatDisplayDate(basicInfo.dateOfBirth)
                : 'Select your date of birth'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={GRAY[400]} />
          </Pressable>
        </View>

        {/* Date Picker Modal for iOS */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            transparent
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerCancel}>Cancel</Text>
                  </Pressable>
                  <Text style={styles.datePickerTitle}>Date of Birth</Text>
                  <Pressable
                    onPress={() => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        updateBasicInfo('dateOfBirth', formattedDate);
                      }
                    }}
                  >
                    <Text style={styles.datePickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate || getMaxDate()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setSelectedDate(date);
                  }}
                  maximumDate={getMaxDate()}
                  minimumDate={getMinDate()}
                  style={styles.datePicker}
                  themeVariant="light"
                  textColor="#000000"
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={selectedDate || getMaxDate()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={getMaxDate()}
            minimumDate={getMinDate()}
          />
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="location" size={40} color={PRIMARY[500]} />
        </View>
        <Text style={styles.stepTitle}>Address</Text>
        <Text style={styles.stepDescription}>Your location information</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.address}
            onChangeText={(v) => updateBasicInfo('address', v)}
            placeholder="123 Main Street"
            placeholderTextColor={GRAY[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.city}
            onChangeText={(v) => updateBasicInfo('city', v)}
            placeholder="Toronto"
            placeholderTextColor={GRAY[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Province/State *</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.province}
            onChangeText={(v) => updateBasicInfo('province', v)}
            placeholder="Ontario"
            placeholderTextColor={GRAY[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.postalCode}
            onChangeText={(v) => updateBasicInfo('postalCode', v)}
            placeholder="M5V 1A1"
            placeholderTextColor={GRAY[400]}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="medical" size={40} color={PRIMARY[500]} />
        </View>
        <Text style={styles.stepTitle}>Medical Information</Text>
        <Text style={styles.stepDescription}>Important for emergencies</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Type *</Text>
          <View style={styles.bloodTypeGrid}>
            {BLOOD_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.bloodTypeButton,
                  medicalProfile.bloodType === type && styles.bloodTypeButtonSelected,
                ]}
                onPress={() => updateMedicalProfile('bloodType', type)}
              >
                <Text
                  style={[
                    styles.bloodTypeText,
                    medicalProfile.bloodType === type && styles.bloodTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Height *</Text>
            <TextInput
              style={styles.input}
              value={medicalProfile.height}
              onChangeText={(v) => updateMedicalProfile('height', v)}
              placeholder="175 cm"
              placeholderTextColor={GRAY[400]}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              style={styles.input}
              value={medicalProfile.weight}
              onChangeText={(v) => updateMedicalProfile('weight', v)}
              placeholder="70 kg"
              placeholderTextColor={GRAY[400]}
            />
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allergies</Text>
          <View style={styles.arrayInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={allergyInput}
              onChangeText={setAllergyInput}
              placeholder="Add allergy"
              placeholderTextColor={GRAY[400]}
            />
            <Pressable
              style={styles.addButton}
              onPress={() => {
                addToArray('allergies', allergyInput);
                setAllergyInput('');
              }}
            >
              <Ionicons name="add" size={24} color={PRIMARY[500]} />
            </Pressable>
          </View>
          <View style={styles.tagContainer}>
            {medicalProfile.allergies.map((item, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
                <Pressable onPress={() => removeFromArray('allergies', index)}>
                  <Ionicons name="close-circle" size={18} color={GRAY[500]} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Medical Conditions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical Conditions</Text>
          <View style={styles.arrayInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={conditionInput}
              onChangeText={setConditionInput}
              placeholder="Add condition"
              placeholderTextColor={GRAY[400]}
            />
            <Pressable
              style={styles.addButton}
              onPress={() => {
                addToArray('medicalConditions', conditionInput);
                setConditionInput('');
              }}
            >
              <Ionicons name="add" size={24} color={PRIMARY[500]} />
            </Pressable>
          </View>
          <View style={styles.tagContainer}>
            {medicalProfile.medicalConditions.map((item, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
                <Pressable onPress={() => removeFromArray('medicalConditions', index)}>
                  <Ionicons name="close-circle" size={18} color={GRAY[500]} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Checkboxes */}
        <View style={styles.checkboxRow}>
          <Pressable
            style={styles.checkbox}
            onPress={() => updateMedicalProfile('isOrganDonor', !medicalProfile.isOrganDonor)}
          >
            <Ionicons
              name={medicalProfile.isOrganDonor ? 'checkbox' : 'square-outline'}
              size={24}
              color={PRIMARY[500]}
            />
            <Text style={styles.checkboxLabel}>Organ Donor</Text>
          </Pressable>

          <Pressable
            style={styles.checkbox}
            onPress={() => updateMedicalProfile('hasDNR', !medicalProfile.hasDNR)}
          >
            <Ionicons
              name={medicalProfile.hasDNR ? 'checkbox' : 'square-outline'}
              size={24}
              color={PRIMARY[500]}
            />
            <Text style={styles.checkboxLabel}>DNR (Do Not Resuscitate)</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="call" size={40} color={PRIMARY[500]} />
        </View>
        <Text style={styles.stepTitle}>Emergency Contacts</Text>
        <Text style={styles.stepDescription}>At least one contact is required</Text>
      </View>

      <View style={styles.form}>
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactTitle}>Contact {index + 1}</Text>
              {emergencyContacts.length > 1 && (
                <Pressable onPress={() => removeEmergencyContact(index)}>
                  <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                </Pressable>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={contact.name}
                onChangeText={(v) => updateEmergencyContact(index, 'name', v)}
                placeholder="John Doe"
                placeholderTextColor={GRAY[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                value={contact.relation}
                onChangeText={(v) => updateEmergencyContact(index, 'relation', v)}
                placeholder="Spouse, Parent, etc."
                placeholderTextColor={GRAY[400]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={contact.phone}
                onChangeText={(v) => updateEmergencyContact(index, 'phone', v)}
                placeholder="+1-555-123-4567"
                placeholderTextColor={GRAY[400]}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={contact.email}
                onChangeText={(v) => updateEmergencyContact(index, 'email', v)}
                placeholder="john@example.com"
                placeholderTextColor={GRAY[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        ))}

        <Button variant="outline" onPress={addEmergencyContact}>
          <View style={styles.addContactButton}>
            <Ionicons name="add" size={20} color={PRIMARY[500]} />
            <Text style={styles.addContactText}>Add Another Contact</Text>
          </View>
        </Button>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="medkit" size={40} color={PRIMARY[500]} />
        </View>
        <Text style={styles.stepTitle}>Doctor Information</Text>
        <Text style={styles.stepDescription}>Optional - Your primary care physician</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor's Name</Text>
          <TextInput
            style={styles.input}
            value={doctorInfo.doctorName}
            onChangeText={(v) => setDoctorInfo((prev) => ({ ...prev, doctorName: v }))}
            placeholder="Dr. Jane Smith"
            placeholderTextColor={GRAY[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialty</Text>
          <TextInput
            style={styles.input}
            value={doctorInfo.doctorSpecialty}
            onChangeText={(v) => setDoctorInfo((prev) => ({ ...prev, doctorSpecialty: v }))}
            placeholder="General Practitioner"
            placeholderTextColor={GRAY[400]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={doctorInfo.doctorPhone}
            onChangeText={(v) => setDoctorInfo((prev) => ({ ...prev, doctorPhone: v }))}
            placeholder="+1-555-123-4567"
            placeholderTextColor={GRAY[400]}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={doctorInfo.doctorEmail}
            onChangeText={(v) => setDoctorInfo((prev) => ({ ...prev, doctorEmail: v }))}
            placeholder="doctor@clinic.com"
            placeholderTextColor={GRAY[400]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clinic Address</Text>
          <TextInput
            style={styles.input}
            value={doctorInfo.doctorAddress}
            onChangeText={(v) => setDoctorInfo((prev) => ({ ...prev, doctorAddress: v }))}
            placeholder="123 Medical Center Blvd"
            placeholderTextColor={GRAY[400]}
          />
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of {TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <Button variant="outline" onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color={PRIMARY[500]} />
              </Button>
            )}
            <Button onPress={handleNext} loading={loading} style={styles.nextButton}>
              {currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Next'}
            </Button>
          </View>
        </View>
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
  progressContainer: {
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  progressBar: {
    height: 4,
    backgroundColor: GRAY[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY[500],
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[4],
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  stepIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing[4],
  },
  inputGroup: {
    gap: spacing[1],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: SEMANTIC.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.background.default,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.tertiary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.default,
    gap: spacing[2],
  },
  datePickerText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  datePickerPlaceholder: {
    color: GRAY[400],
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: SEMANTIC.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing[6],
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  datePickerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
  },
  datePickerCancel: {
    fontSize: typography.fontSize.base,
    color: GRAY[500],
  },
  datePickerDone: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: PRIMARY[500],
  },
  datePicker: {
    height: 200,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  optionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 8,
  },
  optionButtonSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
  optionTextSelected: {
    color: PRIMARY[600],
    fontWeight: typography.fontWeight.medium as any,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  bloodTypeButton: {
    width: '22%',
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 8,
    alignItems: 'center',
  },
  bloodTypeButtonSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  bloodTypeText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: SEMANTIC.text.primary,
  },
  bloodTypeTextSelected: {
    color: PRIMARY[600],
  },
  arrayInputRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  addButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: PRIMARY[500],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: GRAY[100],
    borderRadius: 16,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
  checkboxRow: {
    gap: spacing[3],
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkboxLabel: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  contactCard: {
    padding: spacing[4],
    backgroundColor: GRAY[50],
    borderRadius: 12,
    gap: spacing[3],
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  addContactText: {
    color: PRIMARY[500],
    fontWeight: typography.fontWeight.medium as any,
  },
  footer: {
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  backButton: {
    width: 56,
  },
  nextButton: {
    flex: 1,
  },
});

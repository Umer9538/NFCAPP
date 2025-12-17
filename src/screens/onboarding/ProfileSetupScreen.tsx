/**
 * Profile Setup Screen
 * Step-by-step wizard for setting up user profile
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingNavigationProp } from '@/navigation/types';
import { Button, Card } from '@/components/ui';
import { userService, medicalProfileService } from '@/db/services';
import { PRIMARY, GRAY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

const STORAGE_KEY = '@medguard_onboarding_completed';
const DEMO_USER_ID = 'user-demo-001';

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  bloodType: string;
}

export default function ProfileSetupScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    bloodType: '',
  });

  const totalSteps = 3;

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
          Alert.alert('Required', 'Please enter your first and last name');
          return false;
        }
        return true;
      case 2:
        if (!profileData.dateOfBirth || !profileData.phone) {
          Alert.alert('Required', 'Please enter your date of birth and phone number');
          return false;
        }
        return true;
      case 3:
        return true; // Blood type is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
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

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update user profile
      await userService.update(DEMO_USER_ID, {
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        phone: profileData.phone || undefined,
        dateOfBirth: profileData.dateOfBirth || undefined,
      });

      // Update medical profile if blood type provided
      if (profileData.bloodType) {
        const medProfile = await medicalProfileService.getByUserId(DEMO_USER_ID);
        if (medProfile) {
          await medicalProfileService.update(medProfile.id, {
            bloodType: profileData.bloodType,
          });
        }
      }

      // Mark onboarding as completed
      await AsyncStorage.setItem(STORAGE_KEY, 'true');

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'OnboardingComplete' }],
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Ionicons name="person" size={40} color={PRIMARY[500]} />
              </View>
              <Text style={styles.stepTitle}>Basic Information</Text>
              <Text style={styles.stepDescription}>
                Let's start with your name
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="Enter your first name"
                  placeholderTextColor={GRAY[400]}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Enter your last name"
                  placeholderTextColor={GRAY[400]}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Ionicons name="calendar" size={40} color={PRIMARY[500]} />
              </View>
              <Text style={styles.stepTitle}>Contact Information</Text>
              <Text style={styles.stepDescription}>
                Help us reach you in emergencies
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.dateOfBirth}
                  onChangeText={(value) => updateField('dateOfBirth', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={GRAY[400]}
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={styles.hint}>Format: 1990-01-15</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.phone}
                  onChangeText={(value) => updateField('phone', value)}
                  placeholder="+1-555-0123"
                  placeholderTextColor={GRAY[400]}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Ionicons name="water" size={40} color={PRIMARY[500]} />
              </View>
              <Text style={styles.stepTitle}>Medical Information</Text>
              <Text style={styles.stepDescription}>
                Optional but recommended for emergencies
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Type</Text>
                <View style={styles.bloodTypeGrid}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                    <Button
                      key={type}
                      variant={profileData.bloodType === type ? 'primary' : 'outline'}
                      onPress={() => updateField('bloodType', type)}
                      style={styles.bloodTypeButton}
                    >
                      {type}
                    </Button>
                  ))}
                </View>
                <Text style={styles.hint}>
                  You can add more medical information later in your profile
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / totalSteps) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <Button variant="outline" onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={PRIMARY[500]} />
            </Button>
          )}
          <Button
            onPress={handleNext}
            loading={loading}
            style={styles.nextButton}
          >
            {currentStep === totalSteps ? 'Complete' : 'Next'}
          </Button>
        </View>
        {currentStep === totalSteps && (
          <Button variant="ghost" fullWidth onPress={handleSkip}>
            Skip for now
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  progressContainer: {
    padding: spacing[6],
    paddingBottom: spacing[4],
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
    padding: spacing[6],
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing[6],
  },
  inputGroup: {
    gap: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: SEMANTIC.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 12,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.background.default,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.tertiary,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  bloodTypeButton: {
    flex: 1,
    minWidth: '22%',
  },
  footer: {
    padding: spacing[6],
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

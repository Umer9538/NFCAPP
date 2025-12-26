/**
 * Emergency Profile Screen
 * Public screen for emergency responders to access patient information
 * Optimized for quick reading in emergency situations
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';

import { Card, LoadingSpinner } from '@/components/ui';
import { emergencyApi } from '@/api/emergency';
import type { EmergencyProfile, Allergy, Medication, MedicalCondition } from '@/types/dashboard';
import { SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

// Emergency-specific colors (high contrast)
const EMERGENCY_COLORS = {
  alert: '#DC2626', // Red
  critical: '#EF4444',
  warning: '#F59E0B', // Amber
  medication: '#3B82F6', // Blue
  condition: '#F59E0B', // Yellow
  success: '#10B981', // Green
  call: '#059669', // Dark green
  text: {
    light: '#FFFFFF',
    dark: '#1F2937',
  },
  background: {
    alert: '#FEE2E2',
    critical: '#FEF2F2',
    warning: '#FEF3C7',
    medication: '#DBEAFE',
    condition: '#FEF3C7',
    success: '#D1FAE5',
  },
};

type RouteParams = {
  EmergencyProfile: {
    braceletId: string;
  };
};

export default function EmergencyProfileScreen() {
  const route = useRoute<RouteProp<RouteParams, 'EmergencyProfile'>>();
  const braceletId = route.params?.braceletId || 'DEMO-12345';

  // Fetch emergency profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['emergencyProfile', braceletId],
    queryFn: () => emergencyApi.getEmergencyProfile(braceletId),
    // Mock data for development
    placeholderData: getMockEmergencyProfile(braceletId),
  });

  // Log profile access
  const logAccessMutation = useMutation({
    mutationFn: () => emergencyApi.logProfileAccess(braceletId),
  });

  useEffect(() => {
    if (profile) {
      // Log that the profile was accessed
      logAccessMutation.mutate();
    }
  }, [profile]);

  const handleCall = (phone: string, name: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch((err) => console.error('Failed to make call', err));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner visible text="Loading emergency profile..." />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color={EMERGENCY_COLORS.alert} />
          <Text style={styles.errorTitle}>Bracelet Not Found</Text>
          <Text style={styles.errorText}>
            The bracelet ID "{braceletId}" could not be found or is inactive.
          </Text>
          <Text style={styles.errorSubtext}>
            Please verify the bracelet ID and try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile.isActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="ban" size={80} color={EMERGENCY_COLORS.warning} />
          <Text style={styles.errorTitle}>Bracelet Inactive</Text>
          <Text style={styles.errorText}>
            This bracelet has been deactivated by the owner.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Emergency Alert Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="medical" size={32} color={EMERGENCY_COLORS.text.light} />
          <Text style={styles.alertBannerText}>EMERGENCY MEDICAL INFORMATION</Text>
        </View>

        {/* Patient Header */}
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.patientAge}>Age: {profile.age} years</Text>
        </View>

        {/* Blood Type - Large and Prominent */}
        {profile.bloodType && (
          <Card variant="elevated" padding="lg" style={styles.bloodTypeCard}>
            <Text style={styles.bloodTypeLabel}>BLOOD TYPE</Text>
            <Text style={styles.bloodTypeValue}>{profile.bloodType}</Text>
          </Card>
        )}

        {/* Critical Alerts - DNR Status */}
        {profile.dnrStatus && (
          <View style={styles.dnrBanner}>
            <Ionicons name="alert-circle" size={24} color={EMERGENCY_COLORS.text.light} />
            <Text style={styles.dnrText}>DNR - DO NOT RESUSCITATE</Text>
          </View>
        )}

        {/* Allergies */}
        {profile.allergies && profile.allergies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={24} color={EMERGENCY_COLORS.alert} />
              <Text style={styles.sectionTitle}>ALLERGIES</Text>
            </View>
            <View style={styles.cardsGrid}>
              {profile.allergies.map((allergy) => (
                <AllergyCard key={allergy.id} allergy={allergy} />
              ))}
            </View>
          </View>
        )}

        {/* Current Medications */}
        {profile.medications && profile.medications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={24} color={EMERGENCY_COLORS.medication} />
              <Text style={styles.sectionTitle}>CURRENT MEDICATIONS</Text>
            </View>
            <View style={styles.cardsGrid}>
              {profile.medications.map((medication) => (
                <MedicationCard key={medication.id} medication={medication} />
              ))}
            </View>
          </View>
        )}

        {/* Medical Conditions */}
        {profile.medicalConditions && profile.medicalConditions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={24} color={EMERGENCY_COLORS.condition} />
              <Text style={styles.sectionTitle}>MEDICAL CONDITIONS</Text>
            </View>
            <View style={styles.cardsGrid}>
              {profile.medicalConditions.map((condition) => (
                <ConditionCard key={condition.id} condition={condition} />
              ))}
            </View>
          </View>
        )}

        {/* Emergency Contacts */}
        {profile.emergencyContacts && profile.emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color={EMERGENCY_COLORS.success} />
              <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
            </View>
            <View style={styles.contactsList}>
              {profile.emergencyContacts.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <Pressable
                    style={styles.callButton}
                    onPress={() => handleCall(contact.phone, contact.name)}
                  >
                    <Ionicons name="call" size={24} color={EMERGENCY_COLORS.text.light} />
                    <Text style={styles.callButtonText}>CALL</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
          <Card variant="outline" padding="md" style={styles.additionalInfoCard}>
            {profile.height && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{profile.height}</Text>
              </View>
            )}
            {profile.weight && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{profile.weight}</Text>
              </View>
            )}
            {profile.organDonor && (
              <View style={styles.infoRow}>
                <Ionicons name="heart" size={20} color={EMERGENCY_COLORS.alert} />
                <Text style={styles.infoValue}>Registered Organ Donor</Text>
              </View>
            )}
            {profile.emergencyNotes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Emergency Notes:</Text>
                <Text style={styles.notesValue}>{profile.emergencyNotes}</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Doctor Information */}
        {profile.doctor && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit" size={24} color={EMERGENCY_COLORS.medication} />
              <Text style={styles.sectionTitle}>PRIMARY DOCTOR</Text>
            </View>
            <Card variant="elevated" padding="md" style={styles.doctorCard}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{profile.doctor.name}</Text>
                {profile.doctor.specialty && (
                  <Text style={styles.doctorSpecialty}>{profile.doctor.specialty}</Text>
                )}
                <Text style={styles.doctorPhone}>{profile.doctor.phone}</Text>
                {profile.doctor.email && (
                  <Text style={styles.doctorEmail}>{profile.doctor.email}</Text>
                )}
              </View>
              <Pressable
                style={styles.callButton}
                onPress={() => handleCall(profile.doctor!.phone, profile.doctor!.name)}
              >
                <Ionicons name="call" size={24} color={EMERGENCY_COLORS.text.light} />
                <Text style={styles.callButtonText}>CALL</Text>
              </Pressable>
            </Card>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="time-outline" size={16} color={SEMANTIC.text.tertiary} />
            <Text style={styles.footerText}>
              Last updated:{' '}
              {formatDistanceToNow(new Date(profile.lastUpdated), { addSuffix: true })}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Ionicons name="eye-outline" size={16} color={SEMANTIC.text.tertiary} />
            <Text style={styles.footerText}>
              Access count: {profile.accessCount}
            </Text>
          </View>
          <Text style={styles.privacyNotice}>
            This information is confidential and for emergency use only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Allergy Card Component
function AllergyCard({ allergy }: { allergy: Allergy }) {
  const getSeverityColor = (severity: Allergy['severity']) => {
    switch (severity) {
      case 'life-threatening':
        return EMERGENCY_COLORS.alert;
      case 'severe':
        return EMERGENCY_COLORS.critical;
      case 'moderate':
        return EMERGENCY_COLORS.warning;
      case 'mild':
        return EMERGENCY_COLORS.condition;
      default:
        return EMERGENCY_COLORS.warning;
    }
  };

  return (
    <View style={[styles.allergyCard, { borderLeftColor: getSeverityColor(allergy.severity) }]}>
      <View style={styles.allergyHeader}>
        <Text style={styles.allergyName}>{allergy.name}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergy.severity) }]}>
          <Text style={styles.severityText}>{allergy.severity.toUpperCase()}</Text>
        </View>
      </View>
      {allergy.reaction && (
        <Text style={styles.allergyReaction}>Reaction: {allergy.reaction}</Text>
      )}
    </View>
  );
}

// Medication Card Component
function MedicationCard({ medication }: { medication: Medication }) {
  return (
    <View style={styles.medicationCard}>
      <Text style={styles.medicationName}>{medication.name}</Text>
      <Text style={styles.medicationDosage}>{medication.dosage}</Text>
      <Text style={styles.medicationFrequency}>{medication.frequency}</Text>
      {medication.prescribedFor && (
        <Text style={styles.medicationPurpose}>For: {medication.prescribedFor}</Text>
      )}
    </View>
  );
}

// Condition Card Component
function ConditionCard({ condition }: { condition: MedicalCondition }) {
  return (
    <View style={styles.conditionCard}>
      <View style={styles.conditionHeader}>
        <Text style={styles.conditionName}>{condition.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: EMERGENCY_COLORS.warning }]}>
          <Text style={styles.statusText}>{condition.status.toUpperCase()}</Text>
        </View>
      </View>
      {condition.notes && (
        <Text style={styles.conditionNotes}>{condition.notes}</Text>
      )}
    </View>
  );
}

// Mock data for development
function getMockEmergencyProfile(braceletId: string): EmergencyProfile {
  return {
    id: '1',
    braceletId,
    isActive: true,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    age: 38,
    bloodType: 'A+',
    allergies: [
      {
        id: '1',
        name: 'Penicillin',
        severity: 'life-threatening',
        reaction: 'Anaphylaxis',
      },
      {
        id: '2',
        name: 'Peanuts',
        severity: 'severe',
        reaction: 'Severe allergic reaction, difficulty breathing',
      },
      {
        id: '3',
        name: 'Latex',
        severity: 'moderate',
        reaction: 'Skin rash and hives',
      },
    ],
    medications: [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedFor: 'High blood pressure',
      },
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescribedFor: 'Type 2 Diabetes',
      },
      {
        id: '3',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        prescribedFor: 'Heart health',
      },
    ],
    medicalConditions: [
      {
        id: '1',
        name: 'Type 2 Diabetes',
        status: 'chronic',
        diagnosedDate: '2015-03-20',
        notes: 'Well controlled with medication',
      },
      {
        id: '2',
        name: 'Hypertension',
        status: 'chronic',
        diagnosedDate: '2018-07-10',
        notes: 'Managed with Lisinopril',
      },
      {
        id: '3',
        name: 'Asthma',
        status: 'active',
        notes: 'Carries rescue inhaler',
      },
    ],
    emergencyContacts: [
      {
        id: '1',
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4567',
        email: 'jane.doe@example.com',
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Robert Smith',
        relationship: 'Brother',
        phone: '+1 (555) 987-6543',
        email: 'robert.smith@example.com',
        isPrimary: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    doctor: {
      id: '1',
      name: 'Dr. Sarah Johnson',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@medicalcenter.com',
      specialty: 'Internal Medicine',
      address: '456 Medical Center Drive, Suite 200, San Francisco, CA 94102',
    },
    dnrStatus: false,
    organDonor: true,
    height: '5\'10"',
    weight: '180 lbs',
    emergencyNotes: 'Patient prefers left arm for blood draws. Has history of fainting during procedures.',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    accessCount: 3,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[8],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: EMERGENCY_COLORS.alert,
    marginTop: spacing[4],
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  errorSubtext: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  alertBanner: {
    backgroundColor: EMERGENCY_COLORS.alert,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  alertBannerText: {
    fontSize: 20,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
    letterSpacing: 1,
  },
  patientHeader: {
    backgroundColor: EMERGENCY_COLORS.background.critical,
    padding: spacing[6],
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: EMERGENCY_COLORS.alert,
  },
  patientName: {
    fontSize: 32,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  patientAge: {
    fontSize: 20,
    fontWeight: '600',
    color: EMERGENCY_COLORS.text.dark,
  },
  bloodTypeCard: {
    margin: spacing[4],
    backgroundColor: EMERGENCY_COLORS.alert,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: EMERGENCY_COLORS.critical,
  },
  bloodTypeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
    marginBottom: spacing[2],
    letterSpacing: 2,
  },
  bloodTypeValue: {
    fontSize: 56,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
  },
  dnrBanner: {
    backgroundColor: EMERGENCY_COLORS.alert,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: 8,
    borderWidth: 3,
    borderColor: EMERGENCY_COLORS.critical,
  },
  dnrText: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
    letterSpacing: 1,
  },
  section: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    letterSpacing: 0.5,
  },
  cardsGrid: {
    gap: spacing[3],
  },
  allergyCard: {
    backgroundColor: EMERGENCY_COLORS.background.critical,
    padding: spacing[4],
    borderRadius: 8,
    borderLeftWidth: 6,
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  allergyName: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
  },
  allergyReaction: {
    fontSize: 14,
    color: EMERGENCY_COLORS.text.dark,
    fontWeight: '500',
  },
  medicationCard: {
    backgroundColor: EMERGENCY_COLORS.background.medication,
    padding: spacing[4],
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: EMERGENCY_COLORS.medication,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[1],
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '600',
    color: EMERGENCY_COLORS.medication,
    marginBottom: spacing[1],
  },
  medicationFrequency: {
    fontSize: 14,
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[1],
  },
  medicationPurpose: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    fontStyle: 'italic',
  },
  conditionCard: {
    backgroundColor: EMERGENCY_COLORS.background.condition,
    padding: spacing[4],
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: EMERGENCY_COLORS.condition,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  conditionName: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
  },
  conditionNotes: {
    fontSize: 14,
    color: EMERGENCY_COLORS.text.dark,
  },
  contactsList: {
    gap: spacing[3],
  },
  contactCard: {
    backgroundColor: EMERGENCY_COLORS.background.success,
    padding: spacing[4],
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: EMERGENCY_COLORS.success,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[1],
  },
  contactRelationship: {
    fontSize: 14,
    fontWeight: '600',
    color: EMERGENCY_COLORS.success,
    marginBottom: spacing[1],
  },
  contactPhone: {
    fontSize: 16,
    color: EMERGENCY_COLORS.text.dark,
  },
  callButton: {
    backgroundColor: EMERGENCY_COLORS.call,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  callButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.light,
    letterSpacing: 1,
  },
  additionalInfoCard: {
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  notesValue: {
    fontSize: 15,
    color: SEMANTIC.text.secondary,
    lineHeight: 22,
  },
  doctorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: EMERGENCY_COLORS.background.medication,
    borderWidth: 2,
    borderColor: EMERGENCY_COLORS.medication,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[1],
  },
  doctorSpecialty: {
    fontSize: 14,
    fontWeight: '600',
    color: EMERGENCY_COLORS.medication,
    marginBottom: spacing[2],
  },
  doctorPhone: {
    fontSize: 16,
    color: EMERGENCY_COLORS.text.dark,
    marginBottom: spacing[1],
  },
  doctorEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  footer: {
    padding: spacing[6],
    paddingTop: spacing[8],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
    gap: spacing[2],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footerText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  privacyNotice: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing[3],
    textAlign: 'center',
  },
});

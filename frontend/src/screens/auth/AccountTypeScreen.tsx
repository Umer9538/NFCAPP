/**
 * Account Type Selection Screen
 * Allows users to select their account type before signup
 * Includes family relationship selection for family accounts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Heart,
  User,
  Building2,
  HardHat,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  LucideIcon,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import type { AccountType, FamilyRelationship } from '@/config/dashboardConfig';
import { FAMILY_RELATIONSHIPS } from '@/config/dashboardConfig';
import type { AuthScreenNavigationProp } from '@/navigation/types';

interface AccountTypeOption {
  type: AccountType;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  lightColor: string;
}

const accountTypeOptions: AccountTypeOption[] = [
  {
    type: 'individual',
    title: 'Just for Me',
    description: 'Personal medical profile',
    icon: User,
    color: '#DC2626', // red-600
    lightColor: '#FEE2E2', // red-100
  },
  {
    type: 'family',
    title: 'For My Family',
    description: 'Manage profiles for loved ones',
    icon: Heart,
    color: '#DB2777', // pink-600
    lightColor: '#FCE7F3', // pink-100
  },
  {
    type: 'corporate',
    title: 'Corporate',
    description: 'Employee health records',
    icon: Building2,
    color: '#2563EB', // blue-600
    lightColor: '#DBEAFE', // blue-100
  },
  {
    type: 'construction',
    title: 'Construction',
    description: 'Worker safety compliance',
    icon: HardHat,
    color: '#EA580C', // orange-600
    lightColor: '#FFEDD5', // orange-100
  },
  {
    type: 'education',
    title: 'Education',
    description: 'Student health management',
    icon: GraduationCap,
    color: '#16A34A', // green-600
    lightColor: '#DCFCE7', // green-100
  },
];

export default function AccountTypeScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<FamilyRelationship | null>(null);
  const [step, setStep] = useState<'type' | 'relationship'>('type');

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type);
    if (type === 'family') {
      // Show relationship selection for family accounts
      setStep('relationship');
    }
  };

  const handleRelationshipSelect = (relationship: FamilyRelationship) => {
    setSelectedRelationship(relationship);
  };

  const handleBack = () => {
    if (step === 'relationship') {
      setStep('type');
      setSelectedRelationship(null);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleContinue = () => {
    if (selectedType) {
      navigation.navigate('Signup', {
        accountType: selectedType,
        familyRelationship: selectedType === 'family' ? selectedRelationship || undefined : undefined,
      });
    }
  };

  const canContinue = selectedType && (selectedType !== 'family' || selectedRelationship);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color="#111827" />
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: step === 'relationship' ? '#FCE7F3' : '#FEE2E2' }]}>
            <Heart size={32} color={step === 'relationship' ? '#DB2777' : '#DC2626'} />
          </View>
          <Text style={styles.title}>
            {step === 'type' ? 'Who is this account for?' : 'Who are you creating this for?'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'type'
              ? 'Choose the type of account that best fits your needs'
              : 'Select your relationship with the person'}
          </Text>
        </View>

        {step === 'type' ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.gridContainer}
          >
            {/* Account Type Grid */}
            <View style={styles.grid}>
              {accountTypeOptions.map((option) => {
                const isSelected = selectedType === option.type;
                const IconComponent = option.icon;

                return (
                  <Pressable
                    key={option.type}
                    style={[
                      styles.card,
                      isSelected && {
                        borderColor: option.color,
                        borderWidth: 2,
                        backgroundColor: option.lightColor,
                      },
                    ]}
                    onPress={() => handleTypeSelect(option.type)}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <CheckCircle size={18} color={option.color} fill={option.color} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.cardIconContainer,
                        { backgroundColor: isSelected ? option.color : option.lightColor },
                      ]}
                    >
                      <IconComponent
                        size={24}
                        color={isSelected ? '#ffffff' : option.color}
                      />
                    </View>
                    <Text style={[styles.cardTitle, isSelected && { color: option.color }]}>
                      {option.title}
                    </Text>
                    <Text style={styles.cardDescription}>{option.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Continue Button for non-family types */}
            {selectedType && selectedType !== 'family' && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.buttonContainer}>
                <Button
                  onPress={handleContinue}
                  fullWidth
                  size="lg"
                >
                  Continue
                </Button>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.gridContainer}
          >
            {/* Family Relationship Grid */}
            <View style={styles.grid}>
              {FAMILY_RELATIONSHIPS.map((relationship) => {
                const isSelected = selectedRelationship === relationship.value;

                return (
                  <Pressable
                    key={relationship.value}
                    style={[
                      styles.card,
                      isSelected && {
                        borderColor: '#DB2777',
                        borderWidth: 2,
                        backgroundColor: '#FCE7F3',
                      },
                    ]}
                    onPress={() => handleRelationshipSelect(relationship.value)}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <CheckCircle size={18} color="#DB2777" fill="#DB2777" />
                      </View>
                    )}
                    <Text style={styles.emoji}>{relationship.emoji}</Text>
                    <Text style={[styles.cardTitle, isSelected && { color: '#DB2777' }]}>
                      {relationship.label}
                    </Text>
                    <Text style={styles.cardDescription}>{relationship.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Continue Button */}
            {selectedRelationship && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.buttonContainer}>
                <Button
                  onPress={handleContinue}
                  fullWidth
                  size="lg"
                  style={{ backgroundColor: '#DB2777' }}
                >
                  Continue
                </Button>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate('Login')}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerLink: {
    color: '#DC2626',
    fontWeight: '600',
  },
});

/**
 * Account Type Selection Screen
 * Allows users to select their account type before signup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Heart,
  User,
  Building2,
  HardHat,
  GraduationCap,
  ArrowLeft,
  LucideIcon,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import type { AccountType } from '@/config/dashboardConfig';
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
    title: 'Individual',
    description: 'Personal medical profile for yourself',
    icon: User,
    color: '#DC2626', // red-600
    lightColor: '#FEE2E2', // red-100
  },
  {
    type: 'corporate',
    title: 'Corporate',
    description: 'Manage employee health records',
    icon: Building2,
    color: '#2563EB', // blue-600
    lightColor: '#DBEAFE', // blue-100
  },
  {
    type: 'construction',
    title: 'Construction',
    description: 'Worker safety and compliance',
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

  const handleContinue = () => {
    if (selectedType) {
      navigation.navigate('Signup', { accountType: selectedType });
    }
  };

  const handleBack = () => {
    navigation.navigate('Login');
  };

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
          <View style={styles.iconContainer}>
            <Heart size={64} color="#DC2626" fill="#DC2626" />
          </View>
          <Text style={styles.title}>Choose Account Type</Text>
          <Text style={styles.subtitle}>
            Select the type of account that best fits your needs
          </Text>
        </View>

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
                onPress={() => setSelectedType(option.type)}
              >
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: isSelected ? option.color : option.lightColor },
                  ]}
                >
                  <IconComponent
                    size={32}
                    color={isSelected ? '#ffffff' : option.color}
                  />
                </View>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleContinue}
            disabled={!selectedType}
            fullWidth
            size="lg"
          >
            Continue
          </Button>
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 24,
  },
});

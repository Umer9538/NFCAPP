/**
 * Onboarding Complete Screen
 * Final screen showing success and next steps
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingNavigationProp } from '@/navigation/types';
import { Button, Card } from '@/components/ui';
import { PRIMARY, GRAY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

const ONBOARDING_KEY = '@medguard_onboarding_completed';

export default function CompleteScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      // Mark onboarding as complete
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');

      // Small delay to ensure AsyncStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force a navigation action that will trigger RootNavigator's onStateChange
      // This will cause it to re-check onboarding status and show Main navigator
      navigation.navigate('OnboardingWelcome' as any);
    } catch (error) {
      console.error('[Onboarding] Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.header}>
          <View style={styles.successCircle}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark" size={80} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your profile has been created successfully
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>What's Next?</Text>

          <Card variant="elevated" padding="lg" style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Medical Information</Text>
                <Text style={styles.stepDescription}>
                  Add your allergies, medications, and medical conditions to your profile
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" padding="lg" style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Emergency Contacts</Text>
                <Text style={styles.stepDescription}>
                  Add people who should be contacted in case of an emergency
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" padding="lg" style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Your NFC Bracelet</Text>
                <Text style={styles.stepDescription}>
                  Order a MedGuard NFC bracelet and link it to your profile
                </Text>
              </View>
            </View>
          </Card>

          {/* Tips Card */}
          <Card variant="filled" padding="lg" style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color={PRIMARY[600]} />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={PRIMARY[600]} />
                <Text style={styles.tipText}>
                  Keep your medical information up to date
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={PRIMARY[600]} />
                <Text style={styles.tipText}>
                  Share your QR code with family members
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={PRIMARY[600]} />
                <Text style={styles.tipText}>
                  Test your bracelet regularly to ensure it works
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          fullWidth
          onPress={handleGetStarted}
          loading={isLoading}
          icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
          iconPosition="right"
        >
          {isLoading ? 'Loading...' : 'Go to Dashboard'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
    paddingBottom: spacing[12],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  successCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PRIMARY[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  content: {
    gap: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  stepCard: {
    marginBottom: spacing[2],
  },
  stepHeader: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  stepDescription: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  tipsCard: {
    backgroundColor: PRIMARY[50],
    marginTop: spacing[4],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
  },
  tipsList: {
    gap: spacing[3],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  footer: {
    padding: spacing[6],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
});

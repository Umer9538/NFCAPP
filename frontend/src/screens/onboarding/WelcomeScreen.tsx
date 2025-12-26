/**
 * Welcome Screen
 * First screen in the onboarding flow
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { OnboardingNavigationProp } from '@/navigation/types';
import { Button } from '@/components/ui';
import { PRIMARY, GRAY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('OnboardingFeatures');
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingProfile');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Name */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="shield-checkmark" size={64} color="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>MedGuard</Text>
          <Text style={styles.tagline}>Your Medical Information, Always Accessible</Text>
        </View>

        {/* Hero Image/Illustration */}
        <View style={styles.heroContainer}>
          <View style={styles.heroCircle}>
            <Ionicons name="watch" size={120} color={PRIMARY[500]} />
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to MedGuard</Text>
          <Text style={styles.description}>
            Store your critical medical information on an NFC bracelet. In an emergency,
            first responders can instantly access your allergies, medications, and
            emergency contacts with a simple tap.
          </Text>

          {/* Key Benefits */}
          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: PRIMARY[100] }]}>
                <Ionicons name="flash" size={24} color={PRIMARY[600]} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Instant Access</Text>
                <Text style={styles.benefitDesc}>Emergency info in seconds</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: PRIMARY[100] }]}>
                <Ionicons name="lock-closed" size={24} color={PRIMARY[600]} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Secure & Private</Text>
                <Text style={styles.benefitDesc}>Your data, your control</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: PRIMARY[100] }]}>
                <Ionicons name="heart" size={24} color={PRIMARY[600]} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Peace of Mind</Text>
                <Text style={styles.benefitDesc}>Be prepared for emergencies</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          fullWidth
          onPress={handleGetStarted}
          style={styles.primaryButton}
        >
          Get Started
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onPress={handleSkip}
          style={styles.skipButton}
        >
          Skip Introduction
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
    paddingBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: PRIMARY[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  heroCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PRIMARY[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  benefits: {
    gap: spacing[4],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  benefitDesc: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
  },
  footer: {
    padding: spacing[6],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  primaryButton: {
    marginBottom: 0,
  },
  skipButton: {
    marginBottom: 0,
  },
});

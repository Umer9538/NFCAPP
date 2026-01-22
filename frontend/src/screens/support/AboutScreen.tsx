/**
 * About Screen
 * App information, version, company details, and links
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import {
  Heart,
  Shield,
  Globe,
  Mail,
  ExternalLink,
  FileText,
  Lock,
  Star,
  Users,
  Smartphone,
} from 'lucide-react-native';

import { Card } from '@/components/ui';
import { PRIMARY, SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function AboutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  const features = [
    {
      icon: <Heart size={20} color={PRIMARY[600]} />,
      title: 'Medical Profile',
      description: 'Store vital health information securely',
    },
    {
      icon: <Smartphone size={20} color={PRIMARY[600]} />,
      title: 'NFC Bracelet',
      description: 'Quick access via tap technology',
    },
    {
      icon: <Shield size={20} color={PRIMARY[600]} />,
      title: 'Privacy First',
      description: 'Your data is encrypted and protected',
    },
    {
      icon: <Users size={20} color={PRIMARY[600]} />,
      title: 'Emergency Contacts',
      description: 'Notify loved ones instantly',
    },
  ];

  const links = [
    {
      icon: <Globe size={20} color={GRAY[600]} />,
      title: 'Website',
      onPress: () => openLink('https://firstaidtag.com'),
    },
    {
      icon: <FileText size={20} color={GRAY[600]} />,
      title: 'Terms of Service',
      onPress: () => navigation.navigate('TermsOfService' as any),
    },
    {
      icon: <Lock size={20} color={GRAY[600]} />,
      title: 'Privacy Policy',
      onPress: () => navigation.navigate('PrivacyPolicy' as any),
    },
    {
      icon: <Mail size={20} color={GRAY[600]} />,
      title: 'Contact Support',
      onPress: () => openLink('mailto:support@firstaidtag.com'),
    },
    {
      icon: <Star size={20} color={GRAY[600]} />,
      title: 'Rate the App',
      onPress: () => openLink('https://apps.apple.com'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Heart size={40} color="#fff" fill="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>MedGuard</Text>
          <Text style={styles.appTagline}>Your Medical Profile, Always Accessible</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {appVersion} ({buildNumber})</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <Card variant="outlined" padding="lg" style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            MedGuard empowers individuals to take control of their health information.
            In emergencies, every second counts. Our NFC-enabled medical ID ensures
            first responders have instant access to critical health data when it matters most.
          </Text>
        </Card>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <Card variant="outlined" padding="none">
            {features.map((feature, index) => (
              <View key={feature.title}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>{feature.icon}</View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
                {index < features.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <Card variant="outlined" padding="none">
            {links.map((link, index) => (
              <View key={link.title}>
                <Pressable style={styles.linkItem} onPress={link.onPress}>
                  <View style={styles.linkIcon}>{link.icon}</View>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <ExternalLink size={16} color={GRAY[400]} />
                </Pressable>
                {index < links.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>FirstAidTag Inc.</Text>
          <Text style={styles.companyAddress}>
            Building the future of medical identification
          </Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} FirstAidTag. All rights reserved.
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>
            Made with <Heart size={12} color="#ef4444" fill="#ef4444" /> for your safety
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.secondary,
  },
  headerWrapper: {
    backgroundColor: SEMANTIC.background.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: PRIMARY[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  appTagline: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  versionBadge: {
    backgroundColor: GRAY[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    color: GRAY[600],
    fontWeight: '500',
  },
  // Mission Card
  missionCard: {
    marginBottom: spacing[6],
    backgroundColor: PRIMARY[50],
    borderColor: PRIMARY[100],
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY[700],
    marginBottom: spacing[2],
  },
  missionText: {
    fontSize: 14,
    color: PRIMARY[800],
    lineHeight: 22,
  },
  // Section
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Features
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  featureDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  // Links
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: GRAY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  linkTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  // Company Info
  companyInfo: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  companyAddress: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  copyright: {
    fontSize: 12,
    color: GRAY[400],
  },
  // Credits
  credits: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  creditsText: {
    fontSize: 12,
    color: GRAY[400],
    flexDirection: 'row',
    alignItems: 'center',
  },
});

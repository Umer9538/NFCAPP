/**
 * Help Screen
 * Support and help center for the app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Shield,
  BookOpen,
  ExternalLink,
} from 'lucide-react-native';

import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

interface HelpItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  external?: boolean;
}

export default function HelpScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();

  const helpItems: HelpItem[] = [
    {
      id: 'faq',
      icon: <HelpCircle size={24} color={PRIMARY[600]} />,
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions',
      action: () => navigation.navigate('FAQ'),
    },
    {
      id: 'contact-email',
      icon: <Mail size={24} color={PRIMARY[600]} />,
      title: 'Email Support',
      description: 'support@medid.com',
      action: () => Linking.openURL('mailto:support@medid.com'),
      external: true,
    },
    {
      id: 'contact-phone',
      icon: <Phone size={24} color={PRIMARY[600]} />,
      title: 'Phone Support',
      description: '+1 (800) MED-ID01',
      action: () => Linking.openURL('tel:+18006334301'),
      external: true,
    },
    {
      id: 'live-chat',
      icon: <MessageCircle size={24} color={PRIMARY[600]} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: () => Linking.openURL('https://medid.com/chat'),
      external: true,
    },
  ];

  const legalItems: HelpItem[] = [
    {
      id: 'terms',
      icon: <FileText size={24} color={GRAY[500]} />,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      action: () => navigation.navigate('TermsOfService'),
    },
    {
      id: 'privacy',
      icon: <Shield size={24} color={GRAY[500]} />,
      title: 'Privacy Policy',
      description: 'How we handle your data',
      action: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'about',
      icon: <BookOpen size={24} color={GRAY[500]} />,
      title: 'About MedID',
      description: 'Learn more about us',
      action: () => navigation.navigate('About'),
    },
  ];

  const renderHelpItem = (item: HelpItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.helpItem,
        pressed && styles.helpItemPressed,
      ]}
      onPress={item.action}
    >
      <View style={styles.helpItemIcon}>{item.icon}</View>
      <View style={styles.helpItemContent}>
        <Text style={styles.helpItemTitle}>{item.title}</Text>
        <Text style={styles.helpItemDescription}>{item.description}</Text>
      </View>
      {item.external ? (
        <ExternalLink size={18} color={GRAY[400]} />
      ) : (
        <ChevronRight size={20} color={GRAY[400]} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <HelpCircle size={48} color={PRIMARY[600]} />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroText}>
            Find answers to your questions or get in touch with our support team.
          </Text>
        </View>

        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.card}>
            {helpItems.map(renderHelpItem)}
          </View>
        </View>

        {/* Legal & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Information</Text>
          <View style={styles.card}>
            {legalItems.map(renderHelpItem)}
          </View>
        </View>

        {/* Emergency Note */}
        <View style={styles.emergencyNote}>
          <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
          <Text style={styles.emergencyText}>
            {"If you're experiencing a medical emergency, please call 911 or your local emergency services immediately."}
          </Text>
          <Pressable
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:911')}
          >
            <Phone size={18} color="#fff" />
            <Text style={styles.emergencyButtonText}>Call 911</Text>
          </Pressable>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>MedID v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    marginBottom: spacing[4],
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${PRIMARY[600]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  heroText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    marginLeft: spacing[1],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  helpItemPressed: {
    backgroundColor: GRAY[50],
  },
  helpItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: `${PRIMARY[600]}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  helpItemDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  emergencyNote: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: spacing[2],
  },
  emergencyText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#DC2626',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  versionText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[2],
  },
});

/**
 * Incident Reports Screen
 * Placeholder screen for upcoming incident reporting feature
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const FEATURE_LIST = [
  'Report workplace incidents',
  'Track injury records',
  'Generate compliance reports',
];

export default function IncidentReportsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  // Use "Incident Logs" for construction, "Incident Reports" for others
  const screenTitle = accountType === 'construction' ? 'Incident Logs' : 'Incident Reports';

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <AlertTriangle size={80} color="#f97316" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Coming Soon</Text>

        {/* Description */}
        <Text style={styles.description}>
          Incident reporting and tracking will be available in a future update
        </Text>

        {/* Feature Preview List */}
        <View style={styles.featureList}>
          {FEATURE_LIST.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <CheckCircle size={20} color="#f97316" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  description: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },
  featureList: {
    alignSelf: 'stretch',
    gap: spacing[4],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: '#fff',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
});

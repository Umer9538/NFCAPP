/**
 * Home Screen (Individual Dashboard)
 * Modern dashboard matching organization dashboard design
 * Uses dynamic theme colors based on account type
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  Watch,
  Eye,
  Heart,
  Activity,
  Shield,
  AlertTriangle,
  Bell,
  ChevronRight,
  Sparkles,
  CircleCheck,
  Link2,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { LoadingSpinner, Toast, useToast } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/api/dashboard';
import { useTheme } from '@/theme/ThemeProvider';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HealthReminder {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { user } = useAuth();
  const theme = useTheme();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Get dynamic theme colors
  const primaryColor = theme.primary;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardOverview,
  });

  const completeReminderMutation = useMutation({
    mutationFn: dashboardApi.completeReminder,
    onSuccess: () => {
      success('Great job! Reminder marked as complete.');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      showError('Unable to complete reminder. Please try again.');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading dashboard..." />;
  }

  const stats = data?.stats;
  const reminders = data?.reminders || [];
  const firstName = user?.firstName || 'User';
  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const profileProgress = stats?.profileCompleteness?.percentage || 80;
  const isProfileComplete = profileProgress === 100;
  const isBraceletLinked = stats?.braceletStatus?.isActive;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={primaryColor[500]}
          colors={[primaryColor[500]]}
        />
      }
    >
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={[primaryColor[600], primaryColor[500], primaryColor[400]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName}!</Text>
            </View>
            <Pressable
              style={styles.notificationBtn}
              onPress={() => (navigation as any).navigate('Notifications')}
            >
              <Bell size={22} color="#fff" />
              <View style={[styles.notificationDot, { borderColor: primaryColor[500] }]} />
            </Pressable>
          </View>

          {/* Profile Summary Card */}
          <View style={styles.profileSummary}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.avatarGradient}
              >
                <Text style={[styles.avatarText, { color: primaryColor[600] }]}>{userInitials}</Text>
              </LinearGradient>
              {isProfileComplete && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle size={14} color="#fff" fill="#10b981" />
                </View>
              )}
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email}
              </Text>
              <View style={styles.accountBadge}>
                <User size={12} color="#fff" />
                <Text style={styles.accountBadgeText} numberOfLines={1}>
                  {user?.accountType === 'corporate' ? 'Corporate Account' :
                   user?.accountType === 'construction' ? 'Construction Account' :
                   user?.accountType === 'education' ? 'Education Account' :
                   'Individual Account'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          {/* Profile Status Card */}
          <Pressable
            style={styles.statCard}
            onPress={() => (navigation as any).navigate('EditEmergencyProfile')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: '#ecfdf5' }]}>
              {isProfileComplete ? (
                <CircleCheck size={22} color="#10b981" />
              ) : (
                <TrendingUp size={22} color="#10b981" />
              )}
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Profile</Text>
              <Text style={styles.statValue}>
                {isProfileComplete ? 'Complete' : `${profileProgress}%`}
              </Text>
            </View>
            {!isProfileComplete && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${profileProgress}%` }]} />
              </View>
            )}
          </Pressable>

          {/* NFC Bracelet Card */}
          <Pressable
            style={styles.statCard}
            onPress={() => (navigation as any).navigate('Bracelet')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: isBraceletLinked ? '#dbeafe' : '#fef3c7' }]}>
              {isBraceletLinked ? (
                <Link2 size={22} color="#3b82f6" />
              ) : (
                <Watch size={22} color="#f59e0b" />
              )}
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Bracelet</Text>
              <Text style={[styles.statValue, !isBraceletLinked && { color: '#f59e0b' }]}>
                {isBraceletLinked ? 'Linked' : 'Not Linked'}
              </Text>
            </View>
            <ChevronRight size={18} color={GRAY[400]} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          {/* Profile Access Card */}
          <Pressable
            style={styles.statCard}
            onPress={() => (navigation as any).navigate('AuditLogs')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: '#fef2f2' }]}>
              <Eye size={22} color="#ef4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel} numberOfLines={1}>Accesses</Text>
              <Text style={styles.statValue}>{stats?.recentAccesses?.count || 0}</Text>
            </View>
            <Text style={styles.statSubLabel} numberOfLines={1}>This month</Text>
          </Pressable>

          {/* Subscription Card */}
          <Pressable
            style={styles.statCard}
            onPress={() => (navigation as any).navigate('Subscription')}
          >
            <View style={[styles.statIconWrapper, { backgroundColor: '#f5f3ff' }]}>
              <Sparkles size={22} color="#8b5cf6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Plan</Text>
              <Text style={styles.statValue}>{stats?.subscription?.plan || 'Free'}</Text>
            </View>
            {(!stats?.subscription?.plan || stats?.subscription?.plan === 'Free') && (
              <Text style={styles.upgradeText}>Upgrade</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {/* Medical Info */}
          <Pressable
            style={styles.quickActionCard}
            onPress={() => (navigation as any).navigate('EditEmergencyProfile')}
          >
            <LinearGradient
              colors={[primaryColor[50], primaryColor[100]]}
              style={styles.quickActionGradient}
            >
              <Heart size={28} color={primaryColor[500]} />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Medical Info</Text>
            <Text style={styles.quickActionSubtitle}>Update profile</Text>
          </Pressable>

          {/* Manage Bracelet */}
          <Pressable
            style={styles.quickActionCard}
            onPress={() => (navigation as any).navigate('Bracelet')}
          >
            <LinearGradient
              colors={['#eff6ff', '#dbeafe']}
              style={styles.quickActionGradient}
            >
              <Activity size={28} color="#3b82f6" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Bracelet</Text>
            <Text style={styles.quickActionSubtitle}>Link device</Text>
          </Pressable>

          {/* Audit Logs */}
          <Pressable
            style={styles.quickActionCard}
            onPress={() => (navigation as any).navigate('AuditLogs')}
          >
            <LinearGradient
              colors={['#f5f3ff', '#ede9fe']}
              style={styles.quickActionGradient}
            >
              <Shield size={28} color="#8b5cf6" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Audit Logs</Text>
            <Text style={styles.quickActionSubtitle}>View access</Text>
          </Pressable>

          {/* QR Code */}
          <Pressable
            style={styles.quickActionCard}
            onPress={() => (navigation as any).navigate('QRCodeGenerator')}
          >
            <LinearGradient
              colors={['#ecfdf5', '#d1fae5']}
              style={styles.quickActionGradient}
            >
              <Ionicons name="qr-code" size={28} color="#10b981" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>QR Code</Text>
            <Text style={styles.quickActionSubtitle}>Share profile</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Health Reminders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Reminders</Text>
          <Text style={[styles.sectionBadge, { backgroundColor: primaryColor[500] }]}>
            {reminders.filter(r => !r.completed).length}
          </Text>
        </View>

        {reminders.length === 0 ? (
          <View style={styles.emptyReminders}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="checkmark-done-circle" size={40} color="#10b981" />
            </View>
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>No pending reminders</Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {reminders.slice(0, 3).map((reminder: HealthReminder) => (
              <Pressable
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  reminder.priority === 'high' && styles.reminderCardHigh,
                  reminder.priority === 'medium' && styles.reminderCardMedium,
                ]}
                onPress={() => completeReminderMutation.mutate(reminder.id)}
              >
                <View style={styles.reminderIcon}>
                  <AlertTriangle
                    size={18}
                    color={
                      reminder.priority === 'high' ? '#ef4444' :
                      reminder.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                    }
                  />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDesc} numberOfLines={1}>
                    {reminder.description}
                  </Text>
                </View>
                <View style={styles.reminderAction}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={GRAY[400]} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: spacing[8] }} />

      <Toast {...toastConfig} onDismiss={hideToast} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: spacing[4],
  },
  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[5],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    // Container for header items
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[5],
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
  },
  // Profile Summary
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: spacing[4],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  profileDetails: {
    flex: 1,
    marginLeft: spacing[4],
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    gap: 4,
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: spacing[4],
    marginTop: -spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  statLabel: {
    fontSize: 12,
    color: GRAY[500],
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 11,
    color: GRAY[400],
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GRAY[100],
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  upgradeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  // Section Styles
  section: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  sectionBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 24,
    textAlign: 'center',
  },
  // Quick Actions
  quickActionsScroll: {
    paddingRight: spacing[4],
    gap: spacing[3],
  },
  quickActionCard: {
    width: 100,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: GRAY[500],
    textAlign: 'center',
    marginTop: 2,
  },
  // Reminders
  emptyReminders: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing[8],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: GRAY[500],
    marginTop: 4,
  },
  remindersList: {
    gap: spacing[3],
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reminderCardHigh: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fffbfb',
  },
  reminderCardMedium: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffefb',
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GRAY[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  reminderDesc: {
    fontSize: 12,
    color: GRAY[500],
    marginTop: 2,
  },
  reminderAction: {
    marginLeft: spacing[2],
  },
});

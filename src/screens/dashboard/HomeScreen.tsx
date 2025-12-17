/**
 * Home Screen (Dashboard)
 * Main dashboard with stats, reminders, and quick actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, formatDistanceToNow } from 'date-fns';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Card, Avatar, Badge, LoadingSpinner, Toast, useToast } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/api/dashboard';
import type { HealthReminder, RecentActivity } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { text } from '@/constants/styles';
import { spacing } from '@/theme/theme';

export default function HomeScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { user } = useAuth();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data (with mock fallback for development)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardOverview,
    // Use mock data if API fails (for development/testing)
    placeholderData: getMockDashboardData(),
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: dashboardApi.completeReminder,
    onSuccess: () => {
      success('Reminder completed!');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      showError('Failed to complete reminder');
    },
  });

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCompleteReminder = (id: string) => {
    completeReminderMutation.mutate(id);
  };

  const getPriorityColor = (priority: HealthReminder['priority']) => {
    switch (priority) {
      case 'high':
        return STATUS.error;
      case 'medium':
        return STATUS.warning;
      case 'low':
        return STATUS.info;
      default:
        return SEMANTIC.text.tertiary;
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'scan':
        return 'scan-outline';
      case 'update':
        return 'create-outline';
      case 'access':
        return 'eye-outline';
      case 'login':
        return 'log-in-outline';
      default:
        return 'information-circle-outline';
    }
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={STATUS.error} />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const stats = data?.stats;
  const reminders = data?.reminders || [];
  const activities = data?.recentActivities || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Background */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.firstName || 'John'}!
            </Text>
            <Text style={styles.subGreeting}>Welcome to your health dashboard</Text>
            <Text style={styles.dateText}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <Avatar
              size="lg"
              initials={`${user?.firstName?.[0] || 'J'}${user?.lastName?.[0] || 'D'}`}
              imageUri={user?.profilePicture}
            />
          </Pressable>
        </View>
      </View>

      {/* Stats Cards - 2x2 Grid */}
      <View style={styles.statsGrid}>
        {/* Profile Completeness */}
        <Card variant="elevated" padding="md" style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#ffffff' }]}>
              <Ionicons name="person" size={28} color={PRIMARY[600]} />
            </View>
          </View>
          <Text style={styles.statValue}>
            {stats?.profileCompleteness.percentage || 0}%
          </Text>
          <Text style={styles.statLabel}>Profile Complete</Text>
          {stats?.profileCompleteness.percentage !== 100 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats?.profileCompleteness.percentage || 0}%` },
                ]}
              />
            </View>
          )}
        </Card>

        {/* Bracelet Status */}
        <Card variant="elevated" padding="md" style={[styles.statCard, styles.statCardGreen]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#ffffff' }]}>
              <Ionicons
                name="watch"
                size={28}
                color={MEDICAL_COLORS.green[600]}
              />
            </View>
          </View>
          <Text style={styles.statValue}>
            {stats?.braceletStatus.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statLabel}>Bracelet Status</Text>
          {stats?.braceletStatus.lastScan && (
            <Text style={styles.statMeta}>
              Last scan:{' '}
              {formatDistanceToNow(new Date(stats.braceletStatus.lastScan), {
                addSuffix: true,
              })}
            </Text>
          )}
        </Card>

        {/* Recent Accesses */}
        <Card variant="elevated" padding="md" style={[styles.statCard, styles.statCardBlue]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#ffffff' }]}>
              <Ionicons name="eye" size={28} color={MEDICAL_COLORS.blue[600]} />
            </View>
          </View>
          <Text style={styles.statValue}>{stats?.recentAccesses.count || 0}</Text>
          <Text style={styles.statLabel}>Recent Accesses</Text>
          {stats?.recentAccesses.lastAccess && (
            <Text style={styles.statMeta}>
              {formatDistanceToNow(new Date(stats.recentAccesses.lastAccess), {
                addSuffix: true,
              })}
            </Text>
          )}
        </Card>

        {/* Subscription */}
        <Card variant="elevated" padding="md" style={[styles.statCard, styles.statCardPurple]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#ffffff' }]}>
              <Ionicons
                name="star"
                size={28}
                color={MEDICAL_COLORS.purple[600]}
              />
            </View>
          </View>
          <Text style={styles.statValue}>
            {stats?.subscription.plan || 'Free'}
          </Text>
          <Text style={styles.statLabel}>Subscription</Text>
          {stats?.subscription.expiresAt && (
            <Text style={styles.statMeta}>
              Expires {format(new Date(stats.subscription.expiresAt), 'MMM d, yyyy')}
            </Text>
          )}
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate('EmergencyProfile')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: PRIMARY[50] }]}>
              <Ionicons name="medical" size={30} color={PRIMARY[600]} />
            </View>
            <Text style={styles.quickActionText}>View Profile</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate('NFCScanner')}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: MEDICAL_COLORS.blue[50] },
              ]}
            >
              <Ionicons name="scan" size={30} color={MEDICAL_COLORS.blue[600]} />
            </View>
            <Text style={styles.quickActionText}>Scan Bracelet</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate('QRCodeScanner')}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: MEDICAL_COLORS.purple[50] },
              ]}
            >
              <Ionicons name="qr-code" size={30} color={MEDICAL_COLORS.purple[600]} />
            </View>
            <Text style={styles.quickActionText}>Scan QR Code</Text>
          </Pressable>

          <Pressable
            style={styles.quickAction}
            onPress={() => navigation.navigate('EditEmergencyProfile')}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: MEDICAL_COLORS.green[50] },
              ]}
            >
              <Ionicons name="create" size={30} color={MEDICAL_COLORS.green[600]} />
            </View>
            <Text style={styles.quickActionText}>Update Profile</Text>
          </Pressable>
        </View>
      </View>

      {/* Health Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Reminders</Text>
          {reminders.length > 0 && (
            <Badge variant="primary" size="sm">
              {reminders.filter((r) => !r.completed).length}
            </Badge>
          )}
        </View>

        {reminders.length === 0 ? (
          <Card variant="outline" padding="lg">
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-done-circle"
                size={48}
                color={SEMANTIC.text.tertiary}
              />
              <Text style={styles.emptyStateText}>No health reminders</Text>
              <Text style={styles.emptyStateSubtext}>
                You're all caught up! New reminders will appear here.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.remindersList}>
            {reminders.slice(0, 5).map((reminder) => (
              <Card
                key={reminder.id}
                variant="elevated"
                padding="md"
                style={styles.reminderCard}
              >
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderLeft}>
                    <View
                      style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(reminder.priority) },
                      ]}
                    />
                    <View style={styles.reminderContent}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderDescription}>
                        {reminder.description}
                      </Text>
                      <Text style={styles.reminderDate}>
                        Due {format(new Date(reminder.dueDate), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </View>
                  {!reminder.completed && (
                    <Pressable
                      style={styles.completeButton}
                      onPress={() => handleCompleteReminder(reminder.id)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={24}
                        color={MEDICAL_COLORS.green[600]}
                      />
                    </Pressable>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable onPress={() => navigation.navigate('AuditLogs')}>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {activities.length === 0 ? (
          <Card variant="outline" padding="lg">
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={SEMANTIC.text.tertiary} />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>
                Your activity history will appear here.
              </Text>
            </View>
          </Card>
        ) : (
          <Card variant="elevated" padding="none">
            {activities.map((activity, index) => (
              <View key={activity.id}>
                <View style={styles.activityItem}>
                  <View
                    style={[styles.activityIcon, { backgroundColor: PRIMARY[50] }]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type)}
                      size={20}
                      color={PRIMARY[600]}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityAction}>{activity.action}</Text>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityTime}>
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </Text>
                      {activity.location && (
                        <>
                          <Text style={styles.activityDot}>•</Text>
                          <Text style={styles.activityLocation}>
                            {activity.location}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {index < activities.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        )}
      </View>

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />
    </ScrollView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getMockDashboardData() {
  return {
    stats: {
      profileCompleteness: {
        percentage: 100,
        missingFields: [],
      },
      braceletStatus: {
        isActive: true,
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        tagId: 'NFC-12345',
      },
      recentAccesses: {
        count: 12,
        lastAccess: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      subscription: {
        isActive: true,
        plan: 'Premium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
    },
    reminders: [
      {
        id: '1',
        title: 'Take Morning Medication',
        description: 'Blood pressure medication - Lisinopril 10mg',
        dueDate: new Date().toISOString(),
        priority: 'high' as const,
        type: 'medication' as const,
        completed: false,
      },
      {
        id: '2',
        title: 'Annual Checkup',
        description: 'Schedule your yearly physical examination',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        priority: 'medium' as const,
        type: 'appointment' as const,
        completed: false,
      },
      {
        id: '3',
        title: 'Refill Prescription',
        description: 'Insulin prescription expires soon',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        priority: 'high' as const,
        type: 'medication' as const,
        completed: false,
      },
      {
        id: '4',
        title: 'Blood Sugar Check',
        description: 'Morning fasting blood glucose test',
        dueDate: new Date().toISOString(),
        priority: 'low' as const,
        type: 'checkup' as const,
        completed: false,
      },
    ],
    recentActivities: [
      {
        id: '1',
        action: 'Profile Updated',
        description: 'Emergency contact information updated',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        location: 'Mobile App',
        type: 'update' as const,
      },
      {
        id: '2',
        action: 'NFC Bracelet Scanned',
        description: 'Bracelet scanned by emergency responder',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        location: 'San Francisco, CA',
        type: 'scan' as const,
      },
      {
        id: '3',
        action: 'Profile Accessed',
        description: 'Emergency profile viewed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        location: 'Web Portal',
        type: 'access' as const,
      },
      {
        id: '4',
        action: 'Login',
        description: 'Successful login from new device',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        location: 'iPhone 15 Pro',
        type: 'login' as const,
      },
      {
        id: '5',
        action: 'Medication Added',
        description: 'Added new medication to profile',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        location: 'Mobile App',
        type: 'update' as const,
      },
    ],
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: SEMANTIC.background.default,
  },
  errorText: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: PRIMARY[600],
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: PRIMARY[600],
    marginHorizontal: -spacing[4],
    marginTop: -spacing[4],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
    marginBottom: spacing[6],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: PRIMARY[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: spacing[1],
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: spacing[1],
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    width: `${(100 - spacing[3]) / 2}%`,
    flex: 0,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statCardPrimary: {
    backgroundColor: PRIMARY[50],
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY[600],
  },
  statCardGreen: {
    backgroundColor: MEDICAL_COLORS.green[50],
    borderLeftWidth: 4,
    borderLeftColor: MEDICAL_COLORS.green[600],
  },
  statCardBlue: {
    backgroundColor: MEDICAL_COLORS.blue[50],
    borderLeftWidth: 4,
    borderLeftColor: MEDICAL_COLORS.blue[600],
  },
  statCardPurple: {
    backgroundColor: MEDICAL_COLORS.purple[50],
    borderLeftWidth: 4,
    borderLeftColor: MEDICAL_COLORS.purple[600],
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    fontWeight: '500',
  },
  statMeta: {
    fontSize: 10,
    color: SEMANTIC.text.tertiary,
    marginTop: spacing[1],
  },
  progressBar: {
    height: 4,
    backgroundColor: SEMANTIC.border.default,
    borderRadius: 2,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY[600],
    borderRadius: 2,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: SEMANTIC.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  remindersList: {
    gap: spacing[3],
  },
  reminderCard: {
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY[600],
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[3],
    marginTop: 6,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  reminderDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[1],
  },
  reminderDate: {
    fontSize: 11,
    color: SEMANTIC.text.tertiary,
  },
  completeButton: {
    padding: spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    padding: spacing[4],
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  activityDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[1],
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 11,
    color: SEMANTIC.text.tertiary,
  },
  activityDot: {
    fontSize: 11,
    color: SEMANTIC.text.tertiary,
    marginHorizontal: spacing[2],
  },
  activityLocation: {
    fontSize: 11,
    color: SEMANTIC.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.default,
    marginHorizontal: spacing[4],
  },
});

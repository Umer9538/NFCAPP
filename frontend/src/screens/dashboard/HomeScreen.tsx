/**
 * Home Screen — Individual Dashboard
 * Mirrors web /dashboard 1:1: stat cards, today's medications,
 * quick actions, health reminders, recent activity.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  CheckCircle2,
  Activity,
  Users,
  Shield,
  AlertCircle,
  Heart,
  MapPin,
  Pill,
  Flame,
  ArrowRight,
  Clock,
  Eye,
  Map as MapIcon,
} from 'lucide-react-native';

import { Toast, useToast } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/api/dashboard';
import { PRIMARY, GRAY } from '@/constants/colors';
import type {
  DashboardStats,
  HealthReminder,
  MedicationWidgetData,
  RecentActivity,
} from '@/types/dashboard';
import type { AppScreenNavigationProp } from '@/navigation/types';

type IconColor = {
  bg: string;
  fg: string;
};

const ICON_COLORS = {
  red: { bg: '#fee2e2', fg: '#dc2626' } as IconColor,
  blue: { bg: '#dbeafe', fg: '#2563eb' } as IconColor,
  green: { bg: '#dcfce7', fg: '#16a34a' } as IconColor,
  purple: { bg: '#f3e8ff', fg: '#9333ea' } as IconColor,
  yellow: { bg: '#fef3c7', fg: '#ca8a04' } as IconColor,
  gray: { bg: GRAY[100], fg: GRAY[600] } as IconColor,
};

export default function HomeScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const statsQ = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getDashboardStats,
  });
  const medsQ = useQuery({
    queryKey: ['dashboard', 'medications'],
    queryFn: dashboardApi.getTodaysMedications,
    refetchInterval: 60_000,
  });
  const remindersQ = useQuery({
    queryKey: ['dashboard', 'reminders'],
    queryFn: dashboardApi.getHealthReminders,
  });
  const activitiesQ = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: () => dashboardApi.getRecentActivities(5),
  });

  const completeReminder = useMutation({
    mutationFn: dashboardApi.completeReminder,
    onSuccess: () => {
      success('Great job! Reminder marked as complete.');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'reminders'] });
    },
    onError: () => showError('Unable to complete reminder. Please try again.'),
  });

  const refreshing =
    statsQ.isFetching || medsQ.isFetching || remindersQ.isFetching || activitiesQ.isFetching;

  const onRefresh = useCallback(() => {
    statsQ.refetch();
    medsQ.refetch();
    remindersQ.refetch();
    activitiesQ.refetch();
  }, [statsQ, medsQ, remindersQ, activitiesQ]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing && (statsQ.isLoading || medsQ.isLoading)}
            onRefresh={onRefresh}
            tintColor={PRIMARY[600]}
            colors={[PRIMARY[600]]}
          />
        }
      >
        <Header />

        <StatsGrid stats={statsQ.data} loading={statsQ.isLoading} />

        <MedicationsCard
          data={medsQ.data ?? null}
          loading={medsQ.isLoading}
          onViewAll={() => navigation.navigate('Medications' as never)}
        />

        <QuickActions
          onUpdateMedical={() => navigation.navigate('EditEmergencyProfile', {})}
          onManageBracelet={() => navigation.navigate('Bracelet')}
          onShareLocation={() =>
            (navigation as any).navigate('Dashboard', { screen: 'Location' })
          }
          onAuditLogs={() => navigation.navigate('AuditLogs')}
        />

        <FamilyActions
          onFamilyMembers={() => navigation.navigate('FamilyMembers')}
          onFamilySafety={() => navigation.navigate('FamilySafety')}
          onFamilyMap={() => navigation.navigate('FamilyMap')}
          onSafeZones={() => navigation.navigate('SafeZones')}
        />

        <HealthRemindersCard
          reminders={remindersQ.data ?? []}
          loading={remindersQ.isLoading}
          onComplete={(id) => completeReminder.mutate(id)}
          completingId={completeReminder.isPending ? completeReminder.variables : undefined}
        />

        <RecentActivityCard
          activities={activitiesQ.data ?? []}
          loading={activitiesQ.isLoading}
          onViewAll={() => navigation.navigate('AuditLogs')}
        />

        <View style={{ height: 24 }} />
      </ScrollView>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Header
// ──────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSparkle}>✨</Text>
      </View>
      <View style={styles.headerSubRow}>
        <Text style={styles.headerWave}>👋</Text>
        <Text style={styles.headerSub}>
          Welcome back! Here&apos;s an overview of your medical profile.
        </Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stat cards (2x2)
// ──────────────────────────────────────────────────────────────────────────

function StatsGrid({
  stats,
  loading,
}: {
  stats: DashboardStats | undefined;
  loading: boolean;
}) {
  const profileStatus = stats?.profileStatus;
  const braceletStatus = stats?.braceletStatus;
  const profileAccess = stats?.profileAccess;
  const subscription = stats?.subscriptionStatus;

  const profileColor: IconColor =
    profileStatus?.changeType === 'positive'
      ? ICON_COLORS.green
      : profileStatus?.changeType === 'negative'
      ? ICON_COLORS.red
      : ICON_COLORS.yellow;

  const braceletColor: IconColor =
    braceletStatus?.value === 'Linked' ? ICON_COLORS.red : ICON_COLORS.gray;

  return (
    <View style={styles.statsGrid}>
      <StatCard
        title="Profile Status"
        value={loading ? 'Loading…' : profileStatus?.value ?? '—'}
        subtitle={loading ? '' : profileStatus?.change ?? ''}
        subtitleType={profileStatus?.changeType}
        Icon={CheckCircle2}
        iconColor={profileColor}
        showAlert={!!profileStatus?.missingFields?.length}
      />
      <StatCard
        title="NFC Bracelet"
        value={loading ? 'Loading…' : braceletStatus?.value ?? '—'}
        subtitle={loading ? '' : braceletStatus?.change ?? ''}
        Icon={Activity}
        iconColor={braceletColor}
      />
      <StatCard
        title="Profile Access"
        value={loading ? 'Loading…' : profileAccess?.value ?? '0'}
        subtitle={loading ? '' : profileAccess?.change ?? ''}
        subtitleType={profileAccess?.changeType}
        Icon={Users}
        iconColor={ICON_COLORS.blue}
      />
      <StatCard
        title="Subscription"
        value={loading ? 'Loading…' : subscription?.value ?? 'Free Plan'}
        subtitle={loading ? '' : subscription?.change ?? ''}
        Icon={Shield}
        iconColor={ICON_COLORS.purple}
      />
    </View>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  subtitleType,
  Icon,
  iconColor,
  showAlert,
}: {
  title: string;
  value: string;
  subtitle: string;
  subtitleType?: 'positive' | 'neutral' | 'negative';
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: IconColor;
  showAlert?: boolean;
}) {
  const subtitleColor =
    subtitleType === 'positive' ? '#16a34a' : GRAY[500];
  return (
    <View style={styles.statCard}>
      <View style={styles.statTextCol}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue} numberOfLines={2}>
          {value}
        </Text>
        {!!subtitle && (
          <Text style={[styles.statSubtitle, { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.statIconCol}>
        {showAlert && (
          <View style={styles.statAlertDot}>
            <AlertCircle size={14} color={GRAY[500]} />
          </View>
        )}
        <View style={[styles.statIconTile, { backgroundColor: iconColor.bg }]}>
          <Icon size={22} color={iconColor.fg} />
        </View>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Medications card
// ──────────────────────────────────────────────────────────────────────────

function MedicationsCard({
  data,
  loading,
  onViewAll,
}: {
  data: MedicationWidgetData | null;
  loading: boolean;
  onViewAll: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderTitleRow}>
          <Pill size={20} color={PRIMARY[600]} />
          <Text style={styles.cardTitle}>Today&apos;s Medications</Text>
        </View>
        <Pressable onPress={onViewAll} style={styles.linkRow} hitSlop={8}>
          <ArrowRight size={16} color={PRIMARY[600]} />
          <Text style={styles.linkText}>View All</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.cardLoading}>
          <ActivityIndicator color={PRIMARY[600]} />
          <Text style={styles.cardLoadingText}>Loading medications…</Text>
        </View>
      ) : (
        <>
          <View style={styles.medSummaryRow}>
            <MedSummaryTile
              value={data?.summary.total ?? 0}
              label="Total"
              bg={GRAY[50]}
              fg={GRAY[900]}
              labelColor={GRAY[500]}
            />
            <MedSummaryTile
              value={data?.summary.taken ?? 0}
              label="Taken"
              bg="#f0fdf4"
              fg="#16a34a"
              labelColor="#16a34a"
            />
            <MedSummaryTile
              value={data?.summary.pending ?? 0}
              label="Pending"
              bg="#eff6ff"
              fg="#2563eb"
              labelColor="#2563eb"
            />
            <MedSummaryTile
              value={data?.summary.missed ?? 0}
              label="Missed"
              bg="#fef2f2"
              fg="#dc2626"
              labelColor="#dc2626"
            />
          </View>

          <LinearGradient
            colors={[PRIMARY[50], '#f3e8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakBar}
          >
            <View style={styles.streakLeft}>
              <Flame size={20} color="#f97316" />
              <View>
                <Text style={styles.streakTitle}>
                  {data?.streak.current ?? 0} day streak
                </Text>
                <Text style={styles.streakSubtitle}>
                  Best: {data?.streak.longest ?? 0} days
                </Text>
              </View>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.streakTitle}>{data?.weeklyAdherence ?? 0}%</Text>
              <Text style={styles.streakSubtitle}>Weekly adherence</Text>
            </View>
          </LinearGradient>
        </>
      )}
    </View>
  );
}

function MedSummaryTile({
  value,
  label,
  bg,
  fg,
  labelColor,
}: {
  value: number;
  label: string;
  bg: string;
  fg: string;
  labelColor: string;
}) {
  return (
    <View style={[styles.medSummaryTile, { backgroundColor: bg }]}>
      <Text style={[styles.medSummaryValue, { color: fg }]}>{value}</Text>
      <Text style={[styles.medSummaryLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Quick Actions
// ──────────────────────────────────────────────────────────────────────────

function QuickActions({
  onUpdateMedical,
  onManageBracelet,
  onShareLocation,
  onAuditLogs,
}: {
  onUpdateMedical: () => void;
  onManageBracelet: () => void;
  onShareLocation: () => void;
  onAuditLogs: () => void;
}) {
  const actions = [
    {
      title: 'Update Medical Info',
      description: 'Keep your profile current',
      Icon: Heart,
      color: ICON_COLORS.red,
      onPress: onUpdateMedical,
    },
    {
      title: 'Manage Bracelet',
      description: 'Link or replace your NFC device',
      Icon: Activity,
      color: ICON_COLORS.blue,
      onPress: onManageBracelet,
    },
    {
      title: 'Share Location',
      description: 'Share with emergency contacts',
      Icon: MapPin,
      color: ICON_COLORS.green,
      onPress: onShareLocation,
    },
    {
      title: 'View Audit Logs',
      description: 'See who accessed your profile',
      Icon: Shield,
      color: ICON_COLORS.purple,
      onPress: onAuditLogs,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((a) => (
          <Pressable
            key={a.title}
            onPress={a.onPress}
            style={({ pressed }) => [styles.actionTile, pressed && styles.actionTilePressed]}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color.bg }]}>
              <a.Icon size={20} color={a.color.fg} />
            </View>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDescription}>{a.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Family Actions
// ──────────────────────────────────────────────────────────────────────────

function FamilyActions({
  onFamilyMembers,
  onFamilySafety,
  onFamilyMap,
  onSafeZones,
}: {
  onFamilyMembers: () => void;
  onFamilySafety: () => void;
  onFamilyMap: () => void;
  onSafeZones: () => void;
}) {
  const actions = [
    {
      title: 'Family Members',
      description: 'Manage children & caregivers',
      Icon: Users,
      color: ICON_COLORS.red,
      onPress: onFamilyMembers,
    },
    {
      title: 'Family Safety',
      description: 'Real-time safety overview',
      Icon: Eye,
      color: ICON_COLORS.blue,
      onPress: onFamilySafety,
    },
    {
      title: 'Family Map',
      description: 'See where family is now',
      Icon: MapIcon,
      color: ICON_COLORS.green,
      onPress: onFamilyMap,
    },
    {
      title: 'Safe Zones',
      description: 'Geofence alerts',
      Icon: Shield,
      color: ICON_COLORS.purple,
      onPress: onSafeZones,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Family</Text>
      <View style={styles.actionsGrid}>
        {actions.map((a) => (
          <Pressable
            key={a.title}
            onPress={a.onPress}
            style={({ pressed }) => [styles.actionTile, pressed && styles.actionTilePressed]}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color.bg }]}>
              <a.Icon size={20} color={a.color.fg} />
            </View>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDescription}>{a.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Health Reminders
// ──────────────────────────────────────────────────────────────────────────

function HealthRemindersCard({
  reminders,
  loading,
  onComplete,
  completingId,
}: {
  reminders: HealthReminder[];
  loading: boolean;
  onComplete: (id: string) => void;
  completingId?: string;
}) {
  const visible = reminders.filter((r) => !r.completed).slice(0, 3);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Health Reminders</Text>
      {loading ? (
        <View style={styles.cardLoading}>
          <ActivityIndicator color={PRIMARY[600]} />
          <Text style={styles.cardLoadingText}>Loading reminders…</Text>
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle2 size={40} color="#86efac" />
          <Text style={styles.emptyTitle}>No pending reminders</Text>
          <Text style={styles.emptySubtitle}>All caught up! 🎉</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {visible.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => onComplete(r.id)}
              disabled={completingId === r.id}
              style={[styles.reminderItem, priorityBorder(r.priority)]}
            >
              <View style={styles.reminderTitleRow}>
                <Text style={styles.reminderTitle} numberOfLines={2}>
                  {r.title}
                </Text>
                <PriorityBadge priority={r.priority} />
              </View>
              <Text style={styles.reminderDescription}>{r.description}</Text>
              <Text style={styles.reminderHint}>
                {completingId === r.id ? 'Marking…' : 'Click to mark as complete'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const map = {
    high: { bg: '#fee2e2', fg: '#b91c1c', label: 'high' },
    medium: { bg: '#fef9c3', fg: '#a16207', label: 'medium' },
    low: { bg: '#dbeafe', fg: '#1d4ed8', label: 'low' },
  } as const;
  const c = map[priority];
  return (
    <View style={[styles.priorityBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.priorityBadgeText, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

function priorityBorder(priority: 'high' | 'medium' | 'low') {
  if (priority === 'high') return { borderColor: '#fecaca' };
  if (priority === 'medium') return { borderColor: '#fef08a' };
  return { borderColor: GRAY[200] };
}

// ──────────────────────────────────────────────────────────────────────────
// Recent Activity
// ──────────────────────────────────────────────────────────────────────────

function RecentActivityCard({
  activities,
  loading,
  onViewAll,
}: {
  activities: RecentActivity[];
  loading: boolean;
  onViewAll: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <Pressable onPress={onViewAll} style={styles.linkRow} hitSlop={8}>
          <ArrowRight size={16} color={PRIMARY[600]} />
          <Text style={styles.linkText}>View All</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.cardLoading}>
          <ActivityIndicator color={PRIMARY[600]} />
          <Text style={styles.cardLoadingText}>Loading activities…</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Activity size={40} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No recent activity yet</Text>
          <Text style={styles.emptySubtitle}>Your activities will appear here</Text>
        </View>
      ) : (
        <View>
          {activities.map((a, idx) => (
            <View
              key={a.id ?? `${idx}-${a.action}`}
              style={[styles.activityRow, idx === activities.length - 1 && styles.activityRowLast]}
            >
              <View
                style={[
                  styles.activityIconTile,
                  { backgroundColor: activityBg(a.type) },
                ]}
              >
                <Activity size={14} color={activityFg(a.type)} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityAction} numberOfLines={1}>
                  {a.action}
                </Text>
                {!!a.location && (
                  <Text style={styles.activityLocation} numberOfLines={1}>
                    {a.location}
                  </Text>
                )}
              </View>
              <View style={styles.activityTime}>
                <Clock size={12} color={GRAY[500]} />
                <Text style={styles.activityTimeText}>{a.time}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function activityBg(type: string) {
  if (type === 'access') return '#fee2e2';
  if (type === 'update') return '#dbeafe';
  return GRAY[100];
}
function activityFg(type: string) {
  if (type === 'access') return '#dc2626';
  if (type === 'update') return '#2563eb';
  return GRAY[600];
}

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const CARD_RADIUS = 16;
const CARD_PADDING = 16;
const GUTTER = 12;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scrollContent: { padding: 16, gap: 16 },

  // Header
  headerWrap: { marginBottom: 4 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: PRIMARY[700],
    letterSpacing: -0.5,
  },
  headerSparkle: { fontSize: 22, marginBottom: 4 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  headerWave: { fontSize: 16 },
  headerSub: { flex: 1, fontSize: 14, color: GRAY[600], lineHeight: 20 },

  // Stat grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GUTTER,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    minHeight: 120,
  },
  statTextCol: { flex: 1, paddingRight: 8 },
  statTitle: { fontSize: 12, color: GRAY[600], fontWeight: '500', marginBottom: 4 },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: GRAY[900],
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  statSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  statIconCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  statIconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statAlertDot: {
    marginBottom: 4,
    padding: 2,
  },

  // Card shell
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: GRAY[900], letterSpacing: -0.2 },
  cardLoading: { paddingVertical: 24, alignItems: 'center', gap: 8 },
  cardLoadingText: { color: GRAY[600], fontSize: 13 },

  linkRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  linkText: { color: PRIMARY[600], fontSize: 13, fontWeight: '600' },

  // Medications
  medSummaryRow: { flexDirection: 'row', gap: 8 },
  medSummaryTile: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  medSummaryValue: { fontSize: 18, fontWeight: '800' },
  medSummaryLabel: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  streakBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakRight: { alignItems: 'flex-end' },
  streakTitle: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  streakSubtitle: { fontSize: 11, color: GRAY[500], marginTop: 2 },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GUTTER },
  actionTile: {
    flexBasis: '48%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: GRAY[200],
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    gap: 8,
  },
  actionTilePressed: {
    borderColor: PRIMARY[400],
    backgroundColor: PRIMARY[50],
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  actionTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  actionDescription: { fontSize: 12, color: GRAY[600], lineHeight: 16 },

  // Reminders
  reminderItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#fafafa',
    gap: 4,
  },
  reminderTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  reminderTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: GRAY[900] },
  reminderDescription: { fontSize: 12, color: GRAY[600], lineHeight: 16 },
  reminderHint: { fontSize: 11, color: GRAY[400], marginTop: 4 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  priorityBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'lowercase' },

  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  emptyTitle: { fontSize: 13, color: GRAY[500], marginTop: 8 },
  emptySubtitle: { fontSize: 12, color: GRAY[400] },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GRAY[200],
    gap: 12,
  },
  activityRowLast: { borderBottomWidth: 0 },
  activityIconTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1 },
  activityAction: { fontSize: 13, fontWeight: '600', color: GRAY[900] },
  activityLocation: { fontSize: 11, color: GRAY[600], marginTop: 2 },
  activityTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activityTimeText: { fontSize: 11, color: GRAY[500] },
});

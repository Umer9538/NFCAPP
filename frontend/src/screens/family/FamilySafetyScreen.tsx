/**
 * Family Safety — mirrors the web's /dashboard/family-monitoring page 1:1.
 * GET /api/family/monitoring on a 30 s interval.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Eye,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Users,
  MapPin,
  WifiOff,
  Heart,
  Radio,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import { familyApi, type MemberStatus } from '@/api/family';
import type { AppScreenNavigationProp } from '@/navigation/types';

export default function FamilySafetyScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['family', 'monitoring'],
    queryFn: familyApi.getFamilyMonitoring,
    refetchInterval: 30_000,
  });

  const summary = data?.summary ?? {
    total: 0,
    safe: 0,
    alert: 0,
    outside: 0,
    offline: 0,
  };
  const members = data?.members ?? [];
  const allSafe = summary.alert === 0 && summary.outside === 0;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.headerTitleRow}>
              <Eye size={22} color={PRIMARY[600]} />
              <Text style={styles.headerTitle}>Family Safety</Text>
            </View>
            <Text style={styles.headerSub}>
              Real-time overview of your family&apos;s safety status.
            </Text>
          </View>
          <Pressable
            onPress={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
            style={styles.refreshBtn}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={PRIMARY[600]} />
            ) : (
              <RefreshCw size={14} color={PRIMARY[600]} />
            )}
            <Text style={styles.refreshBtnText}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.summaryBar,
            {
              backgroundColor: allSafe ? '#ecfdf5' : '#fffbeb',
              borderColor: allSafe ? '#a7f3d0' : '#fde68a',
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            {allSafe ? (
              <ShieldCheck size={22} color="#059669" />
            ) : (
              <AlertTriangle size={22} color="#d97706" />
            )}
            <View>
              <Text
                style={[
                  styles.summaryHeadline,
                  { color: allSafe ? '#065f46' : '#92400e' },
                ]}
              >
                {allSafe
                  ? 'All family members are safe'
                  : `${summary.alert + summary.outside} member${
                      summary.alert + summary.outside !== 1 ? 's' : ''
                    } need${summary.alert + summary.outside === 1 ? 's' : ''} attention`}
              </Text>
              <Text
                style={[
                  styles.summarySubtitle,
                  { color: allSafe ? '#059669' : '#b45309' },
                ]}
              >
                Auto-refreshes every 30 seconds
              </Text>
            </View>
          </View>

          <View style={styles.statPills}>
            <StatPill value={summary.total} label="Total" tint="gray" />
            <StatPill value={summary.safe} label="Safe" tint="emerald" />
            <StatPill value={summary.outside} label="Outside" tint="amber" />
            <StatPill value={summary.offline} label="Offline" tint="gray" />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={PRIMARY[600]} />
          </View>
        ) : members.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyBlock}>
              <View style={styles.emptyIcon}>
                <Heart size={28} color={GRAY[400]} />
              </View>
              <Text style={styles.emptyTitle}>No family members yet</Text>
              <Text style={styles.emptyHint}>
                Add family members to start monitoring their safety in real time.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('FamilyMembers')}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Manage Family Members</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {members.map((m) => (
              <MemberCard
                key={m.id}
                name={m.fullName}
                nickname={m.nickname}
                status={m.status}
                statusLabel={m.statusLabel}
                userType={m.userType}
                insideZoneName={m.insideZoneName}
                lastSeen={m.lastSeen}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StatPill({
  value,
  label,
  tint,
}: {
  value: number;
  label: string;
  tint: 'emerald' | 'amber' | 'gray';
}) {
  const colors = {
    emerald: { bg: '#dcfce7', fg: '#15803d' },
    amber: { bg: '#fef3c7', fg: '#92400e' },
    gray: { bg: GRAY[100], fg: GRAY[700] },
  }[tint];
  return (
    <View style={[styles.statPill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statPillNumber, { color: colors.fg }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

function MemberCard({
  name,
  nickname,
  status,
  statusLabel,
  userType,
  insideZoneName,
  lastSeen,
}: {
  name: string;
  nickname: string | null;
  status: MemberStatus;
  statusLabel: string;
  userType: string;
  insideZoneName: string | null;
  lastSeen: string | null;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.memberCard, { borderColor: cfg.border }]}>
      <View style={[styles.memberAvatar, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.memberInitials, { color: cfg.fg }]}>
          {initials(name)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{nickname || name}</Text>
        <Text style={styles.memberMeta}>
          {USER_TYPE_LABELS[userType] ?? userType}
          {insideZoneName ? ` · ${insideZoneName}` : ''}
        </Text>
        {!!lastSeen && (
          <Text style={styles.memberLastSeen}>
            Last seen {timeAgo(lastSeen)}
          </Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
        <cfg.Icon size={12} color={cfg.fg} />
        <Text style={[styles.statusBadgeText, { color: cfg.fg }]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const USER_TYPE_LABELS: Record<string, string> = {
  child: 'Child',
  elderly: 'Elderly',
  adult: 'Adult',
};

const STATUS_CONFIG: Record<
  MemberStatus,
  {
    bg: string;
    fg: string;
    border: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
  }
> = {
  safe: { bg: '#dcfce7', fg: '#15803d', border: '#bbf7d0', Icon: ShieldCheck },
  outside: { bg: '#fef3c7', fg: '#92400e', border: '#fde68a', Icon: MapPin },
  alert: { bg: '#fef3c7', fg: '#92400e', border: '#fde68a', Icon: AlertTriangle },
  emergency: { bg: '#fee2e2', fg: PRIMARY[700], border: '#fecaca', Icon: Radio },
  offline: { bg: GRAY[100], fg: GRAY[600], border: GRAY[200], Icon: WifiOff },
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 4, fontSize: 12, color: GRAY[600], lineHeight: 17 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[200],
    backgroundColor: '#fff',
  },
  refreshBtnText: { color: PRIMARY[600], fontWeight: '600', fontSize: 12 },

  summaryBar: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryHeadline: { fontSize: 14, fontWeight: '700' },
  summarySubtitle: { fontSize: 11, marginTop: 2 },
  statPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statPill: {
    flexBasis: '22%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  statPillNumber: { fontSize: 18, fontWeight: '800' },
  statPillLabel: { fontSize: 10, fontWeight: '700' },

  loadingBlock: { paddingVertical: 40, alignItems: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[100],
  },
  emptyBlock: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: GRAY[900], marginTop: 4 },
  emptyHint: {
    fontSize: 13,
    color: GRAY[600],
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: PRIMARY[600],
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Member card
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: { fontWeight: '800', fontSize: 14 },
  memberName: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  memberMeta: { fontSize: 12, color: GRAY[600], marginTop: 2 },
  memberLastSeen: { fontSize: 11, color: GRAY[500], marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
});

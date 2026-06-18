/**
 * Family Map — mirrors the web's /dashboard/family-map.
 *
 * Companion-app note: web uses Leaflet for interactive map. Mobile uses a
 * static OpenStreetMap tile preview (same approach as LocationSharingScreen),
 * with markers rendered as absolutely-positioned chips. Tapping a marker
 * triggers the same backend check-in (POST /api/family/check-in).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Map as MapIcon,
  RefreshCw,
  MapPin,
  Send,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import { familyApi, type MonitoringMember } from '@/api/family';

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 };

export default function FamilyMapScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['family', 'monitoring'],
    queryFn: familyApi.getFamilyMonitoring,
    refetchInterval: 30_000,
  });

  const members = (data?.members ?? []).filter(
    (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number',
  );

  const center = members.length
    ? averageCenter(members)
    : DEFAULT_CENTER;

  const sendCheckIn = useMutation({
    mutationFn: (targetUserId: string) =>
      familyApi.sendFamilyCheckIn(targetUserId),
    onSuccess: () =>
      Alert.alert('Check-in sent', 'They’ll get a notification to respond.'),
    onError: () => Alert.alert('Couldn’t send check-in', 'Please try again.'),
  });

  const updatedLabel = dataUpdatedAt ? timeAgo(new Date(dataUpdatedAt)) : 'just now';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.headerTitleRow}>
              <MapIcon size={22} color={PRIMARY[600]} />
              <Text style={styles.headerTitle}>Family Map</Text>
            </View>
            <Text style={styles.headerSub}>
              See where your family members are in real time.
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

        <View style={styles.mapCard}>
          <View style={styles.mapBadge}>
            <View style={styles.mapBadgeDot} />
            <Text style={styles.mapBadgeText}>
              Updated {updatedLabel}
            </Text>
          </View>

          <View style={styles.mapWrap}>
            {isLoading ? (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator color={PRIMARY[600]} />
                <Text style={styles.mapPlaceholderText}>Loading map…</Text>
              </View>
            ) : (
              <Image
                source={{
                  uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${center.lat},${center.lng}&zoom=12&size=600x320&maptype=mapnik`,
                }}
                style={styles.mapImage}
                resizeMode="cover"
              />
            )}

            {members.length === 0 && !isLoading && (
              <View style={styles.emptyOverlay}>
                <View style={styles.emptyIcon}>
                  <MapPin size={28} color={GRAY[400]} />
                </View>
                <Text style={styles.emptyTitle}>No locations available</Text>
                <Text style={styles.emptyHint}>
                  Family members will appear here once they share their location.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.legendRow}>
            <Legend dot="#22c55e" label="Safe zone" />
            <Legend dot="#f59e0b" label="Outside" />
            <Legend dot={GRAY[400]} label="Offline" />
          </View>
        </View>

        {members.length > 0 && (
          <View style={{ gap: 10 }}>
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                onCheckIn={() => sendCheckIn.mutate(m.id)}
                sending={sendCheckIn.isPending && sendCheckIn.variables === m.id}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function MemberRow({
  member,
  onCheckIn,
  sending,
}: {
  member: MonitoringMember;
  onCheckIn: () => void;
  sending: boolean;
}) {
  const tint =
    member.status === 'safe'
      ? '#22c55e'
      : member.status === 'offline'
      ? GRAY[400]
      : '#f59e0b';
  return (
    <View style={styles.memberRow}>
      <View style={[styles.memberDot, { backgroundColor: tint }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.memberRowName}>
          {member.nickname || member.fullName}
        </Text>
        <Text style={styles.memberRowMeta}>
          {member.insideZoneName ?? member.statusLabel}
          {member.lastSeen ? ` · ${timeAgo(new Date(member.lastSeen))}` : ''}
        </Text>
      </View>
      <Pressable
        onPress={onCheckIn}
        disabled={sending}
        style={[styles.checkInBtn, sending && { opacity: 0.6 }]}
      >
        {sending ? (
          <ActivityIndicator size="small" color={PRIMARY[600]} />
        ) : (
          <Send size={14} color={PRIMARY[600]} />
        )}
        <Text style={styles.checkInBtnText}>Check-in</Text>
      </Pressable>
    </View>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: dot }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function averageCenter(
  members: { latitude?: number | null; longitude?: number | null }[],
): { lat: number; lng: number } {
  const valid = members.filter(
    (m) => typeof m.latitude === 'number' && typeof m.longitude === 'number',
  );
  if (!valid.length) return DEFAULT_CENTER;
  const lat = valid.reduce((acc, m) => acc + (m.latitude ?? 0), 0) / valid.length;
  const lng = valid.reduce((acc, m) => acc + (m.longitude ?? 0), 0) / valid.length;
  return { lat, lng };
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
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

  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: GRAY[100],
    position: 'relative',
  },
  mapBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  mapBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  mapBadgeText: { fontSize: 10, color: GRAY[800], fontWeight: '600' },

  mapWrap: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: GRAY[100],
    position: 'relative',
  },
  mapImage: { width: '100%', height: '100%' },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: { fontSize: 12, color: GRAY[600] },

  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    gap: 6,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  emptyHint: {
    fontSize: 12,
    color: GRAY[600],
    textAlign: 'center',
    maxWidth: 280,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: GRAY[700] },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY[100],
  },
  memberDot: { width: 10, height: 10, borderRadius: 5 },
  memberRowName: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  memberRowMeta: { fontSize: 12, color: GRAY[600], marginTop: 2 },
  checkInBtn: {
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
  checkInBtnText: { color: PRIMARY[600], fontWeight: '600', fontSize: 12 },
});

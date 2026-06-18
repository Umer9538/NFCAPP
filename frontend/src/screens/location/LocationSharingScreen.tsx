/**
 * Location Sharing Screen — mirrors the web's /dashboard/location-sharing 1:1.
 *
 * Companion-app note: uses the same backend the web uses
 * (POST /api/location/share, GET /api/location/history, DELETE /api/location/:token).
 * Static OpenStreetMap tile is rendered as an Image — no react-native-maps
 * dependency needed for v1. Native share sheet (Share.share) replaces the
 * web's clipboard/email/WhatsApp picker.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import {
  MapPin,
  Share2,
  Eye,
  Clock,
  Navigation as NavIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Trash2,
  Copy,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { PRIMARY, GRAY } from '@/constants/colors';
import locationApi, { type LocationShare } from '@/api/location';

interface Coords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

export function LocationSharingScreen() {
  return <LocationSharingContent />;
}

export default LocationSharingScreen;

function LocationSharingContent() {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState<Coords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resolvingLocation, setResolvingLocation] = useState(false);

  const fetchPosition = useCallback(async () => {
    setResolvingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrent({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? undefined,
        altitude: pos.coords.altitude,
      });
    } catch (e: any) {
      setLocationError(e?.message ?? 'Unable to get location');
    } finally {
      setResolvingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  const historyQ = useQuery({
    queryKey: ['location', 'history'],
    queryFn: () => locationApi.getLocationHistory(20),
  });
  const shares = historyQ.data?.shares ?? [];

  const shareMutation = useMutation({
    mutationFn: () => {
      if (!current) {
        throw new Error('No current location');
      }
      return locationApi.createLocationShare({
        latitude: current.latitude,
        longitude: current.longitude,
        accuracy: current.accuracy,
        altitude: current.altitude ?? undefined,
        expiresInHours: 1,
      });
    },
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['location', 'history'] });
      try {
        await Share.share({
          message: `I'm sharing my live location with you for the next hour:\n${res.shareUrl}`,
          url: res.shareUrl,
        });
      } catch {
        Alert.alert('Share link ready', res.shareUrl);
      }
    },
    onError: (e: any) => {
      Alert.alert(
        'Couldn’t share',
        e?.message ?? 'Please try again.',
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (token: string) => locationApi.deactivateLocationShare(token),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['location', 'history'] }),
  });

  const activeShares = shares.filter(
    (s) => s.isActive && new Date(s.expiresAt) > new Date(),
  );
  const totalViews = shares.reduce((acc, s) => acc + s.accessCount, 0);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View style={styles.statsGrid}>
          <StatCard
            label="Active Shares"
            value={activeShares.length}
            Icon={Share2}
            tint={{ bg: '#dbeafe', fg: '#2563eb' }}
          />
          <StatCard
            label="Total Views"
            value={totalViews}
            Icon={Eye}
            tint={{ bg: '#dcfce7', fg: '#16a34a' }}
          />
          <StatCard
            label="Total Shares"
            value={shares.length}
            Icon={Clock}
            tint={{ bg: '#f3e8ff', fg: '#9333ea' }}
          />
        </View>

        <CurrentLocationCard
          current={current}
          error={locationError}
          loading={resolvingLocation}
          onRefresh={fetchPosition}
          onShare={() => shareMutation.mutate()}
          sharing={shareMutation.isPending}
        />

        <ShareHistoryCard
          loading={historyQ.isLoading}
          shares={shares}
          onRefresh={() => historyQ.refetch()}
          onDeactivate={(token) => {
            Alert.alert(
              'Deactivate share?',
              'The link will stop working immediately.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Deactivate',
                  style: 'destructive',
                  onPress: () => deactivateMutation.mutate(token),
                },
              ],
            );
          }}
        />

        <HowItWorks />

        <FreeNotice />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Header
// ──────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View>
      <View style={styles.headerTitleRow}>
        <MapPin size={26} color="#2563eb" />
        <Text style={styles.headerTitle}>Location Sharing</Text>
      </View>
      <Text style={styles.headerSub}>
        Share your location with emergency contacts in case of emergencies. All
        maps are powered by OpenStreetMap (free).
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stat cards
// ──────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  Icon,
  tint,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  tint: { bg: string; fg: string };
}) {
  return (
    <View style={[styles.statCard, { borderColor: tint.bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: tint.fg }]}>{value}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: tint.bg }]}>
        <Icon size={20} color={tint.fg} />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Current location card
// ──────────────────────────────────────────────────────────────────────────

function CurrentLocationCard({
  current,
  error,
  loading,
  onRefresh,
  onShare,
  sharing,
}: {
  current: Coords | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  onShare: () => void;
  sharing: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderTitleRow}>
          <NavIcon size={18} color="#2563eb" />
          <Text style={styles.cardTitle}>Your Current Location</Text>
        </View>
        <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={styles.refreshBtn}
          hitSlop={8}
        >
          <RefreshCw size={14} color={GRAY[600]} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {error ? (
        <LocationError
          message={error}
          onRetry={onRefresh}
          onOpenSettings={() => Linking.openSettings()}
        />
      ) : current ? (
        <MapPreview latitude={current.latitude} longitude={current.longitude} />
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator color={GRAY[400]} />
          <Text style={styles.mapPlaceholderText}>Getting your location…</Text>
        </View>
      )}

      <Pressable
        onPress={onShare}
        disabled={!current || sharing}
        style={[
          styles.shareBtn,
          (!current || sharing) && { opacity: 0.5 },
        ]}
      >
        {sharing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MapPin size={18} color="#fff" />
        )}
        <Text style={styles.shareBtnText}>
          {sharing ? 'Creating share link…' : 'Share My Location'}
        </Text>
      </Pressable>
    </View>
  );
}

function LocationError({
  message,
  onRetry,
  onOpenSettings,
}: {
  message: string;
  onRetry: () => void;
  onOpenSettings: () => void;
}) {
  const denied = message.toLowerCase().includes('denied');
  return (
    <View style={styles.errorBox}>
      <View style={styles.errorHeader}>
        <AlertCircle size={20} color="#a16207" />
        <Text style={styles.errorTitle}>{message}</Text>
      </View>
      {denied ? (
        <Text style={styles.errorText}>
          Location access is blocked. Open Settings → MedGuard → Permissions →
          Location, and grant access.
        </Text>
      ) : (
        <Text style={styles.errorText}>
          Please enable location access to share your location.
        </Text>
      )}
      <View style={styles.errorActions}>
        <Pressable onPress={onRetry} style={styles.errorPrimaryBtn}>
          <Text style={styles.errorPrimaryBtnText}>Try Again</Text>
        </Pressable>
        {denied && (
          <Pressable onPress={onOpenSettings} style={styles.errorSecondaryBtn}>
            <Text style={styles.errorSecondaryBtnText}>Open Settings</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MapPreview({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;
  return (
    <View style={styles.mapWrap}>
      <Image
        source={{ uri: url }}
        style={styles.mapImage}
        resizeMode="cover"
      />
      <View style={styles.mapPin}>
        <View style={styles.mapPinBubble}>
          <MapPin size={18} color="#fff" />
        </View>
      </View>
      <View style={styles.mapBadge}>
        <View style={styles.mapBadgeDot} />
        <Text style={styles.mapBadgeText}>OpenStreetMap (Free)</Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Share history
// ──────────────────────────────────────────────────────────────────────────

function ShareHistoryCard({
  loading,
  shares,
  onRefresh,
  onDeactivate,
}: {
  loading: boolean;
  shares: LocationShare[];
  onRefresh: () => void;
  onDeactivate: (token: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderTitleRow}>
          <Clock size={16} color={GRAY[600]} />
          <Text style={styles.cardTitle}>Share History</Text>
        </View>
        <Pressable onPress={onRefresh} style={styles.refreshBtn} hitSlop={8}>
          <RefreshCw size={14} color={GRAY[600]} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.cardLoading}>
          <ActivityIndicator color={PRIMARY[600]} />
        </View>
      ) : shares.length === 0 ? (
        <View style={styles.emptyState}>
          <MapPin size={40} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No shares yet</Text>
          <Text style={styles.emptyHint}>
            Share your location to see history
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {shares.map((s) => (
            <ShareHistoryItem
              key={s.id}
              share={s}
              onDeactivate={() => onDeactivate(s.shareToken)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ShareHistoryItem({
  share,
  onDeactivate,
}: {
  share: LocationShare;
  onDeactivate: () => void;
}) {
  const expired = new Date(share.expiresAt) < new Date();
  const active = share.isActive && !expired;
  const status: { label: string; bg: string; fg: string } = !share.isActive
    ? { label: 'Deactivated', bg: GRAY[100], fg: GRAY[700] }
    : expired
    ? { label: 'Expired', bg: '#fef9c3', fg: '#a16207' }
    : { label: 'Active', bg: '#dcfce7', fg: '#166534' };

  const handleCopy = async () => {
    const url = `https://nfc-medical-profile-platform.vercel.app/location/${share.shareToken}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Copied', 'Share link copied to clipboard.');
  };

  return (
    <View
      style={[
        styles.shareItem,
        active ? styles.shareItemActive : styles.shareItemInactive,
      ]}
    >
      <View style={styles.shareItemHeader}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusBadgeText, { color: status.fg }]}>
            {status.label}
          </Text>
        </View>
        <Text style={styles.shareItemTime}>
          {formatTimeAgo(share.createdAt)}
        </Text>
      </View>

      <View style={styles.shareItemRow}>
        <MapPin size={14} color={GRAY[400]} />
        <Text style={styles.shareItemLocation} numberOfLines={1}>
          {share.city && share.region
            ? `${share.city}, ${share.region}`
            : `${share.latitude.toFixed(4)}, ${share.longitude.toFixed(4)}`}
        </Text>
      </View>

      <View style={styles.shareItemRow}>
        <Eye size={12} color={GRAY[400]} />
        <Text style={styles.shareItemViews}>{share.accessCount} views</Text>
      </View>

      {active && (
        <View style={styles.shareItemActions}>
          <Pressable onPress={handleCopy} style={styles.shareActionBtn}>
            <Copy size={14} color={GRAY[600]} />
          </Pressable>
          <Pressable
            onPress={() =>
              Share.share({
                message: `My location: https://nfc-medical-profile-platform.vercel.app/location/${share.shareToken}`,
              })
            }
            style={[
              styles.shareActionBtn,
              { backgroundColor: '#dbeafe' },
            ]}
          >
            <ExternalLink size={14} color="#2563eb" />
          </Pressable>
          <Pressable
            onPress={onDeactivate}
            style={[
              styles.shareActionBtn,
              { backgroundColor: '#fee2e2' },
            ]}
          >
            <Trash2 size={14} color={PRIMARY[600]} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ──────────────────────────────────────────────────────────────────────────
// How It Works
// ──────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '1',
      bg: '#dbeafe',
      fg: '#2563eb',
      title: 'Share Location',
      text: 'Tap the button to share your GPS location. A unique link is generated.',
    },
    {
      n: '2',
      bg: '#dcfce7',
      fg: '#16a34a',
      title: 'Send to Contacts',
      text: 'Share via SMS, WhatsApp, or Email to your emergency contacts.',
    },
    {
      n: '3',
      bg: '#f3e8ff',
      fg: '#9333ea',
      title: 'View Nearby Help',
      text: 'Recipients see your location with nearby hospitals, police & pharmacies.',
    },
  ];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderTitleRow}>
        <Info size={16} color="#2563eb" />
        <Text style={styles.cardTitle}>How Location Sharing Works</Text>
      </View>
      <View style={styles.howGrid}>
        {steps.map((s) => (
          <View key={s.n} style={styles.howTile}>
            <View style={[styles.howCircle, { backgroundColor: s.bg }]}>
              <Text style={[styles.howNumber, { color: s.fg }]}>{s.n}</Text>
            </View>
            <Text style={styles.howTitle}>{s.title}</Text>
            <Text style={styles.howText}>{s.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FreeNotice() {
  return (
    <View style={styles.freeNotice}>
      <CheckCircle2 size={20} color="#16a34a" />
      <View style={{ flex: 1 }}>
        <Text style={styles.freeTitle}>100% Free — No Hidden Costs</Text>
        <Text style={styles.freeText}>
          Location sharing uses OpenStreetMap and Overpass API which are
          completely free and open-source. Your location data is encrypted and
          share links expire after 1 hour for privacy protection.
        </Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scrollContent: { padding: 16, gap: 14 },

  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 13,
    color: GRAY[600],
    lineHeight: 18,
  },

  // Stat grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flexBasis: '30%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    gap: 8,
    minHeight: 80,
  },
  statLabel: { fontSize: 11, color: GRAY[600], fontWeight: '500' },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  cardLoading: { paddingVertical: 24, alignItems: 'center' },

  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  refreshText: { fontSize: 12, color: GRAY[600], fontWeight: '600' },

  // Map preview
  mapWrap: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: GRAY[100],
    position: 'relative',
  },
  mapImage: { width: '100%', height: '100%' },
  mapPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -32 }],
  },
  mapPinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  mapPlaceholder: {
    height: 220,
    borderRadius: 12,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapPlaceholderText: { fontSize: 12, color: GRAY[500] },

  // Share button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Error
  errorBox: {
    backgroundColor: '#fef9c3',
    borderColor: '#fde047',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTitle: { color: '#854d0e', fontWeight: '700', fontSize: 13 },
  errorText: { color: '#a16207', fontSize: 12, lineHeight: 17 },
  errorActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  errorPrimaryBtn: {
    backgroundColor: '#ca8a04',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorPrimaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  errorSecondaryBtn: {
    backgroundColor: '#fff',
    borderColor: '#fde047',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorSecondaryBtnText: { color: '#a16207', fontWeight: '700', fontSize: 12 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  emptyTitle: { fontSize: 13, color: GRAY[500], marginTop: 6, fontWeight: '600' },
  emptyHint: { fontSize: 12, color: GRAY[400] },

  // Share item
  shareItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    gap: 6,
  },
  shareItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  shareItemInactive: {
    backgroundColor: GRAY[50],
    borderColor: GRAY[200],
  },
  shareItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  shareItemTime: { fontSize: 10, color: GRAY[500] },
  shareItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareItemLocation: { fontSize: 12, color: GRAY[700], flex: 1 },
  shareItemViews: { fontSize: 11, color: GRAY[500] },
  shareItemActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  shareActionBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: GRAY[100],
    borderRadius: 8,
    alignItems: 'center',
  },

  // How It Works
  howGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  howTile: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderColor: GRAY[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  howCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  howNumber: { fontSize: 14, fontWeight: '800' },
  howTitle: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  howText: { fontSize: 11, color: GRAY[600], lineHeight: 16 },

  // Free notice
  freeNotice: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: CARD_RADIUS,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  freeTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900], marginBottom: 4 },
  freeText: { fontSize: 12, color: GRAY[700], lineHeight: 17 },
});

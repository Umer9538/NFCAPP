/**
 * NFC Bracelet Screen — mirrors the web's /dashboard/bracelet page 1:1.
 *
 * Companion-app note: the mobile app supports NFC natively, so we skip the
 * web's "NFC Not Supported" notice. The Link button routes to NFCRegister,
 * which uses react-native-nfc-manager to scan and POST /api/bracelet/link.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Link2,
  QrCode,
  Shield,
  Smartphone,
  Unlink,
} from 'lucide-react-native';

import { braceletApi } from '@/api/bracelet';
import { PRIMARY, GRAY } from '@/constants/colors';
import type { AppScreenNavigationProp } from '@/navigation/types';

function formatDate(d: string | undefined | null): string {
  if (!d) return 'Never';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
}

export default function BraceletScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();

  const { data: bracelet, isLoading } = useQuery({
    queryKey: ['bracelet', 'status'],
    queryFn: braceletApi.getBraceletStatus,
  });

  const unlinkMutation = useMutation({
    mutationFn: braceletApi.unlinkBracelet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });
    },
    onError: () => {
      Alert.alert('Couldn’t unlink', 'Please try again.');
    },
  });

  const handleUnlink = () => {
    Alert.alert(
      'Unlink bracelet?',
      'Your medical profile will not be accessible via NFC until you link a new bracelet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () => unlinkMutation.mutate(),
        },
      ],
    );
  };

  const isLinked = !!bracelet;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        {isLoading ? (
          <View style={styles.cardLoading}>
            <ActivityIndicator color={PRIMARY[600]} />
            <Text style={styles.cardLoadingText}>Loading bracelet status…</Text>
          </View>
        ) : (
          <>
            <StatusCard
              bracelet={bracelet ?? null}
              onLink={() => navigation.navigate('NFCRegister')}
              onUnlink={handleUnlink}
              unlinking={unlinkMutation.isPending}
            />

            {isLinked && bracelet && (
              <>
                <QuickActions
                  onTest={() => navigation.navigate('NFCScanner')}
                  onReplace={() => navigation.navigate('NFCRegister')}
                  onQR={() =>
                    navigation.navigate('QRCodeGenerator', {
                      profileId: bracelet.id,
                    })
                  }
                />
                <HowItWorks />
                <SecurityFeatures />
              </>
            )}
          </>
        )}

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
      <Text style={styles.headerTitle}>NFC Bracelet</Text>
      <Text style={styles.headerSub}>
        Manage your NFC-enabled medical bracelet and emergency access settings.
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Status card
// ──────────────────────────────────────────────────────────────────────────

interface BraceletData {
  id: string;
  status: string;
  linkedDate: string;
  lastAccessed?: string;
  accessCount: number;
}

function StatusCard({
  bracelet,
  onLink,
  onUnlink,
  unlinking,
}: {
  bracelet: BraceletData | null;
  onLink: () => void;
  onUnlink: () => void;
  unlinking: boolean;
}) {
  const linked = !!bracelet;

  return (
    <View style={[styles.card, linked && styles.cardActive]}>
      <View style={styles.statusHeader}>
        <View style={styles.statusHeaderLeft}>
          <View
            style={[
              styles.statusIconTile,
              { backgroundColor: linked ? PRIMARY[600] : GRAY[400] },
            ]}
          >
            <Activity size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Bracelet Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: linked ? '#dcfce7' : '#fef9c3',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: linked ? '#166534' : '#a16207' },
                ]}
              >
                {linked ? 'Active' : 'Not Linked'}
              </Text>
            </View>
          </View>
        </View>
        {linked && (
          <Pressable
            disabled={unlinking}
            onPress={onUnlink}
            style={({ pressed }) => [
              styles.unlinkBtn,
              pressed && { opacity: 0.6 },
              unlinking && { opacity: 0.4 },
            ]}
          >
            {unlinking ? (
              <ActivityIndicator size="small" color={PRIMARY[600]} />
            ) : (
              <Unlink size={16} color={PRIMARY[600]} />
            )}
            <Text style={styles.unlinkBtnText}>
              {unlinking ? 'Unlinking…' : 'Unlink'}
            </Text>
          </Pressable>
        )}
      </View>

      {linked && bracelet ? (
        <View style={styles.metaGrid}>
          <Meta label="Bracelet ID" value={bracelet.id} mono />
          <Meta label="Status" value={bracelet.status} capitalize />
          <Meta label="Linked Date" value={formatDate(bracelet.linkedDate)} />
          <Meta
            label="Last Accessed"
            value={formatDate(bracelet.lastAccessed)}
          />
          <Meta
            label="Total Accesses"
            value={`${bracelet.accessCount ?? 0} times`}
          />
        </View>
      ) : (
        <View style={styles.unlinkedBlock}>
          <AlertTriangle size={48} color="#eab308" />
          <Text style={styles.unlinkedTitle}>
            No bracelet linked to your account
          </Text>
          <Pressable onPress={onLink} style={styles.primaryBtn}>
            <Link2 size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Link Bracelet via NFC</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Meta({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text
        style={[
          styles.metaValue,
          mono && styles.metaValueMono,
          capitalize && { textTransform: 'capitalize' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Quick Actions (only when linked)
// ──────────────────────────────────────────────────────────────────────────

function QuickActions({
  onTest,
  onReplace,
  onQR,
}: {
  onTest: () => void;
  onReplace: () => void;
  onQR: () => void;
}) {
  const items = [
    {
      title: 'Test Bracelet',
      description: 'Verify NFC functionality',
      Icon: Smartphone,
      color: { bg: '#dbeafe', fg: '#2563eb' },
      onPress: onTest,
    },
    {
      title: 'Replace Bracelet',
      description: 'Link a new device',
      Icon: Link2,
      color: { bg: '#fee2e2', fg: PRIMARY[600] },
      onPress: onReplace,
    },
    {
      title: 'QR Code',
      description: 'Generate & download',
      Icon: QrCode,
      color: { bg: '#f3e8ff', fg: '#9333ea' },
      onPress: onQR,
    },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        {items.map((a) => (
          <Pressable
            key={a.title}
            onPress={a.onPress}
            style={({ pressed }) => [
              styles.actionTile,
              pressed && { borderColor: PRIMARY[400], backgroundColor: PRIMARY[50] },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color.bg }]}>
              <a.Icon size={22} color={a.color.fg} />
            </View>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionDesc}>{a.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// How It Works
// ──────────────────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      title: 'Tap to Access',
      text:
        'Emergency responders tap your bracelet with their smartphone to instantly access your medical profile.',
    },
    {
      title: 'Secure Access',
      text:
        'The bracelet opens a secure webpage showing your critical medical information — no app required.',
    },
    {
      title: 'Audit Trail',
      text:
        'Every access is logged with timestamp and location for your security and peace of mind.',
    },
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>How Your NFC Bracelet Works</Text>
      <View style={{ gap: 14 }}>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Security features
// ──────────────────────────────────────────────────────────────────────────

function SecurityFeatures() {
  const features = [
    {
      title: 'Encrypted Data',
      text: 'All information is encrypted at rest and in transit',
    },
    {
      title: 'No Personal Data on Device',
      text: 'The bracelet only contains a unique ID',
    },
    {
      title: 'Audit Logging',
      text: 'Every access is tracked and logged',
    },
    {
      title: 'PIPEDA Compliant',
      text: 'Meets Canadian privacy standards',
    },
  ];
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Shield size={20} color={PRIMARY[600]} />
        <Text style={styles.cardTitle}>Security Features</Text>
      </View>
      <View style={styles.securityGrid}>
        {features.map((f) => (
          <View key={f.title} style={styles.securityItem}>
            <CheckCircle2 size={18} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>{f.title}</Text>
              <Text style={styles.securityText}>{f.text}</Text>
            </View>
          </View>
        ))}
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

  headerTitle: {
    fontSize: 26,
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

  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 14,
  },
  cardActive: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  cardLoading: { paddingVertical: 24, alignItems: 'center', gap: 8 },
  cardLoadingText: { color: GRAY[600], fontSize: 13 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: GRAY[900], letterSpacing: -0.2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusIconTile: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  unlinkBtn: {
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
  unlinkBtnText: { color: PRIMARY[600], fontSize: 13, fontWeight: '600' },

  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metaItem: { flexBasis: '46%', flexGrow: 1 },
  metaLabel: { fontSize: 11, color: GRAY[500], fontWeight: '500' },
  metaValue: { fontSize: 14, color: GRAY[900], fontWeight: '600', marginTop: 2 },
  metaValueMono: {
    fontFamily: 'Courier',
    fontSize: 13,
  },

  unlinkedBlock: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  unlinkedTitle: { fontSize: 14, color: GRAY[700] },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: {
    flexBasis: '46%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderColor: GRAY[200],
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  actionDesc: { fontSize: 12, color: GRAY[600], textAlign: 'center' },

  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { color: PRIMARY[600], fontWeight: '800', fontSize: 14 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900], marginBottom: 2 },
  stepText: { fontSize: 12, color: GRAY[600], lineHeight: 17 },

  securityGrid: { gap: 12 },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  securityTitle: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  securityText: { fontSize: 12, color: GRAY[600], marginTop: 2 },
});

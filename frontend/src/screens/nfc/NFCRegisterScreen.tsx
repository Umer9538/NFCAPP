/**
 * NFC Register Screen — link an NFC bracelet to the user's account.
 *
 * Companion-app flow: scan a tag with react-native-nfc-manager (via the
 * existing nfcService wrapper), derive an NFC ID matching the web's format
 * (`NFC-${serial.replace(':','').toUpperCase().substring(0,12)}`), then
 * POST /api/bracelet/link — the same endpoint the web uses.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Smartphone,
  Sparkles,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import { nfcService, type NFCTag } from '@/services/nfcService';
import { braceletApi } from '@/api/bracelet';
import type { LinkBraceletRequest } from '@/types/bracelet';

type ScanStatus = 'idle' | 'scanning' | 'detected' | 'linking' | 'linked' | 'error';

export default function NFCRegisterScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedTag, setScannedTag] = useState<NFCTag | null>(null);

  const linkMutation = useMutation({
    mutationFn: (body: LinkBraceletRequest) => braceletApi.linkBracelet(body),
    onMutate: () => setStatus('linking'),
    onSuccess: () => {
      setStatus('linked');
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });
    },
    onError: (e: any) => {
      setStatus('error');
      const apiMsg =
        e?.response?.data?.error || e?.message || 'Couldn’t link bracelet.';
      setErrorMsg(String(apiMsg));
    },
  });

  const handleScan = useCallback(async () => {
    setErrorMsg(null);
    setScannedTag(null);
    setStatus('scanning');

    await nfcService.startScanning(
      (tag) => {
        setScannedTag(tag);
        setStatus('detected');
        const nfcId = `NFC-${(tag.id || '')
          .replace(/:/g, '')
          .toUpperCase()
          .substring(0, 12)}`;
        linkMutation.mutate({
          nfcId,
          deviceInfo: {
            model: Platform.OS,
            os: `${Platform.OS} ${Platform.Version}`,
          },
        });
      },
      (err) => {
        setStatus('error');
        setErrorMsg(err.message);
      },
    );
  }, [linkMutation]);

  useEffect(() => {
    return () => {
      nfcService.stopScanning?.();
    };
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Link NFC Bracelet</Text>
        <Text style={styles.headerSub}>
          Tap your NFC bracelet to the back of your phone to link it to your
          account. Make sure NFC is enabled in your device settings.
        </Text>

        <ScanCard
          status={status}
          tag={scannedTag}
          errorMsg={errorMsg}
          onScan={handleScan}
          onDone={() => navigation.goBack()}
          onRetry={() => {
            setStatus('idle');
            setErrorMsg(null);
            setScannedTag(null);
          }}
        />

        <TipsCard />

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function ScanCard({
  status,
  tag,
  errorMsg,
  onScan,
  onDone,
  onRetry,
}: {
  status: ScanStatus;
  tag: NFCTag | null;
  errorMsg: string | null;
  onScan: () => void;
  onDone: () => void;
  onRetry: () => void;
}) {
  if (status === 'linked') {
    return (
      <View style={[styles.card, styles.cardSuccess]}>
        <View style={styles.successIconWrap}>
          <CheckCircle2 size={48} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Bracelet Linked</Text>
        <Text style={styles.successSubtitle}>
          Your medical profile is now accessible via NFC scan.
        </Text>
        {tag && (
          <Text style={styles.tagInfo}>
            Tag: <Text style={styles.tagInfoMono}>{tag.id}</Text>
          </Text>
        )}
        <Pressable onPress={onDone} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.card, styles.cardError]}>
        <View style={styles.errorIconWrap}>
          <AlertTriangle size={36} color={PRIMARY[600]} />
        </View>
        <Text style={styles.errorTitle}>Linking failed</Text>
        <Text style={styles.errorMsg}>
          {errorMsg ?? 'Something went wrong. Please try again.'}
        </Text>
        <Pressable onPress={onRetry} style={styles.primaryBtn}>
          <Wifi size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.scanHero}>
        <View style={styles.scanIconTile}>
          {status === 'scanning' || status === 'detected' || status === 'linking' ? (
            <ActivityIndicator color={PRIMARY[600]} />
          ) : (
            <Sparkles size={24} color={PRIMARY[600]} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>
            {status === 'idle' && 'Scan Your NFC Bracelet'}
            {status === 'scanning' && 'Hold bracelet near device…'}
            {status === 'detected' && 'Tag detected — linking…'}
            {status === 'linking' && 'Linking…'}
          </Text>
          <Text style={styles.scanSubtitle}>
            {status === 'idle'
              ? 'Tap the button below and hold your NFC bracelet against the back of your phone.'
              : status === 'scanning'
              ? 'Keep it steady against the back of the phone until the tag is detected.'
              : 'Talking to the backend to link this tag to your account.'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onScan}
        disabled={status !== 'idle'}
        style={[
          styles.primaryBtn,
          { width: '100%' },
          status !== 'idle' && styles.primaryBtnDisabled,
        ]}
      >
        {status === 'idle' ? (
          <Wifi size={16} color="#fff" />
        ) : (
          <ActivityIndicator size="small" color="#fff" />
        )}
        <Text style={styles.primaryBtnText}>
          {status === 'idle'
            ? 'Start NFC Scan'
            : status === 'scanning'
            ? 'Scanning…'
            : 'Linking…'}
        </Text>
      </Pressable>

      {status === 'scanning' && (
        <View style={styles.scanLiveBox}>
          <Zap size={16} color="#2563eb" />
          <Text style={styles.scanLiveText}>
            Scanning for NFC device — hold your bracelet close to your phone.
          </Text>
        </View>
      )}
    </View>
  );
}

function TipsCard() {
  const tips = [
    'Enable NFC in your device settings',
    'Remove any phone case if scanning fails',
    'Hold the bracelet steady near the back of your phone',
    'Wait for the success message before removing the tag',
  ];
  return (
    <View style={styles.card}>
      <View style={styles.tipsHeader}>
        <Smartphone size={16} color={GRAY[700]} />
        <Text style={styles.tipsHeaderText}>Tips for a successful scan</Text>
      </View>
      <View style={{ gap: 6, width: '100%' }}>
        {tips.map((t) => (
          <View key={t} style={styles.tipRow}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CARD_RADIUS = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scrollContent: { padding: 16, gap: 14 },

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

  card: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    alignItems: 'center',
  },
  cardSuccess: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  cardError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },

  scanHero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  scanIconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900], marginBottom: 4 },
  scanSubtitle: { fontSize: 12, color: GRAY[600], lineHeight: 17 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scanLiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    width: '100%',
  },
  scanLiveText: { color: '#1e40af', fontSize: 12, flex: 1 },

  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 18, fontWeight: '800', color: '#166534' },
  successSubtitle: {
    fontSize: 13,
    color: GRAY[700],
    textAlign: 'center',
    lineHeight: 18,
  },
  tagInfo: { fontSize: 12, color: GRAY[600] },
  tagInfoMono: { fontFamily: 'Courier', color: GRAY[900] },

  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: PRIMARY[700] },
  errorMsg: {
    fontSize: 13,
    color: GRAY[700],
    textAlign: 'center',
    lineHeight: 18,
  },

  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  tipsHeaderText: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY[400],
  },
  tipText: { fontSize: 12, color: GRAY[700], flex: 1 },
});

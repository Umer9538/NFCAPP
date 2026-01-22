/**
 * Scan History Screen
 * View bracelet/QR scan logs - Connected to real API
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Card, Badge, LoadingSpinner } from '@/components/ui';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { scanHistoryApi, ScanRecord } from '@/api/scanHistory';

export default function ScanHistoryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => scanHistoryApi.getScanHistory(50),
  });

  const scans = data?.scans || [];
  const stats = data?.stats || { totalScans: 0, nfcScans: 0, qrScans: 0, thisMonth: 0 };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Scan History</Text>
            <View style={styles.backButton} />
          </View>
        </View>
        <LoadingSpinner visible text="Loading scan history..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Scan History</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Bracelet Scan Logs</Text>
          <Text style={styles.infoText}>
            View when and where your NFC bracelet or QR code was scanned.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="scan" size={24} color={PRIMARY[600]} />
            <Text style={styles.statValue}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wifi" size={24} color={PRIMARY[600]} />
            <Text style={styles.statValue}>{stats.nfcScans}</Text>
            <Text style={styles.statLabel}>NFC Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="qr-code" size={24} color={PRIMARY[600]} />
            <Text style={styles.statValue}>{stats.qrScans}</Text>
            <Text style={styles.statLabel}>QR Scans</Text>
          </View>
        </View>

        {/* Scan List */}
        {scans && scans.length > 0 ? (
          <View style={styles.scanList}>
            {scans.map((scan: ScanRecord) => (
              <Card key={scan.id} variant="outlined" padding="md" style={styles.scanCard}>
                <View style={styles.scanHeader}>
                  <View style={[styles.scanIcon, { backgroundColor: scan.type === 'nfc' ? PRIMARY[50] : '#EEF2FF' }]}>
                    <Ionicons
                      name={scan.type === 'nfc' ? 'wifi' : 'qr-code'}
                      size={20}
                      color={scan.type === 'nfc' ? PRIMARY[600] : '#6366F1'}
                    />
                  </View>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanType}>
                      {scan.type === 'nfc' ? 'NFC Bracelet Scan' : 'QR Code Scan'}
                    </Text>
                    <Text style={styles.scanTime}>
                      {format(new Date(scan.timestamp), 'MMM d, yyyy h:mm a')}
                    </Text>
                  </View>
                  <Badge variant={scan.accessedBy === 'Self' ? 'info' : 'warning'}>
                    {scan.accessedBy === 'Self' ? 'Self' : 'External'}
                  </Badge>
                </View>

                <View style={styles.scanDetails}>
                  {scan.location && (scan.location.city || scan.location.country) && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color={SEMANTIC.text.tertiary} />
                      <Text style={styles.detailText}>
                        {[scan.location.city, scan.location.country].filter(Boolean).join(', ') || 'Unknown location'}
                      </Text>
                    </View>
                  )}
                  {scan.device && (
                    <View style={styles.detailRow}>
                      <Ionicons name="phone-portrait-outline" size={16} color={SEMANTIC.text.tertiary} />
                      <Text style={styles.detailText}>{scan.device}</Text>
                    </View>
                  )}
                  {scan.accessedBy && (
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={16} color={SEMANTIC.text.tertiary} />
                      <Text style={styles.detailText}>{scan.accessedBy}</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card variant="outlined" padding="lg" style={styles.emptyState}>
            <Ionicons name="scan-outline" size={48} color={SEMANTIC.text.tertiary} />
            <Text style={styles.emptyTitle}>No scan history</Text>
            <Text style={styles.emptyText}>
              Scan records will appear here when your bracelet or QR code is scanned.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  headerWrapper: {
    backgroundColor: SEMANTIC.background.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  infoSection: {
    marginBottom: spacing[6],
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  infoText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: 12,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  scanList: {
    gap: spacing[3],
  },
  scanCard: {
    marginBottom: 0,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  scanInfo: {
    flex: 1,
  },
  scanType: {
    fontSize: 15,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  scanTime: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  scanDetails: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    gap: spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailText: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
});

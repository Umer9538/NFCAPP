/**
 * Audit Logs Screen
 * Track all access to user's medical profile for security and compliance
 * Matches website implementation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Badge, LoadingSpinner, Toast, useToast } from '@/components/ui';
import { auditApi } from '@/api/audit';
import type { AuditLog, AuditLogType, AuditLogStatus, AuditLogFilters } from '@/types/audit';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

// Type filter options
const TYPE_OPTIONS: { value: AuditLogType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'profile_access', label: 'Profile Access' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'bracelet_scan', label: 'Bracelet Scan' },
  { value: 'qr_scan', label: 'QR Scan' },
  { value: 'password_change', label: 'Password Change' },
  { value: 'settings_change', label: 'Settings Change' },
  { value: 'emergency_access', label: 'Emergency Access' },
];

// Status filter options
const STATUS_OPTIONS: { value: AuditLogStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'warning', label: 'Warning' },
];

export default function AuditLogsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [filters, setFilters] = useState<AuditLogFilters>({
    type: 'all',
    status: 'all',
    search: '',
  });
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch audit logs
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['auditLogs', page, filters],
    queryFn: () => auditApi.getAuditLogs(page, 20, filters),
  });

  const handleExport = async () => {
    try {
      const result = await auditApi.exportAuditLogs('csv', filters);
      if (result.url) {
        await Linking.openURL(result.url);
        success('Export started');
      }
    } catch (error) {
      showError('Failed to export logs');
    }
  };

  const handleSearch = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
    setPage(1);
  }, []);

  const handleTypeFilter = (type: AuditLogType | 'all') => {
    setFilters(prev => ({ ...prev, type }));
    setShowTypeFilter(false);
    setPage(1);
  };

  const handleStatusFilter = (status: AuditLogStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
    setShowStatusFilter(false);
    setPage(1);
  };

  const getActionIcon = (type: AuditLogType): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    switch (type) {
      case 'login':
      case 'logout':
        return { name: 'log-in', color: MEDICAL_COLORS.green.dark, bg: MEDICAL_COLORS.green.light };
      case 'profile_access':
        return { name: 'eye', color: MEDICAL_COLORS.blue.dark, bg: MEDICAL_COLORS.blue.light };
      case 'profile_update':
        return { name: 'create', color: MEDICAL_COLORS.purple.dark, bg: MEDICAL_COLORS.purple.light };
      case 'bracelet_scan':
      case 'qr_scan':
        return { name: 'scan', color: PRIMARY[600], bg: PRIMARY[50] };
      case 'password_change':
        return { name: 'key', color: MEDICAL_COLORS.yellow.dark, bg: MEDICAL_COLORS.yellow.light };
      case 'settings_change':
        return { name: 'settings', color: SEMANTIC.text.secondary, bg: SEMANTIC.background.secondary };
      case 'emergency_access':
        return { name: 'alert-circle', color: STATUS.error.main, bg: STATUS.error.light };
      default:
        return { name: 'document-text', color: SEMANTIC.text.secondary, bg: SEMANTIC.background.secondary };
    }
  };

  const getStatusBadge = (status: AuditLogStatus) => {
    switch (status) {
      case 'success':
        return { variant: 'success' as const, label: 'success' };
      case 'failure':
        return { variant: 'error' as const, label: 'failed' };
      case 'warning':
        return { variant: 'warning' as const, label: 'warning' };
      default:
        return { variant: 'default' as const, label: status };
    }
  };

  const formatLocation = (log: AuditLog): string => {
    if (!log.location) return 'Unknown';
    const { city, region, country } = log.location;
    if (city && region && country) {
      return `${city}, ${region}, ${country}`;
    }
    if (city && country) {
      return `${city}, ${country}`;
    }
    return country || 'Unknown';
  };

  const formatDevice = (log: AuditLog): string => {
    if (!log.device) return 'Unknown';
    const { platform, browser, os } = log.device;
    const parts = [platform, browser, os].filter(Boolean);
    return parts.length > 0 ? parts.join(' on ') : 'Unknown';
  };

  const renderLogItem = ({ item: log }: { item: AuditLog }) => {
    const icon = getActionIcon(log.type);
    const statusBadge = getStatusBadge(log.status);

    return (
      <View style={styles.logItem}>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <View style={[styles.logIcon, { backgroundColor: icon.bg }]}>
              <Ionicons name={icon.name} size={20} color={icon.color} />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.logActor}>
                {log.actor.type === 'self' ? 'Self' : log.actor.name}
              </Text>
              {log.description && (
                <Text style={styles.logDescription}>{log.description}</Text>
              )}
            </View>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </View>

          <View style={styles.logMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={SEMANTIC.text.tertiary} />
              <Text style={styles.metaText}>
                {format(new Date(log.timestamp), 'MM/dd/yyyy, h:mm:ss a')}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={SEMANTIC.text.tertiary} />
              <Text style={styles.metaText}>{formatLocation(log)}</Text>
            </View>

            {log.ipAddress && (
              <Text style={styles.ipAddress}>{log.ipAddress}</Text>
            )}

            <Text style={styles.deviceText}>{formatDevice(log)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.appBar}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
            </Pressable>
            <Text style={styles.appBarTitle}>Access History</Text>
            <View style={styles.backButton} />
          </View>
        </View>
        <LoadingSpinner visible text="Loading audit logs..." />
      </View>
    );
  }

  const stats = data?.stats || {
    totalAccesses: 0,
    thisMonth: 0,
    failedAttempts: 0,
    uniqueLocations: 0,
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.appBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.appBarTitle}>Access History</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Audit Logs</Text>
          <Text style={styles.subtitle}>
            Track all access to your medical profile for security and compliance.
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Total Accesses</Text>
                <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="document-text" size={20} color="#6366F1" />
                </View>
              </View>
              <Text style={styles.statValue}>{stats.totalAccesses}</Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>This Month</Text>
                <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="calendar" size={20} color="#DC2626" />
                </View>
              </View>
              <Text style={styles.statValue}>{stats.thisMonth}</Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Failed Attempts</Text>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="alert-circle" size={20} color="#D97706" />
                </View>
              </View>
              <Text style={styles.statValue}>{stats.failedAttempts}</Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>Locations</Text>
                <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="location" size={20} color="#9333EA" />
                </View>
              </View>
              <Text style={styles.statValue}>{stats.uniqueLocations}</Text>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={SEMANTIC.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search logs..."
              placeholderTextColor={SEMANTIC.text.tertiary}
              value={filters.search}
              onChangeText={handleSearch}
            />
          </View>

          <View style={styles.filterRow}>
            {/* Type Filter */}
            <Pressable
              style={styles.filterButton}
              onPress={() => {
                setShowTypeFilter(!showTypeFilter);
                setShowStatusFilter(false);
              }}
            >
              <Text style={styles.filterButtonText}>
                {TYPE_OPTIONS.find(o => o.value === filters.type)?.label || 'All Types'}
              </Text>
              <Ionicons
                name={showTypeFilter ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={SEMANTIC.text.secondary}
              />
            </Pressable>

            {/* Status Filter */}
            <Pressable
              style={styles.filterButton}
              onPress={() => {
                setShowStatusFilter(!showStatusFilter);
                setShowTypeFilter(false);
              }}
            >
              <Text style={styles.filterButtonText}>
                {STATUS_OPTIONS.find(o => o.value === filters.status)?.label || 'All Status'}
              </Text>
              <Ionicons
                name={showStatusFilter ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={SEMANTIC.text.secondary}
              />
            </Pressable>
          </View>

          {/* Type Filter Dropdown */}
          {showTypeFilter && (
            <View style={styles.dropdown}>
              {TYPE_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    filters.type === option.value && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleTypeFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      filters.type === option.value && styles.dropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.type === option.value && (
                    <Ionicons name="checkmark" size={16} color={PRIMARY[600]} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Status Filter Dropdown */}
          {showStatusFilter && (
            <View style={styles.dropdown}>
              {STATUS_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    filters.status === option.value && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleStatusFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      filters.status === option.value && styles.dropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.status === option.value && (
                    <Ionicons name="checkmark" size={16} color={PRIMARY[600]} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Access History Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Access History</Text>
          <Pressable style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={18} color={PRIMARY[600]} />
            <Text style={styles.exportButtonText}>Export Logs</Text>
          </Pressable>
        </View>

        {/* Logs List */}
        {data?.logs && data.logs.length > 0 ? (
          <View style={styles.logsList}>
            {data.logs.map(log => (
              <React.Fragment key={log.id}>
                {renderLogItem({ item: log })}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Card variant="outlined" padding="lg" style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={SEMANTIC.text.tertiary} />
            <Text style={styles.emptyTitle}>No audit logs found</Text>
            <Text style={styles.emptyText}>
              {filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Activity will appear here once you start using the app'}
            </Text>
          </Card>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <View style={styles.pagination}>
            <Pressable
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={page === 1 ? SEMANTIC.text.tertiary : PRIMARY[600]}
              />
            </Pressable>

            <Text style={styles.pageText}>
              Page {page} of {data.pagination.totalPages}
            </Text>

            <Pressable
              style={[
                styles.pageButton,
                page === data.pagination.totalPages && styles.pageButtonDisabled,
              ]}
              onPress={() => page < data.pagination.totalPages && setPage(page + 1)}
              disabled={page === data.pagination.totalPages}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  page === data.pagination.totalPages
                    ? SEMANTIC.text.tertiary
                    : PRIMARY[600]
                }
              />
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Toast {...toastConfig} onDismiss={hideToast} />
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
  appBar: {
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
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  headerInfo: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[2],
    marginBottom: spacing[6],
  },
  statCardWrapper: {
    width: '50%',
    padding: spacing[2],
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  statLabel: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  filtersSection: {
    marginBottom: spacing[6],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: 10,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[3],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    fontSize: 15,
    color: SEMANTIC.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: 10,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  filterButtonText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  dropdownItemActive: {
    backgroundColor: PRIMARY[50],
  },
  dropdownItemText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  dropdownItemTextActive: {
    color: PRIMARY[600],
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: PRIMARY[600],
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    color: PRIMARY[600],
    fontWeight: '500',
  },
  logsList: {
    gap: spacing[3],
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  logInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  logAction: {
    fontSize: 15,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  logActor: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  logDescription: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  logMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  ipAddress: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    fontFamily: 'monospace',
  },
  deviceText: {
    fontSize: 12,
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    gap: spacing[4],
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SEMANTIC.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
});

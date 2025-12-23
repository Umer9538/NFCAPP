/**
 * Incident Reports Screen
 * List all incident reports with filtering, search, and stats
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileWarning,
  MapPin,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react-native';
import { format } from 'date-fns';

import { useAuthStore } from '@/store/authStore';
import {
  getIncidentReports,
  getIncidentReportStats,
  type IncidentReport,
  type IncidentStatus,
  type IncidentSeverity,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  open: { label: 'Open', color: '#ef4444', bgColor: '#fef2f2', icon: AlertCircle },
  investigating: { label: 'Investigating', color: '#f59e0b', bgColor: '#fffbeb', icon: Clock },
  resolved: { label: 'Resolved', color: '#10b981', bgColor: '#ecfdf5', icon: CheckCircle2 },
  closed: { label: 'Closed', color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle },
};

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: '#10b981', bgColor: '#ecfdf5' },
  medium: { label: 'Medium', color: '#f59e0b', bgColor: '#fffbeb' },
  high: { label: 'High', color: '#ef4444', bgColor: '#fef2f2' },
  critical: { label: 'Critical', color: '#7c3aed', bgColor: '#f5f3ff' },
};

const STATUS_TABS: { key: IncidentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export default function IncidentReportsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const screenTitle = accountType === 'construction' ? 'Incident Logs' : 'Incident Reports';

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['incidentReportStats'],
    queryFn: getIncidentReportStats,
  });

  // Fetch reports
  const {
    data: reportsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['incidentReports', page, selectedStatus, searchQuery],
    queryFn: () =>
      getIncidentReports(page, 20, {
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery || undefined,
      }),
  });

  const reports = reportsData?.data || [];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateReport = () => {
    (navigation as any).navigate('CreateIncidentReport');
  };

  const handleViewReport = (report: IncidentReport) => {
    (navigation as any).navigate('IncidentReportDetails', { reportId: report.id });
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: IncidentStatus | 'all') => {
    setSelectedStatus(status);
    setPage(1);
  }, []);

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
        <AlertCircle size={20} color="#ef4444" />
        <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats?.open || 0}</Text>
        <Text style={styles.statLabel}>Open</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
        <Clock size={20} color="#f59e0b" />
        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats?.investigating || 0}</Text>
        <Text style={styles.statLabel}>Investigating</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
        <CheckCircle2 size={20} color="#10b981" />
        <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats?.resolved || 0}</Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#f3f4f6' }]}>
        <FileWarning size={20} color="#6b7280" />
        <Text style={[styles.statNumber, { color: '#6b7280' }]}>{stats?.total || 0}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchFilterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search incidents..."
          placeholderTextColor={GRAY[400]}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {STATUS_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              selectedStatus === tab.key && styles.tabActive,
            ]}
            onPress={() => handleStatusFilter(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderReportItem = ({ item }: { item: IncidentReport }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const severityConfig = SEVERITY_CONFIG[item.severity];
    const StatusIcon = statusConfig.icon;

    return (
      <Pressable
        style={styles.reportCard}
        onPress={() => handleViewReport(item)}
      >
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleRow}>
            <Text style={styles.reportTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <ChevronRight size={20} color={GRAY[400]} />
          </View>
          <View style={styles.badgesRow}>
            {/* Severity Badge */}
            <View style={[styles.badge, { backgroundColor: severityConfig.bgColor }]}>
              <Text style={[styles.badgeText, { color: severityConfig.color }]}>
                {severityConfig.label}
              </Text>
            </View>
            {/* Status Badge */}
            <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={12} color={statusConfig.color} />
              <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.reportMeta}>
          <View style={styles.metaItem}>
            <User size={14} color={GRAY[400]} />
            <Text style={styles.metaText}>{item.employeeName}</Text>
          </View>
          {item.location && (
            <View style={styles.metaItem}>
              <MapPin size={14} color={GRAY[400]} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Calendar size={14} color={GRAY[400]} />
            <Text style={styles.metaText}>
              {format(new Date(item.incidentDate), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        <View style={styles.reportFooter}>
          <Text style={styles.reportedBy}>
            Reported by {item.reportedByName}
          </Text>
          <Text style={styles.reportedDate}>
            {format(new Date(item.createdAt), 'MMM d, h:mm a')}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <AlertTriangle size={48} color={GRAY[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Incident Reports</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedStatus !== 'all'
          ? 'No reports match your search criteria. Try adjusting your filters.'
          : 'No incident reports have been filed yet. Create your first report to get started.'}
      </Text>
      {!searchQuery && selectedStatus === 'all' && (
        <Pressable style={styles.emptyButton} onPress={handleCreateReport}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Create Report</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Reports List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[PRIMARY[500]]}
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={handleCreateReport}>
        <Plus size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[2],
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    gap: spacing[1],
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: GRAY[600],
    fontWeight: '500',
  },
  searchFilterContainer: {
    backgroundColor: '#fff',
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: GRAY[100],
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  tabsScrollView: {
    marginTop: spacing[3],
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: GRAY[100],
  },
  tabActive: {
    backgroundColor: PRIMARY[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: GRAY[600],
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    marginBottom: spacing[2],
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  reportTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginRight: spacing[2],
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    color: GRAY[600],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  reportMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 13,
    color: GRAY[500],
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  reportedBy: {
    fontSize: 12,
    color: GRAY[500],
  },
  reportedDate: {
    fontSize: 12,
    color: GRAY[400],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingTop: spacing[12],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: 14,
    color: GRAY[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: PRIMARY[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: 14,
    color: GRAY[500],
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

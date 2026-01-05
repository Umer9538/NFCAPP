/**
 * OSHA Compliance Screen
 * Construction-specific screen for tracking OSHA compliance metrics
 * Shows compliance status, violations, and upcoming reviews
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Shield,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  AlertTriangle,
  ClipboardCheck,
  RefreshCcw,
} from 'lucide-react-native';
import { format, differenceInDays } from 'date-fns';

import {
  getOSHACompliance,
  createOSHAMetric,
  updateOSHAMetric,
  type OSHAComplianceMetric,
  type OSHAComplianceStatus,
  type CreateOSHAMetricRequest,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const STATUS_CONFIG: Record<OSHAComplianceStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  compliant: { label: 'Compliant', color: '#10b981', bgColor: '#ecfdf5', icon: CheckCircle2 },
  non_compliant: { label: 'Non-Compliant', color: '#ef4444', bgColor: '#fef2f2', icon: AlertCircle },
  pending: { label: 'Pending Review', color: '#f59e0b', bgColor: '#fffbeb', icon: Clock },
};

const STATUS_TABS: { key: OSHAComplianceStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'compliant', label: 'Compliant' },
  { key: 'non_compliant', label: 'Non-Compliant' },
  { key: 'pending', label: 'Pending' },
];

// Common OSHA compliance categories for construction
const OSHA_CATEGORIES = [
  'Fall Protection',
  'Scaffolding',
  'Ladder Safety',
  'Excavation/Trenching',
  'Electrical Safety',
  'Personal Protective Equipment',
  'Hazard Communication',
  'Machine Guarding',
  'Respiratory Protection',
  'Fire Prevention',
  'Crane Safety',
  'Confined Spaces',
  'Lockout/Tagout',
  'Silica Exposure',
  'Noise Exposure',
];

export default function OSHAComplianceScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OSHAComplianceStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch OSHA compliance data
  const {
    data: complianceData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['oshaCompliance'],
    queryFn: getOSHACompliance,
  });

  const metrics = complianceData?.metrics || [];
  const stats = complianceData?.stats;

  // Filter metrics based on search and status
  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch =
      metric.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (metric.notes && metric.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || metric.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Create metric mutation
  const createMutation = useMutation({
    mutationFn: createOSHAMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oshaCompliance'] });
      Alert.alert('Success', 'OSHA compliance metric added successfully');
      setShowAddModal(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to add metric');
    },
  });

  // Update metric mutation
  const updateMutation = useMutation({
    mutationFn: ({ metricId, data }: { metricId: string; data: Partial<CreateOSHAMetricRequest> }) =>
      updateOSHAMetric(metricId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oshaCompliance'] });
      Alert.alert('Success', 'Metric updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update metric');
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleStatusFilter = useCallback((status: OSHAComplianceStatus | 'all') => {
    setSelectedStatus(status);
  }, []);

  const handleViewDetails = (metric: OSHAComplianceMetric) => {
    Alert.alert(
      metric.category,
      `Status: ${STATUS_CONFIG[metric.status].label}\n\n` +
      `Last Review: ${format(new Date(metric.lastReview), 'MMM d, yyyy')}\n` +
      `Next Review: ${format(new Date(metric.nextReview), 'MMM d, yyyy')}\n` +
      `Violations: ${metric.violations}\n\n` +
      (metric.notes ? `Notes: ${metric.notes}` : ''),
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Mark Reviewed',
          onPress: () => handleMarkReviewed(metric),
        },
      ]
    );
  };

  const handleMarkReviewed = (metric: OSHAComplianceMetric) => {
    const today = new Date();
    const nextReview = new Date(today);
    nextReview.setMonth(nextReview.getMonth() + 3); // Set next review in 3 months

    updateMutation.mutate({
      metricId: metric.id,
      data: {
        lastReview: today.toISOString(),
        nextReview: nextReview.toISOString(),
        status: 'compliant',
      },
    });
  };

  const handleQuickAdd = (category: string) => {
    const today = new Date();
    const nextReview = new Date(today);
    nextReview.setMonth(nextReview.getMonth() + 3);

    createMutation.mutate({
      category,
      status: 'pending',
      lastReview: today.toISOString(),
      nextReview: nextReview.toISOString(),
      violations: 0,
      notes: '',
    });
  };

  const getDaysUntilReview = (nextReview: string) => {
    const days = differenceInDays(new Date(nextReview), new Date());
    if (days < 0) return { text: 'Overdue', urgent: true };
    if (days === 0) return { text: 'Today', urgent: true };
    if (days <= 7) return { text: `${days} days`, urgent: true };
    if (days <= 30) return { text: `${days} days`, urgent: false };
    return { text: format(new Date(nextReview), 'MMM d'), urgent: false };
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
        <CheckCircle2 size={20} color="#10b981" />
        <Text style={[styles.statNumber, { color: '#10b981' }]}>
          {stats?.compliant || 0}
        </Text>
        <Text style={styles.statLabel}>Compliant</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
        <AlertCircle size={20} color="#ef4444" />
        <Text style={[styles.statNumber, { color: '#ef4444' }]}>
          {stats?.nonCompliant || 0}
        </Text>
        <Text style={styles.statLabel}>Non-Compliant</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
        <Clock size={20} color="#f59e0b" />
        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
          {stats?.pending || 0}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
        <ClipboardCheck size={20} color="#3b82f6" />
        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
          {stats?.complianceRate || 0}%
        </Text>
        <Text style={styles.statLabel}>Rate</Text>
      </View>
    </View>
  );

  const renderUpcomingReviews = () => {
    if (!stats?.upcomingReviews || stats.upcomingReviews === 0) return null;

    return (
      <View style={styles.alertBanner}>
        <AlertTriangle size={18} color="#f59e0b" />
        <Text style={styles.alertText}>
          {stats.upcomingReviews} review{stats.upcomingReviews > 1 ? 's' : ''} due in the next 30 days
        </Text>
      </View>
    );
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchFilterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
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

  const renderMetricItem = ({ item }: { item: OSHAComplianceMetric }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const StatusIcon = statusConfig.icon;
    const reviewInfo = getDaysUntilReview(item.nextReview);

    return (
      <Pressable
        style={styles.metricCard}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.metricHeader}>
          <View style={styles.metricTitleRow}>
            <View style={[styles.categoryIcon, { backgroundColor: statusConfig.bgColor }]}>
              <Shield size={20} color={statusConfig.color} />
            </View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>{item.category}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <StatusIcon size={12} color={statusConfig.color} />
                <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={GRAY[400]} />
          </View>
        </View>

        <View style={styles.metricDetails}>
          <View style={styles.detailItem}>
            <Calendar size={14} color={GRAY[400]} />
            <Text style={styles.detailLabel}>Last Review:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(item.lastReview), 'MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <RefreshCcw size={14} color={reviewInfo.urgent ? '#f59e0b' : GRAY[400]} />
            <Text style={styles.detailLabel}>Next Review:</Text>
            <Text style={[
              styles.detailValue,
              reviewInfo.urgent && styles.detailValueUrgent
            ]}>
              {reviewInfo.text}
            </Text>
          </View>

          {item.violations > 0 && (
            <View style={styles.detailItem}>
              <AlertTriangle size={14} color="#ef4444" />
              <Text style={styles.detailLabel}>Violations:</Text>
              <Text style={[styles.detailValue, { color: '#ef4444' }]}>
                {item.violations}
              </Text>
            </View>
          )}
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <FileText size={14} color={GRAY[400]} />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Shield size={48} color={GRAY[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Compliance Records</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedStatus !== 'all'
          ? 'No records match your search criteria. Try adjusting your filters.'
          : 'Start tracking OSHA compliance by adding your first safety category.'}
      </Text>
      {!searchQuery && selectedStatus === 'all' && (
        <View style={styles.quickAddContainer}>
          <Text style={styles.quickAddTitle}>Quick Add Common Categories:</Text>
          <View style={styles.quickAddButtons}>
            {OSHA_CATEGORIES.slice(0, 6).map((category) => (
              <Pressable
                key={category}
                style={styles.quickAddButton}
                onPress={() => handleQuickAdd(category)}
              >
                <Plus size={14} color={PRIMARY[500]} />
                <Text style={styles.quickAddButtonText}>{category}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderAddCategorySheet = () => (
    <View style={styles.addSheet}>
      <Text style={styles.addSheetTitle}>Add OSHA Category</Text>
      <ScrollView style={styles.categoryList}>
        {OSHA_CATEGORIES.map((category) => {
          const exists = metrics.some((m) => m.category === category);
          return (
            <Pressable
              key={category}
              style={[styles.categoryItem, exists && styles.categoryItemDisabled]}
              onPress={() => !exists && handleQuickAdd(category)}
              disabled={exists}
            >
              <Shield size={18} color={exists ? GRAY[400] : PRIMARY[500]} />
              <Text style={[styles.categoryItemText, exists && styles.categoryItemTextDisabled]}>
                {category}
              </Text>
              {exists && (
                <CheckCircle2 size={16} color={GRAY[400]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>OSHA Compliance</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Upcoming Reviews Alert */}
      {renderUpcomingReviews()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Metrics List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading compliance data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMetrics}
          keyExtractor={(item) => item.id}
          renderItem={renderMetricItem}
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
      <Pressable
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Add OSHA Category',
            'Select a category to track:',
            [
              ...OSHA_CATEGORIES.slice(0, 5)
                .filter((cat) => !metrics.some((m) => m.category === cat))
                .map((category) => ({
                  text: category,
                  onPress: () => handleQuickAdd(category),
                })),
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      >
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  alertText: {
    fontSize: 14,
    color: '#92400e',
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
  metricCard: {
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
  metricHeader: {
    marginBottom: spacing[3],
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitleContainer: {
    flex: 1,
    gap: spacing[1],
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricDetails: {
    gap: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  detailLabel: {
    fontSize: 13,
    color: GRAY[500],
  },
  detailValue: {
    fontSize: 13,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
  detailValueUrgent: {
    color: '#f59e0b',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: GRAY[500],
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingTop: spacing[8],
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
  quickAddContainer: {
    width: '100%',
    alignItems: 'center',
  },
  quickAddTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[3],
  },
  quickAddButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY[200],
    backgroundColor: PRIMARY[50],
  },
  quickAddButtonText: {
    fontSize: 13,
    color: PRIMARY[600],
    fontWeight: '500',
  },
  addSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[4],
    maxHeight: '70%',
  },
  addSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: GRAY[100],
  },
  categoryItemDisabled: {
    opacity: 0.6,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  categoryItemTextDisabled: {
    color: GRAY[500],
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

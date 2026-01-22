/**
 * Training Records Screen
 * Construction-specific screen for tracking worker training and certifications
 * Shows training status, expiry dates, and compliance rates
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
  GraduationCap,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  ChevronRight,
  AlertTriangle,
  Award,
  FileCheck,
  Filter,
} from 'lucide-react-native';
import { format, differenceInDays, addMonths } from 'date-fns';

import {
  getTrainingRecords,
  createTrainingRecord,
  type TrainingRecord,
  type TrainingStatus,
  type CreateTrainingRecordRequest,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const STATUS_CONFIG: Record<TrainingStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  current: { label: 'Current', color: '#10b981', bgColor: '#ecfdf5', icon: CheckCircle2 },
  expired: { label: 'Expired', color: '#ef4444', bgColor: '#fef2f2', icon: AlertCircle },
  expiring_soon: { label: 'Expiring Soon', color: '#f59e0b', bgColor: '#fffbeb', icon: Clock },
};

const STATUS_TABS: { key: TrainingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'current', label: 'Current' },
  { key: 'expiring_soon', label: 'Expiring' },
  { key: 'expired', label: 'Expired' },
];

// Common training types for construction
const TRAINING_TYPES = [
  'OSHA 10-Hour',
  'OSHA 30-Hour',
  'Fall Protection',
  'Scaffold Safety',
  'Confined Space Entry',
  'First Aid/CPR',
  'Forklift Operator',
  'Crane Operator',
  'Excavation Safety',
  'Hazardous Materials',
  'Electrical Safety',
  'Ladder Safety',
  'PPE Training',
  'Fire Safety',
  'Silica Awareness',
];

export default function TrainingRecordsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TrainingStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  // Fetch training records
  const {
    data: recordsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['trainingRecords', page, selectedStatus, searchQuery],
    queryFn: () =>
      getTrainingRecords({
        page,
        pageSize: 20,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery || undefined,
      }),
  });

  const records = recordsData?.records || [];
  const stats = recordsData?.stats;

  // Create training record mutation
  const createMutation = useMutation({
    mutationFn: createTrainingRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords'] });
      Alert.alert('Record Added', 'Training record has been added successfully.');
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      let friendlyMessage = 'Unable to add training record. Please try again.';

      if (message.includes('not authorized') || message.includes('unauthorized') || message.includes('permission')) {
        friendlyMessage = "You don't have permission to add training records.";
      } else if (message.includes('network') || message.includes('connection')) {
        friendlyMessage = 'No internet connection. Please check your network and try again.';
      } else if (message.includes('duplicate') || message.includes('already exists')) {
        friendlyMessage = 'This training record already exists for this worker.';
      } else if (message.includes('worker not found')) {
        friendlyMessage = 'Worker not found. Please refresh and try again.';
      }

      Alert.alert('Unable to Add Record', friendlyMessage);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: TrainingStatus | 'all') => {
    setSelectedStatus(status);
    setPage(1);
  }, []);

  const handleViewDetails = (record: TrainingRecord) => {
    const daysUntilExpiry = record.expiryDate
      ? differenceInDays(new Date(record.expiryDate), new Date())
      : null;

    Alert.alert(
      record.trainingType,
      `Worker: ${record.workerName}\n\n` +
      `Completed: ${format(new Date(record.completedDate), 'MMM d, yyyy')}\n` +
      (record.expiryDate
        ? `Expires: ${format(new Date(record.expiryDate), 'MMM d, yyyy')}` +
          (daysUntilExpiry !== null ? ` (${daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'})` : '')
        : 'No Expiry') +
      (record.certificateNumber ? `\n\nCertificate #: ${record.certificateNumber}` : '') +
      (record.instructor ? `\nInstructor: ${record.instructor}` : ''),
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleAddTraining = () => {
    Alert.alert(
      'Add Training Record',
      'Select training type:',
      [
        ...TRAINING_TYPES.slice(0, 5).map((type) => ({
          text: type,
          onPress: () => promptWorkerSelection(type),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const promptWorkerSelection = (trainingType: string) => {
    // In a real app, this would show a worker picker
    // For now, we'll create a mock record
    const today = new Date();
    const expiryDate = addMonths(today, trainingType.includes('OSHA') ? 60 : 12);

    createMutation.mutate({
      workerId: 'mock-worker-id', // Would be selected from picker
      trainingType,
      completedDate: today.toISOString(),
      expiryDate: expiryDate.toISOString(),
    });
  };

  const getDaysUntilExpiry = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return { text: 'No Expiry', urgent: false };
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { text: 'Expired', urgent: true };
    if (days === 0) return { text: 'Expires Today', urgent: true };
    if (days <= 30) return { text: `${days} days left`, urgent: true };
    if (days <= 90) return { text: `${days} days left`, urgent: false };
    return { text: format(new Date(expiryDate), 'MMM d, yyyy'), urgent: false };
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
        <CheckCircle2 size={20} color="#10b981" />
        <Text style={[styles.statNumber, { color: '#10b981' }]}>
          {stats?.current || 0}
        </Text>
        <Text style={styles.statLabel}>Current</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
        <Clock size={20} color="#f59e0b" />
        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
          {stats?.expiringSoon || 0}
        </Text>
        <Text style={styles.statLabel}>Expiring</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
        <AlertCircle size={20} color="#ef4444" />
        <Text style={[styles.statNumber, { color: '#ef4444' }]}>
          {stats?.expired || 0}
        </Text>
        <Text style={styles.statLabel}>Expired</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
        <Award size={20} color="#3b82f6" />
        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
          {stats?.complianceRate || 0}%
        </Text>
        <Text style={styles.statLabel}>Compliant</Text>
      </View>
    </View>
  );

  const renderExpiringAlert = () => {
    const expiringSoonCount = stats?.expiringSoon || 0;
    const expiredCount = stats?.expired || 0;

    if (expiringSoonCount === 0 && expiredCount === 0) return null;

    return (
      <View style={[
        styles.alertBanner,
        expiredCount > 0 ? { backgroundColor: '#fef2f2', borderBottomColor: '#fecaca' } : {}
      ]}>
        <AlertTriangle size={18} color={expiredCount > 0 ? '#ef4444' : '#f59e0b'} />
        <Text style={[
          styles.alertText,
          expiredCount > 0 ? { color: '#991b1b' } : {}
        ]}>
          {expiredCount > 0
            ? `${expiredCount} expired training${expiredCount > 1 ? 's' : ''} need renewal`
            : `${expiringSoonCount} training${expiringSoonCount > 1 ? 's' : ''} expiring within 30 days`}
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
          placeholder="Search workers or training..."
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

  const renderRecordItem = ({ item }: { item: TrainingRecord }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const StatusIcon = statusConfig.icon;
    const expiryInfo = getDaysUntilExpiry(item.expiryDate);

    return (
      <Pressable
        style={styles.recordCard}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.recordHeader}>
          <View style={styles.recordTitleRow}>
            <View style={[styles.trainingIcon, { backgroundColor: statusConfig.bgColor }]}>
              <GraduationCap size={20} color={statusConfig.color} />
            </View>
            <View style={styles.recordTitleContainer}>
              <Text style={styles.recordTitle}>{item.trainingType}</Text>
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

        <View style={styles.recordDetails}>
          <View style={styles.detailItem}>
            <User size={14} color={GRAY[400]} />
            <Text style={styles.detailValue}>{item.workerName}</Text>
          </View>

          <View style={styles.detailItem}>
            <FileCheck size={14} color={GRAY[400]} />
            <Text style={styles.detailLabel}>Completed:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(item.completedDate), 'MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Calendar size={14} color={expiryInfo.urgent ? '#f59e0b' : GRAY[400]} />
            <Text style={styles.detailLabel}>Expires:</Text>
            <Text style={[
              styles.detailValue,
              expiryInfo.urgent && styles.detailValueUrgent
            ]}>
              {expiryInfo.text}
            </Text>
          </View>
        </View>

        {item.certificateNumber && (
          <View style={styles.certificateContainer}>
            <Award size={14} color={GRAY[400]} />
            <Text style={styles.certificateText}>
              Certificate #{item.certificateNumber}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <GraduationCap size={48} color={GRAY[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Training Records</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedStatus !== 'all'
          ? 'No records match your search criteria. Try adjusting your filters.'
          : 'Start tracking worker training by adding your first record.'}
      </Text>
      {!searchQuery && selectedStatus === 'all' && (
        <Pressable style={styles.emptyButton} onPress={handleAddTraining}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Training Record</Text>
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
        <Text style={styles.headerTitle}>Training Records</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Expiring Alert */}
      {renderExpiringAlert()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Records List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading training records...</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
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
      <Pressable style={styles.fab} onPress={handleAddTraining}>
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
  recordCard: {
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
  recordHeader: {
    marginBottom: spacing[3],
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  trainingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTitleContainer: {
    flex: 1,
    gap: spacing[1],
  },
  recordTitle: {
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
  recordDetails: {
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
  certificateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  certificateText: {
    fontSize: 13,
    color: GRAY[500],
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

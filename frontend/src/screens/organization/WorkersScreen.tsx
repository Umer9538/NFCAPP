/**
 * Workers Screen
 * List and manage construction workers with training status
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  HardHat,
  Plus,
  Search,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserPlus,
  Shield,
  BookOpen,
} from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui';
import { organizationsApi, type Worker } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Construction theme color (orange)
const CONSTRUCTION_PRIMARY = '#EA580C';

type FilterOption = 'all' | 'active' | 'training_due';

export default function WorkersScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Fetch workers
  const {
    data: workersData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['workers', searchQuery],
    queryFn: () => organizationsApi.getWorkers(1, 50, searchQuery || undefined),
  });

  const workers = workersData?.data || [];

  // Calculate stats
  const totalCount = workers.length;
  const activeCount = workers.filter((w) => w.status === 'active').length;
  const trainingDueCount = workers.filter(
    (w) => w.trainingStatus === 'expired' || w.trainingStatus === 'expiring_soon'
  ).length;

  // Filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      !searchQuery ||
      w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && w.status === 'active') ||
      (filter === 'training_due' &&
        (w.trainingStatus === 'expired' || w.trainingStatus === 'expiring_soon'));

    return matchesSearch && matchesFilter;
  });

  const handleAddWorker = () => {
    navigation.navigate('AddEmployee', { type: 'worker' });
  };

  const handleWorkerPress = (worker: Worker) => {
    navigation.navigate('EmployeeDetails', { employeeId: worker.id });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getTrainingBadge = (worker: Worker) => {
    switch (worker.trainingStatus) {
      case 'expired':
        return { label: 'Training Expired', color: STATUS.error.main, icon: AlertTriangle };
      case 'expiring_soon':
        return { label: 'Expiring Soon', color: STATUS.warning.main, icon: Clock };
      case 'current':
      default:
        return { label: 'Certified', color: STATUS.success.main, icon: CheckCircle };
    }
  };

  const renderWorker = useCallback(
    ({ item }: { item: Worker }) => {
      const training = getTrainingBadge(item);
      const TrainingIcon = training.icon;

      return (
        <Pressable
          onPress={() => handleWorkerPress(item)}
          style={({ pressed }) => [
            styles.workerCard,
            pressed && styles.workerCardPressed,
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
          </View>

          {/* Info */}
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{item.fullName}</Text>
            <Text style={styles.workerEmail}>{item.email}</Text>
            {item.role && (
              <View style={styles.roleContainer}>
                <HardHat size={12} color={GRAY[500]} />
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
            )}
          </View>

          {/* Training Status Badge */}
          <View style={styles.workerRight}>
            <View
              style={[
                styles.trainingBadge,
                { backgroundColor: `${training.color}15` },
              ]}
            >
              <TrainingIcon size={12} color={training.color} />
              <Text style={[styles.trainingText, { color: training.color }]}>
                {training.label}
              </Text>
            </View>
            <ChevronRight size={20} color={GRAY[400]} />
          </View>
        </Pressable>
      );
    },
    []
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${CONSTRUCTION_PRIMARY}15` }]}>
            <HardHat size={16} color={CONSTRUCTION_PRIMARY} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${STATUS.success.main}15` }]}>
            <CheckCircle size={16} color={STATUS.success.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${STATUS.warning.main}15` }]}>
            <AlertTriangle size={16} color={STATUS.warning.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{trainingDueCount}</Text>
            <Text style={styles.statLabel}>Training Due</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('OSHACompliance')}
          >
            <Shield size={20} color={CONSTRUCTION_PRIMARY} />
            <Text style={styles.quickActionText}>OSHA</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('TrainingRecords')}
          >
            <BookOpen size={20} color={CONSTRUCTION_PRIMARY} />
            <Text style={styles.quickActionText}>Training</Text>
          </Pressable>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All Workers
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Active
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'training_due' && styles.filterTabActive,
            filter === 'training_due' && { backgroundColor: `${STATUS.warning.main}15` },
          ]}
          onPress={() => setFilter('training_due')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'training_due' && { color: STATUS.warning.main },
            ]}
          >
            Training Due
          </Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workers..."
          placeholderTextColor={GRAY[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Results Count */}
      {(searchQuery || filter !== 'all') && (
        <Text style={styles.resultsCount}>
          {filteredWorkers.length} result{filteredWorkers.length !== 1 ? 's' : ''} found
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    if (searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Search size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search query
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <HardHat size={48} color={CONSTRUCTION_PRIMARY} />
        </View>
        <Text style={styles.emptyTitle}>No workers yet</Text>
        <Text style={styles.emptySubtitle}>
          Add workers to manage their safety profiles and training
        </Text>
        {isAdmin && (
          <Pressable style={styles.emptyButton} onPress={handleAddWorker}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add Worker</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workers</Text>
        {isAdmin && (
          <Pressable onPress={handleAddWorker} style={styles.headerAddButton}>
            <Plus size={24} color={CONSTRUCTION_PRIMARY} />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible />
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredWorkers.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={CONSTRUCTION_PRIMARY}
              colors={[CONSTRUCTION_PRIMARY]}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      {isAdmin && workers.length > 0 && (
        <Pressable style={styles.fab} onPress={handleAddWorker}>
          <UserPlus size={24} color="#fff" />
        </Pressable>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  headerAddButton: {
    padding: spacing[2],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing[24],
  },
  listContentEmpty: {
    flex: 1,
  },
  listHeader: {
    padding: spacing[4],
    gap: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: `${CONSTRUCTION_PRIMARY}30`,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: CONSTRUCTION_PRIMARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    paddingHorizontal: spacing[3],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    backgroundColor: GRAY[100],
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: `${CONSTRUCTION_PRIMARY}15`,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY[600],
  },
  filterTabTextActive: {
    color: CONSTRUCTION_PRIMARY,
  },
  resultsCount: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: -spacing[2],
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workerCardPressed: {
    backgroundColor: GRAY[50],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${CONSTRUCTION_PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: CONSTRUCTION_PRIMARY,
  },
  workerInfo: {
    flex: 1,
    gap: 2,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  workerEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    color: GRAY[500],
  },
  workerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  trainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
  trainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: spacing[3],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${CONSTRUCTION_PRIMARY}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: CONSTRUCTION_PRIMARY,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CONSTRUCTION_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

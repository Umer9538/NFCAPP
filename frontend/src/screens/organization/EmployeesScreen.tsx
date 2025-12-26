/**
 * Employees Screen
 * List and manage organization employees/workers/students
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
  Users,
  Plus,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  UserPlus,
  UserX,
} from 'lucide-react-native';

import { Card, Badge, LoadingSpinner } from '@/components/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { organizationsApi, type Employee } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

type FilterOption = 'all' | 'active' | 'suspended';

export default function EmployeesScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Fetch employees
  const {
    data: employeesData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['employees', searchQuery],
    queryFn: () => organizationsApi.getEmployees(1, 50, searchQuery || undefined),
  });

  const employees = employeesData?.data || [];

  // Calculate stats
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => !e.suspended).length;
  const suspendedCount = employees.filter((e) => e.suspended).length;

  // Filter employees locally for immediate search feedback and status filter
  const filteredEmployees = employees.filter((e) => {
    // Apply search filter
    const matchesSearch =
      !searchQuery ||
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !e.suspended) ||
      (filter === 'suspended' && e.suspended);

    return matchesSearch && matchesFilter;
  });

  const handleAddEmployee = () => {
    navigation.navigate('AddEmployee', {});
  };

  const handleEmployeePress = (employee: Employee) => {
    navigation.navigate('EmployeeDetails', { employeeId: employee.id });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (employee: Employee) => {
    // Suspended takes priority
    if (employee.suspended) {
      return { label: 'Suspended', color: STATUS.warning.main };
    }
    if (employee.status === 'pending') {
      return { label: 'Pending', color: GRAY[500] };
    }
    if (employee.profileComplete) {
      return { label: 'Complete', color: STATUS.success.main };
    }
    return { label: 'Incomplete', color: GRAY[500] };
  };

  const renderEmployee = useCallback(
    ({ item }: { item: Employee }) => {
      const status = getStatusBadge(item);

      return (
        <Pressable
          onPress={() => handleEmployeePress(item)}
          style={({ pressed }) => [
            styles.employeeCard,
            pressed && styles.employeeCardPressed,
          ]}
        >
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: `${dashboardConfig.themeColors.primary}15` },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: dashboardConfig.themeColors.primary },
              ]}
            >
              {getInitials(item.fullName)}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.fullName}</Text>
            <Text style={styles.employeeEmail}>{item.email}</Text>
            <Text style={styles.employeeJoined}>
              Joined {formatDate(item.joinedAt || item.createdAt)}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.employeeRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${status.color}15` },
              ]}
            >
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
            <ChevronRight size={20} color={GRAY[400]} />
          </View>
        </Pressable>
      );
    },
    [dashboardConfig]
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: `${PRIMARY[600]}15` }]}>
            <Users size={16} color={PRIMARY[600]} />
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
            <UserX size={16} color={STATUS.warning.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{suspendedCount}</Text>
            <Text style={styles.statLabel}>Suspended</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'active' && styles.filterTabActive,
          ]}
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
            filter === 'suspended' && styles.filterTabActive,
            filter === 'suspended' && { backgroundColor: `${STATUS.warning.main}15` },
          ]}
          onPress={() => setFilter('suspended')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'suspended' && { color: STATUS.warning.main },
            ]}
          >
            Suspended
          </Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${dashboardConfig.terminology.users.toLowerCase()}...`}
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
          {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''} found
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
        <View style={[styles.emptyIcon, { backgroundColor: `${PRIMARY[600]}10` }]}>
          <Users size={48} color={PRIMARY[600]} />
        </View>
        <Text style={styles.emptyTitle}>
          No {dashboardConfig.terminology.users.toLowerCase()} yet
        </Text>
        <Text style={styles.emptySubtitle}>
          Add {dashboardConfig.terminology.users.toLowerCase()} to manage their medical profiles
        </Text>
        <Pressable style={styles.emptyButton} onPress={handleAddEmployee}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>
            Add {dashboardConfig.terminology.user}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{dashboardConfig.terminology.users}</Text>
        <Pressable onPress={handleAddEmployee} style={styles.headerAddButton}>
          <Plus size={24} color={PRIMARY[600]} />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible />
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          renderItem={renderEmployee}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredEmployees.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={PRIMARY[600]}
              colors={[PRIMARY[600]]}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      {employees.length > 0 && (
        <Pressable
          style={[
            styles.fab,
            { backgroundColor: dashboardConfig.themeColors.primary },
          ]}
          onPress={handleAddEmployee}
        >
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
    backgroundColor: `${PRIMARY[600]}15`,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: GRAY[600],
  },
  filterTabTextActive: {
    color: PRIMARY[600],
  },
  resultsCount: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: -spacing[2],
  },
  employeeCard: {
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
  employeeCardPressed: {
    backgroundColor: GRAY[50],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  employeeInfo: {
    flex: 1,
    gap: 2,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  employeeEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  employeeJoined: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  employeeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
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
    backgroundColor: PRIMARY[600],
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
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

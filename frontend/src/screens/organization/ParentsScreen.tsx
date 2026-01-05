/**
 * Parents Screen
 * List and manage parents for education accounts (Admin only)
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
  Phone,
  Mail,
  Baby,
} from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Education theme color (green)
const EDUCATION_PRIMARY = '#16A34A';

type FilterOption = 'all' | 'active' | 'pending';

// Child info for parent
interface ChildInfo {
  id: string;
  name: string;
  grade: string;
}

// Parent interface
interface Parent {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  relationship: string; // mother, father, guardian
  children: ChildInfo[];
  isPrimaryContact: boolean;
  status: 'active' | 'pending' | 'inactive';
  profileComplete: boolean;
  createdAt: string;
}

export default function ParentsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Mock data for parents
  const mockParents: Parent[] = [
    {
      id: 'parent-1',
      fullName: 'Mary Parent',
      email: 'mary.parent@family.com',
      phoneNumber: '+1 (555) 777-8888',
      relationship: 'Mother',
      children: [
        { id: 'child-1', name: 'Tommy Parent', grade: '8' },
        { id: 'child-2', name: 'Lisa Parent', grade: '5' },
      ],
      isPrimaryContact: true,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'parent-2',
      fullName: 'Robert Johnson',
      email: 'robert.johnson@email.com',
      phoneNumber: '+1 (555) 222-3333',
      relationship: 'Father',
      children: [
        { id: 'student-1', name: 'Emma Johnson', grade: '10' },
      ],
      isPrimaryContact: true,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'parent-3',
      fullName: 'Susan Williams',
      email: 'susan.williams@email.com',
      phoneNumber: '+1 (555) 444-5555',
      relationship: 'Mother',
      children: [
        { id: 'student-2', name: 'James Williams', grade: '10' },
        { id: 'student-6', name: 'Anna Williams', grade: '7' },
      ],
      isPrimaryContact: true,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'parent-4',
      fullName: 'David Williams',
      email: 'david.williams@email.com',
      relationship: 'Father',
      children: [
        { id: 'student-2', name: 'James Williams', grade: '10' },
        { id: 'student-6', name: 'Anna Williams', grade: '7' },
      ],
      isPrimaryContact: false,
      status: 'active',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'parent-5',
      fullName: 'Jennifer Brown',
      email: 'jennifer.brown@email.com',
      phoneNumber: '+1 (555) 666-7777',
      relationship: 'Guardian',
      children: [
        { id: 'student-3', name: 'Sophia Brown', grade: '10' },
      ],
      isPrimaryContact: true,
      status: 'pending',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    },
  ];

  // Simulated query (would be replaced with real API call)
  const {
    data: parentsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['parents', searchQuery],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: mockParents };
    },
  });

  const parents = parentsData?.data || mockParents;

  // Calculate stats
  const totalCount = parents.length;
  const activeCount = parents.filter((p) => p.status === 'active').length;
  const pendingCount = parents.filter((p) => p.status === 'pending').length;
  const totalChildren = parents.reduce((sum, p) => sum + p.children.length, 0);
  const uniqueChildren = new Set(parents.flatMap((p) => p.children.map((c) => c.id))).size;

  // Filter parents
  const filteredParents = parents.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.children.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && p.status === 'active') ||
      (filter === 'pending' && p.status === 'pending');

    return matchesSearch && matchesFilter;
  });

  const handleAddParent = () => {
    navigation.navigate('AddEmployee', { type: 'employee' });
  };

  const handleParentPress = (parent: Parent) => {
    navigation.navigate('EmployeeDetails', { employeeId: parent.id });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (parent: Parent) => {
    if (parent.status === 'pending') {
      return { label: 'Pending', color: STATUS.warning.main, icon: Clock };
    }
    if (!parent.profileComplete) {
      return { label: 'Incomplete', color: STATUS.warning.main, icon: Clock };
    }
    return { label: 'Active', color: STATUS.success.main, icon: CheckCircle };
  };

  const renderParent = useCallback(
    ({ item }: { item: Parent }) => {
      const status = getStatusBadge(item);
      const StatusIcon = status.icon;

      return (
        <Pressable
          onPress={() => handleParentPress(item)}
          style={({ pressed }) => [
            styles.parentCard,
            pressed && styles.parentCardPressed,
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
          </View>

          {/* Info */}
          <View style={styles.parentInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.parentName}>{item.fullName}</Text>
              {item.isPrimaryContact && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <Text style={styles.parentEmail}>{item.email}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detailChip}>
                <Users size={10} color={GRAY[500]} />
                <Text style={styles.detailText}>{item.relationship}</Text>
              </View>
              <View style={styles.detailChip}>
                <Baby size={10} color={GRAY[500]} />
                <Text style={styles.detailText}>
                  {item.children.length} {item.children.length === 1 ? 'child' : 'children'}
                </Text>
              </View>
            </View>
            {/* Children names */}
            <Text style={styles.childrenNames} numberOfLines={1}>
              {item.children.map((c) => `${c.name} (Grade ${c.grade})`).join(', ')}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.parentRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${status.color}15` },
              ]}
            >
              <StatusIcon size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
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
          <View style={[styles.statIcon, { backgroundColor: `${EDUCATION_PRIMARY}15` }]}>
            <Users size={16} color={EDUCATION_PRIMARY} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Parents</Text>
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
          <View style={[styles.statIcon, { backgroundColor: `${STATUS.info.main}15` }]}>
            <Baby size={16} color={STATUS.info.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{uniqueChildren}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
        </View>
      </View>

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
            All Parents
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
            filter === 'pending' && styles.filterTabActive,
            filter === 'pending' && { backgroundColor: `${STATUS.warning.main}15` },
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'pending' && { color: STATUS.warning.main },
            ]}
          >
            Pending ({pendingCount})
          </Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parents by name, email or child..."
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
          {filteredParents.length} result{filteredParents.length !== 1 ? 's' : ''} found
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
          <Users size={48} color={EDUCATION_PRIMARY} />
        </View>
        <Text style={styles.emptyTitle}>No parents yet</Text>
        <Text style={styles.emptySubtitle}>
          Add parents to manage child relationships
        </Text>
        {isAdmin && (
          <Pressable style={styles.emptyButton} onPress={handleAddParent}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add Parent</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parents</Text>
        {isAdmin && (
          <Pressable onPress={handleAddParent} style={styles.headerAddButton}>
            <Plus size={24} color={EDUCATION_PRIMARY} />
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
          data={filteredParents}
          keyExtractor={(item) => item.id}
          renderItem={renderParent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredParents.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={EDUCATION_PRIMARY}
              colors={[EDUCATION_PRIMARY]}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      {isAdmin && parents.length > 0 && (
        <Pressable style={styles.fab} onPress={handleAddParent}>
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
    backgroundColor: `${EDUCATION_PRIMARY}15`,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY[600],
  },
  filterTabTextActive: {
    color: EDUCATION_PRIMARY,
  },
  resultsCount: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: -spacing[2],
  },
  parentCard: {
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
  parentCardPressed: {
    backgroundColor: GRAY[50],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${EDUCATION_PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: EDUCATION_PRIMARY,
  },
  parentInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  primaryBadge: {
    backgroundColor: `${EDUCATION_PRIMARY}15`,
    paddingHorizontal: spacing[2],
    paddingVertical: 1,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: EDUCATION_PRIMARY,
  },
  parentEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: 4,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GRAY[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  detailText: {
    fontSize: 11,
    color: GRAY[600],
  },
  childrenNames: {
    fontSize: 11,
    color: GRAY[500],
    marginTop: 2,
  },
  parentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 6,
  },
  statusText: {
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
    backgroundColor: `${EDUCATION_PRIMARY}10`,
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
    backgroundColor: EDUCATION_PRIMARY,
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
    backgroundColor: EDUCATION_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

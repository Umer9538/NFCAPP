/**
 * Teachers Screen
 * List and manage teachers for education accounts (Admin only)
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
  GraduationCap,
  Plus,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  UserPlus,
  Users,
  BookOpen,
} from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Education theme color (green)
const EDUCATION_PRIMARY = '#16A34A';

type FilterOption = 'all' | 'active' | 'pending';

// Teacher interface
interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  subjects?: string[];
  assignedStudents: number;
  status: 'active' | 'pending' | 'inactive';
  profileComplete: boolean;
  createdAt: string;
}

export default function TeachersScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Mock data for teachers
  const mockTeachers: Teacher[] = [
    {
      id: 'teacher-1',
      fullName: 'Jane Teacher',
      email: 'jane.teacher@school.edu',
      phoneNumber: '+1 (555) 111-2222',
      department: 'Science',
      subjects: ['Biology', 'Chemistry'],
      assignedStudents: 25,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher-2',
      fullName: 'John Smith',
      email: 'john.smith@school.edu',
      phoneNumber: '+1 (555) 333-4444',
      department: 'Mathematics',
      subjects: ['Algebra', 'Geometry', 'Calculus'],
      assignedStudents: 30,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher-3',
      fullName: 'Emily Davis',
      email: 'emily.davis@school.edu',
      phoneNumber: '+1 (555) 555-6666',
      department: 'English',
      subjects: ['Literature', 'Creative Writing'],
      assignedStudents: 22,
      status: 'active',
      profileComplete: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher-4',
      fullName: 'Michael Johnson',
      email: 'michael.johnson@school.edu',
      department: 'Physical Education',
      subjects: ['PE', 'Health'],
      assignedStudents: 45,
      status: 'active',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'teacher-5',
      fullName: 'Sarah Wilson',
      email: 'sarah.wilson@school.edu',
      department: 'History',
      subjects: ['World History', 'US History'],
      assignedStudents: 0,
      status: 'pending',
      profileComplete: false,
      createdAt: new Date().toISOString(),
    },
  ];

  // Simulated query (would be replaced with real API call)
  const {
    data: teachersData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['teachers', searchQuery],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { data: mockTeachers };
    },
  });

  const teachers = teachersData?.data || mockTeachers;

  // Calculate stats
  const totalCount = teachers.length;
  const activeCount = teachers.filter((t) => t.status === 'active').length;
  const pendingCount = teachers.filter((t) => t.status === 'pending').length;
  const totalStudents = teachers.reduce((sum, t) => sum + t.assignedStudents, 0);

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && t.status === 'active') ||
      (filter === 'pending' && t.status === 'pending');

    return matchesSearch && matchesFilter;
  });

  const handleAddTeacher = () => {
    navigation.navigate('AddEmployee', { type: 'employee' });
  };

  const handleTeacherPress = (teacher: Teacher) => {
    navigation.navigate('EmployeeDetails', { employeeId: teacher.id });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (teacher: Teacher) => {
    if (teacher.status === 'pending') {
      return { label: 'Pending', color: STATUS.warning.main, icon: Clock };
    }
    if (!teacher.profileComplete) {
      return { label: 'Incomplete', color: STATUS.warning.main, icon: Clock };
    }
    return { label: 'Active', color: STATUS.success.main, icon: CheckCircle };
  };

  const renderTeacher = useCallback(
    ({ item }: { item: Teacher }) => {
      const status = getStatusBadge(item);
      const StatusIcon = status.icon;

      return (
        <Pressable
          onPress={() => handleTeacherPress(item)}
          style={({ pressed }) => [
            styles.teacherCard,
            pressed && styles.teacherCardPressed,
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
          </View>

          {/* Info */}
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{item.fullName}</Text>
            <Text style={styles.teacherEmail}>{item.email}</Text>
            <View style={styles.detailsRow}>
              {item.department && (
                <View style={styles.detailChip}>
                  <BookOpen size={10} color={GRAY[500]} />
                  <Text style={styles.detailText}>{item.department}</Text>
                </View>
              )}
              <View style={styles.detailChip}>
                <Users size={10} color={GRAY[500]} />
                <Text style={styles.detailText}>{item.assignedStudents} students</Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.teacherRight}>
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
            <GraduationCap size={16} color={EDUCATION_PRIMARY} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
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
            <Users size={16} color={STATUS.info.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
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
            All Teachers
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
          placeholder="Search teachers by name, email or department..."
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
          {filteredTeachers.length} result{filteredTeachers.length !== 1 ? 's' : ''} found
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
          <GraduationCap size={48} color={EDUCATION_PRIMARY} />
        </View>
        <Text style={styles.emptyTitle}>No teachers yet</Text>
        <Text style={styles.emptySubtitle}>
          Add teachers to manage student assignments
        </Text>
        {isAdmin && (
          <Pressable style={styles.emptyButton} onPress={handleAddTeacher}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add Teacher</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teachers</Text>
        {isAdmin && (
          <Pressable onPress={handleAddTeacher} style={styles.headerAddButton}>
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
          data={filteredTeachers}
          keyExtractor={(item) => item.id}
          renderItem={renderTeacher}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredTeachers.length === 0 && styles.listContentEmpty,
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
      {isAdmin && teachers.length > 0 && (
        <Pressable style={styles.fab} onPress={handleAddTeacher}>
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
  teacherCard: {
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
  teacherCardPressed: {
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
  teacherInfo: {
    flex: 1,
    gap: 2,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  teacherEmail: {
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
  teacherRight: {
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

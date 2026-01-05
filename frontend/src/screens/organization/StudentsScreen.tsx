/**
 * Students Screen
 * List and manage students for education accounts
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
  Bell,
  BookOpen,
  Building2,
} from 'lucide-react-native';

import { LoadingSpinner } from '@/components/ui';
import { organizationsApi, type Student } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';
import { isAdmin as checkIsAdmin, isTeacher as checkIsTeacher, isParent as checkIsParent } from '@/config/dashboardConfig';

// Education theme color (green)
const EDUCATION_PRIMARY = '#16A34A';

type FilterOption = 'all' | 'active' | 'incomplete';

export default function StudentsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const userId = useAuthStore((state) => state.user?.id);

  // Role checks
  const isAdmin = checkIsAdmin(userRole);
  const isTeacher = checkIsTeacher(userRole);
  const isParent = checkIsParent(userRole);

  // Get title based on role
  const getTitle = () => {
    if (isTeacher) return 'My Students';
    if (isParent) return 'My Children';
    return 'Students';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('');

  // Fetch students with role-based filtering
  const {
    data: studentsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['students', searchQuery, gradeFilter, userRole, userId],
    queryFn: () =>
      organizationsApi.getStudents(1, 50, {
        search: searchQuery || undefined,
        grade: gradeFilter || undefined,
        // Teacher: assigned students only
        // Parent: own children only
        teacherId: isTeacher ? userId : undefined,
        parentId: isParent ? userId : undefined,
      }),
  });

  const students = studentsData?.data || [];

  // Mock data for development when API returns empty
  const mockStudents: Student[] = isTeacher
    ? [
        // Mock assigned students for teacher
        {
          id: 'student-1',
          email: 'emma.jones@school.edu',
          fullName: 'Emma Jones',
          status: 'active',
          profileComplete: true,
          grade: '10',
          className: 'Class 10-A',
          studentId: 'STU-001',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-2',
          email: 'james.smith@school.edu',
          fullName: 'James Smith',
          status: 'active',
          profileComplete: true,
          grade: '10',
          className: 'Class 10-A',
          studentId: 'STU-002',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-3',
          email: 'sophia.davis@school.edu',
          fullName: 'Sophia Davis',
          status: 'pending',
          profileComplete: false,
          grade: '10',
          className: 'Class 10-B',
          studentId: 'STU-003',
          createdAt: new Date().toISOString(),
        },
      ]
    : isParent
    ? [
        // Mock children for parent
        {
          id: 'child-1',
          email: 'tommy.parent@school.edu',
          fullName: 'Tommy Parent',
          status: 'active',
          profileComplete: true,
          grade: '8',
          className: 'Class 8-C',
          studentId: 'STU-010',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'child-2',
          email: 'lisa.parent@school.edu',
          fullName: 'Lisa Parent',
          status: 'active',
          profileComplete: true,
          grade: '5',
          className: 'Class 5-A',
          studentId: 'STU-011',
          createdAt: new Date().toISOString(),
        },
      ]
    : [
        // Mock students for admin
        {
          id: 'student-1',
          email: 'emma.jones@school.edu',
          fullName: 'Emma Jones',
          status: 'active',
          profileComplete: true,
          grade: '10',
          className: 'Class 10-A',
          studentId: 'STU-001',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-2',
          email: 'james.smith@school.edu',
          fullName: 'James Smith',
          status: 'active',
          profileComplete: true,
          grade: '10',
          className: 'Class 10-A',
          studentId: 'STU-002',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-3',
          email: 'sophia.davis@school.edu',
          fullName: 'Sophia Davis',
          status: 'pending',
          profileComplete: false,
          grade: '10',
          className: 'Class 10-B',
          studentId: 'STU-003',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-4',
          email: 'michael.wilson@school.edu',
          fullName: 'Michael Wilson',
          status: 'active',
          profileComplete: true,
          grade: '9',
          className: 'Class 9-A',
          studentId: 'STU-004',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-5',
          email: 'olivia.brown@school.edu',
          fullName: 'Olivia Brown',
          status: 'active',
          profileComplete: false,
          grade: '9',
          className: 'Class 9-B',
          studentId: 'STU-005',
          createdAt: new Date().toISOString(),
        },
      ];

  // Use mock data if API returns empty
  const displayStudents = students.length > 0 ? students : mockStudents;

  // Calculate stats
  const totalCount = displayStudents.length;
  const activeCount = displayStudents.filter((s) => s.status === 'active').length;
  const incompleteCount = displayStudents.filter((s) => !s.profileComplete).length;

  // Get unique grades for filter
  const grades = [...new Set(displayStudents.map((s) => s.grade).filter(Boolean))].sort();

  // Filter students
  const filteredStudents = displayStudents.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && s.status === 'active') ||
      (filter === 'incomplete' && !s.profileComplete);

    const matchesGrade = !gradeFilter || s.grade === gradeFilter;

    return matchesSearch && matchesFilter && matchesGrade;
  });

  const handleAddStudent = () => {
    navigation.navigate('AddEmployee', { type: 'student' });
  };

  const handleStudentPress = (student: Student) => {
    navigation.navigate('EmployeeDetails', { employeeId: student.id });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (student: Student) => {
    if (!student.profileComplete) {
      return { label: 'Incomplete', color: STATUS.warning.main, icon: Clock };
    }
    if (student.status === 'pending') {
      return { label: 'Pending', color: GRAY[500], icon: Clock };
    }
    return { label: 'Active', color: STATUS.success.main, icon: CheckCircle };
  };

  const renderStudent = useCallback(
    ({ item }: { item: Student }) => {
      const status = getStatusBadge(item);
      const StatusIcon = status.icon;

      return (
        <Pressable
          onPress={() => handleStudentPress(item)}
          style={({ pressed }) => [
            styles.studentCard,
            pressed && styles.studentCardPressed,
          ]}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
          </View>

          {/* Info */}
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.fullName}</Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
            <View style={styles.detailsRow}>
              {item.grade && (
                <View style={styles.detailChip}>
                  <BookOpen size={10} color={GRAY[500]} />
                  <Text style={styles.detailText}>Grade {item.grade}</Text>
                </View>
              )}
              {item.className && (
                <View style={styles.detailChip}>
                  <Building2 size={10} color={GRAY[500]} />
                  <Text style={styles.detailText}>{item.className}</Text>
                </View>
              )}
              {item.studentId && (
                <Text style={styles.studentId}>ID: {item.studentId}</Text>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.studentRight}>
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
            <Clock size={16} color={STATUS.warning.main} />
          </View>
          <View>
            <Text style={styles.statValue}>{incompleteCount}</Text>
            <Text style={styles.statLabel}>Incomplete</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('EmergencyNotifications')}
          >
            <Bell size={20} color={EDUCATION_PRIMARY} />
            <Text style={styles.quickActionText}>Send Alert</Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('MedicalRecords')}
          >
            <BookOpen size={20} color={EDUCATION_PRIMARY} />
            <Text style={styles.quickActionText}>Health Records</Text>
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
            {isParent ? 'All Children' : 'All Students'}
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
            filter === 'incomplete' && styles.filterTabActive,
            filter === 'incomplete' && { backgroundColor: `${STATUS.warning.main}15` },
          ]}
          onPress={() => setFilter('incomplete')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'incomplete' && { color: STATUS.warning.main },
            ]}
          >
            Incomplete
          </Text>
        </Pressable>
      </View>

      {/* Grade Filter */}
      {grades.length > 0 && (
        <View style={styles.gradeFilterRow}>
          <Pressable
            style={[
              styles.gradeChip,
              !gradeFilter && styles.gradeChipActive,
            ]}
            onPress={() => setGradeFilter('')}
          >
            <Text
              style={[
                styles.gradeChipText,
                !gradeFilter && styles.gradeChipTextActive,
              ]}
            >
              All Grades
            </Text>
          </Pressable>
          {grades.map((grade) => (
            <Pressable
              key={grade}
              style={[
                styles.gradeChip,
                gradeFilter === grade && styles.gradeChipActive,
              ]}
              onPress={() => setGradeFilter(grade || '')}
            >
              <Text
                style={[
                  styles.gradeChipText,
                  gradeFilter === grade && styles.gradeChipTextActive,
                ]}
              >
                Grade {grade}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={isParent ? 'Search children...' : 'Search students by name, email or ID...'}
          placeholderTextColor={GRAY[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Results Count */}
      {(searchQuery || filter !== 'all' || gradeFilter) && (
        <Text style={styles.resultsCount}>
          {filteredStudents.length} result{filteredStudents.length !== 1 ? 's' : ''} found
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

    // Role-appropriate empty state messages
    const getEmptyTitle = () => {
      if (isTeacher) return 'No assigned students';
      if (isParent) return 'No children found';
      return 'No students yet';
    };

    const getEmptySubtitle = () => {
      if (isTeacher) return 'Students assigned to you will appear here';
      if (isParent) return 'Your children will appear here once enrolled';
      return 'Add students to manage their health records';
    };

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <GraduationCap size={48} color={EDUCATION_PRIMARY} />
        </View>
        <Text style={styles.emptyTitle}>{getEmptyTitle()}</Text>
        <Text style={styles.emptySubtitle}>{getEmptySubtitle()}</Text>
        {isAdmin && (
          <Pressable style={styles.emptyButton} onPress={handleAddStudent}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add Student</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        {isAdmin && (
          <Pressable onPress={handleAddStudent} style={styles.headerAddButton}>
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
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredStudents.length === 0 && styles.listContentEmpty,
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

      {/* FAB - Admin only */}
      {isAdmin && displayStudents.length > 0 && (
        <Pressable style={styles.fab} onPress={handleAddStudent}>
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
    borderColor: `${EDUCATION_PRIMARY}30`,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: EDUCATION_PRIMARY,
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
  gradeFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  gradeChip: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 16,
    backgroundColor: GRAY[100],
  },
  gradeChipActive: {
    backgroundColor: `${EDUCATION_PRIMARY}15`,
  },
  gradeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY[600],
  },
  gradeChipTextActive: {
    color: EDUCATION_PRIMARY,
  },
  resultsCount: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: -spacing[2],
  },
  studentCard: {
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
  studentCardPressed: {
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
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  studentEmail: {
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
  studentId: {
    fontSize: 11,
    color: GRAY[500],
  },
  studentRight: {
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

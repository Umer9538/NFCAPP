/**
 * Parents Screen
 * List and manage parents for education accounts (Admin only)
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  SafeAreaView,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  UserPlus,
  X,
  Baby,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native';

import { LoadingSpinner, Toast, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/client';
import { SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Education theme color (green)
const EDUCATION_PRIMARY = '#16A34A';

type FilterOption = 'all' | 'active' | 'pending';

// Child info for parent
interface ChildInfo {
  childId: string;
  childName: string;
  grade?: string;
  className?: string;
  relationship: string;
  isPrimary: boolean;
}

// Parent interface from API
interface Parent {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileComplete: boolean;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
  children: ChildInfo[];
}

// Student for dropdown
interface Student {
  id: string;
  fullName: string;
  grade?: string;
  className?: string;
}

// API Response
interface ParentsResponse {
  success: boolean;
  parents: Parent[];
  isAdmin: boolean;
  userRole: string;
}

interface StudentsResponse {
  success: boolean;
  students: Student[];
}

export default function ParentsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const userRole = useAuthStore((state) => state.user?.role);
  const isAdmin = userRole === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Add Parent Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    relationship: 'Parent',
    childIds: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch parents from API
  const {
    data: parentsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const response = await api.get<ParentsResponse>('/api/organizations/parents');
      return response;
    },
  });

  // Fetch students for child selection dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['students-for-parents'],
    queryFn: async () => {
      const response = await api.get<StudentsResponse>('/api/organizations/students');
      return response;
    },
    enabled: showAddModal, // Only fetch when modal is open
  });

  const parents = parentsData?.parents || [];
  const students = studentsData?.students || [];

  // Add parent mutation
  const addParentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await api.post('/api/organizations/parents', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      success('Parent added successfully. Invitation email sent.');
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      showError(error?.message || 'Unable to add parent. Please try again.');
    },
  });

  // Calculate stats
  const totalCount = parents.length;
  const activeCount = parents.filter((p) => p.emailVerified && p.profileComplete).length;
  const pendingCount = parents.filter((p) => !p.emailVerified || !p.profileComplete).length;
  const uniqueChildren = new Set(parents.flatMap((p) => p.children.map((c) => c.childId))).size;

  // Filter parents
  const filteredParents = parents.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.children.some((c) => c.childName.toLowerCase().includes(searchQuery.toLowerCase()));

    const isActive = p.emailVerified && p.profileComplete && !p.suspended;
    const isPending = !p.emailVerified || !p.profileComplete;

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && isActive) ||
      (filter === 'pending' && isPending);

    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      relationship: 'Parent',
      childIds: [],
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddParent = () => {
    if (!validateForm()) return;
    addParentMutation.mutate(formData);
  };

  const handleParentPress = (parent: Parent) => {
    navigation.navigate('EmployeeDetails', { employeeId: parent.id });
  };

  const toggleChildSelection = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      childIds: prev.childIds.includes(studentId)
        ? prev.childIds.filter((id) => id !== studentId)
        : [...prev.childIds, studentId],
    }));
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (parent: Parent) => {
    if (parent.suspended) {
      return { label: 'Suspended', color: STATUS.error.main, icon: AlertCircle };
    }
    if (!parent.emailVerified) {
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
      const isPrimaryContact = item.children.some((c) => c.isPrimary);

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
              {isPrimaryContact && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}
            </View>
            <Text style={styles.parentEmail}>{item.email}</Text>
            <View style={styles.detailsRow}>
              {item.children.length > 0 && item.children[0].relationship && (
                <View style={styles.detailChip}>
                  <Users size={10} color={GRAY[500]} />
                  <Text style={styles.detailText}>{item.children[0].relationship}</Text>
                </View>
              )}
              <View style={styles.detailChip}>
                <Baby size={10} color={GRAY[500]} />
                <Text style={styles.detailText}>
                  {item.children.length} {item.children.length === 1 ? 'child' : 'children'}
                </Text>
              </View>
            </View>
            {/* Children names */}
            {item.children.length > 0 && (
              <Text style={styles.childrenNames} numberOfLines={1}>
                {item.children.map((c) => `${c.childName}${c.grade ? ` (Grade ${c.grade})` : ''}`).join(', ')}
              </Text>
            )}
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
          <Pressable style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Add Parent</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Add Parent Modal
  const renderAddParentModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowAddModal(false)} style={styles.modalCloseButton}>
              <X size={24} color={GRAY[600]} />
            </Pressable>
            <Text style={styles.modalTitle}>Add Parent</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.input, formErrors.fullName && styles.inputError]}
                placeholder="Enter parent's full name"
                placeholderTextColor={GRAY[400]}
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, fullName: text }));
                  if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                autoCapitalize="words"
              />
              {formErrors.fullName && (
                <Text style={styles.errorText}>{formErrors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Enter email address"
                placeholderTextColor={GRAY[400]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, email: text }));
                  if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={GRAY[400]}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Relationship */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <View style={styles.relationshipOptions}>
                {['Parent', 'Mother', 'Father', 'Guardian'].map((rel) => (
                  <Pressable
                    key={rel}
                    style={[
                      styles.relationshipOption,
                      formData.relationship === rel && styles.relationshipOptionActive,
                    ]}
                    onPress={() => setFormData((prev) => ({ ...prev, relationship: rel }))}
                  >
                    <Text
                      style={[
                        styles.relationshipOptionText,
                        formData.relationship === rel && styles.relationshipOptionTextActive,
                      ]}
                    >
                      {rel}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Link Children */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Link to Children (Optional)</Text>
              <Text style={styles.inputHint}>
                Select students to link to this parent
              </Text>
              {students.length > 0 ? (
                <View style={styles.childrenList}>
                  {students.map((student) => (
                    <Pressable
                      key={student.id}
                      style={[
                        styles.childOption,
                        formData.childIds.includes(student.id) && styles.childOptionActive,
                      ]}
                      onPress={() => toggleChildSelection(student.id)}
                    >
                      <View style={styles.childCheckbox}>
                        {formData.childIds.includes(student.id) && (
                          <CheckCircle size={16} color={EDUCATION_PRIMARY} />
                        )}
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{student.fullName}</Text>
                        {(student.grade || student.className) && (
                          <Text style={styles.childGrade}>
                            {student.grade && `Grade ${student.grade}`}
                            {student.grade && student.className && ' - '}
                            {student.className}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.noStudentsText}>
                  No students found. You can link children later.
                </Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <AlertCircle size={16} color={STATUS.info.main} />
              <Text style={styles.infoText}>
                An invitation email will be sent to the parent to complete their profile setup.
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.submitButton,
                addParentMutation.isPending && styles.submitButtonDisabled,
              ]}
              onPress={handleAddParent}
              disabled={addParentMutation.isPending}
            >
              {addParentMutation.isPending ? (
                <LoadingSpinner visible size="small" />
              ) : (
                <>
                  <UserPlus size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Add Parent</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Parents</Text>
        {isAdmin ? (
          <Pressable onPress={() => setShowAddModal(true)} style={styles.headerAddButton}>
            <Plus size={24} color={EDUCATION_PRIMARY} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
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
        <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
          <UserPlus size={24} color="#fff" />
        </Pressable>
      )}

      {/* Add Parent Modal */}
      {renderAddParentModal()}

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  headerAddButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  modalCloseButton: {
    padding: spacing[2],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[5],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  inputHint: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginBottom: spacing[2],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 10,
    paddingHorizontal: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: STATUS.error.main,
  },
  errorText: {
    fontSize: 12,
    color: STATUS.error.main,
    marginTop: spacing[1],
  },
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  relationshipOption: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#fff',
  },
  relationshipOptionActive: {
    borderColor: EDUCATION_PRIMARY,
    backgroundColor: `${EDUCATION_PRIMARY}10`,
  },
  relationshipOptionText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  relationshipOptionTextActive: {
    color: EDUCATION_PRIMARY,
    fontWeight: '600',
  },
  childrenList: {
    gap: spacing[2],
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#fff',
  },
  childOptionActive: {
    borderColor: EDUCATION_PRIMARY,
    backgroundColor: `${EDUCATION_PRIMARY}05`,
  },
  childCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  childGrade: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  noStudentsText: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
    paddingVertical: spacing[3],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: `${STATUS.info.main}10`,
    padding: spacing[3],
    borderRadius: 10,
    marginBottom: spacing[4],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: STATUS.info.main,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  submitButton: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: 10,
    backgroundColor: EDUCATION_PRIMARY,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

/**
 * Organization Medical Info Screen
 * View all employee medical data with expandable cards
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  SafeAreaView,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Search,
  Users,
  AlertTriangle,
  Pill,
  Heart,
  ChevronDown,
  ChevronUp,
  Droplet,
  Phone,
  Clock,
  FileWarning,
} from 'lucide-react-native';

import { Card, LoadingSpinner } from '@/components/ui';
import { organizationsApi, type EmployeeMedicalInfo, type AllergyInfo, type MedicationInfo, type ConditionInfo } from '@/api/organizations';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Severity colors
const SEVERITY_COLORS = {
  mild: { bg: '#fef9c3', text: '#854d0e' },
  moderate: { bg: '#fed7aa', text: '#9a3412' },
  severe: { bg: '#fecaca', text: '#991b1b' },
};

export default function OrganizationMedicalInfoScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch medical info
  const {
    data: medicalData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['organizationMedicalInfo', searchQuery],
    queryFn: () => organizationsApi.getMedicalInfo(1, 100, searchQuery || undefined),
  });

  const medicalInfoList = medicalData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = medicalInfoList.length;
    const withAllergies = medicalInfoList.filter((e) => e.allergies.length > 0).length;
    const withMedications = medicalInfoList.filter((e) => e.medications.length > 0).length;
    const withConditions = medicalInfoList.filter((e) => e.conditions.length > 0).length;

    return { total, withAllergies, withMedications, withConditions };
  }, [medicalInfoList]);

  // Filter list locally for immediate search feedback
  const filteredList = searchQuery
    ? medicalInfoList.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : medicalInfoList;

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSeverityBadge = (severity: 'mild' | 'moderate' | 'severe') => {
    const colors = SEVERITY_COLORS[severity];
    return (
      <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.severityText, { color: colors.text }]}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Text>
      </View>
    );
  };

  const renderStatsRow = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statsContainer}
    >
      {/* Total Profiles */}
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${PRIMARY[600]}15` }]}>
          <Users size={20} color={PRIMARY[600]} />
        </View>
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Profiles</Text>
      </View>

      {/* With Allergies */}
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${STATUS.error.main}15` }]}>
          <AlertTriangle size={20} color={STATUS.error.main} />
        </View>
        <Text style={styles.statValue}>{stats.withAllergies}</Text>
        <Text style={styles.statLabel}>With Allergies</Text>
      </View>

      {/* With Medications */}
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${PRIMARY[600]}15` }]}>
          <Pill size={20} color={PRIMARY[600]} />
        </View>
        <Text style={styles.statValue}>{stats.withMedications}</Text>
        <Text style={styles.statLabel}>On Medication</Text>
      </View>

      {/* With Conditions */}
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${STATUS.warning.main}15` }]}>
          <Heart size={20} color={STATUS.warning.main} />
        </View>
        <Text style={styles.statValue}>{stats.withConditions}</Text>
        <Text style={styles.statLabel}>With Conditions</Text>
      </View>
    </ScrollView>
  );

  const renderAllergiesSection = (allergies: AllergyInfo[]) => {
    if (allergies.length === 0) {
      return (
        <Text style={styles.emptySection}>No known allergies</Text>
      );
    }

    return (
      <View style={styles.sectionContent}>
        {allergies.map((allergy) => (
          <View key={allergy.id} style={styles.allergyItem}>
            <View style={styles.allergyHeader}>
              <Text style={styles.allergyName}>{allergy.name}</Text>
              {getSeverityBadge(allergy.severity)}
            </View>
            {allergy.reaction && (
              <Text style={styles.allergyReaction}>Reaction: {allergy.reaction}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderMedicationsSection = (medications: MedicationInfo[]) => {
    if (medications.length === 0) {
      return (
        <Text style={styles.emptySection}>No current medications</Text>
      );
    }

    return (
      <View style={styles.sectionContent}>
        {medications.map((med) => (
          <View key={med.id} style={styles.medicationItem}>
            <Text style={styles.medicationName}>{med.name}</Text>
            <View style={styles.medicationDetails}>
              {med.dosage && (
                <Text style={styles.medicationDetail}>{med.dosage}</Text>
              )}
              {med.frequency && (
                <Text style={styles.medicationDetail}>{med.frequency}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderConditionsSection = (conditions: ConditionInfo[]) => {
    if (conditions.length === 0) {
      return (
        <Text style={styles.emptySection}>No known conditions</Text>
      );
    }

    return (
      <View style={styles.conditionsContainer}>
        {conditions.map((condition) => (
          <View
            key={condition.id}
            style={[
              styles.conditionChip,
              { backgroundColor: `${STATUS.warning.main}15` },
            ]}
          >
            <Text style={[styles.conditionText, { color: STATUS.warning.main }]}>
              {condition.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMedicalCard = useCallback(
    ({ item }: { item: EmployeeMedicalInfo }) => {
      const isExpanded = expandedId === item.userId;
      const totalItems =
        item.allergies.length + item.medications.length + item.conditions.length;

      return (
        <Pressable
          onPress={() => toggleExpand(item.userId)}
          style={styles.cardContainer}
        >
          <Card variant="elevated" padding="md">
            {/* Collapsed Header */}
            <View style={styles.cardHeader}>
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
                  {getInitials(item.employeeName)}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.employeeName}>{item.employeeName}</Text>
                  {item.bloodType && (
                    <View style={styles.bloodTypeBadge}>
                      <Droplet size={12} color={STATUS.error.main} />
                      <Text style={styles.bloodTypeText}>{item.bloodType}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.employeeEmail}>{item.email}</Text>
                <Text style={styles.quickStats}>
                  {item.allergies.length} allergies, {item.medications.length} meds, {item.conditions.length} conditions
                </Text>
              </View>

              {/* Expand Icon */}
              <View style={styles.expandIcon}>
                {isExpanded ? (
                  <ChevronUp size={24} color={GRAY[400]} />
                ) : (
                  <ChevronDown size={24} color={GRAY[400]} />
                )}
              </View>
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                {/* Allergies Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <AlertTriangle size={18} color={STATUS.error.main} />
                    <Text style={[styles.sectionTitle, { color: STATUS.error.main }]}>
                      Allergies
                    </Text>
                  </View>
                  {renderAllergiesSection(item.allergies)}
                </View>

                {/* Medications Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Pill size={18} color={PRIMARY[600]} />
                    <Text style={[styles.sectionTitle, { color: PRIMARY[600] }]}>
                      Medications
                    </Text>
                  </View>
                  {renderMedicationsSection(item.medications)}
                </View>

                {/* Conditions Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Heart size={18} color={STATUS.warning.main} />
                    <Text style={[styles.sectionTitle, { color: STATUS.warning.main }]}>
                      Medical Conditions
                    </Text>
                  </View>
                  {renderConditionsSection(item.conditions)}
                </View>

                {/* Footer Info */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Phone size={14} color={SEMANTIC.text.tertiary} />
                    <Text style={styles.footerText}>
                      {item.emergencyContactsCount} emergency contact{item.emergencyContactsCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Clock size={14} color={SEMANTIC.text.tertiary} />
                    <Text style={styles.footerText}>
                      Updated {formatDate(item.lastUpdated)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </Pressable>
      );
    },
    [expandedId, dashboardConfig, toggleExpand]
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats Row */}
      {renderStatsRow()}

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
      {searchQuery && (
        <Text style={styles.resultsCount}>
          {filteredList.length} result{filteredList.length !== 1 ? 's' : ''} found
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
          <FileWarning size={48} color={PRIMARY[600]} />
        </View>
        <Text style={styles.emptyTitle}>No medical information yet</Text>
        <Text style={styles.emptySubtitle}>
          {dashboardConfig.terminology.users} will appear here once they complete their medical profiles
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Medical Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.userId}
          renderItem={renderMedicalCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredList.length === 0 && styles.listContentEmpty,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing[8],
  },
  listContentEmpty: {
    flex: 1,
  },
  listHeader: {
    paddingTop: spacing[4],
    gap: spacing[4],
  },
  // Stats Row
  statsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    paddingHorizontal: spacing[3],
    marginHorizontal: spacing[4],
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
  resultsCount: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginHorizontal: spacing[4],
    marginTop: -spacing[2],
  },
  // Card
  cardContainer: {
    marginHorizontal: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  bloodTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${STATUS.error.main}10`,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  bloodTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: STATUS.error.main,
  },
  employeeEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  quickStats: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  expandIcon: {
    padding: spacing[2],
  },
  // Expanded Content
  expandedContent: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContent: {
    gap: spacing[2],
  },
  emptySection: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
  },
  // Allergy
  allergyItem: {
    backgroundColor: GRAY[50],
    borderRadius: 8,
    padding: spacing[3],
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allergyName: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  allergyReaction: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  severityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Medication
  medicationItem: {
    backgroundColor: GRAY[50],
    borderRadius: 8,
    padding: spacing[3],
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  medicationDetails: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  medicationDetail: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  // Conditions
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  conditionChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  footerText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  // Separator
  separator: {
    height: spacing[3],
  },
  // Empty State
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
  },
});

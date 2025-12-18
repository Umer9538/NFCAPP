/**
 * Allergies Screen
 * List and manage user allergies
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';

import { Card, LoadingSpinner, Toast, useToast } from '@/components/ui';
import { profileApi } from '@/api/profile';
import type { Allergy } from '@/types/profile';
import type { AllergySeverity } from '@/constants';
import { SEMANTIC, STATUS, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Severity colors per design specs
const SEVERITY_COLORS: Record<AllergySeverity, { bg: string; text: string }> = {
  mild: { bg: '#fef9c3', text: '#854d0e' },       // Yellow
  moderate: { bg: '#fed7aa', text: '#9a3412' },   // Orange
  severe: { bg: '#fecaca', text: '#991b1b' },     // Red
};

const SEVERITY_BADGE_COLORS: Record<AllergySeverity, string> = {
  mild: '#fbbf24',
  moderate: '#f97316',
  severe: '#ef4444',
};

export default function AllergiesScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Fetch profile with allergies
  const {
    data: profile,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });

  const allergies = profile?.allergies || [];

  // Delete allergy mutation
  const deleteAllergyMutation = useMutation({
    mutationFn: (allergyId: string) => profileApi.removeAllergy(allergyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      success('Allergy removed successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to remove allergy');
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddAllergy = () => {
    navigation.navigate('AddAllergy', {});
  };

  const handleDeleteAllergy = useCallback((allergy: Allergy) => {
    Alert.alert(
      'Remove Allergy',
      `Are you sure you want to remove "${allergy.allergen}" from your allergies?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteAllergyMutation.mutate(allergy.id),
        },
      ]
    );
  }, [deleteAllergyMutation]);

  const getSeverityBadge = (severity: AllergySeverity) => {
    const colors = SEVERITY_COLORS[severity];
    return (
      <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.severityDot,
            { backgroundColor: SEVERITY_BADGE_COLORS[severity] },
          ]}
        />
        <Text style={[styles.severityText, { color: colors.text }]}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Text>
      </View>
    );
  };

  const renderAllergyItem = useCallback(
    ({ item }: { item: Allergy }) => (
      <Card variant="elevated" padding="md" style={styles.allergyCard}>
        <View style={styles.allergyContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <AlertTriangle size={24} color={SEVERITY_BADGE_COLORS[item.severity]} />
          </View>

          {/* Info */}
          <View style={styles.allergyInfo}>
            <View style={styles.allergyHeader}>
              <Text style={styles.allergenName}>{item.allergen}</Text>
              {getSeverityBadge(item.severity)}
            </View>
            <Text style={styles.reactionText} numberOfLines={2}>
              {item.reaction}
            </Text>
          </View>

          {/* Actions */}
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteAllergy(item)}
          >
            <Trash2 size={20} color={STATUS.error.main} />
          </Pressable>
        </View>
      </Card>
    ),
    [handleDeleteAllergy]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: `${STATUS.warning.main}10` }]}>
          <AlertTriangle size={48} color={STATUS.warning.main} />
        </View>
        <Text style={styles.emptyTitle}>No Allergies Listed</Text>
        <Text style={styles.emptySubtitle}>
          Add your allergies so emergency responders can provide safe treatment
        </Text>
        <Pressable style={styles.emptyButton} onPress={handleAddAllergy}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Allergy</Text>
        </Pressable>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <AlertTriangle size={20} color={STATUS.error.main} />
        <Text style={styles.infoBannerText}>
          Allergy information is critical for emergency medical care
        </Text>
      </View>

      {/* Stats */}
      {allergies.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allergies.length}</Text>
            <Text style={styles.statLabel}>Total Allergies</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: SEVERITY_BADGE_COLORS.severe }]}>
              {allergies.filter((a) => a.severity === 'severe').length}
            </Text>
            <Text style={styles.statLabel}>Severe</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: SEVERITY_BADGE_COLORS.moderate }]}>
              {allergies.filter((a) => a.severity === 'moderate').length}
            </Text>
            <Text style={styles.statLabel}>Moderate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: SEVERITY_BADGE_COLORS.mild }]}>
              {allergies.filter((a) => a.severity === 'mild').length}
            </Text>
            <Text style={styles.statLabel}>Mild</Text>
          </View>
        </View>
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
        <Text style={styles.headerTitle}>Allergies</Text>
        <Pressable onPress={handleAddAllergy} style={styles.addButton}>
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
          data={allergies}
          keyExtractor={(item) => item.id}
          renderItem={renderAllergyItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            allergies.length === 0 && styles.listContentEmpty,
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

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />

      {/* Loading Overlay for delete */}
      {deleteAllergyMutation.isPending && <LoadingSpinner visible overlay />}
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
  addButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
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
    padding: spacing[4],
    gap: spacing[4],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: STATUS.error.main,
    lineHeight: 20,
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
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  allergyCard: {
    marginHorizontal: spacing[4],
  },
  allergyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  allergyInfo: {
    flex: 1,
    gap: spacing[2],
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  allergenName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reactionText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  deleteButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
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
    lineHeight: 20,
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
});

/**
 * Medications Screen
 * List and manage user medications
 */

import React, { useCallback } from 'react';
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
  Pill,
  Plus,
  Trash2,
  Clock,
  User,
} from 'lucide-react-native';

import { Card, LoadingSpinner, Toast, useToast } from '@/components/ui';
import { profileApi } from '@/api/profile';
import type { Medication } from '@/types/profile';
import { SEMANTIC, STATUS, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

export default function MedicationsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Fetch profile with medications
  const {
    data: profile,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });

  const medications = profile?.medications || [];

  // Delete medication mutation
  const deleteMedicationMutation = useMutation({
    mutationFn: (medicationId: string) => profileApi.removeMedication(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      success('Removed from your profile.');
    },
    onError: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      if (message.includes('network') || message.includes('connection')) {
        showError('Unable to connect. Please check your internet.');
      } else if (message.includes('not found')) {
        showError('This medication was not found in your profile.');
      } else {
        showError('Unable to remove medication. Please try again.');
      }
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddMedication = () => {
    navigation.navigate('AddMedication', {});
  };

  const handleDeleteMedication = useCallback((medication: Medication) => {
    Alert.alert(
      'Remove Medication',
      `Are you sure you want to remove "${medication.name}" from your medications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMedicationMutation.mutate(medication.id),
        },
      ]
    );
  }, [deleteMedicationMutation]);

  const renderMedicationItem = useCallback(
    ({ item }: { item: Medication }) => (
      <Card variant="elevated" padding="md" style={styles.medicationCard}>
        <View style={styles.medicationContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Pill size={24} color={PRIMARY[600]} />
          </View>

          {/* Info */}
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{item.name}</Text>

            {/* Dosage */}
            <View style={styles.detailRow}>
              <Text style={styles.dosageText}>{item.dosage}</Text>
            </View>

            {/* Frequency */}
            <View style={styles.detailRow}>
              <Clock size={14} color={SEMANTIC.text.tertiary} />
              <Text style={styles.frequencyText}>{item.frequency}</Text>
            </View>

            {/* Prescribed By */}
            {item.prescribedBy && (
              <View style={styles.detailRow}>
                <User size={14} color={SEMANTIC.text.tertiary} />
                <Text style={styles.prescribedByText}>Dr. {item.prescribedBy}</Text>
              </View>
            )}

            {/* Notes */}
            {item.notes && (
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            )}
          </View>

          {/* Actions */}
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteMedication(item)}
          >
            <Trash2 size={20} color={STATUS.error.main} />
          </Pressable>
        </View>
      </Card>
    ),
    [handleDeleteMedication]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: `${PRIMARY[600]}10` }]}>
          <Pill size={48} color={PRIMARY[600]} />
        </View>
        <Text style={styles.emptyTitle}>No Medications Listed</Text>
        <Text style={styles.emptySubtitle}>
          Add your medications so healthcare providers know what you're taking
        </Text>
        <Pressable style={styles.emptyButton} onPress={handleAddMedication}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Medication</Text>
        </Pressable>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Pill size={20} color={PRIMARY[600]} />
        <Text style={styles.infoBannerText}>
          Keep your medication list current for safe treatment
        </Text>
      </View>

      {/* Stats */}
      {medications.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{medications.length}</Text>
            <Text style={styles.statLabel}>Total Medications</Text>
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
        <Text style={styles.headerTitle}>Medications</Text>
        <Pressable onPress={handleAddMedication} style={styles.addButton}>
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
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicationItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            medications.length === 0 && styles.listContentEmpty,
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
      {deleteMedicationMutation.isPending && <LoadingSpinner visible overlay />}
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
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: PRIMARY[700],
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY[600],
  },
  statLabel: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    marginTop: 4,
  },
  medicationCard: {
    marginHorizontal: spacing[4],
  },
  medicationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${PRIMARY[600]}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  medicationInfo: {
    flex: 1,
    gap: spacing[1],
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dosageText: {
    fontSize: 15,
    fontWeight: '500',
    color: PRIMARY[600],
  },
  frequencyText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  prescribedByText: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
  },
  notesText: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
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

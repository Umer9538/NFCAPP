/**
 * Activity Filter Modal
 * Modal for filtering activity logs by date range and type
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Button, Card } from '@/components/ui';
import type { ActivityFilters, ActivityType } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, MEDICAL_COLORS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface ActivityFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ActivityFilters) => void;
  initialFilters?: ActivityFilters;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'access', label: 'Access', icon: 'eye-outline' },
  { value: 'update', label: 'Update', icon: 'create-outline' },
  { value: 'system', label: 'System', icon: 'settings-outline' },
  { value: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
  { value: 'login', label: 'Login', icon: 'log-in-outline' },
  { value: 'scan', label: 'Scan', icon: 'scan-outline' },
];

export function ActivityFilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: ActivityFilterModalProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialFilters?.dateFrom ? new Date(initialFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialFilters?.dateTo ? new Date(initialFilters.dateTo) : undefined
  );
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(
    initialFilters?.types || []
  );
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const toggleType = (type: ActivityType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedTypes([]);
  };

  const handleApply = () => {
    const filters: ActivityFilters = {
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Activities</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={SEMANTIC.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>

              {/* From Date */}
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDateFromPicker(true)}
              >
                <View style={styles.dateButtonLeft}>
                  <Ionicons name="calendar-outline" size={20} color={PRIMARY[600]} />
                  <Text style={styles.dateButtonLabel}>From:</Text>
                  <Text style={styles.dateButtonValue}>
                    {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Select date'}
                  </Text>
                </View>
                {dateFrom && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setDateFrom(undefined);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={SEMANTIC.text.tertiary} />
                  </Pressable>
                )}
              </Pressable>

              {/* To Date */}
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDateToPicker(true)}
              >
                <View style={styles.dateButtonLeft}>
                  <Ionicons name="calendar-outline" size={20} color={PRIMARY[600]} />
                  <Text style={styles.dateButtonLabel}>To:</Text>
                  <Text style={styles.dateButtonValue}>
                    {dateTo ? format(dateTo, 'MMM d, yyyy') : 'Select date'}
                  </Text>
                </View>
                {dateTo && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setDateTo(undefined);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={SEMANTIC.text.tertiary} />
                  </Pressable>
                )}
              </Pressable>
            </View>

            {/* Activity Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Types</Text>
              <View style={styles.typesList}>
                {ACTIVITY_TYPES.map((type) => {
                  const isSelected = selectedTypes.includes(type.value);
                  return (
                    <Pressable
                      key={type.value}
                      style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                      onPress={() => toggleType(type.value)}
                    >
                      <Ionicons
                        name={type.icon}
                        size={18}
                        color={isSelected ? PRIMARY[600] : SEMANTIC.text.secondary}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && styles.typeChipTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={PRIMARY[600]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Quick Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Filters</Text>
              <View style={styles.quickFilters}>
                <Pressable
                  style={styles.quickFilterButton}
                  onPress={() => {
                    const today = new Date();
                    setDateFrom(today);
                    setDateTo(today);
                  }}
                >
                  <Text style={styles.quickFilterText}>Today</Text>
                </Pressable>
                <Pressable
                  style={styles.quickFilterButton}
                  onPress={() => {
                    const today = new Date();
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    setDateFrom(weekAgo);
                    setDateTo(today);
                  }}
                >
                  <Text style={styles.quickFilterText}>Last 7 Days</Text>
                </Pressable>
                <Pressable
                  style={styles.quickFilterButton}
                  onPress={() => {
                    const today = new Date();
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    setDateFrom(monthAgo);
                    setDateTo(today);
                  }}
                >
                  <Text style={styles.quickFilterText}>Last 30 Days</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Reset Filters"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>

          {/* Date Pickers */}
          {showDateFromPicker && (
            <DateTimePicker
              value={dateFrom || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDateFromPicker(false);
                if (selectedDate) {
                  setDateFrom(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
          {showDateToPicker && (
            <DateTimePicker
              value={dateTo || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDateToPicker(false);
                if (selectedDate) {
                  setDateTo(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={dateFrom}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SEMANTIC.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  closeButton: {
    padding: spacing[2],
  },
  scrollView: {
    flex: 1,
    padding: spacing[4],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    marginBottom: spacing[2],
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  dateButtonValue: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  clearButton: {
    padding: spacing[1],
  },
  typesList: {
    gap: spacing[2],
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    gap: spacing[2],
  },
  typeChipSelected: {
    backgroundColor: PRIMARY[50],
    borderColor: PRIMARY[600],
  },
  typeChipText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  typeChipTextSelected: {
    fontWeight: '600',
    color: PRIMARY[600],
  },
  quickFilters: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  quickFilterButton: {
    flex: 1,
    padding: spacing[2],
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

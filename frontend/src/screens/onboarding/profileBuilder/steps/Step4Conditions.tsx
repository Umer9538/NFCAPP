import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { HeartIcon } from '../components/HeartIcon';
import { useVoiceInput } from '../components/useVoiceInput';
import {
  CONDITION_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  DIAGNOSIS_MONTH_OPTIONS,
  DIAGNOSIS_YEAR_OPTIONS,
} from '../enums';
import { COMMON_CONDITIONS } from '../suggestions';
import { makeId } from '../buildPayload';
import type { ConditionEntry, StepProps, ValidatorFn } from '../types';

/**
 * Mirrors web validateStep(4): every "active" condition row needs name +
 * severity, and either a diagnosis date or the "Don't remember" checkbox
 * ticked. Empty rows are dropped on submit so they don't trigger errors.
 */
export const validateStep4: ValidatorFn = (_data, arrays) => {
  const errs: string[] = [];
  arrays.conditions.forEach((c, idx) => {
    const isActive =
      c.conditionName.trim() ||
      c.severity ||
      c.diagnosisDate.trim() ||
      c.diagnosisUnknown ||
      c.status ||
      c.criticalNotes.trim();
    if (!isActive) return;

    if (!c.conditionName.trim())
      errs.push(`Condition name is required for Condition ${idx + 1}`);
    if (!c.severity)
      errs.push(`Severity is required for Condition ${idx + 1}`);
    if (!c.diagnosisUnknown && !c.diagnosisDate.trim()) {
      errs.push(
        `Date diagnosed is required for Condition ${idx + 1} (or select "Don't remember date diagnosed")`
      );
    }
  });
  return errs.length ? errs : null;
};

function newCondition(): ConditionEntry {
  return {
    id: makeId(),
    conditionName: '',
    severity: 'mild',
    diagnosisDate: '',
    diagnosisUnknown: false,
    doctorName: '',
    doctorSpecialty: '',
    doctorPhone: '',
    criticalNotes: '',
    status: 'active',
  };
}

interface SeverityTheme {
  bg: string;
  borderLeft: string;
  dot: string;
  pillBg: string;
  pillText: string;
  pillLabel: string;
}

const SEVERITY_THEMES: Record<string, SeverityTheme> = {
  mild: {
    bg: '#f0fdf4',
    borderLeft: '#22c55e',
    dot: '#22c55e',
    pillBg: '#dcfce7',
    pillText: '#166534',
    pillLabel: 'MILD',
  },
  moderate: {
    bg: '#fefce8',
    borderLeft: '#eab308',
    dot: '#eab308',
    pillBg: '#fef9c3',
    pillText: '#854d0e',
    pillLabel: 'MODERATE',
  },
  severe: {
    bg: '#fff7ed',
    borderLeft: '#f97316',
    dot: '#f97316',
    pillBg: '#ffedd5',
    pillText: '#9a3412',
    pillLabel: 'SEVERE',
  },
  life_threatening: {
    bg: '#fef2f2',
    borderLeft: '#ef4444',
    dot: '#ef4444',
    pillBg: '#fee2e2',
    pillText: '#991b1b',
    pillLabel: 'LIFE-THREATENING',
  },
  '': {
    bg: '#f9fafb',
    borderLeft: '#d1d5db',
    dot: '#9ca3af',
    pillBg: '#f3f4f6',
    pillText: '#4b5563',
    pillLabel: '',
  },
};

const MAX_ITEMS = 15;

export function Step4Conditions({
  data,
  arrays,
  update,
  updateArray,
  attemptedSubmit,
}: StepProps) {
  const items = arrays.conditions;
  const [search, setSearch] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const atCapacity = items.length >= MAX_ITEMS;

  const findIndexByName = (name: string) =>
    items.findIndex(
      (r) => r.conditionName.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const updateRow = (index: number, patch: Partial<ConditionEntry>) => {
    const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
    updateArray('conditions', next);
  };

  const addRow = (preset?: string) => {
    if (atCapacity) return;
    const row = newCondition();
    if (preset) row.conditionName = preset;
    updateArray('conditions', [...items, row]);
  };

  const removeRow = (index: number) => {
    updateArray('conditions', items.filter((_, i) => i !== index));
  };

  const toggleCommon = (name: string) => {
    const existingIdx = findIndexByName(name);
    if (existingIdx !== -1) removeRow(existingIdx);
    else addRow(name);
  };

  const submitSearch = () => {
    const name = search.trim();
    if (!name || atCapacity) return;
    addRow(name);
    setSearch('');
  };

  const voice = useVoiceInput({
    onInterimResult: (text) => setSearch(text),
    onFinalResult: (text) => setSearch(text),
  });
  const toggleVoice = () => (voice.listening ? voice.stop() : voice.start());

  // Sort: life-threatening → severe → moderate → mild → none (matches web).
  const sortedItems = useMemo(() => {
    const order = ['life_threatening', 'severe', 'moderate', 'mild', ''];
    return items
      .map((it, idx) => ({ it, idx }))
      .sort((a, b) => order.indexOf(a.it.severity) - order.indexOf(b.it.severity));
  }, [items]);

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Medical Conditions Visibility"
        value={data.conditionsPublic}
        onChange={(v) => update('conditionsPublic', v)}
        publicDescription="First responders will see your conditions when scanning your bracelet"
        privateDescription="Your medical conditions will be hidden from emergency view"
      />

      <View style={styles.addRow}>
        <Text style={styles.addRowText}>
          Search and verify your conditions, then add severity and notes below.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.addManuallyBtn,
            pressed && styles.addManuallyBtnPressed,
          ]}
          onPress={() => addRow()}
        >
          <Ionicons name="add" size={16} color={SEMANTIC.text.primary} />
          <Text style={styles.addManuallyText}>Add Manually</Text>
        </Pressable>
      </View>

      <View style={styles.quickAddCard}>
        <View style={styles.quickAddHeader}>
          <HeartIcon size={16} color="#be123c" />
          <Text style={styles.quickAddTitle}>
            Quick Add Conditions (with verification)
          </Text>
        </View>

        <View style={styles.quickAddInputRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={GRAY[400]} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search or type condition..."
              placeholderTextColor={GRAY[400]}
              onSubmitEditing={submitSearch}
              returnKeyType="done"
            />
            <Pressable onPress={toggleVoice} hitSlop={8} style={styles.micBtn}>
              <Ionicons
                name={voice.listening ? 'mic' : 'mic-off-outline'}
                size={18}
                color={voice.listening ? PRIMARY[600] : GRAY[400]}
              />
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.quickSelectBtn,
              pressed && styles.quickSelectBtnPressed,
              showQuickSelect && styles.quickSelectBtnActive,
            ]}
            onPress={() => setShowQuickSelect((s) => !s)}
          >
            <Text style={styles.quickSelectText}>Quick Select</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.plusBtn,
              (!search.trim() || atCapacity) && styles.plusBtnDisabled,
              pressed && search.trim() && !atCapacity && styles.plusBtnPressed,
            ]}
            onPress={submitSearch}
            disabled={!search.trim() || atCapacity}
          >
            <Ionicons
              name="add"
              size={22}
              color={search.trim() && !atCapacity ? '#fff' : GRAY[400]}
            />
          </Pressable>
        </View>

        {showQuickSelect && (
          <View style={styles.commonWrap}>
            <Text style={styles.commonLabel}>Common Conditions:</Text>
            <View style={styles.commonChips}>
              {COMMON_CONDITIONS.map((name) => {
                const selected = findIndexByName(name) !== -1;
                const disabled = !selected && atCapacity;
                return (
                  <Pressable
                    key={name}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.commonChip,
                      selected && styles.commonChipSelected,
                      pressed && !selected && styles.commonChipPressed,
                      pressed && selected && styles.commonChipSelectedPressed,
                      disabled && styles.commonChipDisabled,
                    ]}
                    onPress={() => toggleCommon(name)}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#15803d"
                        style={styles.commonChipCheck}
                      />
                    )}
                    <Text
                      style={[
                        styles.commonChipText,
                        selected && styles.commonChipTextSelected,
                      ]}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.addedChips}>
            {items.map((row, idx) => {
              const name = row.conditionName.trim() || `Condition ${idx + 1}`;
              return (
                <View key={row.id} style={styles.addedChip}>
                  <Ionicons name="checkmark" size={14} color="#15803d" />
                  <Text style={styles.addedChipText}>{name}</Text>
                  <Pressable onPress={() => removeRow(idx)} hitSlop={6}>
                    <Ionicons name="close" size={14} color="#15803d" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
        {items.length > 0 && (
          <Text style={styles.countText}>
            {items.length} / {MAX_ITEMS} items
          </Text>
        )}

        <Text style={styles.quickAddHint}>
          Common conditions like diabetes, hypertension, and asthma are pre-verified.
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <HeartIcon size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No conditions added yet</Text>
          <Text style={styles.emptySubtitle}>
            Search and add conditions above, or click "Add Manually"
          </Text>
        </View>
      ) : (
        <View style={styles.detailedHeaderWrap}>
          <View style={styles.detailedHeaderDivider} />
          <Text style={styles.detailedHeader}>Severity & Details</Text>
          <Text style={styles.detailedSubtitle}>
            Complete the details below for each condition.
          </Text>
        </View>
      )}

      {sortedItems.map(({ it: row, idx }, displayIndex) => {
        const theme = SEVERITY_THEMES[row.severity] || SEVERITY_THEMES[''];
        const wordCount = row.criticalNotes.trim()
          ? row.criticalNotes.trim().split(/\s+/).length
          : 0;
        const [storedYear = '', storedMonth = ''] = (row.diagnosisDate || '').split('-');
        const setDate = (month: string, year: string) => {
          updateRow(idx, {
            diagnosisDate: month && year ? `${year}-${month}` : '',
          });
        };
        const dateMissing =
          !!attemptedSubmit &&
          !!row.conditionName.trim() &&
          !row.diagnosisUnknown &&
          !row.diagnosisDate.trim();
        return (
          <View
            key={row.id}
            style={[
              styles.condCard,
              { backgroundColor: theme.bg, borderLeftColor: theme.borderLeft },
            ]}
          >
            <View style={styles.condHeader}>
              <View style={styles.condHeaderLeft}>
                <View style={[styles.dot, { backgroundColor: theme.dot }]} />
                <View>
                  <Text style={styles.condTitle} numberOfLines={1}>
                    {row.conditionName || `Condition ${displayIndex + 1}`}
                  </Text>
                  {theme.pillLabel ? (
                    <View
                      style={[styles.severityPill, { backgroundColor: theme.pillBg }]}
                    >
                      <Text style={[styles.severityPillText, { color: theme.pillText }]}>
                        {theme.pillLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Pressable onPress={() => removeRow(idx)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            </View>

            <View style={styles.fieldsGrid}>
              <View style={styles.col}>
                <IconInput
                  label="Condition Name"
                  required
                  value={row.conditionName}
                  onChange={(v) => updateRow(idx, { conditionName: v })}
                  placeholder="e.g., Congestive Heart Failure"
                />
              </View>
              <View style={styles.col}>
                <View style={styles.verifiedSlot}>
                  <Text style={styles.verifiedText}>Verified via database</Text>
                </View>
              </View>

              <View style={styles.col}>
                <SelectField
                  label="Severity"
                  required
                  placeholder="Select Severity"
                  value={row.severity}
                  options={SEVERITY_OPTIONS}
                  onChange={(v) => updateRow(idx, { severity: v })}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.fieldLabel}>Date Diagnosed</Text>
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => {
                    const next = !row.diagnosisUnknown;
                    updateRow(idx, {
                      diagnosisUnknown: next,
                      ...(next ? { diagnosisDate: '' } : {}),
                    });
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      row.diagnosisUnknown && styles.checkboxOn,
                    ]}
                  >
                    {row.diagnosisUnknown && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Don't remember date diagnosed
                  </Text>
                </Pressable>
                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <SelectField
                      label=""
                      placeholder="Select month"
                      value={row.diagnosisUnknown ? '' : storedMonth}
                      options={DIAGNOSIS_MONTH_OPTIONS}
                      onChange={(v) => !row.diagnosisUnknown && setDate(v, storedYear)}
                      error={dateMissing}
                    />
                  </View>
                  <View style={styles.dateCol}>
                    <SelectField
                      label=""
                      placeholder="Select year"
                      value={row.diagnosisUnknown ? '' : storedYear}
                      options={DIAGNOSIS_YEAR_OPTIONS}
                      onChange={(v) => !row.diagnosisUnknown && setDate(storedMonth, v)}
                      error={dateMissing}
                    />
                  </View>
                </View>
                {dateMissing && (
                  <Text style={styles.dateErrorText}>
                    Date diagnosed is required for Condition {displayIndex + 1} (or select "Don't remember date diagnosed")
                  </Text>
                )}
              </View>

              <View style={styles.col}>
                <SelectField
                  label="Status"
                  optional
                  placeholder="Select Status"
                  value={row.status}
                  options={CONDITION_STATUS_OPTIONS}
                  onChange={(v) => updateRow(idx, { status: v })}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.notesLabel}>
                  Critical Notes for First Responders{' '}
                  <Text style={styles.optionalText}>(Optional)</Text>
                </Text>
                <TextInput
                  style={styles.notesInput}
                  value={row.criticalNotes}
                  onChangeText={(v) => updateRow(idx, { criticalNotes: v })}
                  placeholder="e.g., Cannot lie flat due to heart failure. May need oxygen."
                  placeholderTextColor={GRAY[400]}
                  multiline
                  textAlignVertical="top"
                />
                <Text style={styles.wordCount}>
                  {wordCount} words (limit 100-300)
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    gap: spacing[5],
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  addRowText: {
    flex: 1,
    minWidth: 180,
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  addManuallyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: GRAY[900],
    backgroundColor: '#ffffff',
  },
  addManuallyBtnPressed: {
    backgroundColor: GRAY[100],
  },
  addManuallyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  quickAddCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  quickAddHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  quickAddTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#9f1239',
  },
  quickAddInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#ffffff',
    minHeight: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    padding: 0,
  },
  micBtn: {
    padding: 4,
  },
  quickSelectBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#ffffff',
    minHeight: 42,
    justifyContent: 'center',
  },
  quickSelectBtnPressed: {
    backgroundColor: '#ffe4e6',
  },
  quickSelectBtnActive: {
    borderColor: '#e11d48',
  },
  quickSelectText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#be123c',
  },
  plusBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  plusBtnDisabled: {
    backgroundColor: GRAY[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  plusBtnPressed: {
    backgroundColor: PRIMARY[800],
    transform: [{ scale: 0.96 }],
  },
  commonWrap: {
    backgroundColor: GRAY[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  commonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.secondary,
  },
  commonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  commonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  commonChipPressed: {
    backgroundColor: GRAY[100],
  },
  commonChipSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  commonChipSelectedPressed: {
    backgroundColor: '#bbf7d0',
  },
  commonChipDisabled: {
    opacity: 0.5,
  },
  commonChipCheck: {
    marginRight: 2,
  },
  commonChipText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  commonChipTextSelected: {
    color: '#15803d',
    fontWeight: typography.fontWeight.semibold,
  },
  addedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  addedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  addedChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#15803d',
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  quickAddHint: {
    fontSize: typography.fontSize.xs,
    color: '#be123c',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyTitle: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  detailedHeaderWrap: {
    gap: spacing[2],
  },
  detailedHeaderDivider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginBottom: spacing[2],
  },
  detailedHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  detailedSubtitle: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  condCard: {
    borderLeftWidth: 4,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  condHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  condHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    minWidth: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  condTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  severityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 2,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: spacing[3],
  },
  col: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 140,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  verifiedSlot: {
    justifyContent: 'flex-end',
    paddingBottom: spacing[3],
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    color: '#16a34a',
    fontWeight: typography.fontWeight.medium,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dateCol: {
    flex: 1,
  },
  dateErrorText: {
    fontSize: typography.fontSize.sm,
    color: '#dc2626',
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[1],
  },
  notesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  optionalText: {
    color: SEMANTIC.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
});

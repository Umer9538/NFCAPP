import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { CheckboxPill } from '../components/CheckboxPill';
import { MedicalBadgeIcon } from '../components/MedicalBadgeIcon';
import { useVoiceInput } from '../components/useVoiceInput';
import {
  ALLERGY_TYPE_OPTIONS,
  ALLERGY_SEVERITY_DETAILED_OPTIONS,
  REACTION_TYPE_OPTIONS,
} from '../enums';
import { COMMON_ALLERGIES } from '../suggestions';
import { makeId } from '../buildPayload';
import type { AllergyEntry, StepProps, ValidatorFn } from '../types';

/**
 * Mirrors web validateStep(2): every allergy entry must have a non-empty name
 * and a severity. Empty rows are dropped on submit, so they don't trigger
 * errors.
 */
export const validateStep2: ValidatorFn = (_data, arrays) => {
  const errs: string[] = [];
  arrays.allergies.forEach((a, idx) => {
    // Only validate "active" rows — a row is active if any field is filled.
    const isActive =
      a.allergenName.trim() || a.severity || a.reactionTypes.length > 0 || a.treatmentNotes.trim();
    if (!isActive) return;
    if (!a.allergenName.trim())
      errs.push(`Allergen name is required for Allergy ${idx + 1}`);
    if (!a.severity)
      errs.push(`Severity is required for Allergy ${idx + 1}`);
  });
  return errs.length ? errs : null;
};

function newAllergy(): AllergyEntry {
  return {
    id: makeId(),
    allergenName: '',
    allergyType: '',
    severity: 'mild',
    reactionTypes: [],
    otherReaction: '',
    treatmentNotes: '',
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
    pillText: '#374151',
    pillLabel: '',
  },
};

export function Step2Allergies({ data, arrays, update, updateArray }: StepProps) {
  const items = arrays.allergies;
  const [search, setSearch] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const updateRow = (index: number, patch: Partial<AllergyEntry>) => {
    const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
    updateArray('allergies', next);
  };

  const addRow = (preset?: string) => {
    const row = newAllergy();
    if (preset) row.allergenName = preset;
    updateArray('allergies', [...items, row]);
  };

  const removeRow = (index: number) => {
    updateArray('allergies', items.filter((_, i) => i !== index));
  };

  const MAX_ITEMS = 15;
  const atCapacity = items.length >= MAX_ITEMS;

  const findIndexByName = (name: string) =>
    items.findIndex(
      (r) => r.allergenName.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const submitSearch = () => {
    const name = search.trim();
    if (!name || atCapacity) return;
    addRow(name);
    setSearch('');
  };

  const toggleCommon = (name: string) => {
    const existingIdx = findIndexByName(name);
    if (existingIdx !== -1) {
      removeRow(existingIdx);
    } else if (!atCapacity) {
      addRow(name);
    }
  };

  const voice = useVoiceInput({
    onInterimResult: (text) => setSearch(text),
    onFinalResult: (text) => {
      // Drop the transcript into the search field; the user can confirm with +.
      setSearch(text);
    },
  });

  const toggleVoice = () => {
    if (voice.listening) voice.stop();
    else voice.start();
  };

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
        title="Allergy Information Visibility"
        value={data.allergiesPublic}
        onChange={(v) => update('allergiesPublic', v)}
        publicDescription="First responders will see your allergies when scanning your bracelet"
        privateDescription="Your allergies will be hidden from emergency view"
      />

      <View style={styles.addRow}>
        <Text style={styles.addRowText}>
          Add any allergies you have. These will be highlighted for first responders.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.addDetailedBtn,
            pressed && styles.addDetailedBtnPressed,
          ]}
          onPress={() => addRow()}
        >
          <Ionicons name="add" size={16} color={SEMANTIC.text.primary} />
          <Text style={styles.addDetailedText}>Add Detailed Allergy</Text>
        </Pressable>
      </View>

      <View style={styles.quickAddCard}>
        <View style={styles.quickAddHeader}>
          <MedicalBadgeIcon size={18} />
          <Text style={styles.quickAddTitle}>Quick Add Allergies (with verification)</Text>
        </View>
        <View style={styles.quickAddInputRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={GRAY[400]} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search or type allergy..."
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
              !search.trim() && styles.plusBtnDisabled,
              pressed && search.trim() && styles.plusBtnPressed,
            ]}
            onPress={submitSearch}
            disabled={!search.trim()}
            android_ripple={{ color: '#ffffff44', borderless: false }}
          >
            <Ionicons name="add" size={22} color={search.trim() ? '#fff' : GRAY[400]} />
          </Pressable>
        </View>
        {showQuickSelect && (
          <View style={styles.commonAllergiesWrap}>
            <Text style={styles.commonAllergiesLabel}>Common Allergies:</Text>
            <View style={styles.commonChips}>
              {COMMON_ALLERGIES.map((name) => {
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
              const name = row.allergenName.trim() || `Allergy ${idx + 1}`;
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
          Verified allergies show a green checkmark. Yellow chips need confirmation.
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <MedicalBadgeIcon size={56} />
          <Text style={styles.emptyTitle}>No allergies added yet</Text>
          <Text style={styles.emptySubtitle}>
            Use Quick Add above or click "Add Detailed Allergy" for more options
          </Text>
        </View>
      ) : (
        <View style={styles.detailedHeaderWrap}>
          <View style={styles.detailedHeaderDivider} />
          <Text style={styles.detailedHeader}>Detailed Allergy Information</Text>
        </View>
      )}

      {sortedItems.map(({ it: row, idx }, displayIndex) => {
        const theme = SEVERITY_THEMES[row.severity] || SEVERITY_THEMES[''];
        const wordCount = row.treatmentNotes.trim()
          ? row.treatmentNotes.trim().split(/\s+/).length
          : 0;
        return (
          <View
            key={row.id}
            style={[
              styles.allergyCard,
              { backgroundColor: theme.bg, borderLeftColor: theme.borderLeft },
            ]}
          >
            <View style={styles.allergyHeader}>
              <View style={styles.allergyHeaderLeft}>
                <View style={[styles.dot, { backgroundColor: theme.dot }]} />
                <View>
                  <Text style={styles.allergyTitle}>
                    {row.allergenName || `Allergy ${displayIndex + 1}`}
                  </Text>
                  {theme.pillLabel ? (
                    <View
                      style={[
                        styles.severityPill,
                        { backgroundColor: theme.pillBg },
                      ]}
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
                  label="Allergen Name"
                  required
                  value={row.allergenName}
                  onChange={(v) => updateRow(idx, { allergenName: v })}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="Allergy Type"
                  optional
                  placeholder="Select Type"
                  value={row.allergyType}
                  options={ALLERGY_TYPE_OPTIONS}
                  onChange={(v) => updateRow(idx, { allergyType: v })}
                />
              </View>
              <View style={styles.colFull}>
                <SelectField
                  label="Severity"
                  required
                  placeholder="Select Severity"
                  value={row.severity}
                  options={ALLERGY_SEVERITY_DETAILED_OPTIONS}
                  onChange={(v) => updateRow(idx, { severity: v })}
                />
              </View>
              <View style={styles.colFull}>
                <CheckboxPill
                  label="Reaction Types"
                  options={REACTION_TYPE_OPTIONS}
                  value={row.reactionTypes}
                  onChange={(next) => updateRow(idx, { reactionTypes: next })}
                />
              </View>
              {row.reactionTypes.includes('other') && (
                <View style={styles.colFull}>
                  <IconInput
                    label="Other reaction"
                    value={row.otherReaction}
                    onChange={(v) => updateRow(idx, { otherReaction: v })}
                  />
                </View>
              )}
              <View style={styles.colFull}>
                <Text style={styles.notesLabel}>
                  Treatment Notes <Text style={styles.optionalText}>(Optional)</Text>
                </Text>
                <TextInput
                  style={styles.notesInput}
                  value={row.treatmentNotes}
                  onChangeText={(v) => updateRow(idx, { treatmentNotes: v })}
                  placeholder="e.g., EpiPen in purse. Inject immediately if exposed. Call 911."
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
  addDetailedBtn: {
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
  addDetailedBtnPressed: {
    backgroundColor: GRAY[100],
  },
  addDetailedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  quickAddCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
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
    color: SEMANTIC.text.primary,
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
    borderColor: PRIMARY[200],
    backgroundColor: PRIMARY[50],
    minHeight: 42,
    justifyContent: 'center',
  },
  quickSelectBtnPressed: {
    backgroundColor: PRIMARY[100],
  },
  quickSelectBtnActive: {
    borderColor: PRIMARY[600],
  },
  quickSelectText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: PRIMARY[700],
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
  commonAllergiesWrap: {
    backgroundColor: GRAY[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  commonAllergiesLabel: {
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
    color: SEMANTIC.text.secondary,
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
    gap: spacing[3],
  },
  detailedHeaderDivider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
  },
  detailedHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.secondary,
  },
  allergyCard: {
    borderLeftWidth: 4,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  allergyHeaderLeft: {
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
  allergyTitle: {
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
  colFull: {
    flexBasis: '100%',
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
    minHeight: 72,
  },
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
});

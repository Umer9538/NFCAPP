import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { PillIcon } from '../components/PillIcon';
import { TimesToTakeEditor, defaultTimesForFrequency } from '../components/TimesToTakeEditor';
import { useVoiceInput } from '../components/useVoiceInput';
import { verifyDIN } from '@/api/waterfall';
import {
  CRITICALITY_DETAILED_OPTIONS,
  DOSAGE_UNIT_OPTIONS,
  MEDICATION_FREQUENCY_OPTIONS,
} from '../enums';
import { COMMON_MEDICATIONS } from '../suggestions';
import { makeId } from '../buildPayload';
import type { MedicationEntry, StepProps, ValidatorFn } from '../types';

/**
 * Mirrors web validateStep(3): every medication row that has any field filled
 * must have a name + criticality. Times-to-take is recommended but not
 * required (matches the web's note about as-needed meds).
 */
export const validateStep3: ValidatorFn = (_data, arrays) => {
  const errs: string[] = [];
  arrays.medications.forEach((m, idx) => {
    const isActive =
      m.medicationName.trim() ||
      m.dosage.trim() ||
      m.frequency ||
      m.criticality ||
      m.purpose.trim() ||
      m.specialInstructions.trim();
    if (!isActive) return;
    if (!m.medicationName.trim())
      errs.push(`Medication name is required for Medication ${idx + 1}`);
    if (!m.criticality)
      errs.push(`Criticality is required for Medication ${idx + 1}`);
  });
  return errs.length ? errs : null;
};

function newMedication(): MedicationEntry {
  return {
    id: makeId(),
    medicationName: '',
    dosage: '',
    dosageUnit: 'mg',
    frequency: 'once_daily',
    frequencyOther: '',
    timesToTake: ['09:00'],
    criticality: 'routine',
    purpose: '',
    prescribingDoctor: '',
    doctorSpecialty: '',
    doctorPhone: '',
    specialInstructions: '',
  };
}

interface CriticalityTheme {
  bg: string;
  borderLeft: string;
  emoji: string;
  pillBg: string;
  pillText: string;
  pillLabel: string;
}

const CRITICALITY_THEMES: Record<string, CriticalityTheme> = {
  critical: {
    bg: '#fef2f2',
    borderLeft: '#ef4444',
    emoji: '⚠️',
    pillBg: '#fee2e2',
    pillText: '#991b1b',
    pillLabel: 'CRITICAL - Life-threatening if missed',
  },
  important: {
    bg: '#fefce8',
    borderLeft: '#eab308',
    emoji: 'ℹ️',
    pillBg: '#fef9c3',
    pillText: '#854d0e',
    pillLabel: 'IMPORTANT - Should not skip',
  },
  as_needed: {
    bg: '#eff6ff',
    borderLeft: '#3b82f6',
    emoji: '💊',
    pillBg: '#dbeafe',
    pillText: '#1e40af',
    pillLabel: 'PRN (As Needed)',
  },
  routine: {
    bg: '#f9fafb',
    borderLeft: '#d1d5db',
    emoji: '💊',
    pillBg: '#f3f4f6',
    pillText: '#4b5563',
    pillLabel: 'Routine',
  },
};

const MAX_ITEMS = 20;

export function Step3Medications({ data, arrays, update, updateArray }: StepProps) {
  const items = arrays.medications;
  const [search, setSearch] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [showDIN, setShowDIN] = useState(false);
  const [dinInput, setDinInput] = useState('');
  const [dinLoading, setDinLoading] = useState(false);

  const atCapacity = items.length >= MAX_ITEMS;

  const findIndexByName = (name: string) =>
    items.findIndex(
      (r) => r.medicationName.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const updateRow = (index: number, patch: Partial<MedicationEntry>) => {
    const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
    updateArray('medications', next);
  };

  const updateFrequency = (index: number, freq: string) => {
    const row = items[index];
    const defaults = defaultTimesForFrequency(freq);
    const patch: Partial<MedicationEntry> = { frequency: freq };
    if (defaults && row.timesToTake.length === 0) {
      patch.timesToTake = defaults;
    }
    updateRow(index, patch);
  };

  const addRow = (preset?: { name: string; purpose?: string }) => {
    if (atCapacity) return;
    const row = newMedication();
    if (preset) {
      row.medicationName = preset.name;
      if (preset.purpose) row.purpose = preset.purpose;
    }
    updateArray('medications', [...items, row]);
  };

  const removeRow = (index: number) => {
    updateArray('medications', items.filter((_, i) => i !== index));
  };

  const toggleCommon = (name: string, purpose: string) => {
    const existingIdx = findIndexByName(name);
    if (existingIdx !== -1) removeRow(existingIdx);
    else addRow({ name, purpose });
  };

  const submitSearch = () => {
    const name = search.trim();
    if (!name || atCapacity) return;
    addRow({ name });
    setSearch('');
  };

  const voice = useVoiceInput({
    onInterimResult: (text) => setSearch(text),
    onFinalResult: (text) => setSearch(text),
  });
  const toggleVoice = () => (voice.listening ? voice.stop() : voice.start());

  const handleDinLookup = async () => {
    const clean = dinInput.replace(/\D/g, '');
    if (clean.length !== 8) {
      Alert.alert(
        'Invalid DIN',
        'A Canadian Drug Identification Number is exactly 8 digits.'
      );
      return;
    }
    setDinLoading(true);
    try {
      const result = await verifyDIN(clean);
      const row: MedicationEntry = {
        ...newMedication(),
        medicationName: result.brandName || result.activeIngredient || clean,
        dosage: extractDosage(result.strength) ?? '',
        dosageUnit: extractUnit(result.strength) ?? 'mg',
        purpose: result.drugClass ?? '',
      };
      updateArray('medications', [...items, row]);
      setDinInput('');
      setShowDIN(false);
    } catch (e: any) {
      Alert.alert('Lookup failed', e?.message || 'Could not resolve that DIN.');
    } finally {
      setDinLoading(false);
    }
  };

  // Sort: critical → important → as_needed → routine (matches web).
  const sortedItems = useMemo(() => {
    const order = ['critical', 'important', 'as_needed', 'routine', ''];
    return items
      .map((it, idx) => ({ it, idx }))
      .sort((a, b) => order.indexOf(a.it.criticality) - order.indexOf(b.it.criticality));
  }, [items]);

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Medication Information Visibility"
        value={data.medicationsPublic}
        onChange={(v) => update('medicationsPublic', v)}
        publicDescription="First responders will see your medications when scanning your bracelet"
        privateDescription="Your medications will be hidden from emergency view"
      />

      <View style={styles.addRow}>
        <Text style={styles.addRowText}>
          Search and verify your medications, then add dosage and schedule details below.
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
          <View style={styles.quickAddHeaderLeft}>
            <PillIcon size={16} color="#1e40af" />
            <Text style={styles.quickAddTitle}>
              Quick Add Medications (with verification)
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.dinToggleBtn,
              showDIN && styles.dinToggleBtnActive,
              pressed && styles.dinToggleBtnPressed,
            ]}
            onPress={() => setShowDIN((s) => !s)}
          >
            <Text
              style={[
                styles.dinToggleText,
                showDIN && styles.dinToggleTextActive,
              ]}
            >
              🇨🇦 Lookup by DIN
            </Text>
          </Pressable>
        </View>

        {showDIN ? (
          <View style={styles.dinBox}>
            <View style={styles.dinInputRow}>
              <Text style={styles.dinFlag}>🇨🇦</Text>
              <Text style={styles.dinLabel}>DIN</Text>
              <TextInput
                style={styles.dinInput}
                value={dinInput}
                onChangeText={(v) => setDinInput(v.replace(/\D/g, '').slice(0, 8))}
                placeholder="Enter 8-digit DIN"
                placeholderTextColor={GRAY[400]}
                keyboardType="number-pad"
                maxLength={8}
              />
              <Text style={styles.dinCount}>{dinInput.length}/8</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.dinLookupBtn,
                (dinLoading || dinInput.length !== 8) && styles.dinLookupBtnDisabled,
                pressed && dinInput.length === 8 && !dinLoading && styles.dinLookupBtnPressed,
              ]}
              onPress={handleDinLookup}
              disabled={dinLoading || dinInput.length !== 8}
            >
              {dinLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.dinFlag}>🇨🇦</Text>
                  <Text style={styles.dinLookupText}>Look up</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.dinHint}>
              Find the DIN on your medication packaging. It's an 8-digit number.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.quickAddInputRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={GRAY[400]} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search medication name..."
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
                <Text style={styles.commonLabel}>Common Medications:</Text>
                <View style={styles.commonChips}>
                  {COMMON_MEDICATIONS.map((m) => {
                    const selected = findIndexByName(m.name) !== -1;
                    const disabled = !selected && atCapacity;
                    return (
                      <Pressable
                        key={m.name}
                        disabled={disabled}
                        style={({ pressed }) => [
                          styles.commonChip,
                          selected && styles.commonChipSelected,
                          pressed && !selected && styles.commonChipPressed,
                          pressed && selected && styles.commonChipSelectedPressed,
                          disabled && styles.commonChipDisabled,
                        ]}
                        onPress={() => toggleCommon(m.name, m.purpose)}
                      >
                        <View style={styles.commonChipInner}>
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
                              styles.commonChipName,
                              selected && styles.commonChipNameSelected,
                            ]}
                          >
                            {m.name}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.commonChipPurpose,
                            selected && styles.commonChipPurposeSelected,
                          ]}
                        >
                          {m.purpose}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            {items.length > 0 && (
              <Text style={styles.countText}>
                {items.length} / {MAX_ITEMS} items
              </Text>
            )}
          </>
        )}

        <Text style={styles.quickAddHint}>
          Medications are verified against RxNorm (NIH) and Health Canada databases. Tallman lettering (e.g., metFORMIN) helps prevent medication errors.
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <PillIcon size={48} color={GRAY[300]} />
          <Text style={styles.emptyTitle}>No medications added yet</Text>
          <Text style={styles.emptySubtitle}>
            Search and add medications above, or click "Add Manually"
          </Text>
        </View>
      ) : (
        <View style={styles.detailedHeaderWrap}>
          <View style={styles.detailedHeaderDivider} />
          <Text style={styles.detailedHeader}>Dosage, Frequency & Schedule</Text>
          <Text style={styles.detailedSubtitle}>
            Complete the details below for each medication. This information is used for medication reminders.
          </Text>
        </View>
      )}

      {sortedItems.map(({ it: row, idx }, displayIndex) => {
        const theme = CRITICALITY_THEMES[row.criticality] || CRITICALITY_THEMES.routine;
        const wordCount = row.specialInstructions.trim()
          ? row.specialInstructions.trim().split(/\s+/).length
          : 0;
        return (
          <View
            key={row.id}
            style={[
              styles.medCard,
              { backgroundColor: theme.bg, borderLeftColor: theme.borderLeft },
            ]}
          >
            <View style={styles.medHeader}>
              <View style={styles.medHeaderLeft}>
                <Text style={styles.medEmoji}>{theme.emoji}</Text>
                <View style={styles.medHeaderText}>
                  <Text style={styles.medTitle} numberOfLines={1}>
                    {row.medicationName || `Medication ${displayIndex + 1}`}
                  </Text>
                  <View
                    style={[
                      styles.criticalityPill,
                      { backgroundColor: theme.pillBg },
                    ]}
                  >
                    <Text style={[styles.criticalityPillText, { color: theme.pillText }]}>
                      {theme.pillLabel}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable onPress={() => removeRow(idx)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            </View>

            <View style={styles.fieldsGrid}>
              <View style={styles.col}>
                <IconInput
                  label="Medication Name"
                  required
                  value={row.medicationName}
                  onChange={(v) => updateRow(idx, { medicationName: v })}
                  placeholder="e.g., Insulin (Lantus)"
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Dosage"
                  optional
                  value={row.dosage}
                  onChange={(v) => updateRow(idx, { dosage: v })}
                  placeholder="e.g., 20"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="Unit"
                  optional
                  placeholder="mg"
                  value={row.dosageUnit}
                  options={DOSAGE_UNIT_OPTIONS}
                  onChange={(v) => updateRow(idx, { dosageUnit: v })}
                />
              </View>

              <View style={styles.col}>
                <SelectField
                  label="Frequency"
                  optional
                  placeholder="Once daily"
                  value={row.frequency}
                  options={MEDICATION_FREQUENCY_OPTIONS}
                  onChange={(v) => updateFrequency(idx, v)}
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="Criticality"
                  required
                  placeholder="Select"
                  value={row.criticality}
                  options={CRITICALITY_DETAILED_OPTIONS}
                  onChange={(v) => updateRow(idx, { criticality: v })}
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Purpose"
                  optional
                  value={row.purpose}
                  onChange={(v) => updateRow(idx, { purpose: v })}
                  placeholder="e.g., Type 1 Diabetes"
                />
              </View>

              <View style={styles.colFull}>
                <Text style={styles.notesLabel}>
                  Special Instructions <Text style={styles.optionalText}>(Optional)</Text>
                </Text>
                <TextInput
                  style={styles.notesInput}
                  value={row.specialInstructions}
                  onChangeText={(v) => updateRow(idx, { specialInstructions: v })}
                  placeholder="e.g., Take with food, Do not take with dairy"
                  placeholderTextColor={GRAY[400]}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.wordCount}>
                  {wordCount} words (limit 100-300)
                </Text>
              </View>

              <View style={styles.colFull}>
                <View style={styles.timesDivider} />
                <TimesToTakeEditor
                  value={row.timesToTake}
                  onChange={(v) => updateRow(idx, { timesToTake: v })}
                />
                <Text style={styles.timesHint}>
                  Set when you take this medication. This will be used for medication reminders.
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function extractDosage(strength?: string): string | null {
  if (!strength) return null;
  const m = strength.match(/^\s*([\d.]+)/);
  return m ? m[1] : null;
}

function extractUnit(strength?: string): string | null {
  if (!strength) return null;
  const m = strength.match(/[\d.]+\s*(mg|mcg|units?|mL|tablets?)\b/i);
  if (!m) return null;
  const u = m[1].toLowerCase();
  if (u === 'unit' || u === 'units') return 'units';
  if (u === 'tablet' || u === 'tablets') return 'tablets';
  return m[1];
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
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  quickAddHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  quickAddHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    minWidth: 200,
  },
  quickAddTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#1e40af',
    flex: 1,
  },
  dinToggleBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#ffffff',
  },
  dinToggleBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dinToggleBtnPressed: {
    opacity: 0.85,
  },
  dinToggleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#1d4ed8',
  },
  dinToggleTextActive: {
    color: '#ffffff',
  },
  dinBox: {
    gap: spacing[3],
  },
  dinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  dinFlag: {
    fontSize: 16,
  },
  dinLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  dinInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    padding: 0,
  },
  dinCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  dinLookupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[600],
  },
  dinLookupBtnDisabled: {
    backgroundColor: GRAY[300],
  },
  dinLookupBtnPressed: {
    backgroundColor: PRIMARY[800],
  },
  dinLookupText: {
    color: '#ffffff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  dinHint: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
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
    borderColor: '#93c5fd',
    backgroundColor: '#ffffff',
    minHeight: 42,
    justifyContent: 'center',
  },
  quickSelectBtnPressed: {
    backgroundColor: '#dbeafe',
  },
  quickSelectBtnActive: {
    borderColor: '#2563eb',
  },
  quickSelectText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#1d4ed8',
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
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    minWidth: 110,
  },
  commonChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commonChipCheck: {},
  commonChipSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  commonChipPressed: {
    backgroundColor: GRAY[100],
  },
  commonChipSelectedPressed: {
    backgroundColor: '#bbf7d0',
  },
  commonChipDisabled: {
    opacity: 0.5,
  },
  commonChipName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  commonChipNameSelected: {
    color: '#15803d',
  },
  commonChipPurpose: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  commonChipPurposeSelected: {
    color: '#16a34a',
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  quickAddHint: {
    fontSize: typography.fontSize.xs,
    color: '#1d4ed8',
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
  medCard: {
    borderLeftWidth: 4,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  medHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    minWidth: 0,
  },
  medEmoji: {
    fontSize: 22,
  },
  medHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  medTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  criticalityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 2,
  },
  criticalityPillText: {
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
  timesDivider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginBottom: spacing[3],
  },
  timesHint: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[2],
  },
});

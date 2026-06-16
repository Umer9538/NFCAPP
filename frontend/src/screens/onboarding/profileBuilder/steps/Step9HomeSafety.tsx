import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { LIVING_SITUATION_OPTIONS, SPARE_KEY_OPTIONS } from '../enums';
import type { StepProps, ValidatorFn } from '../types';

const FOCUS_BLUE = '#2563eb';

/**
 * Mirrors web validateStep(9). All fields are optional, so the validator only
 * fires on malformed Canadian postal codes — kept lightweight here since the
 * web's per-field name/phone format checks would generate too many false
 * positives for international users.
 */
export const validateStep9: ValidatorFn = (data) => {
  const errs: string[] = [];
  if (data.homePostalCode.trim()) {
    const postal = data.homePostalCode.trim().toUpperCase();
    const canadianPostalRegex =
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
    if (!canadianPostalRegex.test(postal)) {
      errs.push('Please enter a valid Canadian postal code (e.g., M5V 2T6)');
    }
  }
  return errs.length ? errs : null;
};

interface InlineCheckboxProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function InlineCheckbox({ value, onChange, label }: InlineCheckboxProps) {
  return (
    <Pressable style={styles.checkboxRow} onPress={() => onChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

interface NotesFieldProps {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function NotesField({
  label,
  optional,
  value,
  onChange,
  placeholder,
  minHeight = 72,
}: NotesFieldProps) {
  return (
    <View>
      <Text style={styles.notesLabel}>
        {label}
        {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      </Text>
      <TextInput
        style={[styles.notesInput, { minHeight }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={GRAY[400]}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

export function Step9HomeSafety({ data, update }: StepProps) {
  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Home Safety Information Visibility"
        value={data.homeSafetyPublic}
        onChange={(v) => update('homeSafetyPublic', v)}
        publicDescription="Home access info (spare keys, neighbors) visible to responders"
        privateDescription="Home safety details will be hidden from emergency view"
      />

      <SelectField
        label="Living Situation"
        placeholder="Select Living Situation"
        value={data.livingSituation}
        options={LIVING_SITUATION_OPTIONS}
        onChange={(v) => update('livingSituation', v)}
      />

      {/* Emergency Access */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Emergency Access</Text>
        <Text style={styles.sectionSubtitle}>
          In case first responders need to enter your home
        </Text>

        <SelectField
          label="Spare Key Location"
          placeholder="Select Location"
          value={data.spareKeyLocation}
          options={SPARE_KEY_OPTIONS}
          onChange={(v) => update('spareKeyLocation', v)}
        />

        {data.spareKeyLocation === 'with_neighbor' && (
          <View style={[styles.conditionalBlock, styles.borderGray]}>
            <View style={styles.grid}>
              <View style={styles.col}>
                <IconInput
                  label="Neighbor Name"
                  optional
                  value={data.neighborName}
                  onChange={(v) => update('neighborName', v)}
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Neighbor Phone"
                  optional
                  icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                  value={data.neighborPhone}
                  onChange={(v) => update('neighborPhone', v)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        )}

        {data.spareKeyLocation === 'lockbox' && (
          <View style={[styles.conditionalBlock, styles.borderGray]}>
            <IconInput
              label="Lockbox Code"
              optional
              value={data.lockboxCode}
              onChange={(v) => update('lockboxCode', v)}
              placeholder="e.g., 1234"
            />
          </View>
        )}
      </View>

      {/* Pets */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <InlineCheckbox
          label="I have pets at home"
          value={data.hasPets}
          onChange={(v) => update('hasPets', v)}
        />

        {data.hasPets && (
          <View style={[styles.conditionalBlock, styles.borderGray]}>
            <NotesField
              label="Pet Details"
              optional
              value={data.petTypes}
              onChange={(v) => update('petTypes', v)}
              placeholder="e.g., Dog named Max, Cat named Whiskers"
            />
            <View style={styles.grid}>
              <View style={styles.col}>
                <IconInput
                  label="Pet Care Contact Name"
                  optional
                  value={data.petCareContactName}
                  onChange={(v) => update('petCareContactName', v)}
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Pet Care Contact Phone"
                  optional
                  icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                  value={data.petCareContactPhone}
                  onChange={(v) => update('petCareContactPhone', v)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <NotesField
              label="Pet Emergency Notes"
              optional
              value={data.petEmergencyNotes}
              onChange={(v) => update('petEmergencyNotes', v)}
              placeholder="e.g., Dog is friendly. Cat hides under bed."
            />
          </View>
        )}
      </View>

      {/* Daily Routine */}
      <NotesField
        label="Daily Routine / Wellness Checks"
        optional
        value={data.dailyRoutine}
        onChange={(v) => update('dailyRoutine', v)}
        placeholder="e.g., Meals on Wheels delivers lunch at noon. Daughter calls every evening at 7pm."
        minHeight={96}
      />
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
  section: { gap: spacing[3] },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginBottom: spacing[1],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
  },
  conditionalBlock: {
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    gap: spacing[3],
  },
  borderGray: { borderLeftColor: GRAY[200] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: spacing[3],
  },
  col: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 180,
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
    backgroundColor: SEMANTIC.surface.default,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: FOCUS_BLUE,
    backgroundColor: FOCUS_BLUE,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { BURIAL_OPTIONS, RESUSCITATION_OPTIONS } from '../enums';
import type { StepProps, ValidatorFn } from '../types';

const FOCUS_BLUE = '#2563eb';

/**
 * Mirrors web validateStep(10): when POA / legal-guardian checkboxes are on,
 * the associated name + phone become required. Resuscitation preference is
 * always required.
 */
export const validateStep10: ValidatorFn = (data) => {
  const errs: string[] = [];

  if (data.hasPOA) {
    if (!data.poaName.trim())
      errs.push('Power of Attorney name is required when POA is enabled');
    if (!data.poaPhone.trim())
      errs.push('Power of Attorney phone is required when POA is enabled');
  }
  if (!data.resuscitationPreference) {
    errs.push('Please select a resuscitation preference');
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
}

function NotesField({ label, optional, value, onChange, placeholder }: NotesFieldProps) {
  return (
    <View>
      <Text style={styles.notesLabel}>
        {label}
        {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      </Text>
      <TextInput
        style={styles.notesInput}
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

export function Step10Legal({ data, update, attemptedSubmit }: StepProps) {
  const resuscMissing = !!attemptedSubmit && !data.resuscitationPreference;

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Legal Directives Visibility"
        value={data.legalDirectivesPublic}
        onChange={(v) => update('legalDirectivesPublic', v)}
        publicDescription="DNR, POA, and living will info visible to first responders"
        privateDescription="Legal directives will be hidden from emergency view"
      />

      {/* Healthcare POA */}
      <View style={styles.section}>
        <InlineCheckbox
          label="I have a Healthcare Power of Attorney (POA)"
          value={data.hasPOA}
          onChange={(v) => update('hasPOA', v)}
        />
        {data.hasPOA && (
          <View style={[styles.conditionalBlock, styles.borderGray]}>
            <View style={styles.grid}>
              <View style={styles.col3}>
                <IconInput
                  label="POA Name"
                  required
                  value={data.poaName}
                  onChange={(v) => update('poaName', v)}
                  error={
                    attemptedSubmit && !data.poaName.trim()
                      ? 'POA name is required'
                      : undefined
                  }
                />
              </View>
              <View style={styles.col3}>
                <IconInput
                  label="POA Phone"
                  required
                  icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                  value={data.poaPhone}
                  onChange={(v) => update('poaPhone', v)}
                  keyboardType="phone-pad"
                  error={
                    attemptedSubmit && !data.poaPhone.trim()
                      ? 'POA phone is required'
                      : undefined
                  }
                />
              </View>
              <View style={styles.col3}>
                <IconInput
                  label="Relationship"
                  optional
                  value={data.poaRelationship}
                  onChange={(v) => update('poaRelationship', v)}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Living Will */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <InlineCheckbox
          label="I have a Living Will / Advanced Directives"
          value={data.hasLivingWill}
          onChange={(v) => update('hasLivingWill', v)}
        />
        {data.hasLivingWill && (
          <NotesField
            label="Living Will Preferences"
            optional
            value={data.livingWillPreferences}
            onChange={(v) => update('livingWillPreferences', v)}
            placeholder="Describe your preferences..."
          />
        )}
      </View>

      {/* Resuscitation */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <SelectField
          label="Resuscitation Preferences"
          required
          placeholder="Select Preference"
          value={data.resuscitationPreference}
          options={RESUSCITATION_OPTIONS}
          onChange={(v) => update('resuscitationPreference', v)}
          error={resuscMissing ? 'Please select a resuscitation preference' : undefined}
        />
      </View>

      {/* Religious / Cultural */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <View style={styles.grid}>
          <View style={styles.col}>
            <NotesField
              label="Religious Considerations"
              optional
              value={data.religiousConsiderations}
              onChange={(v) => update('religiousConsiderations', v)}
              placeholder="Any religious considerations for medical care..."
            />
          </View>
          <View style={styles.col}>
            <NotesField
              label="Cultural Considerations"
              optional
              value={data.culturalConsiderations}
              onChange={(v) => update('culturalConsiderations', v)}
              placeholder="Any cultural considerations for medical care..."
            />
          </View>
        </View>
      </View>

      {/* Burial */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <SelectField
          label="Burial Preference"
          optional
          placeholder="Select Preference"
          value={data.burialPreference}
          options={BURIAL_OPTIONS}
          onChange={(v) => update('burialPreference', v)}
        />
      </View>
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
  col3: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 140,
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
    minHeight: 72,
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

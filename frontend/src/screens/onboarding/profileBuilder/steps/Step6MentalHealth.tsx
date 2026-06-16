import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { RadioGroup } from '../components/RadioGroup';
import { AlertTriangleIcon, LockIcon } from '../components/LucideIcons';
import {
  ALCOHOL_USE_OPTIONS,
  HAS_CONDITIONS_OPTIONS,
  MH_CONDITION_OPTIONS,
  RECREATIONAL_DRUG_OPTIONS,
  SELF_HARM_RISK_OPTIONS,
  SUICIDE_RISK_OPTIONS,
  TOBACCO_USE_OPTIONS,
  TREATMENT_OPTIONS,
} from '../enums';
import { isUnder18 } from '../ageRules';
import type { StepProps, ValidatorFn } from '../types';

const FOCUS_BLUE = '#2563eb';

const PRIVACY_OPTIONS = [
  { value: 'only_me', label: 'Only me (completely private)' },
  { value: 'family_guardians', label: 'Family guardians only' },
  { value: 'first_responders', label: 'First responders in emergencies' },
  { value: 'everyone', label: 'Everyone (public on bracelet scan)' },
];

const wordCountOf = (s: string) =>
  s.trim() ? s.trim().split(/\s+/).length : 0;

/**
 * Mirrors web `validateStep(6)` in profile-setup/page.tsx: substance-use values
 * are blocked for under-18 users. All other fields are optional / soft.
 */
export const validateStep6: ValidatorFn = (data) => {
  const errs: string[] = [];
  // Note: age check happens inside the container's `validateAgeRules` too; the
  // duplication here keeps the per-step modal in sync with the web wording.
  return errs.length ? errs : null;
};

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
      <Text style={styles.wordCount}>
        {wordCountOf(value)} words (limit 100-300)
      </Text>
    </View>
  );
}

interface PrivacyCardProps {
  selected: boolean;
  label: string;
  onPress: () => void;
}

function PrivacyCard({ selected, label, onPress }: PrivacyCardProps) {
  return (
    <Pressable
      style={[styles.privacyCard, selected && styles.privacyCardSelected]}
      onPress={onPress}
    >
      <View style={[styles.outerCircle, selected && styles.outerCircleSelected]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.privacyCardLabel}>{label}</Text>
    </Pressable>
  );
}

interface InRecoveryCheckboxProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function InlineCheckbox({ value, onChange, label }: InRecoveryCheckboxProps) {
  return (
    <Pressable style={styles.checkboxRow} onPress={() => onChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value && <View style={styles.checkInner} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export function Step6MentalHealth({ data, update, age }: StepProps) {
  const showSubstance = !isUnder18(age);
  const showDetails = data.mentalHealthConditions === 'yes';
  const showCrisis =
    (data.suicideRisk && data.suicideRisk !== 'no') ||
    (data.selfHarmRisk && data.selfHarmRisk !== 'no');
  const privacy = data.mentalHealthPrivacy;

  return (
    <View style={styles.card}>
      {/* Privacy Note */}
      <View style={styles.privacyNote}>
        <LockIcon size={20} color="#9333ea" />
        <View style={styles.privacyNoteBody}>
          <Text style={styles.privacyNoteTitle}>Privacy Note</Text>
          <Text style={styles.privacyNoteText}>
            This information is private by default. You can choose who can see it at the bottom of this section.
          </Text>
        </View>
      </View>

      {/* Do you have any mental health conditions? */}
      <RadioGroup
        label="Do you have any mental health conditions?"
        options={HAS_CONDITIONS_OPTIONS}
        value={data.mentalHealthConditions}
        onChange={(v) => update('mentalHealthConditions', v)}
      />

      {/* Conditional details block when Yes */}
      {showDetails && (
        <View style={[styles.conditionalBlock, styles.borderPurple]}>
          <CheckboxGrid
            label="Mental Health Conditions (check all that apply)"
            options={MH_CONDITION_OPTIONS}
            value={data.conditionsMH}
            onChange={(next) => update('conditionsMH', next)}
            columns={3}
          />
          <IconInput
            label="Other conditions (specify)"
            optional
            value={data.otherConditionsMH}
            onChange={(v) => update('otherConditionsMH', v)}
            placeholder="e.g., BPD, Dissociative disorder"
          />
          <CheckboxGrid
            label="Current Treatment (check all that apply)"
            options={TREATMENT_OPTIONS}
            value={data.currentTreatment}
            onChange={(next) => update('currentTreatment', next)}
            columns={2}
          />
          <View style={styles.grid}>
            <View style={styles.col}>
              <IconInput
                label="Psychiatrist/Therapist Name"
                optional
                value={data.psychiatristName}
                onChange={(v) => update('psychiatristName', v)}
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="Psychiatrist/Therapist Phone"
                optional
                value={data.psychiatristPhone}
                onChange={(v) => update('psychiatristPhone', v)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Risk Assessment - orange tinted */}
          <View style={styles.riskBox}>
            <View style={styles.riskHeader}>
              <AlertTriangleIcon size={16} color="#9a3412" />
              <Text style={styles.riskTitle}>Risk Assessment (for first responders)</Text>
            </View>
            <View style={styles.grid}>
              <View style={styles.col}>
                <SelectField
                  label="Suicide Risk"
                  optional
                  placeholder="Select"
                  value={data.suicideRisk}
                  options={SUICIDE_RISK_OPTIONS}
                  onChange={(v) => update('suicideRisk', v)}
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="Self-Harm Risk"
                  optional
                  placeholder="Select"
                  value={data.selfHarmRisk}
                  options={SELF_HARM_RISK_OPTIONS}
                  onChange={(v) => update('selfHarmRisk', v)}
                />
              </View>
            </View>
            {showCrisis && (
              <View style={styles.crisisSubsection}>
                <Text style={styles.crisisHeader}>
                  Crisis contacts will be shown to first responders
                </Text>
                <View style={styles.grid}>
                  <View style={styles.col}>
                    <IconInput
                      label="Crisis Counselor Name"
                      optional
                      value={data.crisisCounselorName}
                      onChange={(v) => update('crisisCounselorName', v)}
                    />
                  </View>
                  <View style={styles.col}>
                    <IconInput
                      label="Crisis Counselor Phone"
                      optional
                      value={data.crisisCounselorPhone}
                      onChange={(v) => update('crisisCounselorPhone', v)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <IconInput
                  label="Preferred Crisis Line"
                  optional
                  value={data.crisisLine}
                  onChange={(v) => update('crisisLine', v)}
                  placeholder="e.g., 988 Suicide & Crisis Lifeline"
                />
              </View>
            )}
          </View>

          <NotesField
            label="Triggers / What makes symptoms worse"
            optional
            value={data.mentalTriggers}
            onChange={(v) => update('mentalTriggers', v)}
            placeholder="e.g., Loud noises trigger panic attacks, Crowded spaces cause anxiety"
          />
          <NotesField
            label="Calming Techniques"
            optional
            value={data.mentalCalmingTechniques}
            onChange={(v) => update('mentalCalmingTechniques', v)}
            placeholder="e.g., Deep breathing, Listening to music, Call my sister"
          />
        </View>
      )}

      {/* Substance Use - adults only */}
      {showSubstance && (
        <View style={styles.section}>
          <View style={styles.divider} />
          <Text style={styles.substanceTitle}>Substance Use</Text>
          <Text style={styles.substanceSubtitle}>
            Important for medication dosing and anesthesia
          </Text>
          <View style={styles.grid}>
            <View style={styles.col3}>
              <SelectField
                label="Alcohol Use"
                placeholder="Select"
                value={data.alcoholUse}
                options={ALCOHOL_USE_OPTIONS}
                onChange={(v) => update('alcoholUse', v)}
              />
              {data.alcoholUse === 'recovering' && (
                <View style={[styles.conditionalBlock, styles.borderPurple]}>
                  <InlineCheckbox
                    label="In recovery program (AA, etc.)"
                    value={data.inRecoveryProgram}
                    onChange={(v) => update('inRecoveryProgram', v)}
                  />
                  {data.inRecoveryProgram && (
                    <>
                      <IconInput
                        label="Sponsor Name"
                        optional
                        value={data.sponsorName}
                        onChange={(v) => update('sponsorName', v)}
                      />
                      <IconInput
                        label="Sponsor Phone"
                        optional
                        value={data.sponsorPhone}
                        onChange={(v) => update('sponsorPhone', v)}
                        keyboardType="phone-pad"
                      />
                    </>
                  )}
                </View>
              )}
            </View>
            <View style={styles.col3}>
              <SelectField
                label="Tobacco/Nicotine"
                placeholder="Select"
                value={data.tobaccoUse}
                options={TOBACCO_USE_OPTIONS}
                onChange={(v) => update('tobaccoUse', v)}
              />
              {data.tobaccoUse === 'cigarettes' && (
                <View style={[styles.conditionalBlock, styles.borderGray]}>
                  <IconInput
                    label="Cigarettes per day"
                    value={data.cigarettesPerDay}
                    onChange={(v) => update('cigarettesPerDay', v)}
                    keyboardType="numeric"
                    placeholder="e.g., 10"
                  />
                </View>
              )}
              {data.tobaccoUse === 'quit' && (
                <View style={[styles.conditionalBlock, styles.borderGreen]}>
                  <IconInput
                    label="Year quit"
                    value={data.quitYear}
                    onChange={(v) => update('quitYear', v)}
                    keyboardType="numeric"
                    placeholder="e.g., 2020"
                  />
                </View>
              )}
            </View>
            <View style={styles.col3}>
              <SelectField
                label="Recreational Drug Use"
                placeholder="Select"
                value={data.recreationalDrugUse}
                options={RECREATIONAL_DRUG_OPTIONS}
                onChange={(v) => update('recreationalDrugUse', v)}
              />
              {data.recreationalDrugUse === 'current' && (
                <View style={[styles.conditionalBlock, styles.borderOrange]}>
                  <IconInput
                    label="Current substances (for medical safety)"
                    value={data.currentDrugs}
                    onChange={(v) => update('currentDrugs', v)}
                    placeholder="e.g., Cannabis, stimulants"
                    maxLength={120}
                  />
                  <Text style={styles.warnOrangeText}>
                    Important: This info helps prevent dangerous drug interactions in emergencies.
                  </Text>
                  <Text style={styles.subtleText}>Max 20 words / 120 characters</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Privacy Settings */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <Text style={styles.privacyHeading}>
          Who can see this mental health information?
        </Text>
        <View style={styles.privacyList}>
          {PRIVACY_OPTIONS.map((opt) => (
            <PrivacyCard
              key={opt.value}
              selected={privacy === opt.value}
              label={opt.label}
              onPress={() => update('mentalHealthPrivacy', opt.value)}
            />
          ))}
        </View>

        {privacy === 'only_me' && (
          <View style={styles.explainGray}>
            <Text style={styles.explainGrayText}>
              <Text style={styles.bold}>Completely private: </Text>
              This information will NOT be shown when someone scans your bracelet. Only you can see it in your dashboard.
            </Text>
          </View>
        )}
        {privacy === 'family_guardians' && (
          <View style={styles.explainBlue}>
            <Text style={styles.explainBlueText}>
              <Text style={styles.bold}>Family only: </Text>
              Only people you've designated as family guardians/contacts can see this information. First responders will NOT see it during emergencies.
            </Text>
          </View>
        )}
        {privacy === 'first_responders' && (
          <View style={styles.explainGreen}>
            <Text style={styles.explainGreenText}>
              <Text style={styles.bold}>Recommended for safety: </Text>
              First responders can see this during emergencies to provide better care. General public will NOT see it when scanning your bracelet.
            </Text>
          </View>
        )}
        {privacy === 'everyone' && (
          <View style={styles.explainOrange}>
            <Text style={styles.explainOrangeText}>
              <Text style={styles.bold}>Fully public: </Text>
              Anyone who scans your bracelet can see this mental health information. Consider if this is necessary for your situation.
            </Text>
          </View>
        )}
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
  section: {
    gap: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginBottom: spacing[1],
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  privacyNoteBody: {
    flex: 1,
    gap: 4,
  },
  privacyNoteTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#6b21a8',
  },
  privacyNoteText: {
    fontSize: typography.fontSize.sm,
    color: '#7e22ce',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  conditionalBlock: {
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    gap: spacing[4],
    marginTop: spacing[1],
  },
  borderPurple: { borderLeftColor: '#e9d5ff' },
  borderGray: { borderLeftColor: GRAY[200] },
  borderGreen: { borderLeftColor: '#bbf7d0' },
  borderOrange: { borderLeftColor: '#fed7aa' },
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
    gap: spacing[3],
  },
  col3: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 160,
    gap: spacing[3],
  },
  riskBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  riskTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#9a3412',
  },
  crisisSubsection: {
    gap: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#fed7aa',
  },
  crisisHeader: {
    fontSize: typography.fontSize.sm,
    color: '#c2410c',
    fontWeight: typography.fontWeight.semibold,
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
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  substanceTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
  substanceSubtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
  checkInner: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
  warnOrangeText: {
    fontSize: typography.fontSize.xs,
    color: '#c2410c',
  },
  subtleText: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  privacyHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
  },
  privacyList: {
    gap: spacing[2],
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  privacyCardSelected: {
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircleSelected: {
    borderColor: FOCUS_BLUE,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FOCUS_BLUE,
  },
  privacyCardLabel: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  explainGray: {
    padding: spacing[3],
    backgroundColor: GRAY[50],
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: borderRadius.md,
  },
  explainGrayText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  explainBlue: {
    padding: spacing[3],
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: borderRadius.md,
  },
  explainBlueText: {
    fontSize: typography.fontSize.sm,
    color: '#1d4ed8',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  explainGreen: {
    padding: spacing[3],
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: borderRadius.md,
  },
  explainGreenText: {
    fontSize: typography.fontSize.sm,
    color: '#15803d',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  explainOrange: {
    padding: spacing[3],
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: borderRadius.md,
  },
  explainOrangeText: {
    fontSize: typography.fontSize.sm,
    color: '#c2410c',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  bold: { fontWeight: typography.fontWeight.bold },
});

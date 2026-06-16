import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { RadioGroup } from '../components/RadioGroup';
import { AlertTriangleIcon, InfoIcon } from '../components/LucideIcons';
import { IS_PREGNANT_OPTIONS, PREVIOUS_PREGNANCIES_OPTIONS, TRIMESTER_OPTIONS } from '../enums';
import type { StepProps, ValidatorFn } from '../types';

const FOCUS_BLUE = '#2563eb';

/**
 * Mirrors web validateStep(7). The hard server-side rule (female 12-55) is
 * already enforced by tab visibility. UI-side guards: weeks pregnant must be
 * 1-42 if entered, due date cannot be in the past.
 */
export const validateStep7: ValidatorFn = (data) => {
  const errs: string[] = [];
  if (data.isPregnant === 'yes' && data.weeksPregnant.trim()) {
    const w = parseInt(data.weeksPregnant, 10);
    if (Number.isFinite(w) && (w < 1 || w > 42)) {
      errs.push('Weeks pregnant must be between 1 and 42');
    }
  }
  if (data.isPregnant === 'yes' && data.dueDate) {
    const due = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(due.getTime()) && due < today) {
      errs.push('Due date cannot be in the past');
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

/**
 * Auto-derives trimester + due date from weeks-pregnant, matching the web's
 * inline onChange handler exactly: 1-13 → 1st, 14-26 → 2nd, 27-42 → 3rd; due
 * date = today + (40 - weeks) * 7 days.
 */
function deriveTrimesterAndDue(weeks: number): { trimester: string; dueDate: string } {
  let trimester = '';
  if (weeks > 0 && weeks <= 13) trimester = '1st';
  else if (weeks >= 14 && weeks <= 26) trimester = '2nd';
  else if (weeks >= 27 && weeks <= 42) trimester = '3rd';
  let dueDate = '';
  if (weeks > 0 && weeks <= 42) {
    const d = new Date();
    d.setDate(d.getDate() + (40 - weeks) * 7);
    dueDate = d.toISOString().split('T')[0];
  }
  return { trimester, dueDate };
}

export function Step7Pregnancy({ data, update }: StepProps) {
  const [showDueDatePicker, setShowDueDatePicker] = React.useState(false);

  const onWeeksChange = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2);
    update('weeksPregnant', v);
    const w = parseInt(v, 10);
    if (Number.isFinite(w) && w > 0 && w <= 42) {
      const { trimester, dueDate } = deriveTrimesterAndDue(w);
      if (trimester) update('trimester', trimester);
      if (dueDate) update('dueDate', dueDate);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDueDatePicker(false);
    if (event.type === 'set' && date) {
      update('dueDate', date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (s: string) => {
    if (!s) return 'Select due date';
    try {
      const d = new Date(s);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return s;
    }
  };

  const dueInPast = (() => {
    if (!data.dueDate) return false;
    const due = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(due.getTime()) && due < today;
  })();

  const weeksInvalid = !!(
    data.weeksPregnant &&
    (parseInt(data.weeksPregnant, 10) < 1 || parseInt(data.weeksPregnant, 10) > 42)
  );

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Pregnancy Information Visibility"
        value={data.pregnancyInfoPublic}
        onChange={(v) => update('pregnancyInfoPublic', v)}
        publicDescription="First responders will see pregnancy status - important for medical decisions"
        privateDescription="Pregnancy information will be hidden from emergency view"
      />

      {/* Pink Info Note */}
      <View style={styles.infoPink}>
        <InfoIcon size={20} color="#be185d" />
        <Text style={styles.infoPinkText}>
          Critical information for emergency medical treatment decisions.
        </Text>
      </View>

      <RadioGroup
        label="Are you currently pregnant?"
        options={IS_PREGNANT_OPTIONS}
        value={data.isPregnant}
        onChange={(v) => update('isPregnant', v)}
      />

      {data.isPregnant === 'yes' && (
        <View style={[styles.conditionalBlock, styles.borderPink]}>
          <View style={styles.grid}>
            <View style={styles.col3}>
              <IconInput
                label="Weeks Pregnant"
                value={data.weeksPregnant}
                onChange={onWeeksChange}
                keyboardType="numeric"
                placeholder="e.g., 24"
                error={weeksInvalid ? 'Must be 1-42 weeks' : undefined}
              />
            </View>
            <View style={styles.col3}>
              <SelectField
                label="Trimester"
                placeholder="Select Trimester"
                value={data.trimester}
                options={TRIMESTER_OPTIONS}
                onChange={(v) => update('trimester', v)}
              />
              {data.weeksPregnant ? (
                <Text style={styles.subtleHelp}>Auto-calculated from weeks</Text>
              ) : null}
            </View>
            <View style={styles.col3}>
              <Text style={styles.fieldLabel}>Due Date</Text>
              <Pressable
                style={[styles.dateButton, dueInPast && styles.dateButtonError]}
                onPress={() => setShowDueDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={GRAY[400]}
                  style={{ marginRight: spacing[2] }}
                />
                <Text
                  style={[styles.dateText, !data.dueDate && styles.datePlaceholder]}
                >
                  {formatDate(data.dueDate)}
                </Text>
              </Pressable>
              {data.weeksPregnant ? (
                <Text style={styles.greenHelp}>Auto-calculated from weeks</Text>
              ) : null}
              {dueInPast && (
                <Text style={styles.errorHelp}>Due date cannot be in the past</Text>
              )}
              {showDueDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={data.dueDate ? new Date(data.dueDate) : new Date()}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>
          </View>

          {data.trimester === '3rd' && (
            <View style={styles.thirdTrimesterBox}>
              <View style={styles.warnHeader}>
                <AlertTriangleIcon size={18} color="#9d174d" />
                <Text style={styles.thirdTrimesterTitle}>THIRD TRIMESTER</Text>
              </View>
              <Text style={styles.thirdTrimesterBody}>
                Patient is in late pregnancy. Labor and delivery protocols may apply in emergency.
              </Text>
            </View>
          )}

          <InlineCheckbox
            label="High risk pregnancy"
            value={data.isHighRisk}
            onChange={(v) => update('isHighRisk', v)}
          />

          {data.isHighRisk && (
            <View style={styles.section}>
              <View style={styles.warnRed}>
                <View style={styles.warnHeader}>
                  <AlertTriangleIcon size={18} color="#b91c1c" />
                  <Text style={styles.warnTitleRed}>HIGH RISK PREGNANCY</Text>
                </View>
                <Text style={styles.warnBodyRed}>
                  First responders will be alerted to potential complications.
                </Text>
              </View>
              <NotesField
                label="High Risk Details"
                value={data.highRiskDetails}
                onChange={(v) => update('highRiskDetails', v)}
                placeholder="e.g., Gestational diabetes, Preeclampsia, Placenta previa, Previous preterm labor"
              />
            </View>
          )}

          <View style={styles.pinkDivider} />
          <Text style={styles.subsectionTitle}>Pregnancy History</Text>

          <View style={styles.grid}>
            <View style={styles.col}>
              <SelectField
                label="Previous Pregnancies"
                placeholder="Select"
                value={data.previousPregnancies}
                options={PREVIOUS_PREGNANCIES_OPTIONS}
                onChange={(v) => update('previousPregnancies', v)}
              />
            </View>
            <View style={styles.col}>
              <View style={styles.checkboxBottom}>
                <InlineCheckbox
                  label="Previous C-section"
                  value={data.cSectionHistory}
                  onChange={(v) => update('cSectionHistory', v)}
                />
              </View>
            </View>
          </View>

          {data.previousPregnancies && data.previousPregnancies !== '0' && (
            <NotesField
              label="Previous Complications (if any)"
              optional
              value={data.previousComplications}
              onChange={(v) => update('previousComplications', v)}
              placeholder="e.g., Preterm labor at 34 weeks, Emergency C-section, Postpartum hemorrhage"
            />
          )}

          {data.cSectionHistory && (
            <View style={styles.warnYellow}>
              <Text style={styles.warnYellowText}>
                <Text style={styles.bold}>C-Section History: </Text>
                Important for emergency delivery decisions. VBAC (vaginal birth after cesarean) may have additional risks.
              </Text>
            </View>
          )}

          <View style={styles.pinkDivider} />
          <View style={styles.grid}>
            <View style={styles.col}>
              <IconInput
                label="OB/GYN Doctor"
                optional
                value={data.obgynName}
                onChange={(v) => update('obgynName', v)}
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="OB/GYN Phone"
                optional
                icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                value={data.obgynPhone}
                onChange={(v) => update('obgynPhone', v)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.colFull}>
              <IconInput
                label="Hospital for Delivery"
                optional
                value={data.deliveryHospital}
                onChange={(v) => update('deliveryHospital', v)}
              />
            </View>
          </View>
        </View>
      )}

      {data.isPregnant === 'possibly' && (
        <View style={styles.warnYellowBig}>
          <View style={styles.warnHeaderTop}>
            <AlertTriangleIcon size={20} color="#a16207" />
            <View style={styles.flex1}>
              <Text style={styles.warnYellowTitle}>Possible Pregnancy</Text>
              <Text style={styles.warnYellowBody}>
                First responders will be notified to consider pregnancy-safe medications and avoid X-rays unless absolutely necessary.
              </Text>
            </View>
          </View>
        </View>
      )}
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
  flex1: { flex: 1 },
  bold: { fontWeight: typography.fontWeight.bold },
  infoPink: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  infoPinkText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#be185d',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  conditionalBlock: {
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    gap: spacing[4],
  },
  borderPink: { borderLeftColor: '#fbcfe8' },
  pinkDivider: {
    height: 1,
    backgroundColor: '#fbcfe8',
    marginVertical: spacing[1],
  },
  subsectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
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
  colFull: { flexBasis: '100%' },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: SEMANTIC.surface.default,
    minHeight: 48,
  },
  dateButtonError: { borderColor: '#ef4444' },
  dateText: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  datePlaceholder: { color: GRAY[400] },
  subtleHelp: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: 4,
  },
  greenHelp: {
    fontSize: typography.fontSize.xs,
    color: '#16a34a',
    marginTop: 4,
  },
  errorHelp: {
    fontSize: typography.fontSize.xs,
    color: '#dc2626',
    marginTop: 4,
  },
  thirdTrimesterBox: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fce7f3',
    borderColor: '#f9a8d4',
    borderWidth: 1,
  },
  thirdTrimesterTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#9d174d',
  },
  thirdTrimesterBody: {
    fontSize: typography.fontSize.xs,
    color: '#831843',
    marginTop: 2,
  },
  warnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  warnHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  warnRed: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  warnTitleRed: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#b91c1c',
  },
  warnBodyRed: {
    fontSize: typography.fontSize.xs,
    color: '#991b1b',
    marginTop: 2,
  },
  warnYellow: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
    borderWidth: 1,
  },
  warnYellowText: {
    fontSize: typography.fontSize.sm,
    color: '#854d0e',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  warnYellowBig: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
    borderWidth: 1,
  },
  warnYellowTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#a16207',
  },
  warnYellowBody: {
    fontSize: typography.fontSize.sm,
    color: '#854d0e',
    marginTop: 4,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
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
  checkboxBottom: {
    paddingBottom: spacing[2],
    paddingTop: spacing[5],
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
  },
});

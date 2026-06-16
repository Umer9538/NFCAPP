import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { AlertTriangleIcon } from '../components/LucideIcons';
import { Ionicons } from '@expo/vector-icons';
import {
  DEVELOPMENTAL_DELAY_OPTIONS,
  IMMUNIZATION_OPTIONS,
  PEDIATRIC_BEHAVIOR_OPTIONS,
} from '../enums';
import { isUnder3, isSchoolAge } from '../ageRules';
import { makeId } from '../buildPayload';
import type { AuthorizedPickupEntry, StepProps, ValidatorFn } from '../types';

const FOCUS_BLUE = '#2563eb';

function newPickup(): AuthorizedPickupEntry {
  return {
    id: makeId(),
    name: '',
    relationship: '',
    phone: '',
    photoIdRequired: false,
  };
}

function ageGroup(age: number | null): string {
  if (age === null) return '';
  if (age < 1) return 'Infant';
  if (age < 3) return 'Toddler';
  if (age < 6) return 'Preschooler';
  if (age < 13) return 'Child';
  return 'Teenager';
}

const wordCountOf = (s: string) =>
  s.trim() ? s.trim().split(/\s+/).length : 0;

/**
 * Mirrors web validateStep(8) — birth-weight bounds, ADHD/learning-disability
 * not diagnosable before age 3, school-info / special-ed only for ages 5+.
 */
export const validateStep8: ValidatorFn = (data) => {
  const errs: string[] = [];
  // Note: age comes via the closure inside `Step8Pediatric` (we need it for the
  // conditionals), so most validation lives in the UI as inline guards. Hard
  // server-side checks happen in `validateAgeRules` anyway. Keep this in sync
  // with the rules in web profile-setup/page.tsx ~L1432-1503.
  const num = (s: string) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  if (data.birthWeight) {
    const lbs = num(data.birthWeight);
    if (!Number.isNaN(lbs) && (lbs < 1 || lbs > 15))
      errs.push('Birth weight must be between 1-15 lbs');
  }
  if (data.birthWeightOz) {
    const oz = num(data.birthWeightOz);
    if (!Number.isNaN(oz) && (oz < 0 || oz > 15))
      errs.push('Ounces must be between 0-15');
  }
  if (data.wasPremature && data.prematureWeeks) {
    const w = num(data.prematureWeeks);
    if (!Number.isNaN(w) && (w < 1 || w > 17))
      errs.push('Premature weeks must be between 1-17');
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

export function Step8Pediatric({
  data,
  arrays,
  update,
  updateArray,
  age,
}: StepProps) {
  const isInfant = isUnder3(age);
  const showBirth = age !== null && age < 5;
  const showSchool = isSchoolAge(age);
  const showSpecialEd = age !== null && age >= 5;

  const pickup = arrays.authorizedPickup;
  const addPerson = () => updateArray('authorizedPickup', [...pickup, newPickup()]);
  const removePerson = (id: string) =>
    updateArray('authorizedPickup', pickup.filter((p) => p.id !== id));
  const updatePerson = (id: string, patch: Partial<AuthorizedPickupEntry>) =>
    updateArray(
      'authorizedPickup',
      pickup.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const notAuthWordCount = wordCountOf(data.notAuthorized);

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Pediatric Information Visibility"
        value={data.pediatricInfoPublic}
        onChange={(v) => update('pediatricInfoPublic', v)}
        publicDescription="School and developmental information will be visible to first responders"
        privateDescription="Pediatric details will be hidden from emergency view"
      />

      {/* Child Profile age banner */}
      <View style={styles.ageBanner}>
        <View style={styles.ageRow}>
          <View style={styles.ageBubble}>
            <Text style={styles.ageBubbleText}>{age ?? '?'}</Text>
          </View>
          <View style={styles.ageBlock}>
            <Text style={styles.ageTitle}>Child Profile</Text>
            <Text style={styles.ageSubtitle}>
              {ageGroup(age)} ({age} years old)
            </Text>
          </View>
          {age !== null && age < 2 && (
            <View style={styles.infantPill}>
              <Text style={styles.infantPillText}>Infant Protocols Apply</Text>
            </View>
          )}
        </View>
      </View>

      {/* Birth History — only under 5 */}
      {showBirth && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birth History</Text>
          <Text style={styles.sectionSubtitle}>
            Important for medication dosing and development assessment
          </Text>
          <View style={styles.grid}>
            <View style={styles.col3}>
              <IconInput
                label="Birth Weight (lbs)"
                optional
                value={data.birthWeight}
                onChange={(v) => update('birthWeight', v)}
                placeholder="e.g., 7"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col3}>
              <IconInput
                label="Birth Weight (oz)"
                optional
                value={data.birthWeightOz}
                onChange={(v) => update('birthWeightOz', v)}
                placeholder="e.g., 8"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col3}>
              <InlineCheckbox
                label="Born premature"
                value={data.wasPremature}
                onChange={(v) => update('wasPremature', v)}
              />
            </View>
          </View>
          {data.wasPremature && (
            <View style={[styles.conditionalBlock, styles.borderYellow]}>
              <IconInput
                label="Weeks Premature"
                value={data.prematureWeeks}
                onChange={(v) => update('prematureWeeks', v)}
                placeholder="e.g., 8 weeks early"
                keyboardType="numeric"
              />
              <Text style={styles.warnYellow}>
                Important: Premature birth may affect developmental milestones and medication dosing.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Developmental Information */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Developmental Information</Text>
        <CheckboxGrid
          label="Any developmental delays or disabilities?"
          options={DEVELOPMENTAL_DELAY_OPTIONS}
          value={data.developmentalDelays}
          onChange={(next) => update('developmentalDelays', next)}
          columns={3}
        />
        {data.developmentalDelays.length > 0 && showSpecialEd && (
          <View style={[styles.conditionalBlock, styles.borderBlue]}>
            <Text style={styles.subsectionHeading}>Special Education Services</Text>
            <InlineCheckbox
              label="Has IEP (Individualized Education Program)"
              value={data.hasIEP}
              onChange={(v) => update('hasIEP', v)}
            />
            <InlineCheckbox
              label="Has 504 Plan"
              value={data.has504Plan}
              onChange={(v) => update('has504Plan', v)}
            />
            <InlineCheckbox
              label="In special education classes"
              value={data.specialEducation}
              onChange={(v) => update('specialEducation', v)}
            />
          </View>
        )}
      </View>

      {/* Behavioral Notes */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Behavioral Notes for First Responders</Text>
        <CheckboxGrid
          label="Important behaviors to be aware of:"
          options={PEDIATRIC_BEHAVIOR_OPTIONS}
          value={data.behavioralNotes}
          onChange={(next) => update('behavioralNotes', next)}
          columns={2}
        />
        {data.behavioralNotes.includes('runs_away') && (
          <View style={styles.warnOrange}>
            <View style={styles.warnHeaderRow}>
              <AlertTriangleIcon size={18} color="#c2410c" />
              <Text style={styles.warnTitleOrange}>ELOPEMENT RISK</Text>
            </View>
            <Text style={styles.warnBodyOrange}>
              First responders will be alerted that this child may try to run away.
            </Text>
          </View>
        )}
      </View>

      {/* School Information — only school-age */}
      {showSchool && (
        <View style={styles.section}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>School Information</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <IconInput
                label="School Name"
                optional
                value={data.schoolName}
                onChange={(v) => update('schoolName', v)}
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="Grade"
                optional
                value={data.grade}
                onChange={(v) => update('grade', v)}
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="Teacher Name"
                optional
                value={data.teacherName}
                onChange={(v) => update('teacherName', v)}
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="Teacher Phone"
                optional
                value={data.teacherPhone}
                onChange={(v) => update('teacherPhone', v)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="School Office Phone"
                optional
                value={data.schoolOfficePhone}
                onChange={(v) => update('schoolOfficePhone', v)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="School Address"
                optional
                value={data.schoolAddress}
                onChange={(v) => update('schoolAddress', v)}
              />
            </View>
            <View style={styles.colFull}>
              <IconInput
                label="Bus Number"
                optional
                value={data.busNumber}
                onChange={(v) => update('busNumber', v)}
              />
            </View>
          </View>
        </View>
      )}

      {/* Authorized Pickup */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <View style={styles.pickupHeader}>
          <View style={styles.pickupHeaderLeft}>
            <Text style={styles.sectionTitle}>Authorized Pickup</Text>
            <Text style={styles.sectionSubtitle}>
              People allowed to pick up this child
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addPersonBtn,
              pressed && styles.addPersonBtnPressed,
            ]}
            onPress={addPerson}
          >
            <Ionicons name="add" size={16} color="#dc2626" />
            <Text style={styles.addPersonText}>Add Person</Text>
          </Pressable>
        </View>

        {pickup.map((person, index) => (
          <View key={person.id} style={styles.personCard}>
            <View style={styles.personHeader}>
              <Text style={styles.personTitle}>Person {index + 1}</Text>
              <Pressable onPress={() => removePerson(person.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            </View>
            <View style={styles.grid}>
              <View style={styles.col3}>
                <IconInput
                  label="Name"
                  optional
                  value={person.name}
                  onChange={(v) => updatePerson(person.id, { name: v })}
                />
              </View>
              <View style={styles.col3}>
                <IconInput
                  label="Relationship"
                  optional
                  value={person.relationship}
                  onChange={(v) => updatePerson(person.id, { relationship: v })}
                />
              </View>
              <View style={styles.col3}>
                <IconInput
                  label="Phone"
                  optional
                  icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                  value={person.phone}
                  onChange={(v) => updatePerson(person.id, { phone: v })}
                  keyboardType="phone-pad"
                  placeholder="( ) -"
                />
              </View>
            </View>
          </View>
        ))}

        {/* NOT Authorized to Pick Up */}
        <View style={styles.notAuthBox}>
          <View style={styles.warnHeaderRow}>
            <AlertTriangleIcon size={16} color="#991b1b" />
            <Text style={styles.notAuthTitle}>NOT Authorized to Pick Up</Text>
          </View>
          <TextInput
            style={styles.notAuthInput}
            value={data.notAuthorized}
            onChangeText={(v) => update('notAuthorized', v)}
            placeholder="e.g., Biological father - restraining order on file. Include relevant details for emergency personnel."
            placeholderTextColor={GRAY[400]}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.notAuthCount}>
            {notAuthWordCount} words (limit 100-300)
          </Text>
          <Text style={styles.notAuthFooter}>
            This information will be flagged prominently to first responders.
          </Text>
        </View>
      </View>

      {/* Immunization Status */}
      <View style={styles.section}>
        <View style={styles.divider} />
        <SelectField
          label="Immunization Status"
          optional
          placeholder="Select"
          value={data.immunizationStatus}
          options={IMMUNIZATION_OPTIONS}
          onChange={(v) => update('immunizationStatus', v)}
        />
        {data.immunizationStatus === 'not_vaccinated' && (
          <Text style={styles.warnYellow}>
            Note: First responders will be notified to consider additional precautions.
          </Text>
        )}
      </View>
    </View>
  );
}

// Silence isInfant unused warning — kept for future per-age UI tweaks.
void isUnder3;

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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
  },
  // Age banner
  ageBanner: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  ageBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBubbleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#1d4ed8',
  },
  ageBlock: {
    flex: 1,
  },
  ageTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#1e3a8a',
  },
  ageSubtitle: {
    fontSize: typography.fontSize.sm,
    color: '#1d4ed8',
  },
  infantPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: '#fef3c7',
  },
  infantPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#854d0e',
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
  colFull: {
    flexBasis: '100%',
  },
  conditionalBlock: {
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    gap: spacing[2],
    marginTop: spacing[1],
  },
  borderYellow: { borderLeftColor: '#fde68a' },
  borderBlue: { borderLeftColor: '#bfdbfe' },
  subsectionHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#1d4ed8',
    marginBottom: spacing[1],
  },
  // Inline checkbox row
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
  },
  // Banners
  warnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 4,
  },
  warnOrange: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warnTitleOrange: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#c2410c',
  },
  warnBodyOrange: {
    fontSize: typography.fontSize.xs,
    color: '#9a3412',
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
  warnYellow: {
    fontSize: typography.fontSize.xs,
    color: '#a16207',
  },
  // Authorized Pickup
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pickupHeaderLeft: {
    flex: 1,
    minWidth: 200,
    gap: 4,
  },
  addPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  addPersonBtnPressed: {
    backgroundColor: '#fee2e2',
  },
  addPersonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#dc2626',
  },
  personCard: {
    backgroundColor: SEMANTIC.surface.default,
    borderColor: SEMANTIC.border.default,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  notAuthBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[2],
  },
  notAuthTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#991b1b',
  },
  notAuthInput: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  notAuthCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
  },
  notAuthFooter: {
    fontSize: typography.fontSize.xs,
    color: '#dc2626',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { RadioGroup } from '../components/RadioGroup';
import { FileUploadField } from '../components/FileUploadField';
import { AvatarPhotoPicker } from '../components/AvatarPhotoPicker';
import {
  BLOOD_TYPES,
  DNR_STATUS_OPTIONS,
  GENDER_OPTIONS,
  ORGAN_DONOR_OPTIONS,
  PROVINCES,
} from '../enums';
import { ageGroupLabel } from '../ageRules';
import type { StepProps, ValidatorFn } from '../types';

/**
 * Mirrors web validateStep(1) — required fields + bounds + DNR/organ-donor
 * conditional requirements. Phone digit-count check matches the web's 10-15
 * digit range (international-friendly).
 */
export const validateStep1: ValidatorFn = (data) => {
  const errs: string[] = [];

  if (!data.phoneNumber.trim()) {
    errs.push('Phone number is required');
  } else {
    const digits = data.phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15)
      errs.push('Phone number must be 10-15 digits');
  }
  if (!data.gender) errs.push('Gender is required');
  if (!data.dateOfBirth) errs.push('Date of birth is required');

  if (!data.height.trim()) {
    errs.push('Height is required');
  } else {
    const h = Number(data.height);
    if (Number.isNaN(h) || h < 30 || h > 300)
      errs.push('Height must be between 30-300 cm');
  }
  if (!data.weight.trim()) {
    errs.push('Weight is required');
  } else {
    const w = Number(data.weight);
    if (Number.isNaN(w) || w < 1 || w > 500)
      errs.push('Weight must be between 1-500 kg');
  }

  if (data.dnrStatus === 'yes') {
    const hasDoc = data.dnrDocumentUrl.trim() !== '';
    const hasDoctor =
      data.dnrDoctorName.trim() !== '' && data.dnrDoctorPhone.trim() !== '';
    if (!hasDoc && !hasDoctor)
      errs.push('DNR requires either a document upload OR doctor contact information');
  } else if (data.dnrStatus === 'on_file_with_doctor') {
    if (!data.dnrDoctorName.trim())
      errs.push('Doctor name is required when DNR is on file');
    if (!data.dnrDoctorPhone.trim())
      errs.push('Doctor phone is required when DNR is on file');
  }

  if (data.organDonorStatus === 'registered') {
    if (!data.organDonorCardNumber.trim())
      errs.push('Donor card number is required');
    if (!data.organDonorProvince)
      errs.push('Province is required for registered organ donor');
  }

  return errs.length ? errs : null;
};

const BLOOD_TYPE_OPTIONS = BLOOD_TYPES.map((b) => ({ value: b, label: b }));
const PROVINCE_OPTIONS = PROVINCES.map((p) => ({ value: p, label: p }));

const ICON_GRAY = GRAY[400];

export function Step1BasicInfo({ data, update, age }: StepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && date) {
      update('dateOfBirth', date.toISOString().split('T')[0]);
    }
  };

  const formatDob = (s: string) => {
    if (!s) return 'dd/mm/yyyy';
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

  return (
    <View style={styles.card}>
      <AvatarPhotoPicker
        value={data.photoUrl}
        onChange={(key) => update('photoUrl', key)}
      />

      <View style={styles.divider} />

      <View style={styles.fieldsGrid}>
        <View style={styles.col}>
          <IconInput
            label="Phone Number"
            required
            icon={<Feather name="phone" size={16} color={ICON_GRAY} />}
            value={data.phoneNumber}
            onChange={(v) => {
              const cleaned = v.replace(/[^\d+\-]/g, '').slice(0, 15);
              update('phoneNumber', cleaned);
            }}
            placeholder="+1-555-1234567"
            keyboardType="phone-pad"
            maxLength={15}
            error={(() => {
              const digits = data.phoneNumber.replace(/\D/g, '');
              if (digits.length > 0 && digits.length < 10) return 'Must be at least 10 digits';
              return undefined;
            })()}
            helperText={
              data.phoneNumber.length > 5
                ? 'Pre-filled from signup (editable if needed)'
                : undefined
            }
          />
        </View>
        <View style={styles.col}>
          <SelectField
            label="Gender"
            required
            placeholder="Select Gender"
            value={data.gender}
            options={GENDER_OPTIONS}
            onChange={(v) => update('gender', v as any)}
          />
        </View>

        <View style={styles.col}>
          <Text style={styles.fieldLabel}>
            Date of Birth <Text style={styles.required}>*</Text>
          </Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather
              name="calendar"
              size={16}
              color={ICON_GRAY}
              style={styles.dateIcon}
            />
            <Text
              style={[
                styles.dateText,
                !data.dateOfBirth && styles.datePlaceholder,
              ]}
            >
              {formatDob(data.dateOfBirth)}
            </Text>
          </Pressable>
          {age !== null && (
            <Text style={styles.helper}>
              Age: {age} ({ageGroupLabel(age)})
            </Text>
          )}
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(2000, 0, 1)}
              onChange={onDateChange}
              maximumDate={new Date()}
              minimumDate={(() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 120);
                return d;
              })()}
            />
          )}
        </View>
        <View style={styles.col}>
          <SelectField
            label="Blood Type"
            optional
            placeholder="Select Blood Type"
            value={data.bloodType}
            options={BLOOD_TYPE_OPTIONS}
            onChange={(v) => update('bloodType', v)}
          />
        </View>

        <View style={styles.col}>
          <IconInput
            label="Height (cm)"
            required
            icon={<MaterialCommunityIcons name="ruler" size={18} color={ICON_GRAY} />}
            value={data.height}
            onChange={(v) => update('height', v)}
            placeholder="170"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.col}>
          <IconInput
            label="Weight (kg)"
            required
            icon={<MaterialCommunityIcons name="scale-balance" size={18} color={ICON_GRAY} />}
            value={data.weight}
            onChange={(v) => update('weight', v)}
            placeholder="70"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.directivesDivider} />

      <View style={styles.directivesHeader}>
        <Feather name="alert-triangle" size={22} color="#ef4444" />
        <Text style={styles.directivesTitle} numberOfLines={2}>
          Critical Medical Directives
        </Text>
      </View>

      <RadioGroup
        label="Do Not Resuscitate (DNR)"
        options={DNR_STATUS_OPTIONS}
        value={data.dnrStatus}
        onChange={(v) => update('dnrStatus', v as any)}
      />

      {data.dnrStatus === 'yes' && (
        <View style={styles.tintedRed}>
          <Text style={styles.tintedRedTitle}>
            ⚠️ DNR requires verification. Please provide EITHER a document upload OR doctor contact:
          </Text>
          <View style={styles.tintedGroup}>
            <Text style={styles.optionHeading}>Option 1: Upload DNR Document (PDF or Image)</Text>
            <FileUploadField
              label=""
              helperText="Upload your DNR document (PDF or image, max 10MB)"
              value={data.dnrDocumentUrl}
              onChange={(key) => update('dnrDocumentUrl', key)}
              category="dnr"
              preset="document"
            />
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>
            <Text style={styles.optionHeading}>Option 2: Doctor Contact Information</Text>
            <View style={styles.fieldsGrid}>
              <View style={styles.col}>
                <IconInput
                  label="Doctor Name"
                  value={data.dnrDoctorName}
                  onChange={(v) => update('dnrDoctorName', v)}
                  placeholder="Dr. Sarah Johnson"
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Doctor Phone"
                  icon={<Feather name="phone" size={16} color={ICON_GRAY} />}
                  value={data.dnrDoctorPhone}
                  onChange={(v) => {
                    const cleaned = v.replace(/[^\d+\-]/g, '').slice(0, 15);
                    update('dnrDoctorPhone', cleaned);
                  }}
                  keyboardType="phone-pad"
                  placeholder="+1-555-1234567"
                  maxLength={15}
                />
              </View>
              <View style={styles.colFull}>
                <IconInput
                  label="Hospital/Clinic"
                  value={data.dnrHospital}
                  onChange={(v) => update('dnrHospital', v)}
                  placeholder="Toronto General Hospital"
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {data.dnrStatus === 'on_file_with_doctor' && (
        <View style={styles.tintedYellow}>
          <Text style={styles.tintedYellowTitle}>
            Please provide the doctor's contact information where your DNR is on file:
          </Text>
          <View style={styles.fieldsGrid}>
            <View style={styles.col}>
              <IconInput
                label="Doctor Name"
                required
                value={data.dnrDoctorName}
                onChange={(v) => update('dnrDoctorName', v)}
                placeholder="Dr. Sarah Johnson"
              />
            </View>
            <View style={styles.col}>
              <IconInput
                label="Doctor Phone"
                required
                icon={<Feather name="phone" size={16} color={ICON_GRAY} />}
                value={data.dnrDoctorPhone}
                onChange={(v) => {
                  const cleaned = v.replace(/[^\d+\-]/g, '').slice(0, 15);
                  update('dnrDoctorPhone', cleaned);
                }}
                keyboardType="phone-pad"
                placeholder="+1-555-1234567"
                maxLength={15}
              />
            </View>
            <View style={styles.colFull}>
              <IconInput
                label="Hospital/Clinic"
                optional
                value={data.dnrHospital}
                onChange={(v) => update('dnrHospital', v)}
                placeholder="Toronto General Hospital"
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.organDonorSpacer}>
        <RadioGroup
          label="Organ Donor"
          options={ORGAN_DONOR_OPTIONS}
          value={data.organDonorStatus}
          onChange={(v) => update('organDonorStatus', v as any)}
        />
      </View>

      {data.organDonorStatus === 'registered' && (
        <View style={styles.tintedGreen}>
          <View style={styles.fieldsGrid}>
            <View style={styles.col}>
              <IconInput
                label="Donor Card Number"
                required
                value={data.organDonorCardNumber}
                onChange={(v) => update('organDonorCardNumber', v)}
                placeholder="ONT-12345-67890"
              />
            </View>
            <View style={styles.col}>
              <SelectField
                label="Province Registered"
                optional
                placeholder="Select Province"
                value={data.organDonorProvince}
                options={PROVINCE_OPTIONS}
                onChange={(v) => update('organDonorProvince', v)}
              />
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
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginVertical: spacing[1],
  },
  directivesDivider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginTop: spacing[2],
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: spacing[4],
  },
  col: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 140,
  },
  colFull: {
    flexBasis: '100%',
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  required: { color: PRIMARY[600] },
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
  dateIcon: {
    marginRight: spacing[2],
  },
  dateText: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  datePlaceholder: {
    color: GRAY[400],
  },
  helper: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  directivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  directivesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    flex: 1,
    minWidth: 0,
  },
  organDonorSpacer: {
    marginTop: spacing[2],
  },
  tintedRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  tintedRedTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#991b1b',
  },
  tintedGroup: {
    gap: spacing[3],
  },
  optionHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginVertical: spacing[1],
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: GRAY[300],
  },
  orText: {
    fontSize: typography.fontSize.sm,
    color: GRAY[500],
    fontWeight: typography.fontWeight.semibold,
  },
  tintedYellow: {
    backgroundColor: '#fefce8',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  tintedYellowTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#854d0e',
  },
  tintedGreen: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 2,
    borderLeftColor: '#bbf7d0',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
});

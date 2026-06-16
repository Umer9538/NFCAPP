import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { CheckboxGrid } from '../components/CheckboxGrid';
import { SectionHeader } from '../components/SectionHeader';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BrainIcon,
  MessageSquareIcon,
  StethoscopeIcon,
} from '../components/LucideIcons';
import {
  BEHAVIORAL_WARNINGS_OPTIONS,
  CATHETER_TYPE_OPTIONS,
  COGNITIVE_BEHAVIOR_OPTIONS,
  COGNITIVE_LEVEL_OPTIONS,
  COMMUNICATION_METHOD_OPTIONS,
  FALL_RISK_OPTIONS,
  FEEDING_TUBE_TYPE_OPTIONS,
  HEARING_STATUS_OPTIONS,
  MEDICAL_DEVICE_OPTIONS,
  MOBILITY_LEVEL_OPTIONS,
  PRIMARY_LANGUAGE_OPTIONS,
  RECENT_FALLS_OPTIONS,
  SHUNT_TYPE_OPTIONS,
  SIGN_LANGUAGE_TYPE_OPTIONS,
  SPEAKS_ENGLISH_OPTIONS,
  SPEECH_ABILITY_OPTIONS,
  TRANSFER_NEEDS_OPTIONS,
  VISION_EYE_AFFECTED_OPTIONS,
  VISION_STATUS_OPTIONS,
} from '../enums';
import type { StepProps, ValidatorFn } from '../types';

const DANGEROUS = ['combative', 'violent_outbursts', 'self_harm', 'bite_scratch_hit'];

/**
 * Mirrors `getStep5ValidationErrors` from the web app verbatim
 * (app/auth/profile-setup/page.tsx ~L1074–1238). Returns an array of
 * messages that show in the "Please fix the following before continuing"
 * modal — order matches the web for muscle-memory parity.
 */
export const validateStep5: ValidatorFn = (data) => {
  const errs: string[] = [];

  // Top-level required selects
  if (!data.hearingStatus) errs.push('Hearing status is required');
  if (!data.visionStatus) errs.push('Vision status is required');
  if (!data.primaryLanguage) errs.push('Primary language is required');
  if (!data.speechAbility) errs.push('Speech ability is required');
  if (!data.mobilityLevel) errs.push('Mobility level is required');
  if (!data.fallRiskLevel) errs.push('Fall risk level is required');

  // Cognitive — narratives required when not "alert_oriented"
  if (data.cognitiveLevel && data.cognitiveLevel !== 'alert_oriented') {
    if (!data.communicationTips.trim())
      errs.push('Communication tips are required for non-normal cognitive status');
    if (!data.calmingTechniques.trim())
      errs.push('Calming techniques are required for non-normal cognitive status');
  }

  // Communication — language follow-ups
  if (data.primaryLanguage && data.primaryLanguage !== 'English') {
    if (!data.speaksEnglish)
      errs.push('Please specify whether the person can speak English');
    if (data.interpreterNeeded) {
      if (!data.interpreterName.trim()) errs.push('Interpreter name is required');
      if (!data.interpreterPhone.trim()) errs.push('Interpreter phone is required');
    }
  }
  if (data.hearingStatus === 'hearing_aid' && !data.hearingAidLocation.trim())
    errs.push('Hearing aid location is required');
  if (data.hearingStatus === 'deaf' && !data.signLanguageType)
    errs.push('Sign language type is required');
  if (data.visionStatus === 'one_eye' && !data.visionEyeAffected)
    errs.push('Please select which eye has vision');
  if (
    (data.speechAbility === 'non_verbal' ||
      data.speechAbility === 'communication_device') &&
    data.communicationMethod.length === 0
  )
    errs.push('Select at least one communication method');

  // Mobility follow-ups
  if (data.mobilityLevel && data.mobilityLevel !== 'fully_mobile') {
    if (data.transferNeeds.length === 0)
      errs.push('Select at least one transfer assistance need');
    if (!data.transferNotes.trim()) errs.push('Transfer notes are required');
    if (data.transferNeeds.includes('hoyer_lift') && !data.weightForLift.trim())
      errs.push('Weight is required when Hoyer lift is needed');
  }
  if (data.fallRiskLevel && data.fallRiskLevel !== 'low') {
    if (!data.recentFalls) errs.push('Recent falls selection is required');
    if (!data.fallNotes.trim()) errs.push('Fall notes are required for fall risk');
  }

  // Behavioral
  const dangerousSelected = data.behavioralWarnings.some((w) => DANGEROUS.includes(w));
  if (data.behavioralWarnings.length > 0 && !data.triggersToAvoid.trim())
    errs.push('Triggers to avoid are required when behavioral warnings are selected');
  if (dangerousSelected && !data.deescalationTips.trim())
    errs.push('De-escalation tips are required for selected behavioral warnings');

  // Medical-device follow-ups
  const dev = data.medicalDevices;
  if ((dev.includes('pacemaker') || dev.includes('icd')) && !data.pacemakerBrand.trim())
    errs.push('Device brand/model is required');
  if (dev.includes('insulin_pump') && !data.insulinPumpLocation.trim())
    errs.push('Pump location is required');
  if (dev.includes('oxygen') && !data.oxygenFlowRate.trim())
    errs.push('Oxygen flow rate is required');
  if (dev.includes('feeding_tube') && !data.feedingTubeType)
    errs.push('Feeding tube type is required');
  if (dev.includes('catheter') && !data.catheterType)
    errs.push('Catheter type is required');
  if (dev.includes('prosthetic') && !data.prostheticDetails.trim())
    errs.push('Prosthetic details are required');
  if (dev.includes('med_pump') && !data.medPumpDrug.trim())
    errs.push('Medication pump details are required');
  if (dev.includes('shunt') && !data.shuntType.trim())
    errs.push('Shunt type is required');

  return errs.length ? errs : null;
};

const DANGEROUS_BEHAVIORS = ['combative', 'violent_outbursts', 'self_harm', 'bite_scratch_hit'];

const wordCountOf = (s: string) =>
  s.trim() ? s.trim().split(/\s+/).length : 0;

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
      <Text style={styles.wordCount}>
        {wordCountOf(value)} words (limit 100-300)
      </Text>
    </View>
  );
}

export function Step5EmergencyInstructions({ data, update }: StepProps) {
  const devices = data.medicalDevices;
  const showDangerousBanner = data.behavioralWarnings.some((w) =>
    DANGEROUS_BEHAVIORS.includes(w)
  );
  const showLifeSustainingBanner =
    devices.includes('ventilator') || devices.includes('oxygen');
  const showHighFallBadge =
    data.fallRiskLevel === 'high' || data.fallRiskLevel === 'very_high';

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Emergency Instructions Visibility"
        value={data.emergencyInstructionsPublic}
        onChange={(v) => update('emergencyInstructionsPublic', v)}
        publicDescription="These critical instructions will be visible to first responders"
        privateDescription="Emergency instructions will be hidden from emergency view"
      />

      {/* ── A. Cognitive Status ──────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon={<BrainIcon size={20} color="#a855f7" />}
          title="Cognitive Status"
        />
        <SelectField
          label="Cognitive Level"
          required
          placeholder="Select cognitive level"
          value={data.cognitiveLevel}
          options={COGNITIVE_LEVEL_OPTIONS}
          onChange={(v) => update('cognitiveLevel', v)}
        />
        {data.cognitiveLevel === 'other' && (
          <IconInput
            label="Describe"
            value={data.cognitiveLevelOther}
            onChange={(v) => update('cognitiveLevelOther', v)}
          />
        )}
        {data.cognitiveLevel && data.cognitiveLevel !== 'alert_oriented' && (
          <View style={[styles.conditionalBlock, styles.borderPurple]}>
            <CheckboxGrid
              label="What behaviors might first responders see?"
              options={COGNITIVE_BEHAVIOR_OPTIONS}
              value={data.cognitiveBehaviors}
              onChange={(next) => update('cognitiveBehaviors', next)}
              columns={2}
            />
            <NotesField
              label="How to communicate with this person"
              optional
              value={data.communicationTips}
              onChange={(v) => update('communicationTips', v)}
              placeholder="e.g., Speak slowly and use simple words. Don't argue if confused."
            />
            <NotesField
              label="What helps calm them down?"
              optional
              value={data.calmingTechniques}
              onChange={(v) => update('calmingTechniques', v)}
              placeholder="e.g., Singing Amazing Grace, show photos of grandchildren"
            />
          </View>
        )}
      </View>

      {/* ── B. Communication Needs ───────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon={<MessageSquareIcon size={20} color="#3b82f6" />}
          title="Communication Needs"
          withDivider
        />
        <View style={styles.grid}>
          <View style={styles.col}>
            <SelectField
              label="Hearing Status"
              required
              placeholder="Select hearing status"
              value={data.hearingStatus}
              options={HEARING_STATUS_OPTIONS}
              onChange={(v) => update('hearingStatus', v)}
            />
            {data.hearingStatus === 'hearing_aid' && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <IconInput
                  label="Hearing Aid Location"
                  value={data.hearingAidLocation}
                  onChange={(v) => update('hearingAidLocation', v)}
                  placeholder="e.g., Usually in right ear, spare in purse"
                />
              </View>
            )}
            {data.hearingStatus === 'deaf' && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <SelectField
                  label="Sign Language Type"
                  placeholder="Select if applicable"
                  value={data.signLanguageType}
                  options={SIGN_LANGUAGE_TYPE_OPTIONS}
                  onChange={(v) => update('signLanguageType', v)}
                />
              </View>
            )}
          </View>
          <View style={styles.col}>
            <SelectField
              label="Vision Status"
              required
              placeholder="Select vision status"
              value={data.visionStatus}
              options={VISION_STATUS_OPTIONS}
              onChange={(v) => update('visionStatus', v)}
            />
            {data.visionStatus === 'blind' && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <IconInput
                  label="Guide Dog Name (if applicable)"
                  value={data.guideDogName}
                  onChange={(v) => update('guideDogName', v)}
                  placeholder="e.g., Max"
                />
              </View>
            )}
            {data.visionStatus === 'one_eye' && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <SelectField
                  label="Which Eye Has Vision"
                  placeholder="Select eye"
                  value={data.visionEyeAffected}
                  options={VISION_EYE_AFFECTED_OPTIONS}
                  onChange={(v) => update('visionEyeAffected', v)}
                />
              </View>
            )}
          </View>
          <View style={styles.col}>
            <SelectField
              label="Primary Language"
              required
              placeholder="Select primary language"
              value={data.primaryLanguage}
              options={PRIMARY_LANGUAGE_OPTIONS}
              onChange={(v) => update('primaryLanguage', v)}
            />
            {data.primaryLanguage && data.primaryLanguage !== 'English' && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <SelectField
                  label="Can they speak English?"
                  placeholder="Select"
                  value={data.speaksEnglish}
                  options={SPEAKS_ENGLISH_OPTIONS}
                  onChange={(v) => update('speaksEnglish', v)}
                />
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => update('interpreterNeeded', !data.interpreterNeeded)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      data.interpreterNeeded && styles.checkboxOn,
                    ]}
                  >
                    {data.interpreterNeeded && (
                      <Feather name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Interpreter needed for medical care
                  </Text>
                </Pressable>
                {data.interpreterNeeded && (
                  <View style={styles.grid}>
                    <View style={styles.col}>
                      <IconInput
                        label="Interpreter Name"
                        value={data.interpreterName}
                        onChange={(v) => update('interpreterName', v)}
                      />
                    </View>
                    <View style={styles.col}>
                      <IconInput
                        label="Interpreter Phone"
                        value={data.interpreterPhone}
                        onChange={(v) => update('interpreterPhone', v)}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.col}>
            <SelectField
              label="Speech Ability"
              required
              placeholder="Select speech ability"
              value={data.speechAbility}
              options={SPEECH_ABILITY_OPTIONS}
              onChange={(v) => update('speechAbility', v)}
            />
            {(data.speechAbility === 'non_verbal' ||
              data.speechAbility === 'communication_device') && (
              <View style={[styles.conditionalBlock, styles.borderBlue]}>
                <CheckboxGrid
                  label="How do they communicate?"
                  options={COMMUNICATION_METHOD_OPTIONS}
                  value={data.communicationMethod}
                  onChange={(next) => update('communicationMethod', next)}
                  columns={1}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── C. Mobility Status ───────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon={<ActivityIcon size={20} color="#22c55e" />}
          title="Mobility Status"
          withDivider
        />
        <View style={styles.grid}>
          <View style={styles.col}>
            <SelectField
              label="Mobility Level"
              required
              placeholder="Select mobility level"
              value={data.mobilityLevel}
              options={MOBILITY_LEVEL_OPTIONS}
              onChange={(v) => update('mobilityLevel', v)}
            />
            {data.mobilityLevel && data.mobilityLevel !== 'fully_mobile' && (
              <View style={[styles.conditionalBlock, styles.borderGreen]}>
                <CheckboxGrid
                  label="Transfer Assistance Needed"
                  options={TRANSFER_NEEDS_OPTIONS}
                  value={data.transferNeeds}
                  onChange={(next) => update('transferNeeds', next)}
                  columns={1}
                />
                {data.transferNeeds.includes('hoyer_lift') && (
                  <IconInput
                    label="Weight (for lift capacity)"
                    value={data.weightForLift}
                    onChange={(v) => update('weightForLift', v)}
                    placeholder="e.g., 180 lbs"
                  />
                )}
                <NotesField
                  label="Transfer Notes"
                  optional
                  value={data.transferNotes}
                  onChange={(v) => update('transferNotes', v)}
                  placeholder="e.g., Weak left side due to stroke. Support on right side when walking."
                />
              </View>
            )}
          </View>
          <View style={styles.col}>
            <SelectField
              label="Fall Risk Level"
              required
              placeholder="Select fall risk level"
              value={data.fallRiskLevel}
              options={FALL_RISK_OPTIONS}
              onChange={(v) => update('fallRiskLevel', v)}
            />
            {data.fallRiskLevel && data.fallRiskLevel !== 'low' && (
              <View style={[styles.conditionalBlock, styles.borderGreen]}>
                <SelectField
                  label="Recent Falls"
                  placeholder="Select"
                  value={data.recentFalls}
                  options={RECENT_FALLS_OPTIONS}
                  onChange={(v) => update('recentFalls', v)}
                />
                <NotesField
                  label="Fall Notes"
                  optional
                  value={data.fallNotes}
                  onChange={(v) => update('fallNotes', v)}
                  placeholder="e.g., Falls when standing too quickly. Gets dizzy in heat."
                />
                {showHighFallBadge && (
                  <View style={styles.warnOrange}>
                    <View style={styles.warnHeaderRow}>
                      <AlertTriangleIcon size={16} color="#c2410c" />
                      <Text style={styles.warnTitleOrange}>
                        {data.fallRiskLevel === 'very_high'
                          ? 'EXTREME FALL RISK'
                          : 'HIGH FALL RISK'}
                      </Text>
                    </View>
                    <Text style={styles.warnBodyOrange}>
                      First responders will be alerted to take extra precautions.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── D. Behavioral Warnings ───────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon={<AlertTriangleIcon size={20} color="#f97316" />}
          title="Behavioral Warnings"
          withDivider
        />
        <CheckboxGrid
          label="Are there any behaviors first responders should be aware of?"
          options={BEHAVIORAL_WARNINGS_OPTIONS}
          value={data.behavioralWarnings}
          onChange={(next) => update('behavioralWarnings', next)}
          columns={2}
        />
        <NotesField
          label="Triggers to AVOID"
          optional
          value={data.triggersToAvoid}
          onChange={(v) => update('triggersToAvoid', v)}
          placeholder="e.g., Loud noises trigger panic attacks. Do not restrain wrists."
        />
        <NotesField
          label="How to de-escalate / calm them down"
          optional
          value={data.deescalationTips}
          onChange={(v) => update('deescalationTips', v)}
          placeholder="e.g., Speak calmly and slowly. Give them space."
        />
        {showDangerousBanner && (
          <View style={styles.warnOrangeStrong}>
            <View style={styles.warnHeaderRow}>
              <AlertTriangleIcon size={18} color="#c2410c" />
              <Text style={styles.warnTitleOrangeStrong}>BEHAVIORAL WARNING</Text>
            </View>
            <Text style={styles.warnBodyOrange}>
              First responders will be alerted about potential safety concerns. Please ensure de-escalation tips are provided.
            </Text>
            {!data.deescalationTips.trim() && (
              <Text style={styles.warnRecommend}>
                Recommended: Add de-escalation tips above to help responders.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* ── E. Medical Devices ───────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionHeader
          icon={<StethoscopeIcon size={20} color="#ef4444" />}
          title="Medical Devices"
          withDivider
        />
        <CheckboxGrid
          label="Does this person use any medical devices?"
          options={MEDICAL_DEVICE_OPTIONS}
          value={data.medicalDevices}
          onChange={(next) => update('medicalDevices', next)}
          columns={3}
        />

        {devices.length > 0 && (
          <View style={[styles.conditionalBlock, styles.borderRed]}>
            {(devices.includes('pacemaker') || devices.includes('icd')) && (
              <View style={styles.warnRed}>
                <View style={styles.warnHeaderRow}>
                  <AlertTriangleIcon size={16} color="#dc2626" />
                  <Text style={styles.warnTitleRed}>Pacemaker/ICD - MRI CAUTION</Text>
                </View>
                <IconInput
                  label="Device Brand/Model"
                  optional
                  value={data.pacemakerBrand}
                  onChange={(v) => update('pacemakerBrand', v)}
                  placeholder="e.g., Medtronic Azure XT DR MRI"
                />
              </View>
            )}

            {devices.includes('insulin_pump') && (
              <View style={styles.tintedBlue}>
                <IconInput
                  label="Pump Location on Body"
                  value={data.insulinPumpLocation}
                  onChange={(v) => update('insulinPumpLocation', v)}
                  placeholder="e.g., Left abdomen, rotates sites"
                />
              </View>
            )}

            {devices.includes('oxygen') && (
              <View style={styles.tintedBlue}>
                <IconInput
                  label="Flow Rate"
                  value={data.oxygenFlowRate}
                  onChange={(v) => update('oxygenFlowRate', v)}
                  placeholder="e.g., 2 L/min"
                />
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => update('oxygenContinuous', !data.oxygenContinuous)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      data.oxygenContinuous && styles.checkboxOn,
                    ]}
                  >
                    {data.oxygenContinuous && (
                      <Feather name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Continuous use (24/7)</Text>
                </Pressable>
              </View>
            )}

            {devices.includes('feeding_tube') && (
              <View style={styles.tintedYellow}>
                <SelectField
                  label="Feeding Tube Type"
                  optional
                  placeholder="Select type"
                  value={data.feedingTubeType}
                  options={FEEDING_TUBE_TYPE_OPTIONS}
                  onChange={(v) => update('feedingTubeType', v)}
                />
              </View>
            )}

            {devices.includes('catheter') && (
              <View style={styles.tintedGray}>
                <SelectField
                  label="Catheter Type"
                  placeholder="Select type"
                  value={data.catheterType}
                  options={CATHETER_TYPE_OPTIONS}
                  onChange={(v) => update('catheterType', v)}
                />
              </View>
            )}

            {devices.includes('prosthetic') && (
              <View style={styles.tintedGray}>
                <IconInput
                  label="Prosthetic Details"
                  value={data.prostheticDetails}
                  onChange={(v) => update('prostheticDetails', v)}
                  placeholder="e.g., Left below-knee prosthesis"
                />
              </View>
            )}

            {devices.includes('med_pump') && (
              <View style={styles.tintedPurple}>
                <IconInput
                  label="Medication in Pump"
                  value={data.medPumpDrug}
                  onChange={(v) => update('medPumpDrug', v)}
                  placeholder="e.g., Intrathecal baclofen for spasticity"
                />
              </View>
            )}

            {devices.includes('shunt') && (
              <View style={styles.tintedPurple}>
                <SelectField
                  label="Shunt Type"
                  placeholder="Select type"
                  value={data.shuntType}
                  options={SHUNT_TYPE_OPTIONS}
                  onChange={(v) => update('shuntType', v)}
                />
              </View>
            )}

            <NotesField
              label="Critical Device Notes"
              optional
              value={data.criticalDeviceNotes}
              onChange={(v) => update('criticalDeviceNotes', v)}
              placeholder="e.g., Must have oxygen at all times. Spare tank in bedroom closet."
              minHeight={88}
            />

            {showLifeSustainingBanner && (
              <View style={styles.warnRedStrong}>
                <View style={styles.warnHeaderRow}>
                  <AlertTriangleIcon size={18} color="#b91c1c" />
                  <Text style={styles.warnTitleRedStrong}>LIFE-SUSTAINING DEVICE</Text>
                </View>
                <Text style={styles.warnBodyRed}>
                  This person depends on life-sustaining equipment. Interruption could be fatal.
                </Text>
              </View>
            )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[4],
    rowGap: spacing[4],
  },
  col: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 200,
    gap: spacing[3],
  },
  conditionalBlock: {
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    gap: spacing[3],
    marginTop: spacing[1],
  },
  borderPurple: { borderLeftColor: '#e9d5ff' },
  borderBlue: { borderLeftColor: '#bfdbfe' },
  borderGreen: { borderLeftColor: '#bbf7d0' },
  borderRed: { borderLeftColor: '#fecaca' },
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
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
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
  wordCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
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
  warnOrangeStrong: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  warnTitleOrange: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#c2410c',
  },
  warnTitleOrangeStrong: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#c2410c',
  },
  warnBodyOrange: {
    fontSize: typography.fontSize.xs,
    color: '#9a3412',
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
  warnRecommend: {
    fontSize: typography.fontSize.sm,
    color: '#c2410c',
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing[2],
  },
  warnRed: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: spacing[3],
  },
  warnRedStrong: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  warnTitleRed: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#dc2626',
  },
  warnTitleRedStrong: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#b91c1c',
  },
  warnBodyRed: {
    fontSize: typography.fontSize.xs,
    color: '#991b1b',
    lineHeight: typography.lineHeight.normal * typography.fontSize.xs,
  },
  tintedBlue: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: spacing[3],
  },
  tintedYellow: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tintedGray: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: GRAY[50],
    borderWidth: 1,
    borderColor: GRAY[200],
  },
  tintedPurple: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
});

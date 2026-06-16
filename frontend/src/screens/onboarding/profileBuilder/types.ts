import type React from 'react';

/**
 * Internal state shapes for the 12-step Profile Builder.
 *
 * These mirror the web app's `formData` flat state + array states. They are NOT
 * the submit payload — `buildPayload.ts` reshapes these into the nested body the
 * backend expects (with renames, null handling for conditional sections, etc.).
 *
 * Source of truth: COMPANION_APP_PROFILE_BUILDER_SPEC.md §4, §5, §6.
 */

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
export type DnrStatus = 'no' | 'yes' | 'on_file_with_doctor';
export type OrganDonorStatus = 'no' | 'yes' | 'registered';

export interface AllergyEntry {
  id: string;
  allergenName: string;
  allergyType: string;
  severity: string;
  reactionTypes: string[];
  otherReaction: string;
  treatmentNotes: string;
}

export interface MedicationEntry {
  id: string;
  medicationName: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  frequencyOther: string;
  timesToTake: string[];
  criticality: string;
  purpose: string;
  prescribingDoctor: string;
  doctorSpecialty: string;
  doctorPhone: string;
  specialInstructions: string;
}

export interface ConditionEntry {
  id: string;
  conditionName: string;
  severity: string;
  /** Stored as "YYYY-MM" (or empty when unknown). */
  diagnosisDate: string;
  diagnosisUnknown: boolean;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhone: string;
  criticalNotes: string;
  status: string;
}

export interface EmergencyContactEntry {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  priority: number;
  isPrimary: boolean;
  availableStart: string;
  availableEnd: string;
  notes: string;
}

export interface AuthorizedPickupEntry {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  photoIdRequired: boolean;
}

/**
 * Flat scalar state — every non-array field across all 12 steps.
 * Keys here match the web app's `formData` keys exactly so the spec's field
 * tables line up 1:1. Renames to payload keys happen in buildPayload.ts.
 */
export interface ProfileFormData {
  // Step 1 — Basic Info
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  bloodType: string;
  height: string;
  weight: string;
  photoUrl: string;
  dnrStatus: DnrStatus;
  dnrDocumentUrl: string;
  dnrDoctorName: string;
  dnrDoctorPhone: string;
  dnrHospital: string;
  organDonorStatus: OrganDonorStatus;
  organDonorCardNumber: string;
  organDonorProvince: string;

  // Step 5 — Emergency Instructions
  cognitiveLevel: string;
  cognitiveLevelOther: string;
  cognitiveBehaviors: string[];
  communicationTips: string;
  calmingTechniques: string;
  livingArrangement: string;
  careFacilityName: string;
  careFacilityRoom: string;

  hearingStatus: string;
  hearingAidLocation: string;
  hearingNotes: string[];
  signLanguageType: string;

  visionStatus: string;
  visionEyeAffected: string;
  visionNotes: string[];
  guideDogName: string;

  primaryLanguage: string;
  speaksEnglish: string;
  interpreterNeeded: boolean;
  interpreterName: string;
  interpreterPhone: string;

  speechAbility: string;
  communicationMethod: string[];

  mobilityLevel: string;
  mobilityDetails: string;
  transferNeeds: string[];
  weightForLift: string;
  transferNotes: string;
  fallRiskLevel: string;
  recentFalls: string;
  fallNotes: string;

  behavioralWarnings: string[];
  triggersToAvoid: string;
  deescalationTips: string;

  medicalDevices: string[];
  pacemakerBrand: string;
  insulinPumpLocation: string;
  oxygenFlowRate: string;
  oxygenContinuous: boolean;
  feedingTubeType: string;
  catheterType: string;
  prostheticDetails: string;
  medPumpDrug: string;
  shuntType: string;
  otherDevices: string;
  criticalDeviceNotes: string;
  deviceSettings: string;

  // Step 6 — Mental Health
  mentalHealthConditions: string;
  conditionsMH: string[];
  otherConditionsMH: string;
  currentTreatment: string[];
  psychiatristName: string;
  psychiatristPhone: string;
  suicideRisk: string;
  selfHarmRisk: string;
  crisisCounselorName: string;
  crisisCounselorPhone: string;
  crisisLine: string;
  mentalTriggers: string;
  mentalCalmingTechniques: string;
  alcoholUse: string;
  tobaccoUse: string;
  cigarettesPerDay: string;
  quitYear: string;
  recreationalDrugUse: string;
  currentDrugs: string;
  inRecoveryProgram: boolean;
  sponsorName: string;
  sponsorPhone: string;
  mentalHealthPrivacy: string;

  // Step 7 — Pregnancy
  isPregnant: string;
  weeksPregnant: string;
  trimester: string;
  dueDate: string;
  isHighRisk: boolean;
  highRiskDetails: string;
  obgynName: string;
  obgynPhone: string;
  deliveryHospital: string;
  previousPregnancies: string;
  previousComplications: string;
  cSectionHistory: boolean;

  // Step 8 — Pediatric
  schoolName: string;
  grade: string;
  teacherName: string;
  teacherPhone: string;
  schoolOfficePhone: string;
  schoolAddress: string;
  busNumber: string;
  notAuthorized: string;
  developmentalDelays: string[];
  hasIEP: boolean;
  has504Plan: boolean;
  specialEducation: boolean;
  behavioralNotes: string[];
  birthWeight: string;
  birthWeightOz: string;
  wasPremature: boolean;
  prematureWeeks: string;
  immunizationStatus: string;

  // Step 9 — Home Safety
  livingSituation: string;
  livingSituationOther: string;
  homeStreet: string;
  homeAptUnit: string;
  homeCity: string;
  homePostalCode: string;
  spareKeyLocation: string;
  hideKeyLocation: string;
  lockboxCode: string;
  otherKeyLocation: string;
  neighborName: string;
  neighborAddress: string;
  neighborPhone: string;
  neighborRelationship: string;
  neighborHasKey: boolean;
  buildingManager: string;
  buildingManagerPhone: string;
  buzzerCode: string;
  floor: string;
  hasElevator: boolean;
  hasPets: boolean;
  petTypes: string;
  petCareContactName: string;
  petCareContactPhone: string;
  petEmergencyNotes: string;
  dailyRoutine: string;

  // Step 10 — Legal & Directives
  hasPOA: boolean;
  poaName: string;
  poaPhone: string;
  poaRelationship: string;
  hasLegalGuardian: boolean;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  hasLivingWill: boolean;
  livingWillPreferences: string;
  hasPOLST: boolean;
  resuscitationPreference: string;
  religiousConsiderations: string;
  culturalConsiderations: string;
  burialPreference: string;
  organDonationWishes: string;
  autopsyPreference: string;

  // Step 12 — Notes
  additionalNotes: string;

  // Section visibility (sent inside `medicalProfile`).
  // Defaults from backend Zod (app/api/auth/profile-setup/route.ts:40-48):
  // allergies/medications/conditions/emergencyContacts/emergencyInstructions/legalDirectives → true
  // pregnancyInfo/pediatricInfo/homeSafety → false
  allergiesPublic: boolean;
  medicationsPublic: boolean;
  conditionsPublic: boolean;
  emergencyContactsPublic: boolean;
  emergencyInstructionsPublic: boolean;
  pregnancyInfoPublic: boolean;
  pediatricInfoPublic: boolean;
  homeSafetyPublic: boolean;
  legalDirectivesPublic: boolean;
}

export interface ProfileArrays {
  allergies: AllergyEntry[];
  medications: MedicationEntry[];
  conditions: ConditionEntry[];
  emergencyContacts: EmergencyContactEntry[];
  authorizedPickup: AuthorizedPickupEntry[];
}

export interface StepDescriptor {
  id: number;
  key: string;
  title: string;
  description: string;
  /** Ionicons name shown next to the step title in the header. */
  icon?: string;
  /** Custom rendered node — takes precedence over `icon` when provided. */
  iconNode?: React.ReactNode;
  conditional?: 'pregnancy' | 'pediatric';
}

export interface StepProps {
  data: ProfileFormData;
  arrays: ProfileArrays;
  update: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
  updateArray: <K extends keyof ProfileArrays>(field: K, value: ProfileArrays[K]) => void;
  age: number | null;
  /** True after the user has tried to Next and validation failed — lets the
   * step component highlight individual invalid fields. Resets on step change. */
  attemptedSubmit?: boolean;
}

export type ValidatorFn = (
  data: ProfileFormData,
  arrays: ProfileArrays
) => string | string[] | null;

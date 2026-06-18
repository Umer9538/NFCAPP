/**
 * Medical Profile types — mirror the web GET /api/profile response shape.
 * Web source of truth: app/dashboard/profile/page.tsx + app/api/profile/route.ts
 */

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type OrganDonorStatus = 'no' | 'yes' | 'registered';
export type DnrStatus = 'no' | 'yes' | 'on_file_with_doctor';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FamilyRole = 'guardian' | 'caregiver' | 'second_parent' | null;

export interface MedicalProfileUser {
  id: string;
  fullName?: string;
  username?: string;
  email: string;
  phoneNumber?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  height?: string | null;
  accountType?: string | null;
  familyRole?: FamilyRole;
}

export interface AllergyRecord {
  id: string;
  allergenName: string;
  allergyType?: string;
  severity?: string;
  reactionTypes?: string[];
  otherReaction?: string;
  treatmentNotes?: string;
}

export interface MedicationRecord {
  id: string;
  medicationName: string;
  dosage?: string;
  dosageUnit?: string;
  frequency?: string;
  criticality?: string;
  purpose?: string;
}

export interface ConditionRecord {
  id: string;
  conditionName: string;
  severity?: string;
  status?: string;
  diagnosisDate?: string;
}

/* GET /api/profile response field shapes — different from the SUBMIT payload.
 * Names below mirror what app/api/profile/route.ts actually returns. */

export interface EmergencyInstructions {
  cognitiveStatus?: string;
  cognitiveNotes?: string;
  cognitiveBehaviors?: string[];
  communicationNeeds?: string;
  communicationNotes?: string[];
  communicationTips?: string;
  hearingStatus?: string;
  visionStatus?: string;
  primaryLanguage?: string;
  speaksEnglish?: string;
  interpreterNeeded?: boolean;
  mobilityStatus?: string;
  mobilityEquipment?: string;
  mobilityNotes?: string;
  transferNeeds?: string[];
  fallRiskLevel?: string;
  fallNotes?: string;
  behavioralConsiderations?: string[];
  behavioralTriggers?: string;
  calmingStrategies?: string;
  medicalDevices?: string[];
  deviceNotes?: string;
  deviceSettings?: string;
}

export interface MentalHealthProfile {
  isPrivate?: boolean;
  privacyLevel?: string;
  hasConditions?: string;
  conditions?: string[];
  otherConditions?: string;
  currentTreatment?: string[] | string;
  psychiatristName?: string;
  psychiatristPhone?: string;
  therapistName?: string;
  therapistPhone?: string;
  suicideRisk?: string;
  selfHarmRisk?: string;
  crisisProtocol?: string;
  crisisCounselorName?: string;
  crisisLine?: string;
  triggers?: string;
  copingStrategies?: string;
  alcoholUse?: string;
  tobaccoUse?: string;
  recreationalDrugUse?: string;
}

export interface PregnancyInfo {
  isPregnant?: boolean;
  pregnantStatus?: string;
  dueDate?: string;
  weeksPregnant?: number | null;
  trimester?: string;
  isHighRisk?: boolean;
  highRiskDetails?: string;
  obgynName?: string;
  obgynPhone?: string;
  hospitalPreference?: string;
  previousPregnancies?: number | null;
  complications?: string;
  cSectionHistory?: boolean;
}

export interface PediatricInfo {
  schoolName?: string;
  gradeLevel?: string;
  teacherName?: string;
  teacherPhone?: string;
  schoolPhone?: string;
  schoolAddress?: string;
  busNumber?: string;
  authorizedPickups?: Array<{
    name: string;
    relationship: string;
    phone: string;
    photoIdRequired?: boolean;
  }>;
  notAuthorized?: string;
  developmentalDelays?: string[];
  hasIEP?: boolean;
  has504Plan?: boolean;
  specialEducation?: boolean;
  behavioralNotes?: string[];
  birthWeight?: string;
  wasPremature?: boolean;
  prematureWeeks?: number | null;
  immunizationStatus?: string;
}

export interface HomeSafety {
  livingSituation?: string;
  livingSituationOther?: string;
  street?: string;
  aptUnit?: string;
  city?: string;
  postalCode?: string;
  spareKeyLocation?: string;
  keyLocation?: string;
  lockboxCode?: string;
  neighborName?: string;
  neighborPhone?: string;
  neighborHasKey?: boolean;
  buildingManager?: string;
  buildingManagerPhone?: string;
  buzzerCode?: string;
  hasElevator?: boolean;
  floorLevel?: string;
  hasPets?: boolean;
  petDetails?: string | unknown[];
  petEmergencyContact?: string;
  petEmergencyNotes?: string;
  dailyRoutine?: string;
}

export interface LegalDirectives {
  hasPOA?: boolean;
  poaName?: string;
  poaPhone?: string;
  poaRelationship?: string;
  hasLegalGuardian?: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  hasLivingWill?: boolean;
  livingWillNotes?: string;
  livingWillLocation?: string;
  hasPOLST?: boolean;
  resuscitationPreference?: string;
  religiousPreferences?: string;
  culturalConsiderations?: string;
  burialPreference?: string;
  organDonationWishes?: string;
  autopsyPreference?: string;
}

export interface MedicalProfile {
  id?: string;
  bloodType?: BloodType | string;
  height?: string;
  weight?: string;
  photoUrl?: string;
  organDonorStatus?: OrganDonorStatus;
  dnrStatus?: DnrStatus;
  isOrganDonor?: boolean;
  hasDNR?: boolean;
  emergencyNotes?: string;
  additionalNotes?: string;
  allergies?: any[];
  allergyRecords?: AllergyRecord[];
  medications?: any[];
  medicationRecords?: MedicationRecord[];
  medicalConditions?: string[];
  conditionRecords?: ConditionRecord[];
  emergencyInstructions?: EmergencyInstructions | null;
  mentalHealthProfile?: MentalHealthProfile | null;
  pregnancyInfo?: PregnancyInfo | null;
  pediatricInfo?: PediatricInfo | null;
  homeSafety?: HomeSafety | null;
  legalDirectives?: LegalDirectives | null;
}

export interface MedicalProfileEmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  priority?: number;
  isPrimary?: boolean;
}

export interface MedicalProfileResponse {
  user: MedicalProfileUser;
  medicalProfile: MedicalProfile | null;
  doctorInfo?: unknown;
  emergencyContacts?: MedicalProfileEmergencyContact[];
  prescriptions?: unknown[];
}

export interface BasicInfoForm {
  photoUrl: string;
  bloodType: string;
  height: string;
  weight: string;
  organDonorStatus: OrganDonorStatus | '';
  dnrStatus: DnrStatus | '';
}

/** Body the web sends to PUT /api/profile (the same backend mobile uses). */
export interface UpdateMedicalProfileBody {
  medicalProfile: {
    photoUrl?: string;
    bloodType?: string;
    height?: string;
    weight?: string;
    isOrganDonor?: boolean;
    hasDNR?: boolean;
    allergies: { allergen: string; severity: string; reaction: string }[];
    medicalConditions: string[];
    medications: { name: string; dosage: string; frequency: string }[];
    emergencyNotes?: string;
  };
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string;
    email?: string;
  }[];
}

/**
 * Assembles the exact JSON body POST /api/auth/profile-setup expects.
 *
 * The web app stores flat UI state and only does the flat→nested mapping at
 * submit time. The renames are critical — getting one wrong causes a 400 Zod
 * validation error. Source: COMPANION_APP_PROFILE_BUILDER_SPEC.md §6 + §14.
 */

import type {
  ProfileArrays,
  ProfileFormData,
  AllergyEntry,
  MedicationEntry,
  ConditionEntry,
  EmergencyContactEntry,
  AuthorizedPickupEntry,
} from './types';
import { showPediatricTab, showPregnancyTab, calculateAge } from './ageRules';

/** Parse a string to number; return null if blank/invalid (backend wants number|null). */
function num(s: string): number | null {
  if (!s || !s.trim()) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function cleanAllergy(a: AllergyEntry) {
  return {
    allergenName: a.allergenName,
    allergyType: a.allergyType,
    severity: a.severity,
    reactionTypes: a.reactionTypes,
    otherReaction: a.otherReaction,
    treatmentNotes: a.treatmentNotes,
  };
}

function cleanMedication(m: MedicationEntry) {
  return {
    medicationName: m.medicationName,
    dosage: m.dosage,
    dosageUnit: m.dosageUnit,
    frequency: m.frequency,
    frequencyOther: m.frequencyOther,
    timesToTake: m.timesToTake,
    criticality: m.criticality,
    purpose: m.purpose,
    prescribingDoctor: m.prescribingDoctor,
    doctorSpecialty: m.doctorSpecialty,
    doctorPhone: m.doctorPhone,
    specialInstructions: m.specialInstructions,
  };
}

function cleanCondition(c: ConditionEntry) {
  return {
    conditionName: c.conditionName,
    severity: c.severity,
    diagnosisDate: c.diagnosisDate,
    doctorName: c.doctorName,
    doctorSpecialty: c.doctorSpecialty,
    doctorPhone: c.doctorPhone,
    criticalNotes: c.criticalNotes,
    status: c.status,
  };
}

function cleanContact(c: EmergencyContactEntry) {
  return {
    name: c.name,
    relation: c.relation,
    phone: c.phone,
    email: c.email,
    priority: c.priority,
    isPrimary: c.isPrimary,
    notes: c.notes,
  };
}

export interface ProfileSetupPayload {
  userId: string;
  basicInfo: Record<string, unknown>;
  medicalProfile: Record<string, unknown>;
  allergies: ReturnType<typeof cleanAllergy>[];
  medications: ReturnType<typeof cleanMedication>[];
  conditions: ReturnType<typeof cleanCondition>[];
  emergencyInstructions: Record<string, unknown>;
  mentalHealth: Record<string, unknown>;
  pregnancyInfo: Record<string, unknown> | null;
  pediatricInfo: Record<string, unknown> | null;
  homeSafety: Record<string, unknown>;
  legalDirectives: Record<string, unknown>;
  emergencyContacts: ReturnType<typeof cleanContact>[];
}

export function buildPayload(
  userId: string,
  data: ProfileFormData,
  arrays: ProfileArrays
): ProfileSetupPayload {
  const age = calculateAge(data.dateOfBirth);
  const hasPregnancy = showPregnancyTab(data.gender, age);
  const hasPediatric = showPediatricTab(age);

  // Only send array rows whose primary field is filled.
  const allergies = arrays.allergies
    .filter((a) => a.allergenName.trim())
    .map(cleanAllergy);
  const medications = arrays.medications
    .filter((m) => m.medicationName.trim())
    .map(cleanMedication);
  const conditions = arrays.conditions
    .filter((c) => c.conditionName.trim())
    .map(cleanCondition);
  const emergencyContacts = arrays.emergencyContacts
    .filter((c) => c.name.trim() && c.phone.trim())
    .map(cleanContact);

  const basicInfo = {
    phoneNumber: data.phoneNumber,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    address: data.address,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    height: data.height,
  };

  const medicalProfile = {
    bloodType: data.bloodType,
    height: data.height,
    weight: data.weight,
    photoUrl: data.photoUrl,
    dnrStatus: data.dnrStatus,
    dnrDocumentUrl: data.dnrDocumentUrl,
    dnrDoctorName: data.dnrDoctorName,
    dnrDoctorPhone: data.dnrDoctorPhone,
    dnrHospital: data.dnrHospital,
    organDonorStatus: data.organDonorStatus,
    organDonorCardNumber: data.organDonorCardNumber,
    organDonorProvince: data.organDonorProvince,
    additionalNotes: data.additionalNotes,
    // Section visibility — matches medicalProfileSchema in
    // app/api/auth/profile-setup/route.ts:40-48
    allergiesPublic: data.allergiesPublic,
    medicationsPublic: data.medicationsPublic,
    conditionsPublic: data.conditionsPublic,
    emergencyContactsPublic: data.emergencyContactsPublic,
    emergencyInstructionsPublic: data.emergencyInstructionsPublic,
    pregnancyInfoPublic: data.pregnancyInfoPublic,
    pediatricInfoPublic: data.pediatricInfoPublic,
    homeSafetyPublic: data.homeSafetyPublic,
    legalDirectivesPublic: data.legalDirectivesPublic,
  };

  const emergencyInstructions = {
    cognitiveLevel: data.cognitiveLevel,
    cognitiveLevelOther: data.cognitiveLevelOther,
    cognitiveBehaviors: data.cognitiveBehaviors,
    communicationTips: data.communicationTips,
    calmingTechniques: data.calmingTechniques,
    livingArrangement: data.livingArrangement,
    careFacilityName: data.careFacilityName,
    careFacilityRoom: data.careFacilityRoom,

    hearingStatus: data.hearingStatus,
    hearingAidLocation: data.hearingAidLocation,
    hearingNotes: data.hearingNotes,
    signLanguageType: data.signLanguageType,

    visionStatus: data.visionStatus,
    visionEyeAffected: data.visionEyeAffected,
    visionNotes: data.visionNotes,
    guideDogName: data.guideDogName,

    primaryLanguage: data.primaryLanguage,
    speaksEnglish: data.speaksEnglish,
    interpreterNeeded: data.interpreterNeeded,
    interpreterName: data.interpreterName,
    interpreterPhone: data.interpreterPhone,

    speechAbility: data.speechAbility,
    communicationMethod: data.communicationMethod,

    mobilityLevel: data.mobilityLevel,
    mobilityDetails: data.mobilityDetails,
    transferNeeds: data.transferNeeds,
    // RENAME: formData.weightForLift → emergencyInstructions.weight
    weight: data.weightForLift,
    transferNotes: data.transferNotes,
    fallRiskLevel: data.fallRiskLevel,
    recentFalls: data.recentFalls,
    fallNotes: data.fallNotes,

    behavioralWarnings: data.behavioralWarnings,
    triggersToAvoid: data.triggersToAvoid,
    deescalationTips: data.deescalationTips,

    medicalDevices: data.medicalDevices,
    pacemakerBrand: data.pacemakerBrand,
    insulinPumpLocation: data.insulinPumpLocation,
    oxygenFlowRate: data.oxygenFlowRate,
    oxygenContinuous: data.oxygenContinuous,
    feedingTubeType: data.feedingTubeType,
    catheterType: data.catheterType,
    prostheticDetails: data.prostheticDetails,
    medPumpDrug: data.medPumpDrug,
    shuntType: data.shuntType,
    otherDevices: data.otherDevices,
    criticalDeviceNotes: data.criticalDeviceNotes,
    deviceSettings: data.deviceSettings,
  };

  // Substance-use fields blank/none for under-18 per backend rule.
  const under18 = age !== null && age < 18;
  const mentalHealth = {
    // RENAME: formData.mentalHealthConditions → mentalHealth.hasConditions
    hasConditions: data.mentalHealthConditions,
    conditions: data.conditionsMH,
    otherConditions: data.otherConditionsMH,
    currentTreatment: data.currentTreatment,
    psychiatristName: data.psychiatristName,
    psychiatristPhone: data.psychiatristPhone,
    suicideRisk: data.suicideRisk,
    selfHarmRisk: data.selfHarmRisk,
    crisisCounselorName: data.crisisCounselorName,
    crisisCounselorPhone: data.crisisCounselorPhone,
    crisisLine: data.crisisLine,
    // RENAME: formData.mentalTriggers → mentalHealth.triggersList
    triggersList: data.mentalTriggers,
    // RENAME: formData.mentalCalmingTechniques → mentalHealth.calmingTechniques
    calmingTechniques: data.mentalCalmingTechniques,
    alcoholUse: under18 ? '' : data.alcoholUse,
    tobaccoUse: under18 ? '' : data.tobaccoUse,
    cigarettesPerDay: under18 ? null : num(data.cigarettesPerDay),
    quitYear: under18 ? '' : data.quitYear,
    recreationalDrugUse: under18 ? '' : data.recreationalDrugUse,
    currentDrugs: under18 ? '' : data.currentDrugs,
    inRecoveryProgram: under18 ? false : data.inRecoveryProgram,
    sponsorName: under18 ? '' : data.sponsorName,
    sponsorPhone: under18 ? '' : data.sponsorPhone,
    // RENAME: formData.mentalHealthPrivacy → mentalHealth.privacyLevel
    privacyLevel: data.mentalHealthPrivacy || 'only_me',
  };

  const pregnancyInfo = hasPregnancy
    ? {
        isPregnant: data.isPregnant,
        weeksPregnant: num(data.weeksPregnant),
        trimester: data.trimester,
        dueDate: data.dueDate,
        isHighRisk: data.isHighRisk,
        highRiskDetails: data.highRiskDetails,
        obgynName: data.obgynName,
        obgynPhone: data.obgynPhone,
        deliveryHospital: data.deliveryHospital,
        previousPregnancies: num(data.previousPregnancies),
        previousComplications: data.previousComplications,
        cSectionHistory: data.cSectionHistory,
      }
    : null;

  const pediatricInfo = hasPediatric
    ? {
        schoolName: data.schoolName,
        grade: data.grade,
        teacherName: data.teacherName,
        teacherPhone: data.teacherPhone,
        schoolOfficePhone: data.schoolOfficePhone,
        schoolAddress: data.schoolAddress,
        busNumber: data.busNumber,
        authorizedPickup: arrays.authorizedPickup
          .filter((p) => p.name.trim())
          .map(({ id: _id, ...rest }) => rest),
        notAuthorized: data.notAuthorized,
        developmentalDelays: data.developmentalDelays,
        hasIEP: data.hasIEP,
        has504Plan: data.has504Plan,
        specialEducation: data.specialEducation,
        behavioralNotes: data.behavioralNotes,
        birthWeight: data.birthWeight,
        birthWeightOz: data.birthWeightOz,
        wasPremature: data.wasPremature,
        prematureWeeks: num(data.prematureWeeks),
        immunizationStatus: data.immunizationStatus,
      }
    : null;

  const homeSafety = {
    livingSituation: data.livingSituation,
    livingSituationOther: data.livingSituationOther,
    // RENAME: home* → street/aptUnit/city/postalCode
    street: data.homeStreet,
    aptUnit: data.homeAptUnit,
    city: data.homeCity,
    postalCode: data.homePostalCode,
    spareKeyLocation: data.spareKeyLocation,
    hideKeyLocation: data.hideKeyLocation,
    lockboxCode: data.lockboxCode,
    otherKeyLocation: data.otherKeyLocation,
    neighborName: data.neighborName,
    neighborAddress: data.neighborAddress,
    neighborPhone: data.neighborPhone,
    neighborRelationship: data.neighborRelationship,
    neighborHasKey: data.neighborHasKey,
    buildingManager: data.buildingManager,
    buildingManagerPhone: data.buildingManagerPhone,
    buzzerCode: data.buzzerCode,
    hasElevator: data.hasElevator,
    floor: data.floor,
    hasPets: data.hasPets,
    petTypes: data.petTypes,
    petCareContactName: data.petCareContactName,
    petCareContactPhone: data.petCareContactPhone,
    petEmergencyNotes: data.petEmergencyNotes,
    dailyRoutine: data.dailyRoutine,
  };

  const legalDirectives = {
    hasPOA: data.hasPOA,
    poaName: data.poaName,
    poaPhone: data.poaPhone,
    poaRelationship: data.poaRelationship,
    hasLegalGuardian: data.hasLegalGuardian,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone,
    guardianRelationship: data.guardianRelationship,
    hasLivingWill: data.hasLivingWill,
    livingWillPreferences: data.livingWillPreferences,
    hasPOLST: data.hasPOLST,
    resuscitationPreference: data.resuscitationPreference,
    religiousConsiderations: data.religiousConsiderations,
    culturalConsiderations: data.culturalConsiderations,
    burialPreference: data.burialPreference,
    organDonationWishes: data.organDonationWishes,
    autopsyPreference: data.autopsyPreference,
  };

  return {
    userId,
    basicInfo,
    medicalProfile,
    allergies,
    medications,
    conditions,
    emergencyInstructions,
    mentalHealth,
    pregnancyInfo,
    pediatricInfo,
    homeSafety,
    legalDirectives,
    emergencyContacts,
  };
}

export function emptyFormData(): ProfileFormData {
  return {
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    bloodType: '',
    height: '',
    weight: '',
    photoUrl: '',
    dnrStatus: 'no',
    dnrDocumentUrl: '',
    dnrDoctorName: '',
    dnrDoctorPhone: '',
    dnrHospital: '',
    organDonorStatus: 'no',
    organDonorCardNumber: '',
    organDonorProvince: '',

    cognitiveLevel: '',
    cognitiveLevelOther: '',
    cognitiveBehaviors: [],
    communicationTips: '',
    calmingTechniques: '',
    livingArrangement: '',
    careFacilityName: '',
    careFacilityRoom: '',

    hearingStatus: '',
    hearingAidLocation: '',
    hearingNotes: [],
    signLanguageType: '',

    visionStatus: '',
    visionEyeAffected: '',
    visionNotes: [],
    guideDogName: '',

    primaryLanguage: '',
    speaksEnglish: '',
    interpreterNeeded: false,
    interpreterName: '',
    interpreterPhone: '',

    speechAbility: '',
    communicationMethod: [],

    mobilityLevel: '',
    mobilityDetails: '',
    transferNeeds: [],
    weightForLift: '',
    transferNotes: '',
    fallRiskLevel: '',
    recentFalls: '',
    fallNotes: '',

    behavioralWarnings: [],
    triggersToAvoid: '',
    deescalationTips: '',

    medicalDevices: [],
    pacemakerBrand: '',
    insulinPumpLocation: '',
    oxygenFlowRate: '',
    oxygenContinuous: false,
    feedingTubeType: '',
    catheterType: '',
    prostheticDetails: '',
    medPumpDrug: '',
    shuntType: '',
    otherDevices: '',
    criticalDeviceNotes: '',
    deviceSettings: '',

    mentalHealthConditions: '',
    conditionsMH: [],
    otherConditionsMH: '',
    currentTreatment: [],
    psychiatristName: '',
    psychiatristPhone: '',
    suicideRisk: '',
    selfHarmRisk: '',
    crisisCounselorName: '',
    crisisCounselorPhone: '',
    crisisLine: '',
    mentalTriggers: '',
    mentalCalmingTechniques: '',
    alcoholUse: '',
    tobaccoUse: '',
    cigarettesPerDay: '',
    quitYear: '',
    recreationalDrugUse: '',
    currentDrugs: '',
    inRecoveryProgram: false,
    sponsorName: '',
    sponsorPhone: '',
    mentalHealthPrivacy: 'only_me',

    isPregnant: '',
    weeksPregnant: '',
    trimester: '',
    dueDate: '',
    isHighRisk: false,
    highRiskDetails: '',
    obgynName: '',
    obgynPhone: '',
    deliveryHospital: '',
    previousPregnancies: '',
    previousComplications: '',
    cSectionHistory: false,

    schoolName: '',
    grade: '',
    teacherName: '',
    teacherPhone: '',
    schoolOfficePhone: '',
    schoolAddress: '',
    busNumber: '',
    notAuthorized: '',
    developmentalDelays: [],
    hasIEP: false,
    has504Plan: false,
    specialEducation: false,
    behavioralNotes: [],
    birthWeight: '',
    birthWeightOz: '',
    wasPremature: false,
    prematureWeeks: '',
    immunizationStatus: '',

    livingSituation: '',
    livingSituationOther: '',
    homeStreet: '',
    homeAptUnit: '',
    homeCity: '',
    homePostalCode: '',
    spareKeyLocation: '',
    hideKeyLocation: '',
    lockboxCode: '',
    otherKeyLocation: '',
    neighborName: '',
    neighborAddress: '',
    neighborPhone: '',
    neighborRelationship: '',
    neighborHasKey: false,
    buildingManager: '',
    buildingManagerPhone: '',
    buzzerCode: '',
    floor: '',
    hasElevator: false,
    hasPets: false,
    petTypes: '',
    petCareContactName: '',
    petCareContactPhone: '',
    petEmergencyNotes: '',
    dailyRoutine: '',

    hasPOA: false,
    poaName: '',
    poaPhone: '',
    poaRelationship: '',
    hasLegalGuardian: false,
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: '',
    hasLivingWill: false,
    livingWillPreferences: '',
    hasPOLST: false,
    resuscitationPreference: '',
    religiousConsiderations: '',
    culturalConsiderations: '',
    burialPreference: '',
    organDonationWishes: '',
    autopsyPreference: '',

    additionalNotes: '',

    allergiesPublic: true,
    medicationsPublic: true,
    conditionsPublic: true,
    emergencyContactsPublic: true,
    emergencyInstructionsPublic: true,
    pregnancyInfoPublic: false,
    pediatricInfoPublic: false,
    homeSafetyPublic: false,
    legalDirectivesPublic: true,
  };
}

export function emptyArrays(): ProfileArrays {
  return {
    allergies: [],
    medications: [],
    conditions: [],
    emergencyContacts: [
      {
        id: makeId(),
        name: '',
        relation: '',
        phone: '',
        email: '',
        priority: 1,
        isPrimary: true,
        availableStart: '',
        availableEnd: '',
        notes: '',
      },
    ],
    authorizedPickup: [],
  };
}

let _idCounter = 0;
export function makeId(): string {
  _idCounter += 1;
  return `${Date.now()}_${_idCounter}`;
}

// ── Reverse mapper: GET /api/profile → flat form state ─────────────────────
// Used when re-opening the wizard to edit an existing profile. Mirrors the
// backend's "exploded" response shape (app/api/profile/route.ts) and re-applies
// the same renames buildPayload does, in reverse. JSON-string fields are
// JSON.parse'd defensively (the route claims to parse them, but old rows can
// still come back as strings).

/* eslint-disable @typescript-eslint/no-explicit-any */
function safeParse(value: unknown, fallback: any[] = []): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function s(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function nStr(v: unknown): string {
  return v == null ? '' : String(v);
}

function b(v: unknown): boolean {
  return v === true;
}

interface ProfileGetResponse {
  user?: any;
  medicalProfile?: any;
  emergencyContacts?: any[];
}

/**
 * Convert a GET /api/profile response into the wizard's flat state + arrays.
 * Returns `null` if the response is empty or unrecognised so the caller can
 * fall back to a fresh form.
 */
export function fromGetProfileResponse(
  resp: ProfileGetResponse | null | undefined
): { data: Partial<ProfileFormData>; arrays: Partial<ProfileArrays> } | null {
  if (!resp || (!resp.user && !resp.medicalProfile)) return null;

  const user = resp.user ?? {};
  const mp = resp.medicalProfile ?? {};
  const ei = mp.emergencyInstructions ?? {};
  const mh = mp.mentalHealthProfile ?? {};
  const pg = mp.pregnancyInfo ?? {};
  const pd = mp.pediatricInfo ?? {};
  const hs = mp.homeSafety ?? {};
  const ld = mp.legalDirectives ?? {};

  const data: Partial<ProfileFormData> = {
    // Step 1 — Basic Info (split between user + medicalProfile)
    phoneNumber: s(user.phoneNumber),
    gender: s(user.gender) as any,
    dateOfBirth: s(user.dateOfBirth),
    address: s(user.address),
    city: s(user.city),
    province: s(user.province),
    postalCode: s(user.postalCode),
    bloodType: s(mp.bloodType),
    height: s(mp.height ?? user.height),
    weight: s(mp.weight),
    photoUrl: s(mp.photoUrl),
    dnrStatus: (s(mp.dnrStatus) || 'no') as any,
    dnrDocumentUrl: s(mp.dnrDocumentUrl),
    dnrDoctorName: s(mp.dnrDoctorName),
    dnrDoctorPhone: s(mp.dnrDoctorPhone),
    dnrHospital: s(mp.dnrHospital),
    organDonorStatus: (s(mp.organDonorStatus) || 'no') as any,
    organDonorCardNumber: s(mp.organDonorCardNumber),
    organDonorProvince: s(mp.organDonorProvince),

    // Step 5 — Emergency Instructions
    cognitiveLevel: s(ei.cognitiveLevel ?? ei.cognitiveStatus),
    cognitiveLevelOther: s(ei.cognitiveLevelOther ?? ei.cognitiveNotes),
    cognitiveBehaviors: safeParse(ei.cognitiveBehaviors),
    communicationTips: s(ei.communicationTips),
    calmingTechniques: s(ei.calmingTechniques),
    livingArrangement: s(ei.livingArrangement),
    careFacilityName: s(ei.careFacilityName),
    careFacilityRoom: s(ei.careFacilityRoom),
    hearingStatus: s(ei.hearingStatus),
    hearingAidLocation: s(ei.hearingAidLocation),
    hearingNotes: safeParse(ei.hearingNotes),
    signLanguageType: s(ei.signLanguageType),
    visionStatus: s(ei.visionStatus),
    visionEyeAffected: s(ei.visionEyeAffected),
    visionNotes: safeParse(ei.visionNotes),
    guideDogName: s(ei.guideDogName),
    primaryLanguage: s(ei.primaryLanguage),
    speaksEnglish: s(ei.speaksEnglish),
    interpreterNeeded: b(ei.interpreterNeeded),
    interpreterName: s(ei.interpreterName),
    interpreterPhone: s(ei.interpreterPhone),
    speechAbility: s(ei.speechAbility ?? ei.communicationNeeds),
    communicationMethod: safeParse(ei.communicationMethod),
    mobilityLevel: s(ei.mobilityLevel),
    mobilityDetails: s(ei.mobilityDetails),
    transferNeeds: safeParse(ei.transferNeeds),
    // REVERSE RENAME: emergencyInstructions.weight (lift planning) → weightForLift
    weightForLift: s(ei.weight),
    transferNotes: s(ei.transferNotes),
    fallRiskLevel: s(ei.fallRiskLevel),
    recentFalls: s(ei.recentFalls),
    fallNotes: s(ei.fallNotes),
    behavioralWarnings: safeParse(ei.behavioralWarnings),
    triggersToAvoid: s(ei.triggersToAvoid),
    deescalationTips: s(ei.deescalationTips),
    medicalDevices: safeParse(ei.medicalDevices),
    pacemakerBrand: s(ei.pacemakerBrand),
    insulinPumpLocation: s(ei.insulinPumpLocation),
    oxygenFlowRate: s(ei.oxygenFlowRate),
    oxygenContinuous: b(ei.oxygenContinuous),
    feedingTubeType: s(ei.feedingTubeType),
    catheterType: s(ei.catheterType),
    prostheticDetails: s(ei.prostheticDetails),
    medPumpDrug: s(ei.medPumpDrug),
    shuntType: s(ei.shuntType),
    otherDevices: s(ei.otherDevices),
    criticalDeviceNotes: s(ei.criticalDeviceNotes),
    deviceSettings: s(ei.deviceSettings),

    // Step 6 — Mental Health (reverse renames)
    mentalHealthConditions: s(mh.hasConditions),
    conditionsMH: safeParse(mh.conditions),
    otherConditionsMH: s(mh.otherConditions),
    currentTreatment: safeParse(mh.currentTreatment),
    psychiatristName: s(mh.psychiatristName),
    psychiatristPhone: s(mh.psychiatristPhone),
    suicideRisk: s(mh.suicideRisk),
    selfHarmRisk: s(mh.selfHarmRisk),
    crisisCounselorName: s(mh.crisisCounselorName),
    crisisCounselorPhone: s(mh.crisisCounselorPhone),
    crisisLine: s(mh.crisisLine),
    mentalTriggers: s(mh.triggersList),
    mentalCalmingTechniques: s(mh.calmingTechniques),
    alcoholUse: s(mh.alcoholUse),
    tobaccoUse: s(mh.tobaccoUse),
    cigarettesPerDay: nStr(mh.cigarettesPerDay),
    quitYear: s(mh.quitYear),
    recreationalDrugUse: s(mh.recreationalDrugUse),
    currentDrugs: s(mh.currentDrugs),
    inRecoveryProgram: b(mh.inRecoveryProgram),
    sponsorName: s(mh.sponsorName),
    sponsorPhone: s(mh.sponsorPhone),
    mentalHealthPrivacy: s(mh.privacyLevel) || 'only_me',

    // Step 7 — Pregnancy
    isPregnant: s(pg.isPregnant),
    weeksPregnant: nStr(pg.weeksPregnant),
    trimester: s(pg.trimester),
    dueDate: s(pg.dueDate),
    isHighRisk: b(pg.isHighRisk),
    highRiskDetails: s(pg.highRiskDetails),
    obgynName: s(pg.obgynName),
    obgynPhone: s(pg.obgynPhone),
    deliveryHospital: s(pg.deliveryHospital),
    previousPregnancies: nStr(pg.previousPregnancies),
    previousComplications: s(pg.previousComplications),
    cSectionHistory: b(pg.cSectionHistory),

    // Step 8 — Pediatric
    schoolName: s(pd.schoolName),
    grade: s(pd.grade),
    teacherName: s(pd.teacherName),
    teacherPhone: s(pd.teacherPhone),
    schoolOfficePhone: s(pd.schoolOfficePhone),
    schoolAddress: s(pd.schoolAddress),
    busNumber: s(pd.busNumber),
    notAuthorized: s(pd.notAuthorized),
    developmentalDelays: safeParse(pd.developmentalDelays),
    hasIEP: b(pd.hasIEP),
    has504Plan: b(pd.has504Plan),
    specialEducation: b(pd.specialEducation),
    behavioralNotes: safeParse(pd.behavioralNotes),
    birthWeight: s(pd.birthWeight),
    birthWeightOz: s(pd.birthWeightOz),
    wasPremature: b(pd.wasPremature),
    prematureWeeks: nStr(pd.prematureWeeks),
    immunizationStatus: s(pd.immunizationStatus),

    // Step 9 — Home Safety (reverse renames home* ↔ street/aptUnit/city/postalCode)
    livingSituation: s(hs.livingSituation),
    livingSituationOther: s(hs.livingSituationOther),
    homeStreet: s(hs.street),
    homeAptUnit: s(hs.aptUnit),
    homeCity: s(hs.city),
    homePostalCode: s(hs.postalCode),
    spareKeyLocation: s(hs.spareKeyLocation),
    hideKeyLocation: s(hs.hideKeyLocation),
    lockboxCode: s(hs.lockboxCode),
    otherKeyLocation: s(hs.otherKeyLocation),
    neighborName: s(hs.neighborName),
    neighborAddress: s(hs.neighborAddress),
    neighborPhone: s(hs.neighborPhone),
    neighborRelationship: s(hs.neighborRelationship),
    neighborHasKey: b(hs.neighborHasKey),
    buildingManager: s(hs.buildingManager),
    buildingManagerPhone: s(hs.buildingManagerPhone),
    buzzerCode: s(hs.buzzerCode),
    floor: s(hs.floor),
    hasElevator: b(hs.hasElevator),
    hasPets: b(hs.hasPets),
    petTypes: s(hs.petTypes),
    petCareContactName: s(hs.petCareContactName),
    petCareContactPhone: s(hs.petCareContactPhone),
    petEmergencyNotes: s(hs.petEmergencyNotes),
    dailyRoutine: s(hs.dailyRoutine),

    // Step 10 — Legal
    hasPOA: b(ld.hasPOA),
    poaName: s(ld.poaName),
    poaPhone: s(ld.poaPhone),
    poaRelationship: s(ld.poaRelationship),
    hasLegalGuardian: b(ld.hasLegalGuardian),
    guardianName: s(ld.guardianName),
    guardianPhone: s(ld.guardianPhone),
    guardianRelationship: s(ld.guardianRelationship),
    hasLivingWill: b(ld.hasLivingWill),
    livingWillPreferences: s(ld.livingWillPreferences),
    hasPOLST: b(ld.hasPOLST),
    resuscitationPreference: s(ld.resuscitationPreference),
    religiousConsiderations: s(ld.religiousConsiderations),
    culturalConsiderations: s(ld.culturalConsiderations),
    burialPreference: s(ld.burialPreference),
    organDonationWishes: s(ld.organDonationWishes),
    autopsyPreference: s(ld.autopsyPreference),

    // Step 12 — Notes (lives in medicalProfile)
    additionalNotes: s(mp.additionalNotes),

    // Visibility flags (default to backend defaults when missing)
    allergiesPublic: mp.allergiesPublic ?? true,
    medicationsPublic: mp.medicationsPublic ?? true,
    conditionsPublic: mp.conditionsPublic ?? true,
    emergencyContactsPublic: mp.emergencyContactsPublic ?? true,
    emergencyInstructionsPublic: mp.emergencyInstructionsPublic ?? true,
    pregnancyInfoPublic: mp.pregnancyInfoPublic ?? false,
    pediatricInfoPublic: mp.pediatricInfoPublic ?? false,
    homeSafetyPublic: mp.homeSafetyPublic ?? false,
    legalDirectivesPublic: mp.legalDirectivesPublic ?? true,
  };

  const arrays: Partial<ProfileArrays> = {
    allergies: (mp.allergyRecords ?? []).map((a: any): AllergyEntry => ({
      id: a.id ?? makeId(),
      allergenName: s(a.allergenName),
      allergyType: s(a.allergyType),
      severity: s(a.severity),
      reactionTypes: safeParse(a.reactionTypes),
      otherReaction: s(a.otherReaction),
      treatmentNotes: s(a.treatmentNotes),
    })),
    medications: (mp.medicationRecords ?? []).map((m: any): MedicationEntry => ({
      id: m.id ?? makeId(),
      medicationName: s(m.medicationName),
      dosage: s(m.dosage),
      dosageUnit: s(m.dosageUnit),
      frequency: s(m.frequency),
      frequencyOther: s(m.frequencyOther),
      timesToTake: safeParse(m.timesToTake),
      criticality: s(m.criticality),
      purpose: s(m.purpose),
      prescribingDoctor: s(m.prescribingDoctor),
      doctorSpecialty: s(m.doctorSpecialty),
      doctorPhone: s(m.doctorPhone),
      specialInstructions: s(m.specialInstructions),
    })),
    conditions: (mp.conditionRecords ?? []).map((c: any): ConditionEntry => ({
      id: c.id ?? makeId(),
      conditionName: s(c.conditionName),
      severity: s(c.severity),
      diagnosisDate: s(c.diagnosisDate),
      diagnosisUnknown: !s(c.diagnosisDate),
      doctorName: s(c.doctorName),
      doctorSpecialty: s(c.doctorSpecialty),
      doctorPhone: s(c.doctorPhone),
      criticalNotes: s(c.criticalNotes),
      status: s(c.status),
    })),
    emergencyContacts: (resp.emergencyContacts ?? []).map((c: any): EmergencyContactEntry => ({
      id: c.id ?? makeId(),
      name: s(c.name),
      relation: s(c.relation),
      phone: s(c.phone),
      email: s(c.email),
      priority: typeof c.priority === 'number' ? c.priority : 1,
      isPrimary: b(c.isPrimary),
      availableStart: s(c.availableStart),
      availableEnd: s(c.availableEnd),
      notes: s(c.notes),
    })),
    authorizedPickup: safeParse(pd.authorizedPickup).map((p: any): AuthorizedPickupEntry => ({
      id: p.id ?? makeId(),
      name: s(p.name),
      relationship: s(p.relationship),
      phone: s(p.phone),
      photoIdRequired: b(p.photoIdRequired),
    })),
  };

  return { data, arrays };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

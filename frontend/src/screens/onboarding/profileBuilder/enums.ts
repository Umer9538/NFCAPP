/**
 * Enum codes and labels for all multi-select / radio fields in the 12-step builder.
 *
 * The CODE values are the exact strings the backend Zod schema accepts. The LABEL
 * values are what we render in the UI — they match the web app's profile-setup
 * page verbatim (see app/auth/profile-setup/page.tsx).
 *
 * Do not change codes without updating the backend.
 */

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

// ── Step 1 ──────────────────────────────────────────────────────────────────

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;

export const PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
] as const;

export const GENDER_OPTIONS: Option[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export const DNR_STATUS_OPTIONS: Option[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'on_file_with_doctor', label: 'On file with doctor' },
];

export const ORGAN_DONOR_OPTIONS: Option[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'registered', label: 'Registered' },
];

// ── Step 2 — Allergies ──────────────────────────────────────────────────────

export const ALLERGY_TYPE_OPTIONS: Option[] = [
  { value: 'food', label: 'Food' },
  { value: 'medication', label: 'Medication' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_OPTIONS: Option[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'life_threatening', label: 'Life-threatening' },
];

/** Severity dropdown options shown with description (matches web Select). */
export const ALLERGY_SEVERITY_DETAILED_OPTIONS: Option[] = [
  { value: 'mild', label: 'Mild - Minor discomfort, no treatment needed' },
  { value: 'moderate', label: 'Moderate - Requires antihistamine/treatment' },
  { value: 'severe', label: 'Severe - May require emergency care' },
  { value: 'life_threatening', label: 'Life-threatening - Anaphylaxis, requires EpiPen' },
];

export const REACTION_TYPE_OPTIONS: Option[] = [
  { value: 'hives', label: 'Hives or rash' },
  { value: 'swelling', label: 'Swelling' },
  { value: 'difficulty_breathing', label: 'Difficulty breathing' },
  { value: 'anaphylaxis', label: 'Anaphylaxis' },
  { value: 'nausea', label: 'Nausea/vomiting' },
  { value: 'other', label: 'Other' },
];

// ── Step 3 — Medications ────────────────────────────────────────────────────

export const DOSAGE_UNIT_OPTIONS: Option[] = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'units', label: 'units' },
  { value: 'mL', label: 'mL' },
  { value: 'tablets', label: 'tablets' },
];

export const MEDICATION_FREQUENCY_OPTIONS: Option[] = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'every_x_hours', label: 'Every X hours' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'other', label: 'Other' },
];

export const CRITICALITY_OPTIONS: Option[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'important', label: 'Important' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'routine', label: 'Routine' },
];

/** Criticality dropdown options with description (matches the web Select). */
export const CRITICALITY_DETAILED_OPTIONS: Option[] = [
  { value: 'critical', label: 'CRITICAL - Life-threatening if missed' },
  { value: 'important', label: 'Important - Should not skip' },
  { value: 'routine', label: 'Routine - Can occasionally skip' },
  { value: 'as_needed', label: 'As Needed - Only when symptoms occur' },
];

// ── Step 4 — Conditions ─────────────────────────────────────────────────────

export const CONDITION_STATUS_OPTIONS: Option[] = [
  { value: 'active', label: 'Active' },
  { value: 'managed', label: 'Well-managed' },
  { value: 'resolved', label: 'Resolved' },
];

export const DIAGNOSIS_MONTH_OPTIONS: Option[] = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

/** Years from current year back 100 years, for diagnosis-date selection. */
export const DIAGNOSIS_YEAR_OPTIONS: Option[] = (() => {
  const now = new Date().getFullYear();
  const arr: Option[] = [];
  for (let y = now; y >= now - 100; y--) {
    arr.push({ value: String(y), label: String(y) });
  }
  return arr;
})();

// ── Step 5 — Emergency Instructions ─────────────────────────────────────────

export const COGNITIVE_LEVEL_OPTIONS: Option[] = [
  { value: 'alert_oriented', label: 'Alert and oriented (normal)' },
  { value: 'mild_memory_loss', label: 'Mild memory loss' },
  { value: 'moderate_dementia', label: 'Moderate dementia' },
  { value: 'advanced_alzheimers', label: "Advanced Alzheimer's" },
  { value: 'severe_impairment', label: 'Severe cognitive impairment' },
  { value: 'developmental_disability', label: 'Developmental disability' },
  { value: 'other', label: 'Other' },
];

export const COGNITIVE_BEHAVIOR_OPTIONS: Option[] = [
  { value: 'may_not_recognize_family', label: 'May not recognize family members' },
  { value: 'gets_confused', label: 'Gets confused about time and place' },
  { value: 'wanders', label: 'Wanders or tries to leave' },
  { value: 'agitated', label: 'May become agitated when confused' },
  { value: 'repeats_questions', label: 'Repeats questions frequently' },
  { value: 'forgets_recent', label: 'Forgets recent events' },
  { value: 'sundowning', label: 'Sundowning (worse in evening)' },
  { value: 'resists_help', label: 'May resist help from strangers' },
];

export const LIVING_ARRANGEMENT_OPTIONS: Option[] = [
  { value: 'at_home_family', label: 'At home with family' },
  { value: 'at_home_alone', label: 'At home alone' },
  { value: 'care_facility', label: 'Care facility' },
  { value: 'assisted_living', label: 'Assisted living' },
];

export const HEARING_STATUS_OPTIONS: Option[] = [
  { value: 'normal', label: 'Normal hearing' },
  { value: 'hard_of_hearing', label: 'Hard of hearing' },
  { value: 'deaf', label: 'Deaf (no hearing)' },
  { value: 'hearing_aid', label: 'Uses hearing aid' },
  { value: 'cochlear_implant', label: 'Uses cochlear implant' },
];

export const SIGN_LANGUAGE_TYPE_OPTIONS: Option[] = [
  { value: 'asl', label: 'ASL (American Sign Language)' },
  { value: 'lsq', label: 'LSQ (Langue des signes québécoise)' },
  { value: 'bsl', label: 'BSL (British Sign Language)' },
  { value: 'other', label: 'Other' },
];

export const VISION_STATUS_OPTIONS: Option[] = [
  { value: 'normal', label: 'Normal vision' },
  { value: 'low_vision', label: 'Low vision (partially blind)' },
  { value: 'blind', label: 'Blind (no vision)' },
  { value: 'glasses_contacts', label: 'Wears glasses/contacts' },
  { value: 'one_eye', label: 'Vision in one eye only' },
];

export const VISION_EYE_AFFECTED_OPTIONS: Option[] = [
  { value: 'left', label: 'Left eye only' },
  { value: 'right', label: 'Right eye only' },
];

export const PRIMARY_LANGUAGE_OPTIONS: Option[] = [
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Cantonese', label: 'Cantonese' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Other', label: 'Other' },
];

export const SPEAKS_ENGLISH_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes, fluently' },
  { value: 'some', label: 'Some English (limited)' },
  { value: 'no', label: 'No English' },
];

export const SPEECH_ABILITY_OPTIONS: Option[] = [
  { value: 'normal', label: 'Speaks normally' },
  { value: 'stutter', label: 'Stutter or speech impediment' },
  { value: 'slurred', label: 'Slurred speech (stroke)' },
  { value: 'non_verbal', label: 'Non-verbal (cannot speak)' },
  { value: 'communication_device', label: 'Uses communication device' },
];

export const COMMUNICATION_METHOD_OPTIONS: Option[] = [
  { value: 'gestures', label: 'Gestures and pointing' },
  { value: 'writing', label: 'Writing/typing' },
  { value: 'picture_board', label: 'Picture board' },
  { value: 'tablet_app', label: 'Tablet/phone app' },
  { value: 'eye_gaze', label: 'Eye gaze device' },
];

export const MOBILITY_LEVEL_OPTIONS: Option[] = [
  { value: 'fully_mobile', label: 'Fully mobile (walks independently)' },
  { value: 'cane', label: 'Uses cane' },
  { value: 'walker', label: 'Uses walker' },
  { value: 'wheelchair_manual', label: 'Wheelchair (manual)' },
  { value: 'wheelchair_electric', label: 'Wheelchair (electric)' },
  { value: 'bedridden', label: 'Bedridden' },
  { value: 'amputee', label: 'Amputee' },
  { value: 'paralyzed', label: 'Paralyzed' },
];

export const TRANSFER_NEEDS_OPTIONS: Option[] = [
  { value: 'one_person', label: '1-person assist' },
  { value: 'two_person', label: '2-person assist' },
  { value: 'hoyer_lift', label: 'Hoyer lift required' },
  { value: 'slide_board', label: 'Slide board' },
  { value: 'gait_belt', label: 'Gait belt' },
];

export const FALL_RISK_OPTIONS: Option[] = [
  { value: 'low', label: 'Low risk (stable)' },
  { value: 'moderate', label: 'Moderate risk (some falls)' },
  { value: 'high', label: 'High risk (frequent falls)' },
  { value: 'very_high', label: 'Very high risk (daily falls)' },
];

export const RECENT_FALLS_OPTIONS: Option[] = [
  { value: 'none_6months', label: 'None in last 6 months' },
  { value: 'one_6months', label: '1 fall in last 6 months' },
  { value: 'multiple_6months', label: 'Multiple falls in last 6 months' },
  { value: 'weekly', label: 'Falls weekly' },
  { value: 'daily', label: 'Falls daily' },
];

export const BEHAVIORAL_WARNINGS_OPTIONS: Option[] = [
  { value: 'combative', label: 'May become combative when confused' },
  { value: 'resists_restraints', label: 'May resist physical restraints (PTSD)' },
  { value: 'flee_wander', label: 'May try to flee or wander' },
  { value: 'bite_scratch_hit', label: 'May bite, scratch, or hit when frightened' },
  { value: 'afraid_uniforms', label: 'Afraid of uniforms/authority figures' },
  { value: 'violent_outbursts', label: 'Violent outbursts possible' },
  { value: 'self_harm', label: 'Self-harm risk' },
  { value: 'elopement', label: 'Elopement risk (tries to escape)' },
];

export const MEDICAL_DEVICE_OPTIONS: Option[] = [
  { value: 'pacemaker', label: 'Pacemaker' },
  { value: 'icd', label: 'ICD (Defibrillator)' },
  { value: 'insulin_pump', label: 'Insulin pump' },
  { value: 'cgm', label: 'Glucose monitor (CGM)' },
  { value: 'oxygen', label: 'Oxygen tank' },
  { value: 'cpap', label: 'CPAP/BiPAP' },
  { value: 'feeding_tube', label: 'Feeding tube' },
  { value: 'catheter', label: 'Urinary catheter' },
  { value: 'colostomy', label: 'Colostomy bag' },
  { value: 'prosthetic', label: 'Prosthetic limb' },
  { value: 'cochlear', label: 'Cochlear implant' },
  { value: 'ventilator', label: 'Ventilator' },
  { value: 'tracheostomy', label: 'Tracheostomy' },
  { value: 'med_pump', label: 'Medication pump (pain/chemo)' },
  { value: 'shunt', label: 'VP/VA Shunt' },
];

export const FEEDING_TUBE_TYPE_OPTIONS: Option[] = [
  { value: 'ng', label: 'NG (Nasogastric)' },
  { value: 'peg', label: 'PEG (Gastrostomy)' },
  { value: 'j_tube', label: 'J-tube (Jejunostomy)' },
  { value: 'gj_tube', label: 'GJ-tube (Gastro-jejunostomy)' },
];

export const CATHETER_TYPE_OPTIONS: Option[] = [
  { value: 'foley', label: 'Foley (indwelling)' },
  { value: 'suprapubic', label: 'Suprapubic' },
  { value: 'condom', label: 'Condom catheter' },
  { value: 'intermittent', label: 'Intermittent self-cath' },
];

export const SHUNT_TYPE_OPTIONS: Option[] = [
  { value: 'vp', label: 'VP (Ventriculoperitoneal)' },
  { value: 'va', label: 'VA (Ventriculoatrial)' },
  { value: 'lp', label: 'LP (Lumboperitoneal)' },
];

// ── Step 6 — Mental Health ──────────────────────────────────────────────────

export const HAS_CONDITIONS_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

// Web stores the display strings as the values (e.g. "Depression"). We mirror
// that so the data round-trips perfectly with the web app.
export const MH_CONDITION_OPTIONS: Option[] = [
  'Depression',
  'Anxiety',
  'Bipolar',
  'PTSD',
  'Schizophrenia',
  'Panic disorder',
  'OCD',
  'Autism',
  'ADHD',
  'Eating disorder',
].map((c) => ({ value: c, label: c }));

export const TREATMENT_OPTIONS: Option[] = [
  { value: 'medication', label: 'Taking medication' },
  { value: 'therapy', label: 'Regular therapy/counseling' },
  { value: 'hospitalized_past', label: 'Previously hospitalized' },
  { value: 'support_group', label: 'Support group' },
  { value: 'none', label: 'Not currently in treatment' },
];

export const SUICIDE_RISK_OPTIONS: Option[] = [
  { value: 'no', label: 'No current risk' },
  { value: 'past_attempts', label: 'Past attempts (no current)' },
  { value: 'ideation', label: 'Suicidal ideation (thoughts)' },
  { value: 'high_risk', label: 'High risk (active plan)' },
];

export const SELF_HARM_RISK_OPTIONS: Option[] = [
  { value: 'no', label: 'No current risk' },
  { value: 'past', label: 'Past self-harm (no current)' },
  { value: 'current', label: 'Current self-harm behaviors' },
];

export const ALCOHOL_USE_OPTIONS: Option[] = [
  { value: 'none', label: 'None' },
  { value: 'occasional', label: 'Occasional' },
  { value: 'regular', label: 'Regular' },
  { value: 'heavy', label: 'Heavy use' },
  { value: 'recovering', label: 'Recovering' },
];

export const TOBACCO_USE_OPTIONS: Option[] = [
  { value: 'none', label: 'None' },
  { value: 'vaping', label: 'Vaping' },
  { value: 'cigarettes', label: 'Cigarettes' },
  { value: 'quit', label: 'Quit' },
];

export const RECREATIONAL_DRUG_OPTIONS: Option[] = [
  { value: 'none', label: 'None' },
  { value: 'past', label: 'Past use' },
  { value: 'current', label: 'Current use' },
];

export const PRIVACY_LEVEL_OPTIONS: Option[] = [
  { value: 'only_me', label: 'Only me (completely private)' },
  { value: 'family_guardians', label: 'Family guardians only' },
  { value: 'first_responders', label: 'First responders in emergencies' },
  { value: 'everyone', label: 'Everyone (public on bracelet scan)' },
];

// ── Step 7 — Pregnancy ──────────────────────────────────────────────────────

export const IS_PREGNANT_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'possibly', label: 'Possibly' },
];

export const TRIMESTER_OPTIONS: Option[] = [
  { value: '1st', label: '1st Trimester (1-13 weeks)' },
  { value: '2nd', label: '2nd Trimester (14-26 weeks)' },
  { value: '3rd', label: '3rd Trimester (27+ weeks)' },
];

export const PREVIOUS_PREGNANCIES_OPTIONS: Option[] = [
  { value: '0', label: 'None (first pregnancy)' },
  { value: '1', label: '1 previous pregnancy' },
  { value: '2', label: '2 previous pregnancies' },
  { value: '3+', label: '3 or more' },
];

// ── Step 8 — Pediatric ──────────────────────────────────────────────────────

export const DEVELOPMENTAL_DELAY_OPTIONS: Option[] = [
  { value: 'speech_delay', label: 'Speech delay' },
  { value: 'motor_delay', label: 'Motor delay' },
  { value: 'autism', label: 'Autism/ASD' },
  { value: 'adhd', label: 'ADHD' },
  { value: 'learning_disability', label: 'Learning disability' },
  { value: 'intellectual_disability', label: 'Intellectual disability' },
  { value: 'sensory_processing', label: 'Sensory processing' },
  { value: 'down_syndrome', label: 'Down syndrome' },
  { value: 'cerebral_palsy', label: 'Cerebral palsy' },
];

export const PEDIATRIC_BEHAVIOR_OPTIONS: Option[] = [
  { value: 'nonverbal', label: 'Non-verbal (does not speak)' },
  { value: 'meltdowns', label: 'May have meltdowns when overwhelmed' },
  { value: 'sensitive_sounds', label: 'Sensitive to loud sounds' },
  { value: 'sensitive_touch', label: 'Sensitive to touch' },
  { value: 'runs_away', label: 'May run away (elopement risk)' },
  { value: 'stranger_danger', label: 'Fearful of strangers' },
  { value: 'comfort_object', label: 'Needs comfort object (specify below)' },
  { value: 'routine_dependent', label: 'Routine-dependent (changes cause distress)' },
];

export const IMMUNIZATION_OPTIONS: Option[] = [
  { value: 'up_to_date', label: 'Up to date' },
  { value: 'partial', label: 'Partially vaccinated' },
  { value: 'not_vaccinated', label: 'Not vaccinated' },
  { value: 'medical_exemption', label: 'Medical exemption' },
];

// ── Step 9 — Home Safety ────────────────────────────────────────────────────

export const LIVING_SITUATION_OPTIONS: Option[] = [
  { value: 'lives_alone', label: 'Lives alone' },
  { value: 'lives_with_family', label: 'Lives with family' },
  { value: 'care_facility', label: 'Care facility' },
  { value: 'assisted_living', label: 'Assisted living' },
  { value: 'nursing_home', label: 'Nursing home' },
  { value: 'other', label: 'Other' },
];

export const SPARE_KEY_OPTIONS: Option[] = [
  { value: 'under_doormat', label: 'Under doormat' },
  { value: 'with_neighbor', label: 'With neighbor' },
  { value: 'hide_a_key', label: 'Hide-a-key' },
  { value: 'building_manager', label: 'Building manager has key' },
  { value: 'lockbox', label: 'Lockbox' },
  { value: 'no_spare_key', label: 'No spare key' },
  { value: 'other', label: 'Other' },
];

// ── Step 10 — Legal ─────────────────────────────────────────────────────────

export const RESUSCITATION_OPTIONS: Option[] = [
  { value: 'full_treatment', label: 'Full treatment - do everything possible' },
  { value: 'limited_treatment', label: 'Limited treatment - some interventions' },
  { value: 'comfort_only', label: 'Comfort only - no aggressive measures' },
];

export const BURIAL_OPTIONS: Option[] = [
  { value: 'burial', label: 'Traditional burial' },
  { value: 'cremation', label: 'Cremation' },
  { value: 'donation_to_science', label: 'Donation to science' },
  { value: 'no_preference', label: 'No preference' },
];

// ── Step 11 — Contacts ──────────────────────────────────────────────────────

export const RELATION_OPTIONS: Option[] = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Caregiver', label: 'Caregiver' },
  { value: 'Other', label: 'Other' },
];

// ── Hearing Aid Location (free text on web — kept for backward compat) ─────
export const HEARING_AID_LOCATION_OPTIONS: Option[] = [
  { value: 'left', label: 'Left ear' },
  { value: 'right', label: 'Right ear' },
  { value: 'both', label: 'Both ears' },
];

// ── Autopsy (not in web Step 10 — kept for backwards compat / data shape) ──
export const AUTOPSY_OPTIONS: Option[] = [
  { value: 'allow', label: 'Allow' },
  { value: 'do_not_allow', label: 'Do not allow' },
  { value: 'no_preference', label: 'No preference' },
];

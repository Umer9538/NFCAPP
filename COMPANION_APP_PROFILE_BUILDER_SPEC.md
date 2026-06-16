# MedGuard — 12-Step Profile Builder Specification (Companion App)

**Audience:** React Native companion app developer
**Source of truth:** the Next.js web platform repo (this repo) — every fact below is taken verbatim from the codebase, with file references so you can open the original.
**Goal:** let you rebuild the 12-step medical profile builder in React Native against the **same backend** (same database, same API routes). You do **not** need to build a new backend — reuse the existing API.

---

## 0. TL;DR — what you actually need to build

1. **Auth** is already done in the app (Google login). The backend returns a **session token** on login — store it and send it as `Authorization: Bearer <token>` on every API call. ([§2](#2-authentication--how-the-app-talks-to-the-backend))
2. After signup, the backend tells you `requiresProfileSetup: true`. That's your cue to launch the 12-step builder. ([§2](#2-authentication--how-the-app-talks-to-the-backend))
3. Build **12 screens** (2 are conditional — shown only for certain age/gender). ([§3](#3-the-12-steps-overview))
4. Collect the fields in [§5](#5-full-field-reference-per-step), assemble the **one big JSON payload** in [§6](#6-submission--the-single-most-important-endpoint), and `POST /api/auth/profile-setup`.
5. To **edit** an existing profile later, `GET /api/profile` to load it back. ([§7](#7-loading-an-existing-profile-for-editview))
6. (Optional but recommended) implement **draft auto-save** so a half-finished profile survives the app being closed. ([§8](#8-draft-auto-save--resume-optional-but-recommended))
7. (Optional) wire up **medical-term verification** (the green/amber chips) and **file upload** (D
NR docs, profile photo). ([§9](#9-medical-term-verification-waterfall), [§10](#10-file-upload-photos--documents))

---

## 1. Context

**MedGuard / NFC Medical Profile Platform** stores an emergency medical profile that first responders read by tapping an NFC bracelet. The **profile builder** is the onboarding wizard that captures that profile. It is organized into **12 tabs/steps**, two of which (Pregnancy, Pediatric) only appear for certain users.

Key web files (for reference — you are re-implementing these in RN):

| Concern | File |
|---|---|
| The 12-step wizard UI + state | [app/auth/profile-setup/page.tsx](../app/auth/profile-setup/page.tsx) (~6,800 lines) |
| **Submit endpoint** (guardian/self) | [app/api/auth/profile-setup/route.ts](../app/api/auth/profile-setup/route.ts) |
| Submit endpoint (dependent) | [app/api/dependents/route.ts](../app/api/dependents/route.ts) |
| Load profile (for edit) | [app/api/profile/route.ts](../app/api/profile/route.ts) |
| Draft auto-save | [app/api/onboarding/draft/route.ts](../app/api/onboarding/draft/route.ts), [lib/hooks/useOnboardingDraft.ts](../lib/hooks/useOnboardingDraft.ts) |
| Age-based field rules | [lib/validation/age-rules.ts](../lib/validation/age-rules.ts) |
| Term verification (waterfall) | [app/api/waterfall/route.ts](../app/api/waterfall/route.ts), [lib/waterfall/types.ts](../lib/waterfall/types.ts) |
| File upload | [app/api/upload/route.ts](../app/api/upload/route.ts) |
| DB schema | [prisma/schema.prisma](../prisma/schema.prisma) (models `MedicalProfile`, `Allergy`, `Medication`, etc.) |

---

## 2. Authentication — how the app talks to the backend

The backend accepts **two** auth mechanisms; the mobile app uses the **Bearer token** one.

From [lib/auth.ts](../lib/auth.ts):
> `getSession()` first tries `Authorization: Bearer <token>` (for mobile clients), then falls back to a `session` cookie (for web).

So for **every authenticated request**, send:

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Where the token comes from
On Google mobile signup/login, the backend returns the token. From [app/api/auth/google/mobile/complete/route.ts](../app/api/auth/google/mobile/complete/route.ts):

```jsonc
{
  "success": true,
  "message": "Account created successfully",
  "isNewUser": true,
  "requiresProfileSetup": true,   // ← if true, launch the 12-step builder
  "token": "<session token>",      // ← store this
  "accessToken": "<same token>",   // alias
  "user": { "id": "...", "email": "...", "fullName": "...", "username": "...", "phoneNumber": "...", "emailVerified": false }
}
```

**Store `token` securely** (e.g. `expo-secure-store` / Keychain). Keep `user.id` too — you'll need it as `userId` in the submit payload.

> Related mobile auth routes already exist: `/api/auth/google/mobile`, `/api/auth/google/mobile/complete`, `/api/auth/apple/mobile`, `/api/auth/apple/mobile/complete`, `/api/auth/me` (returns the current user).

---

## 3. The 12 steps (overview)

From the `allSteps` array in [app/auth/profile-setup/page.tsx](../app/auth/profile-setup/page.tsx#L684):

| # | Title | Description | Conditional? |
|---|---|---|---|
| 1 | **Basic Info** | Personal information | Always |
| 2 | **Allergies** | Allergy information | Always |
| 3 | **Medications** | Current medications | Always |
| 4 | **Conditions** | Medical conditions | Always |
| 5 | **Emergency Instructions** | First-responder info (cognitive, communication, mobility, behavioral, devices) | Always |
| 6 | **Mental Health** | Mental health info | Always |
| 7 | **Pregnancy** | Pregnancy info | **Only if female & age 12–55** |
| 8 | **Pediatric** | Child info | **Only if age < 18** |
| 9 | **Home Safety** | Home & access info | Always |
| 10 | **Legal** | Legal directives | Always |
| 11 | **Contacts** | Emergency contacts | Always (≥1 required) |
| 12 | **Notes** | Additional notes | Always |

**Conditional logic** (compute from DOB + gender entered in Step 1) — from [lib/validation/age-rules.ts](../lib/validation/age-rules.ts):

```ts
// Pregnancy tab: gender === "female" AND 12 <= age <= 55
showPregnancyTab = gender.toLowerCase() === "female" && age >= 12 && age <= 55

// Pediatric tab: age < 18
showPediatricTab = age !== null && age < 18
```

So your step count is dynamic: an adult male sees **10** steps; a 30-year-old pregnant woman sees **11**; a 10-year-old sees **11** (pediatric, no pregnancy). The progress bar in the web app is `currentStep / totalSteps` where `totalSteps` is the count **after filtering** the conditional steps.

> **Tip:** keep the conditional steps in the array but skip/hide them, OR rebuild the visible-steps list whenever DOB/gender changes. The web app filters: `steps = allSteps.filter(s => !s.conditional || s.show)`.

---

## 4. Data shapes at a glance

The wizard keeps three kinds of state:

1. **`formData`** — one big flat object of scalar fields (most steps write here).
2. **Array states** — `allergies[]`, `medications[]`, `conditions[]`, `emergencyContacts[]`, `authorizedPickup[]` (repeatable entries).
3. On submit, everything is reshaped into a **nested payload** (see [§6](#6-submission--the-single-most-important-endpoint)).

⚠️ **Important:** some flat `formData` field names are **renamed** when assembled into the payload. These are called out in [§6](#6-submission--the-single-most-important-endpoint). Use the **payload** names as your contract with the backend; the flat names are just the web app's internal UI state.

### Array entry TypeScript interfaces (verbatim, from the wizard)

```ts
interface AllergyEntry {
  id: string;
  allergenName: string;
  allergyType: string;       // food | medication | environmental | other
  severity: string;          // mild | moderate | severe | life_threatening
  reactionTypes: string[];   // e.g. ["hives","swelling","difficulty_breathing","anaphylaxis","nausea","other"]
  otherReaction: string;
  treatmentNotes: string;
}

interface MedicationEntry {
  id: string;
  medicationName: string;
  dosage: string;
  dosageUnit: string;        // mg | mcg | units | mL | tablets
  frequency: string;         // once_daily | twice_daily | three_times_daily | every_x_hours | as_needed | weekly | other
  frequencyOther: string;
  timesToTake: string[];     // e.g. ["08:00","20:00"]
  criticality: string;       // critical | important | routine | as_needed
  purpose: string;
  prescribingDoctor: string;
  doctorSpecialty: string;
  doctorPhone: string;
  specialInstructions: string;
}

interface ConditionEntry {
  id: string;
  conditionName: string;
  severity: string;          // mild | moderate | severe | life_threatening
  diagnosisDate: string;     // free text, "Month/Year"
  doctorName: string;
  doctorSpecialty: string;
  doctorPhone: string;
  criticalNotes: string;
  status: string;            // active | resolved | managed
}

interface EmergencyContactEntry {
  id: string;
  name: string;              // required
  relation: string;
  phone: string;             // required
  email: string;
  priority: number;          // 1 = primary
  isPrimary: boolean;
  availableStart: string;    // "HH:mm"  (UI only — not sent in submit payload)
  availableEnd: string;      // "HH:mm"  (UI only — not sent in submit payload)
  notes: string;
}

interface AuthorizedPickupEntry {   // pediatric step
  id: string;
  name: string;
  relationship: string;
  phone: string;
  photoIdRequired: boolean;
}
```

> `id` on array entries is a **client-side** key only (the web app generates one per row). The backend ignores it and assigns its own DB ids. Generate locally (e.g. `react-native-uuid` or `Date.now()+index`).

---

## 5. Full field reference per step

This section lists, per step, the fields and their allowed values. Unless noted, all fields are **optional strings**. Boolean fields default to `false`; array fields default to `[]`.

### Constants / enums you'll reuse

From [database/types/medical.types.ts](../database/types/medical.types.ts) and [lib/waterfall/types.ts](../lib/waterfall/types.ts):

```ts
BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown']

ALLERGY_SEVERITIES = ['mild','moderate','severe','life-threatening']

MEDICATION_FREQUENCIES = ['Once daily','Twice daily','Three times daily','Four times daily',
  'Every 4 hours','Every 6 hours','Every 8 hours','Every 12 hours',
  'As needed','Once weekly','Once monthly','Custom']

// Quick-select suggestion chips
COMMON_ALLERGIES = ['Penicillin','Sulfa drugs','Aspirin','Ibuprofen','Codeine','Morphine','Latex',
  'Peanuts','Tree nuts','Shellfish','Eggs','Dairy/Milk','Soy','Wheat/Gluten','Bee stings']

COMMON_MEDICATIONS = [
  {name:'Metformin',purpose:'Diabetes'}, {name:'Insulin',purpose:'Diabetes'},
  {name:'Lisinopril',purpose:'Blood Pressure'}, {name:'Atorvastatin',purpose:'Cholesterol'},
  {name:'Levothyroxine',purpose:'Thyroid'}, {name:'Albuterol',purpose:'Asthma'},
  {name:'Warfarin',purpose:'Blood Thinner'}, {name:'Aspirin 81mg',purpose:'Heart'},
  {name:'Omeprazole',purpose:'Reflux'}, {name:'Metoprolol',purpose:'Heart'}]

COMMON_CONDITIONS = ['Type 2 Diabetes','Type 1 Diabetes','High Blood Pressure','High Cholesterol',
  'Asthma','COPD','Heart Disease','Epilepsy','Stroke History','Kidney Disease','Liver Disease']
```

---

### STEP 1 — Basic Info
Splits into two payload objects on submit: `basicInfo` and `medicalProfile` (Tab-1 medical bits).

| Field | Type / values | Notes |
|---|---|---|
| `phoneNumber` | string | **Required** by backend |
| `gender` | `male` \| `female` \| `other` \| `prefer-not-to-say` | **Required**; drives Pregnancy tab |
| `dateOfBirth` | string (ISO date) | **Required**; drives age logic |
| `address`, `city`, `province`, `postalCode` | string | optional |
| `bloodType` | one of `BLOOD_TYPES` | |
| `height` | string (cm) | sent in both `basicInfo` and `medicalProfile` |
| `weight` | string (kg) | |
| `photoUrl` | string | S3 key/URL from [§10](#10-file-upload-photos--documents) |
| `dnrStatus` | `no` \| `yes` \| `on_file_with_doctor` | default `no` |
| `dnrDocumentUrl` | string | uploaded doc |
| `dnrDoctorName`, `dnrDoctorPhone`, `dnrHospital` | string | |
| `organDonorStatus` | `no` \| `yes` \| `registered` | default `no` |
| `organDonorCardNumber`, `organDonorProvince` | string | |

---

### STEP 2 — Allergies
Repeatable list of `AllergyEntry` (see [§4](#4-data-shapes-at-a-glance)). On submit, only rows with a non-empty `allergenName` are sent. Each row: `allergenName` (required if present), `allergyType`, `severity`, `reactionTypes[]`, `otherReaction`, `treatmentNotes`.

---

### STEP 3 — Medications
Repeatable list of `MedicationEntry`. Only rows with non-empty `medicationName` are sent. Supports Canadian **DIN** (8-digit Drug Identification Number) lookup and RxNorm verification (see [§9](#9-medical-term-verification-waterfall)).

---

### STEP 4 — Conditions
Repeatable list of `ConditionEntry`. Only rows with non-empty `conditionName` are sent.

---

### STEP 5 — Emergency Instructions
The largest step. All fields live on `formData` and are sent under the `emergencyInstructions` object. (DB model: `EmergencyInstructions`, [prisma/schema.prisma](../prisma/schema.prisma#L398).)

**A. Cognitive**
- `cognitiveLevel`: `alert_oriented` | `mild_memory_loss` | `moderate_dementia` | `advanced_alzheimers` | `severe_impairment` | `developmental_disability` | `other`
- `cognitiveLevelOther` (string)
- `cognitiveBehaviors` (string[]): `may_not_recognize_family`, `gets_confused`, `wanders`, `agitated`, `repeats_questions`, `forgets_recent`, `sundowning`, `resists_help`
- `communicationTips`, `calmingTechniques` (string)
- `livingArrangement`: `at_home_family` | `at_home_alone` | `care_facility` | `assisted_living`
- `careFacilityName`, `careFacilityRoom` (string)

**B. Communication — Hearing**
- `hearingStatus`: `normal` | `hard_of_hearing` | `deaf` | `hearing_aid` | `cochlear_implant`
- `hearingAidLocation`: `left` | `right` | `both`
- `hearingNotes` (string[]): `face_when_speaking`, `sign_language`, `speak_loudly`, `cannot_hear_alarms`, `write_notes`
- `signLanguageType`: `asl` | `other`

**B. Communication — Vision**
- `visionStatus`: `normal` | `low_vision` | `blind` | `glasses_contacts` | `one_eye`
- `visionEyeAffected`: `left` | `right`
- `visionNotes` (string[]): `announce_yourself`, `guide_dog`, `describe_actions`, `cannot_see_written`, `cannot_see_signals`
- `guideDogName` (string)

**B. Communication — Language**
- `primaryLanguage` (string)
- `speaksEnglish`: `yes` | `no` | `limited`
- `interpreterNeeded` (boolean), `interpreterName`, `interpreterPhone`

**B. Communication — Speech**
- `speechAbility`: `normal` | `stutter` | `slurred` | `non_verbal` | `communication_device`
- `communicationMethod` (string[]): `writing`, `picture_board`, `device_app`, `yes_no_only`, `gestures`

**C. Mobility**
- `mobilityLevel`: `fully_mobile` | `cane` | `walker` | `wheelchair_manual` | `wheelchair_electric` | `bedridden` | `amputee` | `paralyzed`
- `mobilityDetails` (string — which limb)
- `transferNeeds` (string[]): `requires_two_people`, `can_bear_weight`, `cannot_stand`, `slide_board`, `wheelchair_always`
- `weightForLift` → sent as `weight` (string, for lift planning) — **note the rename**
- `transferNotes` (string)
- `fallRiskLevel`: `low` | `moderate` | `high` | `very_high`
- `recentFalls`: `none_6months` | `one_two_6months` | `three_plus_6months` | `weekly`
- `fallNotes` (string)

**D. Behavioral**
- `behavioralWarnings` (string[]): `combative`, `resists_restraints`, `flee_wander`, `bite_scratch_hit`, `afraid_uniforms`, `violent_outbursts`, `self_harm`, `elopement`
- `triggersToAvoid`, `deescalationTips` (string)

**E. Medical Devices**
- `medicalDevices` (string[]): `pacemaker`, `icd`, `insulin_pump`, `cgm`, `oxygen`, `cpap`, `feeding_tube`, `catheter`, `colostomy`, `prosthetic`, `cochlear`, `med_pump`, `ventilator`, `tracheostomy`, `shunt`, `port_a_cath`
- `pacemakerBrand`, `insulinPumpLocation`, `oxygenFlowRate` (string)
- `oxygenContinuous` (boolean)
- `feedingTubeType`: `g_tube` | `j_tube` | `ng_tube`
- `catheterType`, `prostheticDetails`, `medPumpDrug`, `shuntType`, `otherDevices`, `criticalDeviceNotes`, `deviceSettings` (string)

---

### STEP 6 — Mental Health  *(private by default)*
Sent under `mentalHealth`. DB model `MentalHealthProfile`. **Default privacy `only_me`.**

- `mentalHealthConditions` → sent as `hasConditions`: `yes` | `no` | `prefer_not_to_say` — **note the rename**
- `conditions` (string[]): `depression`, `anxiety`, `bipolar`, `ptsd`, `schizophrenia`, `panic`, `ocd`, `autism`, `adhd`, `eating_disorder`, `substance_use`
- `otherConditions` (string)
- `currentTreatment` (string[]): `medication`, `therapy`, `support_group`, `none`
- `psychiatristName`, `psychiatristPhone` (string)
- `suicideRisk`: `no` | `past_history` | `current`
- `selfHarmRisk`: `no` | `past_history` | `current`
- `crisisCounselorName`, `crisisCounselorPhone`, `crisisLine` (string)
- `mentalTriggers` → sent as `triggersList` (string) — **rename**
- `mentalCalmingTechniques` → sent as `calmingTechniques` (string) — **rename**
- **Substance use** (blocked for under-18 — see [§11](#11-age-based-validation-rules-enforced-server-side)):
  - `alcoholUse`: `none` | `occasional` | `regular` | `heavy` | `recovering`
  - `tobaccoUse`: `none` | `vaping` | `cigarettes` | `quit`
  - `cigarettesPerDay` (number — parse from string; send `null` if empty)
  - `quitYear` (string)
  - `recreationalDrugUse`: `none` | `past` | `current`
  - `currentDrugs` (string)
- `inRecoveryProgram` (boolean), `sponsorName`, `sponsorPhone` (string)
- `mentalHealthPrivacy` → sent as `privacyLevel`: `only_me` | `family_guardians` | `first_responders` | `everyone` — **rename**

---

### STEP 7 — Pregnancy  *(conditional: female, 12–55; private by default)*
Sent under `pregnancyInfo` **only when `showPregnancyTab` is true**, otherwise send `null`.

- `isPregnant`: `yes` | `no` | `possibly`
- `weeksPregnant` (number — parse; `null` if empty)
- `trimester`: `1st` | `2nd` | `3rd`
- `dueDate` (string)
- `isHighRisk` (boolean), `highRiskDetails` (string)
- `obgynName`, `obgynPhone`, `deliveryHospital` (string)
- `previousPregnancies` (number — parse; `null` if empty)
- `previousComplications` (string)
- `cSectionHistory` (boolean)

---

### STEP 8 — Pediatric  *(conditional: age < 18; private by default)*
Sent under `pediatricInfo` **only when `showPediatricTab` is true**, otherwise `null`.

- `schoolName`, `grade`, `teacherName`, `teacherPhone`, `schoolOfficePhone`, `schoolAddress`, `busNumber` (string)
- `authorizedPickup` (array of `AuthorizedPickupEntry`) — sent from the `authorizedPickup` state, not `formData`
- `notAuthorized` (string)
- `developmentalDelays` (string[]): `none`, `speech`, `motor`, `learning`, `other`
- `hasIEP`, `has504Plan`, `specialEducation` (boolean)
- `behavioralNotes` (string[]): `separation_anxiety`, `stranger_anxiety`, `special_needs`, `autism`, `adhd`
- `birthWeight`, `birthWeightOz` (string)
- `wasPremature` (boolean), `prematureWeeks` (number — parse; `null` if empty)
- `immunizationStatus`: `up_to_date` | `partial` | `not_vaccinated` | `medical_exemption`

---

### STEP 9 — Home Safety  *(private by default)*
Sent under `homeSafety`. **Note the address field renames** (the home address fields are prefixed `home*` in `formData`).

- `livingSituation`: `lives_alone` | `lives_with_family` | `care_facility` | `assisted_living` | `nursing_home` | `other`
- `livingSituationOther` (string)
- `homeStreet` → `street`, `homeAptUnit` → `aptUnit`, `homeCity` → `city`, `homePostalCode` → `postalCode` — **renames**
- `spareKeyLocation`: `under_doormat` | `with_neighbor` | `hide_a_key` | `building_manager` | `lockbox` | `no_spare_key` | `other`
- `hideKeyLocation`, `lockboxCode`, `otherKeyLocation` (string)
- `neighborName`, `neighborAddress`, `neighborPhone`, `neighborRelationship` (string), `neighborHasKey` (boolean)
- `buildingManager`, `buildingManagerPhone`, `buzzerCode`, `floor` (string), `hasElevator` (boolean)
- `hasPets` (boolean)
- `petTypes` (string — JSON; in the web app this is a JSON string of `[{type, names}]`)
- `petCareContactName`, `petCareContactPhone`, `petEmergencyNotes` (string)
- `dailyRoutine` (string)

---

### STEP 10 — Legal & Directives
Sent under `legalDirectives`.

- `hasPOA` (boolean), `poaName`, `poaPhone`, `poaRelationship` (string)
- `hasLegalGuardian` (boolean), `guardianName`, `guardianPhone`, `guardianRelationship` (string)
- `hasLivingWill` (boolean), `livingWillPreferences` (string)
- `hasPOLST` (boolean)
- `resuscitationPreference`: `full_treatment` | `limited_treatment` | `comfort_only`
- `religiousConsiderations`, `culturalConsiderations` (string)
- `burialPreference`: `burial` | `cremation` | `donation_to_science` | `no_preference`
- `organDonationWishes` (string)
- `autopsyPreference`: `allow` | `do_not_allow` | `no_preference`

> Note: the schema also has `poaDocumentUrl`, `livingWillDocumentUrl`, `polstDocumentUrl` columns, but the current submit payload does **not** send them. Safe to omit for parity; add later if you implement legal-doc upload.

---

### STEP 11 — Emergency Contacts  *(≥1 required)*
Array of `EmergencyContactEntry`. On submit, only rows where **both `name` and `phone` are non-empty** are sent, and the payload includes: `name` (required), `relation`, `phone` (required), `email`, `priority`, `isPrimary`, `notes`.

⚠️ **The backend requires at least one contact** (`emergencyContacts: z.array(...).min(1)`). Block submission if the list is empty.

> `availableStart`/`availableEnd` exist in the UI but are **not** in the submit payload — don't worry about sending them.

---

### STEP 12 — Additional Notes
- `additionalNotes` (string, free-form, long text) — sent inside the `medicalProfile` object.

---

### Section visibility toggles (privacy)
Each major section has a public/private toggle that controls whether first responders see it on an emergency scan. These are sent inside `medicalProfile`. Defaults from [prisma/schema.prisma](../prisma/schema.prisma#L232):

```ts
allergiesPublic            = true
medicationsPublic          = true
conditionsPublic           = true
emergencyContactsPublic    = true
emergencyInstructionsPublic = true
pregnancyInfoPublic        = false   // private by default
pediatricInfoPublic        = false   // private by default
homeSafetyPublic           = false   // private by default
legalDirectivesPublic      = true
// Mental health uses its own `privacyLevel` field (see Step 6), default "only_me"
```

> The current submit payload's `medicalProfile` object does **not** explicitly send these toggles (the backend applies the defaults above on create). If you add visibility toggles in the app, include them in `medicalProfile`; the backend's Zod schema already accepts all `*Public` booleans.

---

## 6. Submission — the single most important endpoint

**`POST /api/auth/profile-setup`** (guardian / self-signup mode)
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
Backend: [app/api/auth/profile-setup/route.ts](../app/api/auth/profile-setup/route.ts). It validates with Zod, writes everything in **one DB transaction**, sets `user.profileComplete = true`, and creates a session.

This is the **exact** body the web app sends (note the flat→nested renames flagged in [§5](#5-full-field-reference-per-step)):

```jsonc
{
  "userId": "<the logged-in user id>",          // REQUIRED in guardian mode

  "basicInfo": {
    "phoneNumber": "...",                        // required
    "gender": "male|female|other|prefer-not-to-say", // required
    "dateOfBirth": "1990-01-15",                 // required
    "address": "", "city": "", "province": "", "postalCode": "",
    "height": ""
  },

  "medicalProfile": {
    "bloodType": "", "height": "", "weight": "", "photoUrl": "",
    "dnrStatus": "no", "dnrDocumentUrl": "", "dnrDoctorName": "", "dnrDoctorPhone": "", "dnrHospital": "",
    "organDonorStatus": "no", "organDonorCardNumber": "", "organDonorProvince": "",
    "additionalNotes": ""
    // (optionally include *Public visibility booleans here)
  },

  "allergies":   [ /* AllergyEntry rows with non-empty allergenName */ ],
  "medications": [ /* MedicationEntry rows with non-empty medicationName */ ],
  "conditions":  [ /* ConditionEntry rows with non-empty conditionName */ ],

  "emergencyInstructions": {
    "cognitiveLevel": "", "cognitiveLevelOther": "", "cognitiveBehaviors": [],
    "communicationTips": "", "calmingTechniques": "", "livingArrangement": "",
    "careFacilityName": "", "careFacilityRoom": "",
    "hearingStatus": "", "hearingAidLocation": "", "hearingNotes": [], "signLanguageType": "",
    "visionStatus": "", "visionEyeAffected": "", "visionNotes": [], "guideDogName": "",
    "primaryLanguage": "", "speaksEnglish": "", "interpreterNeeded": false, "interpreterName": "", "interpreterPhone": "",
    "speechAbility": "", "communicationMethod": [],
    "mobilityLevel": "", "mobilityDetails": "", "transferNeeds": [],
    "weight": "",                 // ← from formData.weightForLift
    "transferNotes": "", "fallRiskLevel": "", "recentFalls": "", "fallNotes": "",
    "behavioralWarnings": [], "triggersToAvoid": "", "deescalationTips": "",
    "medicalDevices": [], "pacemakerBrand": "", "insulinPumpLocation": "", "oxygenFlowRate": "",
    "oxygenContinuous": false, "feedingTubeType": "", "catheterType": "", "prostheticDetails": "",
    "medPumpDrug": "", "shuntType": "", "otherDevices": "", "criticalDeviceNotes": "", "deviceSettings": ""
  },

  "mentalHealth": {
    "hasConditions": "",          // ← from formData.mentalHealthConditions
    "conditions": [], "otherConditions": "", "currentTreatment": [],
    "psychiatristName": "", "psychiatristPhone": "",
    "suicideRisk": "", "selfHarmRisk": "",
    "crisisCounselorName": "", "crisisCounselorPhone": "", "crisisLine": "",
    "triggersList": "",           // ← from formData.mentalTriggers
    "calmingTechniques": "",      // ← from formData.mentalCalmingTechniques
    "alcoholUse": "", "tobaccoUse": "",
    "cigarettesPerDay": null,     // number or null
    "quitYear": "", "recreationalDrugUse": "", "currentDrugs": "",
    "inRecoveryProgram": false, "sponsorName": "", "sponsorPhone": "",
    "privacyLevel": "only_me"     // ← from formData.mentalHealthPrivacy
  },

  "pregnancyInfo": null,          // object ONLY if showPregnancyTab, else null
  "pediatricInfo": null,          // object ONLY if showPediatricTab, else null

  "homeSafety": {
    "livingSituation": "", "livingSituationOther": "",
    "street": "", "aptUnit": "", "city": "", "postalCode": "",   // ← from formData.home* fields
    "spareKeyLocation": "", "hideKeyLocation": "", "lockboxCode": "", "otherKeyLocation": "",
    "neighborName": "", "neighborAddress": "", "neighborPhone": "", "neighborRelationship": "", "neighborHasKey": false,
    "buildingManager": "", "buildingManagerPhone": "", "buzzerCode": "", "hasElevator": false, "floor": "",
    "hasPets": false, "petTypes": "", "petCareContactName": "", "petCareContactPhone": "", "petEmergencyNotes": "",
    "dailyRoutine": ""
  },

  "legalDirectives": {
    "hasPOA": false, "poaName": "", "poaPhone": "", "poaRelationship": "",
    "hasLegalGuardian": false, "guardianName": "", "guardianPhone": "", "guardianRelationship": "",
    "hasLivingWill": false, "livingWillPreferences": "",
    "hasPOLST": false, "resuscitationPreference": "",
    "religiousConsiderations": "", "culturalConsiderations": "",
    "burialPreference": "", "organDonationWishes": "", "autopsyPreference": ""
  },

  "emergencyContacts": [          // at least ONE row required
    { "name": "Jane Doe", "relation": "Mother", "phone": "+1...", "email": "", "priority": 1, "isPrimary": true, "notes": "" }
  ]
}
```

**`pregnancyInfo` object shape (when shown):**
```jsonc
{ "isPregnant": "", "weeksPregnant": null, "trimester": "", "dueDate": "",
  "isHighRisk": false, "highRiskDetails": "", "obgynName": "", "obgynPhone": "",
  "deliveryHospital": "", "previousPregnancies": null, "previousComplications": "", "cSectionHistory": false }
```

**`pediatricInfo` object shape (when shown):**
```jsonc
{ "schoolName": "", "grade": "", "teacherName": "", "teacherPhone": "", "schoolOfficePhone": "",
  "schoolAddress": "", "busNumber": "", "authorizedPickup": [], "notAuthorized": "",
  "developmentalDelays": [], "hasIEP": false, "has504Plan": false, "specialEducation": false,
  "behavioralNotes": [], "birthWeight": "", "birthWeightOz": "", "wasPremature": false,
  "prematureWeeks": null, "immunizationStatus": "" }
```

### Success response
```jsonc
{ "success": true, "message": "Profile setup completed successfully" }
```
On success the web app redirects to the dashboard. In the app, navigate to your home/dashboard screen and treat the profile as complete.

### Error responses
| Status | Body | Meaning |
|---|---|---|
| 400 | `{ "error": "Validation failed", "details": [...] }` | Zod validation failed (missing required fields, wrong enum) |
| 400 | `{ "error": "Age validation failed", "details": ["..."] }` | Age-rule violation ([§11](#11-age-based-validation-rules-enforced-server-side)) |
| 404 | `{ "error": "User not found" }` | bad `userId` |
| 503 | `{ "error": "...", "code": "TRANSACTION_TIMEOUT" }` | DB busy — retry |
| 500 | `{ "error": "Internal server error" }` | |

### Validation the backend enforces (so validate client-side too)
- `basicInfo.phoneNumber`, `basicInfo.gender`, `basicInfo.dateOfBirth` — **required**
- `basicInfo.gender` must be one of the 4 enum values
- `emergencyContacts` — **at least 1** row, each with non-empty `name` and `phone`
- Allergy/medication/condition rows each need their primary name (`allergenName`/`medicationName`/`conditionName`)

---

## 7. Loading an existing profile (for edit/view)

**`GET /api/profile`** — Headers: `Authorization: Bearer <token>`
Backend: [app/api/profile/route.ts](../app/api/profile/route.ts). Returns the user plus the fully-nested 12-tab profile:

```jsonc
{
  "user": { "id": "...", "fullName": "...", "email": "...", "phoneNumber": "...",
            "gender": "...", "dateOfBirth": "...", "address": "...", "city": "...",
            "province": "...", "postalCode": "...", "height": "...", /* ... */ },
  "medicalProfile": {
    "id": "...", "bloodType": "...", "height": "...", "weight": "...", "photoUrl": "...",
    "dnrStatus": "...", "organDonorStatus": "...", "additionalNotes": "...",
    "allergyRecords": [ /* Allergy rows */ ],
    "medicationRecords": [ /* Medication rows */ ],
    "conditionRecords": [ /* MedicalCondition rows */ ],
    "emergencyInstructions": { /* or null */ },
    "mentalHealthProfile": { /* or null */ },
    "pregnancyInfo": { /* or null */ },
    "pediatricInfo": { /* or null */ },
    "homeSafety": { /* or null */ },
    "legalDirectives": { /* or null */ },
    // ...visibility flags
  },
  "emergencyContacts": [ /* ordered by priority asc */ ],
  "doctorInfo": { /* or null */ },
  "prescriptions": [ ... ]
}
```

> **JSON-array fields come back as strings.** Fields like `reactionTypes`, `timesToTake`, `cognitiveBehaviors`, `medicalDevices`, `conditions`, `developmentalDelays`, `authorizedPickup`, `petTypes`, etc. are stored as **JSON strings** in the DB. The backend `JSON.stringify`s them on write; when you read them back you must `JSON.parse` (guard with try/catch). The GET route parses some of them for you — inspect the actual response and `JSON.parse` any that are still strings.

There are also **granular** sub-resource endpoints if you want per-item editing instead of re-submitting the whole profile:
- `GET/POST /api/profile/allergies`, `PUT/DELETE /api/profile/allergies/[id]`
- `GET/POST /api/profile/medications`, `PUT/DELETE /api/profile/medications/[id]`
- `GET/POST /api/profile/conditions`, `PUT/DELETE /api/profile/conditions/[id]`
- `POST /api/profile/update-visibility` (toggle section public/private)

---

## 8. Draft auto-save & resume (optional but recommended)

So a half-finished profile survives app backgrounding/closing. The web app uses a hybrid **localStorage (instant) + DB (durable)** strategy ([lib/hooks/useOnboardingDraft.ts](../lib/hooks/useOnboardingDraft.ts)). In RN, replace localStorage with **AsyncStorage / MMKV**; the DB endpoint is identical.

**Strategy:**
- On every field change → debounced write to local storage (web uses 500 ms).
- On step change (Next/Back) → `POST /api/onboarding/draft` to persist to DB.
- On mount → restore from DB (if you have a `draftId`) else from local storage.
- On successful final submit → `DELETE /api/onboarding/draft?id=<id>`.

### `POST /api/onboarding/draft` — upsert a draft
Backend: [app/api/onboarding/draft/route.ts](../app/api/onboarding/draft/route.ts). Body:

```jsonc
{
  "id": "<existing draft id, omit on first save to create>",
  "draftType": "guardian",          // "guardian" | "dependent"
  "stepData": { /* your entire formData + arrays snapshot — any JSON */ },
  "currentStep": 5,                 // 1..20
  "routeContext": "/profile-setup", // optional, where to return on resume
  "dependentContext": { /* only for dependent drafts, see §12 */ },
  "validationState": { /* optional */ }
}
```

Response: `{ "success": true, "draft": { "id": "...", "currentStep": 5, "stepData": {...}, "expiresAt": "...", "updatedAt": "..." } }`. **Keep `draft.id`** for subsequent saves.

### `GET /api/onboarding/draft?id=<id>` — restore
Returns `{ success, draft }`. Errors: `404` not found, `410` expired (drafts auto-expire after **7 days** of inactivity), `403` forbidden.

> Drafts can be created **before** the user has an account (`userId` null) and claimed later — relevant for the dependent-first flow ([§12](#12-guardian--dependent-roles)). For the standard logged-in app flow you'll always have a token, so the draft is owned by the user immediately.

### `DELETE /api/onboarding/draft?id=<id>` — clear
Call after successful submit. Idempotent (returns `success` even if already gone).

---

## 9. Medical-term verification (waterfall)

Optional UX nicety: as the user types an allergy / medication / condition, the web app verifies the term and shows a coloured chip (green = verified, amber = needs confirmation, gray = unknown), corrects spelling, and can pull RxNorm/DIN data.

**`POST /api/waterfall`** — Backend: [app/api/waterfall/route.ts](../app/api/waterfall/route.ts).

```jsonc
// Verify a term
{ "action": "verify", "term": "metformin", "type": "medication" }   // type: allergy | medication | condition

// Verify by Canadian DIN (8 digits)
{ "action": "verify-din", "din": "02246978" }
```

Response: `{ "success": true, "result": WaterfallResult }` where `WaterfallResult` ([lib/waterfall/types.ts](../lib/waterfall/types.ts)) is:

```ts
interface WaterfallResult {
  term: string;
  normalizedTerm: string;
  displayName: string;          // Tallman lettering, e.g. "metFORMIN"
  verified: boolean;
  level: 1 | 2 | 3 | 4 | 5 | null; // 1 local NLP, 2 RxNorm, 3 Health Canada, 4 spelling, 5 AI
  source: 'local_nlp'|'rxnorm'|'health_canada'|'spelling_correction'|'gemini_ai'|'user_confirmed'|'none';
  color: ChipColor;             // emerald | amber | gray
  confidence: number;           // 0-100
  rxcui?: string;
  din?: string;
  suggestions?: WaterfallSuggestion[];
  requiresUserConfirmation: boolean;
  processingTimeMs: number;
  cost: number;
}
```

This is **purely additive** — it does not change the submit payload (you still send the plain `allergenName`/`medicationName`/`conditionName` strings). You can ship v1 of the app **without** the waterfall and add it later.

---

## 10. File upload (photos & documents)

For profile photo (`photoUrl`) and DNR/legal documents (`dnrDocumentUrl`, etc.).

**`POST /api/upload`** — `multipart/form-data`, requires `Authorization: Bearer <token>`. Backend: [app/api/upload/route.ts](../app/api/upload/route.ts).

Form fields:
- `file`: the file (required)
- `category`: `dnr` | `profile-photo` | `medical-doc` | `other` (required)

Response: `{ "key": "<S3 object key>", "url": "<signed view URL>", "fileName", "fileSize", "contentType" }`.
**Store the returned `key`** in the profile field (e.g. `photoUrl`). `DELETE /api/upload` with `{ "key": "..." }` to remove.

> Requires S3 to be configured on the backend; returns `503 { error: "File storage not configured" }` otherwise. You can defer photos/docs for a first cut.

---

## 11. Age-based validation rules (enforced server-side)

Computed from `dateOfBirth` (+ `gender`). The backend **rejects** the submit with `400 { error: "Age validation failed", details: [...] }` if violated, so mirror these in the app to avoid round-trips. From [lib/validation/age-rules.ts](../lib/validation/age-rules.ts):

| Rule | Constraint |
|---|---|
| **Tab visibility** — Pregnancy | shown only if `gender === female` AND `12 ≤ age ≤ 55` |
| **Tab visibility** — Pediatric | shown only if `age < 18` |
| Birth weight | only for `age < 3` |
| School info (school/teacher/grade) | only for ages `5–18` |
| Developmental delays (ADHD/learning) | only for `age ≥ 3` |
| Special education (IEP / 504) | only for `age ≥ 5` |
| Substance use (alcohol/tobacco/drugs) | **blocked for `age < 18`** — don't send non-"none" values |
| Guardian required | `age < 13` requires a guardian (relevant to dependent flow) |

Age groups (for UI labels): Infant 0–2, Child 3–12, Adolescent 13–17, Adult 18–64, Senior 65+.

`calculateAge(dob)` is a simple year-diff adjusted for month/day — reproduce it client-side.

---

## 12. Guardian / Dependent roles

The same wizard runs in two modes:

- **Guardian / self mode** (the common case for the app): user fills out **their own** profile. Submit to `POST /api/auth/profile-setup` with `userId`.
- **Dependent mode**: a guardian creates a profile **for someone else** (a child / elderly / vulnerable adult who has no account). The wizard payload is **identical** except:
  - omit `userId`; instead send `draftId`
  - submit to **`POST /api/dependents`** (creates a `FamilyMember` + a relational `MedicalProfile`; ownership inferred from the guardian's session token)
  - draft uses `draftType: "dependent"` and a `dependentContext: { fullName, dateOfBirth, gender, relationship, dependentType: "child"|"elderly"|"vulnerable_adult" }`

**Permissions** (from the platform's role model): a **Guardian** can create/edit dependents' profiles; **Caregiver / second-parent** roles are read/alert-only and are **blocked (403)** from editing medical profiles. If the app supports caregiver accounts, hide the edit/builder UI for them.

For a first version of the companion app, you can implement **guardian/self mode only** and add dependents later.

---

## 13. Suggested build order for the app

1. **Wire auth → token storage** and read `requiresProfileSetup` to decide whether to show the builder. ([§2](#2-authentication--how-the-app-talks-to-the-backend))
2. **Step 1 (Basic Info)** first — it produces DOB + gender, which drive everything else. Compute `age`, `showPregnancyTab`, `showPediatricTab` immediately. ([§3](#3-the-12-steps-overview), [§11](#11-age-based-validation-rules-enforced-server-side))
3. Build the remaining **always-on steps** (2,3,4,5,6,9,10,11,12), then the **conditional** ones (7,8).
4. Implement the **submit assembler** exactly as [§6](#6-submission--the-single-most-important-endpoint) (mind the renames). Get a successful `POST /api/auth/profile-setup` end-to-end.
5. Implement **load/edit** via `GET /api/profile` (remember to `JSON.parse` array fields). ([§7](#7-loading-an-existing-profile-for-editview))
6. Add **draft auto-save** (AsyncStorage + `/api/onboarding/draft`). ([§8](#8-draft-auto-save--resume-optional-but-recommended))
7. Polish: **waterfall chips** ([§9](#9-medical-term-verification-waterfall)) and **file upload** ([§10](#10-file-upload-photos--documents)).

---

## 14. Gotchas checklist

- [ ] Always send `Authorization: Bearer <token>`; the app cannot rely on cookies.
- [ ] `userId` is **required** in guardian-mode submit; it comes from the auth response (`user.id`).
- [ ] **At least one emergency contact** (name + phone) or the submit is rejected.
- [ ] Field **renames** flat→payload: `weightForLift`→`emergencyInstructions.weight`; `mentalHealthConditions`→`mentalHealth.hasConditions`; `mentalTriggers`→`triggersList`; `mentalCalmingTechniques`→`calmingTechniques`; `mentalHealthPrivacy`→`privacyLevel`; `home{Street,AptUnit,City,PostalCode}`→`homeSafety.{street,aptUnit,city,postalCode}`.
- [ ] `pregnancyInfo` / `pediatricInfo` must be **`null`** when their tab isn't shown (don't send empty objects).
- [ ] Numeric fields (`weeksPregnant`, `previousPregnancies`, `cigarettesPerDay`, `prematureWeeks`) must be sent as **number or `null`**, not empty string.
- [ ] Multi-select fields are **arrays of string codes** (use the exact codes listed in [§5](#5-full-field-reference-per-step)).
- [ ] When reading back via `GET /api/profile`, **`JSON.parse`** the array/JSON string fields.
- [ ] Substance-use fields must stay "none"/empty for under-18 users.
- [ ] Mental health, pregnancy, pediatric, home safety default to **private**.

---

*Generated from the web platform codebase. If any field/enum here disagrees with the code, the code wins — the canonical definitions are the Zod schemas in [app/api/auth/profile-setup/route.ts](../app/api/auth/profile-setup/route.ts) and the Prisma models in [prisma/schema.prisma](../prisma/schema.prisma).*

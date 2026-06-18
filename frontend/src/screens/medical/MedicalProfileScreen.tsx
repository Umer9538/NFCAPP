/**
 * Medical Profile Screen — tabbed 12-section editor matching the web's
 * /dashboard/profile page 1:1.
 *
 * Phased rollout:
 *   ✓ Phase 1 (current): Screen shell + tab nav + Basic Info tab + GET /api/profile
 *   · Phase 2: Allergies + Medications + Conditions
 *   · Phase 3: Emergency Instructions (color-coded sections)
 *   · Phase 4: Mental Health + Pregnancy + Home Safety
 *   · Phase 5: Legal + Emergency Contacts + Additional Notes + Save flow
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Heart,
  AlertCircle,
  Pill,
  Activity,
  AlertTriangle,
  Brain,
  Baby,
  Home,
  Scale,
  Users,
  FileText,
  Save,
  ChevronDown,
  Trash2,
  Plus,
  X,
} from 'lucide-react-native';

import { medicalProfileApi } from '@/api/medicalProfile';
import type {
  AllergyRecord,
  BasicInfoForm,
  ConditionRecord,
  EmergencyInstructions,
  HomeSafety,
  LegalDirectives,
  MedicalProfileEmergencyContact,
  MedicalProfileResponse,
  MedicationRecord,
  MentalHealthProfile,
  OrganDonorStatus,
  DnrStatus,
  PregnancyInfo,
  UpdateMedicalProfileBody,
} from '@/types/medicalProfile';
import { PRIMARY, GRAY } from '@/constants/colors';

type TabKey =
  | 'basic'
  | 'allergies'
  | 'medications'
  | 'conditions'
  | 'instructions'
  | 'mental'
  | 'pregnancy'
  | 'pediatric'
  | 'home'
  | 'legal'
  | 'emergency'
  | 'notes';

interface TabDef {
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  conditional?: 'pregnancy' | 'pediatric';
}

const ALL_TABS: TabDef[] = [
  { key: 'basic', label: 'Basic Info', Icon: Heart },
  { key: 'allergies', label: 'Allergies', Icon: AlertCircle },
  { key: 'medications', label: 'Medications', Icon: Pill },
  { key: 'conditions', label: 'Conditions', Icon: Activity },
  { key: 'instructions', label: 'Emergency Instructions', Icon: AlertTriangle },
  { key: 'mental', label: 'Mental Health', Icon: Brain },
  { key: 'pregnancy', label: 'Pregnancy', Icon: Heart, conditional: 'pregnancy' },
  { key: 'pediatric', label: 'Pediatric', Icon: Baby, conditional: 'pediatric' },
  { key: 'home', label: 'Home Safety', Icon: Home },
  { key: 'legal', label: 'Legal & Directives', Icon: Scale },
  { key: 'emergency', label: 'Emergency Contacts', Icon: Users },
  { key: 'notes', label: 'Additional Notes', Icon: FileText },
];

interface AllergyEditRow {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

interface MedicationEditRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface EmergencyContactRow {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority?: number;
  isPrimary?: boolean;
}

const ALLERGY_SEVERITIES: { value: AllergyEditRow['severity']; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const MEDICATION_FREQUENCIES = [
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Three times daily', label: 'Three times daily' },
  { value: 'As needed', label: 'As needed' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function makeId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function severityVariant(s: string | undefined) {
  if (!s) return SEVERITY_VARIANTS.info;
  const v = s.toLowerCase();
  if (v === 'life_threatening' || v === 'life-threatening') return SEVERITY_VARIANTS.danger;
  if (v === 'severe') return SEVERITY_VARIANTS.warning;
  return SEVERITY_VARIANTS.info;
}

function criticalityVariant(c: string | undefined) {
  if (!c) return SEVERITY_VARIANTS.info;
  const v = c.toLowerCase();
  if (v === 'critical') return SEVERITY_VARIANTS.danger;
  if (v === 'important') return SEVERITY_VARIANTS.warning;
  return SEVERITY_VARIANTS.info;
}

const SEVERITY_VARIANTS = {
  danger: { bg: '#fee2e2', fg: '#b91c1c' },
  warning: { bg: '#fef9c3', fg: '#a16207' },
  info: { bg: '#dbeafe', fg: '#1d4ed8' },
  success: { bg: '#dcfce7', fg: '#166534' },
} as const;
const ORGAN_DONOR_OPTIONS: { value: OrganDonorStatus; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'registered', label: 'Registered' },
];
const DNR_OPTIONS: { value: DnrStatus; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'on_file_with_doctor', label: 'On File with Doctor' },
];

function calculateAge(dob: string | null | undefined): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function MedicalProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['medicalProfile', 'full'],
    queryFn: medicalProfileApi.getMedicalProfile,
  });

  const [basicInfo, setBasicInfo] = useState<BasicInfoForm>({
    photoUrl: '',
    bloodType: '',
    height: '',
    weight: '',
    organDonorStatus: '',
    dnrStatus: '',
  });

  // Allergies
  const [allergyRecords, setAllergyRecords] = useState<AllergyRecord[]>([]);
  const [allergies, setAllergies] = useState<AllergyEditRow[]>([]);

  // Medications
  const [medicationRecords, setMedicationRecords] = useState<MedicationRecord[]>([]);
  const [medications, setMedications] = useState<MedicationEditRow[]>([]);

  // Conditions
  const [conditionRecords, setConditionRecords] = useState<ConditionRecord[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  // Read-only sections
  const [emergencyInstructions, setEmergencyInstructions] =
    useState<EmergencyInstructions | null>(null);
  const [mentalHealthProfile, setMentalHealthProfile] =
    useState<MentalHealthProfile | null>(null);
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);
  const [homeSafety, setHomeSafety] = useState<HomeSafety | null>(null);
  const [legalDirectives, setLegalDirectives] = useState<LegalDirectives | null>(
    null,
  );

  // Editable Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactRow[]>(
    [],
  );

  // Editable Additional Notes
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);

  useEffect(() => {
    if (!data?.medicalProfile) return;
    const mp = data.medicalProfile;
    setBasicInfo({
      photoUrl: mp.photoUrl ?? '',
      bloodType: mp.bloodType ?? '',
      height: mp.height ?? '',
      weight: mp.weight ?? '',
      organDonorStatus: (mp.organDonorStatus as OrganDonorStatus) ?? '',
      dnrStatus: (mp.dnrStatus as DnrStatus) ?? '',
    });

    // Allergies: prefer enhanced records, map to legacy editable rows
    if (mp.allergyRecords && mp.allergyRecords.length > 0) {
      setAllergyRecords(mp.allergyRecords);
      setAllergies(
        mp.allergyRecords.map((r) => ({
          id: r.id,
          allergen: r.allergenName ?? '',
          severity: (r.severity as AllergyEditRow['severity']) ?? 'moderate',
          reaction: r.reactionTypes?.join(', ') ?? '',
        })),
      );
    } else {
      setAllergyRecords([]);
      const legacy = (mp.allergies ?? []) as any[];
      setAllergies(
        legacy.map((a, i) =>
          typeof a === 'string'
            ? { id: `${i + 1}`, allergen: a, severity: 'moderate', reaction: '' }
            : {
                id: a.id ?? `${i + 1}`,
                allergen: a.allergen ?? '',
                severity: (a.severity as AllergyEditRow['severity']) ?? 'moderate',
                reaction: a.reaction ?? '',
              },
        ),
      );
    }

    // Medications
    if (mp.medicationRecords && mp.medicationRecords.length > 0) {
      setMedicationRecords(mp.medicationRecords);
      setMedications(
        mp.medicationRecords.map((r) => ({
          id: r.id,
          name: r.medicationName ?? '',
          dosage: r.dosage
            ? `${r.dosage}${r.dosageUnit ? ` ${r.dosageUnit}` : ''}`.trim()
            : '',
          frequency: r.frequency ?? '',
        })),
      );
    } else {
      setMedicationRecords([]);
      const legacy = (mp.medications ?? []) as any[];
      setMedications(
        legacy.map((m, i) =>
          typeof m === 'string'
            ? { id: `${i + 1}`, name: m, dosage: '', frequency: '' }
            : {
                id: m.id ?? `${i + 1}`,
                name: m.name ?? '',
                dosage: m.dosage ?? '',
                frequency: m.frequency ?? '',
              },
        ),
      );
    }

    // Conditions
    if (mp.conditionRecords && mp.conditionRecords.length > 0) {
      setConditionRecords(mp.conditionRecords);
      setConditions(mp.conditionRecords.map((r) => r.conditionName ?? ''));
    } else {
      setConditionRecords([]);
      setConditions(mp.medicalConditions ?? []);
    }

    // Read-only sections
    setEmergencyInstructions(mp.emergencyInstructions ?? null);
    setMentalHealthProfile(mp.mentalHealthProfile ?? null);
    setPregnancyInfo(mp.pregnancyInfo ?? null);
    setHomeSafety(mp.homeSafety ?? null);
    setLegalDirectives(mp.legalDirectives ?? null);

    // Notes
    setEmergencyNotes(mp.emergencyNotes ?? '');
    setAdditionalNotes(mp.additionalNotes ?? '');

    // Emergency contacts
    const contacts = data.emergencyContacts ?? [];
    setEmergencyContacts(
      contacts.map((c: MedicalProfileEmergencyContact) => ({
        id: c.id ?? makeId(),
        name: c.name ?? '',
        relationship: c.relation ?? '',
        phone: c.phone ?? '',
        email: c.email ?? '',
        priority: c.priority,
        isPrimary: c.isPrimary,
      })),
    );
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (body: UpdateMedicalProfileBody) =>
      medicalProfileApi.updateMedicalProfile(body),
    onMutate: () => setSaving(true),
    onSettled: () => setSaving(false),
    onSuccess: () => {
      setSaveResult({ type: 'success', message: 'Profile updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['medicalProfile'] });
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        'Couldn’t save your changes. Please try again.';
      setSaveResult({ type: 'error', message: String(msg) });
    },
  });

  const handleSave = () => {
    setSaveResult(null);
    const body: UpdateMedicalProfileBody = {
      medicalProfile: {
        photoUrl: basicInfo.photoUrl,
        bloodType: basicInfo.bloodType,
        height: basicInfo.height,
        weight: basicInfo.weight,
        isOrganDonor: basicInfo.organDonorStatus === 'yes',
        hasDNR: basicInfo.dnrStatus === 'yes',
        allergies: allergies
          .filter((a) => a.allergen.trim())
          .map((a) => ({
            allergen: a.allergen.trim(),
            severity: a.severity,
            reaction: a.reaction.trim(),
          })),
        medicalConditions: conditions.filter((c) => c.trim()),
        medications: medications
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            frequency: m.frequency.trim(),
          })),
        emergencyNotes,
      },
      emergencyContacts: emergencyContacts
        .filter((c) => c.name.trim() && c.phone.trim())
        .map((c) => ({
          name: c.name.trim(),
          relation: c.relationship.trim(),
          phone: c.phone.trim(),
          email: c.email.trim() || undefined,
        })),
    };
    saveMutation.mutate(body);
  };

  const userAge = calculateAge(data?.user?.dateOfBirth);
  const showPregnancy =
    data?.user?.gender === 'female' && userAge >= 12 && userAge <= 55;
  const showPediatric = userAge > 0 && userAge < 18;

  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter((t) => {
        if (t.conditional === 'pregnancy') return showPregnancy;
        if (t.conditional === 'pediatric') return showPediatric;
        return true;
      }),
    [showPregnancy, showPediatric],
  );

  const activeIndex = Math.max(
    0,
    visibleTabs.findIndex((t) => t.key === activeTab),
  );
  const progressPct = ((activeIndex + 1) / visibleTabs.length) * 100;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      {/* Fixed top section — Header + TabBar live OUTSIDE the vertical scroller
          so the tab row's horizontal scroll receives gestures directly. */}
      <View style={styles.topFixed}>
        <Header />
        <TabBar
          tabs={visibleTabs}
          activeKey={activeTab}
          onChange={setActiveTab}
          progressPct={progressPct}
        />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.cardLoading}>
            <ActivityIndicator color={PRIMARY[600]} />
            <Text style={styles.cardLoadingText}>Loading your profile…</Text>
          </View>
        ) : isError ? (
          <ErrorCard onRetry={() => navigation.goBack()} />
        ) : (
          <View style={styles.contentCard}>
            {activeTab === 'basic' && (
              <BasicInfoTab
                value={basicInfo}
                onChange={setBasicInfo}
                user={data?.user}
              />
            )}
            {activeTab === 'allergies' && (
              <AllergiesTab
                records={allergyRecords}
                rows={allergies}
                onChange={setAllergies}
              />
            )}
            {activeTab === 'medications' && (
              <MedicationsTab
                records={medicationRecords}
                rows={medications}
                onChange={setMedications}
              />
            )}
            {activeTab === 'conditions' && (
              <ConditionsTab
                records={conditionRecords}
                conditions={conditions}
                onChange={setConditions}
                newCondition={newCondition}
                setNewCondition={setNewCondition}
              />
            )}
            {activeTab === 'instructions' && (
              <EmergencyInstructionsTab data={emergencyInstructions} />
            )}
            {activeTab === 'mental' && (
              <MentalHealthTab data={mentalHealthProfile} />
            )}
            {activeTab === 'pregnancy' && (
              <PregnancyTab data={pregnancyInfo} />
            )}
            {activeTab === 'home' && <HomeSafetyTab data={homeSafety} />}
            {activeTab === 'legal' && <LegalTab data={legalDirectives} />}
            {activeTab === 'emergency' && (
              <EmergencyContactsTab
                contacts={emergencyContacts}
                onChange={setEmergencyContacts}
              />
            )}
            {activeTab === 'notes' && (
              <NotesTab
                value={emergencyNotes}
                onChange={setEmergencyNotes}
                extended={additionalNotes}
              />
            )}
            {activeTab === 'pediatric' && (
              <ComingSoonTab tabLabel="Pediatric" />
            )}
          </View>
        )}

        <SaveBar
          disabled={isLoading || saving}
          saving={saving}
          onPress={handleSave}
          result={saveResult}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Header
// ──────────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.headerTitle}>Medical Profile</Text>
      <Text style={styles.headerSub}>
        Keep your emergency medical profile up to date. This information will be
        accessible via your NFC bracelet.
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Tab Bar (horizontal scroll)
// ──────────────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeKey,
  onChange,
  progressPct,
}: {
  tabs: TabDef[];
  activeKey: TabKey;
  onChange: (key: TabKey) => void;
  progressPct: number;
}) {
  return (
    <View style={styles.tabCard}>
      <GHScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
        style={styles.tabScrollView}
        decelerationRate="fast"
      >
        {tabs.map((t) => {
          const active = t.key === activeKey;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={[styles.tabPill, active && styles.tabPillActive]}
            >
              <t.Icon size={14} color={active ? '#fff' : GRAY[600]} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </GHScrollView>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Basic Info tab
// ──────────────────────────────────────────────────────────────────────────

function BasicInfoTab({
  value,
  onChange,
}: {
  value: BasicInfoForm;
  onChange: (next: BasicInfoForm) => void;
  user: MedicalProfileResponse['user'] | undefined;
}) {
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.photoRow}>
        <View style={styles.photoCircle}>
          <Text style={styles.photoPlaceholder}>Profile{'\n'}photo</Text>
          <Pressable style={styles.photoTrash} hitSlop={6}>
            <Trash2 size={14} color="#fff" />
          </Pressable>
        </View>
        <View style={{ flex: 1, paddingTop: 4 }}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.sectionSubtitle}>
            Upload a photo and update your medical details
          </Text>
          <Pressable style={{ marginTop: 6 }} hitSlop={6}>
            <Text style={styles.changePhotoLink}>Change Photo</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ gap: 14 }}>
        <SelectField
          label="Blood Type"
          optional
          value={value.bloodType}
          options={BLOOD_TYPES.map((b) => ({ value: b, label: b }))}
          placeholder="Select…"
          onChange={(v) => onChange({ ...value, bloodType: v })}
        />

        <TextField
          label="Height (cm)"
          optional
          value={value.height}
          onChangeText={(t) => onChange({ ...value, height: t })}
          keyboardType="numeric"
          placeholder="170"
        />

        <TextField
          label="Weight (kg)"
          optional
          value={value.weight}
          onChangeText={(t) => onChange({ ...value, weight: t })}
          keyboardType="numeric"
          placeholder="70"
        />

        <SelectField
          label="Organ Donor Status"
          optional
          value={value.organDonorStatus}
          options={ORGAN_DONOR_OPTIONS}
          placeholder="No"
          onChange={(v) =>
            onChange({ ...value, organDonorStatus: v as OrganDonorStatus })
          }
        />

        <SelectField
          label="DNR Status"
          optional
          value={value.dnrStatus}
          options={DNR_OPTIONS}
          placeholder="No"
          onChange={(v) => onChange({ ...value, dnrStatus: v as DnrStatus })}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Coming soon placeholder
// ──────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────
// Allergies tab
// ──────────────────────────────────────────────────────────────────────────

function AllergiesTab({
  records,
  rows,
  onChange,
}: {
  records: AllergyRecord[];
  rows: AllergyEditRow[];
  onChange: (next: AllergyEditRow[]) => void;
}) {
  const addRow = () =>
    onChange([
      ...rows,
      { id: makeId(), allergen: '', severity: 'moderate', reaction: '' },
    ]);
  const updateRow = (id: string, patch: Partial<AllergyEditRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.tabHeaderRow}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <Pressable onPress={addRow} style={styles.smallPrimaryBtn}>
          <Plus size={14} color="#fff" />
          <Text style={styles.smallPrimaryBtnText}>Add Allergy</Text>
        </Pressable>
      </View>

      {records.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={styles.subSectionTitle}>Detailed Allergy Records</Text>
          {records.map((r) => {
            const sv = severityVariant(r.severity);
            return (
              <View key={r.id} style={styles.recordCardRed}>
                <View style={styles.recordCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordTitleRed}>{r.allergenName}</Text>
                    {!!r.allergyType && (
                      <Text style={styles.recordSubRed}>
                        {capitalize(r.allergyType)} allergy
                      </Text>
                    )}
                  </View>
                  {!!r.severity && (
                    <PillBadge bg={sv.bg} fg={sv.fg}>
                      {r.severity.replace(/_/g, ' ')}
                    </PillBadge>
                  )}
                </View>
                {r.reactionTypes && r.reactionTypes.length > 0 && (
                  <Text style={styles.recordMetaText}>
                    <Text style={styles.recordMetaLabel}>Reactions: </Text>
                    {r.reactionTypes.join(', ')}
                  </Text>
                )}
                {!!r.treatmentNotes && (
                  <View style={styles.innerNote}>
                    <Text style={styles.innerNoteText}>
                      <Text style={styles.innerNoteLabel}>Treatment: </Text>
                      {r.treatmentNotes}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: 12 }}>
        {rows.map((row) => (
          <View key={row.id} style={styles.editRow}>
            <TextField
              label="Allergen"
              optional
              value={row.allergen}
              onChangeText={(t) => updateRow(row.id, { allergen: t })}
              placeholder="e.g., Penicillin"
            />
            <SelectField
              label="Severity"
              optional
              value={row.severity}
              options={ALLERGY_SEVERITIES}
              placeholder="Select severity"
              onChange={(v) =>
                updateRow(row.id, {
                  severity: v as AllergyEditRow['severity'],
                })
              }
            />
            <View style={styles.fieldWithRemove}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Reaction"
                  optional
                  value={row.reaction}
                  onChangeText={(t) => updateRow(row.id, { reaction: t })}
                  placeholder="e.g., Rash"
                />
              </View>
              <Pressable
                onPress={() => removeRow(row.id)}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <X size={18} color={PRIMARY[600]} />
              </Pressable>
            </View>
          </View>
        ))}
        {rows.length === 0 && records.length === 0 && (
          <Text style={styles.emptyText}>No allergies added yet.</Text>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Medications tab
// ──────────────────────────────────────────────────────────────────────────

function MedicationsTab({
  records,
  rows,
  onChange,
}: {
  records: MedicationRecord[];
  rows: MedicationEditRow[];
  onChange: (next: MedicationEditRow[]) => void;
}) {
  const addRow = () =>
    onChange([
      ...rows,
      { id: makeId(), name: '', dosage: '', frequency: '' },
    ]);
  const updateRow = (id: string, patch: Partial<MedicationEditRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.tabHeaderRow}>
        <Text style={styles.sectionTitle}>Current Medications</Text>
        <Pressable onPress={addRow} style={styles.smallPrimaryBtn}>
          <Plus size={14} color="#fff" />
          <Text style={styles.smallPrimaryBtnText}>Add Medication</Text>
        </Pressable>
      </View>

      {records.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={styles.subSectionTitle}>Detailed Medication Records</Text>
          {records.map((r) => {
            const cv = criticalityVariant(r.criticality);
            return (
              <View key={r.id} style={styles.recordCardBlue}>
                <View style={styles.recordCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordTitleBlue}>{r.medicationName}</Text>
                    <Text style={styles.recordSubBlue}>
                      {r.dosage ?? ''}
                      {r.dosageUnit ? ` ${r.dosageUnit}` : ''}
                      {r.frequency ? ` - ${r.frequency}` : ''}
                    </Text>
                  </View>
                  {!!r.criticality && (
                    <PillBadge bg={cv.bg} fg={cv.fg}>
                      {r.criticality}
                    </PillBadge>
                  )}
                </View>
                {!!r.purpose && (
                  <Text style={styles.recordMetaText}>
                    <Text style={styles.recordMetaLabel}>Purpose: </Text>
                    {r.purpose}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ gap: 12 }}>
        {rows.map((row) => (
          <View key={row.id} style={styles.editRow}>
            <TextField
              label="Medication Name"
              optional
              value={row.name}
              onChangeText={(t) => updateRow(row.id, { name: t })}
              placeholder="e.g., Lisinopril"
            />
            <TextField
              label="Dosage"
              optional
              value={row.dosage}
              onChangeText={(t) => updateRow(row.id, { dosage: t })}
              placeholder="e.g., 10mg"
            />
            <View style={styles.fieldWithRemove}>
              <View style={{ flex: 1 }}>
                <SelectField
                  label="Frequency"
                  optional
                  value={row.frequency}
                  options={MEDICATION_FREQUENCIES}
                  placeholder="Select…"
                  onChange={(v) => updateRow(row.id, { frequency: v })}
                />
              </View>
              <Pressable
                onPress={() => removeRow(row.id)}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <X size={18} color={PRIMARY[600]} />
              </Pressable>
            </View>
          </View>
        ))}
        {rows.length === 0 && records.length === 0 && (
          <Text style={styles.emptyText}>No medications added yet.</Text>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Conditions tab
// ──────────────────────────────────────────────────────────────────────────

function ConditionsTab({
  records,
  conditions,
  onChange,
  newCondition,
  setNewCondition,
}: {
  records: ConditionRecord[];
  conditions: string[];
  onChange: (next: string[]) => void;
  newCondition: string;
  setNewCondition: (v: string) => void;
}) {
  const addCondition = () => {
    const v = newCondition.trim();
    if (!v) return;
    if (conditions.some((c) => c.toLowerCase() === v.toLowerCase())) {
      setNewCondition('');
      return;
    }
    onChange([...conditions, v]);
    setNewCondition('');
  };
  const removeCondition = (name: string) =>
    onChange(conditions.filter((c) => c !== name));

  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Medical Conditions</Text>

      {records.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={styles.subSectionTitle}>Detailed Condition Records</Text>
          {records.map((r) => {
            const sv = severityVariant(r.severity);
            const statusVariant =
              r.status === 'active'
                ? SEVERITY_VARIANTS.warning
                : SEVERITY_VARIANTS.success;
            return (
              <View key={r.id} style={styles.recordCardPurple}>
                <View style={styles.recordCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordTitlePurple}>{r.conditionName}</Text>
                    {!!r.diagnosisDate && (
                      <Text style={styles.recordSubPurple}>
                        Diagnosed: {r.diagnosisDate}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {!!r.severity && (
                      <PillBadge bg={sv.bg} fg={sv.fg}>
                        {r.severity.replace(/_/g, ' ')}
                      </PillBadge>
                    )}
                    {!!r.status && (
                      <PillBadge bg={statusVariant.bg} fg={statusVariant.fg}>
                        {r.status}
                      </PillBadge>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.addConditionRow}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Add Condition"
            optional
            value={newCondition}
            onChangeText={setNewCondition}
            placeholder="e.g., Hypertension"
          />
        </View>
        <Pressable
          onPress={addCondition}
          style={[styles.smallPrimaryBtn, { marginTop: 22 }]}
        >
          <Plus size={14} color="#fff" />
          <Text style={styles.smallPrimaryBtnText}>Add</Text>
        </Pressable>
      </View>

      {conditions.length > 0 && (
        <View style={styles.chipRow}>
          {conditions.map((c) => (
            <View key={c} style={styles.conditionChip}>
              <Text style={styles.conditionChipText}>{c}</Text>
              <Pressable onPress={() => removeCondition(c)} hitSlop={6}>
                <X size={12} color="#1d4ed8" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {conditions.length === 0 && records.length === 0 && (
        <Text style={styles.emptyText}>No medical conditions added yet.</Text>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Pill badge
// ──────────────────────────────────────────────────────────────────────────

function PillBadge({
  bg,
  fg,
  children,
}: {
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.pillBadge, { backgroundColor: bg }]}>
      <Text style={[styles.pillBadgeText, { color: fg }]}>{children}</Text>
    </View>
  );
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ──────────────────────────────────────────────────────────────────────────
// Color-banded section display (used by Emergency Instructions / Mental Health
// / Pregnancy / Home Safety / Legal — all read-only tabs)
// ──────────────────────────────────────────────────────────────────────────

const BAND_THEMES = {
  blue: { bg: '#eff6ff', title: '#1e40af', border: '#dbeafe' },
  green: { bg: '#f0fdf4', title: '#166534', border: '#bbf7d0' },
  yellow: { bg: '#fefce8', title: '#854d0e', border: '#fef08a' },
  purple: { bg: '#faf5ff', title: '#6b21a8', border: '#e9d5ff' },
  orange: { bg: '#fff7ed', title: '#9a3412', border: '#fed7aa' },
  red: { bg: '#fef2f2', title: '#991b1b', border: '#fecaca' },
  pink: { bg: '#fdf2f8', title: '#9d174d', border: '#fbcfe8' },
  gray: { bg: GRAY[50], title: GRAY[800], border: GRAY[200] },
} as const;

function SectionBand({
  color,
  title,
  children,
}: {
  color: keyof typeof BAND_THEMES;
  title: string;
  children: React.ReactNode;
}) {
  const t = BAND_THEMES[color];
  return (
    <View
      style={[
        styles.bandCard,
        { backgroundColor: t.bg, borderColor: t.border },
      ]}
    >
      <Text style={[styles.bandTitle, { color: t.title }]}>{title}</Text>
      <View style={{ gap: 6 }}>{children}</View>
    </View>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bandBody}>{children}</Text>;
}

function MetaLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Text style={styles.bandMeta}>
      <Text style={styles.bandMetaLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <View style={styles.chipRow}>
      {items.map((it) => (
        <View key={it} style={styles.displayChip}>
          <Text style={styles.displayChipText}>{prettify(it)}</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyState({
  Icon,
  title,
  hint,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  hint?: string;
}) {
  return (
    <View style={styles.emptyStateWrap}>
      <Icon size={48} color={GRAY[300]} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {!!hint && <Text style={styles.emptyStateHint}>{hint}</Text>}
    </View>
  );
}

function prettify(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/_/g, ' ');
}

function isArrayWithItems<T>(v: T[] | undefined | null): v is T[] {
  return Array.isArray(v) && v.length > 0;
}

// ──────────────────────────────────────────────────────────────────────────
// Emergency Instructions tab
// ──────────────────────────────────────────────────────────────────────────

function EmergencyInstructionsTab({
  data,
}: {
  data: EmergencyInstructions | null;
}) {
  if (!data) {
    return (
      <View style={{ gap: 16 }}>
        <Text style={styles.sectionTitle}>Emergency Instructions</Text>
        <EmptyState
          Icon={AlertTriangle}
          title="No emergency instructions configured."
          hint="Add this information during profile setup."
        />
      </View>
    );
  }
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Emergency Instructions</Text>

      {!!data.cognitiveStatus && (
        <SectionBand color="blue" title="Cognitive Status">
          <BodyText>{prettify(data.cognitiveStatus)}</BodyText>
          {!!data.cognitiveNotes && <BodyText>{data.cognitiveNotes}</BodyText>}
        </SectionBand>
      )}

      {!!data.communicationNeeds && (
        <SectionBand color="green" title="Communication Needs">
          <BodyText>{prettify(data.communicationNeeds)}</BodyText>
          {isArrayWithItems(data.communicationNotes) && (
            <BodyText>{data.communicationNotes!.map(prettify).join(', ')}</BodyText>
          )}
        </SectionBand>
      )}

      {!!data.mobilityStatus && (
        <SectionBand color="yellow" title="Mobility Status">
          <BodyText>{prettify(data.mobilityStatus)}</BodyText>
          {!!data.mobilityEquipment && (
            <MetaLine label="Equipment" value={data.mobilityEquipment} />
          )}
          {!!data.mobilityNotes && <BodyText>{data.mobilityNotes}</BodyText>}
        </SectionBand>
      )}

      {isArrayWithItems(data.medicalDevices) && (
        <SectionBand color="purple" title="Medical Devices">
          <ChipList items={data.medicalDevices!} />
          {!!data.deviceNotes && <BodyText>{data.deviceNotes}</BodyText>}
        </SectionBand>
      )}

      {(isArrayWithItems(data.behavioralConsiderations) ||
        !!data.behavioralTriggers ||
        !!data.calmingStrategies) && (
        <SectionBand color="orange" title="Behavioral Considerations">
          {isArrayWithItems(data.behavioralConsiderations) && (
            <BodyText>
              {data.behavioralConsiderations!.map(prettify).join(', ')}
            </BodyText>
          )}
          {!!data.behavioralTriggers && (
            <MetaLine label="Triggers" value={data.behavioralTriggers} />
          )}
          {!!data.calmingStrategies && (
            <MetaLine
              label="Calming Strategies"
              value={data.calmingStrategies}
            />
          )}
        </SectionBand>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Mental Health tab
// ──────────────────────────────────────────────────────────────────────────

function MentalHealthTab({ data }: { data: MentalHealthProfile | null }) {
  if (!data) {
    return (
      <View style={{ gap: 16 }}>
        <Text style={styles.sectionTitle}>Mental Health</Text>
        <EmptyState
          Icon={Brain}
          title="No mental health information configured."
          hint="This section is private by default."
        />
      </View>
    );
  }

  const treatments = Array.isArray(data.currentTreatment)
    ? data.currentTreatment
    : typeof data.currentTreatment === 'string' && data.currentTreatment
    ? [data.currentTreatment]
    : [];

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.tabHeaderRow}>
        <Text style={styles.sectionTitle}>Mental Health</Text>
        {data.isPrivate && (
          <PillBadge
            bg={SEVERITY_VARIANTS.warning.bg}
            fg={SEVERITY_VARIANTS.warning.fg}
          >
            Private
          </PillBadge>
        )}
      </View>

      {isArrayWithItems(data.conditions) && (
        <SectionBand color="purple" title="Conditions">
          <ChipList items={data.conditions!} />
        </SectionBand>
      )}

      {treatments.length > 0 && (
        <SectionBand color="blue" title="Current Treatment">
          <BodyText>{treatments.map(prettify).join(', ')}</BodyText>
        </SectionBand>
      )}

      {(!!data.therapistName ||
        !!data.therapistPhone ||
        !!data.psychiatristName ||
        !!data.psychiatristPhone) && (
        <SectionBand
          color="green"
          title={data.therapistName ? 'Therapist' : 'Psychiatrist'}
        >
          {!!(data.therapistName ?? data.psychiatristName) && (
            <BodyText>{data.therapistName ?? data.psychiatristName}</BodyText>
          )}
          {!!(data.therapistPhone ?? data.psychiatristPhone) && (
            <Text style={styles.bandSubtle}>
              {data.therapistPhone ?? data.psychiatristPhone}
            </Text>
          )}
        </SectionBand>
      )}

      {!!data.crisisProtocol && (
        <SectionBand color="red" title="Crisis Protocol">
          <BodyText>{data.crisisProtocol}</BodyText>
        </SectionBand>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Pregnancy tab
// ──────────────────────────────────────────────────────────────────────────

function PregnancyTab({ data }: { data: PregnancyInfo | null }) {
  if (!data) {
    return (
      <View style={{ gap: 16 }}>
        <Text style={styles.sectionTitle}>Pregnancy Information</Text>
        <EmptyState Icon={Heart} title="No pregnancy information configured." />
      </View>
    );
  }
  const sv = data.isPregnant
    ? SEVERITY_VARIANTS.warning
    : SEVERITY_VARIANTS.info;
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Pregnancy Information</Text>

      <View style={[styles.bandCard, { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' }]}>
        <View style={styles.tabHeaderRow}>
          <Text style={[styles.bandTitle, { color: '#9d174d' }]}>Pregnancy Status</Text>
          <PillBadge bg={sv.bg} fg={sv.fg}>
            {data.isPregnant ? 'Pregnant' : 'Not Pregnant'}
          </PillBadge>
        </View>
        {data.isPregnant && (
          <>
            {!!data.dueDate && <MetaLine label="Due Date" value={data.dueDate} />}
            {!!data.weeksPregnant && (
              <MetaLine label="Weeks" value={data.weeksPregnant} />
            )}
            {!!data.trimester && (
              <MetaLine label="Trimester" value={data.trimester} />
            )}
          </>
        )}
      </View>

      {!!data.obgynName && (
        <SectionBand color="blue" title="OB/GYN">
          <BodyText>{data.obgynName}</BodyText>
          {!!data.obgynPhone && (
            <Text style={styles.bandSubtle}>{data.obgynPhone}</Text>
          )}
        </SectionBand>
      )}

      {!!data.hospitalPreference && (
        <SectionBand color="green" title="Hospital Preference">
          <BodyText>{data.hospitalPreference}</BodyText>
        </SectionBand>
      )}

      {!!data.complications && (
        <SectionBand color="red" title="Complications/Notes">
          <BodyText>{data.complications}</BodyText>
        </SectionBand>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Home Safety tab
// ──────────────────────────────────────────────────────────────────────────

function HomeSafetyTab({ data }: { data: HomeSafety | null }) {
  if (!data) {
    return (
      <View style={{ gap: 16 }}>
        <Text style={styles.sectionTitle}>Home Safety</Text>
        <EmptyState Icon={Home} title="No home safety information configured." />
      </View>
    );
  }
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Home Safety</Text>

      {!!data.livingSituation && (
        <SectionBand color="blue" title="Living Situation">
          <BodyText>{prettify(data.livingSituation)}</BodyText>
          {!!data.livingSituationOther && (
            <Text style={styles.bandSubtle}>{data.livingSituationOther}</Text>
          )}
          {!!data.floorLevel && (
            <Text style={styles.bandSubtle}>Floor: {data.floorLevel}</Text>
          )}
          {data.hasElevator && (
            <Text style={styles.bandSubtle}>Has elevator access</Text>
          )}
        </SectionBand>
      )}

      {(!!data.spareKeyLocation ||
        !!data.keyLocation ||
        data.neighborHasKey) && (
        <SectionBand color="green" title="Emergency Access">
          {!!data.spareKeyLocation && (
            <MetaLine
              label="Spare Key"
              value={prettify(data.spareKeyLocation)}
            />
          )}
          {!!data.keyLocation && (
            <MetaLine label="Key Location" value={data.keyLocation} />
          )}
          {!!data.lockboxCode && (
            <MetaLine label="Lockbox Code" value={data.lockboxCode} />
          )}
          {data.neighborHasKey && !!data.neighborName && (
            <MetaLine
              label="Neighbor with key"
              value={`${data.neighborName}${
                data.neighborPhone ? ` (${data.neighborPhone})` : ''
              }`}
            />
          )}
        </SectionBand>
      )}

      {data.hasPets && (
        <SectionBand color="yellow" title="Pets">
          <BodyText>
            {Array.isArray(data.petDetails)
              ? data.petDetails.length > 0
                ? `${data.petDetails.length} pet(s)`
                : 'Has pets'
              : data.petDetails || 'Has pets'}
          </BodyText>
          {!!data.petEmergencyContact && (
            <MetaLine
              label="Pet Emergency Contact"
              value={data.petEmergencyContact}
            />
          )}
        </SectionBand>
      )}

      {!!data.dailyRoutine && (
        <SectionBand color="gray" title="Daily Routine">
          <BodyText>{data.dailyRoutine}</BodyText>
        </SectionBand>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Legal & Directives tab
// ──────────────────────────────────────────────────────────────────────────

function LegalTab({ data }: { data: LegalDirectives | null }) {
  if (!data) {
    return (
      <View style={{ gap: 16 }}>
        <Text style={styles.sectionTitle}>Legal &amp; Directives</Text>
        <EmptyState Icon={Scale} title="No legal directives configured." />
      </View>
    );
  }
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Legal &amp; Directives</Text>

      {data.hasPOA && (
        <SectionBand color="blue" title="Power of Attorney">
          {!!data.poaName && <MetaLine label="Name" value={data.poaName} />}
          {!!data.poaRelationship && (
            <Text style={styles.bandSubtle}>
              Relationship: {data.poaRelationship}
            </Text>
          )}
          {!!data.poaPhone && (
            <Text style={styles.bandSubtle}>{data.poaPhone}</Text>
          )}
        </SectionBand>
      )}

      {data.hasLivingWill && (
        <SectionBand color="green" title="Living Will">
          {!!data.livingWillLocation && (
            <MetaLine label="Location" value={data.livingWillLocation} />
          )}
          {!!data.livingWillNotes && (
            <BodyText>{data.livingWillNotes}</BodyText>
          )}
        </SectionBand>
      )}

      {!!data.religiousPreferences && (
        <SectionBand color="purple" title="Religious Preferences">
          <BodyText>{data.religiousPreferences}</BodyText>
        </SectionBand>
      )}

      {!!data.culturalConsiderations && (
        <SectionBand color="orange" title="Cultural Considerations">
          <BodyText>{data.culturalConsiderations}</BodyText>
        </SectionBand>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Emergency Contacts tab (editable)
// ──────────────────────────────────────────────────────────────────────────

function EmergencyContactsTab({
  contacts,
  onChange,
}: {
  contacts: EmergencyContactRow[];
  onChange: (next: EmergencyContactRow[]) => void;
}) {
  const addRow = () =>
    onChange([
      ...contacts,
      {
        id: makeId(),
        name: '',
        relationship: '',
        phone: '',
        email: '',
        priority: contacts.length + 1,
        isPrimary: contacts.length === 0,
      },
    ]);
  const updateRow = (id: string, patch: Partial<EmergencyContactRow>) =>
    onChange(contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeRow = (id: string) =>
    onChange(contacts.filter((c) => c.id !== id));

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.tabHeaderRow}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Pressable onPress={addRow} style={styles.smallPrimaryBtn}>
          <Plus size={14} color="#fff" />
          <Text style={styles.smallPrimaryBtnText}>Add Contact</Text>
        </Pressable>
      </View>

      {contacts.length === 0 && (
        <Text style={styles.emptyText}>No emergency contacts added yet.</Text>
      )}

      {contacts.map((c) => (
        <View key={c.id} style={styles.contactCard}>
          <View style={styles.tabHeaderRow}>
            {c.isPrimary ? (
              <PillBadge
                bg={SEVERITY_VARIANTS.success.bg}
                fg={SEVERITY_VARIANTS.success.fg}
              >
                Primary Contact
              </PillBadge>
            ) : (
              <View />
            )}
            {!!c.priority && (
              <Text style={styles.contactPriority}>Priority: {c.priority}</Text>
            )}
          </View>
          <TextField
            label="Full Name"
            optional
            value={c.name}
            onChangeText={(t) => updateRow(c.id, { name: t })}
            placeholder="e.g., Jane Doe"
          />
          <TextField
            label="Relationship"
            optional
            value={c.relationship}
            onChangeText={(t) => updateRow(c.id, { relationship: t })}
            placeholder="e.g., Spouse"
          />
          <TextField
            label="Phone Number"
            optional
            value={c.phone}
            onChangeText={(t) => updateRow(c.id, { phone: t })}
            keyboardType="phone-pad"
            placeholder="(416)-900-5828"
          />
          <View style={styles.fieldWithRemove}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Email"
                optional
                value={c.email}
                onChangeText={(t) => updateRow(c.id, { email: t })}
                keyboardType="email-address"
                placeholder="jane.doe@example.com"
              />
            </View>
            <Pressable
              onPress={() => removeRow(c.id)}
              style={styles.removeBtn}
              hitSlop={8}
            >
              <X size={18} color={PRIMARY[600]} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Additional Notes tab
// ──────────────────────────────────────────────────────────────────────────

function NotesTab({
  value,
  onChange,
  extended,
}: {
  value: string;
  onChange: (v: string) => void;
  extended: string;
}) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionTitle}>Additional Notes</Text>
      <View>
        <FieldLabel label="Emergency Notes" optional />
        <TextInput
          value={value}
          onChangeText={(t) => {
            if (t.length <= 2000) onChange(t);
          }}
          placeholder="Add any additional information that emergency responders should know…"
          placeholderTextColor={GRAY[400]}
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textarea]}
        />
        <Text
          style={[
            styles.charCount,
            { color: value.length > 1800 ? '#b45309' : GRAY[400] },
          ]}
        >
          {value.length}/2000 characters
        </Text>
      </View>

      {!!extended && (
        <SectionBand color="blue" title="Extended Notes">
          <BodyText>{extended}</BodyText>
        </SectionBand>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          <Text style={{ fontWeight: '700' }}>Note: </Text>
          This information will be visible to emergency responders. Include
          relevant details like surgical history, implants, or special
          considerations.
        </Text>
      </View>
    </View>
  );
}

function ComingSoonTab({ tabLabel }: { tabLabel: string }) {
  return (
    <View style={styles.comingSoon}>
      <Text style={styles.comingSoonTitle}>{tabLabel}</Text>
      <Text style={styles.comingSoonText}>
        This tab will be enabled in the next phase. Switch to{' '}
        <Text style={{ fontWeight: '700' }}>Basic Info</Text> to edit your
        details.
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Reusable field components
// ──────────────────────────────────────────────────────────────────────────

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {optional && <Text style={styles.optional}>(Optional)</Text>}
    </View>
  );
}

function TextField({
  label,
  optional,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  placeholder?: string;
}) {
  return (
    <View>
      <FieldLabel label={label} optional={optional} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={GRAY[400]}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function SelectField({
  label,
  optional,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  optional?: boolean;
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View>
      <FieldLabel label={label} optional={optional} />
      <Pressable onPress={() => setOpen((s) => !s)} style={styles.selectInput}>
        <Text
          style={[
            styles.selectText,
            !selected && { color: GRAY[400] },
          ]}
        >
          {selected ? selected.label : placeholder ?? 'Select…'}
        </Text>
        <ChevronDown size={16} color={GRAY[500]} />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              style={[
                styles.dropdownItem,
                value === o.value && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  value === o.value && styles.dropdownItemTextActive,
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Save bar (disabled in Phase 1)
// ──────────────────────────────────────────────────────────────────────────

function SaveBar({
  disabled,
  saving,
  onPress,
  result,
}: {
  disabled: boolean;
  saving: boolean;
  onPress: () => void;
  result: { type: 'success' | 'error'; message: string } | null;
}) {
  return (
    <View style={styles.saveBarWrap}>
      {result && (
        <View
          style={[
            styles.saveResultPill,
            {
              backgroundColor:
                result.type === 'success' ? '#dcfce7' : '#fee2e2',
            },
          ]}
        >
          <Text
            style={[
              styles.saveResultText,
              {
                color: result.type === 'success' ? '#166534' : '#b91c1c',
              },
            ]}
          >
            {result.message}
          </Text>
        </View>
      )}
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[styles.saveBtn, disabled && styles.saveBtnDisabled]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Save size={18} color="#fff" />
        )}
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Text>
      </Pressable>
    </View>
  );
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorCard}>
      <AlertCircle size={28} color={PRIMARY[600]} />
      <Text style={styles.errorTitle}>Couldn&apos;t load your profile</Text>
      <Text style={styles.errorSub}>
        Check your connection and try again. Pull to refresh or go back to the
        dashboard.
      </Text>
      <Pressable onPress={onRetry} style={styles.errorBtn}>
        <Text style={styles.errorBtnText}>Back</Text>
      </Pressable>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const CARD_RADIUS = 16;
const CARD_PADDING = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  topFixed: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: GRAY[50],
    gap: 14,
  },
  scrollContent: { padding: 16, gap: 14 },

  // Header
  headerWrap: { paddingBottom: 4 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 13,
    color: GRAY[600],
    lineHeight: 18,
  },

  // Tab card
  tabCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 12,
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 10,
  },
  tabScrollView: { flexGrow: 0 },
  tabRow: { gap: 8, paddingRight: 12, alignItems: 'center' },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: GRAY[100],
  },
  tabPillActive: {
    backgroundColor: PRIMARY[600],
  },
  tabLabel: { color: GRAY[700], fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },

  progressTrack: {
    height: 3,
    backgroundColor: PRIMARY[100],
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: PRIMARY[400] },

  // Content card
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  cardLoading: { paddingVertical: 32, alignItems: 'center', gap: 8 },
  cardLoadingText: { color: GRAY[600], fontSize: 13 },

  // Basic info — photo row
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GRAY[100],
    borderWidth: 2,
    borderColor: GRAY[200],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoPlaceholder: {
    fontSize: 11,
    color: GRAY[500],
    textAlign: 'center',
  },
  photoTrash: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoLink: {
    color: PRIMARY[600],
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: GRAY[900] },
  sectionSubtitle: { fontSize: 12, color: GRAY[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: GRAY[200] },

  // Field labels + inputs
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: GRAY[800] },
  optional: { fontSize: 12, color: GRAY[500] },

  input: {
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: GRAY[900],
    backgroundColor: '#fff',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 14, color: GRAY[900] },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GRAY[100],
  },
  dropdownItemActive: { backgroundColor: PRIMARY[50] },
  dropdownItemText: { fontSize: 14, color: GRAY[800] },
  dropdownItemTextActive: { color: PRIMARY[700], fontWeight: '600' },

  // Tab section headers + buttons
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY[800],
  },
  smallPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: PRIMARY[600],
    borderRadius: 10,
  },
  smallPrimaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  // Record cards (read-mode)
  recordCardRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  recordCardBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  recordCardPurple: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  recordCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  recordTitleRed: { fontSize: 14, fontWeight: '700', color: '#991b1b' },
  recordSubRed: { fontSize: 12, color: '#b91c1c', marginTop: 2 },
  recordTitleBlue: { fontSize: 14, fontWeight: '700', color: '#1e40af' },
  recordSubBlue: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  recordTitlePurple: { fontSize: 14, fontWeight: '700', color: '#6b21a8' },
  recordSubPurple: { fontSize: 12, color: '#9333ea', marginTop: 2 },
  recordMetaText: { fontSize: 12, color: GRAY[700] },
  recordMetaLabel: { fontWeight: '700', color: GRAY[800] },
  innerNote: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  innerNoteText: { fontSize: 12, color: GRAY[700] },
  innerNoteLabel: { fontWeight: '700', color: GRAY[800] },

  // Pill badge
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'lowercase' },

  // Edit row container
  editRow: {
    backgroundColor: GRAY[50],
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  fieldWithRemove: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },

  // Conditions add row + chips
  addConditionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  conditionChipText: { color: '#1d4ed8', fontWeight: '600', fontSize: 12 },

  emptyText: {
    textAlign: 'center',
    color: GRAY[500],
    paddingVertical: 24,
    fontSize: 13,
  },

  // Color-banded display
  bandCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  bandTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  bandBody: {
    fontSize: 13,
    color: GRAY[900],
    lineHeight: 18,
    textTransform: 'capitalize',
  },
  bandSubtle: { fontSize: 12, color: GRAY[600], lineHeight: 16 },
  bandMeta: { fontSize: 13, color: GRAY[800], lineHeight: 18 },
  bandMetaLabel: { fontWeight: '700', color: GRAY[900] },
  displayChip: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  displayChipText: { color: '#1d4ed8', fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyStateWrap: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyStateTitle: { fontSize: 13, color: GRAY[500] },
  emptyStateHint: { fontSize: 12, color: GRAY[400] },

  // Contact card
  contactCard: {
    backgroundColor: GRAY[50],
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  contactPriority: { fontSize: 12, color: GRAY[500] },

  // Notes
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  charCount: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  infoBoxText: { fontSize: 12, color: '#1e40af', lineHeight: 18 },

  // Save result pill
  saveResultPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-end',
  },
  saveResultText: { fontSize: 12, fontWeight: '600' },

  // Coming soon
  comingSoon: { alignItems: 'center', paddingVertical: 36, gap: 6 },
  comingSoonTitle: { fontSize: 16, fontWeight: '700', color: GRAY[900] },
  comingSoonText: {
    fontSize: 13,
    color: GRAY[600],
    textAlign: 'center',
    lineHeight: 18,
  },

  // Save bar
  saveBarWrap: { alignItems: 'flex-end', gap: 4 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnDisabled: { backgroundColor: GRAY[300] },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  saveHint: { fontSize: 11, color: GRAY[500] },

  // Error
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: GRAY[100],
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  errorSub: {
    fontSize: 12,
    color: GRAY[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY[600],
  },
  errorBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

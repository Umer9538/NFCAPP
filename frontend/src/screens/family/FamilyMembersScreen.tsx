/**
 * Family Members — mirrors the web's /dashboard/family-members 1:1.
 * Stat cards · Members list with Add modal · Caregivers list with Invite link.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Users,
  Shield,
  Plus,
  UserPlus,
  Baby,
  Heart,
  X,
  Trash2,
  Edit3,
  ChevronDown,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import {
  familyApi,
  type AddMemberInput,
  type FamilyMember,
  type FamilyRelationship,
} from '@/api/family';
import type { AppScreenNavigationProp } from '@/navigation/types';

const RELATIONSHIPS: { value: FamilyRelationship; label: string }[] = [
  { value: 'child', label: 'Child' },
  { value: 'dependent', label: 'Dependent' },
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grandparent' },
];

const GENDERS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM: AddMemberInput & { gender: string; dateOfBirth: string } = {
  fullName: '',
  nickname: '',
  dateOfBirth: '',
  gender: '',
  relationship: 'child',
};

export default function FamilyMembersScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing: FamilyMember | null }>(
    { open: false, editing: null },
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['family', 'members'],
    queryFn: familyApi.listFamilyMembers,
  });
  const members = data?.members ?? [];
  const caregivers = data?.caregivers ?? [];

  const addMut = useMutation({
    mutationFn: (body: AddMemberInput) => familyApi.addFamilyMember(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family', 'members'] });
      setModal({ open: false, editing: null });
    },
    onError: (e: any) => setFormError(extractError(e)),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AddMemberInput> }) =>
      familyApi.updateFamilyMember(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family', 'members'] });
      setModal({ open: false, editing: null });
    },
    onError: (e: any) => setFormError(extractError(e)),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => familyApi.deleteFamilyMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family', 'members'] }),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ open: true, editing: null });
  };
  const openEdit = (m: FamilyMember) => {
    setForm({
      fullName: m.fullName,
      nickname: m.nickname ?? '',
      dateOfBirth: m.dateOfBirth ?? '',
      gender: m.gender ?? '',
      relationship: m.relationship,
    });
    setFormError(null);
    setModal({ open: true, editing: m });
  };

  const handleSubmit = () => {
    setFormError(null);
    if (form.fullName.trim().length < 2) {
      return setFormError('Full name must be at least 2 characters');
    }
    if (!form.relationship) {
      return setFormError('Please select a relationship');
    }
    const body: AddMemberInput = {
      fullName: form.fullName.trim(),
      nickname: form.nickname?.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      relationship: form.relationship,
    };
    if (modal.editing) {
      updateMut.mutate({ id: modal.editing.id, patch: body });
    } else {
      addMut.mutate(body);
    }
  };

  const handleDelete = (m: FamilyMember) => {
    Alert.alert(
      `Remove ${m.fullName}?`,
      'This will remove the family member and their medical profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMut.mutate(m.id),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Family Members</Text>
            <Text style={styles.headerSub}>
              Manage your family members and the caregivers who can view their
              profiles.
            </Text>
          </View>
          <Pressable onPress={openAdd} style={styles.primaryBtn}>
            <Plus size={14} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Child</Text>
          </Pressable>
        </View>

        <View style={styles.statRow}>
          <StatTile
            value={members.length}
            label="FAMILY MEMBERS"
            Icon={Users}
            tint={{ bg: '#fee2e2', fg: PRIMARY[600] }}
          />
          <StatTile
            value={caregivers.length}
            label="ACTIVE CAREGIVERS"
            Icon={Shield}
            tint={{ bg: '#dbeafe', fg: '#2563eb' }}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Baby size={16} color={PRIMARY[600]} />
            <Text style={styles.cardTitle}>Family Members</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={PRIMARY[600]} />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyBlock}>
              <View style={styles.emptyIcon}>
                <Users size={28} color={GRAY[400]} />
              </View>
              <Text style={styles.emptyTitle}>No family members yet</Text>
              <Text style={styles.emptyHint}>
                Add your children or dependents to manage their medical profiles
                in one place.
              </Text>
              <Pressable onPress={openAdd} style={styles.primaryBtn}>
                <Plus size={14} color="#fff" />
                <Text style={styles.primaryBtnText}>Add Your First Member</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onEdit={() => openEdit(m)}
                  onDelete={() => handleDelete(m)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeaderTitleRow}>
              <Shield size={16} color="#2563eb" />
              <Text style={styles.cardTitle}>Caregivers &amp; Access</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('InviteCaregiver')}
              style={styles.outlineBtn}
            >
              <UserPlus size={14} color={PRIMARY[600]} />
              <Text style={styles.outlineBtnText}>Invite Caregiver</Text>
            </Pressable>
          </View>

          {caregivers.length === 0 ? (
            <View style={styles.emptyBlock}>
              <View style={styles.emptyIcon}>
                <UserPlus size={28} color={GRAY[400]} />
              </View>
              <Text style={styles.emptyTitle}>No caregivers yet</Text>
              <Text style={styles.emptyHint}>
                Invite a co-parent, grandparent, or trusted caregiver to view
                your family members&apos; medical profiles.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('InviteCaregiver')}
                style={styles.outlineBtn}
              >
                <UserPlus size={14} color={PRIMARY[600]} />
                <Text style={styles.outlineBtnText}>Send an Invitation</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {caregivers.map((c) => (
                <View key={c.id} style={styles.caregiverRow}>
                  <View style={styles.caregiverAvatar}>
                    <Text style={styles.caregiverInitials}>
                      {initials(c.fullName)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.caregiverName}>{c.fullName}</Text>
                    <Text style={styles.caregiverEmail} numberOfLines={1}>
                      {c.email}
                    </Text>
                  </View>
                  {!!c.familyRole && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{c.familyRole}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={modal.open}
        transparent
        animationType="slide"
        onRequestClose={() => setModal({ open: false, editing: null })}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modal.editing ? 'Edit Family Member' : 'Add Family Member'}
              </Text>
              <Pressable onPress={() => setModal({ open: false, editing: null })}>
                <X size={20} color={GRAY[500]} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              {modal.editing
                ? 'Update profile details and relationship.'
                : 'Add a child or dependent to manage their medical profile under your account.'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {formError && (
                <View style={styles.formErrorBox}>
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              )}

              <Field label="Full Name" required>
                <TextInput
                  value={form.fullName}
                  onChangeText={(t) => setForm({ ...form, fullName: t })}
                  placeholder="e.g. Emma Johnson"
                  placeholderTextColor={GRAY[400]}
                  style={styles.input}
                />
              </Field>

              <Field label="Nickname" optional>
                <TextInput
                  value={form.nickname ?? ''}
                  onChangeText={(t) => setForm({ ...form, nickname: t })}
                  placeholder="e.g. Emmy"
                  placeholderTextColor={GRAY[400]}
                  style={styles.input}
                />
              </Field>

              <View style={styles.row2}>
                <Field label="Date of Birth" optional style={{ flex: 1 }}>
                  <TextInput
                    value={form.dateOfBirth ?? ''}
                    onChangeText={(t) => setForm({ ...form, dateOfBirth: t })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={GRAY[400]}
                    style={styles.input}
                  />
                </Field>
                <Field label="Gender" optional style={{ flex: 1 }}>
                  <NativeSelect
                    value={form.gender}
                    options={GENDERS}
                    onChange={(v) => setForm({ ...form, gender: v })}
                  />
                </Field>
              </View>

              <Field label="Relationship" required>
                <NativeSelect
                  value={form.relationship}
                  options={RELATIONSHIPS}
                  onChange={(v) =>
                    setForm({ ...form, relationship: v as FamilyRelationship })
                  }
                />
              </Field>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setModal({ open: false, editing: null })}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={addMut.isPending || updateMut.isPending}
                  style={[
                    styles.primaryBtn,
                    (addMut.isPending || updateMut.isPending) && { opacity: 0.6 },
                  ]}
                >
                  {(addMut.isPending || updateMut.isPending) && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Plus size={14} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {modal.editing ? 'Save' : 'Add Member'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatTile({
  value,
  label,
  Icon,
  tint,
}: {
  value: number;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  tint: { bg: string; fg: string };
}) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statTileIcon, { backgroundColor: tint.bg }]}>
        <Icon size={20} color={tint.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statTileValue}>{value}</Text>
        <Text style={styles.statTileLabel}>{label}</Text>
      </View>
    </View>
  );
}

function MemberRow({
  member,
  onEdit,
  onDelete,
}: {
  member: FamilyMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.memberRowCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitials}>{initials(member.fullName)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>
          {member.nickname || member.fullName}
        </Text>
        <Text style={styles.memberMeta}>
          {RELATIONSHIPS.find((r) => r.value === member.relationship)?.label}
          {member.dateOfBirth ? ` · ${formatAge(member.dateOfBirth)}` : ''}
        </Text>
      </View>
      <Pressable onPress={onEdit} style={styles.iconBtn}>
        <Edit3 size={16} color={GRAY[700]} />
      </Pressable>
      <Pressable onPress={onDelete} style={styles.iconBtnDanger}>
        <Trash2 size={16} color={PRIMARY[600]} />
      </Pressable>
    </View>
  );
}

function Field({
  label,
  optional,
  required,
  children,
  style,
}: {
  label: string;
  optional?: boolean;
  required?: boolean;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={{ color: PRIMARY[600] }}> *</Text>}
        </Text>
        {optional && <Text style={styles.optional}>(Optional)</Text>}
      </View>
      {children}
    </View>
  );
}

function NativeSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View>
      <Pressable onPress={() => setOpen((s) => !s)} style={styles.selectInput}>
        <Text style={[styles.selectText, !selected && { color: GRAY[400] }]}>
          {selected?.label ?? 'Select…'}
        </Text>
        <ChevronDown size={16} color={GRAY[500]} />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {options.map((o) => (
            <Pressable
              key={o.value || 'empty'}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={[
                styles.dropdownItem,
                value === o.value && styles.dropdownItemActive,
              ]}
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
function formatAge(dob: string): string {
  const d = new Date(dob);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age === 1 ? '1 year old' : `${age} years old`;
}
function extractError(e: any) {
  return (
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    'Something went wrong'
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 4, fontSize: 12, color: GRAY[600], lineHeight: 17 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: '#fff',
  },
  outlineBtnText: { color: PRIMARY[600], fontWeight: '700', fontSize: 12 },

  statRow: { flexDirection: 'row', gap: 12 },
  statTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GRAY[100],
  },
  statTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTileValue: { fontSize: 24, fontWeight: '800', color: GRAY[900] },
  statTileLabel: { fontSize: 10, color: GRAY[500], fontWeight: '700', marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },

  loadingBlock: { paddingVertical: 24, alignItems: 'center' },
  emptyBlock: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  emptyHint: {
    fontSize: 12,
    color: GRAY[600],
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 17,
  },

  memberRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: GRAY[50],
    padding: 12,
    borderRadius: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: { color: PRIMARY[700], fontWeight: '800', fontSize: 13 },
  memberName: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  memberMeta: { fontSize: 12, color: GRAY[600], marginTop: 2 },
  iconBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8 },
  iconBtnDanger: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 },

  caregiverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GRAY[50],
    padding: 12,
    borderRadius: 12,
  },
  caregiverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverInitials: { color: '#1d4ed8', fontWeight: '800', fontSize: 13 },
  caregiverName: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  caregiverEmail: { fontSize: 12, color: GRAY[600], marginTop: 2 },
  roleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  roleBadgeText: { color: '#2563eb', fontSize: 10, fontWeight: '700' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: GRAY[900] },
  modalSubtitle: { fontSize: 12, color: GRAY[600], marginBottom: 12, lineHeight: 17 },

  formErrorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  formErrorText: { color: PRIMARY[700], fontSize: 12 },

  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: GRAY[800] },
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
    borderBottomWidth: 1,
    borderBottomColor: GRAY[100],
  },
  dropdownItemActive: { backgroundColor: PRIMARY[50] },
  dropdownItemText: { fontSize: 14, color: GRAY[800] },
  dropdownItemTextActive: { color: PRIMARY[700], fontWeight: '600' },

  row2: { flexDirection: 'row', gap: 12 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: GRAY[100],
  },
  cancelBtnText: { color: GRAY[700], fontWeight: '700', fontSize: 13 },
});

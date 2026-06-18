/**
 * Invite Caregiver — mirrors the web's /dashboard/family-members/invite 1:1.
 * POST /api/family/invitations (same backend, same payload).
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
  Alert,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  Send,
  ArrowLeft,
  ChevronDown,
  AlertCircle,
  User,
  Mail,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import {
  familyApi,
  type CaregiverPermissionKey,
  type InviteCaregiverInput,
} from '@/api/family';

interface PermissionDef {
  key: CaregiverPermissionKey;
  label: string;
  description: string;
}

const PERMISSIONS: PermissionDef[] = [
  {
    key: 'view_medical',
    label: 'View medical profile',
    description:
      'Read allergies, medications, conditions, and emergency contacts.',
  },
  {
    key: 'receive_alerts',
    label: 'Receive alerts',
    description: 'Get SMS / push when an emergency profile is accessed.',
  },
  {
    key: 'confirm_checkins',
    label: 'Confirm check-ins',
    description: 'Respond to guardian-initiated wellness check-ins.',
  },
  {
    key: 'add_notes',
    label: 'Add status notes',
    description: 'Append observations to the dependent’s timeline.',
  },
];

const DEFAULT_PERMS: CaregiverPermissionKey[] = [
  'view_medical',
  'receive_alerts',
  'confirm_checkins',
  'add_notes',
];

const ROLES = [
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'second_parent', label: 'Second Parent (View Only)' },
] as const;

const DURATIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '1 year' },
];

export default function InviteCaregiverScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'caregiver' | 'second_parent' | ''>('');
  const [accessDuration, setAccessDuration] = useState('permanent');
  const [perms, setPerms] = useState<CaregiverPermissionKey[]>(DEFAULT_PERMS);
  const [error, setError] = useState<string | null>(null);

  const sendMut = useMutation({
    mutationFn: (body: InviteCaregiverInput) => familyApi.inviteCaregiver(body),
    onSuccess: (res) => {
      Alert.alert(
        'Invitation sent',
        `${res.invitation.email} will receive an email shortly.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    },
    onError: (e: any) => {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          'Couldn’t send the invitation. Please try again.',
      );
    },
  });

  const togglePerm = (k: CaregiverPermissionKey) => {
    setPerms((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  };

  const handleSubmit = () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      return setError('Please enter a valid email address');
    }
    if (fullName.trim().length < 2) {
      return setError('Please enter the caregiver’s full name');
    }
    if (!role) {
      return setError('Please select a role');
    }
    const body: InviteCaregiverInput = {
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      phoneNumber: phone.trim() || undefined,
      role,
      permissions: perms,
      accessExpiresInDays:
        accessDuration === 'permanent' ? undefined : parseInt(accessDuration, 10),
    };
    sendMut.mutate(body);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backRow}
          hitSlop={8}
        >
          <ArrowLeft size={16} color={GRAY[700]} />
          <Text style={styles.backText}>Back to Family Members</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Send size={20} color={PRIMARY[600]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Invite a Caregiver</Text>
            <Text style={styles.headerSub}>
              Send an invitation to a trusted person so they can access your
              family&apos;s medical profiles.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <AlertCircle size={14} color={PRIMARY[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Field label="Email Address" required>
            <View style={styles.inputIconRow}>
              <Mail size={14} color={GRAY[400]} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="caregiver@example.com"
                placeholderTextColor={GRAY[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputInRow}
              />
            </View>
          </Field>

          <Field label="Full Name" required>
            <View style={styles.inputIconRow}>
              <User size={14} color={GRAY[400]} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Their full name"
                placeholderTextColor={GRAY[400]}
                style={styles.inputInRow}
              />
            </View>
          </Field>

          <Field label="Phone Number" optional>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (416) 555-5234"
              placeholderTextColor={GRAY[400]}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Field>

          <Field label="Role" required>
            <NativeSelect
              value={role}
              options={[
                { value: '', label: 'Select a role…' },
                ...ROLES.map((r) => ({ value: r.value, label: r.label })),
              ]}
              onChange={(v) => setRole(v as 'caregiver' | 'second_parent' | '')}
            />
          </Field>

          <View style={styles.permsCard}>
            <Text style={styles.permsTitle}>What can they do?</Text>
            <Text style={styles.permsSub}>
              Pick the actions this caregiver is allowed to perform. They will
              never be able to create or delete profiles, change billing, or
              modify ownership.
            </Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {PERMISSIONS.map((p) => {
                const checked = perms.includes(p.key);
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => togglePerm(p.key)}
                    style={[
                      styles.permRow,
                      checked && {
                        backgroundColor: '#fef2f2',
                        borderColor: '#fecaca',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checked && {
                          backgroundColor: '#2563eb',
                          borderColor: '#2563eb',
                        },
                      ]}
                    >
                      {checked && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.permLabel}>{p.label}</Text>
                      <Text style={styles.permDesc}>{p.description}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field label="Access Duration" optional>
            <NativeSelect
              value={accessDuration}
              options={DURATIONS}
              onChange={setAccessDuration}
            />
          </Field>

          <Pressable
            onPress={handleSubmit}
            disabled={sendMut.isPending}
            style={[
              styles.primaryBtn,
              { width: '100%' },
              sendMut.isPending && { opacity: 0.6 },
            ]}
          >
            {sendMut.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={16} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>
              {sendMut.isPending ? 'Sending…' : 'Send Invitation'}
            </Text>
          </Pressable>

          <View style={styles.disclaimer}>
            <AlertCircle size={12} color={GRAY[500]} />
            <Text style={styles.disclaimerText}>
              The invitation email expires in 7 days. Only the email address you
              specify can accept it.
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  optional,
  required,
  children,
}: {
  label: string;
  optional?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={{ color: PRIMARY[600] }}> *</Text>}
        </Text>
        {optional && <Text style={styles.optional}>(optional)</Text>}
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
        <Text style={[styles.selectText, !selected?.value && { color: GRAY[400] }]}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: GRAY[700], fontSize: 13, fontWeight: '600' },

  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 4, fontSize: 12, color: GRAY[600], lineHeight: 17 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 4,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { color: PRIMARY[700], fontSize: 12, flex: 1 },

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
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputInRow: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: GRAY[900],
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

  permsCard: {
    backgroundColor: GRAY[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  permsTitle: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  permsSub: { fontSize: 11, color: GRAY[600], marginTop: 4, lineHeight: 16 },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY[200],
    backgroundColor: '#fff',
  },
  permLabel: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  permDesc: { fontSize: 11, color: GRAY[600], marginTop: 2, lineHeight: 16 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: GRAY[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 2,
  },
  checkboxTick: { color: '#fff', fontWeight: '800', fontSize: 11 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
  },
  disclaimerText: { fontSize: 11, color: GRAY[500], flex: 1, lineHeight: 16 },
});

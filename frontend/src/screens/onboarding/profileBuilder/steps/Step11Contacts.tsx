import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { VisibilityToggle } from '../components/VisibilityToggle';
import { IconInput } from '../components/IconInput';
import { SelectField } from '../components/SelectField';
import { AlertTriangleIcon } from '../components/LucideIcons';
import { RELATION_OPTIONS } from '../enums';
import { makeId } from '../buildPayload';
import type { EmergencyContactEntry, StepProps, ValidatorFn } from '../types';

function newContact(priority: number): EmergencyContactEntry {
  return {
    id: makeId(),
    name: '',
    relation: '',
    phone: '',
    email: '',
    priority,
    isPrimary: priority === 1,
    availableStart: '',
    availableEnd: '',
    notes: '',
  };
}

/**
 * Mirrors web validateStep(11): each contact that has any of name / phone
 * filled must have both name and phone. At least ONE contact with both a
 * non-empty name and phone is required to advance.
 */
export const validateStep11: ValidatorFn = (_data, arrays) => {
  const errs: string[] = [];
  arrays.emergencyContacts.forEach((c, idx) => {
    if (c.name.trim() || c.phone.trim()) {
      if (!c.name.trim()) errs.push(`Contact ${idx + 1}: Name is required`);
      if (!c.phone.trim()) errs.push(`Contact ${idx + 1}: Phone number is required`);
    }
  });
  const hasValid = arrays.emergencyContacts.some(
    (c) => c.name.trim() && c.phone.trim()
  );
  if (!hasValid) {
    errs.push('At least one emergency contact with valid name and phone is required');
  }
  return errs.length ? errs : null;
};

export function Step11Contacts({
  data,
  arrays,
  update,
  updateArray,
  attemptedSubmit,
}: StepProps) {
  const contacts = arrays.emergencyContacts;

  // Ensure at least one contact slot is always rendered, like the web.
  React.useEffect(() => {
    if (contacts.length === 0) {
      updateArray('emergencyContacts', [newContact(1)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addContact = () => {
    const next = [...contacts, newContact(contacts.length + 1)];
    updateArray('emergencyContacts', next);
  };
  const removeContact = (id: string) => {
    updateArray(
      'emergencyContacts',
      contacts.filter((c) => c.id !== id)
    );
  };
  const updateContact = (id: string, patch: Partial<EmergencyContactEntry>) =>
    updateArray(
      'emergencyContacts',
      contacts.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );

  const hasValid = contacts.some((c) => c.name.trim() && c.phone.trim());

  return (
    <View style={styles.card}>
      <VisibilityToggle
        title="Emergency Contacts Visibility"
        value={data.emergencyContactsPublic}
        onChange={(v) => update('emergencyContactsPublic', v)}
        publicDescription="First responders can see and call your emergency contacts"
        privateDescription="Emergency contacts will be hidden from emergency view"
      />

      <View style={styles.requiredBanner}>
        <AlertTriangleIcon size={20} color="#b91c1c" />
        <Text style={styles.requiredBannerText}>
          At least one emergency contact is required. These people will be contacted in case of emergency.
        </Text>
      </View>

      <View style={styles.addRow}>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
          ]}
          onPress={addContact}
        >
          <Ionicons name="add" size={16} color="#dc2626" />
          <Text style={styles.addBtnText}>Add Contact</Text>
        </Pressable>
      </View>

      {contacts.map((contact, index) => {
        const nameMissing =
          !!attemptedSubmit &&
          (contact.name.trim() || contact.phone.trim()) &&
          !contact.name.trim();
        const phoneMissing =
          !!attemptedSubmit &&
          (contact.name.trim() || contact.phone.trim()) &&
          !contact.phone.trim();
        return (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View>
                <Text style={styles.contactTitle}>Contact {index + 1}</Text>
                {contact.isPrimary && (
                  <View style={styles.primaryPill}>
                    <Text style={styles.primaryPillText}>Primary</Text>
                  </View>
                )}
              </View>
              {index > 0 && (
                <Pressable onPress={() => removeContact(contact.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </Pressable>
              )}
            </View>

            <View style={styles.grid}>
              <View style={styles.col}>
                <IconInput
                  label="Full Name"
                  required={index === 0}
                  value={contact.name}
                  onChange={(v) => updateContact(contact.id, { name: v })}
                  placeholder="John Doe"
                  error={
                    nameMissing
                      ? `Contact ${index + 1}: Name is required`
                      : undefined
                  }
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="Relationship"
                  optional
                  placeholder="Select Relationship"
                  value={contact.relation}
                  options={RELATION_OPTIONS}
                  onChange={(v) => updateContact(contact.id, { relation: v })}
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Phone Number"
                  required={index === 0}
                  icon={<Ionicons name="call-outline" size={16} color={GRAY[400]} />}
                  value={contact.phone}
                  onChange={(v) => updateContact(contact.id, { phone: v })}
                  keyboardType="phone-pad"
                  placeholder="+1 (555) 123-4567"
                  error={
                    phoneMissing
                      ? `Contact ${index + 1}: Phone number is required`
                      : undefined
                  }
                />
              </View>
              <View style={styles.col}>
                <IconInput
                  label="Email"
                  optional
                  value={contact.email}
                  onChange={(v) => updateContact(contact.id, { email: v })}
                  placeholder="contact@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.colFull}>
                <Text style={styles.notesLabel}>
                  Notes <Text style={styles.optionalText}>(Optional)</Text>
                </Text>
                <TextInput
                  style={styles.notesInput}
                  value={contact.notes}
                  onChangeText={(v) => updateContact(contact.id, { notes: v })}
                  placeholder="e.g., Works night shift, best to call in afternoon"
                  placeholderTextColor={GRAY[400]}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );
      })}

      {attemptedSubmit && !hasValid && (
        <Text style={styles.errorMessage}>
          At least one emergency contact with valid name and phone is required
        </Text>
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
    gap: spacing[4],
  },
  requiredBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  requiredBannerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#991b1b',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  addRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  addBtnPressed: { backgroundColor: '#fee2e2' },
  addBtnText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#dc2626',
  },
  contactCard: {
    backgroundColor: SEMANTIC.surface.default,
    borderColor: SEMANTIC.border.default,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  contactTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
  primaryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: '#fee2e2',
    marginTop: 2,
  },
  primaryPillText: {
    fontSize: typography.fontSize.xs,
    color: '#b91c1c',
    fontWeight: typography.fontWeight.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: spacing[3],
  },
  col: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 180,
  },
  colFull: { flexBasis: '100%' },
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
    minHeight: 72,
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: '#dc2626',
    fontWeight: typography.fontWeight.medium,
  },
});

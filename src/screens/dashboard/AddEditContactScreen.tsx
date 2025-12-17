/**
 * Add/Edit Contact Screen
 * Form for adding or editing emergency contacts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Button, Input, Toast, useToast } from '@/components/ui';
import { contactsApi } from '@/api/contacts';
import type { EmergencyContact, EmergencyContactInput } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  relationship: z
    .string()
    .min(1, 'Relationship is required')
    .max(50, 'Relationship is too long'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      'Invalid phone number'
    ),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  isPrimary: z.boolean().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type RouteParams = {
  AddEditContact: {
    contact?: EmergencyContact;
  };
};

export default function AddEditContactScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'AddEditContact'>>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const existingContact = route.params?.contact;
  const isEditing = !!existingContact;

  const [formData, setFormData] = useState<ContactFormData>({
    name: existingContact?.name || '',
    relationship: existingContact?.relationship || '',
    phone: existingContact?.phone || '',
    email: existingContact?.email || '',
    isPrimary: existingContact?.isPrimary || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: contactsApi.addEmergencyContact,
    onSuccess: () => {
      success('Contact added successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      navigation.goBack();
    },
    onError: () => {
      showError('Failed to add contact');
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<EmergencyContactInput> }) =>
      contactsApi.updateEmergencyContact(data.id, data.updates),
    onSuccess: () => {
      success('Contact updated successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      navigation.goBack();
    },
    onError: () => {
      showError('Failed to update contact');
    },
  });

  const handleChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof ContactFormData) => {
    try {
      const fieldSchema = contactSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(formData[field]);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message,
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ContactFormData;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);

        // Mark all fields as touched
        setTouched({
          name: true,
          relationship: true,
          phone: true,
          email: true,
          isPrimary: true,
        });
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    const submitData: EmergencyContactInput = {
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      email: formData.email || undefined,
      isPrimary: formData.isPrimary,
    };

    if (isEditing && existingContact) {
      updateContactMutation.mutate({
        id: existingContact.id,
        updates: submitData,
      });
    } else {
      addContactMutation.mutate(submitData);
    }
  };

  const isLoading = addContactMutation.isPending || updateContactMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color={PRIMARY[600]} />
          </View>
          <Text style={styles.title}>
            {isEditing ? 'Edit Contact' : 'Add Emergency Contact'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? 'Update the contact information below'
              : 'Add someone who can be reached in case of an emergency'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : undefined}
            leftIcon="person-outline"
            autoCapitalize="words"
          />

          {/* Relationship */}
          <Input
            label="Relationship"
            placeholder="Spouse, Parent, Friend, etc."
            value={formData.relationship}
            onChangeText={(value) => handleChange('relationship', value)}
            onBlur={() => handleBlur('relationship')}
            error={touched.relationship ? errors.relationship : undefined}
            leftIcon="heart-outline"
            autoCapitalize="words"
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            onBlur={() => handleBlur('phone')}
            error={touched.phone ? errors.phone : undefined}
            leftIcon="call-outline"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          {/* Email */}
          <Input
            label="Email (Optional)"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : undefined}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Primary Contact */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLeft}>
              <Text style={styles.switchLabel}>Primary Contact</Text>
              <Text style={styles.switchDescription}>
                This contact will be called first in emergencies
              </Text>
            </View>
            <Switch
              value={formData.isPrimary || false}
              onValueChange={(value) => handleChange('isPrimary', value)}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isEditing ? 'Update Contact' : 'Add Contact'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  form: {
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  switchLeft: {
    flex: 1,
    marginRight: spacing[3],
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  switchDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  actions: {
    gap: spacing[3],
  },
});

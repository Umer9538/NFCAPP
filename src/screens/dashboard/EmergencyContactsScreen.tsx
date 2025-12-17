/**
 * Emergency Contacts Screen
 * Displays and manages emergency contacts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Card, LoadingSpinner, Toast, useToast, FAB } from '@/components/ui';
import { contactsApi } from '@/api/contacts';
import type { EmergencyContact } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function EmergencyContactsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Fetch emergency contacts
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: contactsApi.getEmergencyContacts,
    // Mock data for development
    placeholderData: getMockContacts(),
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: contactsApi.deleteEmergencyContact,
    onSuccess: () => {
      success('Contact deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
    },
    onError: () => {
      showError('Failed to delete contact');
    },
  });

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          showError('Phone calls are not supported on this device');
        }
      })
      .catch(() => {
        showError('Failed to make call');
      });
  };

  const handleEmail = (email: string) => {
    const emailUrl = `mailto:${email}`;
    Linking.openURL(emailUrl).catch(() => {
      showError('Failed to open email');
    });
  };

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContactMutation.mutate(contact.id),
        },
      ]
    );
  };

  const handleEdit = (contact: EmergencyContact) => {
    navigation.navigate('AddEditContact', { contact });
  };

  const handleAddContact = () => {
    navigation.navigate('AddEditContact', {});
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading contacts..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={STATUS.error} />
        <Text style={styles.errorText}>Failed to load contacts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {!contacts || contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={SEMANTIC.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyStateText}>
              Add emergency contacts who can be reached in case of an emergency.
            </Text>
            <Pressable style={styles.emptyStateButton} onPress={handleAddContact}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.emptyStateButtonText}>Add Contact</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onCall={handleCall}
                onEmail={handleEmail}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {contacts && contacts.length > 0 && (
        <FAB
          icon="add"
          onPress={handleAddContact}
          position="bottom-right"
          label="Add Contact"
        />
      )}

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

interface ContactCardProps {
  contact: EmergencyContact;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contact: EmergencyContact) => void;
}

function ContactCard({ contact, onCall, onEmail, onEdit, onDelete }: ContactCardProps) {
  return (
    <View style={styles.contactCardWrapper}>
      <Card variant="elevated" padding="md" style={styles.contactCard}>
            {/* Header */}
            <View style={styles.contactHeader}>
              <View style={styles.contactInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <Pressable onPress={() => onEdit(contact)} style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color={PRIMARY[600]} />
                </Pressable>
                <Pressable onPress={() => onDelete(contact)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                </Pressable>
              </View>
            </View>

            {/* Contact Methods */}
            <View style={styles.contactMethods}>
              {/* Phone */}
              <Pressable
                style={styles.contactMethod}
                onPress={() => onCall(contact.phone)}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name="call" size={18} color={MEDICAL_COLORS.blue[600]} />
                </View>
                <View style={styles.methodContent}>
                  <Text style={styles.methodLabel}>Phone</Text>
                  <Text style={styles.methodValue}>{contact.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
              </Pressable>

              {/* Email */}
              {contact.email && (
                <Pressable
                  style={styles.contactMethod}
                  onPress={() => onEmail(contact.email!)}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons name="mail" size={18} color={MEDICAL_COLORS.purple[600]} />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={styles.methodLabel}>Email</Text>
                    <Text style={styles.methodValue}>{contact.email}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={SEMANTIC.text.tertiary}
                  />
                </Pressable>
              )}
            </View>
      </Card>
    </View>
  );
}

function getMockContacts(): EmergencyContact[] {
  return [
    {
      id: '1',
      name: 'John Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      relationship: 'Sister',
      phone: '+1 (555) 987-6543',
      email: 'jane.smith@example.com',
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Robert Johnson',
      relationship: 'Friend',
      phone: '+1 (555) 456-7890',
      isPrimary: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
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
    paddingBottom: spacing[20], // Extra padding for FAB
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: SEMANTIC.background.default,
  },
  errorText: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[4],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[8],
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY[600],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
    gap: spacing[2],
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    gap: spacing[3],
  },
  contactCardWrapper: {
    marginBottom: spacing[3],
  },
  contactCard: {
    backgroundColor: SEMANTIC.background.surface,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  contactDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  primaryBadge: {
    backgroundColor: PRIMARY[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  contactRelationship: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  editButton: {
    padding: spacing[2],
  },
  deleteButton: {
    padding: spacing[2],
  },
  contactMethods: {
    gap: spacing[2],
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: SEMANTIC.background.default,
    borderRadius: 8,
    gap: spacing[3],
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SEMANTIC.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginBottom: 2,
  },
  methodValue: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
});

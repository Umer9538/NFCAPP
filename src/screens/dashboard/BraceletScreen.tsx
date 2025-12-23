/**
 * Bracelet Screen
 * NFC bracelet management and status
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, formatDistanceToNow } from 'date-fns';
import type { AppScreenNavigationProp } from '@/navigation/types';

import {
  Button,
  Card,
  Badge,
  Toast,
  useToast,
  LoadingSpinner,
} from '@/components/ui';
import { Bracelet3DView } from '@/components/Bracelet3DView';
import { braceletApi } from '@/api/bracelet';
import type { BraceletStatus } from '@/types/bracelet';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function BraceletScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualNfcId, setManualNfcId] = useState('');

  // Fetch bracelet status
  const { data: bracelet, isLoading } = useQuery({
    queryKey: ['bracelet'],
    queryFn: braceletApi.getBraceletStatus,
    placeholderData: getMockBraceletData(),
  });

  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: braceletApi.unlinkBracelet,
    onSuccess: () => {
      success('Bracelet unlinked successfully');
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });
    },
    onError: () => {
      showError('Failed to unlink bracelet');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: braceletApi.updateBraceletStatus,
    onSuccess: () => {
      success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });
    },
    onError: () => {
      showError('Failed to update status');
    },
  });

  // Link bracelet mutation
  const linkMutation = useMutation({
    mutationFn: (nfcId: string) => braceletApi.linkBracelet({ nfcId }),
    onSuccess: () => {
      success('Bracelet linked successfully!');
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });
      setShowManualEntry(false);
      setManualNfcId('');
    },
    onError: (err: any) => {
      showError(err.message || 'Failed to link bracelet');
    },
  });

  const handleUnlink = () => {
    Alert.alert(
      'Unlink Bracelet',
      'Are you sure you want to unlink this bracelet? Your emergency profile will no longer be accessible via this NFC tag.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () => unlinkMutation.mutate(),
        },
      ]
    );
  };

  const handleStatusChange = (status: BraceletStatus) => {
    if (status === 'lost') {
      Alert.alert(
        'Report Lost',
        'Marking your bracelet as lost will deactivate the emergency profile link. You can reactivate it later if you find it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Report Lost',
            style: 'destructive',
            onPress: () => updateStatusMutation.mutate(status),
          },
        ]
      );
    } else {
      updateStatusMutation.mutate(status);
    }
  };

  const handleTestProfile = () => {
    if (bracelet?.emergencyUrl) {
      Linking.openURL(bracelet.emergencyUrl);
      success('Opening emergency profile...');
    }
  };

  const handleScanNFC = () => {
    navigation.navigate('NFCScanner');
  };

  const handleManualLink = () => {
    const trimmedId = manualNfcId.trim();
    if (!trimmedId) {
      Alert.alert('Error', 'Please enter a valid NFC ID');
      return;
    }
    if (trimmedId.length < 4) {
      Alert.alert('Error', 'NFC ID must be at least 4 characters');
      return;
    }
    linkMutation.mutate(trimmedId);
  };

  const handleViewQR = () => {
    navigation.navigate('QRCodeGenerator');
  };

  const getStatusColor = (status: BraceletStatus) => {
    switch (status) {
      case 'active':
        return MEDICAL_COLORS.green.dark;
      case 'inactive':
        return SEMANTIC.text.tertiary;
      case 'lost':
        return STATUS.error.main;
    }
  };

  const getStatusIcon = (status: BraceletStatus) => {
    switch (status) {
      case 'active':
        return 'checkmark-circle';
      case 'inactive':
        return 'pause-circle';
      case 'lost':
        return 'alert-circle';
    }
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading bracelet info..." />;
  }

  // Unlinked State
  if (!bracelet) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.emptyStateContainer}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Ionicons name="watch" size={120} color={PRIMARY[200]} />
          </View>

          {/* Header */}
          <Text style={styles.emptyTitle}>No Bracelet Linked</Text>
          <Text style={styles.emptySubtitle}>
            Link your NFC bracelet to enable instant access to your emergency profile
          </Text>

          {/* Benefits */}
          <Card variant="outline" padding="lg" style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why link a bracelet?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={20} color={PRIMARY[600]} />
                <Text style={styles.benefitText}>
                  Instant access to your medical information
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={20} color={PRIMARY[600]} />
                <Text style={styles.benefitText}>
                  Emergency responders can help you faster
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="people" size={20} color={PRIMARY[600]} />
                <Text style={styles.benefitText}>
                  Contact your emergency contacts immediately
                </Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <Button
            fullWidth
            onPress={handleScanNFC}
            icon={<Ionicons name="scan" size={20} color="#ffffff" />}
            style={styles.primaryButton}
          >
            Scan NFC Bracelet
          </Button>

          <Button
            variant="outline"
            fullWidth
            onPress={() => setShowManualEntry(true)}
            style={styles.secondaryButton}
          >
            Enter NFC ID Manually
          </Button>

          {/* Instructions */}
          <Card variant="elevated" padding="md" style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to link:</Text>
            <Text style={styles.instructionsText}>
              1. Tap "Scan NFC Bracelet" above{'\n'}
              2. Hold your phone near the bracelet{'\n'}
              3. Wait for confirmation{'\n'}
              4. Your bracelet is now linked!
            </Text>
          </Card>
        </View>

        {/* Manual Entry Modal */}
        <Modal
          visible={showManualEntry}
          animationType="slide"
          transparent
          onRequestClose={() => setShowManualEntry(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setShowManualEntry(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Enter NFC ID Manually</Text>
                <Pressable
                  onPress={() => setShowManualEntry(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={SEMANTIC.text.secondary} />
                </Pressable>
              </View>

              <Text style={styles.modalDescription}>
                Enter the NFC ID printed on your bracelet or packaging. It usually looks like "NFC-XXXX-XXXX".
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="e.g., NFC-MG-2024-001234"
                placeholderTextColor={SEMANTIC.text.tertiary}
                value={manualNfcId}
                onChangeText={setManualNfcId}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowManualEntry(false);
                    setManualNfcId('');
                  }}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleManualLink}
                  loading={linkMutation.isPending}
                  style={styles.modalButton}
                >
                  Link Bracelet
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Toast {...toastConfig} onDismiss={hideToast} />
      </ScrollView>
    );
  }

  // Linked State
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 3D Bracelet Viewer */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>3D Bracelet Model</Text>
        <Text style={styles.sectionSubtitle}>
          Interactive visualization of your NFC bracelet
        </Text>
        <View style={styles.viewer3DContainer}>
          <Bracelet3DView
            nfcId={bracelet.nfcId}
            status={bracelet.status || 'active'}
            autoRotate={true}
          />
        </View>
      </Card>

      {/* Status Card */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <View style={styles.statusBadgeContainer}>
              <Ionicons
                name={getStatusIcon(bracelet.status || 'active')}
                size={24}
                color={getStatusColor(bracelet.status || 'active')}
              />
              <Text
                style={[styles.statusText, { color: getStatusColor(bracelet.status || 'active') }]}
              >
                {(bracelet.status || 'active').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.statusLabel}>Bracelet Status</Text>
          </View>
          <Ionicons name="watch" size={48} color={PRIMARY[600]} />
        </View>

        {/* Status Actions */}
        {(bracelet.status || 'active') === 'lost' ? (
          <Button
            variant="outline"
            fullWidth
            onPress={() => handleStatusChange('active')}
            style={styles.statusButton}
          >
            Mark as Found
          </Button>
        ) : (
          <View style={styles.statusButtons}>
            {(bracelet.status || 'active') === 'active' && (
              <Button
                variant="outline"
                onPress={() => handleStatusChange('inactive')}
                style={styles.halfButton}
              >
                Deactivate
              </Button>
            )}
            {(bracelet.status || 'active') === 'inactive' && (
              <Button
                onPress={() => handleStatusChange('active')}
                style={styles.halfButton}
              >
                Activate
              </Button>
            )}
            <Button
              variant="outline"
              onPress={() => handleStatusChange('lost')}
              style={styles.halfButton}
            >
              Report Lost
            </Button>
          </View>
        )}
      </Card>

      {/* Bracelet Info */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <Text style={styles.sectionTitle}>Bracelet Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NFC ID:</Text>
          <Text style={styles.infoValue}>{bracelet.nfcId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Linked Date:</Text>
          <Text style={styles.infoValue}>
            {format(new Date(bracelet.linkedDate), 'MMM d, yyyy')}
          </Text>
        </View>

        {bracelet.lastAccessed && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Accessed:</Text>
            <Text style={styles.infoValue}>
              {formatDistanceToNow(new Date(bracelet.lastAccessed), {
                addSuffix: true,
              })}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Accesses:</Text>
          <Badge variant="primary">{bracelet.accessCount}</Badge>
        </View>
      </Card>

      {/* QR Code Section */}
      <Card variant="elevated" padding="lg" style={styles.section}>
        <View style={styles.qrHeader}>
          <Text style={styles.sectionTitle}>Emergency QR Code</Text>
          <Ionicons name="qr-code" size={32} color={PRIMARY[600]} />
        </View>
        <Text style={styles.qrDescription}>
          Share or print this QR code for quick access to your emergency profile
        </Text>

        <Button
          variant="outline"
          fullWidth
          onPress={handleViewQR}
          icon={<Ionicons name="qr-code-outline" size={20} color={PRIMARY[600]} />}
        >
          View QR Code
        </Button>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <Pressable style={styles.actionCard} onPress={handleTestProfile}>
          <View style={[styles.actionIcon, { backgroundColor: MEDICAL_COLORS.blue.light }]}>
            <Ionicons name="eye" size={24} color={MEDICAL_COLORS.blue.dark} />
          </View>
          <Text style={styles.actionText}>Test Profile</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={handleScanNFC}>
          <View
            style={[styles.actionIcon, { backgroundColor: MEDICAL_COLORS.purple.light }]}
          >
            <Ionicons name="scan" size={24} color={MEDICAL_COLORS.purple.dark} />
          </View>
          <Text style={styles.actionText}>Re-scan</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={handleViewQR}>
          <View
            style={[styles.actionIcon, { backgroundColor: MEDICAL_COLORS.green.light }]}
          >
            <Ionicons name="download" size={24} color={MEDICAL_COLORS.green.dark} />
          </View>
          <Text style={styles.actionText}>Download QR</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate('ScanHistory')}
        >
          <View
            style={[styles.actionIcon, { backgroundColor: MEDICAL_COLORS.yellow.light }]}
          >
            <Ionicons name="time" size={24} color={MEDICAL_COLORS.yellow.dark} />
          </View>
          <Text style={styles.actionText}>Access History</Text>
        </Pressable>
      </View>

      {/* Unlink Button */}
      <Button
        variant="outline"
        fullWidth
        onPress={handleUnlink}
        loading={unlinkMutation.isPending}
        style={styles.unlinkButton}
      >
        Unlink Bracelet
      </Button>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </ScrollView>
  );
}

// Mock data for development
function getMockBraceletData() {
  return {
    id: 'bracelet-1',
    nfcId: 'NFC-MG-2024-001234',
    userId: 'user-1',
    status: 'active' as const,
    linkedDate: '2024-01-15T10:30:00.000Z',
    lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accessCount: 12,
    deviceInfo: {
      model: 'iPhone 15 Pro',
      os: 'iOS 17.2',
      location: 'San Francisco, CA',
    },
    emergencyUrl: 'https://medguard.com/emergency/profile-123',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=profile-123',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: new Date().toISOString(),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[4],
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  illustrationContainer: {
    marginBottom: spacing[6],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[6],
  },
  benefitsCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
  },
  benefitsList: {
    gap: spacing[3],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  primaryButton: {
    marginBottom: spacing[3],
  },
  secondaryButton: {
    marginBottom: spacing[6],
  },
  instructionsCard: {
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  instructionsText: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  statusInfo: {
    flex: 1,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  halfButton: {
    flex: 1,
  },
  statusButton: {
    marginTop: spacing[3],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  sectionSubtitle: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[4],
  },
  viewer3DContainer: {
    marginTop: spacing[2],
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  infoLabel: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  qrDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[4],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing[2],
    marginBottom: spacing[4],
  },
  actionCard: {
    width: '50%',
    padding: spacing[2],
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    alignSelf: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
  unlinkButton: {
    borderColor: STATUS.error,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing[6],
    paddingBottom: spacing[8],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  modalCloseButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  modalDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  modalInput: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.background.secondary,
    marginBottom: spacing[4],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
});

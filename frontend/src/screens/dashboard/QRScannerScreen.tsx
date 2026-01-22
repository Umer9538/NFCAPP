/**
 * QR Scanner Screen
 * Scan QR codes on bracelets to access emergency profiles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Vibration,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { AppScreenNavigationProp } from '@/navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function QRScannerScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Request permission on mount
    if (!permission?.granted && !permission?.canAskAgain) {
      // Permission was denied
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    // Vibrate on scan
    Vibration.vibrate(100);

    try {
      // Validate QR code
      const result = await validateAndParseQRCode(data);

      if (result.valid) {
        // Show success feedback
        Alert.alert(
          'Profile Found!',
          'Emergency profile detected. Opening now...',
          [
            {
              text: 'View Profile',
              onPress: () => {
                // Navigate to emergency profile
                if (result.profileId) {
                  navigation.navigate('ViewEmergencyProfile', {
                    profileId: result.profileId,
                  });
                }
              },
            },
          ]
        );
      } else {
        // Invalid QR code
        Alert.alert(
          'Unrecognized QR Code',
          result.error || 'This QR code is not from MedGuard. Please scan a valid emergency profile code.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert(
        'Unable to Scan',
        'We could not process the QR code. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const validateAndParseQRCode = async (
    data: string
  ): Promise<{ valid: boolean; profileId?: string; nfcId?: string; error?: string }> => {
    try {
      // Check if it's a URL
      let url: URL;
      try {
        url = new URL(data);
      } catch {
        return { valid: false, error: 'The scanned code is not a valid link.' };
      }

      // Check if it's a MedGuard URL
      if (!url.hostname.includes('medguard')) {
        return { valid: false, error: 'This is not a MedGuard emergency profile.' };
      }

      // Parse emergency profile URL
      // Expected format: https://medguard.app/emergency/{profileId}
      // or https://medguard.app/emergency/{profileId}?nfc={nfcId}
      const pathParts = url.pathname.split('/');
      const emergencyIndex = pathParts.findIndex((part) => part === 'emergency');

      if (emergencyIndex === -1 || emergencyIndex >= pathParts.length - 1) {
        return { valid: false, error: 'This link does not contain a valid emergency profile.' };
      }

      const profileId = pathParts[emergencyIndex + 1];
      const nfcId = url.searchParams.get('nfc') || undefined;

      return {
        valid: true,
        profileId,
        nfcId,
      };
    } catch (error) {
      console.error('Parse error:', error);
      return { valid: false, error: 'Unable to read QR code. Please try again.' };
    }
  };

  const toggleFlash = () => {
    setFlashEnabled((prev) => !prev);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Loading state
  if (!permission) {
    return (
      <View style={styles.container}>
        <LoadingSpinner visible text="Loading camera..." />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={64} color={COLORS.gray[400]} />
          </View>

          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            MedGuard needs camera access to scan QR codes on emergency bracelets.
          </Text>

          <View style={styles.permissionActions}>
            {permission.canAskAgain ? (
              <Button onPress={requestPermission} style={styles.permissionButton}>
                Grant Permission
              </Button>
            ) : (
              <Button onPress={handleOpenSettings} style={styles.permissionButton}>
                Open Settings
              </Button>
            )}

            <Button variant="ghost" onPress={() => navigation.goBack()}>
              Cancel
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashEnabled}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <Pressable style={styles.controlButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.controlButton, flashEnabled && styles.controlButtonActive]}
              onPress={toggleFlash}
            >
              <Ionicons name={flashEnabled ? 'flash' : 'flash-off'} size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanningArea}>
            {/* Top Left Corner */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            {/* Top Right Corner */}
            <View style={[styles.corner, styles.cornerTopRight]} />
            {/* Bottom Left Corner */}
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            {/* Bottom Right Corner */}
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Scanning Line Animation */}
            {!scanned && (
              <View style={styles.scanLine}>
                <View style={styles.scanLineGradient} />
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <View style={styles.instructionCard}>
              <Ionicons name="scan" size={32} color={COLORS.primary[500]} />
              <Text style={styles.instructionTitle}>
                {processing ? 'Processing...' : scanned ? 'Scanned!' : 'Scan QR Code'}
              </Text>
              <Text style={styles.instructionText}>
                {processing
                  ? 'Please wait while we verify the code'
                  : scanned
                  ? 'QR code detected successfully'
                  : 'Position the QR code within the frame to scan'}
              </Text>
            </View>

            {/* Alternative Method */}
            <Pressable
              style={styles.alternativeButton}
              onPress={() => {
                navigation.goBack();
                navigation.navigate('NFCScan');
              }}
            >
              <Ionicons name="phone-portrait" size={20} color={COLORS.primary[600]} />
              <Text style={styles.alternativeText}>Use NFC Instead</Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[900],
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary[500],
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary[500],
  },
  cornerTopLeft: {
    top: (height - SCAN_AREA_SIZE) / 2,
    left: (width - SCAN_AREA_SIZE) / 2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: (height - SCAN_AREA_SIZE) / 2,
    right: (width - SCAN_AREA_SIZE) / 2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: (height - SCAN_AREA_SIZE) / 2 - 200,
    left: (width - SCAN_AREA_SIZE) / 2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: (height - SCAN_AREA_SIZE) / 2 - 200,
    right: (width - SCAN_AREA_SIZE) / 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: SCAN_AREA_SIZE - 80,
    height: 2,
  },
  scanLineGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary[500],
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  instructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  instructionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  instructionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
  },
  alternativeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  permissionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionActions: {
    width: '100%',
    gap: SPACING.md,
  },
  permissionButton: {
    width: '100%',
  },
});

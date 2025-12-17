/**
 * QR Code Screen
 * Full-screen QR code display with download, share, and print options
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Alert,
  Share,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { braceletApi } from '@/api/bracelet';
import { PRIMARY, GRAY } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
// Conditionally import Expo modules (may not be available in Expo Go)
let FileSystem: any = null;
let MediaLibrary: any = null;
let Print: any = null;

try {
  FileSystem = require('expo-file-system');
  MediaLibrary = require('expo-media-library');
  Print = require('expo-print');
} catch (error) {
  console.warn('Expo native modules not available - running in mock mode for Expo Go');
}

export function QRCodeScreen() {
  const navigation = useNavigation();
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch QR code data
  const { data: qrData, isLoading, error } = useQuery({
    queryKey: ['qrCode'],
    queryFn: braceletApi.generateQRCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      profileUrl: 'https://medguard.app/emergency/mock-emergency-id-123',
      qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      emergencyId: 'EMG-2024-001234',
    },
  });

  const handleDownload = async () => {
    if (!qrData?.qrCodeDataUrl) return;

    // Mock mode for Expo Go
    if (!FileSystem || !MediaLibrary) {
      Alert.alert(
        'Development Mode',
        'QR code download requires a development build. This feature will work in production.\n\nFor now, you can screenshot the QR code.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsDownloading(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your photo library.'
        );
        return;
      }

      // Download the QR code image
      const filename = `MedGuard_QRCode_${qrData.emergencyId}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // If it's a data URL, convert it to a file
      if (qrData.qrCodeDataUrl.startsWith('data:')) {
        const base64Data = qrData.qrCodeDataUrl.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        // If it's a regular URL, download it
        const downloadResult = await FileSystem.downloadAsync(
          qrData.qrCodeDataUrl,
          fileUri
        );
      }

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('MedGuard', asset, false);

      Alert.alert(
        'Success',
        'QR code has been saved to your photo library!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'Failed to save QR code. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!qrData?.profileUrl) return;

    try {
      const result = await Share.share({
        message: `My MedGuard Emergency Profile: ${qrData.profileUrl}`,
        url: Platform.OS === 'ios' ? qrData.profileUrl : undefined,
        title: 'MedGuard Emergency Profile',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Failed to share QR code.');
    }
  };

  const handlePrint = async () => {
    if (!qrData) return;

    // Mock mode for Expo Go
    if (!Print) {
      Alert.alert(
        'Development Mode',
        'QR code printing requires a development build. This feature will work in production.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                padding: 40px;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                border: 2px solid #dc2626;
                border-radius: 12px;
                padding: 32px;
              }
              .logo {
                color: #dc2626;
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 16px;
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 8px;
              }
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 32px;
              }
              .qr-code {
                width: 300px;
                height: 300px;
                margin: 0 auto 24px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
              }
              .qr-code img {
                width: 100%;
                height: 100%;
              }
              .emergency-id {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 16px;
              }
              .url {
                font-size: 14px;
                color: #6b7280;
                word-break: break-all;
                margin-bottom: 24px;
              }
              .instructions {
                background-color: #fef2f2;
                border-radius: 8px;
                padding: 16px;
                margin-top: 24px;
                text-align: left;
              }
              .instructions-title {
                font-size: 16px;
                font-weight: 600;
                color: #dc2626;
                margin-bottom: 12px;
              }
              .instructions ul {
                margin: 0;
                padding-left: 20px;
              }
              .instructions li {
                font-size: 14px;
                color: #374151;
                margin-bottom: 8px;
              }
              .footer {
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #9ca3af;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">MedGuard</div>
              <h1 class="title">Emergency Medical Profile</h1>
              <p class="subtitle">Scan this QR code to access medical information in emergencies</p>

              <div class="qr-code">
                <img src="${qrData.qrCodeDataUrl}" alt="Emergency QR Code" />
              </div>

              <div class="emergency-id">ID: ${qrData.emergencyId}</div>
              <div class="url">${qrData.profileUrl}</div>

              <div class="instructions">
                <div class="instructions-title">How to Use:</div>
                <ul>
                  <li>Keep this QR code with you at all times (wallet, keychain, etc.)</li>
                  <li>Emergency responders can scan this code to access your medical profile</li>
                  <li>No app required - works on any smartphone with a camera</li>
                  <li>Information is secure and only accessible via this QR code</li>
                </ul>
              </div>

              <div class="footer">
                Printed on ${new Date().toLocaleDateString()} | www.medguard.app
              </div>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({
        html,
        width: 612,
        height: 792,
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Failed', 'Failed to print QR code.');
    }
  };

  const handleCopyUrl = () => {
    if (!qrData?.profileUrl) return;

    // Note: Clipboard API would be used here
    // For now, show alert with URL
    Alert.alert(
      'Emergency Profile URL',
      qrData.profileUrl,
      [
        { text: 'OK' },
        {
          text: 'Share',
          onPress: handleShare,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={GRAY[700]} />
          </Pressable>
          <Text style={styles.headerTitle}>Emergency QR Code</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Generating QR code...</Text>
        </View>
      </View>
    );
  }

  if (error || !qrData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={GRAY[700]} />
          </Pressable>
          <Text style={styles.headerTitle}>Emergency QR Code</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={PRIMARY[600]} />
          <Text style={styles.errorTitle}>Failed to Load QR Code</Text>
          <Text style={styles.errorText}>
            Unable to generate QR code. Please check your bracelet connection.
          </Text>
          <Button onPress={() => navigation.goBack()} style={styles.errorButton}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={GRAY[700]} />
        </Pressable>
        <Text style={styles.headerTitle}>Emergency QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* QR Code Display */}
        <Card variant="elevated" padding="lg" style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={24} color={PRIMARY[600]} />
              <Text style={styles.logoText}>MedGuard</Text>
            </View>
            <Text style={styles.qrTitle}>Emergency Medical Profile</Text>
          </View>

          <View style={styles.qrCodeContainer}>
            <Image
              source={{ uri: qrData.qrCodeDataUrl }}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.qrInfo}>
            <Text style={styles.emergencyId}>ID: {qrData.emergencyId}</Text>
            <Pressable onPress={handleCopyUrl} style={styles.urlContainer}>
              <Text style={styles.url} numberOfLines={1}>
                {qrData.profileUrl}
              </Text>
              <Ionicons name="copy-outline" size={16} color={PRIMARY[600]} />
            </Pressable>
          </View>
        </Card>

        {/* Instructions */}
        <Card variant="outline" padding="md" style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={24} color={PRIMARY[600]} />
            <Text style={styles.instructionsTitle}>How to Use</Text>
          </View>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Print or save this QR code to your phone
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Keep it accessible in your wallet or phone case
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Emergency responders can scan to access your medical info
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                No app required - works on any smartphone
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            onPress={handleDownload}
            icon={<Ionicons name="download" size={20} color="#fff" />}
            disabled={isDownloading}
            style={styles.actionButton}
          >
            {isDownloading ? 'Downloading...' : 'Download QR Code'}
          </Button>

          <Button
            variant="outline"
            onPress={handleShare}
            icon={<Ionicons name="share-outline" size={20} color={PRIMARY[600]} />}
            style={styles.actionButton}
          >
            Share Profile Link
          </Button>

          <Button
            variant="outline"
            onPress={handlePrint}
            icon={<Ionicons name="print-outline" size={20} color={PRIMARY[600]} />}
            style={styles.actionButton}
          >
            Print QR Code
          </Button>
        </View>

        {/* Security Notice */}
        <Card variant="outline" padding="md" style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.securityTitle}>Secure & Private</Text>
          </View>
          <Text style={styles.securityText}>
            Your QR code is encrypted and only accessible by scanning. Update your
            profile anytime and the QR code will reflect the latest information.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: GRAY[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GRAY[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: GRAY[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: GRAY[900],
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: GRAY[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 200,
  },
  qrCard: {
    marginBottom: 16,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY[600],
    marginLeft: 8,
  },
  qrTitle: {
    fontSize: 16,
    color: GRAY[600],
  },
  qrCodeContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY[200],
    marginBottom: 24,
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  qrInfo: {
    alignItems: 'center',
  },
  emergencyId: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    maxWidth: '100%',
  },
  url: {
    fontSize: 12,
    color: PRIMARY[600],
    marginRight: 8,
    flex: 1,
  },
  instructionsCard: {
    marginBottom: 16,
    backgroundColor: PRIMARY[50],
    borderColor: PRIMARY[200],
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY[900],
    marginLeft: 8,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: GRAY[700],
    lineHeight: 20,
    paddingTop: 2,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
  },
  securityCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
});

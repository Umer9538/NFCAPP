/**
 * NFC Scan Screen
 * Full-screen NFC scanning interface with animated indicators
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { nfcService, NFCTag } from '@/services/nfcService';
import { braceletApi } from '@/api/bracelet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PRIMARY, GRAY } from '@/constants/colors';
import { Button } from '@/components/ui/Button';

type ScanStatus = 'initializing' | 'ready' | 'scanning' | 'processing' | 'success' | 'error';

// Development mode - set to true to enable mock scanning in Expo Go
const DEV_MOCK_MODE = __DEV__;

export function NFCScanScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<ScanStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scannedTag, setScannedTag] = useState<NFCTag | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Link bracelet mutation
  const linkMutation = useMutation({
    mutationFn: (nfcId: string) =>
      braceletApi.linkBracelet({
        nfcId,
        deviceInfo: {
          model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
          os: `${Platform.OS} ${Platform.Version}`,
        },
      }),
    onSuccess: () => {
      setStatus('success');
      queryClient.invalidateQueries({ queryKey: ['bracelet'] });

      // Show success and navigate back after delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    },
    onError: (error: any) => {
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message ||
        'Unable to link bracelet. Please try again.'
      );
    },
  });

  // Start pulsing animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    if (status === 'scanning' || status === 'ready') {
      pulse.start();
      rotate.start();
    } else {
      pulse.stop();
      rotate.stop();
    }

    fadeIn.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [status, pulseAnim, rotateAnim, fadeAnim]);

  // Initialize NFC and start scanning
  useEffect(() => {
    let isActive = true;

    const initializeAndScan = async () => {
      try {
        // Initialize NFC
        const initialized = await nfcService.init();
        if (!isActive) return;

        if (!initialized) {
          setStatus('error');
          setErrorMessage('Your device does not support NFC scanning.');
          return;
        }

        // Check if NFC is available
        const available = await nfcService.isNFCAvailable();
        if (!isActive) return;

        if (!available) {
          setStatus('error');
          setErrorMessage('NFC is turned off. Please enable it in your device settings.');
          return;
        }

        // Request permissions
        const hasPermission = await nfcService.requestPermissions();
        if (!isActive) return;

        if (!hasPermission) {
          setStatus('error');
          setErrorMessage('NFC permission is needed to scan bracelets. Please allow access in settings.');
          return;
        }

        // Ready to scan
        setStatus('ready');

        // Start scanning after a brief delay
        setTimeout(() => {
          if (isActive) {
            startScanning();
          }
        }, 500);
      } catch (error) {
        console.error('NFC initialization error:', error);
        if (isActive) {
          setStatus('error');
          setErrorMessage('Unable to start NFC scanner. Please try again.');
        }
      }
    };

    initializeAndScan();

    return () => {
      isActive = false;
      nfcService.stopScanning();
    };
  }, []);

  const startScanning = async () => {
    setStatus('scanning');
    setErrorMessage('');

    try {
      await nfcService.startScanning(
        (tag: NFCTag) => {
          console.log('NFC Tag discovered:', tag);
          setScannedTag(tag);
          setStatus('processing');

          // Auto-link the bracelet
          if (tag.id) {
            linkMutation.mutate(tag.id);
          } else {
            setStatus('error');
            setErrorMessage('This NFC tag is not valid. Please try a different tag.');
          }
        },
        (error: Error) => {
          console.error('NFC scanning error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Unable to scan NFC tag. Please try again.');
        }
      );
    } catch (error) {
      console.error('Start scanning error:', error);
      setStatus('error');
      setErrorMessage('Unable to start NFC scanning. Please try again.');
    }
  };

  const handleCancel = () => {
    nfcService.stopScanning();
    navigation.goBack();
  };

  const handleRetry = () => {
    setStatus('initializing');
    setErrorMessage('');
    setScannedTag(null);

    // Re-initialize and scan
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  const handleMockScan = () => {
    // Simulate NFC scan in development mode
    console.log('Manual mock NFC scan triggered');
    const mockTag: NFCTag = {
      id: 'NFC-MG-2024-' + Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
      type: 'NFC Forum Type 2',
      data: 'MedGuard Emergency Profile',
    };

    setScannedTag(mockTag);
    setStatus('processing');

    // Auto-link the bracelet
    if (mockTag.id) {
      linkMutation.mutate(mockTag.id);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10b981'; // green
      case 'error':
        return PRIMARY[600];
      case 'scanning':
      case 'ready':
        return PRIMARY[500];
      default:
        return GRAY[400];
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'processing':
        return 'sync';
      default:
        return 'scan';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'initializing':
        return 'Initializing NFC...';
      case 'ready':
        return 'Ready to Scan';
      case 'scanning':
        return 'Scanning...';
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Bracelet Linked Successfully!';
      case 'error':
        return 'Scan Failed';
      default:
        return 'Initializing...';
    }
  };

  const getInstructionText = () => {
    switch (status) {
      case 'ready':
      case 'scanning':
        return 'Hold your phone near the NFC bracelet';
      case 'processing':
        return 'Linking your bracelet to your profile...';
      case 'success':
        return 'Your bracelet is now connected to your emergency profile!';
      case 'error':
        if (DEV_MOCK_MODE && errorMessage.includes('production build')) {
          return 'Running in Expo Go. Click "Simulate Scan" below to test the flow.';
        }
        return errorMessage;
      default:
        return 'Please wait...';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={GRAY[700]} />
        </Pressable>
        <Text style={styles.headerTitle}>NFC Scanner</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated Scan Indicator */}
        <View style={styles.scanIndicatorContainer}>
          {/* Outer pulsing rings */}
          {status === 'scanning' || status === 'ready' ? (
            <>
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRing1,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: getStatusColor(),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRing2,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: getStatusColor(),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRing3,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: getStatusColor(),
                  },
                ]}
              />
            </>
          ) : null}

          {/* Center icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: getStatusColor() },
              status === 'processing'
                ? { transform: [{ rotate: spin }] }
                : {},
            ]}
          >
            <Ionicons
              name={getStatusIcon()}
              size={80}
              color="#fff"
            />
          </Animated.View>
        </View>

        {/* Status Text */}
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Text style={styles.instructionText}>{getInstructionText()}</Text>

          {scannedTag && status === 'processing' && (
            <View style={styles.tagInfo}>
              <Text style={styles.tagInfoLabel}>Tag ID:</Text>
              <Text style={styles.tagInfoValue}>{scannedTag.id}</Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        {(status === 'ready' || status === 'scanning') && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for scanning:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={PRIMARY[600]} />
              <Text style={styles.tipText}>Remove phone case if needed</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={PRIMARY[600]} />
              <Text style={styles.tipText}>Hold steady for 2-3 seconds</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={PRIMARY[600]} />
              <Text style={styles.tipText}>Try different positions on your phone</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {status === 'error' && DEV_MOCK_MODE && errorMessage.includes('production build') && (
            <>
              <Button
                onPress={handleMockScan}
                icon={<Ionicons name="flask" size={20} color="#fff" />}
                style={styles.actionButton}
              >
                Simulate Scan (Dev Mode)
              </Button>
              <Text style={styles.devModeNote}>
                Development mode: Click to simulate NFC scan
              </Text>
            </>
          )}

          {status === 'error' && !(DEV_MOCK_MODE && errorMessage.includes('production build')) && (
            <Button
              onPress={handleRetry}
              icon={<Ionicons name="refresh" size={20} color="#fff" />}
              style={styles.actionButton}
            >
              Try Again
            </Button>
          )}

          {status !== 'success' && status !== 'processing' && (
            <Button
              variant="outline"
              onPress={handleCancel}
              style={styles.actionButton}
            >
              Cancel
            </Button>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY[200],
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GRAY[900],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanIndicatorContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 2,
  },
  pulseRing1: {
    width: 200,
    height: 200,
    opacity: 0.6,
  },
  pulseRing2: {
    width: 240,
    height: 240,
    opacity: 0.4,
  },
  pulseRing3: {
    width: 280,
    height: 280,
    opacity: 0.2,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    color: GRAY[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: GRAY[600],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  tagInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: GRAY[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  tagInfoLabel: {
    fontSize: 12,
    color: GRAY[500],
    marginBottom: 4,
  },
  tagInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tipsContainer: {
    backgroundColor: PRIMARY[50],
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[900],
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: PRIMARY[700],
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  devModeNote: {
    fontSize: 12,
    color: GRAY[500],
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

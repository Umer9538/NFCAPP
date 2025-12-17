/**
 * NFC Write Screen
 * Write emergency profile URL to NFC tag with step-by-step instructions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { nfcService, NFCData } from '@/services/nfcService';
import { PRIMARY, GRAY, STATUS } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/theme/theme';

type WriteStep = 'prepare' | 'writing' | 'success' | 'error';

export default function NFCWriteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;

  const [step, setStep] = useState<WriteStep>('prepare');
  const [errorMessage, setErrorMessage] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [makeReadOnly, setMakeReadOnly] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // NFC data from route params
  const nfcData: NFCData = params?.nfcData || {
    nfcId: params?.nfcId || `NFC-MG-${Date.now()}`,
    userId: params?.userId || 'user_1',
    profileUrl: params?.profileUrl || 'https://medguard.app/emergency/profile',
    timestamp: new Date().toISOString(),
  };

  // Start animations
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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

    if (step === 'writing') {
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
  }, [step]);

  const handleStartWriting = async () => {
    setStep('writing');
    setIsWriting(true);
    setErrorMessage('');

    try {
      // Check NFC support
      const supported = await nfcService.isSupported();
      if (!supported) {
        throw new Error('NFC is not supported on this device');
      }

      // Check NFC enabled
      const enabled = await nfcService.isEnabled();
      if (!enabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => nfcService.openNFCSettings(),
            },
          ]
        );
        setStep('prepare');
        return;
      }

      // Write to tag
      await nfcService.writeTag(nfcData, {
        makeReadOnly,
        timeout: 30000,
      });

      setStep('success');
    } catch (error: any) {
      console.error('Write error:', error);
      setErrorMessage(error.message || 'Failed to write to NFC tag');
      setStep('error');
    } finally {
      setIsWriting(false);
    }
  };

  const handleRetry = () => {
    setStep('prepare');
    setErrorMessage('');
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderContent = () => {
    switch (step) {
      case 'prepare':
        return renderPrepareStep();
      case 'writing':
        return renderWritingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
    }
  };

  const renderPrepareStep = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: PRIMARY[50] }]}>
          <Ionicons name="create" size={64} color={PRIMARY[600]} />
        </View>
      </View>

      <Text style={styles.title}>Write to NFC Tag</Text>
      <Text style={styles.description}>
        Follow these steps to write your emergency profile to an NFC tag
      </Text>

      {/* Steps */}
      <Card variant="outline" padding="md" style={styles.stepsCard}>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Prepare your NFC tag</Text>
            <Text style={styles.stepDescription}>
              Have an empty NFC tag ready. Make sure it's not locked or read-only.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tap "Start Writing" below</Text>
            <Text style={styles.stepDescription}>
              This will prepare your phone to write to the NFC tag.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Hold phone near tag</Text>
            <Text style={styles.stepDescription}>
              Place the back of your phone against the NFC tag and hold steady for a few seconds.
            </Text>
          </View>
        </View>
      </Card>

      {/* What will be written */}
      <Card variant="elevated" padding="md" style={styles.dataCard}>
        <Text style={styles.dataTitle}>What will be written:</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Profile URL:</Text>
          <Text style={styles.dataValue} numberOfLines={2}>
            {nfcData.profileUrl}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>NFC ID:</Text>
          <Text style={styles.dataValue}>{nfcData.nfcId}</Text>
        </View>
      </Card>

      {/* Make Read-Only Option */}
      <Pressable
        style={styles.readOnlyOption}
        onPress={() => setMakeReadOnly(!makeReadOnly)}
      >
        <View style={styles.checkbox}>
          {makeReadOnly && (
            <Ionicons name="checkmark" size={20} color={PRIMARY[600]} />
          )}
        </View>
        <View style={styles.readOnlyText}>
          <Text style={styles.readOnlyTitle}>Make tag read-only (permanent)</Text>
          <Text style={styles.readOnlyDescription}>
            ⚠️ This cannot be undone. The tag will be permanently locked.
          </Text>
        </View>
      </Pressable>

      {/* Platform-specific tips */}
      <Card variant="outline" padding="md" style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="information-circle-outline" size={20} color={PRIMARY[600]} />
          <Text style={styles.tipsTitle}>
            {Platform.OS === 'ios' ? 'iOS Tips' : 'Android Tips'}
          </Text>
        </View>
        {Platform.OS === 'ios' ? (
          <>
            <Text style={styles.tipText}>• Hold phone steady near tag center</Text>
            <Text style={styles.tipText}>• Remove phone case if needed</Text>
            <Text style={styles.tipText}>• Look for haptic feedback when writing</Text>
          </>
        ) : (
          <>
            <Text style={styles.tipText}>• NFC antenna is usually near top of phone</Text>
            <Text style={styles.tipText}>• Try different positions if not working</Text>
            <Text style={styles.tipText}>• Keep phone and tag steady</Text>
          </>
        )}
      </Card>

      {/* Start Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleStartWriting}
        icon={<Ionicons name="create-outline" size={20} color="#fff" />}
        style={styles.actionButton}
      >
        Start Writing
      </Button>

      <Button variant="ghost" fullWidth onPress={handleDone} style={styles.cancelButton}>
        Cancel
      </Button>
    </ScrollView>
  );

  const renderWritingStep = () => (
    <View style={styles.centerContent}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Pulsing rings */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRing1,
              {
                transform: [{ scale: pulseAnim }],
                borderColor: PRIMARY[400],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRing2,
              {
                transform: [{ scale: pulseAnim }],
                borderColor: PRIMARY[300],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRing3,
              {
                transform: [{ scale: pulseAnim }],
                borderColor: PRIMARY[200],
              },
            ]}
          />

          {/* Center icon */}
          <Animated.View
            style={[
              styles.centerIcon,
              { backgroundColor: PRIMARY[600], transform: [{ rotate: spin }] },
            ]}
          >
            <Ionicons name="sync" size={64} color="#fff" />
          </Animated.View>
        </View>

        <Text style={styles.writingTitle}>Writing to Tag...</Text>
        <Text style={styles.writingDescription}>
          Hold your phone steady near the NFC tag
        </Text>

        <View style={styles.writingTips}>
          <Text style={styles.writingTip}>📱 Keep devices close together</Text>
          <Text style={styles.writingTip}>⏱️ This may take a few seconds</Text>
          <Text style={styles.writingTip}>🚫 Don't move until complete</Text>
        </View>
      </Animated.View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.centerContent}>
      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <View style={[styles.resultIcon, { backgroundColor: STATUS.success.light }]}>
          <Ionicons name="checkmark-circle" size={80} color={STATUS.success.main} />
        </View>

        <Text style={styles.resultTitle}>Successfully Written!</Text>
        <Text style={styles.resultDescription}>
          Your emergency profile has been written to the NFC tag
        </Text>

        <Card variant="elevated" padding="md" style={styles.successCard}>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={20} color={STATUS.success.main} />
            <Text style={styles.successText}>Profile URL written</Text>
          </View>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={20} color={STATUS.success.main} />
            <Text style={styles.successText}>NFC ID stored</Text>
          </View>
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={20} color={STATUS.success.main} />
            <Text style={styles.successText}>Metadata saved</Text>
          </View>
          {makeReadOnly && (
            <View style={styles.successRow}>
              <Ionicons name="lock-closed" size={20} color={STATUS.warning.main} />
              <Text style={styles.successText}>Tag locked (read-only)</Text>
            </View>
          )}
        </Card>

        <Text style={styles.nextStepsTitle}>Next Steps:</Text>
        <Text style={styles.nextStepsText}>
          • Test the tag by scanning it with your phone
          {'\n'}• Attach the tag to your bracelet, keychain, or wallet
          {'\n'}• Keep it with you at all times
        </Text>

        <Button
          variant="primary"
          fullWidth
          onPress={handleDone}
          style={styles.actionButton}
        >
          Done
        </Button>
      </Animated.View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.centerContent}>
      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <View style={[styles.resultIcon, { backgroundColor: STATUS.error.light }]}>
          <Ionicons name="close-circle" size={80} color={STATUS.error.main} />
        </View>

        <Text style={styles.resultTitle}>Write Failed</Text>
        <Text style={styles.resultDescription}>{errorMessage}</Text>

        <Card variant="outline" padding="md" style={styles.errorCard}>
          <Text style={styles.errorCardTitle}>Common Issues:</Text>
          <Text style={styles.errorCardText}>• Tag may be too far from phone</Text>
          <Text style={styles.errorCardText}>• Tag may be read-only or locked</Text>
          <Text style={styles.errorCardText}>• Tag may not be compatible</Text>
          <Text style={styles.errorCardText}>• Phone NFC may be disabled</Text>
        </Card>

        <Button
          variant="primary"
          fullWidth
          onPress={handleRetry}
          icon={<Ionicons name="refresh" size={20} color="#fff" />}
          style={styles.actionButton}
        >
          Try Again
        </Button>

        <Button variant="ghost" fullWidth onPress={handleDone} style={styles.cancelButton}>
          Cancel
        </Button>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleDone} style={styles.backButton}>
          <Ionicons name="close" size={28} color={GRAY[700]} />
        </Pressable>
        <Text style={styles.headerTitle}>Write NFC Tag</Text>
        <View style={{ width: 28 }} />
      </View>

      {renderContent()}
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
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GRAY[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    fontSize: 16,
    color: GRAY[600],
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  stepsCard: {
    marginBottom: spacing[4],
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: spacing[1],
  },
  stepDescription: {
    fontSize: 14,
    color: GRAY[600],
    lineHeight: 20,
  },
  dataCard: {
    marginBottom: spacing[4],
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[700],
    marginBottom: spacing[2],
  },
  dataRow: {
    marginBottom: spacing[2],
  },
  dataLabel: {
    fontSize: 12,
    color: GRAY[500],
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 14,
    color: GRAY[900],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  readOnlyOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: STATUS.warning.light,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PRIMARY[600],
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  readOnlyText: {
    flex: 1,
  },
  readOnlyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: 4,
  },
  readOnlyDescription: {
    fontSize: 12,
    color: STATUS.warning.text,
  },
  tipsCard: {
    marginBottom: spacing[6],
    backgroundColor: PRIMARY[50],
    borderColor: PRIMARY[200],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[700],
    marginLeft: spacing[2],
  },
  tipText: {
    fontSize: 13,
    color: PRIMARY[700],
    marginBottom: 4,
  },
  actionButton: {
    marginBottom: spacing[3],
  },
  cancelButton: {
    marginTop: spacing[2],
  },
  animationContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
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
  centerIcon: {
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
  writingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: GRAY[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  writingDescription: {
    fontSize: 16,
    color: GRAY[600],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  writingTips: {
    alignItems: 'center',
  },
  writingTip: {
    fontSize: 14,
    color: GRAY[700],
    marginBottom: spacing[2],
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: GRAY[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  resultDescription: {
    fontSize: 16,
    color: GRAY[600],
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  successCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  successText: {
    fontSize: 14,
    color: GRAY[700],
    marginLeft: spacing[2],
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: spacing[2],
    alignSelf: 'flex-start',
  },
  nextStepsText: {
    fontSize: 14,
    color: GRAY[600],
    lineHeight: 22,
    marginBottom: spacing[6],
    alignSelf: 'flex-start',
  },
  errorCard: {
    width: '100%',
    marginBottom: spacing[6],
    backgroundColor: STATUS.error.light,
    borderColor: STATUS.error.main,
  },
  errorCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: STATUS.error.text,
    marginBottom: spacing[2],
  },
  errorCardText: {
    fontSize: 13,
    color: STATUS.error.text,
    marginBottom: 4,
  },
});

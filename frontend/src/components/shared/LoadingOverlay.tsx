/**
 * Loading Overlay Component
 * Full-screen loading spinner with backdrop
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  visible,
  message = 'Loading...',
  transparent = false,
}: LoadingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, transparent && styles.overlayTransparent]}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={PRIMARY[600]} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTransparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: SEMANTIC.background.elevated,
    borderRadius: 16,
    padding: spacing[6],
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: spacing[3],
    fontSize: 16,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
});

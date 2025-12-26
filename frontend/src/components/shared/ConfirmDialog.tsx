/**
 * Confirm Dialog Component
 * Modal dialog for confirming destructive actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { SEMANTIC, STATUS, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: destructive ? STATUS.error + '20' : PRIMARY[50] },
            ]}
          >
            <Ionicons
              name={destructive ? 'alert-circle' : 'help-circle'}
              size={40}
              color={destructive ? STATUS.error : PRIMARY[600]}
            />
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={styles.button}
            />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              style={[
                styles.button,
                destructive && { backgroundColor: STATUS.error },
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  dialog: {
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 16,
    padding: spacing[6],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

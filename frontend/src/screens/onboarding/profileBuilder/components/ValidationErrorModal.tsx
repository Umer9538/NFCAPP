import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  visible: boolean;
  errors: string[];
  onDismiss: () => void;
}

/**
 * Centered "Please fix the following before continuing" modal that lists the
 * step's validation issues. Replaces the OS Alert.alert so the styling matches
 * the web's modal exactly.
 */
export function ValidationErrorModal({ visible, errors, onDismiss }: Props) {
  const issueCount = errors.length;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="warning" size={20} color="#dc2626" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Please fix the following before continuing</Text>
              <Text style={styles.subtitle}>
                {issueCount} {issueCount === 1 ? 'issue' : 'issues'} found on this step.
              </Text>
            </View>
          </View>

          <View style={styles.list}>
            {errors.map((err, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{err}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.gotItBtn,
                pressed && styles.gotItBtnPressed,
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.gotItText}>Got it</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    gap: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    lineHeight: typography.lineHeight.snug * typography.fontSize.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
  },
  list: {
    gap: spacing[2],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  footer: {
    alignItems: 'flex-end',
  },
  gotItBtn: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[600],
  },
  gotItBtnPressed: {
    backgroundColor: PRIMARY[800],
  },
  gotItText: {
    color: '#ffffff',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

// Silence the import-unused warning for GRAY (kept for future).
void GRAY;

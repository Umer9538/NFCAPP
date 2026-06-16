import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  value: boolean; // true = visible to responders, false = private
  onChange: (next: boolean) => void;
  /** e.g. "Allergy Information Visibility" — matches the web copy. */
  title?: string;
  /** Sentence shown beneath the title when value === true. */
  publicDescription?: string;
  /** Sentence shown beneath the title when value === false. */
  privateDescription?: string;
}

const GREEN_500 = '#22c55e';
const GREEN_600 = '#16a34a';

/**
 * Switch-style section-visibility toggle matching the web's `VisibilityToggle`
 * component (eye icon + label/description + rounded toggle switch + Public /
 * Private text). Container has a gray-50 background.
 */
export function VisibilityToggle({
  value,
  onChange,
  title,
  publicDescription = 'Visible to first responders when they scan your bracelet',
  privateDescription = 'Hidden from emergency view - only you can see this',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons
          name={value ? 'eye' : 'eye-off'}
          size={20}
          color={value ? GREEN_600 : GRAY[400]}
        />
        <View style={styles.textBlock}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.description}>
            {value ? publicDescription : privateDescription}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          onPress={() => onChange(!value)}
          style={[styles.switchTrack, value ? styles.switchTrackOn : styles.switchTrackOff]}
        >
          <View
            style={[
              styles.switchThumb,
              value ? styles.switchThumbOn : styles.switchThumbOff,
            ]}
          />
        </Pressable>
        <Text style={[styles.stateLabel, value ? styles.stateLabelOn : styles.stateLabelOff]}>
          {value ? 'Public' : 'Private'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: GRAY[50],
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minWidth: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  switchTrack: {
    width: 36,
    height: 20,
    borderRadius: borderRadius.full,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: GREEN_500,
    alignItems: 'flex-end',
  },
  switchTrackOff: {
    backgroundColor: GRAY[300],
    alignItems: 'flex-start',
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbOn: {},
  switchThumbOff: {},
  stateLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    minWidth: 50,
    textAlign: 'center',
  },
  stateLabelOn: {
    color: GREEN_600,
  },
  stateLabelOff: {
    color: GRAY[500],
  },
});

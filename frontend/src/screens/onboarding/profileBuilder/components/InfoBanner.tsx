import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, STATUS, MEDICAL_COLORS, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

type Tone = 'info' | 'warning' | 'danger' | 'success' | 'note';

interface Props {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Colored callout banner. Matches the web app's blue/red/yellow/green info
 * cards used throughout the wizard (e.g. "At least one emergency contact is
 * required", "HIGH RISK PREGNANCY", "Almost Done!").
 */
export function InfoBanner({ tone = 'info', title, children, icon }: Props) {
  const palette = paletteFor(tone);
  const iconName = icon ?? defaultIconFor(tone);
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Ionicons name={iconName} size={20} color={palette.fg} style={styles.icon} />
      <View style={styles.body}>
        {title && <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>}
        {typeof children === 'string' ? (
          <Text style={[styles.text, { color: palette.text }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

function paletteFor(tone: Tone) {
  switch (tone) {
    case 'warning':
      return {
        bg: STATUS.warning.light,
        border: STATUS.warning.main,
        fg: STATUS.warning.text,
        text: STATUS.warning.text,
      };
    case 'danger':
      return {
        bg: STATUS.error.light,
        border: STATUS.error.main,
        fg: STATUS.error.text,
        text: STATUS.error.text,
      };
    case 'success':
      return {
        bg: MEDICAL_COLORS.green.light,
        border: MEDICAL_COLORS.green.main,
        fg: MEDICAL_COLORS.green.text,
        text: MEDICAL_COLORS.green.text,
      };
    case 'note':
      return {
        bg: GRAY[50],
        border: GRAY[300],
        fg: SEMANTIC.text.primary,
        text: SEMANTIC.text.secondary,
      };
    case 'info':
    default:
      return {
        bg: MEDICAL_COLORS.blue.light,
        border: MEDICAL_COLORS.blue.main,
        fg: MEDICAL_COLORS.blue.text,
        text: MEDICAL_COLORS.blue.text,
      };
  }
}

function defaultIconFor(tone: Tone): keyof typeof Ionicons.glyphMap {
  if (tone === 'danger') return 'warning';
  if (tone === 'warning') return 'alert-circle';
  if (tone === 'success') return 'checkmark-circle';
  if (tone === 'note') return 'information-circle-outline';
  return 'information-circle';
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  icon: {
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  text: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});

// Silence unused-import warning when only one style consumer is active.
void PRIMARY;

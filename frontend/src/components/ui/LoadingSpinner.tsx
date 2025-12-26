/**
 * LoadingSpinner Component
 * Full-screen overlay or inline spinner with variants
 * Matches web app loading states
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  Modal,
} from 'react-native';
import { PRIMARY, SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, borderRadius, typography, shadows } from '@/theme/theme';

export type SpinnerVariant = 'primary' | 'secondary' | 'white';
export type SpinnerSize = 'small' | 'medium' | 'large';

export interface LoadingSpinnerProps {
  visible?: boolean;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  visible = true,
  size = 'medium',
  variant = 'primary',
  text,
  overlay = false,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  if (!visible) return null;

  const spinnerSize = getSizeValue(size);
  const spinnerColor = getColorValue(variant);

  const spinnerContent = (
    <View style={[styles.container, !fullScreen && !overlay && style]}>
      <View
        style={[
          styles.spinnerWrapper,
          overlay && styles.spinnerWrapperOverlay,
        ]}
      >
        <ActivityIndicator size={spinnerSize} color={spinnerColor} />
        {text && <Text style={[styles.text, getTextStyle(variant)]}>{text}</Text>}
      </View>
    </View>
  );

  if (fullScreen || overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.fullScreenOverlay}>
          {spinnerContent}
        </View>
      </Modal>
    );
  }

  return spinnerContent;
}

/**
 * Inline Spinner (smaller, for use within components)
 */
interface InlineSpinnerProps {
  size?: 'small' | 'medium';
  color?: string;
  style?: ViewStyle;
}

export function InlineSpinner({
  size = 'small',
  color = PRIMARY[600],
  style,
}: InlineSpinnerProps) {
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={color}
      />
    </View>
  );
}

/**
 * Button Spinner (for use inside buttons)
 */
interface ButtonSpinnerProps {
  color?: string;
}

export function ButtonSpinner({ color = '#ffffff' }: ButtonSpinnerProps) {
  return <ActivityIndicator size="small" color={color} />;
}

/**
 * Card Spinner (centered in a card)
 */
interface CardSpinnerProps {
  text?: string;
  minHeight?: number;
}

export function CardSpinner({ text, minHeight = 150 }: CardSpinnerProps) {
  return (
    <View style={[styles.cardSpinner, { minHeight }]}>
      <ActivityIndicator size="large" color={PRIMARY[600]} />
      {text && <Text style={styles.cardSpinnerText}>{text}</Text>}
    </View>
  );
}

/**
 * Page Spinner (full page loading)
 */
interface PageSpinnerProps {
  text?: string;
}

export function PageSpinner({ text = 'Loading...' }: PageSpinnerProps) {
  return (
    <View style={styles.pageSpinner}>
      <ActivityIndicator size="large" color={PRIMARY[600]} />
      <Text style={styles.pageSpinnerText}>{text}</Text>
    </View>
  );
}

/**
 * Helper functions
 */
function getSizeValue(size: SpinnerSize): 'small' | 'large' {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
    case 'large':
      return 'large';
    default:
      return 'large';
  }
}

function getColorValue(variant: SpinnerVariant): string {
  switch (variant) {
    case 'primary':
      return PRIMARY[600];
    case 'secondary':
      return GRAY[600];
    case 'white':
      return '#ffffff';
    default:
      return PRIMARY[600];
  }
}

function getTextStyle(variant: SpinnerVariant) {
  return {
    color: variant === 'white' ? '#ffffff' : SEMANTIC.text.primary,
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  spinnerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWrapperOverlay: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    minWidth: 120,
    ...shadows.xl,
  },
  text: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },

  // Full Screen Overlay
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: SEMANTIC.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inline Spinner
  inlineContainer: {
    padding: spacing[2],
  },

  // Card Spinner
  cardSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  cardSpinnerText: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },

  // Page Spinner
  pageSpinner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.background.default,
    padding: spacing[6],
  },
  pageSpinnerText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.lg,
    color: SEMANTIC.text.primary,
    textAlign: 'center',
  },
});

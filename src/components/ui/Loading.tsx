/**
 * Loading Component
 * Centered loading spinner with optional text
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function Loading({
  size = 'large',
  color = PRIMARY[600],
  text,
  fullScreen = false,
  style,
}: LoadingProps) {
  return (
    <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.background.default,
  },
  text: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
  },
});

/**
 * Divider Component
 * Horizontal or vertical line separator
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color = SEMANTIC.border.default,
  spacing: spacingProp = 'md',
  style,
}: DividerProps) {
  const spacingStyle = getSpacingStyle(orientation, spacingProp);

  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        {
          [orientation === 'horizontal' ? 'height' : 'width']: thickness,
          backgroundColor: color,
        },
        spacingStyle,
        style,
      ]}
    />
  );
}

function getSpacingStyle(
  orientation: 'horizontal' | 'vertical',
  spacingValue: 'none' | 'sm' | 'md' | 'lg'
): ViewStyle {
  const spacingMap = {
    none: 0,
    sm: spacing[2],
    md: spacing[4],
    lg: spacing[6],
  };

  const space = spacingMap[spacingValue];

  if (orientation === 'horizontal') {
    return {
      marginVertical: space,
    };
  } else {
    return {
      marginHorizontal: space,
    };
  }
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});

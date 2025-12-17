/**
 * Avatar Component
 * User avatar with initials or image
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { typography } from '@/theme/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  size?: AvatarSize;
  initials?: string;
  imageUri?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  size = 'md',
  initials,
  imageUri,
  backgroundColor = PRIMARY[100],
  textColor = PRIMARY[700],
  style,
}: AvatarProps) {
  const sizeStyle = getSizeStyle(size);
  const textSizeStyle = getTextSizeStyle(size);

  return (
    <View
      style={[
        styles.avatar,
        sizeStyle,
        { backgroundColor },
        imageUri && styles.withImage,
        style,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.image, sizeStyle]} />
      ) : (
        <Text style={[styles.text, textSizeStyle, { color: textColor }]}>
          {initials || '?'}
        </Text>
      )}
    </View>
  );
}

function getSizeStyle(size: AvatarSize): ViewStyle {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  };

  const dimension = sizes[size];

  return {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };
}

function getTextSizeStyle(size: AvatarSize) {
  const fontSizes = {
    xs: typography.fontSize.xs,
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.lg,
    xl: typography.fontSize.xl,
    '2xl': typography.fontSize['2xl'],
  };

  return {
    fontSize: fontSizes[size],
  };
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  withImage: {
    backgroundColor: SEMANTIC.background.tertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
});

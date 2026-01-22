/**
 * BackButton Component
 * Consistent back button design for use across the app
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export function BackButton({
  onPress,
  color = SEMANTIC.text.primary,
  size = 24,
  style,
}: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ArrowLeft size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    backgroundColor: GRAY[100],
  },
});

export default BackButton;

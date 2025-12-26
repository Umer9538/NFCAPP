/**
 * Header Component
 * Reusable header for screens with back button and actions
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  actions?: HeaderAction[];
}

export function Header({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  actions,
}: HeaderProps) {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={SEMANTIC.text.primary} />
          </Pressable>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              disabled={action.disabled}
              style={[styles.actionButton, action.disabled && styles.actionButtonDisabled]}
            >
              <Ionicons
                name={action.icon}
                size={24}
                color={action.color || PRIMARY[600]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: SEMANTIC.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: spacing[2],
    marginRight: spacing[2],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  actionButton: {
    padding: spacing[2],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

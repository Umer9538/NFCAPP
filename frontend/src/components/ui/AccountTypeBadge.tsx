/**
 * Account Type Badge Component
 * Shows the current account type with icon and dynamic theme color
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  User,
  Building2,
  HardHat,
  GraduationCap,
  Heart,
  LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { AccountType } from '@/theme/colors';

// Size variants
type BadgeSize = 'sm' | 'md' | 'lg';

// Badge variant
type BadgeVariant = 'filled' | 'outlined' | 'subtle';

interface AccountTypeBadgeProps {
  // Override account type (if not provided, uses current user's account type from theme)
  accountType?: AccountType;
  // Size variant
  size?: BadgeSize;
  // Visual variant
  variant?: BadgeVariant;
  // Show icon
  showIcon?: boolean;
  // Show label text
  showLabel?: boolean;
  // Custom style
  style?: ViewStyle;
  // Custom text style
  textStyle?: TextStyle;
}

// Icon mapping for account types
const accountIcons: Record<AccountType, LucideIcon> = {
  individual: User,
  corporate: Building2,
  construction: HardHat,
  education: GraduationCap,
  family: Heart,
};

// Labels for account types
const accountLabels: Record<AccountType, string> = {
  individual: 'Individual',
  corporate: 'Corporate',
  construction: 'Construction',
  education: 'Education',
  family: 'Family',
};

// Size configurations
const sizeConfig: Record<BadgeSize, {
  paddingHorizontal: number;
  paddingVertical: number;
  fontSize: number;
  iconSize: number;
  gap: number;
  borderRadius: number;
}> = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    iconSize: 12,
    gap: 4,
    borderRadius: 4,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    iconSize: 16,
    gap: 6,
    borderRadius: 6,
  },
  lg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    iconSize: 20,
    gap: 8,
    borderRadius: 8,
  },
};

export function AccountTypeBadge({
  accountType: propAccountType,
  size = 'md',
  variant = 'subtle',
  showIcon = true,
  showLabel = true,
  style,
  textStyle,
}: AccountTypeBadgeProps) {
  const theme = useTheme();

  // Use prop account type or fall back to theme's account type
  const accountType = propAccountType || theme.accountType;

  const Icon = accountIcons[accountType];
  const label = accountLabels[accountType];
  const config = sizeConfig[size];

  // Get colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.primary[500],
          textColor: theme.white,
          borderColor: theme.primary[500],
        };
      case 'outlined':
        return {
          backgroundColor: theme.transparent,
          textColor: theme.primary[600],
          borderColor: theme.primary[500],
        };
      case 'subtle':
      default:
        return {
          backgroundColor: theme.primary[100],
          textColor: theme.primary[700],
          borderColor: theme.primary[200],
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: variant === 'outlined' ? 1.5 : 0,
          paddingHorizontal: config.paddingHorizontal,
          paddingVertical: config.paddingVertical,
          borderRadius: config.borderRadius,
          gap: config.gap,
        },
        style,
      ]}
    >
      {showIcon && (
        <Icon
          size={config.iconSize}
          color={colors.textColor}
          strokeWidth={2}
        />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textColor,
              fontSize: config.fontSize,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

// Simple icon-only variant
export function AccountTypeIcon({
  accountType: propAccountType,
  size = 24,
  color,
  style,
}: {
  accountType?: AccountType;
  size?: number;
  color?: string;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const accountType = propAccountType || theme.accountType;
  const Icon = accountIcons[accountType];

  return (
    <View style={style}>
      <Icon
        size={size}
        color={color || theme.primary[500]}
        strokeWidth={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
});

export default AccountTypeBadge;

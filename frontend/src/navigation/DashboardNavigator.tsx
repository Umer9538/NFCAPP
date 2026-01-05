/**
 * Dashboard Navigator
 * Bottom tab navigator for main app screens
 * Uses dynamic theme colors based on account type
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DashboardTabParamList } from './types';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { defaultTheme } from '@/theme/colors';

// Import dashboard screens
import HomeScreen from '@/screens/dashboard/HomeScreen';
import ProfileScreen from '@/screens/dashboard/ProfileScreen';
import BraceletScreen from '@/screens/dashboard/BraceletScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import { LocationSharingScreen } from '@/screens/location';

const Tab = createBottomTabNavigator<DashboardTabParamList>();

export default function DashboardNavigator() {
  // Get dynamic theme colors based on account type
  const theme = useTheme();
  const primaryColor = theme.primary[600];
  const primaryLight = theme.primary[50];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Tab bar icon
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Bracelet':
              iconName = focused ? 'watch' : 'watch-outline';
              break;
            case 'Location':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        // Tab bar styling with dynamic colors
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: GRAY[500],
        tabBarStyle: {
          backgroundColor: theme.semantic.surface.default,
          borderTopWidth: 1,
          borderTopColor: theme.semantic.border.light,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          marginTop: 4,
        },

        // Header styling with dynamic colors
        headerStyle: {
          backgroundColor: theme.semantic.background.default,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.semantic.border.light,
        },
        headerTintColor: primaryColor,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize.xl,
          color: theme.semantic.text.primary,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          // Optional badge for notifications
          tabBarBadge: undefined, // Set to number for notifications
          tabBarBadgeStyle: {
            backgroundColor: primaryColor,
            color: '#ffffff',
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Emergency Profile',
          tabBarLabel: 'Profile',
        }}
      />

      <Tab.Screen
        name="Bracelet"
        component={BraceletScreen}
        options={{
          title: 'NFC Bracelet',
          tabBarLabel: 'Bracelet',
        }}
      />

      <Tab.Screen
        name="Location"
        component={LocationSharingScreen}
        options={{
          title: 'Location Sharing',
          tabBarLabel: 'Location',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Custom Tab Bar Button Component (optional enhancement)
 */
interface CustomTabBarButtonProps {
  focused: boolean;
  label: string;
  icon: string;
  onPress: () => void;
  badge?: number;
}

export function CustomTabBarButton({
  focused,
  label,
  icon,
  onPress,
  badge,
}: CustomTabBarButtonProps) {
  return (
    <View style={styles.tabButton}>
      <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
        <Ionicons
          name={icon as any}
          size={24}
          color={focused ? defaultTheme.primary[600] : GRAY[500]}
        />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconContainerActive: {
    backgroundColor: defaultTheme.primary[50],
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: GRAY[500],
    marginTop: 4,
  },
  labelActive: {
    color: defaultTheme.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: defaultTheme.primary[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: SEMANTIC.surface.default,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
});

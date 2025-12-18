/**
 * Organization Navigator
 * Bottom tab navigator for organization users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Home,
  Users,
  FileHeart,
  Settings,
  HardHat,
  GraduationCap,
} from 'lucide-react-native';

import type { OrganizationTabParamList } from './types';
import { PRIMARY, SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig } from '@/config/dashboardConfig';

// Import screens
import HomeScreen from '@/screens/dashboard/HomeScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import { EmployeesScreen, OrganizationMedicalInfoScreen } from '@/screens/organization';

const Tab = createBottomTabNavigator<OrganizationTabParamList>();

export default function OrganizationNavigator() {
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const dashboardConfig = getDashboardConfig(accountType);

  // Get terminology for tab labels
  const employeesLabel = dashboardConfig.terminology.users;

  // Get icon for employees based on account type
  const getEmployeesIcon = (focused: boolean, color: string, size: number) => {
    switch (accountType) {
      case 'construction':
        return <HardHat size={size} color={color} />;
      case 'education':
        return <GraduationCap size={size} color={color} />;
      default:
        return <Users size={size} color={color} />;
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Home size={size} color={color} />;
            case 'Employees':
              return getEmployeesIcon(focused, color, size);
            case 'MedicalInfo':
              return <FileHeart size={size} color={color} />;
            case 'Settings':
              return <Settings size={size} color={color} />;
            default:
              return <Ionicons name="help-outline" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: dashboardConfig.themeColors.primary,
        tabBarInactiveTintColor: GRAY[500],
        tabBarStyle: {
          backgroundColor: SEMANTIC.surface.default,
          borderTopWidth: 1,
          borderTopColor: SEMANTIC.border.light,
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
        headerStyle: {
          backgroundColor: SEMANTIC.background.default,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: SEMANTIC.border.light,
        },
        headerTintColor: dashboardConfig.themeColors.primary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize.xl,
          color: SEMANTIC.text.primary,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{
          headerShown: false,
          tabBarLabel: employeesLabel,
        }}
      />

      <Tab.Screen
        name="MedicalInfo"
        component={OrganizationMedicalInfoScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Medical',
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

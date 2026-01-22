/**
 * Organization Navigator
 * Bottom tab navigator for organization users
 * Uses dynamic theme colors based on account type
 * Renders different tabs based on user role (admin vs regular user)
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
  User,
  AlertTriangle,
  MapPin,
  Shield,
  BookOpen,
  Bell,
  UserCog,
  Users2,
  MoreHorizontal,
} from 'lucide-react-native';

import type { OrganizationTabParamList } from './types';
import { GRAY } from '@/constants/colors';
import { typography } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { getDashboardConfig, isAdmin, isTeacher, isParent } from '@/config/dashboardConfig';

// Import screens
import ProfileScreen from '@/screens/dashboard/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import { LocationSharingScreen } from '@/screens/location';
import {
  OrganizationDashboardScreen,
  EmployeesScreen,
  WorkersScreen,
  StudentsScreen,
  TeachersScreen,
  ParentsScreen,
  OrganizationMedicalInfoScreen,
  IncidentReportsScreen,
  OSHAComplianceScreen,
  TrainingRecordsScreen,
  EmergencyNotificationsScreen,
  EducationMoreScreen,
  ConstructionMoreScreen,
} from '@/screens/organization';

const Tab = createBottomTabNavigator<OrganizationTabParamList>();

export default function OrganizationNavigator() {
  // Get dynamic theme colors
  const theme = useTheme();
  const primaryColor = theme.primary[500];

  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const userRole = useAuthStore((state) => state.user?.role);
  const dashboardConfig = getDashboardConfig(accountType);

  // Check user role
  const isUserAdmin = isAdmin(userRole);
  const isUserTeacher = isTeacher(userRole);
  const isUserParent = isParent(userRole);

  // Get terminology for tab labels
  const employeesLabel = dashboardConfig.terminology.users;

  // Teacher sees "My Students", Parent sees "My Children"
  const getStudentsLabel = () => {
    if (isUserTeacher) return 'My Students';
    if (isUserParent) return 'My Children';
    return employeesLabel;
  };

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
            case 'IncidentReports':
              return <AlertTriangle size={size} color={color} />;
            case 'OSHACompliance':
              return <Shield size={size} color={color} />;
            case 'TrainingRecords':
              return <BookOpen size={size} color={color} />;
            case 'EmergencyNotifications':
              return <Bell size={size} color={color} />;
            case 'Teachers':
              return <UserCog size={size} color={color} />;
            case 'Parents':
              return <Users2 size={size} color={color} />;
            case 'More':
              return <MoreHorizontal size={size} color={color} />;
            case 'Location':
              return <MapPin size={size} color={color} />;
            case 'Profile':
              return <User size={size} color={color} />;
            case 'Settings':
              return <Settings size={size} color={color} />;
            default:
              return <Ionicons name="help-outline" size={size} color={color} />;
          }
        },
        // Use dynamic theme colors
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
      {/* Home - Always visible */}
      <Tab.Screen
        name="Home"
        component={OrganizationDashboardScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
        }}
      />

      {/* Employees - Corporate only (Construction & Education have consolidated More menu) */}
      {accountType === 'corporate' && isUserAdmin && (
        <Tab.Screen
          name="Employees"
          component={EmployeesScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Employees',
          }}
        />
      )}

      {/* Workers - Construction bottom tab (admin & supervisor) */}
      {accountType === 'construction' &&
        (isUserAdmin || userRole === 'supervisor') && (
          <Tab.Screen
            name="Employees"
            component={WorkersScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Workers',
            }}
          />
        )}

      {/* MedicalInfo - Education bottom tab */}
      {accountType === 'education' && (
        <Tab.Screen
          name="MedicalInfo"
          component={OrganizationMedicalInfoScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Medical',
          }}
        />
      )}

      {/* Location - Education bottom tab */}
      {accountType === 'education' && (
        <Tab.Screen
          name="Location"
          component={LocationSharingScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Location',
          }}
        />
      )}

      {/* More - Education dashboard consolidated menu */}
      {accountType === 'education' && (
        <Tab.Screen
          name="More"
          component={EducationMoreScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'More',
          }}
        />
      )}

      {/* More - Construction dashboard consolidated menu (admin/supervisor) */}
      {accountType === 'construction' &&
        (isUserAdmin || userRole === 'supervisor') && (
          <Tab.Screen
            name="More"
            component={ConstructionMoreScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'More',
            }}
          />
        )}

      {/* Construction Worker tabs (non-admin, non-supervisor) */}
      {accountType === 'construction' &&
        !isUserAdmin &&
        userRole !== 'supervisor' && (
          <>
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
                tabBarLabel: 'My Profile',
              }}
            />
            <Tab.Screen
              name="Location"
              component={LocationSharingScreen}
              options={{
                headerShown: false,
                tabBarLabel: 'Location',
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: false,
                tabBarLabel: 'Settings',
              }}
            />
          </>
        )}

      {/* MedicalInfo - Corporate Admin only (Construction has it in More) */}
      {accountType === 'corporate' && isUserAdmin && (
        <Tab.Screen
          name="MedicalInfo"
          component={OrganizationMedicalInfoScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Medical',
          }}
        />
      )}

      {/* Incident Reports - Corporate Admin only (Construction has it in More) */}
      {accountType === 'corporate' && isUserAdmin && (
        <Tab.Screen
          name="IncidentReports"
          component={IncidentReportsScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'Incidents',
          }}
        />
      )}

      {/* Location Sharing - Corporate only (Construction & Education have it in More) */}
      {accountType === 'corporate' && (
        <Tab.Screen
          name="Location"
          component={LocationSharingScreen}
          options={{
            title: 'Location',
            tabBarLabel: 'Location',
          }}
        />
      )}

      {/* My Profile - Corporate non-admin users (Construction & Education have it in More) */}
      {accountType === 'corporate' && !isUserAdmin && (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarLabel: 'My Profile',
          }}
        />
      )}

      {/* Settings - Corporate only (Construction & Education have it in More) */}
      {accountType === 'corporate' && (
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
          }}
        />
      )}
    </Tab.Navigator>
  );
}

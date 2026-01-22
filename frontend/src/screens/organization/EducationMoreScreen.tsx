/**
 * Education More Screen
 * Menu screen with additional options for Education dashboard
 * Accessible from bottom tab "More"
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  UserCog,
  Users2,
  FileHeart,
  AlertTriangle,
  Bell,
  ChevronRight,
  GraduationCap,
  Settings,
  Users,
  User,
  ArrowLeft,
} from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';
import { isAdmin, isTeacher, isParent } from '@/config/dashboardConfig';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Education theme color (green)
const EDUCATION_PRIMARY = '#16A34A';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  screen: string;
  adminOnly?: boolean;
}

export default function EducationMoreScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const isUserAdmin = isAdmin(userRole);
  const isUserTeacher = isTeacher(userRole);
  const isUserParent = isParent(userRole);

  // Get dynamic label for students based on role
  const getStudentsLabel = () => {
    if (isUserTeacher) return 'My Students';
    if (isUserParent) return 'My Children';
    return 'Students';
  };

  const getStudentsDescription = () => {
    if (isUserTeacher) return 'View your assigned students';
    if (isUserParent) return 'View your children\'s profiles';
    return 'Manage student accounts';
  };

  const menuItems: MenuItem[] = [
    {
      id: 'students',
      label: getStudentsLabel(),
      description: getStudentsDescription(),
      icon: <GraduationCap size={24} color={EDUCATION_PRIMARY} />,
      screen: 'Students',
      adminOnly: false, // Visible to all (admin, teacher, parent)
    },
    {
      id: 'teachers',
      label: 'Teachers',
      description: 'Manage teachers and staff',
      icon: <UserCog size={24} color={EDUCATION_PRIMARY} />,
      screen: 'Teachers',
      adminOnly: true,
    },
    {
      id: 'parents',
      label: 'Parents',
      description: 'Manage parent accounts',
      icon: <Users2 size={24} color={EDUCATION_PRIMARY} />,
      screen: 'Parents',
      adminOnly: true,
    },
    {
      id: 'incidents',
      label: 'Incident Reports',
      description: 'Report and track incidents',
      icon: <AlertTriangle size={24} color="#F59E0B" />,
      screen: 'IncidentReports',
      adminOnly: true,
    },
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      description: 'Send notifications to parents',
      icon: <Bell size={24} color="#EF4444" />,
      screen: 'EmergencyNotifications',
      adminOnly: true,
    },
    {
      id: 'profile',
      label: 'My Profile',
      description: 'View and edit your profile',
      icon: <User size={24} color="#3B82F6" />,
      screen: 'Profile',
      adminOnly: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'App preferences and account',
      icon: <Settings size={24} color={GRAY[600]} />,
      screen: 'Settings',
      adminOnly: false,
    },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isUserAdmin
  );

  const handleMenuPress = (screen: string) => {
    if (screen === 'Profile') {
      // Navigate to EditProfile screen for viewing/editing profile
      navigation.navigate('EditProfile' as any);
    } else {
      navigation.navigate(screen as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <GraduationCap size={28} color={EDUCATION_PRIMARY} />
          </View>
          <Text style={styles.headerTitle}>More Options</Text>
          <Text style={styles.headerSubtitle}>
            {isUserAdmin ? 'Admin Tools & Settings' : 'Additional Features'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* People Section - Students visible to all, Teachers/Parents for admin only */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People</Text>
          <View style={styles.menuGroup}>
            {visibleMenuItems
              .filter((item) => ['students', 'teachers', 'parents'].includes(item.id))
              .map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleMenuPress(item.screen)}
                >
                  <View style={styles.menuIconContainer}>{item.icon}</View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={GRAY[400]} />
                </Pressable>
              ))}
          </View>
        </View>

        {/* Records Section - Admin only */}
        {isUserAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Records & Reports</Text>
            <View style={styles.menuGroup}>
              {visibleMenuItems
                .filter((item) => ['incidents', 'alerts'].includes(item.id))
                .map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuPress(item.screen)}
                  >
                    <View style={styles.menuIconContainer}>{item.icon}</View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuDescription}>
                        {item.description}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={GRAY[400]} />
                  </Pressable>
                ))}
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            {visibleMenuItems
              .filter((item) => ['profile', 'settings'].includes(item.id))
              .map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleMenuPress(item.screen)}
                >
                  <View style={styles.menuIconContainer}>{item.icon}</View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={GRAY[400]} />
                </Pressable>
              ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>MedGuard Education</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${EDUCATION_PRIMARY}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  section: {
    paddingTop: spacing[5],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  menuGroup: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  menuItemPressed: {
    backgroundColor: GRAY[50],
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GRAY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: SEMANTIC.text.secondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.tertiary,
  },
  appVersion: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: spacing[1],
  },
});

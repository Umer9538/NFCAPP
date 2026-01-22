/**
 * Construction More Screen
 * Menu screen with additional options for Construction dashboard
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
  HardHat,
  AlertTriangle,
  Shield,
  BookOpen,
  MapPin,
  Settings,
  User,
  ChevronRight,
  FileHeart,
  Wrench,
  ArrowLeft,
  LogOut,
} from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';
import { isAdmin } from '@/config/dashboardConfig';
import { SEMANTIC, GRAY, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Construction theme color (orange)
const CONSTRUCTION_PRIMARY = '#EA580C';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  screen: string;
  adminOnly?: boolean;
  supervisorVisible?: boolean;
}

export default function ConstructionMoreScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const userRole = useAuthStore((state) => state.user?.role);
  const logout = useAuthStore((state) => state.logout);
  const isUserAdmin = isAdmin(userRole);
  const isSupervisor = userRole === 'supervisor';

  const handleLogout = () => {
    logout();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'workers',
      label: 'Workers',
      description: 'Manage worker accounts and profiles',
      icon: <HardHat size={24} color={CONSTRUCTION_PRIMARY} />,
      screen: 'Employees',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'medical',
      label: 'Medical Info',
      description: 'View worker health records',
      icon: <FileHeart size={24} color="#EF4444" />,
      screen: 'MedicalInfo',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'incidents',
      label: 'Incident Reports',
      description: 'Report and track safety incidents',
      icon: <AlertTriangle size={24} color="#F59E0B" />,
      screen: 'IncidentReports',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'osha',
      label: 'OSHA Compliance',
      description: 'Safety compliance tracking',
      icon: <Shield size={24} color="#10B981" />,
      screen: 'OSHACompliance',
      adminOnly: true,
      supervisorVisible: false,
    },
    {
      id: 'training',
      label: 'Training Records',
      description: 'Certifications and training status',
      icon: <BookOpen size={24} color="#3B82F6" />,
      screen: 'TrainingRecords',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'location',
      label: 'Location Sharing',
      description: 'Share and view locations',
      icon: <MapPin size={24} color="#8B5CF6" />,
      screen: 'Location',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'profile',
      label: 'My Profile',
      description: 'View and edit your profile',
      icon: <User size={24} color="#6366F1" />,
      screen: 'Profile',
      adminOnly: false,
      supervisorVisible: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'App preferences and account',
      icon: <Settings size={24} color={GRAY[600]} />,
      screen: 'Settings',
      adminOnly: false,
      supervisorVisible: true,
    },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) => {
    if (isUserAdmin) return true;
    if (isSupervisor && item.supervisorVisible) return true;
    if (!item.adminOnly && !item.supervisorVisible) return true;
    return false;
  });

  const handleMenuPress = (screen: string) => {
    if (screen === 'Profile') {
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
            <Wrench size={28} color={CONSTRUCTION_PRIMARY} />
          </View>
          <Text style={styles.headerTitle}>More Options</Text>
          <Text style={styles.headerSubtitle}>
            {isUserAdmin ? 'Admin Tools & Settings' : isSupervisor ? 'Supervisor Tools' : 'Additional Features'}
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
        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Management</Text>
          <View style={styles.menuGroup}>
            {visibleMenuItems
              .filter((item) => ['workers', 'medical'].includes(item.id))
              .map((item, index, arr) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                    index === arr.length - 1 && styles.menuItemLast,
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

        {/* Safety & Compliance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Compliance</Text>
          <View style={styles.menuGroup}>
            {visibleMenuItems
              .filter((item) => ['incidents', 'osha', 'training'].includes(item.id))
              .map((item, index, arr) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                    index === arr.length - 1 && styles.menuItemLast,
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

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            {visibleMenuItems
              .filter((item) => ['location', 'profile', 'settings'].includes(item.id))
              .map((item, index, arr) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                    index === arr.length - 1 && styles.menuItemLast,
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

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                styles.menuItemLast,
                pressed && styles.menuItemPressed,
              ]}
              onPress={handleLogout}
            >
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <LogOut size={24} color={STATUS.error.main} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, styles.logoutLabel]}>Log Out</Text>
                <Text style={styles.menuDescription}>
                  Sign out of your account
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>MedGuard Construction</Text>
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
    backgroundColor: `${CONSTRUCTION_PRIMARY}15`,
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
  menuItemLast: {
    borderBottomWidth: 0,
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
  logoutIconContainer: {
    backgroundColor: `${STATUS.error.main}15`,
  },
  logoutLabel: {
    color: STATUS.error.main,
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

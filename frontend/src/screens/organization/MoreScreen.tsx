/**
 * More Screen
 * Hub for additional organization features
 * Reduces bottom bar clutter by grouping secondary features
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
  FileHeart,
  AlertTriangle,
  Bell,
  UserCog,
  Users2,
  Shield,
  BookOpen,
  ChevronRight,
  Settings,
  User,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';
import { isAdmin } from '@/config/dashboardConfig';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

// Education theme color
const EDUCATION_PRIMARY = '#16A34A';
// Corporate theme color
const CORPORATE_PRIMARY = '#3B82F6';
// Construction theme color
const CONSTRUCTION_PRIMARY = '#F59E0B';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  screen: string;
  color: string;
  adminOnly?: boolean;
  accountTypes?: string[];
}

export default function MoreScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const accountType = useAuthStore((state) => state.accountType) || 'corporate';
  const userRole = useAuthStore((state) => state.user?.role);
  const isUserAdmin = isAdmin(userRole);

  // Get primary color based on account type
  const getPrimaryColor = () => {
    switch (accountType) {
      case 'education':
        return EDUCATION_PRIMARY;
      case 'construction':
        return CONSTRUCTION_PRIMARY;
      default:
        return CORPORATE_PRIMARY;
    }
  };

  const primaryColor = getPrimaryColor();

  // Define menu items
  const menuItems: MenuItem[] = [
    // Medical Info
    {
      id: 'medical',
      label: 'Medical Records',
      description: 'View health information and medical profiles',
      icon: <FileHeart size={24} color={primaryColor} />,
      screen: 'MedicalRecords',
      color: primaryColor,
      adminOnly: true,
    },
    // Incident Reports
    {
      id: 'incidents',
      label: 'Incident Reports',
      description: 'Manage and review incident reports',
      icon: <AlertTriangle size={24} color="#EF4444" />,
      screen: 'IncidentReports',
      color: '#EF4444',
      adminOnly: true,
    },
    // Emergency Notifications (Education only)
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      description: 'Send and manage emergency notifications',
      icon: <Bell size={24} color="#F59E0B" />,
      screen: 'EmergencyNotifications',
      color: '#F59E0B',
      adminOnly: true,
      accountTypes: ['education'],
    },
    // Teachers (Education only)
    {
      id: 'teachers',
      label: 'Teachers',
      description: 'Manage teachers and staff assignments',
      icon: <UserCog size={24} color="#8B5CF6" />,
      screen: 'Teachers',
      color: '#8B5CF6',
      adminOnly: true,
      accountTypes: ['education'],
    },
    // Parents (Education only)
    {
      id: 'parents',
      label: 'Parents',
      description: 'Manage parent accounts and relationships',
      icon: <Users2 size={24} color="#EC4899" />,
      screen: 'Parents',
      color: '#EC4899',
      adminOnly: true,
      accountTypes: ['education'],
    },
    // OSHA Compliance (Construction only)
    {
      id: 'osha',
      label: 'OSHA Compliance',
      description: 'Track safety compliance and regulations',
      icon: <Shield size={24} color="#10B981" />,
      screen: 'OSHACompliance',
      color: '#10B981',
      adminOnly: true,
      accountTypes: ['construction'],
    },
    // Training Records (Construction only)
    {
      id: 'training',
      label: 'Training Records',
      description: 'Manage employee certifications and training',
      icon: <BookOpen size={24} color="#6366F1" />,
      screen: 'TrainingRecords',
      color: '#6366F1',
      adminOnly: false,
      accountTypes: ['construction'],
    },
    // My Profile (Non-admin)
    {
      id: 'profile',
      label: 'My Profile',
      description: 'View and edit your emergency profile',
      icon: <User size={24} color={primaryColor} />,
      screen: 'Profile',
      color: primaryColor,
      adminOnly: false,
    },
    // Settings
    {
      id: 'settings',
      label: 'Settings',
      description: 'App preferences and account settings',
      icon: <Settings size={24} color={GRAY[600]} />,
      screen: 'AccountSettings',
      color: GRAY[600],
    },
  ];

  // Filter menu items based on role and account type
  const filteredItems = menuItems.filter((item) => {
    // Check admin requirement
    if (item.adminOnly && !isUserAdmin) {
      // Allow profile for non-admins
      if (item.id === 'profile') return true;
      return false;
    }

    // Hide profile for admins (they see it differently)
    if (item.id === 'profile' && isUserAdmin) return false;

    // Check account type
    if (item.accountTypes && !item.accountTypes.includes(accountType)) {
      return false;
    }

    return true;
  });

  // Group items into sections
  const managementItems = filteredItems.filter((item) =>
    ['medical', 'incidents', 'alerts', 'teachers', 'parents', 'osha', 'training'].includes(item.id)
  );
  const accountItems = filteredItems.filter((item) =>
    ['profile', 'settings'].includes(item.id)
  );

  const handleItemPress = (screen: string) => {
    // Navigate to the screen - these are stack screens
    (navigation as any).navigate(screen);
  };

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={() => handleItemPress(item.screen)}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        {item.icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <ChevronRight size={20} color={GRAY[400]} />
    </Pressable>
  );

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
        <Text style={styles.headerTitle}>More</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Management Section */}
        {managementItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.menuCard}>
              {managementItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderMenuItem(item)}
                  {index < managementItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Account Section */}
        {accountItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuCard}>
              {accountItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderMenuItem(item)}
                  {index < accountItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MedGuard v1.0.0</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuItemPressed: {
    backgroundColor: GRAY[50],
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginLeft: spacing[4] + 44 + spacing[3],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  versionText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
});

/**
 * Settings Screen
 * Simplified settings screen with working features only
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Card, Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { PRIMARY, SEMANTIC, STATUS, GRAY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function SettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Card */}
        <Card variant="outlined" style={styles.profileCard}>
          <Pressable
            style={styles.profileRow}
            onPress={() => navigation.navigate('EditProfile' as any)}
          >
            <Avatar
              size="lg"
              initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={GRAY[400]} />
          </Pressable>
        </Card>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card variant="outlined" padding="none">
            <SettingItem
              icon="person-outline"
              label="Account Settings"
              description="Email, phone, personal info"
              onPress={() => navigation.navigate('AccountSettings')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark-outline"
              label="Security"
              description="2FA, active sessions"
              onPress={() => navigation.navigate('SecuritySettings')}
            />
          </Card>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <Card variant="outlined" padding="none">
            <SettingItem
              icon="notifications-outline"
              label="Notification Preferences"
              description="Manage your notification settings"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
          </Card>
        </View>

        {/* Medical Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Data</Text>

          <Card variant="outlined" padding="none">
            <SettingItem
              icon="time-outline"
              label="Access History"
              description="View who accessed your profile"
              onPress={() => navigation.navigate('AuditLogs')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              label="Scan History"
              description="View bracelet scan logs"
              onPress={() => navigation.navigate('ScanHistory')}
            />
          </Card>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <Card variant="outlined" padding="none">
            <SettingItem
              icon="card-outline"
              label="Manage Subscription"
              description="View plan and billing"
              onPress={() => navigation.navigate('Subscription')}
            />
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Card variant="outlined" padding="none">
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => navigation.navigate('Help')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle-outline"
              label="About"
              onPress={() => navigation.navigate('About')}
            />
          </Card>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <Card variant="outlined" padding="none">
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="phone-portrait-outline" size={20} color={PRIMARY[600]} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Version</Text>
                  <Text style={styles.settingDescription}>
                    {appVersion} ({buildNumber})
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Logout */}
        <Card variant="outlined" padding="none" style={styles.logoutCard}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={STATUS.error.main} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// Reusable Setting Item Component
interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
}

function SettingItem({ icon, label, description, onPress }: SettingItemProps) {
  return (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={PRIMARY[600]} />
        </View>
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={GRAY[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingTop: 60,
  },
  profileCard: {
    marginBottom: spacing[6],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  profileEmail: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  settingDescription: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.light,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  logoutCard: {
    marginBottom: spacing[4],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: STATUS.error.main,
  },
  bottomSpacer: {
    height: spacing[8],
  },
});

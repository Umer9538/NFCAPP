/**
 * Settings Screen
 * Main settings screen with grouped sections for account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Linking,
  Switch,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Card, LoadingSpinner, Toast, useToast, Avatar } from '@/components/ui';
import { settingsApi } from '@/api/settings';
import { useAuth } from '@/hooks/useAuth';
import type { NotificationSettings } from '@/types/settings';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

export default function SettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  // Fetch notification settings
  const { data: notificationSettings, isLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: settingsApi.getNotificationSettings,
    placeholderData: getMockNotificationSettings(),
  });

  // Update notification setting mutation
  const updateNotificationMutation = useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) =>
      settingsApi.updateNotificationSettings(settings),
    onSuccess: () => {
      success('Settings updated');
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
    },
    onError: () => {
      showError('Failed to update settings');
    },
  });

  const handleToggleNotification = (key: keyof NotificationSettings, value: boolean) => {
    updateNotificationMutation.mutate({ [key]: value });
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Navigate to delete account confirmation screen
            Alert.alert('Delete Account', 'This feature will be implemented soon.');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await settingsApi.clearCache();
              success('Cache cleared');
            } catch (err) {
              showError('Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleDownloadData = async () => {
    Alert.alert('Download Data', 'This feature will be implemented soon.');
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next app launch. The app will restart.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@medguard_onboarding_completed');
              await logout();
              success('Onboarding reset. Please restart the app.');
            } catch (err) {
              showError('Failed to reset onboarding');
            }
          },
        },
      ]
    );
  };

  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';

  if (isLoading) {
    return <LoadingSpinner visible text="Loading settings..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Card variant="outline" padding="none">
            {/* Profile Picture */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('EditProfile' as any)}
            >
              <View style={styles.settingLeft}>
                <Avatar
                  size="md"
                  initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
                  imageUri={user?.profilePicture}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Profile Picture</Text>
                  <Text style={styles.settingValue}>Tap to change</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Full Name */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('EditProfile' as any)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Full Name</Text>
                  <Text style={styles.settingValue}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Email */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('AccountSettings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingValue}>{user?.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Phone */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('AccountSettings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="call-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Phone Number</Text>
                  <Text style={styles.settingValue}>
                    {user?.phone || 'Not set'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>
          </Card>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Card variant="outline" padding="none">
            {/* Change Password */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Two-Factor Authentication */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Biometric Login */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Biometric Login</Text>
              </View>
              <Switch value={false} onValueChange={() => {}} />
            </View>

            <View style={styles.divider} />

            {/* Active Sessions */}
            <Pressable
              style={styles.settingItem}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Active Sessions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>
          </Card>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <Card variant="outline" padding="none">
            {/* Profile Access Alerts */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Profile Access Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when your profile is accessed
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.profileAccessAlerts || false}
                onValueChange={(value) =>
                  handleToggleNotification('profileAccessAlerts', value)
                }
              />
            </View>

            <View style={styles.divider} />

            {/* Health Reminders */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="medical-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Health Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Medication and appointment reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.healthReminders || false}
                onValueChange={(value) =>
                  handleToggleNotification('healthReminders', value)
                }
              />
            </View>

            <View style={styles.divider} />

            {/* Subscription Updates */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="card-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Subscription Updates</Text>
                  <Text style={styles.settingDescription}>
                    Billing and subscription notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.subscriptionUpdates || false}
                onValueChange={(value) =>
                  handleToggleNotification('subscriptionUpdates', value)
                }
              />
            </View>

            <View style={styles.divider} />

            {/* Security Alerts */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="alert-circle-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Security Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Login attempts and security warnings
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.securityAlerts || false}
                onValueChange={(value) =>
                  handleToggleNotification('securityAlerts', value)
                }
              />
            </View>

            <View style={styles.divider} />

            {/* Marketing Emails */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Marketing Emails</Text>
                  <Text style={styles.settingDescription}>
                    Product updates and newsletters
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings?.marketingEmails || false}
                onValueChange={(value) =>
                  handleToggleNotification('marketingEmails', value)
                }
              />
            </View>
          </Card>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <Card variant="outline" padding="none">
            {/* Download My Data */}
            <Pressable style={styles.settingItem} onPress={handleDownloadData}>
              <View style={styles.settingLeft}>
                <Ionicons name="download-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Download My Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Privacy Policy */}
            <Pressable
              style={styles.settingItem}
              onPress={() => Linking.openURL('https://medguard.com/privacy')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Terms of Service */}
            <Pressable
              style={styles.settingItem}
              onPress={() => Linking.openURL('https://medguard.com/terms')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Delete Account */}
            <Pressable style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={20} color={STATUS.error} />
                <Text style={[styles.settingLabel, { color: STATUS.error }]}>
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>
          </Card>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <Card variant="outline" padding="none">
            {/* App Version */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color={PRIMARY[600]} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>App Version</Text>
                  <Text style={styles.settingValue}>
                    {appVersion} ({buildNumber})
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Clear Cache */}
            <Pressable style={styles.settingItem} onPress={handleClearCache}>
              <View style={styles.settingLeft}>
                <Ionicons name="trash-bin-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.settingLabel}>Clear Cache</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>

            <View style={styles.divider} />

            {/* Logout */}
            <Pressable style={styles.settingItem} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <Ionicons name="log-out-outline" size={20} color={STATUS.error} />
                <Text style={[styles.settingLabel, { color: STATUS.error }]}>
                  Logout
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
            </Pressable>
          </Card>
        </View>

        {/* Developer Section */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Options</Text>

            <Card variant="outline" padding="none">
              {/* Reset Onboarding */}
              <Pressable style={styles.settingItem} onPress={handleResetOnboarding}>
                <View style={styles.settingLeft}>
                  <Ionicons name="refresh-outline" size={20} color="#f59e0b" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Reset Onboarding</Text>
                    <Text style={styles.settingDescription}>
                      Show onboarding screens again
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
              </Pressable>
            </Card>
          </View>
        )}
      </ScrollView>

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

function getMockNotificationSettings(): NotificationSettings {
  return {
    profileAccessAlerts: true,
    healthReminders: true,
    subscriptionUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  settingDescription: {
    fontSize: 13,
    color: SEMANTIC.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.default,
    marginLeft: spacing[4] + 20 + spacing[3],
  },
});

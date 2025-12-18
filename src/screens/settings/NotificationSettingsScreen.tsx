/**
 * Notification Settings Screen
 * Manage notification preferences matching web API
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Header } from '@/components/shared';
import { Card, Toast, useToast, LoadingSpinner } from '@/components/ui';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/api/notifications';
import type { NotificationSettings } from '@/services/notificationService';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface NotificationOption {
  id: keyof NotificationSettings;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Exactly 4 notification preference toggles matching web API
const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    id: 'notifyProfileAccess',
    title: 'Profile Access Alerts',
    description: 'Get notified when someone views your emergency profile',
    icon: 'eye-outline',
  },
  {
    id: 'notifySubscriptionUpdates',
    title: 'Subscription Updates',
    description: 'Billing reminders and subscription changes',
    icon: 'card-outline',
  },
  {
    id: 'notifySecurityAlerts',
    title: 'Security Alerts',
    description: 'Login alerts and password change notifications',
    icon: 'shield-outline',
  },
  {
    id: 'notifyMarketingEmails',
    title: 'Marketing Emails',
    description: 'Product updates and promotional offers',
    icon: 'mail-outline',
  },
];

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);

  // Fetch notification settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: getNotificationSettings,
  });

  // Update settings mutation - auto-save on change
  const updateMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['notification-settings'], updatedSettings);
      success('Settings updated');
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to update settings');
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    if (!localSettings) return;

    const updatedSettings = {
      ...localSettings,
      [key]: value,
    };

    setLocalSettings(updatedSettings);
    // Auto-save on change
    updateMutation.mutate({ [key]: value });
  };

  const handleTimeChange = (
    type: 'start' | 'end',
    event: any,
    selectedTime?: Date
  ) => {
    if (type === 'start') {
      setShowStartTimePicker(false);
    } else {
      setShowEndTimePicker(false);
    }

    if (selectedTime && localSettings) {
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const updatedSettings = {
        ...localSettings,
        [type === 'start' ? 'quietHoursStart' : 'quietHoursEnd']: timeString,
      };

      setLocalSettings(updatedSettings);
      updateMutation.mutate({
        [type === 'start' ? 'quietHoursStart' : 'quietHoursEnd']: timeString,
      });
    }
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const formatTime = (timeString: string): string => {
    const date = parseTime(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderOption = (option: NotificationOption) => {
    if (!localSettings) return null;

    const value = localSettings[option.id] as boolean;

    return (
      <View key={option.id} style={styles.option}>
        <View style={styles.optionIcon}>
          <Ionicons name={option.icon} size={24} color={PRIMARY[600]} />
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={(val) => handleToggle(option.id, val)}
          disabled={!localSettings.enabled}
          trackColor={{
            false: SEMANTIC.border.default,
            true: PRIMARY[600],
          }}
          thumbColor="#ffffff"
        />
      </View>
    );
  };

  if (isLoading || !localSettings) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" showBackButton />
        <LoadingSpinner visible />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBackButton />

      <ScrollView style={styles.content}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <Card variant="elevated" padding="lg">
            <View style={styles.masterToggle}>
              <View style={styles.masterToggleContent}>
                <Text style={styles.masterToggleTitle}>Enable Notifications</Text>
                <Text style={styles.masterToggleDescription}>
                  Allow MedGuard to send you notifications
                </Text>
              </View>
              <Switch
                value={localSettings.enabled}
                onValueChange={(val) => handleToggle('enabled', val)}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: PRIMARY[600],
                }}
                thumbColor="#ffffff"
              />
            </View>
          </Card>
        </View>

        {/* Notification Types - Exactly 4 toggles matching web */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Card variant="elevated" padding="none">
            {NOTIFICATION_OPTIONS.map(renderOption)}
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card variant="elevated" padding="none">
            {/* Sound */}
            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Ionicons name="volume-high" size={24} color={PRIMARY[600]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Sound</Text>
                <Text style={styles.optionDescription}>
                  Play sound for notifications
                </Text>
              </View>
              <Switch
                value={localSettings.sound}
                onValueChange={(val) => handleToggle('sound', val)}
                disabled={!localSettings.enabled}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: PRIMARY[600],
                }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Vibration */}
            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Ionicons name="phone-portrait" size={24} color={PRIMARY[600]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Vibration</Text>
                <Text style={styles.optionDescription}>
                  Vibrate for notifications
                </Text>
              </View>
              <Switch
                value={localSettings.vibration}
                onValueChange={(val) => handleToggle('vibration', val)}
                disabled={!localSettings.enabled}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: PRIMARY[600],
                }}
                thumbColor="#ffffff"
              />
            </View>
          </Card>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Card variant="elevated" padding="lg">
            {/* Enable Quiet Hours */}
            <View style={styles.quietHoursToggle}>
              <View style={styles.quietHoursToggleContent}>
                <Text style={styles.quietHoursTitle}>Enable Quiet Hours</Text>
                <Text style={styles.quietHoursDescription}>
                  Mute non-urgent notifications during quiet hours
                </Text>
              </View>
              <Switch
                value={localSettings.quietHoursEnabled}
                onValueChange={(val) => handleToggle('quietHoursEnabled', val)}
                disabled={!localSettings.enabled}
                trackColor={{
                  false: SEMANTIC.border.default,
                  true: PRIMARY[600],
                }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Time Range */}
            {localSettings.quietHoursEnabled && (
              <View style={styles.timeRange}>
                {/* Start Time */}
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>From</Text>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color={PRIMARY[600]} />
                    <Text style={styles.timeButtonText}>
                      {formatTime(localSettings.quietHoursStart)}
                    </Text>
                  </Pressable>
                </View>

                {/* End Time */}
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>To</Text>
                  <Pressable
                    style={styles.timeButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color={PRIMARY[600]} />
                    <Text style={styles.timeButtonText}>
                      {formatTime(localSettings.quietHoursEnd)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Health Reminders Link */}
        <View style={styles.section}>
          <Pressable
            style={styles.linkCard}
            onPress={() => navigation.navigate('HealthReminders' as any)}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="medical" size={24} color={PRIMARY[600]} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Health Reminders</Text>
              <Text style={styles.linkDescription}>
                Manage medication and health check reminders
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={SEMANTIC.text.tertiary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Time Pickers */}
      {showStartTimePicker && (
        <DateTimePicker
          value={parseTime(localSettings.quietHoursStart)}
          mode="time"
          is24Hour={false}
          onChange={(event, date) => handleTimeChange('start', event, date)}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={parseTime(localSettings.quietHoursEnd)}
          mode="time"
          is24Hour={false}
          onChange={(event, date) => handleTimeChange('end', event, date)}
        />
      )}

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterToggleContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  masterToggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  masterToggleDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  optionDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  quietHoursToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  quietHoursToggleContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  quietHoursDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  timeRange: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  timeButtonText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: 12,
    backgroundColor: SEMANTIC.background.elevated,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  linkDescription: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
});

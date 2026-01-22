/**
 * Health Reminders Screen
 * Manage medication and health check reminders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { SettingsScreenNavigationProp } from '@/navigation/types';

import { Header } from '@/components/shared';
import { Card, Button, Input, Toast, useToast } from '@/components/ui';
import {
  scheduleDailyReminder,
  scheduleMedicationReminder,
  cancelNotification,
  getScheduledNotifications,
} from '@/services/notificationService';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface Reminder {
  id: string;
  title: string;
  time: Date;
  enabled: boolean;
  type: 'daily' | 'medication';
  medicationName?: string;
  days?: number[]; // 1 = Sunday, 2 = Monday, etc.
}

const WEEKDAYS = [
  { label: 'S', value: 1 },
  { label: 'M', value: 2 },
  { label: 'T', value: 3 },
  { label: 'W', value: 4 },
  { label: 'T', value: 5 },
  { label: 'F', value: 6 },
  { label: 'S', value: 7 },
];

export default function HealthRemindersScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState(new Date());
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderType, setNewReminderType] = useState<'daily' | 'medication'>('daily');
  const [newMedicationName, setNewMedicationName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    loadScheduledReminders();
  }, []);

  const loadScheduledReminders = async () => {
    try {
      const scheduled = await getScheduledNotifications();

      // Convert scheduled notifications to reminders
      const loadedReminders: Reminder[] = scheduled
        .filter((n) => n.content.data?.type === 'health_reminder')
        .map((n) => {
          const trigger = n.trigger as any;
          const time = new Date();
          time.setHours(trigger.hour || 9);
          time.setMinutes(trigger.minute || 0);

          return {
            id: n.identifier,
            title: n.content.title || 'Health Reminder',
            time,
            enabled: true,
            type: n.content.data?.subType === 'medication' ? 'medication' : 'daily',
            medicationName: n.content.data?.medicationName,
            days: trigger.weekday,
          };
        });

      setReminders(loadedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleToggleReminder = async (reminderId: string, enabled: boolean) => {
    const reminder = reminders.find((r) => r.id === reminderId);
    if (!reminder) return;

    if (enabled) {
      // Re-schedule the reminder
      try {
        if (reminder.type === 'medication' && reminder.medicationName) {
          await scheduleMedicationReminder(
            reminder.medicationName,
            reminder.time.getHours(),
            reminder.time.getMinutes(),
            reminder.days
          );
        } else {
          await scheduleDailyReminder(
            reminder.title,
            'Time for your health check',
            reminder.time.getHours(),
            reminder.time.getMinutes()
          );
        }

        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? { ...r, enabled: true } : r))
        );
        success('Reminder is now active!');
      } catch (error) {
        showError('Unable to enable reminder. Please try again.');
      }
    } else {
      // Cancel the reminder
      try {
        await cancelNotification(reminderId);
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? { ...r, enabled: false } : r))
        );
        success('Reminder has been paused.');
      } catch (error) {
        showError('Unable to disable reminder. Please try again.');
      }
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelNotification(reminderId);
            setReminders((prev) => prev.filter((r) => r.id !== reminderId));
            success('Reminder has been removed.');
          } catch (error) {
            showError('Unable to delete reminder. Please try again.');
          }
        },
      },
    ]);
  };

  const handleAddReminder = async () => {
    if (!newReminderTitle.trim()) {
      showError('Please enter a title for your reminder.');
      return;
    }

    if (newReminderType === 'medication' && !newMedicationName.trim()) {
      showError('Please enter the medication name.');
      return;
    }

    try {
      let notificationId: string;

      if (newReminderType === 'medication') {
        notificationId = await scheduleMedicationReminder(
          newMedicationName,
          newReminderTime.getHours(),
          newReminderTime.getMinutes(),
          selectedDays.length > 0 ? selectedDays : undefined
        );
      } else {
        notificationId = await scheduleDailyReminder(
          newReminderTitle,
          'Time for your health check',
          newReminderTime.getHours(),
          newReminderTime.getMinutes()
        );
      }

      // Add to list
      const newReminder: Reminder = {
        id: notificationId,
        title: newReminderTitle,
        time: newReminderTime,
        enabled: true,
        type: newReminderType,
        medicationName: newReminderType === 'medication' ? newMedicationName : undefined,
        days: selectedDays.length > 0 ? selectedDays : undefined,
      };

      setReminders((prev) => [...prev, newReminder]);

      // Reset form
      setNewReminderTitle('');
      setNewMedicationName('');
      setNewReminderType('daily');
      setSelectedDays([]);
      setShowAddReminder(false);

      success('Your reminder has been created!');
    } catch (error) {
      showError('Unable to create reminder. Please try again.');
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return 'Every day';
    if (days.length === 7) return 'Every day';

    const dayLabels = days.map((d) => WEEKDAYS[d - 1].label);
    return dayLabels.join(', ');
  };

  const renderReminder = (reminder: Reminder) => (
    <View key={reminder.id} style={styles.reminderItem}>
      <View style={styles.reminderIcon}>
        <Ionicons
          name={reminder.type === 'medication' ? 'medical' : 'time'}
          size={24}
          color={PRIMARY[600]}
        />
      </View>

      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{reminder.title}</Text>
        <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
        {reminder.days && (
          <Text style={styles.reminderDays}>{formatDays(reminder.days)}</Text>
        )}
        {reminder.medicationName && (
          <Text style={styles.reminderMedication}>{reminder.medicationName}</Text>
        )}
      </View>

      <View style={styles.reminderActions}>
        <Switch
          value={reminder.enabled}
          onValueChange={(enabled) => handleToggleReminder(reminder.id, enabled)}
          trackColor={{
            false: SEMANTIC.border.default,
            true: PRIMARY[600],
          }}
          thumbColor="#ffffff"
        />
        <Pressable
          onPress={() => handleDeleteReminder(reminder.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={SEMANTIC.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Health Reminders" showBackButton />

      <ScrollView style={styles.content}>
        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={PRIMARY[600]} />
          <Text style={styles.infoText}>
            Set up reminders for medications and health checks. You'll receive notifications
            at the scheduled times.
          </Text>
        </View>

        {/* Reminders List */}
        {reminders.length > 0 && (
          <Card variant="elevated" padding="none">
            {reminders.map(renderReminder)}
          </Card>
        )}

        {/* Add Reminder Form */}
        {showAddReminder && (
          <Card variant="elevated" padding="lg" style={styles.addForm}>
            <Text style={styles.addFormTitle}>New Reminder</Text>

            {/* Type Selection */}
            <View style={styles.typeSelection}>
              <Pressable
                style={[
                  styles.typeButton,
                  newReminderType === 'daily' && styles.typeButtonSelected,
                ]}
                onPress={() => setNewReminderType('daily')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newReminderType === 'daily' && styles.typeButtonTextSelected,
                  ]}
                >
                  Daily Reminder
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  newReminderType === 'medication' && styles.typeButtonSelected,
                ]}
                onPress={() => setNewReminderType('medication')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newReminderType === 'medication' && styles.typeButtonTextSelected,
                  ]}
                >
                  Medication
                </Text>
              </Pressable>
            </View>

            {/* Title */}
            <Input
              label="Reminder Title"
              placeholder="e.g., Morning medication"
              value={newReminderTitle}
              onChangeText={setNewReminderTitle}
              required
            />

            {/* Medication Name (if type is medication) */}
            {newReminderType === 'medication' && (
              <Input
                label="Medication Name"
                placeholder="e.g., Aspirin"
                value={newMedicationName}
                onChangeText={setNewMedicationName}
                required
              />
            )}

            {/* Time Picker */}
            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>Time</Text>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={PRIMARY[600]} />
                <Text style={styles.timeButtonText}>{formatTime(newReminderTime)}</Text>
              </Pressable>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={newReminderTime}
                mode="time"
                is24Hour={false}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setNewReminderTime(selectedDate);
                  }
                }}
              />
            )}

            {/* Days Selection */}
            <View style={styles.daysContainer}>
              <Text style={styles.label}>Repeat on</Text>
              <View style={styles.daysButtons}>
                {WEEKDAYS.map((day) => (
                  <Pressable
                    key={day.value}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.value) && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.value) && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {selectedDays.length === 0 && (
                <Text style={styles.helperText}>No days selected = every day</Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowAddReminder(false)}
              />
              <Button title="Add Reminder" onPress={handleAddReminder} />
            </View>
          </Card>
        )}

        {/* Add Button */}
        {!showAddReminder && (
          <Button
            title="Add Reminder"
            icon={<Ionicons name="add" size={20} color="#ffffff" />}
            onPress={() => setShowAddReminder(true)}
          />
        )}
      </ScrollView>

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
    padding: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PRIMARY[50],
    borderRadius: 12,
    padding: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: PRIMARY[800],
    lineHeight: 18,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  reminderTime: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  reminderDays: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: spacing[1],
  },
  reminderMedication: {
    fontSize: 12,
    color: PRIMARY[600],
    fontWeight: '500',
    marginTop: spacing[1],
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deleteButton: {
    padding: spacing[1],
  },
  addForm: {
    marginBottom: spacing[4],
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  typeSelection: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  typeButtonTextSelected: {
    color: '#ffffff',
  },
  timePickerContainer: {
    marginBottom: spacing[4],
  },
  label: {
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
  },
  timeButtonText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  daysContainer: {
    marginBottom: spacing[4],
  },
  daysButtons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
    marginTop: spacing[2],
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'flex-end',
  },
});

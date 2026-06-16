import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY, STATUS } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  /** Times of day to take this medication, formatted "HH:mm". */
  value: string[];
  onChange: (next: string[]) => void;
  /** Max number of times allowed (web caps at 8). */
  max?: number;
}

const MAX_DEFAULT = 8;

/**
 * Stable times-of-day picker for the medications step.
 *
 * Renders the current times as removable chips and adds a "+" button that
 * opens the platform time picker. Mirrors the web app's UI: up to 8 slots,
 * each delete-able, displayed in chronological order.
 *
 * Hint: the caller auto-populates sensible defaults when the user picks a
 * frequency (e.g. twice_daily → ["08:00","20:00"]); this component handles
 * subsequent edits.
 */
export function TimesToTakeEditor({ value, onChange, max = MAX_DEFAULT }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Default the picker to 8 AM rather than "now" so the user lands on a sane
  // medication time.
  const [pickerDate, setPickerDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });

  const canAdd = value.length < max;

  const handlePicked = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (event.type !== 'set' || !date) return;
    const formatted = formatTime(date);
    if (value.includes(formatted)) return; // dedupe
    const next = [...value, formatted].sort();
    onChange(next);
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <View>
      <Text style={styles.label}>
        Times to Take <Text style={styles.counter}>({value.length})/{max}</Text>
      </Text>
      <View style={styles.chipRow}>
        {value.map((t, idx) => (
          <View key={`${t}-${idx}`} style={styles.timeChip}>
            <Ionicons name="time-outline" size={14} color={PRIMARY[700]} />
            <Text style={styles.timeText}>{t}</Text>
            <Pressable hitSlop={8} onPress={() => removeAt(idx)}>
              <Ionicons name="close" size={14} color={STATUS.error.main} />
            </Pressable>
          </View>
        ))}
        {canAdd && (
          <Pressable style={styles.addChip} onPress={() => setPickerOpen(true)}>
            <Ionicons name="add" size={16} color={PRIMARY[700]} />
            <Text style={styles.addText}>+ Add Time</Text>
          </Pressable>
        )}
      </View>
      {value.length === 0 && (
        <Text style={styles.emptyNote}>
          No times set. Tap '+ Add Time' to schedule reminders.
        </Text>
      )}
      <Text style={styles.helper}>
        Set when you take this medication. This will be used for medication reminders.
      </Text>
      {!canAdd && (
        <Text style={styles.maxNote}>You've added the max ({max}) times.</Text>
      )}

      {pickerOpen && (
        <DateTimePicker
          mode="time"
          value={pickerDate}
          onChange={(e, d) => {
            if (d) setPickerDate(d);
            handlePicked(e, d);
          }}
          is24Hour
        />
      )}
    </View>
  );
}

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Default times for a given frequency. Matches the web app's mapping so the
 * UI feels the same. Returns null if the frequency doesn't imply specific
 * times (e.g. "as needed").
 */
export function defaultTimesForFrequency(frequency: string): string[] | null {
  switch (frequency) {
    case 'once_daily':
      return ['08:00'];
    case 'twice_daily':
      return ['08:00', '20:00'];
    case 'three_times_daily':
      return ['08:00', '14:00', '20:00'];
    case 'four_times_daily':
      return ['08:00', '12:00', '16:00', '20:00'];
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: PRIMARY[50],
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: PRIMARY[700],
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    borderStyle: 'dashed',
    backgroundColor: SEMANTIC.surface.default,
  },
  addText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: PRIMARY[700],
  },
  maxNote: {
    marginTop: spacing[1],
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
  },
  counter: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: GRAY[500],
  },
  emptyNote: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
    fontStyle: 'italic',
  },
  helper: {
    marginTop: spacing[1],
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
  },
});

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  helperText?: string;
}

export function BooleanToggle({ label, value, onChange, helperText }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.labelCol}>
          <Text style={styles.label}>{label}</Text>
          {helperText && <Text style={styles.helper}>{helperText}</Text>}
        </View>
        <Pressable
          onPress={() => onChange(!value)}
          style={[styles.toggle, value && styles.toggleOn]}
        >
          <View style={[styles.knob, value && styles.knobOn]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  labelCol: {
    flex: 1,
    paddingRight: spacing[3],
  },
  label: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  helper: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: GRAY[300],
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: PRIMARY[600],
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});

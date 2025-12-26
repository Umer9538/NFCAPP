/**
 * Placeholder Screen Component
 * Template for screens that haven't been implemented yet
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card } from '@/components/ui';
import { containers, text } from '@/constants/styles';
import { spacing } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY, SEMANTIC } from '@/constants/colors';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
}

export default function PlaceholderScreen({
  title,
  description = 'This screen is under development.',
  icon = 'construct-outline',
  actions = [],
}: PlaceholderScreenProps) {
  return (
    <ScrollView contentContainerStyle={containers.scrollContainer}>
      <Card variant="elevated" padding="lg">
        <View style={styles.content}>
          <Ionicons name={icon} size={64} color={PRIMARY[600]} />

          <Text style={[text.h3, styles.title]}>{title}</Text>

          <Text style={[text.body, styles.description]}>{description}</Text>

          {actions.length > 0 && (
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  onPress={action.onPress}
                  style={styles.actionButton}
                >
                  {action.label}
                </Button>
              ))}
            </View>
          )}

          <View style={styles.info}>
            <Text style={[text.bodySmall, styles.infoText]}>
              This is a placeholder screen. The full implementation will be added in
              upcoming development phases.
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  title: {
    marginTop: spacing[4],
    textAlign: 'center',
  },
  description: {
    marginTop: spacing[2],
    textAlign: 'center',
    color: SEMANTIC.text.secondary,
  },
  actions: {
    width: '100%',
    marginTop: spacing[6],
    gap: spacing[2],
  },
  actionButton: {
    width: '100%',
  },
  info: {
    marginTop: spacing[8],
    padding: spacing[4],
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: 8,
  },
  infoText: {
    textAlign: 'center',
    color: SEMANTIC.text.tertiary,
  },
});

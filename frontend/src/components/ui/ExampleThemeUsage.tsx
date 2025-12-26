/**
 * Example Component Demonstrating Theme Usage
 * This shows how to use the MedGuard design system correctly
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { PRIMARY, MEDICAL_COLORS } from '@/constants/colors';
import { spacing, shadows } from '@/theme/theme';
import { cards, buttons, text, badges, containers } from '@/constants/styles';

export function ExampleThemeUsage() {
  return (
    <ScrollView contentContainerStyle={containers.scrollContainer}>
      {/* Typography Examples */}
      <View style={containers.section}>
        <Text style={text.h2}>Typography Scale</Text>
        <Text style={text.h3}>Heading 3</Text>
        <Text style={text.h4}>Heading 4</Text>
        <Text style={text.body}>
          This is body text using the design system typography tokens.
        </Text>
        <Text style={text.bodySmall}>Small body text for captions</Text>
      </View>

      {/* Card Examples */}
      <View style={containers.section}>
        <Text style={text.h3}>Card Styles</Text>

        {/* Basic Card */}
        <View style={[cards.base, { marginBottom: spacing[3] }]}>
          <Text style={text.h6}>Basic Card</Text>
          <Text style={text.bodySmall}>
            Default card with standard elevation
          </Text>
        </View>

        {/* Elevated Card */}
        <View style={[cards.elevated, { marginBottom: spacing[3] }]}>
          <Text style={text.h6}>Elevated Card</Text>
          <Text style={text.bodySmall}>
            Card with higher elevation shadow
          </Text>
        </View>

        {/* Medical Card */}
        <View style={cards.medical}>
          <Text style={text.h6}>Medical Information Card</Text>
          <Text style={text.bodySmall}>
            Card with left border accent for medical data
          </Text>
        </View>
      </View>

      {/* Button Examples */}
      <View style={containers.section}>
        <Text style={text.h3}>Button Styles</Text>

        <Pressable style={[buttons.primary, { marginBottom: spacing[3] }]}>
          <Text style={buttons.primaryText}>Primary Button</Text>
        </Pressable>

        <Pressable style={[buttons.secondary, { marginBottom: spacing[3] }]}>
          <Text style={buttons.secondaryText}>Secondary Button</Text>
        </Pressable>

        <Pressable style={[buttons.outline, { marginBottom: spacing[3] }]}>
          <Text style={buttons.outlineText}>Outline Button</Text>
        </Pressable>

        <Pressable style={buttons.ghost}>
          <Text style={buttons.ghostText}>Ghost Button</Text>
        </Pressable>
      </View>

      {/* Badge Examples */}
      <View style={containers.section}>
        <Text style={text.h3}>Status Badges</Text>

        <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' }}>
          <View style={[badges.base, badges.primary]}>
            <Text style={badges.primaryText}>Primary</Text>
          </View>

          <View style={[badges.base, badges.success]}>
            <Text style={badges.successText}>Success</Text>
          </View>

          <View style={[badges.base, badges.warning]}>
            <Text style={badges.warningText}>Warning</Text>
          </View>

          <View style={[badges.base, badges.error]}>
            <Text style={badges.errorText}>Error</Text>
          </View>
        </View>
      </View>

      {/* Medical Category Colors */}
      <View style={containers.section}>
        <Text style={text.h3}>Medical Category Colors</Text>

        <View
          style={{
            backgroundColor: MEDICAL_COLORS.red.light,
            padding: spacing[3],
            borderRadius: 8,
            marginBottom: spacing[2],
          }}
        >
          <Text style={{ color: MEDICAL_COLORS.red.text, fontWeight: '600' }}>
            Blood Type / Critical
          </Text>
        </View>

        <View
          style={{
            backgroundColor: MEDICAL_COLORS.blue.light,
            padding: spacing[3],
            borderRadius: 8,
            marginBottom: spacing[2],
          }}
        >
          <Text style={{ color: MEDICAL_COLORS.blue.text, fontWeight: '600' }}>
            Medications
          </Text>
        </View>

        <View
          style={{
            backgroundColor: MEDICAL_COLORS.yellow.light,
            padding: spacing[3],
            borderRadius: 8,
            marginBottom: spacing[2],
          }}
        >
          <Text style={{ color: MEDICAL_COLORS.yellow.text, fontWeight: '600' }}>
            Allergies / Warnings
          </Text>
        </View>

        <View
          style={{
            backgroundColor: MEDICAL_COLORS.purple.light,
            padding: spacing[3],
            borderRadius: 8,
            marginBottom: spacing[2],
          }}
        >
          <Text style={{ color: MEDICAL_COLORS.purple.text, fontWeight: '600' }}>
            Conditions
          </Text>
        </View>

        <View
          style={{
            backgroundColor: MEDICAL_COLORS.green.light,
            padding: spacing[3],
            borderRadius: 8,
          }}
        >
          <Text style={{ color: MEDICAL_COLORS.green.text, fontWeight: '600' }}>
            Emergency Contacts
          </Text>
        </View>
      </View>

      {/* Custom Styled Card */}
      <View style={containers.section}>
        <Text style={text.h3}>Custom Composition</Text>

        <View
          style={{
            backgroundColor: PRIMARY[50],
            borderLeftWidth: 4,
            borderLeftColor: PRIMARY[600],
            borderRadius: 8,
            padding: spacing[4],
            ...shadows.sm,
          }}
        >
          <Text style={[text.h6, { color: PRIMARY[900] }]}>
            Emergency Alert
          </Text>
          <Text style={[text.bodySmall, { color: PRIMARY[700], marginTop: spacing[1] }]}>
            This demonstrates combining theme tokens for custom designs
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

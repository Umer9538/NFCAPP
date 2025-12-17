/**
 * Onboarding Navigator
 * Stack navigator for onboarding flow
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { OnboardingStackParamList } from './types';
import {
  WelcomeScreen,
  FeaturesScreen,
  ProfileSetupScreen,
  CompleteScreen,
} from '@/screens/onboarding';

const Stack = createStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
        presentation: 'card',
      }}
    >
      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingFeatures" component={FeaturesScreen} />
      <Stack.Screen name="OnboardingProfile" component={ProfileSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}

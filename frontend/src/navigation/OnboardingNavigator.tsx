/**
 * Onboarding Navigator
 * Stack navigator for onboarding flow
 * Uses single OnboardingScreen with swipeable slides for main flow
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { OnboardingStackParamList } from './types';
import {
  OnboardingScreen,
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
      {/* Main onboarding flow with swipeable slides */}
      <Stack.Screen name="OnboardingWelcome" component={OnboardingScreen} />
      {/* Legacy screens kept for backwards compatibility */}
      <Stack.Screen name="OnboardingFeatures" component={FeaturesScreen} />
      <Stack.Screen name="OnboardingProfile" component={ProfileSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}

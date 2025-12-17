/**
 * Root Navigator
 * Conditional rendering based on authentication and onboarding state
 */

import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { LoadingSpinner } from '@/components/ui';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/store/authStore';
import { linking } from './linking';

const Stack = createStackNavigator<RootStackParamList>();
const ONBOARDING_KEY = '@medguard_onboarding_completed';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    const onboardingStatus = await AsyncStorage.getItem(ONBOARDING_KEY);
    setOnboardingComplete(onboardingStatus === 'true');
  }, []);

  // Check authentication and onboarding status on mount
  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      await checkOnboardingStatus();
    };

    initialize();
  }, [checkAuth, checkOnboardingStatus]);

  // Re-check onboarding status when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated, checkOnboardingStatus]);

  // Show loading screen while checking auth and onboarding
  if (isLoading || onboardingComplete === null) {
    return <LoadingSpinner visible text="Loading MedGuard..." />;
  }

  return (
    <NavigationContainer
      linking={linking}
      onStateChange={async () => {
        // Re-check onboarding status when navigation state changes
        await checkOnboardingStatus();
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {!isAuthenticated ? (
          // Unauthenticated user sees auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !onboardingComplete ? (
          // First-time authenticated user sees onboarding
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Returning authenticated user sees app screens
          <Stack.Screen name="Main" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

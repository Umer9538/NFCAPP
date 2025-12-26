/**
 * Root Navigator
 * Conditional rendering based on authentication and onboarding state
 * Shows splash screen on app launch before navigating to appropriate flow
 */

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { OnboardingScreen } from '@/screens/onboarding';
import AppSplashScreen from '@/screens/SplashScreen';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/store/authStore';
import { linking } from './linking';

const Stack = createStackNavigator<RootStackParamList>();
const ONBOARDING_KEY = '@medguard_onboarding_completed';

// Context for onboarding completion
interface OnboardingContextType {
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  completeOnboarding: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [splashComplete, setSplashComplete] = useState(false);
  const [splashMinTimePassed, setSplashMinTimePassed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
      setIsInitialized(true);
    };

    initialize();
  }, [checkAuth, checkOnboardingStatus]);

  // Re-check onboarding status when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated, checkOnboardingStatus]);

  // Handle splash screen minimum time completion
  const handleSplashReady = useCallback(() => {
    setSplashMinTimePassed(true);
  }, []);

  // Complete splash when both minimum time passed AND initialization is done
  useEffect(() => {
    if (splashMinTimePassed && isInitialized && !isLoading && onboardingComplete !== null) {
      setSplashComplete(true);
    }
  }, [splashMinTimePassed, isInitialized, isLoading, onboardingComplete]);

  // Handle onboarding completion
  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  // Show splash screen on initial launch
  if (!splashComplete) {
    return <AppSplashScreen onReady={handleSplashReady} />;
  }

  // Show onboarding for first-time users (before NavigationContainer to avoid nesting issues)
  if (!onboardingComplete) {
    return (
      <OnboardingContext.Provider value={{ completeOnboarding }}>
        <OnboardingScreen onComplete={completeOnboarding} />
      </OnboardingContext.Provider>
    );
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
        ) : (
          // Authenticated user sees app screens
          <Stack.Screen name="Main" component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

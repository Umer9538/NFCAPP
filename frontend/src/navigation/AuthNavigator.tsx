/**
 * Auth Navigator
 * Stack navigator for authentication screens
 */

import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { typography } from '@/theme/theme';

// Import auth screens
import LoginScreen from '@/screens/auth/LoginScreen';
import AccountTypeScreen from '@/screens/auth/AccountTypeScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from '@/screens/auth/VerifyEmailScreen';
import TwoFactorAuthScreen from '@/screens/auth/TwoFactorAuthScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: SEMANTIC.background.default,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: SEMANTIC.border.light,
        },
        headerTintColor: PRIMARY[600],
        headerTitleStyle: {
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.lg,
          color: SEMANTIC.text.primary,
        },
        headerBackTitleVisible: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
          title: 'Login',
        }}
      />

      <Stack.Screen
        name="AccountType"
        component={AccountTypeScreen}
        options={{
          headerShown: false,
          title: 'Choose Account Type',
        }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Create Account',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{
          title: 'Verify Email',
          headerShown: true,
          headerLeft: () => null, // Prevent going back
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="TwoFactorAuth"
        component={TwoFactorAuthScreen}
        options={{
          title: 'Two-Factor Authentication',
          headerShown: true,
          headerLeft: () => null, // Prevent going back
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

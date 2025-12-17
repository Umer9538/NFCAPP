/**
 * Navigation Types
 * TypeScript definitions for all navigators
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Onboarding Stack Param List
 */
export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingFeatures: undefined;
  OnboardingProfile: undefined;
  OnboardingComplete: undefined;
};

/**
 * Auth Stack Param List
 */
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
  TwoFactorAuth: { email: string; tempToken: string };
};

/**
 * Dashboard Tab Param List
 */
export type DashboardTabParamList = {
  Home: undefined;
  Profile: undefined;
  Bracelet: undefined;
  Settings: undefined;
};

/**
 * App Stack Param List
 */
export type AppStackParamList = {
  Dashboard: NavigatorScreenParams<DashboardTabParamList>;

  // Emergency Profile
  EmergencyProfile: undefined;
  EditEmergencyProfile: { profileId?: string };
  ViewEmergencyProfile: { profileId: string; readonly?: boolean };

  // Medical Information
  MedicalConditions: undefined;
  AddMedicalCondition: { conditionId?: string };
  Medications: undefined;
  AddMedication: { medicationId?: string };
  Allergies: undefined;
  AddAllergy: { allergyId?: string };

  // Emergency Contacts
  EmergencyContacts: undefined;
  AddEmergencyContact: { contactId?: string };

  // NFC & QR
  NFCScanner: undefined;
  NFCRegister: undefined;
  NFCTagDetails: { tagId: string };
  QRCodeScanner: undefined;
  QRCodeGenerator: { profileId: string };

  // Account & Settings
  AccountSettings: undefined;
  EditProfile: undefined;
  SecuritySettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  ChangePassword: undefined;
  Enable2FA: undefined;

  // Audit & Logs
  AuditLogs: undefined;
  ScanHistory: undefined;

  // Subscription
  Subscription: undefined;
  BillingHistory: undefined;

  // Support
  Help: undefined;
  About: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

/**
 * Root Stack Param List
 */
export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<AppStackParamList>;

  // Global modals (accessible from anywhere)
  EmergencyViewModal: { profileId: string };
  ScanSuccessModal: { profileId: string; scanType: 'nfc' | 'qr' };
};

/**
 * Navigation prop types for screens
 */
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Onboarding Navigator Props
export type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList>;
export type OnboardingRouteProp<T extends keyof OnboardingStackParamList> = RouteProp<
  OnboardingStackParamList,
  T
>;

// Auth Navigator Props
export type AuthScreenNavigationProp = StackNavigationProp<AuthStackParamList>;
export type AuthScreenRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;

// Dashboard Tab Props
export type DashboardTabNavigationProp = BottomTabNavigationProp<DashboardTabParamList>;
export type DashboardTabRouteProp<T extends keyof DashboardTabParamList> = RouteProp<
  DashboardTabParamList,
  T
>;

// App Navigator Props
export type AppScreenNavigationProp = StackNavigationProp<AppStackParamList>;
export type AppScreenRouteProp<T extends keyof AppStackParamList> = RouteProp<
  AppStackParamList,
  T
>;

// Root Navigator Props
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

// Composite props for nested navigators
export type DashboardScreenNavigationProp = CompositeNavigationProp<
  DashboardTabNavigationProp,
  AppScreenNavigationProp
>;

/**
 * Screen props helper types
 */
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: AuthScreenNavigationProp;
  route: AuthScreenRouteProp<T>;
};

export type DashboardScreenProps<T extends keyof DashboardTabParamList> = {
  navigation: DashboardScreenNavigationProp;
  route: DashboardTabRouteProp<T>;
};

export type AppScreenProps<T extends keyof AppStackParamList> = {
  navigation: AppScreenNavigationProp;
  route: AppScreenRouteProp<T>;
};

/**
 * Deep linking configuration types
 */
export type DeepLinkConfig = {
  screens: {
    Auth: {
      screens: {
        Login: string;
        Signup: string;
        ForgotPassword: string;
        ResetPassword: string;
        VerifyEmail: string;
      };
    };
    App: {
      screens: {
        Dashboard: {
          screens: {
            Home: string;
            Profile: string;
            Bracelet: string;
            Settings: string;
          };
        };
        EmergencyProfile: string;
        ViewEmergencyProfile: string;
        AuditLogs: string;
      };
    };
    EmergencyViewModal: string;
  };
};

// Declare global types for TypeScript navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

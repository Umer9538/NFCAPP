/**
 * App Navigator
 * Stack navigator for authenticated app screens
 */

import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { AppStackParamList } from './types';
import DashboardNavigator from './DashboardNavigator';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { typography } from '@/theme/theme';

// Import app screens (placeholders for now)
// Emergency Profile
import EmergencyProfileScreen from '@/screens/emergency/EmergencyProfileScreen';
import EditEmergencyProfileScreen from '@/screens/emergency/EditEmergencyProfileScreen';
import ViewEmergencyProfileScreen from '@/screens/emergency/ViewEmergencyProfileScreen';

// Medical Information
import MedicalConditionsScreen from '@/screens/medical/MedicalConditionsScreen';
import AddMedicalConditionScreen from '@/screens/medical/AddMedicalConditionScreen';
import MedicationsScreen from '@/screens/medical/MedicationsScreen';
import AddMedicationScreen from '@/screens/medical/AddMedicationScreen';
import AllergiesScreen from '@/screens/medical/AllergiesScreen';
import AddAllergyScreen from '@/screens/medical/AddAllergyScreen';

// Emergency Contacts
import EmergencyContactsScreen from '@/screens/contacts/EmergencyContactsScreen';
import AddEmergencyContactScreen from '@/screens/contacts/AddEmergencyContactScreen';

// NFC & QR
import { NFCScanScreen } from '@/screens/dashboard/NFCScanScreen';
import NFCRegisterScreen from '@/screens/nfc/NFCRegisterScreen';
import NFCTagDetailsScreen from '@/screens/nfc/NFCTagDetailsScreen';
import QRScannerScreen from '@/screens/dashboard/QRScannerScreen';
import { QRCodeScreen } from '@/screens/dashboard/QRCodeScreen';

// Account & Settings
import AccountSettingsScreen from '@/screens/settings/AccountSettingsScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import SecuritySettingsScreen from '@/screens/settings/SecuritySettingsScreen';
import NotificationSettingsScreen from '@/screens/settings/NotificationSettingsScreen';
import PrivacySettingsScreen from '@/screens/settings/PrivacySettingsScreen';
import ChangePasswordScreen from '@/screens/settings/ChangePasswordScreen';
import Enable2FAScreen from '@/screens/settings/Enable2FAScreen';

// Audit & Logs
import AuditLogsScreen from '@/screens/audit/AuditLogsScreen';
import ScanHistoryScreen from '@/screens/audit/ScanHistoryScreen';

// Subscription
import SubscriptionScreen from '@/screens/subscription/SubscriptionScreen';
import BillingHistoryScreen from '@/screens/subscription/BillingHistoryScreen';

// Support
import HelpScreen from '@/screens/support/HelpScreen';
import AboutScreen from '@/screens/support/AboutScreen';
import TermsOfServiceScreen from '@/screens/support/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@/screens/support/PrivacyPolicyScreen';

const Stack = createStackNavigator<AppStackParamList>();

export default function AppNavigator() {
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
      {/* Main Dashboard (Bottom Tabs) */}
      <Stack.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Emergency Profile Screens */}
      <Stack.Screen
        name="EmergencyProfile"
        component={EmergencyProfileScreen}
        options={{
          title: 'Emergency Profile',
        }}
      />

      <Stack.Screen
        name="EditEmergencyProfile"
        component={EditEmergencyProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />

      <Stack.Screen
        name="ViewEmergencyProfile"
        component={ViewEmergencyProfileScreen}
        options={{
          title: 'Emergency Information',
          // Modal presentation for emergency view
          presentation: 'modal',
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />

      {/* Medical Information Screens */}
      <Stack.Screen
        name="MedicalConditions"
        component={MedicalConditionsScreen}
        options={{
          title: 'Medical Conditions',
        }}
      />

      <Stack.Screen
        name="AddMedicalCondition"
        component={AddMedicalConditionScreen}
        options={{
          title: 'Add Condition',
        }}
      />

      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: 'Medications',
        }}
      />

      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{
          title: 'Add Medication',
        }}
      />

      <Stack.Screen
        name="Allergies"
        component={AllergiesScreen}
        options={{
          title: 'Allergies',
        }}
      />

      <Stack.Screen
        name="AddAllergy"
        component={AddAllergyScreen}
        options={{
          title: 'Add Allergy',
        }}
      />

      {/* Emergency Contacts Screens */}
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
        }}
      />

      <Stack.Screen
        name="AddEmergencyContact"
        component={AddEmergencyContactScreen}
        options={{
          title: 'Add Contact',
        }}
      />

      {/* NFC & QR Screens */}
      <Stack.Screen
        name="NFCScanner"
        component={NFCScanScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="NFCRegister"
        component={NFCRegisterScreen}
        options={{
          title: 'Register NFC Tag',
        }}
      />

      <Stack.Screen
        name="NFCTagDetails"
        component={NFCTagDetailsScreen}
        options={{
          title: 'NFC Tag Details',
        }}
      />

      <Stack.Screen
        name="QRCodeScanner"
        component={QRScannerScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="QRCodeGenerator"
        component={QRCodeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Account & Settings Screens */}
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          title: 'Account Settings',
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{
          title: 'Security & Privacy',
        }}
      />

      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: 'Notifications',
        }}
      />

      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{
          title: 'Privacy Settings',
        }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
        }}
      />

      <Stack.Screen
        name="Enable2FA"
        component={Enable2FAScreen}
        options={{
          title: 'Two-Factor Authentication',
        }}
      />

      {/* Audit & Logs Screens */}
      <Stack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{
          title: 'Audit Logs',
        }}
      />

      <Stack.Screen
        name="ScanHistory"
        component={ScanHistoryScreen}
        options={{
          title: 'Scan History',
        }}
      />

      {/* Subscription Screens */}
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'Subscription',
        }}
      />

      <Stack.Screen
        name="BillingHistory"
        component={BillingHistoryScreen}
        options={{
          title: 'Billing History',
        }}
      />

      {/* Support Screens */}
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Help & Support',
        }}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About MedGuard',
        }}
      />

      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Terms of Service',
        }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
        }}
      />
    </Stack.Navigator>
  );
}

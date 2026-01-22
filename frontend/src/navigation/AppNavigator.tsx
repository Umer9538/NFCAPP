/**
 * App Navigator
 * Stack navigator for authenticated app screens
 * Supports conditional navigation based on account type
 */

import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { AppStackParamList } from './types';
import DashboardNavigator from './DashboardNavigator';
import OrganizationNavigator from './OrganizationNavigator';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { typography } from '@/theme/theme';
import { useAuthStore } from '@/store/authStore';
import { isOrganizationAccount } from '@/config/dashboardConfig';

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
import BraceletScreen from '@/screens/dashboard/BraceletScreen';

// Account & Settings
import AccountSettingsScreen from '@/screens/settings/AccountSettingsScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import SecuritySettingsScreen from '@/screens/settings/SecuritySettingsScreen';
import NotificationSettingsScreen from '@/screens/settings/NotificationSettingsScreen';
import HealthRemindersScreen from '@/screens/settings/HealthRemindersScreen';
import PrivacySettingsScreen from '@/screens/settings/PrivacySettingsScreen';
import ChangePasswordScreen from '@/screens/settings/ChangePasswordScreen';
import Enable2FAScreen from '@/screens/settings/Enable2FAScreen';

// Notifications
import NotificationsScreen from '@/screens/dashboard/NotificationsScreen';

// Audit & Logs
import AuditLogsScreen from '@/screens/audit/AuditLogsScreen';
import ScanHistoryScreen from '@/screens/audit/ScanHistoryScreen';

// Subscription
import SubscriptionScreen from '@/screens/subscription/SubscriptionScreen';
import BillingHistoryScreen from '@/screens/subscription/BillingHistoryScreen';

// Support
import HelpScreen from '@/screens/support/HelpScreen';
import FAQScreen from '@/screens/support/FAQScreen';
import AboutScreen from '@/screens/support/AboutScreen';
import TermsOfServiceScreen from '@/screens/support/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@/screens/support/PrivacyPolicyScreen';

// Organization Management
import {
  SetupOrganizationScreen,
  EmployeesScreen,
  AddEmployeeScreen,
  EmployeeDetailsScreen,
  OrganizationMedicalInfoScreen,
  IncidentReportsScreen,
  CreateIncidentReportScreen,
  IncidentReportDetailsScreen,
  EditIncidentReportScreen,
  TeachersScreen,
  ParentsScreen,
  EmergencyNotificationsScreen,
  StudentsScreen,
  TrainingRecordsScreen,
  OSHAComplianceScreen,
} from '@/screens/organization';

// Location
import { LocationSharingScreen } from '@/screens/location';

// Settings (for More screen navigation)
import SettingsScreen from '@/screens/settings/SettingsScreen';

const Stack = createStackNavigator<AppStackParamList>();

/**
 * Conditional Dashboard Component
 * Shows different navigators based on account type and organization setup status
 * Uses key prop to force re-render when accountType changes
 */
function ConditionalDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accountType = useAuthStore((state) => state.accountType);
  const organizationId = useAuthStore((state) => state.organizationId);
  const user = useAuthStore((state) => state.user);

  // Early return if not authenticated (prevents render during logout transition)
  if (!isAuthenticated || !user) {
    console.log('🧭 ConditionalDashboard: Not authenticated, returning null');
    return null;
  }

  // Check if user is an organization account type
  // Priority: user.accountType > store.accountType
  const effectiveAccountType = user?.accountType || accountType;
  const isOrgUser = effectiveAccountType && isOrganizationAccount(effectiveAccountType);

  console.log('🧭 ConditionalDashboard:', {
    storeAccountType: accountType,
    userAccountType: user?.accountType,
    effectiveAccountType,
    organizationId,
    isOrgUser,
    userRole: user?.role
  });

  // Show OrganizationNavigator for org users, DashboardNavigator for individuals
  if (isOrgUser) {
    console.log('🏢 Showing OrganizationNavigator for:', effectiveAccountType);
    return <OrganizationNavigator key={`org-${effectiveAccountType}`} />;
  }

  console.log('👤 Showing DashboardNavigator (Individual)');
  return <DashboardNavigator key="individual" />;
}

export default function AppNavigator() {
  const accountType = useAuthStore((state) => state.accountType);
  const organizationId = useAuthStore((state) => state.organizationId);
  const user = useAuthStore((state) => state.user);

  // Use effective account type (prioritize user data)
  const effectiveAccountType = user?.accountType || accountType;

  // Check if org user needs to set up organization
  const isOrgUser = effectiveAccountType && isOrganizationAccount(effectiveAccountType);
  const needsOrgSetup = isOrgUser && !organizationId;

  return (
    <Stack.Navigator
      initialRouteName={needsOrgSetup ? 'SetupOrganization' : 'Dashboard'}
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
        component={ConditionalDashboard}
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
        name="Bracelet"
        component={BraceletScreen}
        options={{
          title: 'Manage Bracelet',
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
          headerShown: false,
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
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="HealthReminders"
        component={HealthRemindersScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Enable2FA"
        component={Enable2FAScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Notifications Screen */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Audit & Logs Screens */}
      <Stack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ScanHistory"
        component={ScanHistoryScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Subscription Screens */}
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="BillingHistory"
        component={BillingHistoryScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Support Screens */}
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Organization Management Screens */}
      <Stack.Screen
        name="SetupOrganization"
        component={SetupOrganizationScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during setup
        }}
      />

      <Stack.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="EmployeeDetails"
        component={EmployeeDetailsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MedicalRecords"
        component={OrganizationMedicalInfoScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="IncidentReports"
        component={IncidentReportsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CreateIncidentReport"
        component={CreateIncidentReportScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="IncidentReportDetails"
        component={IncidentReportDetailsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="EditIncidentReport"
        component={EditIncidentReportScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Education Screens (accessible from More menu) */}
      <Stack.Screen
        name="MedicalInfo"
        component={OrganizationMedicalInfoScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Teachers"
        component={TeachersScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Parents"
        component={ParentsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmergencyNotifications"
        component={EmergencyNotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Location"
        component={LocationSharingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Construction Screens */}
      <Stack.Screen
        name="TrainingRecords"
        component={TrainingRecordsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OSHACompliance"
        component={OSHAComplianceScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Deep Linking Configuration
 * Configure URL schemes and deep links
 */

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['medguard://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Signup: 'signup',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
          VerifyEmail: 'verify-email/:email',
          TwoFactorAuth: '2fa',
        },
      },
      App: {
        screens: {
          Dashboard: {
            screens: {
              Home: 'dashboard',
              Profile: 'profile',
              Bracelet: 'bracelet',
              Settings: 'settings',
            },
          },

          // Emergency Profile
          EmergencyProfile: 'emergency-profile',
          EditEmergencyProfile: 'emergency-profile/edit',
          ViewEmergencyProfile: 'emergency/:profileId',

          // Medical Information
          MedicalConditions: 'medical/conditions',
          AddMedicalCondition: 'medical/conditions/add',
          Medications: 'medical/medications',
          AddMedication: 'medical/medications/add',
          Allergies: 'medical/allergies',
          AddAllergy: 'medical/allergies/add',

          // Emergency Contacts
          EmergencyContacts: 'contacts',
          AddEmergencyContact: 'contacts/add',

          // NFC & QR
          NFCScanner: 'nfc/scan',
          NFCRegister: 'nfc/register',
          NFCTagDetails: 'nfc/:tagId',
          QRCodeScanner: 'qr/scan',
          QRCodeGenerator: 'qr/:profileId',

          // Account & Settings
          AccountSettings: 'settings/account',
          SecuritySettings: 'settings/security',
          NotificationSettings: 'settings/notifications',
          PrivacySettings: 'settings/privacy',
          ChangePassword: 'settings/change-password',
          Enable2FA: 'settings/2fa',

          // Audit & Logs
          AuditLogs: 'audit-logs',
          ScanHistory: 'scan-history',

          // Subscription
          Subscription: 'subscription',
          BillingHistory: 'billing-history',

          // Support
          Help: 'help',
          About: 'about',
          TermsOfService: 'terms',
          PrivacyPolicy: 'privacy',
        },
      },

      // Global modals
      EmergencyViewModal: 'emergency-view/:profileId',
      ScanSuccessModal: 'scan-success/:profileId',
    },
  },
};

/**
 * Get deep link URL for a screen
 */
export function getDeepLink(path: string): string {
  return `medguard://${path}`;
}

/**
 * Common deep link helpers
 */
export const deepLinks = {
  // Auth
  login: () => getDeepLink('login'),
  signup: () => getDeepLink('signup'),
  resetPassword: (token: string) => getDeepLink(`reset-password/${token}`),
  verifyEmail: (email: string) => getDeepLink(`verify-email/${email}`),

  // Emergency
  viewEmergency: (profileId: string) => getDeepLink(`emergency/${profileId}`),
  editProfile: () => getDeepLink('emergency-profile/edit'),

  // Medical
  addMedication: () => getDeepLink('medical/medications/add'),
  addAllergy: () => getDeepLink('medical/allergies/add'),
  addCondition: () => getDeepLink('medical/conditions/add'),

  // NFC & QR
  scanNFC: () => getDeepLink('nfc/scan'),
  scanQR: () => getDeepLink('qr/scan'),
  viewNFCTag: (tagId: string) => getDeepLink(`nfc/${tagId}`),

  // Dashboard
  dashboard: () => getDeepLink('dashboard'),
  profile: () => getDeepLink('profile'),
  settings: () => getDeepLink('settings'),
};

// Screen generation helper - run this once to create all screens
// This file won't be included in the final app

const fs = require('fs');
const path = require('path');

const screens = {
  dashboard: [
    { name: 'HomeScreen', icon: 'home-outline' },
    { name: 'ProfileScreen', icon: 'medical-outline' },
    { name: 'BraceletScreen', icon: 'watch-outline' },
    { name: 'SettingsScreen', icon: 'settings-outline' },
  ],
  emergency: [
    { name: 'EmergencyProfileScreen', icon: 'medical-outline' },
    { name: 'EditEmergencyProfileScreen', icon: 'create-outline' },
    { name: 'ViewEmergencyProfileScreen', icon: 'eye-outline' },
  ],
  medical: [
    { name: 'MedicalConditionsScreen', icon: 'fitness-outline' },
    { name: 'AddMedicalConditionScreen', icon: 'add-circle-outline' },
    { name: 'MedicationsScreen', icon: 'medical-outline' },
    { name: 'AddMedicationScreen', icon: 'add-circle-outline' },
    { name: 'AllergiesScreen', icon: 'warning-outline' },
    { name: 'AddAllergyScreen', icon: 'add-circle-outline' },
  ],
  contacts: [
    { name: 'EmergencyContactsScreen', icon: 'people-outline' },
    { name: 'AddEmergencyContactScreen', icon: 'person-add-outline' },
  ],
  nfc: [
    { name: 'NFCScannerScreen', icon: 'scan-outline' },
    { name: 'NFCRegisterScreen', icon: 'save-outline' },
    { name: 'NFCTagDetailsScreen', icon: 'information-circle-outline' },
  ],
  qr: [
    { name: 'QRCodeScannerScreen', icon: 'qr-code-outline' },
    { name: 'QRCodeGeneratorScreen', icon: 'qr-code-outline' },
  ],
  settings: [
    { name: 'AccountSettingsScreen', icon: 'person-circle-outline' },
    { name: 'SecuritySettingsScreen', icon: 'shield-checkmark-outline' },
    { name: 'NotificationSettingsScreen', icon: 'notifications-outline' },
    { name: 'PrivacySettingsScreen', icon: 'lock-closed-outline' },
    { name: 'ChangePasswordScreen', icon: 'key-outline' },
    { name: 'Enable2FAScreen', icon: 'shield-outline' },
  ],
  audit: [
    { name: 'AuditLogsScreen', icon: 'list-outline' },
    { name: 'ScanHistoryScreen', icon: 'time-outline' },
  ],
  subscription: [
    { name: 'SubscriptionScreen', icon: 'card-outline' },
    { name: 'BillingHistoryScreen', icon: 'receipt-outline' },
  ],
  support: [
    { name: 'HelpScreen', icon: 'help-circle-outline' },
    { name: 'AboutScreen', icon: 'information-outline' },
    { name: 'TermsOfServiceScreen', icon: 'document-text-outline' },
    { name: 'PrivacyPolicyScreen', icon: 'shield-outline' },
  ],
};

const template = (name: string, icon: string) => `import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}() {
  return <PlaceholderScreen title="${name.replace('Screen', '').replace(/([A-Z])/g, ' $1').trim()}" icon="${icon}" />;
}
`;

Object.entries(screens).forEach(([folder, screenList]) => {
  screenList.forEach(({ name, icon }) => {
    const filePath = path.join(__dirname, folder, `${name}.tsx`);
    fs.writeFileSync(filePath, template(name, icon));
    console.log(`Created ${filePath}`);
  });
});

console.log('All screens generated!');

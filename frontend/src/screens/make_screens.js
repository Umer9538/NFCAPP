const fs = require('fs');

const screens = [
  ['contacts/EmergencyContactsScreen.tsx', 'people-outline'],
  ['contacts/AddEmergencyContactScreen.tsx', 'person-add-outline'],
  ['nfc/NFCScannerScreen.tsx', 'scan-outline'],
  ['nfc/NFCRegisterScreen.tsx', 'save-outline'],
  ['nfc/NFCTagDetailsScreen.tsx', 'information-circle-outline'],
  ['qr/QRCodeScannerScreen.tsx', 'qr-code-outline'],
  ['qr/QRCodeGeneratorScreen.tsx', 'qr-code-outline'],
  ['settings/AccountSettingsScreen.tsx', 'person-circle-outline'],
  ['settings/SecuritySettingsScreen.tsx', 'shield-checkmark-outline'],
  ['settings/NotificationSettingsScreen.tsx', 'notifications-outline'],
  ['settings/PrivacySettingsScreen.tsx', 'lock-closed-outline'],
  ['settings/ChangePasswordScreen.tsx', 'key-outline'],
  ['settings/Enable2FAScreen.tsx', 'shield-outline'],
  ['audit/AuditLogsScreen.tsx', 'list-outline'],
  ['audit/ScanHistoryScreen.tsx', 'time-outline'],
  ['subscription/SubscriptionScreen.tsx', 'card-outline'],
  ['subscription/BillingHistoryScreen.tsx', 'receipt-outline'],
  ['support/HelpScreen.tsx', 'help-circle-outline'],
  ['support/AboutScreen.tsx', 'information-outline'],
  ['support/TermsOfServiceScreen.tsx', 'document-text-outline'],
  ['support/PrivacyPolicyScreen.tsx', 'shield-outline'],
];

screens.forEach(([file, icon]) => {
  const name = file.split('/')[1].replace('.tsx', '');
  const title = name.replace('Screen', '').replace(/([A-Z])/g, ' $1').trim();
  const content = `import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}() {
  return <PlaceholderScreen title="${title}" icon="${icon}" />;
}
`;
  fs.writeFileSync(file, content);
  console.log(`Created ${file}`);
});

console.log('Done!');

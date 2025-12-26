#!/bin/bash

# Dashboard screens
for screen in "Home:home-outline" "Profile:medical-outline" "Bracelet:watch-outline" "Settings:settings-outline"; do
  IFS=':' read -r name icon <<< "$screen"
  cat > "src/screens/dashboard/${name}Screen.tsx" << SCREEN
import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}Screen() {
  return <PlaceholderScreen title="${name}" icon="${icon}" />;
}
SCREEN
done

# Emergency screens  
for screen in "EmergencyProfile:medical-outline" "EditEmergencyProfile:create-outline" "ViewEmergencyProfile:eye-outline"; do
  IFS=':' read -r name icon <<< "$screen"
  cat > "src/screens/emergency/${name}Screen.tsx" << SCREEN
import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}Screen() {
  return <PlaceholderScreen title="${name//Emergency/}" icon="${icon}" />;
}
SCREEN
done

# Medical screens
for screen in "MedicalConditions:fitness-outline" "AddMedicalCondition:add-circle-outline" "Medications:medical-outline" "AddMedication:add-circle-outline" "Allergies:warning-outline" "AddAllergy:add-circle-outline"; do
  IFS=':' read -r name icon <<< "$screen"
  cat > "src/screens/medical/${name}Screen.tsx" << SCREEN
import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}Screen() {
  return <PlaceholderScreen title="${name//Add/Add }" icon="${icon}" />;
}
SCREEN
done

# Create remaining screens with simple loop
declare -A remaining=(
  ["contacts/EmergencyContacts"]="people-outline"
  ["contacts/AddEmergencyContact"]="person-add-outline"
  ["nfc/NFCScanner"]="scan-outline"
  ["nfc/NFCRegister"]="save-outline"
  ["nfc/NFCTagDetails"]="information-circle-outline"
  ["qr/QRCodeScanner"]="qr-code-outline"
  ["qr/QRCodeGenerator"]="qr-code-outline"
  ["settings/AccountSettings"]="person-circle-outline"
  ["settings/SecuritySettings"]="shield-checkmark-outline"
  ["settings/NotificationSettings"]="notifications-outline"
  ["settings/PrivacySettings"]="lock-closed-outline"
  ["settings/ChangePassword"]="key-outline"
  ["settings/Enable2FA"]="shield-outline"
  ["audit/AuditLogs"]="list-outline"
  ["audit/ScanHistory"]="time-outline"
  ["subscription/Subscription"]="card-outline"
  ["subscription/BillingHistory"]="receipt-outline"
  ["support/Help"]="help-circle-outline"
  ["support/About"]="information-outline"
  ["support/TermsOfService"]="document-text-outline"
  ["support/PrivacyPolicy"]="shield-outline"
)

for key in "${!remaining[@]}"; do
  icon="${remaining[$key]}"
  name=$(basename "$key")
  cat > "src/screens/${key}Screen.tsx" << SCREEN
import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}Screen() {
  return <PlaceholderScreen title="${name}" icon="${icon}" />;
}
SCREEN
done

echo "All screens created!"

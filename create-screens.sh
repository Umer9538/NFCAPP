#!/bin/bash

# Create Login Screen
cat > src/screens/auth/LoginScreen.tsx << 'EOF'
import React from 'react';
import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Screen</Text>
    </View>
  );
}
EOF

# Create other auth screens using PlaceholderScreen
for screen in "Signup:person-add-outline" "ForgotPassword:key-outline" "ResetPassword:lock-closed-outline" "VerifyEmail:mail-outline" "TwoFactorAuth:shield-checkmark-outline"; do
  IFS=':' read -r name icon <<< "$screen"
  cat > "src/screens/auth/${name}Screen.tsx" << EOF
import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';

export default function ${name}Screen() {
  return <PlaceholderScreen title="${name}" icon="${icon}" />;
}
EOF
done

echo "Auth screens created"

# MedGuard Mobile - Project Setup

## Project Overview
MedGuard Mobile is a React Native Expo application for managing medical emergency profiles with NFC tag integration.

## Technology Stack

### Core
- **React Native** (0.81.5)
- **Expo** (~54.0.23)
- **TypeScript** (~5.9.2)

### Navigation
- @react-navigation/native (^7.1.19)
- @react-navigation/stack (^7.6.3)
- @react-navigation/bottom-tabs (^7.8.4)

### State Management & Data
- **Zustand** (^5.0.8) - Global state management
- **@tanstack/react-query** (^5.90.8) - Server state management
- **@react-native-async-storage/async-storage** (^2.2.0) - Local storage

### Forms & Validation
- **react-hook-form** (^7.66.0)
- **zod** (^3.25.76)

### API & Networking
- **axios** (^1.13.2)

### Hardware Integration
- **react-native-nfc-manager** (^3.17.1) - NFC reading
- **expo-camera** (^17.0.9) - QR code scanning
- **expo-barcode-scanner** (^13.0.1)
- **expo-local-authentication** (^17.0.7) - Biometric auth

### UI Components
- **react-native-paper** (^5.14.5)
- **@expo/vector-icons** (^15.0.3)

### Utilities
- **date-fns** (^4.1.0)

## Project Structure

```
NFCApp/
├── src/
│   ├── api/              # API client configuration and endpoints
│   ├── components/
│   │   ├── ui/          # Basic reusable UI components
│   │   └── shared/      # Shared app-specific components
│   ├── screens/
│   │   ├── auth/        # Authentication screens
│   │   ├── dashboard/   # Dashboard and main app screens
│   │   └── emergency/   # Emergency profile screens
│   ├── navigation/      # Navigation configuration
│   ├── store/           # Zustand store definitions
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # App constants (colors, API endpoints, etc.)
│   └── theme/           # Theme configuration (react-native-paper)
├── assets/              # Images, fonts, and other static assets
├── app/                 # Expo Router app directory
├── .env                 # Environment variables
└── app.json             # Expo configuration

```

## Configuration

### TypeScript
- **Strict mode enabled** with comprehensive type checking
- **Path aliases**: `@/*` maps to `./src/*`
- ES Module interop enabled
- JSON module resolution supported

### Environment Variables (.env)
```
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000
```

### Permissions Configured

#### iOS (Info.plist)
- NFCReaderUsageDescription - NFC tag reading
- NSCameraUsageDescription - QR code scanning
- NSFaceIDUsageDescription - Biometric authentication

#### Android (Permissions)
- android.permission.NFC
- android.permission.CAMERA
- android.permission.USE_BIOMETRIC
- android.permission.USE_FINGERPRINT
- android.permission.INTERNET

## Key Features to Implement

1. **Authentication**
   - Email/password registration and login
   - Biometric authentication
   - Secure token storage

2. **Emergency Profile Management**
   - Create/edit emergency medical profiles
   - Manage medical conditions, medications, allergies
   - Emergency contact management

3. **NFC Integration**
   - Register NFC tags to profiles
   - Read NFC tags to display emergency information
   - Tag activation/deactivation

4. **QR Code Scanning**
   - Alternative access method to emergency profiles
   - Generate QR codes for profiles

5. **Dashboard**
   - Profile overview
   - Quick access to emergency information
   - Scan history

## Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint
```

## Next Steps

1. Implement API client with axios and react-query
2. Create authentication flow and screens
3. Build emergency profile management screens
4. Implement NFC reading functionality
5. Add QR code generation and scanning
6. Create dashboard and navigation structure
7. Implement state management with Zustand
8. Add form validation with react-hook-form and zod
9. Style UI components with react-native-paper theme

## Notes

- The project uses Expo Router for navigation
- NFC functionality requires physical device testing (not available in simulator)
- Biometric authentication requires device with Face ID/Touch ID or fingerprint sensor
- Camera permissions needed for QR code scanning

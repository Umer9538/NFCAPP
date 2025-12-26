# MedGuard Mobile - API & Authentication Documentation

## Overview
Complete API client and authentication system for MedGuard mobile app, connecting to the Next.js backend.

## Architecture

```
src/
├── api/
│   ├── client.ts              # Axios instance with interceptors
│   ├── auth.ts                # Authentication endpoints
│   ├── emergencyProfile.ts    # Emergency profile endpoints
│   ├── nfc.ts                 # NFC tag endpoints
│   ├── qr.ts                  # QR code endpoints
│   └── index.ts               # Central export
├── store/
│   └── authStore.ts           # Zustand auth state management
├── hooks/
│   └── useAuth.ts             # Custom auth hook
└── types/
    └── auth.ts                # Authentication types
```

## Features

### ✅ API Client (src/api/client.ts)
- Axios instance with base URL configuration
- Request interceptor: Automatically adds JWT token from AsyncStorage
- Response interceptor: Handles errors and token refresh
- Automatic token refresh on 401 errors
- Error handling with user-friendly messages
- Development logging
- Type-safe API methods

### ✅ Authentication (src/api/auth.ts)
Complete authentication endpoints:
- `login(email, password)` - User login
- `signup(userData)` - User registration
- `logout()` - User logout
- `verifyEmail(code)` - Email verification
- `enable2FA()` - Enable two-factor auth
- `verify2FA(code)` - Verify 2FA code
- `disable2FA(password)` - Disable 2FA
- `getMe()` - Get current user
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password
- `changePassword(current, new)` - Change password
- `updateProfile(data)` - Update user profile
- `deleteAccount(password)` - Delete account
- `validateToken()` - Check token validity

### ✅ State Management (src/store/authStore.ts)
Zustand store with:
- **State**: user, token, refreshToken, isAuthenticated, isLoading, error
- **Actions**: login, signup, logout, checkAuth, setUser, setTokens
- **Persistence**: Tokens and user data saved to AsyncStorage
- **Auto-load**: Checks authentication on app start
- **Optimized selectors**: For efficient re-renders

### ✅ Custom Hook (src/hooks/useAuth.ts)
Convenient hook providing:
- All auth state (user, isAuthenticated, isLoading, error)
- All auth actions (login, signup, logout, etc.)
- Profile management (updateProfile, changePassword)
- Email verification (verifyEmail, resendVerificationEmail)
- 2FA management (enable2FA, verify2FA, disable2FA)
- Password recovery (forgotPassword, resetPassword)

### ✅ Emergency Profile API (src/api/emergencyProfile.ts)
- Get/create/update/delete emergency profiles
- Medical conditions management
- Medications management
- Allergies management
- Emergency contacts management

### ✅ NFC API (src/api/nfc.ts)
- Register NFC tags
- Scan NFC tags
- Deactivate NFC tags
- Get NFC tags list
- View scan logs

### ✅ QR Code API (src/api/qr.ts)
- Generate QR codes
- Scan QR codes
- Regenerate QR codes
- Deactivate QR codes

## Usage Examples

### 1. Basic Authentication Flow

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await login('user@example.com', 'password123');

      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        // Navigate to 2FA screen
        navigation.navigate('TwoFactorAuth');
      } else {
        // Login successful, user is now authenticated
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

### 2. User Signup

```tsx
import { useAuth } from '@/hooks/useAuth';

function SignupScreen() {
  const { signup, isLoading, error } = useAuth();

  const handleSignup = async () => {
    try {
      await signup({
        email: 'newuser@example.com',
        password: 'securePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      });

      // User is now logged in automatically
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <View>
      <Button onPress={handleSignup} disabled={isLoading}>
        Sign Up
      </Button>
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

### 3. Check Authentication Status

```tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Check authentication on app start
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <MainApp /> : <AuthFlow />;
}
```

### 4. Protected Route Pattern

```tsx
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useEffect } from 'react';

function ProtectedScreen({ navigation }) {
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return <YourProtectedContent />;
}
```

### 5. Update User Profile

```tsx
import { useAuth } from '@/hooks/useAuth';

function ProfileScreen() {
  const { user, updateProfile } = useAuth();

  const handleUpdate = async () => {
    try {
      await updateProfile({
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+9876543210',
      });

      // User state is automatically updated
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View>
      <Text>Current Name: {user?.firstName} {user?.lastName}</Text>
      <Button onPress={handleUpdate}>Update Profile</Button>
    </View>
  );
}
```

### 6. Logout

```tsx
import { useAuth } from '@/hooks/useAuth';

function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // User is logged out, tokens cleared
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <Button onPress={handleLogout}>Logout</Button>;
}
```

### 7. Using Emergency Profile API

```tsx
import { emergencyProfileApi } from '@/api';

async function createProfile() {
  const profile = await emergencyProfileApi.createEmergencyProfile({
    bloodType: 'A+',
    height: 175,
    weight: 70,
    medicalConditions: [],
    medications: [],
    allergies: [],
    emergencyContacts: [],
    isActive: true,
  });
}

async function addMedication() {
  await emergencyProfileApi.addMedication({
    name: 'Aspirin',
    dosage: '100mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Smith',
  });
}
```

### 8. Using NFC API

```tsx
import { nfcApi } from '@/api';

async function registerTag(tagId: string, profileId: string) {
  const tag = await nfcApi.registerNFCTag({ tagId, profileId });
  console.log('NFC tag registered:', tag);
}

async function scanTag(tagId: string) {
  const result = await nfcApi.scanNFCTag(tagId);
  console.log('Profile:', result.profile);
  console.log('Scan log:', result.scanLog);
}
```

### 9. Direct API Calls

```tsx
import { api } from '@/api';

// Type-safe API calls
const user = await api.get<User>('/user/profile');
const response = await api.post('/emergency-profile', profileData);
const updated = await api.patch('/user/update', updateData);
await api.delete('/nfc/tags/123');
```

### 10. Error Handling

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, error, clearError } = useAuth();

  useEffect(() => {
    // Clear error when component unmounts
    return () => clearError();
  }, []);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error: any) {
      // Error is automatically set in store
      // You can also handle it here
      Alert.alert('Error', error.message || 'Login failed');
    }
  };

  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button onPress={handleLogin}>Login</Button>
    </View>
  );
}
```

## API Client Configuration

The API client automatically handles:

### Request Interceptor
- ✅ Adds JWT token to all requests
- ✅ Logs requests in development mode
- ✅ Reads token from AsyncStorage

### Response Interceptor
- ✅ Logs responses in development mode
- ✅ Handles 401 errors (token expired)
- ✅ Automatically refreshes tokens
- ✅ Retries failed requests after refresh
- ✅ Logs out user if refresh fails
- ✅ Provides user-friendly error messages

### Error Handling
```typescript
interface ApiError {
  message: string;    // User-friendly message
  status?: number;    // HTTP status code
  code?: string;      // Error code
  details?: unknown;  // Additional error details
}
```

## Token Management

### Token Storage
Tokens are stored in AsyncStorage:
```typescript
STORAGE_KEYS.AUTH_TOKEN      // JWT access token
STORAGE_KEYS.REFRESH_TOKEN   // Refresh token
STORAGE_KEYS.USER_DATA       // User profile data
```

### Token Refresh Flow
1. API request fails with 401 Unauthorized
2. Interceptor catches error
3. Retrieves refresh token from AsyncStorage
4. Calls `/auth/refresh` endpoint
5. Saves new tokens to AsyncStorage
6. Retries original request with new token
7. If refresh fails, logs out user

## Type Safety

All API functions are fully typed:
```typescript
// Return types are inferred
const user: User = await authApi.getMe();
const profile: EmergencyProfile = await emergencyProfileApi.getEmergencyProfile();
const tags: NFCTag[] = await nfcApi.getNFCTags();

// Request types are validated
await authApi.login({
  email: 'user@example.com',
  password: 'pass123'
}); // ✅ Type-safe

await authApi.login({
  username: 'user'
}); // ❌ TypeScript error
```

## Environment Configuration

Set in `.env` file:
```env
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000
```

Access via:
```typescript
import { API_CONFIG } from '@/constants';

API_CONFIG.BASE_URL    // Base URL
API_CONFIG.TIMEOUT     // Request timeout
API_CONFIG.ENDPOINTS   // All endpoint paths
```

## Testing

### Mock Authentication
```typescript
import { useAuthStore } from '@/store/authStore';

// For testing, set mock user
useAuthStore.setState({
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
});
```

### Mock API Calls
```typescript
import { api } from '@/api';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(api);

mock.onGet('/user/profile').reply(200, {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
});
```

## Best Practices

1. **Always use the useAuth hook** for auth operations
2. **Check isAuthenticated** before rendering protected content
3. **Handle loading states** with isLoading
4. **Display error messages** from the error state
5. **Clear errors** when appropriate (component unmount, user action)
6. **Use type-safe API calls** with proper interfaces
7. **Catch errors** in async functions
8. **Test token refresh** by simulating expired tokens

## Next Steps

With the API client and auth system in place, you can now:
1. Build authentication screens (Login, Signup, Forgot Password)
2. Implement protected routes and navigation
3. Create emergency profile forms
4. Integrate NFC reading functionality
5. Add QR code scanning
6. Build the dashboard with profile data

All API infrastructure is ready and fully functional!

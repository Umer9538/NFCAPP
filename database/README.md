# Mobile App Database Module

This directory contains all the types, schemas, configuration, and utilities needed for the mobile app frontend to interact with the NFC Medical Profile Platform backend.

## Directory Structure

```
database/
├── types/                    # TypeScript type definitions
│   ├── common.types.ts       # Common/shared types (enums, pagination, etc.)
│   ├── user.types.ts         # User-related types
│   ├── medical.types.ts      # Medical profile types
│   ├── bracelet.types.ts     # NFC Bracelet types
│   ├── organization.types.ts # Organization types
│   ├── incident.types.ts     # Incident report/log types
│   ├── education.types.ts    # Education-specific types
│   ├── construction.types.ts # Construction-specific types
│   ├── subscription.types.ts # Subscription types
│   └── index.ts              # Export all types
│
├── schemas/                  # Validation schemas
│   ├── user.schema.ts        # User validation (signup, login, etc.)
│   ├── medical.schema.ts     # Medical profile validation
│   ├── incident.schema.ts    # Incident validation
│   └── index.ts              # Export all schemas
│
├── config/                   # Configuration files
│   ├── navigation.config.ts  # Mobile app navigation by role
│   ├── api.endpoints.ts      # All API endpoints reference
│   └── index.ts              # Export all config
│
├── utils/                    # Utility helpers
│   ├── response.helpers.ts   # API response helpers
│   ├── date.helpers.ts       # Date formatting utilities
│   ├── format.helpers.ts     # General formatting utilities
│   ├── storage.helpers.ts    # AsyncStorage helpers
│   └── index.ts              # Export all utils
│
├── index.ts                  # Main entry point
└── README.md                 # This file
```

## Usage

### Import Types

```typescript
import { 
  User, 
  MedicalProfile, 
  EmergencyContact,
  AccountType,
  UserRole
} from '@/database/types';

// Use in component
const user: User = await fetchUser();
```

### Import Navigation Config

```typescript
import { getNavigation, getTerminology } from '@/database/config';

// Get navigation items for current user
const navItems = getNavigation(user.accountType, user.role);

// Get terminology based on account type
const terms = getTerminology(user.accountType);
console.log(`Welcome, ${terms.user}!`); // "Welcome, Student!" for education
```

### Import API Endpoints

```typescript
import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS, buildUrl } from '@/database/config';

// Login
const response = await fetch(buildUrl(AUTH_ENDPOINTS.LOGIN), {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Get profile
const profile = await fetch(buildUrl(PROFILE_ENDPOINTS.PROFILE));
```

### Import Validation Schemas

```typescript
import { userSchemas, validateField } from '@/database/schemas';

// Validate email
const emailResult = validateField(email, userSchemas.signup.email);
if (!emailResult.valid) {
  showError(emailResult.error);
}
```

### Import Utilities

```typescript
import { 
  formatDateDisplay, 
  getRelativeTime, 
  formatSeverity,
  getInitials 
} from '@/database/utils';

// Format date
const dateStr = formatDateDisplay(incident.createdAt); // "January 15, 2025"

// Get relative time
const timeAgo = getRelativeTime(activity.createdAt); // "2 hours ago"

// Format severity badge
const severity = formatSeverity('high'); 
// { label: 'High', color: '#f97316', bgColor: '#ffedd5' }

// Get user initials
const initials = getInitials('John Doe'); // "JD"
```

## Dashboard Types

The app supports 4 dashboard types:

### 1. Individual Dashboard
- For retail users and families
- Features: Medical Profile, NFC Bracelet, Subscription, Audit Logs

### 2. Corporate Dashboard
- For offices and companies
- Roles: Admin, Employee
- Features: Employees, Medical Info, Incident Reports

### 3. Construction Dashboard
- For construction and industrial sites
- Roles: Site Admin, Supervisor, Worker
- Features: Workers, Medical Info, Incident Logs, OSHA Compliance

### 4. Education Dashboard
- For schools and universities
- Roles: Admin, Teacher, Parent, Student
- Features: Students, Medical Profiles, Emergency Notifications

## API Integration

The mobile app uses the same backend API as the web app. Key endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Profile
- `GET/PUT /api/profile` - Medical profile

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Bracelet
- `GET /api/bracelet` - Get bracelet info
- `POST /api/bracelet/link` - Link NFC bracelet
- `GET /api/nfc/:nfcId` - Emergency access (public)

### Organization (role-based)
- `GET /api/organizations/employees` - Corporate employees
- `GET /api/organizations/workers` - Construction workers
- `GET /api/organizations/students` - Education students
- `GET/POST /api/organizations/incident-reports` - Corporate incidents
- `GET/POST /api/organizations/incident-logs` - Construction incidents
- `GET/POST /api/organizations/emergency-notifications` - Education alerts

## Role-Based Access

Navigation and features are filtered based on user role:

| Dashboard | Role | Access Level |
|-----------|------|--------------|
| Individual | User | Full access to own profile |
| Corporate | Admin | Full access to all employees |
| Corporate | Employee | Own profile + incident reporting |
| Construction | Site Admin | Full access + OSHA compliance |
| Construction | Supervisor | Workers + incidents (no OSHA) |
| Construction | Worker | Own profile + incident reporting |
| Education | Admin | Full access + notifications |
| Education | Teacher | Assigned students only |
| Education | Parent | Own children only |
| Education | Student | Own profile only |

## Storage Keys

Use the predefined storage keys for consistency:

```typescript
import { STORAGE_KEYS } from '@/database/utils';

// Save auth token
await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

// Get user data
const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
```

## Theming

Dashboard themes are defined in the config:

```typescript
import { DASHBOARD_THEMES } from '@/database/config';

const theme = DASHBOARD_THEMES[user.accountType];
// { primaryColor: '#3B82F6', secondaryColor: '#6B7280', name: 'Corporate' }
```

## Contributing

When adding new types or utilities:

1. Add the type/utility to the appropriate file
2. Export it from the folder's `index.ts`
3. Update this README if needed

## Notes

- All types match the Prisma schema in `/prisma/schema.prisma`
- Validation schemas can be converted to Zod, Yup, or other libraries
- Storage helpers are designed for React Native's AsyncStorage
- API endpoints match the Next.js API routes in `/app/api/`


# Product Requirements Document (PRD)
# MedID Mobile App - NFC Medical Profile Platform

**Version:** 1.0
**Date:** December 2024
**Author:** Muhammad Umer
**Platform:** iOS & Android (React Native / Expo)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Account Types & Roles](#3-account-types--roles)
4. [Feature Matrix by Role](#4-feature-matrix-by-role)
5. [Navigation Structure](#5-navigation-structure)
6. [Authentication Flow](#6-authentication-flow)
7. [Core Features](#7-core-features)
8. [API Integration](#8-api-integration)
9. [Database Schema](#9-database-schema)
10. [Screen Specifications](#10-screen-specifications)
11. [Technical Stack](#11-technical-stack)
12. [Security Requirements](#12-security-requirements)

---

## 1. Overview

### 1.1 Product Description

MedID is a mobile application that allows users to store and share their medical information via NFC bracelets for emergency situations. The app supports multiple account types for individuals, corporations, construction sites, and educational institutions.

### 1.2 Objectives

- Provide instant access to critical medical information during emergencies
- Enable NFC bracelet linking for quick profile access
- Support location sharing with emergency contacts
- Offer role-based dashboards for different organization types
- Maintain data consistency with the web platform

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| Individual Users | Personal medical profile management |
| Corporate Employees | Workplace health & safety tracking |
| Construction Workers | Job site safety with OSHA compliance |
| Education (Schools) | Student health management |

### 1.4 Key Value Propositions

- Emergency medical information accessible via NFC scan
- Real-time location sharing during emergencies
- Multi-tenant support for organizations
- Role-based access control
- Unified backend with web platform

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐         ┌─────────────────┐                           │
│  │   MedID Web     │         │  MedID Mobile   │                           │
│  │   (Next.js)     │         │  (Expo/RN)      │                           │
│  └────────┬────────┘         └────────┬────────┘                           │
│           │                           │                                     │
│           └───────────┬───────────────┘                                     │
│                       │                                                     │
│                       ▼                                                     │
│           ┌─────────────────────┐                                          │
│           │   Next.js API       │                                          │
│           │   /app/api/*        │                                          │
│           │                     │                                          │
│           │ • Authentication    │                                          │
│           │ • Profile CRUD      │                                          │
│           │ • Organization Mgmt │                                          │
│           │ • NFC/Bracelet      │                                          │
│           │ • Location Sharing  │                                          │
│           │ • Subscriptions     │                                          │
│           └──────────┬──────────┘                                          │
│                      │                                                      │
│                      ▼                                                      │
│           ┌─────────────────────┐                                          │
│           │   Neon Database     │                                          │
│           │   (PostgreSQL)      │                                          │
│           └─────────────────────┘                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Project Structure

```
/Users/mac/Documents/Project/NFC App/NFCApp/
├── frontend/                 # React Native / Expo App
│   ├── src/
│   │   ├── api/             # API client & endpoints
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Screen components
│   │   ├── navigation/      # Navigation configuration
│   │   ├── store/           # State management (Zustand)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript definitions
│   │   ├── utils/           # Utility functions
│   │   ├── services/        # NFC, Biometric services
│   │   └── theme/           # Styling & theming
│   ├── App.tsx
│   └── package.json
│
├── database/                 # Shared types & config (from backend)
│   ├── types/               # TypeScript types matching Prisma
│   ├── schemas/             # Validation schemas
│   ├── config/              # API endpoints, navigation config
│   └── utils/               # Helper utilities
│
└── docs/                     # Documentation
```

### 2.3 Backend Location

**Path:** `/Users/mac/Documents/Project/NFC-Medical-Profile-Platform`

The mobile app uses the **same Next.js API** as the website. No separate backend is required.

---

## 3. Account Types & Roles

### 3.1 Account Types

| Account Type | Description | Use Case |
|--------------|-------------|----------|
| `individual` | Personal users | Retail customers, families |
| `corporate` | Office/company | Employee health tracking |
| `construction` | Job sites | Worker safety, OSHA compliance |
| `education` | Schools | Student health management |

### 3.2 Roles by Account Type

#### Individual
- No roles (single user)

#### Corporate
| Role | Description |
|------|-------------|
| `admin` | Full organization access |
| `employee` | Limited to own profile |

#### Construction
| Role | Description |
|------|-------------|
| `admin` | Full access + OSHA compliance |
| `supervisor` | Workers + incidents (no OSHA) |
| `worker` | Own profile + incident reporting |

#### Education
| Role | Description |
|------|-------------|
| `admin` | Full access + notifications |
| `teacher` | Assigned students only |
| `parent` | Own children only |
| `student` | Own profile only |

---

## 4. Feature Matrix by Role

### 4.1 Navigation Access

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    NAVIGATION BY ACCOUNT TYPE & ROLE                                        │
├─────────────┬───────────┬───────────────────────────────┬─────────────────────────────┬─────────────────────┤
│   Feature   │ Individual│         Corporate             │        Construction         │      Education      │
│             │   User    │   Admin    │    Employee      │ Admin │ Supervisor│ Worker  │Admin│Teacher│Parent│Student│
├─────────────┼───────────┼────────────┼──────────────────┼───────┼───────────┼─────────┼─────┼───────┼──────┼───────┤
│ Overview    │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Profile     │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Bracelet    │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Location    │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Reminders   │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Subscription│     ✓     │     ✗      │        ✗         │   ✗   │     ✗     │    ✗    │  ✗  │   ✗   │  ✗   │   ✗   │
│ Employees   │     -     │     ✓      │        ✗         │   -   │     -     │    -    │  -  │   -   │  -   │   -   │
│ Workers     │     -     │     -      │        -         │   ✓   │     ✓     │    ✗    │  -  │   -   │  -   │   -   │
│ Students    │     -     │     -      │        -         │   -   │     -     │    -    │  ✓  │  ✓*   │ ✓**  │   ✗   │
│ Medical Info│     -     │     ✓      │        ✗         │   ✓   │     ✓     │    ✗    │  ✓  │  ✓*   │ ✓**  │   ✗   │
│ Incidents   │     -     │     ✓      │       ✓†         │   ✓   │     ✓     │   ✓†    │  -  │   -   │  -   │   -   │
│ OSHA        │     -     │     -      │        -         │   ✓   │     ✗     │    ✗    │  -  │   -   │  -   │   -   │
│ Training    │     -     │     -      │        -         │   ✓   │    ✓‡     │    ✗    │  -  │   -   │  -   │   -   │
│ Notifications│    -     │     -      │        -         │   -   │     -     │    -    │  ✓  │   ✗   │  ✗   │   ✗   │
│ Audit Logs  │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
│ Settings    │     ✓     │     ✓      │        ✓         │   ✓   │     ✓     │    ✓    │  ✓  │   ✓   │  ✓   │   ✓   │
└─────────────┴───────────┴────────────┴──────────────────┴───────┴───────────┴─────────┴─────┴───────┴──────┴───────┘

Legend:
✓  = Full access
✗  = No access
-  = Not applicable for this account type
*  = Teachers see ONLY assigned students
** = Parents see ONLY own children
†  = Can CREATE reports but not manage all
‡  = Can VIEW but not edit
```

### 4.2 Data Access Rules

| Account Type | Role | Data Access |
|--------------|------|-------------|
| Individual | User | Own data only |
| Corporate | Admin | All employees in organization |
| Corporate | Employee | Own data only |
| Construction | Admin | All workers + OSHA + Training |
| Construction | Supervisor | All workers + Training (view only) |
| Construction | Worker | Own data only |
| Education | Admin | All students, teachers, parents |
| Education | Teacher | Assigned students only (via TeacherStudentAssignment) |
| Education | Parent | Own children only (via ParentChildRelationship) |
| Education | Student | Own data only |

---

## 5. Navigation Structure

### 5.1 Individual Navigation

```
Bottom Tab Navigator
├── Home (Overview)
├── Profile (Medical Profile)
├── Bracelet (NFC Management)
├── Location (Location Sharing)
└── Settings
    ├── Account Settings
    ├── Security (Password, 2FA)
    ├── Notifications
    ├── Subscription
    ├── Audit Logs
    └── About / Help
```

### 5.2 Corporate Navigation

```
Bottom Tab Navigator
├── Home (Dashboard)
├── Profile (Medical Profile)
├── Bracelet
├── Organization
│   ├── Employees (Admin only)
│   ├── Medical Info (Admin only)
│   └── Incident Reports
└── Settings
```

### 5.3 Construction Navigation

```
Bottom Tab Navigator
├── Home (Dashboard)
├── Profile (Medical Profile)
├── Bracelet
├── Organization
│   ├── Workers (Admin, Supervisor)
│   ├── Medical Info (Admin, Supervisor)
│   ├── Incident Logs
│   ├── OSHA Compliance (Admin only)
│   └── Training Records (Admin, Supervisor view-only)
└── Settings
```

### 5.4 Education Navigation

```
Bottom Tab Navigator
├── Home (Dashboard)
├── Profile (Medical Profile)
├── Bracelet
├── Organization
│   ├── Students (filtered by role)
│   ├── Medical Profiles (filtered by role)
│   ├── Emergency Notifications (Admin only)
│   ├── Teachers (Admin only)
│   └── Parents (Admin only)
└── Settings
```

---

## 6. Authentication Flow

### 6.1 Signup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIGNUP FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Signup Screen                                                │
│     ├── Full Name                                                │
│     ├── Username                                                 │
│     ├── Email                                                    │
│     ├── Password                                                 │
│     └── Account Type Selection                                   │
│              │                                                   │
│              ▼                                                   │
│  2. Email Verification                                           │
│     └── 6-digit OTP code                                         │
│              │                                                   │
│              ▼                                                   │
│  3. Profile Setup (7 steps)                                      │
│     ├── Step 1: Basic Information                                │
│     ├── Step 2: Medical Profile                                  │
│     ├── Step 3: Doctor Information                               │
│     ├── Step 4: Emergency Contacts                               │
│     ├── Step 5: Prescriptions                                    │
│     ├── Step 6: Emergency Notes                                  │
│     └── Step 7: Review & Complete                                │
│              │                                                   │
│              ▼                                                   │
│  4. Dashboard (based on account type)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          LOGIN FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Login Screen                                                 │
│     ├── Email                                                    │
│     ├── Password                                                 │
│     └── Remember Me                                              │
│              │                                                   │
│              ▼                                                   │
│  2. Check 2FA Status                                             │
│     │                                                            │
│     ├── 2FA Disabled ──────► Create Session ──► Dashboard        │
│     │                                                            │
│     └── 2FA Enabled ──────► 2FA Verification Screen              │
│                                    │                             │
│                                    ▼                             │
│                             Enter OTP Code                       │
│                                    │                             │
│                                    ▼                             │
│                             Create Session ──► Dashboard         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Session Management

- **Token Type:** JWT
- **Storage:** Secure Storage (Keychain/Keystore)
- **Expiration:** 7 days
- **Refresh:** On app launch

---

## 7. Core Features

### 7.1 Medical Profile

**Description:** Store and manage medical information

**Data Fields:**
- Blood Type
- Height & Weight
- Allergies (name, severity)
- Medical Conditions
- Current Medications
- Emergency Notes
- Organ Donor Status
- DNR Status

**Actions:**
- View profile
- Edit profile
- Add/remove allergies
- Add/remove conditions
- Add/remove medications

### 7.2 NFC Bracelet

**Description:** Link NFC bracelet for emergency access

**Features:**
- Scan and link NFC bracelet
- View linked bracelet status
- View access history (who scanned, when, where)
- Unlink bracelet

**Emergency Access Flow:**
```
First Responder scans NFC bracelet
         │
         ▼
Phone opens: https://medid.com/emergency/{nfcId}
         │
         ▼
Displays:
├── Patient Name
├── Blood Type
├── Allergies (with severity)
├── Medical Conditions
├── Medications
├── Emergency Contacts (with call buttons)
├── Doctor Info (with call button)
└── Emergency Notes
```

### 7.3 Location Sharing

**Description:** Share real-time location during emergencies

**Features:**
- Get current GPS location
- Create shareable link (1-hour expiry)
- Share via SMS, WhatsApp, Email
- Quick send to emergency contacts
- View share history
- Deactivate active shares

**Shared Location Page Shows:**
- Interactive map with patient location
- Patient medical info
- Nearby emergency services (hospitals, police, pharmacy, fire)
- Emergency contact list with call buttons
- Directions to nearby services

### 7.4 Health Reminders

**Description:** Auto-generated health reminders based on profile

**Reminder Types:**
- Update incomplete profile fields
- Medication refill reminders
- Annual checkup reminders
- Emergency contact verification

**Priority Levels:**
- High (red)
- Medium (yellow)
- Low (blue)

### 7.5 Incident Reporting (Corporate/Construction)

**Description:** Report and track workplace incidents

**Data Fields:**
- Title
- Description
- Employee/Worker involved
- Incident date
- Location
- Severity (low, medium, high, critical)
- Status (open, investigating, resolved, closed)

**Permissions:**
| Role | Create | View All | Edit | Change Status |
|------|--------|----------|------|---------------|
| Admin | ✓ | ✓ | ✓ | ✓ |
| Supervisor | ✓ | ✓ | ✓ | ✓ |
| Employee/Worker | ✓ | Own only | ✗ | ✗ |

### 7.6 Emergency Notifications (Education)

**Description:** Send emergency alerts to students/parents/staff

**Notification Types:**
- Emergency
- Alert
- Info
- Weather

**Target Options:**
- All
- Students only
- Parents only
- Staff only
- Teachers only
- Specific grade
- Specific class
- Specific campus

### 7.7 OSHA Compliance (Construction - Admin only)

**Description:** Track OSHA safety compliance metrics

**Categories:**
- Personal Protective Equipment (PPE)
- Fall Protection
- Scaffold Safety
- Electrical Safety
- Hazard Communication

**Status Types:**
- Compliant
- Non-compliant
- Pending review

### 7.8 Training Records (Construction)

**Description:** Track worker training certifications

**Data Fields:**
- Training type (OSHA 10-Hour, First Aid, etc.)
- Worker name
- Completion date
- Expiry date
- Status (current, expired, expiring soon)

---

## 8. API Integration

### 8.1 Base Configuration

```typescript
// API Base URL
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Request Headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // From secure storage
};
```

### 8.2 Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/verify-email` | POST | Verify email with OTP |
| `/api/auth/resend-otp` | POST | Resend verification code |
| `/api/auth/forgot-password` | POST | Initiate password reset |
| `/api/auth/reset-password` | POST | Complete password reset |
| `/api/auth/profile-setup` | POST | Complete profile setup |
| `/api/auth/enable-2fa` | POST | Enable 2FA |
| `/api/auth/verify-2fa` | POST | Verify 2FA code |

### 8.3 Profile Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get medical profile |
| `/api/profile` | PUT | Update medical profile |

### 8.4 Bracelet Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bracelet` | GET | Get bracelet status |
| `/api/bracelet/link` | POST | Link NFC bracelet |
| `/api/bracelet/unlink` | POST | Unlink bracelet |
| `/api/nfc/[nfcId]` | GET | Emergency access (public) |

### 8.5 Location Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/location/share` | POST | Create location share |
| `/api/location/share` | GET | Get share history |
| `/api/location/[shareToken]` | GET | View shared location (public) |
| `/api/location/[shareToken]` | DELETE | Deactivate share |
| `/api/location/nearby` | GET | Get nearby services |

### 8.6 Organization Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/organizations/employees` | GET/POST | Manage employees |
| `/api/organizations/workers` | GET/POST | Manage workers |
| `/api/organizations/students` | GET/POST | Manage students |
| `/api/organizations/teacher-assignments` | GET/POST | Manage assignments |
| `/api/organizations/parent-relationships` | GET/POST | Manage relationships |
| `/api/organizations/medical-info` | GET | View medical info |
| `/api/organizations/incident-reports` | GET/POST | Corporate incidents |
| `/api/organizations/incident-logs` | GET/POST | Construction incidents |
| `/api/organizations/emergency-notifications` | GET/POST | Education notifications |
| `/api/organizations/osha-compliance` | GET/POST | OSHA metrics |

### 8.7 Settings Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings/profile` | GET/PUT | Profile settings |
| `/api/settings/account` | GET/PUT | Account settings |
| `/api/settings/security` | GET/PUT | Security settings |
| `/api/settings/password` | PUT | Change password |
| `/api/settings/notifications` | GET/PUT | Notification preferences |

### 8.8 Other Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/health-reminders` | GET/PUT | Health reminders |
| `/api/activities` | GET | Activity history |
| `/api/audit-logs` | GET | Audit logs |
| `/api/subscription` | GET | Subscription status |

---

## 9. Database Schema

### 9.1 Core Models

```prisma
model User {
  id                String    @id @default(cuid())
  fullName          String
  username          String    @unique
  email             String    @unique
  password          String
  emailVerified     Boolean   @default(false)
  twoFactorEnabled  Boolean   @default(false)
  profileComplete   Boolean   @default(false)

  // Multi-Tenant
  accountType       String    @default("individual")
  organizationId    String?
  role              String?
  suspended         Boolean   @default(false)

  // Basic Info
  phoneNumber       String?
  gender            String?
  dateOfBirth       String?
  address           String?
  city              String?
  province          String?
  postalCode        String?

  // Education-specific
  grade             String?
  className         String?
  campus            String?
  studentId         String?

  // Notification Preferences
  notifyProfileAccess       Boolean @default(true)
  notifySubscriptionUpdates Boolean @default(true)
  notifySecurityAlerts      Boolean @default(true)
  notifyMarketingEmails     Boolean @default(false)

  // Relations
  medicalProfile    MedicalProfile?
  doctorInfo        DoctorInfo?
  emergencyContacts EmergencyContact[]
  bracelet          Bracelet?
  organization      Organization?
  // ... other relations
}

model MedicalProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  bloodType         String
  height            String
  weight            String
  allergies         String   // JSON array
  medicalConditions String   // JSON array
  medications       String   // JSON array
  emergencyNotes    String?
  isOrganDonor      Boolean  @default(false)
  hasDNR            Boolean  @default(false)
}

model Bracelet {
  id            String   @id @default(cuid())
  userId        String   @unique
  nfcId         String   @unique
  status        String   // active, inactive, lost
  linkedDate    DateTime @default(now())
  lastAccessed  DateTime?
  accessCount   Int      @default(0)
  deviceInfo    String?
}

model Organization {
  id            String   @id @default(cuid())
  name          String
  type          String   // corporate, construction, education
  domain        String?
  createdById   String
}

model LocationShare {
  id            String   @id @default(cuid())
  userId        String
  latitude      Float
  longitude     Float
  accuracy      Float?
  address       String?
  shareToken    String   @unique
  isActive      Boolean  @default(true)
  expiresAt     DateTime
  accessCount   Int      @default(0)
}
```

### 9.2 Organization-Specific Models

```prisma
// Corporate
model IncidentReport {
  id             String   @id @default(cuid())
  organizationId String
  title          String
  description    String
  employeeId     String
  severity       String   // low, medium, high, critical
  status         String   // open, investigating, resolved, closed
}

// Construction
model OSHAComplianceMetric {
  id             String   @id @default(cuid())
  organizationId String
  category       String
  status         String   // compliant, non_compliant, pending
  violations     Int      @default(0)
}

model TrainingRecord {
  id             String   @id @default(cuid())
  organizationId String
  workerId       String
  trainingType   String
  completedDate  DateTime
  expiryDate     DateTime?
  status         String
}

// Education
model TeacherStudentAssignment {
  id         String @id @default(cuid())
  teacherId  String
  studentId  String
  className  String?
}

model ParentChildRelationship {
  id           String  @id @default(cuid())
  parentId     String
  childId      String
  relationship String
  isPrimary    Boolean @default(false)
}

model EmergencyNotification {
  id             String   @id @default(cuid())
  organizationId String
  title          String
  message        String
  type           String   // emergency, alert, info, weather
  priority       String   // critical, high, medium, low
  targetAudience String
}
```

---

## 10. Screen Specifications

### 10.1 Authentication Screens

| Screen | Description |
|--------|-------------|
| LoginScreen | Email/password login with 2FA support |
| SignupScreen | User registration with account type selection |
| VerifyEmailScreen | 6-digit OTP verification |
| ForgotPasswordScreen | Password reset request |
| ResetPasswordScreen | New password entry |
| TwoFactorAuthScreen | 2FA code verification |
| ProfileSetupScreen | Multi-step profile completion |

### 10.2 Dashboard Screens

| Screen | Description |
|--------|-------------|
| HomeScreen | Overview dashboard with stats & reminders |
| ProfileScreen | Medical profile view/edit |
| BraceletScreen | NFC bracelet management |
| LocationSharingScreen | Location share creation & history |
| SettingsScreen | App settings & preferences |

### 10.3 Organization Screens

| Screen | Account Type | Description |
|--------|--------------|-------------|
| EmployeesScreen | Corporate | Employee management |
| WorkersScreen | Construction | Worker management |
| StudentsScreen | Education | Student management |
| MedicalInfoScreen | All Org | Aggregate medical data |
| IncidentReportsScreen | Corporate | Incident management |
| IncidentLogsScreen | Construction | Incident management |
| OSHAComplianceScreen | Construction | OSHA tracking |
| TrainingRecordsScreen | Construction | Training management |
| EmergencyNotificationsScreen | Education | Send notifications |

### 10.4 Settings Screens

| Screen | Description |
|--------|-------------|
| AccountSettingsScreen | Basic profile settings |
| SecuritySettingsScreen | Password, 2FA, sessions |
| NotificationSettingsScreen | Notification preferences |
| SubscriptionScreen | Plan management (Individual only) |
| AuditLogsScreen | Activity history |

---

## 11. Technical Stack

### 11.1 Frontend (Mobile App)

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile framework |
| Expo | Development & build tooling |
| TypeScript | Type safety |
| Zustand | State management |
| React Query | Server state & caching |
| React Navigation | Navigation |
| React Native Paper | UI components |
| React Hook Form | Form handling |
| Zod | Validation |
| Axios | HTTP client |
| Expo Secure Store | Secure token storage |
| React Native NFC Manager | NFC functionality |
| Expo Location | GPS location |
| Expo Local Authentication | Biometrics |

### 11.2 Backend (Shared with Web)

| Technology | Purpose |
|------------|---------|
| Next.js 14 | API Routes |
| PostgreSQL | Database (Neon) |
| Prisma | ORM |
| JWT (Jose) | Authentication |
| Bcrypt | Password hashing |
| Nodemailer | Email delivery |
| Stripe | Payments |

### 11.3 Mapping (Free/OSS)

| Technology | Purpose |
|------------|---------|
| Leaflet | Map rendering |
| OpenStreetMap | Map tiles |
| Nominatim API | Reverse geocoding |
| Overpass API | Nearby places |

---

## 12. Security Requirements

### 12.1 Authentication

- [x] JWT-based session tokens
- [x] HTTP-only cookies (web) / Secure storage (mobile)
- [x] Password hashing with bcrypt (12 rounds)
- [x] Email verification required
- [x] Optional 2FA via email OTP
- [x] Session expiration (7 days)

### 12.2 Data Protection

- [x] HTTPS for all API calls
- [x] Sensitive data in secure storage
- [x] No plain text passwords
- [x] Role-based access control
- [x] Organization-level data isolation

### 12.3 NFC Security

- [x] Unique NFC IDs
- [x] Access logging (IP, timestamp, device)
- [x] No authentication required for emergency access (by design)

### 12.4 Location Sharing Security

- [x] Time-limited share tokens (1 hour default)
- [x] Unique random tokens (12 characters)
- [x] Deactivation capability
- [x] Access tracking

### 12.5 Compliance

- [x] PIPEDA compliance (Canadian privacy law)
- [x] Medical data handling best practices
- [x] Audit logging for all access
- [x] Data export capability
- [x] Account deletion option

---

## Appendix A: Environment Variables

### Mobile App (frontend/.env)

```env
API_URL=http://localhost:3000           # Development
# API_URL=https://medid.vercel.app      # Production
```

### Backend (NFC-Medical-Profile-Platform/.env)

```env
DATABASE_URL=postgresql://...
STORAGE_POSTGRES_URL=postgresql://...
NEXT_PUBLIC_APP_NAME=MedID
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=...
JWT_SECRET=...
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_QR_CODE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
IPINFO_TOKEN=...
```

---

## Appendix B: Running the Application

### Start Backend

```bash
cd /Users/mac/Documents/Project/NFC-Medical-Profile-Platform
npm run dev
# Runs on http://localhost:3000
```

### Start Mobile App

```bash
cd "/Users/mac/Documents/Project/NFC App/NFCApp/frontend"
npx expo start
```

### For Physical Device Testing

1. Get Mac's IP: `ipconfig getifaddr en0`
2. Update frontend/.env: `API_URL=http://192.168.x.x:3000`
3. Restart Expo

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2024 | Muhammad Umer | Initial PRD |

---

**END OF DOCUMENT**

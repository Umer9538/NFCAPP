/**
 * Types Index
 * Re-exports types from the database module with frontend-specific extensions
 */

// Re-export common types from database module
// ============================================
// FRONTEND-SPECIFIC TYPE ADAPTATIONS
// These maintain backward compatibility with existing frontend code
// ============================================

import type { AccountType } from '@database/types/common.types';
import type { User as DatabaseUser } from '@database/types/user.types';

export type {
  AccountType,
  UserRole,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  NotificationType,
  NotificationPriority,
  SubscriptionPlan,
  SubscriptionStatus,
  BraceletStatus,
  ActivityType,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  FilterParams,
} from '@database/types/common.types';

// Re-export user types
export type {
  User as DatabaseUser,
  UserWithRelations,
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  SignupInput,
  ChangePasswordInput,
  ResetPasswordInput,
  Session,
  Activity,
  HealthReminder,
} from '@database/types/user.types';

// Re-export medical types
export type {
  Allergy as DatabaseAllergy,
  Medication as DatabaseMedication,
  MedicalCondition as DatabaseMedicalCondition,
  MedicalProfile,
  MedicalProfileParsed,
  CreateMedicalProfileInput,
  UpdateMedicalProfileInput,
  EmergencyContact as DatabaseEmergencyContact,
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
  DoctorInfo,
  CreateDoctorInfoInput,
  UpdateDoctorInfoInput,
  Prescription,
  BloodType,
  AllergySeverity,
  MedicationFrequency,
} from '@database/types/medical.types';

// Re-export bracelet types
export type {
  Bracelet,
  LinkBraceletInput,
  BraceletAccessLog,
  EmergencyProfileAccess,
} from '@database/types/bracelet.types';

// Re-export subscription types
export type {
  Subscription,
  Invoice,
  CreateSubscriptionInput,
  SubscriptionPlanDetails,
} from '@database/types/subscription.types';

// Re-export organization types
export * from '@database/types/organization.types';

// Re-export incident types
export * from '@database/types/incident.types';

/**
 * Frontend User type (adapted for existing screens)
 * Uses firstName/lastName instead of fullName
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  accountType: AccountType;
  organizationId?: string;
  role?: string;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Frontend EmergencyContact type (adapted field names)
 */
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Frontend MedicalCondition type
 */
export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

/**
 * Frontend Medication type
 */
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  startDate?: string;
}

/**
 * Frontend Allergy type
 */
export interface Allergy {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;
}

/**
 * Frontend EmergencyProfile type
 */
export interface EmergencyProfile {
  id: string;
  userId: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  emergencyContacts: EmergencyContact[];
  additionalNotes?: string;
  isActive: boolean;
  nfcTagId?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Frontend NFCTag type
 */
export interface NFCTag {
  id: string;
  tagId: string;
  userId: string;
  profileId: string;
  isActive: boolean;
  createdAt: string;
  lastScannedAt?: string;
}

/**
 * Frontend ScanLog type
 */
export interface ScanLog {
  id: string;
  tagId: string;
  scannedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Helper function to convert database user to frontend user
 */
export function adaptDatabaseUser(dbUser: DatabaseUser): User {
  const nameParts = dbUser.fullName?.split(' ') || ['', ''];
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    phoneNumber: dbUser.phoneNumber || undefined,
    emailVerified: dbUser.emailVerified,
    twoFactorEnabled: dbUser.twoFactorEnabled,
    accountType: dbUser.accountType,
    organizationId: dbUser.organizationId || undefined,
    role: dbUser.role || undefined,
    suspended: dbUser.suspended,
    createdAt: dbUser.createdAt.toString(),
    updatedAt: dbUser.updatedAt.toString(),
  };
}

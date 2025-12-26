import { AccountType, UserRole } from './common.types';
import { MedicalProfile, EmergencyContact, DoctorInfo } from './medical.types';
import { Bracelet } from './bracelet.types';
import { Organization } from './organization.types';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  profileComplete: boolean;
  accountType: AccountType;
  organizationId?: string | null;
  role?: UserRole | null;
  suspended: boolean;
  phoneNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  height?: string | null;
  // Education-specific
  grade?: string | null;
  className?: string | null;
  campus?: string | null;
  studentId?: string | null;
  // Notification preferences
  notifyProfileAccess: boolean;
  notifySubscriptionUpdates: boolean;
  notifySecurityAlerts: boolean;
  notifyMarketingEmails: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends User {
  medicalProfile?: MedicalProfile | null;
  emergencyContacts?: EmergencyContact[];
  doctorInfo?: DoctorInfo | null;
  bracelet?: Bracelet | null;
  organization?: Organization | null;
}

export interface CreateUserInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  accountType?: AccountType;
  organizationId?: string;
  role?: UserRole;
  phoneNumber?: string;
  // Education-specific
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  height?: string;
  // Education-specific
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
  // Notification preferences
  notifyProfileAccess?: boolean;
  notifySubscriptionUpdates?: boolean;
  notifySecurityAlerts?: boolean;
  notifyMarketingEmails?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  accountType?: AccountType;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  type: string;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface HealthReminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}


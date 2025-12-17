/**
 * Dashboard Types
 * TypeScript types for dashboard data
 */

export interface DashboardStats {
  profileCompleteness: {
    percentage: number;
    missingFields: string[];
  };
  braceletStatus: {
    isActive: boolean;
    lastScan?: string;
    tagId?: string;
  };
  recentAccesses: {
    count: number;
    lastAccess?: string;
  };
  subscription: {
    isActive: boolean;
    plan: string;
    expiresAt?: string;
  };
}

export interface HealthReminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'medication' | 'appointment' | 'checkup' | 'other';
  completed: boolean;
}

export interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  location?: string;
  type: 'scan' | 'update' | 'access' | 'login' | 'other';
  icon?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  reminders: HealthReminder[];
  recentActivities: RecentActivity[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactInput {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export interface DoctorInfo {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  address?: string;
  updatedAt?: string;
}

export interface DoctorInfoInput {
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  address?: string;
}

// Emergency Profile Types
export interface EmergencyProfile {
  id: string;
  braceletId: string;
  isActive: boolean;

  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;

  // Critical Information
  bloodType?: string;
  allergies: Allergy[];
  medications: Medication[];
  medicalConditions: MedicalCondition[];

  // Emergency Contacts
  emergencyContacts: EmergencyContact[];

  // Doctor Information
  doctor?: DoctorInfo;

  // Additional Information
  dnrStatus: boolean;
  organDonor: boolean;
  height?: string;
  weight?: string;
  emergencyNotes?: string;

  // Metadata
  lastUpdated: string;
  accessCount: number;
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedFor?: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  status: 'active' | 'chronic' | 'resolved';
  notes?: string;
}

// Activity/Audit Log Types
export type ActivityType = 'access' | 'update' | 'system' | 'security' | 'login' | 'scan';

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  timestamp: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  device?: {
    type: string;
    os?: string;
    browser?: string;
  };
  ipAddress?: string;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
}

export interface ActivityFilters {
  dateFrom?: string;
  dateTo?: string;
  types?: ActivityType[];
  search?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

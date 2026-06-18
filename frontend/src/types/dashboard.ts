/**
 * Dashboard Types
 * TypeScript types for dashboard data
 */

export type StatChangeType = 'positive' | 'neutral' | 'negative';

export interface ProfileStatusStat {
  value: string;
  percentage: number;
  change: string;
  changeType: StatChangeType;
  missingFields?: string[];
}

export interface BraceletStatusStat {
  value: 'Linked' | 'Not Linked' | string;
  change: string;
  changeType: StatChangeType;
}

export interface ProfileAccessStat {
  value: string;
  change: string;
  changeType: StatChangeType;
}

export interface SubscriptionStatusStat {
  value: string;
  change: string;
  changeType: StatChangeType;
}

export interface DashboardStats {
  profileStatus: ProfileStatusStat;
  braceletStatus: BraceletStatusStat;
  profileAccess: ProfileAccessStat;
  subscriptionStatus: SubscriptionStatusStat;
}

export type DoseCriticality = 'critical' | 'important' | 'routine' | 'as_needed';
export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped' | 'snoozed';

export interface TodaysDose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string | null;
  dosageUnit: string | null;
  purpose: string | null;
  criticality: DoseCriticality;
  scheduledTime: string;
  status: DoseStatus;
  takenAt: string | null;
  takenLateMinutes: number | null;
  snoozedUntil: string | null;
  snoozeCount: number;
  snoozeEnabled: boolean;
  snoozeDuration: number;
}

export interface MedicationSummary {
  total: number;
  taken: number;
  pending: number;
  missed: number;
  snoozed: number;
  skipped: number;
}

export interface MedicationWidgetData {
  doses: TodaysDose[];
  summary: MedicationSummary;
  weeklyAdherence: number;
  streak: { current: number; longest: number };
  nextDose: TodaysDose | null;
}

export interface HealthReminder {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt?: string;
  dueDate?: string;
  type?: 'medication' | 'appointment' | 'checkup' | 'other';
}

export interface RecentActivity {
  id: string;
  action: string;
  type: string;
  location: string;
  time: string;
  timestamp?: string;
  description?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  reminders: HealthReminder[];
  recentActivity: RecentActivity[];
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

import { NotificationType, NotificationPriority, NotificationAudience } from './common.types';

export interface TeacherStudentAssignment {
  id: string;
  teacherId: string;
  studentId: string;
  className?: string | null;
  subject?: string | null;
  academicYear?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeacherStudentAssignmentInput {
  teacherId: string;
  studentId: string;
  className?: string;
  subject?: string;
  academicYear?: string;
}

export interface ParentChildRelationship {
  id: string;
  parentId: string;
  childId: string;
  relationship: string;
  isPrimary: boolean;
  canViewMedical: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateParentChildRelationshipInput {
  parentId: string;
  childId: string;
  relationship: string;
  isPrimary?: boolean;
  canViewMedical?: boolean;
}

export interface EmergencyNotification {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: NotificationAudience;
  targetGrade?: string | null;
  targetClass?: string | null;
  campus?: string | null;
  sentAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: NotificationAudience;
  targetGrade?: string;
  targetClass?: string;
  campus?: string;
  expiresAt?: string | Date;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  targetAudience?: NotificationAudience;
  search?: string;
}

// Student with education-specific fields
export interface Student {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  grade?: string | null;
  className?: string | null;
  campus?: string | null;
  studentId?: string | null;
  profileComplete: boolean;
  suspended: boolean;
  createdAt: Date;
}

export interface CreateStudentInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
}

export interface UpdateStudentInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
}

// Relationship types
export const RELATIONSHIP_TYPES = [
  'Mother',
  'Father',
  'Guardian',
  'Grandparent',
  'Aunt',
  'Uncle',
  'Sibling',
  'Other'
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];

// Grade levels
export const GRADE_LEVELS = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate'
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];


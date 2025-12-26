// Common types used across the application

export type AccountType = 'individual' | 'corporate' | 'construction' | 'education';

export type UserRole = 
  | 'admin' 
  | 'employee' 
  | 'supervisor' 
  | 'worker' 
  | 'teacher' 
  | 'parent' 
  | 'student';

export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 'injury' | 'first_aid' | 'near_miss' | 'property_damage' | 'other';

export type NotificationType = 'emergency' | 'alert' | 'info' | 'weather';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationAudience = 'all' | 'students' | 'parents' | 'staff' | 'teachers';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export type BraceletStatus = 'active' | 'inactive' | 'lost';

export type ActivityType = 'access' | 'update' | 'system' | 'security';

export type VerificationCodeType = 'EMAIL_VERIFICATION' | 'TWO_FACTOR' | 'PASSWORD_RESET';

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FilterParams {
  search?: string;
  status?: string;
  severity?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}


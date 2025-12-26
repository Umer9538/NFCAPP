/**
 * Audit Types
 * TypeScript types for audit logs and access tracking
 */

export type AuditLogType =
  | 'login'
  | 'logout'
  | 'profile_access'
  | 'profile_update'
  | 'bracelet_scan'
  | 'qr_scan'
  | 'password_change'
  | 'settings_change'
  | 'emergency_access'
  | 'data_export'
  | 'account_update';

export type AuditLogStatus = 'success' | 'failure' | 'warning';

export interface AuditLogActor {
  id: string;
  name: string;
  type: 'self' | 'user' | 'system' | 'emergency_responder';
}

export interface AuditLogLocation {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  isp?: string;
}

export interface AuditLogDevice {
  type?: string;
  browser?: string;
  os?: string;
  platform?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  type: AuditLogType;
  action: string;
  description?: string;
  actor: AuditLogActor;
  status: AuditLogStatus;
  ipAddress?: string;
  location?: AuditLogLocation;
  device?: AuditLogDevice;
  metadata?: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
}

export interface AuditLogStats {
  totalAccesses: number;
  thisMonth: number;
  failedAttempts: number;
  uniqueLocations: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  stats: AuditLogStats;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogFilters {
  type?: AuditLogType | 'all';
  status?: AuditLogStatus | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
}

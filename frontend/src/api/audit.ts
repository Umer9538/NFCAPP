/**
 * Audit API
 * API endpoints for audit logs and access tracking - Using Backend API
 * Matches website implementation
 */

import { api } from './client';
import type {
  AuditLog,
  AuditLogStats,
  AuditLogsResponse,
  AuditLogFilters,
  AuditLogType,
  AuditLogStatus,
} from '@/types/audit';

/**
 * Get audit logs with pagination and filters
 * GET /api/audit-logs
 */
export async function getAuditLogs(
  page: number = 1,
  pageSize: number = 20,
  filters?: AuditLogFilters
): Promise<AuditLogsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await api.get<AuditLogsResponse>(
      `/api/audit-logs?${params.toString()}`
    );

    return response;
  } catch (error: any) {
    console.error('[Audit API] Error getting audit logs:', error);

    // Return empty response on error
    if (error.response?.status === 404) {
      return {
        logs: [],
        stats: {
          totalAccesses: 0,
          thisMonth: 0,
          failedAttempts: 0,
          uniqueLocations: 0,
        },
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        },
      };
    }

    throw error;
  }
}

/**
 * Get audit log stats
 * GET /api/audit-logs/stats
 */
export async function getAuditStats(): Promise<AuditLogStats> {
  try {
    const response = await api.get<AuditLogStats>('/api/audit-logs/stats');
    return response;
  } catch (error: any) {
    console.error('[Audit API] Error getting audit stats:', error);

    // Return empty stats on error
    return {
      totalAccesses: 0,
      thisMonth: 0,
      failedAttempts: 0,
      uniqueLocations: 0,
    };
  }
}

/**
 * Get single audit log by ID
 * GET /api/audit-logs/:id
 */
export async function getAuditLog(id: string): Promise<AuditLog | null> {
  try {
    const response = await api.get<AuditLog>(`/api/audit-logs/${id}`);
    return response;
  } catch (error: any) {
    console.error('[Audit API] Error getting audit log:', error);

    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * Export audit logs as CSV/PDF
 * GET /api/audit-logs/export
 */
export async function exportAuditLogs(
  format: 'csv' | 'pdf' = 'csv',
  filters?: AuditLogFilters
): Promise<{ url: string; filename: string }> {
  try {
    const params = new URLSearchParams({ format });

    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await api.get<{ url: string; filename: string }>(
      `/api/audit-logs/export?${params.toString()}`
    );

    return response;
  } catch (error: any) {
    console.error('[Audit API] Error exporting audit logs:', error);
    throw error;
  }
}

export const auditApi = {
  getAuditLogs,
  getAuditStats,
  getAuditLog,
  exportAuditLogs,
};

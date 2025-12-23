/**
 * Organizations API
 * API calls for organization management (Corporate, Construction, Education)
 */

import { api } from './client';
import type { AccountType } from '@/config/dashboardConfig';

/**
 * Organization Type (subset of AccountType for orgs only)
 */
export type OrganizationType = Exclude<AccountType, 'individual'>;

/**
 * Organization Model
 */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  domain?: string;
  logo?: string;
  address?: string;
  phone?: string;
  employeeCount?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Employee Model
 */
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  profileComplete: boolean;
  emailVerified: boolean;
  status: 'active' | 'pending' | 'inactive';
  suspended: boolean;
  joinedAt?: string;
  createdAt: string;
}

/**
 * Allergy Info for Medical Records
 */
export interface AllergyInfo {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction?: string;
}

/**
 * Medication Info for Medical Records
 */
export interface MedicationInfo {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
}

/**
 * Medical Condition Info
 */
export interface ConditionInfo {
  id: string;
  name: string;
  severity?: 'mild' | 'moderate' | 'severe';
  diagnosedDate?: string;
}

/**
 * Employee Medical Info Model
 */
export interface EmployeeMedicalInfo {
  userId: string;
  employeeName: string;
  email: string;
  bloodType?: string;
  allergies: AllergyInfo[];
  medications: MedicationInfo[];
  conditions: ConditionInfo[];
  emergencyContactsCount: number;
  profileComplete: boolean;
  lastUpdated?: string;
}

/**
 * Incident Report Model
 */
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  incidentDate: string;
  location?: string;
  reportedById: string;
  reportedByName: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
  notes?: string;
}

export interface CreateIncidentReportRequest {
  employeeId: string;
  title: string;
  description: string;
  incidentDate: string;
  location?: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentReportRequest {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  location?: string;
  notes?: string;
}

export interface IncidentReportStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  closed: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

/**
 * Create Organization Request
 */
export interface CreateOrgRequest {
  name: string;
  type: OrganizationType;
  domain?: string;
  address?: string;
  phone?: string;
}

/**
 * Update Organization Request
 */
export interface UpdateOrgRequest {
  name?: string;
  domain?: string;
  logo?: string;
  address?: string;
  phone?: string;
}

/**
 * Add Employee Request
 */
export interface AddEmployeeRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
}

/**
 * Update Employee Request
 */
export interface UpdateEmployeeRequest {
  employeeId: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * API Response Types
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Create organization for current user
 */
export async function createMyOrg(data: CreateOrgRequest): Promise<Organization> {
  try {
    const response = await api.post<Organization>('/api/organizations/create-my-org', data);
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Create org error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockOrg: Organization = {
        id: `org-${Date.now()}`,
        name: data.name,
        type: data.type,
        domain: data.domain,
        address: data.address,
        phone: data.phone,
        employeeCount: 0,
        createdById: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return mockOrg;
    }

    throw new Error(error.message || 'Failed to create organization');
  }
}

/**
 * Get current user's organization
 */
export async function getMyOrg(): Promise<Organization | null> {
  try {
    const response = await api.get<Organization>('/api/organizations/my-org');
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Get my org error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        id: 'demo-org-1',
        name: 'Demo Corporation',
        type: 'corporate',
        domain: 'demo.com',
        employeeCount: 15,
        createdById: 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Return null if no org found (404)
    if (error.status === 404) {
      return null;
    }

    throw new Error(error.message || 'Failed to get organization');
  }
}

/**
 * Update current user's organization
 */
export async function updateMyOrg(data: UpdateOrgRequest): Promise<Organization> {
  try {
    const response = await api.put<Organization>('/api/organizations/my-org', data);
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Update org error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        id: 'demo-org-1',
        name: data.name || 'Demo Corporation',
        type: 'corporate',
        domain: data.domain,
        logo: data.logo,
        address: data.address,
        phone: data.phone,
        employeeCount: 15,
        createdById: 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    throw new Error(error.message || 'Failed to update organization');
  }
}

/**
 * Get organization employees
 */
export async function getEmployees(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<Employee>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    console.log('[Organizations API] Fetching employees...');
    const response = await api.get<any>(
      `/api/organizations/employees?${params.toString()}`
    );
    console.log('[Organizations API] Employees response:', JSON.stringify(response, null, 2));

    // Handle different response formats from backend
    // Backend may return { employees: [...] } or { data: [...] } or [...]
    let employees: Employee[] = [];
    let total = 0;

    if (Array.isArray(response)) {
      // Response is directly an array
      employees = response.map(transformEmployee);
      total = employees.length;
    } else if (response?.employees) {
      // Response has employees property
      employees = (response.employees || []).map(transformEmployee);
      total = response.total || response.pagination?.total || employees.length;
    } else if (response?.data) {
      // Response has data property
      employees = (response.data || []).map(transformEmployee);
      total = response.total || response.pagination?.total || employees.length;
    } else if (response?.users) {
      // Response has users property (some backends use this)
      employees = (response.users || []).map(transformEmployee);
      total = response.total || response.pagination?.total || employees.length;
    }

    return {
      data: employees,
      total,
      page: response?.page || response?.pagination?.page || page,
      pageSize: response?.pageSize || response?.pagination?.pageSize || pageSize,
      totalPages: response?.totalPages || response?.pagination?.totalPages || Math.ceil(total / pageSize),
    };
  } catch (error: any) {
    console.error('[Organizations API] Get employees error:', error);
    console.error('[Organizations API] Error details:', error.response?.data || error.message);

    // Return empty on error instead of mock data
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

/**
 * Transform backend employee data to app format
 */
function transformEmployee(emp: any): Employee {
  return {
    id: emp.id || emp._id,
    fullName: emp.fullName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
    email: emp.email,
    phoneNumber: emp.phoneNumber || emp.phone,
    department: emp.department,
    position: emp.position || emp.role || emp.jobTitle,
    profileComplete: emp.profileComplete ?? emp.isProfileComplete ?? false,
    emailVerified: emp.emailVerified ?? emp.isEmailVerified ?? false,
    status: emp.status || (emp.isActive ? 'active' : 'pending'),
    suspended: emp.suspended ?? emp.isSuspended ?? false,
    joinedAt: emp.joinedAt || emp.createdAt,
    createdAt: emp.createdAt,
  };
}

/**
 * Add employee to organization
 */
export async function addEmployee(data: AddEmployeeRequest): Promise<Employee> {
  try {
    const response = await api.post<Employee>('/api/organizations/employees', data);
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Add employee error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockEmployee: Employee = {
        id: `emp-${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        department: data.department,
        position: data.position,
        profileComplete: false,
        emailVerified: false,
        status: 'pending',
        suspended: false,
        createdAt: new Date().toISOString(),
      };
      return mockEmployee;
    }

    throw new Error(error.message || 'Failed to add employee');
  }
}

/**
 * Remove employee from organization
 */
export async function removeEmployee(employeeId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.delete<{ success: boolean }>(
      `/api/organizations/employees/${employeeId}`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Remove employee error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return { success: true };
    }

    throw new Error(error.message || 'Failed to remove employee');
  }
}

/**
 * Update employee information
 */
export async function updateEmployee(data: UpdateEmployeeRequest): Promise<Employee> {
  try {
    const response = await api.put<Employee>('/api/organizations/employees', data);
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Update employee error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockEmployee: Employee = {
        id: data.employeeId,
        fullName: data.fullName || 'Updated Employee',
        email: data.email || 'updated@demo.com',
        phoneNumber: data.phoneNumber,
        profileComplete: true,
        emailVerified: true,
        status: 'active',
        suspended: false,
        createdAt: new Date().toISOString(),
      };
      return mockEmployee;
    }

    throw new Error(error.message || 'Failed to update employee');
  }
}

/**
 * Delete employee from organization
 */
export async function deleteEmployee(employeeId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.delete<{ success: boolean }>(
      '/api/organizations/employees',
      { data: { employeeId } }
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Delete employee error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return { success: true };
    }

    throw new Error(error.message || 'Failed to delete employee');
  }
}

/**
 * Suspend or unsuspend employee access
 */
export async function suspendEmployee(
  employeeId: string,
  suspend: boolean
): Promise<{ success: boolean }> {
  try {
    const response = await api.patch<{ success: boolean }>(
      '/api/organizations/employees',
      { employeeId, action: suspend ? 'suspend' : 'unsuspend' }
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Suspend employee error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return { success: true };
    }

    throw new Error(error.message || `Failed to ${suspend ? 'suspend' : 'unsuspend'} employee`);
  }
}

/**
 * Resend employee invitation
 */
export async function resendEmployeeInvite(employeeId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.post<{ success: boolean }>(
      `/api/organizations/employees/${employeeId}/resend-invite`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Resend invite error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return { success: true };
    }

    throw new Error(error.message || 'Failed to resend invitation');
  }
}

/**
 * Get organization medical info (all employees' medical data)
 */
export async function getMedicalInfo(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<EmployeeMedicalInfo>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await api.get<PaginatedResponse<EmployeeMedicalInfo>>(
      `/api/organizations/medical-info?${params.toString()}`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Get medical info error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockMedicalInfo: EmployeeMedicalInfo[] = [
        {
          userId: 'emp-1',
          employeeName: 'John Smith',
          email: 'john.smith@demo.com',
          bloodType: 'A+',
          allergies: [
            { id: 'a1', name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis' },
          ],
          medications: [
            { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
          ],
          conditions: [
            { id: 'c1', name: 'Hypertension', severity: 'moderate' },
          ],
          emergencyContactsCount: 2,
          profileComplete: true,
          lastUpdated: '2024-03-01T00:00:00Z',
        },
        {
          userId: 'emp-2',
          employeeName: 'Sarah Johnson',
          email: 'sarah.johnson@demo.com',
          bloodType: 'O-',
          allergies: [],
          medications: [],
          conditions: [],
          emergencyContactsCount: 1,
          profileComplete: true,
          lastUpdated: '2024-02-15T00:00:00Z',
        },
        {
          userId: 'emp-3',
          employeeName: 'Mike Williams',
          email: 'mike.williams@demo.com',
          allergies: [],
          medications: [],
          conditions: [],
          emergencyContactsCount: 0,
          profileComplete: false,
        },
      ];

      return {
        data: mockMedicalInfo,
        total: mockMedicalInfo.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
    }

    throw new Error(error.message || 'Failed to get medical info');
  }
}

/**
 * Get organization incident reports
 */
export async function getIncidentReports(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    search?: string;
  }
): Promise<PaginatedResponse<IncidentReport>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.severity) {
      params.append('severity', filters.severity);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    console.log('[Organizations API] Fetching incident reports...');
    const response = await api.get<any>(
      `/api/organizations/incident-reports?${params.toString()}`
    );
    console.log('[Organizations API] Incident reports response:', JSON.stringify(response, null, 2));

    // Handle different response formats
    let reports: IncidentReport[] = [];
    let total = 0;

    if (Array.isArray(response)) {
      reports = response.map(transformIncidentReport);
      total = reports.length;
    } else if (response?.reports) {
      reports = (response.reports || []).map(transformIncidentReport);
      total = response.total || reports.length;
    } else if (response?.data) {
      reports = (response.data || []).map(transformIncidentReport);
      total = response.total || reports.length;
    } else if (response?.incidentReports) {
      reports = (response.incidentReports || []).map(transformIncidentReport);
      total = response.total || reports.length;
    }

    return {
      data: reports,
      total,
      page: response?.page || page,
      pageSize: response?.pageSize || pageSize,
      totalPages: response?.totalPages || Math.ceil(total / pageSize),
    };
  } catch (error: any) {
    console.error('[Organizations API] Get incident reports error:', error);
    console.error('[Organizations API] Error details:', error.response?.data || error.message);

    // Return empty on error
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

/**
 * Transform backend incident report data to app format
 */
function transformIncidentReport(report: any): IncidentReport {
  return {
    id: report.id || report._id,
    title: report.title,
    description: report.description,
    employeeId: report.employeeId || report.employee_id || report.affectedEmployeeId,
    employeeName: report.employeeName || report.employee_name || report.affectedEmployeeName || 'Unknown',
    employeeEmail: report.employeeEmail || report.employee_email,
    severity: report.severity || 'low',
    status: report.status || 'open',
    incidentDate: report.incidentDate || report.incident_date || report.dateOccurred || report.createdAt,
    location: report.location,
    reportedById: report.reportedById || report.reported_by_id || report.reporterId,
    reportedByName: report.reportedByName || report.reported_by_name || report.reporterName || 'Unknown',
    createdAt: report.createdAt || report.created_at || report.dateReported,
    updatedAt: report.updatedAt || report.updated_at,
    resolvedAt: report.resolvedAt || report.resolved_at,
    resolvedById: report.resolvedById || report.resolved_by_id,
    resolvedByName: report.resolvedByName || report.resolved_by_name,
    notes: report.notes,
  };
}

/**
 * Get single incident report by ID
 */
export async function getIncidentReport(reportId: string): Promise<IncidentReport> {
  try {
    const response = await api.get<any>(`/api/organizations/incident-reports/${reportId}`);
    const report = response?.report || response?.incidentReport || response;
    return transformIncidentReport(report);
  } catch (error: any) {
    console.error('[Organizations API] Get incident report error:', error);
    throw new Error(error.message || 'Failed to get incident report');
  }
}

/**
 * Get incident report statistics
 */
export async function getIncidentReportStats(): Promise<IncidentReportStats> {
  try {
    const response = await api.get<any>('/api/organizations/incident-reports/stats');
    return {
      total: response.total || 0,
      open: response.open || response.byStatus?.open || 0,
      investigating: response.investigating || response.byStatus?.investigating || 0,
      resolved: response.resolved || response.byStatus?.resolved || 0,
      closed: response.closed || response.byStatus?.closed || 0,
      bySeverity: {
        low: response.bySeverity?.low || 0,
        medium: response.bySeverity?.medium || 0,
        high: response.bySeverity?.high || 0,
        critical: response.bySeverity?.critical || 0,
      },
    };
  } catch (error: any) {
    console.error('[Organizations API] Get incident stats error:', error);
    // Return empty stats on error
    return {
      total: 0,
      open: 0,
      investigating: 0,
      resolved: 0,
      closed: 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    };
  }
}

/**
 * Create incident report
 */
export async function createIncidentReport(
  data: CreateIncidentReportRequest
): Promise<IncidentReport> {
  try {
    const response = await api.post<any>(
      '/api/organizations/incident-reports',
      data
    );
    const report = response?.report || response?.incidentReport || response;
    return transformIncidentReport(report);
  } catch (error: any) {
    console.error('[Organizations API] Create incident report error:', error);
    throw new Error(error.message || 'Failed to create incident report');
  }
}

/**
 * Update incident report
 */
export async function updateIncidentReport(
  reportId: string,
  data: UpdateIncidentReportRequest
): Promise<IncidentReport> {
  try {
    const response = await api.put<any>(
      `/api/organizations/incident-reports/${reportId}`,
      data
    );
    const report = response?.report || response?.incidentReport || response;
    return transformIncidentReport(report);
  } catch (error: any) {
    console.error('[Organizations API] Update incident report error:', error);
    throw new Error(error.message || 'Failed to update incident report');
  }
}

/**
 * Update incident report status
 */
export async function updateIncidentStatus(
  reportId: string,
  status: IncidentStatus,
  notes?: string
): Promise<IncidentReport> {
  try {
    const response = await api.patch<any>(
      `/api/organizations/incident-reports/${reportId}/status`,
      { status, notes }
    );
    const report = response?.report || response?.incidentReport || response;
    return transformIncidentReport(report);
  } catch (error: any) {
    console.error('[Organizations API] Update incident status error:', error);
    throw new Error(error.message || 'Failed to update incident status');
  }
}

/**
 * Delete incident report
 */
export async function deleteIncidentReport(reportId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.delete<{ success: boolean }>(
      `/api/organizations/incident-reports/${reportId}`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Delete incident report error:', error);
    throw new Error(error.message || 'Failed to delete incident report');
  }
}

/**
 * Get organization statistics/dashboard data
 */
export async function getOrgStats(): Promise<{
  totalEmployees: number;
  activeEmployees: number;
  pendingInvites: number;
  profileCompletionRate: number;
  incidentReportsThisMonth: number;
  openIncidents: number;
}> {
  try {
    const response = await api.get<{
      totalEmployees: number;
      activeEmployees: number;
      pendingInvites: number;
      profileCompletionRate: number;
      incidentReportsThisMonth: number;
      openIncidents: number;
    }>('/api/organizations/stats');
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Get org stats error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        totalEmployees: 15,
        activeEmployees: 12,
        pendingInvites: 3,
        profileCompletionRate: 80,
        incidentReportsThisMonth: 2,
        openIncidents: 1,
      };
    }

    throw new Error(error.message || 'Failed to get organization stats');
  }
}

/**
 * Export organizations API
 */
export const organizationsApi = {
  createMyOrg,
  getMyOrg,
  updateMyOrg,
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  suspendEmployee,
  removeEmployee,
  resendEmployeeInvite,
  getMedicalInfo,
  getIncidentReports,
  getIncidentReport,
  getIncidentReportStats,
  createIncidentReport,
  updateIncidentReport,
  updateIncidentStatus,
  deleteIncidentReport,
  getOrgStats,
};

/**
 * Organizations API
 * API calls for organization management (Corporate, Construction, Education)
 * Connected to real backend
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
  return await api.post<Organization>('/api/organizations/create-my-org', data);
}

/**
 * Get current user's organization
 */
export async function getMyOrg(): Promise<Organization | null> {
  try {
    return await api.get<Organization>('/api/organizations/my-org');
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Update current user's organization
 */
export async function updateMyOrg(data: UpdateOrgRequest): Promise<Organization> {
  return await api.put<Organization>('/api/organizations/my-org', data);
}

/**
 * Get organization employees
 */
export async function getEmployees(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<Employee>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) {
    params.append('search', search);
  }

  const response = await api.get<any>(
    `/api/organizations/employees?${params.toString()}`
  );

  // Handle different response formats from backend
  let employees: Employee[] = [];
  let total = 0;

  if (Array.isArray(response)) {
    employees = response.map(transformEmployee);
    total = employees.length;
  } else if (response?.employees) {
    employees = (response.employees || []).map(transformEmployee);
    total = response.total || response.pagination?.total || employees.length;
  } else if (response?.data) {
    employees = (response.data || []).map(transformEmployee);
    total = response.total || response.pagination?.total || employees.length;
  } else if (response?.users) {
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
  return await api.post<Employee>('/api/organizations/employees', data);
}

/**
 * Remove employee from organization
 */
export async function removeEmployee(employeeId: string): Promise<{ success: boolean }> {
  return await api.delete<{ success: boolean }>(
    `/api/organizations/employees/${employeeId}`
  );
}

/**
 * Update employee information
 */
export async function updateEmployee(data: UpdateEmployeeRequest): Promise<Employee> {
  return await api.put<Employee>('/api/organizations/employees', data);
}

/**
 * Delete employee from organization
 */
export async function deleteEmployee(employeeId: string): Promise<{ success: boolean }> {
  return await api.delete<{ success: boolean }>(
    '/api/organizations/employees',
    { data: { employeeId } }
  );
}

/**
 * Suspend or unsuspend employee access
 */
export async function suspendEmployee(
  employeeId: string,
  suspend: boolean
): Promise<{ success: boolean }> {
  return await api.patch<{ success: boolean }>(
    '/api/organizations/employees',
    { employeeId, action: suspend ? 'suspend' : 'unsuspend' }
  );
}

/**
 * Resend employee invitation
 */
export async function resendEmployeeInvite(employeeId: string): Promise<{ success: boolean }> {
  return await api.post<{ success: boolean }>(
    `/api/organizations/employees/${employeeId}/resend-invite`
  );
}

/**
 * Get organization medical info (all employees' medical data)
 */
export async function getMedicalInfo(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<EmployeeMedicalInfo>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) {
    params.append('search', search);
  }

  return await api.get<PaginatedResponse<EmployeeMedicalInfo>>(
    `/api/organizations/medical-info?${params.toString()}`
  );
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

  const response = await api.get<any>(
    `/api/organizations/incident-reports?${params.toString()}`
  );

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
  const response = await api.get<any>(`/api/organizations/incident-reports/${reportId}`);
  const report = response?.report || response?.incidentReport || response;
  return transformIncidentReport(report);
}

/**
 * Get incident report statistics
 */
export async function getIncidentReportStats(): Promise<IncidentReportStats> {
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
}

/**
 * Create incident report
 */
export async function createIncidentReport(
  data: CreateIncidentReportRequest
): Promise<IncidentReport> {
  const response = await api.post<any>(
    '/api/organizations/incident-reports',
    data
  );
  const report = response?.report || response?.incidentReport || response;
  return transformIncidentReport(report);
}

/**
 * Update incident report
 */
export async function updateIncidentReport(
  reportId: string,
  data: UpdateIncidentReportRequest
): Promise<IncidentReport> {
  const response = await api.put<any>(
    `/api/organizations/incident-reports/${reportId}`,
    data
  );
  const report = response?.report || response?.incidentReport || response;
  return transformIncidentReport(report);
}

/**
 * Update incident report status
 */
export async function updateIncidentStatus(
  reportId: string,
  status: IncidentStatus,
  notes?: string
): Promise<IncidentReport> {
  const response = await api.patch<any>(
    `/api/organizations/incident-reports/${reportId}/status`,
    { status, notes }
  );
  const report = response?.report || response?.incidentReport || response;
  return transformIncidentReport(report);
}

/**
 * Delete incident report
 */
export async function deleteIncidentReport(reportId: string): Promise<{ success: boolean }> {
  return await api.delete<{ success: boolean }>(
    `/api/organizations/incident-reports/${reportId}`
  );
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
  return await api.get('/api/organizations/stats');
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

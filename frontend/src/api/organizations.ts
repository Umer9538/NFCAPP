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

// ============================================
// OSHA Compliance (Construction)
// ============================================

export type OSHAComplianceStatus = 'compliant' | 'non_compliant' | 'pending';

export interface OSHAComplianceMetric {
  id: string;
  organizationId: string;
  category: string;
  status: OSHAComplianceStatus;
  lastReview: string;
  nextReview: string;
  violations: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OSHAComplianceStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  complianceRate: number;
  upcomingReviews: number;
}

export interface CreateOSHAMetricRequest {
  category: string;
  status: OSHAComplianceStatus;
  lastReview: string;
  nextReview: string;
  violations?: number;
  notes?: string;
}

export interface UpdateOSHAMetricRequest {
  status?: OSHAComplianceStatus;
  lastReview?: string;
  nextReview?: string;
  violations?: number;
  notes?: string;
}

/**
 * Get OSHA compliance metrics
 */
export async function getOSHACompliance(): Promise<{
  metrics: OSHAComplianceMetric[];
  stats: OSHAComplianceStats;
}> {
  const response = await api.get<any>('/api/organizations/osha-compliance');

  const metrics = (response?.metrics || response?.data || response || []).map((m: any) => ({
    id: m.id,
    organizationId: m.organizationId,
    category: m.category,
    status: m.status,
    lastReview: m.lastReview,
    nextReview: m.nextReview,
    violations: m.violations || 0,
    notes: m.notes,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  const stats = response?.stats || {
    total: metrics.length,
    compliant: metrics.filter((m: OSHAComplianceMetric) => m.status === 'compliant').length,
    nonCompliant: metrics.filter((m: OSHAComplianceMetric) => m.status === 'non_compliant').length,
    pending: metrics.filter((m: OSHAComplianceMetric) => m.status === 'pending').length,
    complianceRate: metrics.length > 0
      ? Math.round((metrics.filter((m: OSHAComplianceMetric) => m.status === 'compliant').length / metrics.length) * 100)
      : 0,
    upcomingReviews: metrics.filter((m: OSHAComplianceMetric) => {
      const reviewDate = new Date(m.nextReview);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return reviewDate <= thirtyDaysFromNow;
    }).length,
  };

  return { metrics, stats };
}

/**
 * Create OSHA compliance metric
 */
export async function createOSHAMetric(data: CreateOSHAMetricRequest): Promise<OSHAComplianceMetric> {
  return api.post<OSHAComplianceMetric>('/api/organizations/osha-compliance', data);
}

/**
 * Update OSHA compliance metric
 */
export async function updateOSHAMetric(
  metricId: string,
  data: UpdateOSHAMetricRequest
): Promise<OSHAComplianceMetric> {
  return api.put<OSHAComplianceMetric>(`/api/organizations/osha-compliance/${metricId}`, data);
}

// ============================================
// Training Records (Construction)
// ============================================

export type TrainingStatus = 'current' | 'expired' | 'expiring_soon';

export interface TrainingRecord {
  id: string;
  organizationId: string;
  workerId: string;
  workerName: string;
  trainingType: string;
  completedDate: string;
  expiryDate?: string;
  status: TrainingStatus;
  certificateNumber?: string;
  instructor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingStats {
  total: number;
  current: number;
  expired: number;
  expiringSoon: number;
  complianceRate: number;
  byType: Record<string, number>;
}

export interface CreateTrainingRecordRequest {
  workerId: string;
  trainingType: string;
  completedDate: string;
  expiryDate?: string;
}

/**
 * Get training records
 */
export async function getTrainingRecords(
  filters?: {
    page?: number;
    pageSize?: number;
    workerId?: string;
    status?: TrainingStatus;
    search?: string;
  }
): Promise<{
  records: TrainingRecord[];
  stats: TrainingStats;
}> {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters?.workerId) params.append('workerId', filters.workerId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get<any>(`/api/organizations/training-records?${params.toString()}`);

  const records = (response?.records || response?.data || response || []).map((r: any) => ({
    id: r.id,
    organizationId: r.organizationId,
    workerId: r.workerId,
    workerName: r.workerName,
    trainingType: r.trainingType,
    completedDate: r.completedDate,
    expiryDate: r.expiryDate,
    status: r.status || calculateTrainingStatus(r.expiryDate),
    certificateNumber: r.certificateNumber,
    instructor: r.instructor,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const stats = response?.stats || calculateTrainingStats(records);

  return { records, stats };
}

/**
 * Calculate training status based on expiry date
 */
function calculateTrainingStatus(expiryDate?: string): TrainingStatus {
  if (!expiryDate) return 'current';

  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < now) return 'expired';
  if (expiry <= thirtyDaysFromNow) return 'expiring_soon';
  return 'current';
}

/**
 * Calculate training stats
 */
function calculateTrainingStats(records: TrainingRecord[]): TrainingStats {
  const byType: Record<string, number> = {};

  records.forEach(r => {
    byType[r.trainingType] = (byType[r.trainingType] || 0) + 1;
  });

  const current = records.filter(r => r.status === 'current').length;
  const total = records.length;

  return {
    total,
    current,
    expired: records.filter(r => r.status === 'expired').length,
    expiringSoon: records.filter(r => r.status === 'expiring_soon').length,
    complianceRate: total > 0 ? Math.round((current / total) * 100) : 0,
    byType,
  };
}

/**
 * Create training record
 */
export async function createTrainingRecord(data: CreateTrainingRecordRequest): Promise<TrainingRecord> {
  return api.post<TrainingRecord>('/api/organizations/training-records', data);
}

// ============================================
// Emergency Notifications (Education)
// ============================================

export type NotificationType = 'emergency' | 'alert' | 'info' | 'weather';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationAudience = 'all' | 'students' | 'parents' | 'staff' | 'teachers';

export interface EmergencyNotification {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: NotificationAudience[];
  targetGrade?: string;
  targetClass?: string;
  campus?: string;
  sentAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: NotificationAudience[];
  targetGrade?: string;
  targetClass?: string;
  campus?: string;
  expiresAt?: string;
}

// Alias for backwards compatibility
export type SendNotificationRequest = CreateNotificationRequest;

/**
 * Get emergency notifications
 */
export async function getEmergencyNotifications(): Promise<EmergencyNotification[]> {
  const response = await api.get<any>('/api/organizations/emergency-notifications');
  return response?.notifications || response?.data || response || [];
}

/**
 * Send emergency notification
 */
export async function sendEmergencyNotification(
  data: CreateNotificationRequest
): Promise<EmergencyNotification> {
  return api.post<EmergencyNotification>('/api/organizations/emergency-notifications', data);
}

// ============================================
// Students (Education)
// ============================================

export interface Student {
  id: string;
  fullName: string;
  email: string;
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
  profileComplete: boolean;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

/**
 * Get students
 * @param filters.teacherId - For teachers: only return assigned students
 * @param filters.parentId - For parents: only return their children
 */
export async function getStudents(
  page: number = 1,
  pageSize: number = 20,
  filters?: { grade?: string; className?: string; search?: string; teacherId?: string; parentId?: string }
): Promise<PaginatedResponse<Student>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (filters?.grade) params.append('grade', filters.grade);
  if (filters?.className) params.append('className', filters.className);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.teacherId) params.append('teacherId', filters.teacherId);
  if (filters?.parentId) params.append('parentId', filters.parentId);

  const response = await api.get<any>(`/api/organizations/students?${params.toString()}`);

  const students = (response?.students || response?.data || response || []).map((s: any) => ({
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    grade: s.grade,
    className: s.className,
    campus: s.campus,
    studentId: s.studentId,
    profileComplete: s.profileComplete || false,
    status: s.status || 'active',
    createdAt: s.createdAt,
  }));

  return {
    data: students,
    total: response?.total || students.length,
    page: response?.page || page,
    pageSize: response?.pageSize || pageSize,
    totalPages: response?.totalPages || Math.ceil((response?.total || students.length) / pageSize),
  };
}

// ============================================
// Workers (Construction)
// ============================================

export interface Worker {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  profileComplete: boolean;
  status: 'active' | 'pending' | 'inactive';
  trainingStatus?: 'current' | 'expired' | 'expiring_soon';
  createdAt: string;
}

/**
 * Get workers
 */
export async function getWorkers(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<PaginatedResponse<Worker>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search) params.append('search', search);

  const response = await api.get<any>(`/api/organizations/workers?${params.toString()}`);

  const workers = (response?.workers || response?.data || response || []).map((w: any) => ({
    id: w.id,
    fullName: w.fullName,
    email: w.email,
    phoneNumber: w.phoneNumber,
    role: w.role,
    profileComplete: w.profileComplete || false,
    status: w.status || 'active',
    trainingStatus: w.trainingStatus,
    createdAt: w.createdAt,
  }));

  return {
    data: workers,
    total: response?.total || workers.length,
    page: response?.page || page,
    pageSize: response?.pageSize || pageSize,
    totalPages: response?.totalPages || Math.ceil((response?.total || workers.length) / pageSize),
  };
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
  // OSHA Compliance (Construction)
  getOSHACompliance,
  createOSHAMetric,
  updateOSHAMetric,
  // Training Records (Construction)
  getTrainingRecords,
  createTrainingRecord,
  // Emergency Notifications (Education)
  getEmergencyNotifications,
  sendEmergencyNotification,
  // Students (Education)
  getStudents,
  // Workers (Construction)
  getWorkers,
};

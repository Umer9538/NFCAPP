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
export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  type: 'injury' | 'illness' | 'near_miss' | 'hazard' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedById: string;
  reportedByName: string;
  affectedEmployeeId?: string;
  affectedEmployeeName?: string;
  location?: string;
  dateOccurred: string;
  dateReported: string;
  resolvedAt?: string;
  notes?: string;
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
 * Create Incident Report Request
 */
export interface CreateIncidentRequest {
  title: string;
  description: string;
  type: IncidentReport['type'];
  severity: IncidentReport['severity'];
  affectedEmployeeId?: string;
  location?: string;
  dateOccurred: string;
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
    const response = await api.post<Organization>('/organizations/create-my-org', data);
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
    const response = await api.get<Organization>('/organizations/my-org');
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
    const response = await api.put<Organization>('/organizations/my-org', data);
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

    const response = await api.get<PaginatedResponse<Employee>>(
      `/organizations/employees?${params.toString()}`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Get employees error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockEmployees: Employee[] = [
        {
          id: 'emp-1',
          fullName: 'John Smith',
          email: 'john.smith@demo.com',
          phoneNumber: '+1 555-0101',
          department: 'Engineering',
          position: 'Software Developer',
          profileComplete: true,
          emailVerified: true,
          status: 'active',
          joinedAt: '2024-01-15T00:00:00Z',
          createdAt: '2024-01-15T00:00:00Z',
        },
        {
          id: 'emp-2',
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@demo.com',
          phoneNumber: '+1 555-0102',
          department: 'Marketing',
          position: 'Marketing Manager',
          profileComplete: true,
          emailVerified: true,
          status: 'active',
          joinedAt: '2024-02-01T00:00:00Z',
          createdAt: '2024-02-01T00:00:00Z',
        },
        {
          id: 'emp-3',
          fullName: 'Mike Williams',
          email: 'mike.williams@demo.com',
          department: 'Operations',
          profileComplete: false,
          emailVerified: false,
          status: 'pending',
          createdAt: '2024-03-10T00:00:00Z',
        },
      ];

      return {
        data: mockEmployees,
        total: mockEmployees.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
    }

    throw new Error(error.message || 'Failed to get employees');
  }
}

/**
 * Add employee to organization
 */
export async function addEmployee(data: AddEmployeeRequest): Promise<Employee> {
  try {
    const response = await api.post<Employee>('/organizations/employees', data);
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
      `/organizations/employees/${employeeId}`
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
 * Resend employee invitation
 */
export async function resendEmployeeInvite(employeeId: string): Promise<{ success: boolean }> {
  try {
    const response = await api.post<{ success: boolean }>(
      `/organizations/employees/${employeeId}/resend-invite`
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
      `/organizations/medical-info?${params.toString()}`
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
  status?: IncidentReport['status']
): Promise<PaginatedResponse<IncidentReport>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (status) {
      params.append('status', status);
    }

    const response = await api.get<PaginatedResponse<IncidentReport>>(
      `/organizations/incident-reports?${params.toString()}`
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Get incident reports error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockReports: IncidentReport[] = [
        {
          id: 'inc-1',
          title: 'Minor workplace injury',
          description: 'Employee slipped on wet floor in break room',
          type: 'injury',
          severity: 'low',
          status: 'resolved',
          reportedById: 'emp-1',
          reportedByName: 'John Smith',
          affectedEmployeeId: 'emp-1',
          affectedEmployeeName: 'John Smith',
          location: 'Break Room - 2nd Floor',
          dateOccurred: '2024-03-10T14:30:00Z',
          dateReported: '2024-03-10T15:00:00Z',
          resolvedAt: '2024-03-11T10:00:00Z',
          notes: 'Wet floor sign was not displayed. Maintenance notified.',
        },
        {
          id: 'inc-2',
          title: 'Near miss - falling object',
          description: 'Unsecured equipment nearly fell from shelf',
          type: 'near_miss',
          severity: 'medium',
          status: 'investigating',
          reportedById: 'emp-2',
          reportedByName: 'Sarah Johnson',
          location: 'Warehouse Section B',
          dateOccurred: '2024-03-12T09:15:00Z',
          dateReported: '2024-03-12T09:30:00Z',
        },
      ];

      return {
        data: mockReports,
        total: mockReports.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
    }

    throw new Error(error.message || 'Failed to get incident reports');
  }
}

/**
 * Create incident report
 */
export async function createIncidentReport(
  data: CreateIncidentRequest
): Promise<IncidentReport> {
  try {
    const response = await api.post<IncidentReport>(
      '/organizations/incident-reports',
      data
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Create incident report error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      const mockReport: IncidentReport = {
        id: `inc-${Date.now()}`,
        ...data,
        status: 'reported',
        reportedById: 'current-user',
        reportedByName: 'Current User',
        dateReported: new Date().toISOString(),
      };
      return mockReport;
    }

    throw new Error(error.message || 'Failed to create incident report');
  }
}

/**
 * Update incident report status
 */
export async function updateIncidentStatus(
  reportId: string,
  status: IncidentReport['status'],
  notes?: string
): Promise<IncidentReport> {
  try {
    const response = await api.put<IncidentReport>(
      `/organizations/incident-reports/${reportId}/status`,
      { status, notes }
    );
    return response;
  } catch (error: any) {
    console.error('[Organizations API] Update incident status error:', error);

    // Demo mode fallback
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      return {
        id: reportId,
        title: 'Updated Report',
        description: '',
        type: 'other',
        severity: 'low',
        status,
        reportedById: 'current-user',
        reportedByName: 'Current User',
        dateOccurred: new Date().toISOString(),
        dateReported: new Date().toISOString(),
        notes,
        resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined,
      };
    }

    throw new Error(error.message || 'Failed to update incident status');
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
    }>('/organizations/stats');
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
  removeEmployee,
  resendEmployeeInvite,
  getMedicalInfo,
  getIncidentReports,
  createIncidentReport,
  updateIncidentStatus,
  getOrgStats,
};

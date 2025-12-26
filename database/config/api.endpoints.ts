// API Endpoints Reference for Mobile App
// Base URL should be configured in your app's environment

export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================
export const AUTH_ENDPOINTS = {
  // POST - Login user
  LOGIN: '/api/auth/login',
  
  // POST - Signup new user
  SIGNUP: '/api/auth/signup',
  
  // POST - Logout user
  LOGOUT: '/api/auth/logout',
  
  // GET - Get current user session
  ME: '/api/auth/me',
  
  // GET - Check session validity
  SESSION: '/api/auth/session',
  
  // POST - Verify email with code
  VERIFY_EMAIL: '/api/auth/verify-email',
  
  // POST - Resend OTP code
  RESEND_OTP: '/api/auth/resend-otp',
  
  // POST - Enable 2FA
  ENABLE_2FA: '/api/auth/enable-2fa',
  
  // POST - Verify 2FA code
  VERIFY_2FA: '/api/auth/verify-2fa',
  
  // POST - Forgot password (send reset code)
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  
  // POST - Verify reset code
  VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
  
  // POST - Reset password
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // POST - Profile setup (initial)
  PROFILE_SETUP: '/api/auth/profile-setup'
};

// ============================================
// PROFILE ENDPOINTS
// ============================================
export const PROFILE_ENDPOINTS = {
  // GET/PUT - User profile and medical info
  PROFILE: '/api/profile'
};

// ============================================
// DASHBOARD ENDPOINTS
// ============================================
export const DASHBOARD_ENDPOINTS = {
  // GET - Dashboard statistics
  STATS: '/api/dashboard/stats'
};

// ============================================
// BRACELET ENDPOINTS
// ============================================
export const BRACELET_ENDPOINTS = {
  // GET - Get bracelet info
  GET: '/api/bracelet',
  
  // POST - Link bracelet
  LINK: '/api/bracelet/link',
  
  // POST - Unlink bracelet
  UNLINK: '/api/bracelet/unlink',
  
  // GET - Emergency access via NFC (public)
  NFC_ACCESS: (nfcId: string) => `/api/nfc/${nfcId}`,
  
  // GET - Emergency access via bracelet ID (public)
  EMERGENCY_ACCESS: (braceletId: string) => `/api/emergency/${braceletId}`
};

// ============================================
// ACTIVITY & AUDIT ENDPOINTS
// ============================================
export const ACTIVITY_ENDPOINTS = {
  // GET - Activity logs
  ACTIVITIES: '/api/activities',
  
  // GET - Audit logs
  AUDIT_LOGS: '/api/audit-logs'
};

// ============================================
// HEALTH REMINDERS ENDPOINTS
// ============================================
export const HEALTH_ENDPOINTS = {
  // GET/POST - Health reminders
  REMINDERS: '/api/health-reminders',
  
  // POST - Initialize health reminders
  INITIALIZE: '/api/health-reminders/initialize'
};

// ============================================
// SETTINGS ENDPOINTS
// ============================================
export const SETTINGS_ENDPOINTS = {
  // PUT - Update profile settings
  PROFILE: '/api/settings/profile',
  
  // PUT - Update password
  PASSWORD: '/api/settings/password',
  
  // PUT - Update notifications
  NOTIFICATIONS: '/api/settings/notifications',
  
  // PUT/DELETE - Account settings
  ACCOUNT: '/api/settings/account',
  
  // PUT - Security settings (2FA)
  SECURITY: '/api/settings/security',
  
  // POST - Export data
  EXPORT: '/api/settings/export',
  
  // POST - Verify email change
  VERIFY_EMAIL_CHANGE: '/api/settings/verify-email-change'
};

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================
export const SUBSCRIPTION_ENDPOINTS = {
  // GET - Get subscription status
  STATUS: '/api/subscription',
  
  // POST - Create subscription
  CREATE: '/api/subscription/create',
  
  // POST - Cancel subscription
  CANCEL: '/api/subscription/cancel',
  
  // GET - Billing history
  BILLING: '/api/subscription/billing',
  
  // GET - Invoices
  INVOICES: '/api/subscription/invoices',
  
  // POST - Stripe webhook (server-side)
  WEBHOOK: '/api/subscription/webhook'
};

// ============================================
// ORGANIZATION ENDPOINTS
// ============================================
export const ORGANIZATION_ENDPOINTS = {
  // GET - Get organization info
  MY_ORG: '/api/organizations/my-org',
  
  // ============ EMPLOYEES (Corporate) ============
  // GET/POST - Employees list / Add employee
  EMPLOYEES: '/api/organizations/employees',
  
  // PUT/DELETE - Update/Delete employee
  EMPLOYEE: (employeeId: string) => `/api/organizations/employees/${employeeId}`,
  
  // PATCH - Suspend/unsuspend employee
  EMPLOYEE_SUSPEND: '/api/organizations/employees/suspend',
  
  // ============ WORKERS (Construction) ============
  // GET/POST - Workers list / Add worker
  WORKERS: '/api/organizations/workers',
  
  // PUT/DELETE - Update/Delete worker
  WORKER: (workerId: string) => `/api/organizations/workers/${workerId}`,
  
  // PATCH - Suspend/unsuspend worker
  WORKER_SUSPEND: '/api/organizations/workers/suspend',
  
  // ============ STUDENTS (Education) ============
  // GET/POST - Students list / Add student
  STUDENTS: '/api/organizations/students',
  
  // PUT/DELETE - Update/Delete student
  STUDENT: (studentId: string) => `/api/organizations/students/${studentId}`,
  
  // PATCH - Suspend/unsuspend student
  STUDENT_SUSPEND: '/api/organizations/students/suspend',
  
  // ============ MEDICAL INFO ============
  // GET - Medical info for organization members
  MEDICAL_INFO: '/api/organizations/medical-info',
  
  // GET - Medical profiles (Education)
  MEDICAL_PROFILES: '/api/organizations/medical-profiles',
  
  // ============ INCIDENT REPORTS (Corporate) ============
  // GET/POST - Incident reports
  INCIDENT_REPORTS: '/api/organizations/incident-reports',
  
  // PUT - Update incident report status
  INCIDENT_REPORT_UPDATE: '/api/organizations/incident-reports',
  
  // ============ INCIDENT LOGS (Construction) ============
  // GET/POST - Incident logs
  INCIDENT_LOGS: '/api/organizations/incident-logs',
  
  // PUT - Update incident log status
  INCIDENT_LOG_UPDATE: '/api/organizations/incident-logs',
  
  // ============ OSHA COMPLIANCE (Construction) ============
  // GET - OSHA compliance metrics
  OSHA_COMPLIANCE: '/api/organizations/osha-compliance',
  
  // GET - Training records
  TRAINING_RECORDS: '/api/organizations/training-records',
  
  // ============ EMERGENCY NOTIFICATIONS (Education) ============
  // GET/POST - Emergency notifications
  EMERGENCY_NOTIFICATIONS: '/api/organizations/emergency-notifications'
};

// ============================================
// API REQUEST HELPER TYPES
// ============================================
export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ============================================
// HELPER FUNCTION TO BUILD FULL URL
// ============================================
export function buildUrl(
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | undefined>
): string {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}

// ============================================
// HTTP STATUS CODES
// ============================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
} as const;


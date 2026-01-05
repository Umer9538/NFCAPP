import {
  LayoutDashboard,
  User,
  Users,
  CreditCard,
  Activity,
  Settings,
  FileText,
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  Building2,
  HardHat,
  LucideIcon,
} from 'lucide-react-native';

// Account Types
export type AccountType = 'individual' | 'corporate' | 'construction' | 'education';

// User Role Type
// - admin: Full access to organization
// - supervisor: Construction - can view workers, training, incidents (no OSHA)
// - teacher: Education - can view assigned students only
// - parent: Education - can view own children only
// - user/employee/worker/student: Basic access to own profile
export type UserRole = 'admin' | 'supervisor' | 'teacher' | 'parent' | 'user' | 'employee' | 'worker' | 'student';

// Route names for access control
export type IndividualRoute = 'Home' | 'Profile' | 'Bracelet' | 'Settings' | 'Subscription' | 'AuditLogs' | 'Medical';
export type OrganizationRoute = 'Home' | 'Employees' | 'MedicalInfo' | 'IncidentReports' | 'Settings' | 'AddEmployee' | 'EmployeeDetails' | 'Profile';

// Navigation Item Interface
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  badge?: number;
}

// Terminology Interface - customizable labels based on account type
export interface Terminology {
  user: string;           // Single user label (User, Employee, Worker, Student)
  users: string;          // Plural users label
  profile: string;        // Profile section label
  medicalInfo: string;    // Medical information label
  dashboard: string;      // Dashboard title
  emergency: string;      // Emergency section label
}

// Feature Flags Interface
export interface FeatureFlags {
  showSubscription: boolean;
  showBracelet: boolean;
  showAuditLogs: boolean;
  showEmployees: boolean;
  showWorkers: boolean;
  showStudents: boolean;
  showMedicalInfo: boolean;
  showIncidentReports: boolean;
  showAnalytics: boolean;
  showBulkManagement: boolean;
  showExportReports: boolean;
}

// Theme Colors Interface
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  cardBackground: string;
  gradient: [string, string];
}

// Dashboard Configuration Interface
export interface DashboardConfig {
  accountType: AccountType;
  displayName: string;
  description: string;
  terminology: Terminology;
  navigationItems: NavigationItem[];
  features: FeatureFlags;
  themeColors: ThemeColors;
}

// Individual Account Configuration
const individualConfig: DashboardConfig = {
  accountType: 'individual',
  displayName: 'Personal Account',
  description: 'Manage your personal medical information and emergency profile',
  terminology: {
    user: 'User',
    users: 'Users',
    profile: 'My Profile',
    medicalInfo: 'Medical Information',
    dashboard: 'My Dashboard',
    emergency: 'Emergency Profile',
  },
  navigationItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: 'Home',
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      route: 'Profile',
    },
    {
      id: 'bracelet',
      label: 'My Bracelet',
      icon: Activity,
      route: 'Bracelet',
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      route: 'Subscription',
    },
    {
      id: 'auditLogs',
      label: 'Activity Log',
      icon: FileText,
      route: 'AuditLogs',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      route: 'Settings',
    },
  ],
  features: {
    showSubscription: true,
    showBracelet: true,
    showAuditLogs: true,
    showEmployees: false,
    showWorkers: false,
    showStudents: false,
    showMedicalInfo: true,
    showIncidentReports: false,
    showAnalytics: false,
    showBulkManagement: false,
    showExportReports: false,
  },
  themeColors: {
    primary: '#DC2626',      // Red-600
    primaryLight: '#FEE2E2', // Red-100
    primaryDark: '#991B1B',  // Red-800
    accent: '#F87171',       // Red-400
    background: '#FEF2F2',   // Red-50
    cardBackground: '#FFFFFF',
    gradient: ['#DC2626', '#B91C1C'],
  },
};

// Corporate Account Configuration
const corporateConfig: DashboardConfig = {
  accountType: 'corporate',
  displayName: 'Corporate Account',
  description: 'Manage employee health records and workplace safety',
  terminology: {
    user: 'Employee',
    users: 'Employees',
    profile: 'Employee Profile',
    medicalInfo: 'Health Records',
    dashboard: 'Corporate Dashboard',
    emergency: 'Emergency Information',
  },
  navigationItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: 'Home',
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      route: 'Employees',
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      route: 'Organization',
    },
    {
      id: 'medicalInfo',
      label: 'Health Records',
      icon: ClipboardList,
      route: 'MedicalRecords',
    },
    {
      id: 'incidentReports',
      label: 'Incident Reports',
      icon: AlertTriangle,
      route: 'IncidentReports',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      route: 'Analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      route: 'Settings',
    },
  ],
  features: {
    showSubscription: false,
    showBracelet: false,
    showAuditLogs: true,
    showEmployees: true,
    showWorkers: false,
    showStudents: false,
    showMedicalInfo: true,
    showIncidentReports: true,
    showAnalytics: true,
    showBulkManagement: true,
    showExportReports: true,
  },
  themeColors: {
    primary: '#2563EB',      // Blue-600
    primaryLight: '#DBEAFE', // Blue-100
    primaryDark: '#1E40AF',  // Blue-800
    accent: '#60A5FA',       // Blue-400
    background: '#EFF6FF',   // Blue-50
    cardBackground: '#FFFFFF',
    gradient: ['#2563EB', '#1D4ED8'],
  },
};

// Construction Account Configuration
const constructionConfig: DashboardConfig = {
  accountType: 'construction',
  displayName: 'Construction Account',
  description: 'Manage worker safety and site health compliance',
  terminology: {
    user: 'Worker',
    users: 'Workers',
    profile: 'Worker Profile',
    medicalInfo: 'Safety Records',
    dashboard: 'Site Dashboard',
    emergency: 'Emergency Response',
  },
  navigationItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: 'Home',
    },
    {
      id: 'workers',
      label: 'Workers',
      icon: HardHat,
      route: 'Workers',
    },
    {
      id: 'sites',
      label: 'Sites',
      icon: Building2,
      route: 'Sites',
    },
    {
      id: 'medicalInfo',
      label: 'Safety Records',
      icon: ClipboardList,
      route: 'SafetyRecords',
    },
    {
      id: 'incidentReports',
      label: 'Incident Reports',
      icon: AlertTriangle,
      route: 'IncidentReports',
    },
    {
      id: 'analytics',
      label: 'Safety Analytics',
      icon: Activity,
      route: 'Analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      route: 'Settings',
    },
  ],
  features: {
    showSubscription: false,
    showBracelet: true,
    showAuditLogs: true,
    showEmployees: false,
    showWorkers: true,
    showStudents: false,
    showMedicalInfo: true,
    showIncidentReports: true,
    showAnalytics: true,
    showBulkManagement: true,
    showExportReports: true,
  },
  themeColors: {
    primary: '#EA580C',      // Orange-600
    primaryLight: '#FFEDD5', // Orange-100
    primaryDark: '#C2410C',  // Orange-700
    accent: '#FB923C',       // Orange-400
    background: '#FFF7ED',   // Orange-50
    cardBackground: '#FFFFFF',
    gradient: ['#EA580C', '#DC2626'],
  },
};

// Education Account Configuration
const educationConfig: DashboardConfig = {
  accountType: 'education',
  displayName: 'Education Account',
  description: 'Manage student health records and campus safety',
  terminology: {
    user: 'Student',
    users: 'Students',
    profile: 'Student Profile',
    medicalInfo: 'Health Records',
    dashboard: 'Campus Dashboard',
    emergency: 'Emergency Contacts',
  },
  navigationItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: 'Home',
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      route: 'Students',
    },
    {
      id: 'institution',
      label: 'Institution',
      icon: Building2,
      route: 'Institution',
    },
    {
      id: 'medicalInfo',
      label: 'Health Records',
      icon: ClipboardList,
      route: 'HealthRecords',
    },
    {
      id: 'analytics',
      label: 'Reports',
      icon: Activity,
      route: 'Analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      route: 'Settings',
    },
  ],
  features: {
    showSubscription: false,
    showBracelet: false,
    showAuditLogs: true,
    showEmployees: false,
    showWorkers: false,
    showStudents: true,
    showMedicalInfo: true,
    showIncidentReports: false,
    showAnalytics: true,
    showBulkManagement: true,
    showExportReports: true,
  },
  themeColors: {
    primary: '#16A34A',      // Green-600
    primaryLight: '#DCFCE7', // Green-100
    primaryDark: '#15803D',  // Green-700
    accent: '#4ADE80',       // Green-400
    background: '#F0FDF4',   // Green-50
    cardBackground: '#FFFFFF',
    gradient: ['#16A34A', '#15803D'],
  },
};

// Configuration Map
const dashboardConfigs: Record<AccountType, DashboardConfig> = {
  individual: individualConfig,
  corporate: corporateConfig,
  construction: constructionConfig,
  education: educationConfig,
};

/**
 * Get dashboard configuration based on account type
 * @param accountType - The type of account
 * @returns Dashboard configuration for the specified account type
 */
export function getDashboardConfig(accountType: AccountType): DashboardConfig {
  return dashboardConfigs[accountType] || individualConfig;
}

/**
 * Check if the account type is an organization account
 * @param accountType - The type of account
 * @returns True if the account is an organization (not individual)
 */
export function isOrganizationAccount(accountType: AccountType): boolean {
  return accountType !== 'individual';
}

/**
 * Get all available account types
 * @returns Array of all account types
 */
export function getAccountTypes(): AccountType[] {
  return ['individual', 'corporate', 'construction', 'education'];
}

/**
 * Check if the role is admin
 * @param role - The user role
 * @returns True if role is admin
 */
export function isAdmin(role?: UserRole | string | null): boolean {
  return role === 'admin';
}

/**
 * Check if the role is supervisor (construction)
 * @param role - The user role
 * @returns True if role is supervisor
 */
export function isSupervisor(role?: UserRole | string | null): boolean {
  return role === 'supervisor';
}

/**
 * Check if the role is teacher (education)
 * @param role - The user role
 * @returns True if role is teacher
 */
export function isTeacher(role?: UserRole | string | null): boolean {
  return role === 'teacher';
}

/**
 * Check if the role is parent (education)
 * @param role - The user role
 * @returns True if role is parent
 */
export function isParent(role?: UserRole | string | null): boolean {
  return role === 'parent';
}

/**
 * Check if the role has management access (admin or supervisor)
 * @param role - The user role
 * @returns True if role has management access
 */
export function hasManagementAccess(role?: UserRole | string | null): boolean {
  return isAdmin(role) || isSupervisor(role);
}

/**
 * Check if a user can access a specific route
 * @param accountType - The type of account
 * @param role - The user role
 * @param routeName - The route name to check
 * @returns True if the user can access the route
 */
export function canAccessRoute(
  accountType: AccountType,
  role: UserRole | string | null | undefined,
  routeName: string
): boolean {
  // Individual users can access all individual routes
  if (accountType === 'individual') {
    const individualRoutes: IndividualRoute[] = ['Home', 'Profile', 'Bracelet', 'Settings', 'Subscription', 'AuditLogs', 'Medical'];
    return individualRoutes.includes(routeName as IndividualRoute);
  }

  // Organization users
  const isUserAdmin = isAdmin(role);

  // Admin can access all organization routes
  if (isUserAdmin) {
    return true;
  }

  // Non-admin org users have limited access
  const nonAdminAllowedRoutes = ['Home', 'Profile', 'Settings'];
  return nonAdminAllowedRoutes.includes(routeName);
}

/**
 * Get navigation items for a specific account type and role
 * @param accountType - The type of account
 * @param role - The user role (optional, for organization users)
 * @returns Array of navigation items filtered by role
 */
export function getNavigationItems(
  accountType: AccountType,
  role?: UserRole | string | null
): NavigationItem[] {
  const config = getDashboardConfig(accountType);

  // Individual users get all their navigation items
  if (accountType === 'individual') {
    return config.navigationItems;
  }

  // Organization users: filter based on role
  const isUserAdmin = isAdmin(role);

  if (isUserAdmin) {
    // Admins see all navigation items
    return config.navigationItems;
  }

  // Non-admin org users see limited navigation items
  // They can only see: Dashboard (Home), My Profile, Settings
  const allowedIds = ['dashboard', 'profile', 'settings'];
  return config.navigationItems.filter((item) => allowedIds.includes(item.id));
}

/**
 * Get terminology for a specific account type
 * @param accountType - The type of account
 * @returns Terminology object
 */
export function getTerminology(accountType: AccountType): Terminology {
  return getDashboardConfig(accountType).terminology;
}

/**
 * Get feature flags for a specific account type
 * @param accountType - The type of account
 * @returns Feature flags object
 */
export function getFeatureFlags(accountType: AccountType): FeatureFlags {
  return getDashboardConfig(accountType).features;
}

/**
 * Get theme colors for a specific account type
 * @param accountType - The type of account
 * @returns Theme colors object
 */
export function getThemeColors(accountType: AccountType): ThemeColors {
  return getDashboardConfig(accountType).themeColors;
}

/**
 * Check if a specific feature is enabled for an account type
 * @param accountType - The type of account
 * @param feature - The feature to check
 * @returns True if the feature is enabled
 */
export function isFeatureEnabled(
  accountType: AccountType,
  feature: keyof FeatureFlags
): boolean {
  return getDashboardConfig(accountType).features[feature];
}

// Default export
export default {
  getDashboardConfig,
  isOrganizationAccount,
  getAccountTypes,
  getNavigationItems,
  getTerminology,
  getFeatureFlags,
  getThemeColors,
  isFeatureEnabled,
  isAdmin,
  isSupervisor,
  isTeacher,
  isParent,
  hasManagementAccess,
  canAccessRoute,
};

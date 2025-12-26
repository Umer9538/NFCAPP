// Mobile App Navigation Configuration
// This file contains all navigation items for each dashboard type and role

import { AccountType, UserRole } from '../types';

export interface NavItem {
  route: string;
  icon: string;
  label: string;
  enabled: boolean;
}

export interface NavigationConfig {
  accountType: AccountType;
  role: UserRole | null;
  items: NavItem[];
}

// ============================================
// INDIVIDUAL DASHBOARD
// ============================================
export const individualNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/subscription', icon: 'CreditCard', label: 'Subscription', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

// ============================================
// CORPORATE DASHBOARD
// ============================================
export const corporateAdminNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/employees', icon: 'Users', label: 'Employees', enabled: true },
  { route: '/dashboard/medical-info', icon: 'User', label: 'Medical Info', enabled: true },
  { route: '/dashboard/incident-reports', icon: 'AlertTriangle', label: 'Incident Reports', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const corporateEmployeeNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/incident-reports', icon: 'AlertTriangle', label: 'Incident Reports', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

// ============================================
// CONSTRUCTION DASHBOARD
// ============================================
export const constructionAdminNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/workers', icon: 'HardHat', label: 'Workers', enabled: true },
  { route: '/dashboard/medical-info', icon: 'User', label: 'Medical Info', enabled: true },
  { route: '/dashboard/incident-logs', icon: 'ClipboardList', label: 'Incident Logs', enabled: true },
  { route: '/dashboard/osha-compliance', icon: 'AlertTriangle', label: 'OSHA Compliance', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const constructionSupervisorNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/workers', icon: 'HardHat', label: 'Workers', enabled: true },
  { route: '/dashboard/medical-info', icon: 'User', label: 'Medical Info', enabled: true },
  { route: '/dashboard/incident-logs', icon: 'ClipboardList', label: 'Incident Logs', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const constructionWorkerNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/incident-logs', icon: 'ClipboardList', label: 'Incident Logs', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

// ============================================
// EDUCATION DASHBOARD
// ============================================
export const educationAdminNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/students', icon: 'GraduationCap', label: 'Students', enabled: true },
  { route: '/dashboard/medical-profiles', icon: 'User', label: 'Medical Profiles', enabled: true },
  { route: '/dashboard/emergency-notifications', icon: 'AlertTriangle', label: 'Emergency Notifications', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const educationTeacherNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/students', icon: 'GraduationCap', label: 'Students', enabled: true },
  { route: '/dashboard/medical-profiles', icon: 'User', label: 'Medical Profiles', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const educationParentNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/students', icon: 'GraduationCap', label: 'Students', enabled: true },
  { route: '/dashboard/medical-profiles', icon: 'User', label: 'Medical Profiles', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

export const educationStudentNavigation: NavItem[] = [
  { route: '/dashboard', icon: 'LayoutDashboard', label: 'Overview', enabled: true },
  { route: '/dashboard/profile', icon: 'User', label: 'Medical Profile', enabled: true },
  { route: '/dashboard/bracelet', icon: 'Activity', label: 'NFC Bracelet', enabled: true },
  { route: '/dashboard/audit-logs', icon: 'FileText', label: 'Audit Logs', enabled: true },
  { route: '/dashboard/settings', icon: 'Settings', label: 'Settings', enabled: true }
];

// ============================================
// HELPER FUNCTION - Get Navigation Based on Account Type & Role
// ============================================
export function getNavigation(
  accountType: AccountType,
  role: UserRole | string | null
): NavItem[] {
  switch (accountType) {
    case 'individual':
      return individualNavigation;

    case 'corporate':
      if (role === 'admin') {
        return corporateAdminNavigation;
      }
      return corporateEmployeeNavigation;

    case 'construction':
      if (role === 'admin') {
        return constructionAdminNavigation;
      } else if (role === 'supervisor') {
        return constructionSupervisorNavigation;
      }
      return constructionWorkerNavigation;

    case 'education':
      if (role === 'admin') {
        return educationAdminNavigation;
      } else if (role === 'teacher') {
        return educationTeacherNavigation;
      } else if (role === 'parent') {
        return educationParentNavigation;
      }
      return educationStudentNavigation;

    default:
      return individualNavigation;
  }
}

// ============================================
// ICON MAPPING
// ============================================
// Map icon names to your mobile app's icon library
export const ICON_MAP = {
  'LayoutDashboard': 'home',      // or 'dashboard', 'grid'
  'User': 'user',                  // or 'person', 'account'
  'Activity': 'activity',          // or 'pulse', 'nfc'
  'CreditCard': 'credit-card',     // or 'card', 'payment'
  'FileText': 'file-text',         // or 'document', 'log'
  'Settings': 'settings',          // or 'cog', 'gear'
  'Users': 'users',                // or 'people', 'group'
  'AlertTriangle': 'alert-triangle', // or 'warning', 'alert'
  'HardHat': 'hard-hat',           // or 'helmet', 'construction'
  'ClipboardList': 'clipboard-list', // or 'list', 'clipboard'
  'GraduationCap': 'graduation-cap', // or 'school', 'education'
  'LogOut': 'log-out',             // or 'exit', 'logout'
  'Bell': 'bell',                  // or 'notification'
  'Shield': 'shield',              // or 'security'
  'Menu': 'menu',                  // or 'hamburger'
  'X': 'x',                        // or 'close'
  'ChevronRight': 'chevron-right',
  'ChevronDown': 'chevron-down',
  'Plus': 'plus',
  'Edit': 'edit',
  'Trash': 'trash',
  'Search': 'search',
  'Filter': 'filter'
} as const;

export type IconName = keyof typeof ICON_MAP;

// ============================================
// DASHBOARD THEMES
// ============================================
export const DASHBOARD_THEMES = {
  individual: {
    primaryColor: '#3B82F6', // Blue
    secondaryColor: '#6B7280', // Gray
    name: 'Individual'
  },
  corporate: {
    primaryColor: '#3B82F6', // Blue
    secondaryColor: '#6B7280', // Gray
    name: 'Corporate'
  },
  construction: {
    primaryColor: '#F59E0B', // Yellow/Amber
    secondaryColor: '#6B7280', // Gray
    name: 'Construction'
  },
  education: {
    primaryColor: '#10B981', // Green
    secondaryColor: '#6B7280', // Gray
    name: 'Education'
  }
} as const;

export type DashboardTheme = keyof typeof DASHBOARD_THEMES;

// ============================================
// TERMINOLOGY BY ACCOUNT TYPE
// ============================================
export const TERMINOLOGY = {
  individual: {
    user: 'User',
    profile: 'Medical Profile',
    medicalInfo: 'Medical Profile',
    contacts: 'Emergency Contacts'
  },
  corporate: {
    user: 'Employee',
    profile: 'Employee Profile',
    medicalInfo: 'Medical Info',
    contacts: 'Emergency Contacts'
  },
  construction: {
    user: 'Worker',
    profile: 'Worker Profile',
    medicalInfo: 'Medical Info',
    contacts: 'Emergency Contacts'
  },
  education: {
    user: 'Student',
    profile: 'Student Profile',
    medicalInfo: 'Medical Profiles',
    contacts: 'Emergency Contacts'
  }
} as const;

export function getTerminology(accountType: AccountType) {
  return TERMINOLOGY[accountType] || TERMINOLOGY.individual;
}


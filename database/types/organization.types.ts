import { AccountType } from './common.types';

export interface Organization {
  id: string;
  name: string;
  type: AccountType;
  domain?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationWithMembers extends Organization {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    role?: string | null;
    profileComplete: boolean;
    suspended: boolean;
  }>;
  memberCount: number;
}

export interface CreateOrganizationInput {
  name: string;
  type: AccountType;
  domain?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  domain?: string;
}

// Employee/Worker/Student management
export interface OrganizationMember {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role?: string | null;
  profileComplete: boolean;
  suspended: boolean;
  createdAt: Date;
  // Corporate specific
  department?: string | null;
  position?: string | null;
  // Construction specific
  jobSite?: string | null;
  trade?: string | null;
  // Education specific
  grade?: string | null;
  className?: string | null;
  campus?: string | null;
  studentId?: string | null;
}

export interface AddMemberInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  // Corporate specific
  department?: string;
  position?: string;
  // Construction specific
  jobSite?: string;
  trade?: string;
  // Education specific
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
}

export interface UpdateMemberInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  department?: string;
  position?: string;
  jobSite?: string;
  trade?: string;
  grade?: string;
  className?: string;
  campus?: string;
  studentId?: string;
}


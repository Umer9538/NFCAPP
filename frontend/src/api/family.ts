/**
 * Family API — companion endpoints for family members, caregivers,
 * monitoring, and check-ins. Mirrors the web's app/api/family/* routes.
 */

import { api } from './client';

// ── Family Members ───────────────────────────────────────────────────────

export type FamilyRelationship = 'child' | 'dependent' | 'parent' | 'grandparent';

export interface FamilyMember {
  id: string;
  fullName: string;
  nickname?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  relationship: FamilyRelationship;
  bloodType?: string | null;
  allergies?: unknown;
  conditions?: unknown;
  medications?: unknown;
  emergencyNotes?: string | null;
  createdAt: string;
}

export interface Caregiver {
  id: string;
  fullName: string;
  email: string;
  familyRole: string | null;
  createdAt: string;
}

export interface FamilyMembersResponse {
  success?: boolean;
  members: FamilyMember[];
  caregivers: Caregiver[];
  isGuardian?: boolean;
}

export interface AddMemberInput {
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  gender?: string;
  relationship: FamilyRelationship;
}

export async function listFamilyMembers(): Promise<FamilyMembersResponse> {
  return api.get<FamilyMembersResponse>('/api/family/members');
}

export async function addFamilyMember(
  body: AddMemberInput,
): Promise<FamilyMember> {
  const res = await api.post<{ member: FamilyMember }>(
    '/api/family/members',
    body,
  );
  return res.member;
}

export async function updateFamilyMember(
  id: string,
  patch: Partial<AddMemberInput>,
): Promise<FamilyMember> {
  const res = await api.patch<{ member: FamilyMember }>(
    `/api/family/members/${id}`,
    patch,
  );
  return res.member;
}

export async function deleteFamilyMember(id: string): Promise<void> {
  await api.delete(`/api/family/members/${id}`);
}

// ── Invitations ──────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type CaregiverPermissionKey =
  | 'view_medical'
  | 'receive_alerts'
  | 'confirm_checkins'
  | 'add_notes';

export interface FamilyInvitation {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface InviteCaregiverInput {
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'caregiver' | 'second_parent';
  accessExpiresInDays?: number;
  permissions: CaregiverPermissionKey[];
}

export interface InviteCaregiverResponse {
  invitation: FamilyInvitation;
  inviteUrl: string;
}

export async function listFamilyInvitations(): Promise<FamilyInvitation[]> {
  const res = await api
    .get<{ invitations: FamilyInvitation[] }>('/api/family/invitations')
    .catch(() => ({ invitations: [] as FamilyInvitation[] }));
  return res.invitations ?? [];
}

export async function inviteCaregiver(
  body: InviteCaregiverInput,
): Promise<InviteCaregiverResponse> {
  return api.post<InviteCaregiverResponse>('/api/family/invitations', body);
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  await api.patch(`/api/family/invitations/${invitationId}`, {
    status: 'revoked',
  });
}

// ── Monitoring (Family Safety) ───────────────────────────────────────────

export type MemberStatus =
  | 'safe'
  | 'outside'
  | 'alert'
  | 'emergency'
  | 'offline';

export interface MonitoringMember {
  id: string;
  fullName: string;
  nickname: string | null;
  userType: string;
  status: MemberStatus;
  statusLabel: string;
  lastSeen: string | null;
  insideZoneName: string | null;
  recentAlertCount: number;
  lastCheckIn: { status: string; respondedAt: string | null } | null;
  hasAccount: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface MonitoringSummary {
  total: number;
  safe: number;
  alert: number;
  outside: number;
  offline: number;
}

export interface MonitoringResponse {
  members: MonitoringMember[];
  summary: MonitoringSummary;
}

export async function getFamilyMonitoring(): Promise<MonitoringResponse> {
  return api.get<MonitoringResponse>('/api/family/monitoring');
}

export async function sendFamilyCheckIn(targetUserId: string): Promise<void> {
  await api.post('/api/family/check-in', { targetUserId });
}

export const familyApi = {
  listFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  listFamilyInvitations,
  inviteCaregiver,
  revokeInvitation,
  getFamilyMonitoring,
  sendFamilyCheckIn,
};

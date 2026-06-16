/**
 * Onboarding draft persistence — mirrors POST/GET/DELETE /api/onboarding/draft
 * on the web. Used by the mobile useOnboardingDraft hook to survive app kills
 * and device switches mid-wizard.
 *
 * Backend: app/api/onboarding/draft/route.ts. Drafts auto-expire after 7 days
 * of inactivity; expired/missing → 404/410.
 */

import { api } from './client';

export type DraftType = 'guardian' | 'dependent';

export interface DependentContext {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  relationship?: string;
  dependentType?: 'child' | 'elderly' | 'vulnerable_adult';
}

export interface OnboardingDraftRecord {
  id: string;
  userId: string | null;
  draftType: DraftType;
  dependentContext: DependentContext | null;
  stepData: Record<string, unknown>;
  currentStep: number;
  validationState: Record<string, unknown> | null;
  routeContext: string | null;
  expiresAt: string;
  updatedAt: string;
}

export interface UpsertDraftInput {
  id?: string;
  draftType: DraftType;
  stepData: Record<string, unknown>;
  currentStep: number;
  routeContext?: string;
  dependentContext?: DependentContext;
}

/** Create or update a draft. Backend returns the canonical id we should keep. */
export async function upsertDraft(input: UpsertDraftInput): Promise<OnboardingDraftRecord> {
  const res = await api.post<{ success: boolean; draft: OnboardingDraftRecord; error?: string }>(
    '/api/onboarding/draft',
    input
  );
  if (!res.success) throw new Error(res.error || 'Failed to save draft');
  return res.draft;
}

/**
 * Restore a draft by id. Returns null for 404/410 (expired or never existed)
 * rather than throwing — callers should treat that as "start fresh".
 */
export async function getDraft(id: string): Promise<OnboardingDraftRecord | null> {
  try {
    const res = await api.get<{ success: boolean; draft: OnboardingDraftRecord }>(
      `/api/onboarding/draft?id=${encodeURIComponent(id)}`
    );
    return res.success ? res.draft : null;
  } catch (e: any) {
    if (e?.status === 404 || e?.status === 410) return null;
    throw e;
  }
}

/** Idempotent — succeeds even if the draft is already gone. */
export async function deleteDraft(id: string): Promise<void> {
  try {
    await api.delete(`/api/onboarding/draft?id=${encodeURIComponent(id)}`);
  } catch (e: any) {
    if (e?.status === 404 || e?.status === 410) return;
    throw e;
  }
}

/**
 * Medical-term verification (the "waterfall" intelligence system).
 *
 * Companion to the web at app/api/waterfall/route.ts. Three actions:
 *   - verify       → 5-level pipeline (local NLP → RxNorm → Health Canada →
 *                    spelling correction → Gemini AI). Returns a chip color +
 *                    "did you mean?" suggestions.
 *   - verify-din   → resolve a Canadian 8-digit DIN to its drug record.
 *   - autocomplete → typeahead suggestions while the user is typing.
 *
 * Shapes mirror lib/waterfall/types.ts on the web side.
 */

import { api } from './client';

export type MedicalTermType = 'allergy' | 'medication' | 'condition';
export type ChipColor = 'emerald' | 'amber' | 'gray';
export type VerificationLevel = 1 | 2 | 3 | 4 | 5 | null;

export interface WaterfallSuggestion {
  term: string;
  displayName: string;
  confidence: number;
  source: string;
  rxcui?: string;
  din?: string;
}

export interface WaterfallResult {
  term: string;
  normalizedTerm: string;
  displayName: string;
  verified: boolean;
  level: VerificationLevel;
  source:
    | 'local_nlp'
    | 'rxnorm'
    | 'health_canada'
    | 'spelling_correction'
    | 'gemini_ai'
    | 'user_confirmed'
    | 'none';
  color: ChipColor;
  confidence: number;
  rxcui?: string;
  din?: string;
  suggestions?: WaterfallSuggestion[];
  requiresUserConfirmation: boolean;
  processingTimeMs: number;
  cost: number;
}

export interface DINResult {
  din: string;
  brandName: string;
  activeIngredient: string;
  strength?: string;
  manufacturer?: string;
  drugClass?: string;
}

/** 5-level verification of a free-text term. */
export async function verifyMedicalTerm(
  term: string,
  type: MedicalTermType
): Promise<WaterfallResult> {
  const res = await api.post<{ success: boolean; result: WaterfallResult; error?: string }>(
    '/api/waterfall',
    { action: 'verify', term, type }
  );
  if (!res.success) throw new Error(res.error || 'Verification failed');
  return res.result;
}

/** Resolve a Canadian Drug Identification Number (8 digits) to its full record. */
export async function verifyDIN(din: string): Promise<DINResult> {
  const res = await api.post<{ success: boolean; result: DINResult; error?: string }>(
    '/api/waterfall',
    { action: 'verify-din', din }
  );
  if (!res.success) throw new Error(res.error || 'DIN lookup failed');
  return res.result;
}

/** Autocomplete suggestions for the user's partial input. */
export async function autocompleteTerm(
  term: string,
  type: MedicalTermType
): Promise<WaterfallSuggestion[]> {
  const res = await api.post<{
    success: boolean;
    suggestions: WaterfallSuggestion[];
    error?: string;
  }>('/api/waterfall', { action: 'autocomplete', term, type });
  if (!res.success) throw new Error(res.error || 'Autocomplete failed');
  return res.suggestions;
}

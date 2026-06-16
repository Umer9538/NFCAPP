/**
 * Mobile port of `lib/hooks/useOnboardingDraft.ts` on the web.
 *
 * Web strategy → mobile equivalent:
 *   - localStorage debounced writes → AsyncStorage debounced writes
 *   - fetch('/api/onboarding/draft') → api.post/get/delete via shared client
 *   - beforeunload flush → AppState 'background' flush
 *
 * Contract matches the web hook so we can reason about it identically.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type DraftType,
  type DependentContext,
  type OnboardingDraftRecord,
  deleteDraft,
  getDraft,
  upsertDraft,
} from '@/api/onboardingDraft';

const DEFAULT_DEBOUNCE_MS = 500;
const DRAFT_ID_STORAGE_KEY = '@medguard_onboarding_draft_id';

function localCacheKey(draftType: DraftType, draftId: string | null): string {
  return draftId
    ? `firstaidtag:onboarding:${draftType}:${draftId}`
    : `firstaidtag:onboarding:${draftType}:pending`;
}

interface CachedDraft {
  draftId: string | null;
  stepData: Record<string, unknown>;
  currentStep: number;
  updatedAt: number;
}

async function readLocalCache(key: string): Promise<CachedDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedDraft;
  } catch {
    return null;
  }
}

async function writeLocalCache(key: string, value: CachedDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — DB sync is the durable layer
  }
}

async function clearLocalCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export interface UseOnboardingDraftOptions {
  draftType: DraftType;
  initialDraftId?: string | null;
  dependentContext?: DependentContext;
  routeContext?: string;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseOnboardingDraftResult {
  draftId: string | null;
  loaded: boolean;
  loading: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  restored: { stepData: Record<string, unknown>; currentStep: number } | null;
  trackChange: (stepData: Record<string, unknown>, currentStep: number) => void;
  syncToServer: (stepData: Record<string, unknown>, currentStep: number) => Promise<void>;
  clear: () => Promise<void>;
}

export function useOnboardingDraft(
  options: UseOnboardingDraftOptions
): UseOnboardingDraftResult {
  const {
    draftType,
    initialDraftId = null,
    dependentContext,
    routeContext,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    enabled = true,
  } = options;

  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(Boolean(initialDraftId));
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState<UseOnboardingDraftResult['restored']>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightStepRef = useRef<number | null>(null);
  const latestSnapshotRef = useRef<
    { stepData: Record<string, unknown>; currentStep: number } | null
  >(null);
  const draftIdRef = useRef<string | null>(initialDraftId);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  // ── Hydrate on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setLoaded(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      // 1. Try the server if we have a known draft id (passed in or last-saved).
      const persistedId =
        initialDraftId ?? (await AsyncStorage.getItem(DRAFT_ID_STORAGE_KEY));

      if (persistedId) {
        try {
          const record = await getDraft(persistedId);
          if (!cancelled && record) {
            setDraftId(record.id);
            setRestored({
              stepData: (record.stepData as Record<string, unknown>) ?? {},
              currentStep: record.currentStep ?? 1,
            });
            setLoaded(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[draft] server hydrate failed', err);
        }
      }

      // 2. Fall back to local cache.
      const cached = await readLocalCache(localCacheKey(draftType, persistedId));
      if (!cancelled && cached) {
        setRestored({ stepData: cached.stepData, currentStep: cached.currentStep });
        if (cached.draftId) {
          setDraftId(cached.draftId);
          await AsyncStorage.setItem(DRAFT_ID_STORAGE_KEY, cached.draftId);
        }
      }

      if (!cancelled) {
        setLoaded(true);
        setLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [enabled, initialDraftId, draftType]);

  // ── Debounced local-cache write on every change ─────────────────────────
  const trackChange = useCallback(
    (stepData: Record<string, unknown>, currentStep: number) => {
      if (!enabled) return;
      latestSnapshotRef.current = { stepData, currentStep };
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        void writeLocalCache(localCacheKey(draftType, draftIdRef.current), {
          draftId: draftIdRef.current,
          stepData,
          currentStep,
          updatedAt: Date.now(),
        });
      }, debounceMs);
    },
    [enabled, draftType, debounceMs]
  );

  // ── DB sync on step boundary ────────────────────────────────────────────
  const syncToServer = useCallback(
    async (stepData: Record<string, unknown>, currentStep: number) => {
      if (!enabled) return;
      latestSnapshotRef.current = { stepData, currentStep };
      if (inFlightStepRef.current === currentStep) return;
      inFlightStepRef.current = currentStep;
      setSyncing(true);
      setError(null);
      try {
        const record = await upsertDraft({
          id: draftIdRef.current ?? undefined,
          draftType,
          stepData,
          currentStep,
          routeContext,
          dependentContext,
        });
        setDraftId(record.id);
        await AsyncStorage.setItem(DRAFT_ID_STORAGE_KEY, record.id);
        await writeLocalCache(localCacheKey(draftType, record.id), {
          draftId: record.id,
          stepData,
          currentStep,
          updatedAt: Date.now(),
        });
        setLastSyncedAt(new Date());
      } catch (err: any) {
        console.warn('[draft] sync failed', err);
        setError(err?.message ?? 'Network error while saving progress');
      } finally {
        setSyncing(false);
        inFlightStepRef.current = null;
      }
    },
    [enabled, draftType, dependentContext, routeContext]
  );

  // ── Best-effort flush when the app goes to background ───────────────────
  useEffect(() => {
    if (!enabled) return;
    const onChange = async (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        const snap = latestSnapshotRef.current;
        if (snap) {
          await writeLocalCache(localCacheKey(draftType, draftIdRef.current), {
            draftId: draftIdRef.current,
            stepData: snap.stepData,
            currentStep: snap.currentStep,
            updatedAt: Date.now(),
          });
        }
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [enabled, draftType]);

  const clear = useCallback(async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await clearLocalCache(localCacheKey(draftType, draftIdRef.current));
    await AsyncStorage.removeItem(DRAFT_ID_STORAGE_KEY);
    if (draftIdRef.current) {
      try {
        await deleteDraft(draftIdRef.current);
      } catch (err) {
        console.warn('[draft] remote clear failed', err);
      }
    }
  }, [draftType]);

  return {
    draftId,
    loaded,
    loading,
    syncing,
    lastSyncedAt,
    error,
    restored,
    trackChange,
    syncToServer,
    clear,
  };
}

export type { OnboardingDraftRecord };

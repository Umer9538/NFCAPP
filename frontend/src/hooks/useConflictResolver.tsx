/**
 * Conflict Resolver Hook
 * Hook for managing conflict resolution UI
 */

import { useState, useCallback } from 'react';
import { offlineService } from '@/services/offlineService';
import type { Conflict, ConflictResolutionStrategy } from '@/components/ConflictResolver';

export interface ConflictResolution<T = any> {
  /**
   * Show conflict resolver
   */
  showConflicts: (localData: T, serverData: T, idField?: string) => Promise<T>;

  /**
   * Whether conflicts are being shown
   */
  isResolving: boolean;

  /**
   * Current conflicts
   */
  conflicts: Conflict[];

  /**
   * Hide conflict resolver
   */
  hideConflicts: () => void;
}

/**
 * Hook for managing conflict resolution
 */
export function useConflictResolver<T = any>(): ConflictResolution<T> {
  const [isResolving, setIsResolving] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [resolveCallback, setResolveCallback] = useState<{
    resolve: (data: T) => void;
    reject: (error: Error) => void;
    localData: T;
    serverData: T;
  } | null>(null);

  const showConflicts = useCallback(
    async (localData: T, serverData: T, idField: string = 'id'): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        // Detect conflicts
        offlineService
          .detectConflicts(localData, serverData, idField)
          .then((detectedConflicts) => {
            if (detectedConflicts.length === 0) {
              // No conflicts, use server data
              resolve(serverData);
              return;
            }

            // Show conflict resolver
            setConflicts(
              detectedConflicts.map((c) => ({
                field: c.field,
                localValue: c.local,
                serverValue: c.server,
                localUpdatedAt: (localData as any).updatedAt,
                serverUpdatedAt: (serverData as any).updatedAt,
              }))
            );
            setIsResolving(true);
            setResolveCallback({ resolve, reject, localData, serverData });
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    []
  );

  const hideConflicts = useCallback(() => {
    setIsResolving(false);
    setConflicts([]);
    if (resolveCallback) {
      resolveCallback.reject(new Error('Conflict resolution cancelled'));
      setResolveCallback(null);
    }
  }, [resolveCallback]);

  const handleResolve = useCallback(
    (strategy: ConflictResolutionStrategy, selections?: Record<string, 'local' | 'server'>) => {
      if (!resolveCallback) return;

      const { resolve, localData, serverData } = resolveCallback;

      let mergedData: T;

      if (strategy === 'local') {
        mergedData = localData;
      } else if (strategy === 'server') {
        mergedData = serverData;
      } else if (strategy === 'manual' && selections) {
        // Manual merge based on selections
        mergedData = { ...serverData };

        Object.entries(selections).forEach(([field, source]) => {
          if (source === 'local') {
            (mergedData as any)[field] = (localData as any)[field];
          }
        });
      } else {
        mergedData = serverData;
      }

      setIsResolving(false);
      setConflicts([]);
      setResolveCallback(null);
      resolve(mergedData);
    },
    [resolveCallback]
  );

  return {
    showConflicts,
    isResolving,
    conflicts,
    hideConflicts,
    // Export handleResolve for use with ConflictResolver component
    handleResolve: handleResolve as any,
  };
}

/**
 * Auto-merge strategies
 */
export const autoMergeStrategies = {
  /**
   * Server wins (default)
   */
  serverWins: (localData: any, serverData: any) => serverData,

  /**
   * Local wins
   */
  localWins: (localData: any, serverData: any) => localData,

  /**
   * Newest wins (based on updatedAt)
   */
  newestWins: (localData: any, serverData: any) => {
    const localUpdated = new Date(localData.updatedAt || 0).getTime();
    const serverUpdated = new Date(serverData.updatedAt || 0).getTime();

    return localUpdated > serverUpdated ? localData : serverData;
  },

  /**
   * Field-by-field merge (newer field value wins)
   */
  fieldByField: (localData: any, serverData: any) => {
    const merged = { ...serverData };
    const localUpdated = new Date(localData.updatedAt || 0).getTime();
    const serverUpdated = new Date(serverData.updatedAt || 0).getTime();

    if (localUpdated > serverUpdated) {
      // Local is newer, merge local changes
      Object.keys(localData).forEach((key) => {
        if (key !== 'id' && key !== 'createdAt') {
          merged[key] = localData[key];
        }
      });
    }

    return merged;
  },

  /**
   * Deep merge (combine arrays, merge objects)
   */
  deepMerge: (localData: any, serverData: any) => {
    const merged = { ...serverData };

    Object.keys(localData).forEach((key) => {
      if (key === 'id' || key === 'createdAt') {
        return;
      }

      const localValue = localData[key];
      const serverValue = serverData[key];

      // Merge arrays
      if (Array.isArray(localValue) && Array.isArray(serverValue)) {
        // Combine and deduplicate
        merged[key] = Array.from(new Set([...serverValue, ...localValue]));
      }
      // Merge objects
      else if (
        typeof localValue === 'object' &&
        localValue !== null &&
        typeof serverValue === 'object' &&
        serverValue !== null
      ) {
        merged[key] = { ...serverValue, ...localValue };
      }
      // Use local value if server value is null/undefined
      else if (serverValue === null || serverValue === undefined) {
        merged[key] = localValue;
      }
    });

    return merged;
  },
};

/**
 * Hook for automatic conflict resolution
 */
export function useAutoConflictResolver<T = any>(
  strategy: keyof typeof autoMergeStrategies = 'serverWins'
) {
  const resolve = useCallback(
    (localData: T, serverData: T): T => {
      const mergeStrategy = autoMergeStrategies[strategy];
      return mergeStrategy(localData, serverData);
    },
    [strategy]
  );

  return { resolve };
}

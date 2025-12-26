/**
 * Offline Query Hook
 * Enhanced React Query hook with offline support
 * Uses AsyncStorage for offline caching when backend is unavailable
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useOfflineStore } from '@/store/offlineStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';

const CACHE_PREFIX = '@medguard_cache_';

export interface OfflineQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  queryKey: any[];
  queryFn: () => Promise<TData>;
  cacheKey?: string;
  useOfflineCache?: boolean;
  syncOnReconnect?: boolean;
}

/**
 * Save data to AsyncStorage cache
 */
async function saveToCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('[OfflineQuery] Error saving to cache:', error);
  }
}

/**
 * Get data from AsyncStorage cache
 */
async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (cached) {
      const { data } = JSON.parse(cached);
      return data as T;
    }
    return null;
  } catch (error) {
    console.error('[OfflineQuery] Error reading from cache:', error);
    return null;
  }
}

/**
 * Enhanced useQuery hook with offline caching
 */
export function useOfflineQuery<TData = unknown>(options: OfflineQueryOptions<TData>) {
  const {
    queryKey,
    queryFn,
    cacheKey,
    useOfflineCache = true,
    syncOnReconnect = true,
    ...queryOptions
  } = options;

  const { isOnline, syncQueue } = useOfflineStore();
  const queryClient = useQueryClient();

  const enhancedQueryFn = useCallback(async () => {
    if (isOnline) {
      try {
        const data = await queryFn();
        if (cacheKey) {
          await saveToCache(cacheKey, data);
        }
        return data;
      } catch (error) {
        console.error('[OfflineQuery] Fetch error:', error);
        if (cacheKey && useOfflineCache) {
          const cached = await getFromCache<TData>(cacheKey);
          if (cached) {
            console.log('[OfflineQuery] Using cached data as fallback');
            return cached;
          }
        }
        throw error;
      }
    }

    if (!isOnline && cacheKey && useOfflineCache) {
      const cached = await getFromCache<TData>(cacheKey);
      if (cached) {
        console.log('[OfflineQuery] Using cached data (offline)');
        return cached;
      }
      throw new Error('No cached data available offline');
    }

    throw new Error('Cannot fetch data while offline');
  }, [isOnline, queryFn, cacheKey, useOfflineCache]);

  const query = useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...queryOptions,
  });

  useEffect(() => {
    if (isOnline && syncOnReconnect) {
      query.refetch();
      syncQueue();
    }
  }, [isOnline, syncOnReconnect]);

  const isCached = !isOnline && !!cacheKey;

  return {
    ...query,
    isCached,
    isOnline,
  };
}

export interface OfflineMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  buildRequest: (variables: TVariables) => {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    headers?: Record<string, string>;
    priority?: 'high' | 'medium' | 'low';
  };
  onOptimisticUpdate?: (variables: TVariables) => void;
  onRollback?: () => void;
  queueWhenOffline?: boolean;
}

/**
 * Enhanced useMutation hook with offline queue support
 */
export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: OfflineMutationOptions<TData, TVariables>
) {
  const {
    mutationFn,
    buildRequest,
    onOptimisticUpdate,
    onRollback,
    queueWhenOffline = true,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const { isOnline, addToQueue } = useOfflineStore();

  const enhancedMutationFn = useCallback(
    async (variables: TVariables) => {
      if (onOptimisticUpdate) {
        onOptimisticUpdate(variables);
      }

      if (!isOnline && queueWhenOffline) {
        try {
          const request = buildRequest(variables);
          await addToQueue({
            ...request,
            maxRetries: 3,
            priority: request.priority || 'medium',
          });
          console.log('[OfflineMutation] Request queued for later sync');
          return null as TData;
        } catch (error) {
          if (onRollback) {
            onRollback();
          }
          throw error;
        }
      }

      try {
        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        if (onRollback) {
          onRollback();
        }
        throw error;
      }
    },
    [isOnline, mutationFn, buildRequest, onOptimisticUpdate, onRollback, queueWhenOffline, addToQueue]
  );

  const mutation = useMutation({
    mutationFn: enhancedMutationFn,
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });

  return {
    ...mutation,
    isOnline,
    isQueued: !isOnline && queueWhenOffline,
  };
}

/**
 * Hook to sync all cached data
 */
export function useOfflineSync() {
  const { syncQueue, isOnline, isSyncing, pendingSync } = useOfflineStore();
  const queryClient = useQueryClient();

  const syncAll = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const result = await syncQueue();
    await queryClient.invalidateQueries();

    return result;
  }, [isOnline, syncQueue, queryClient]);

  return {
    syncAll,
    isOnline,
    isSyncing,
    pendingSync,
  };
}

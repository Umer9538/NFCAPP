/**
 * Offline Query Hook
 * Enhanced React Query hook with offline caching support
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useOfflineStore } from '@/store/offlineStore';
import { cacheService, CacheKey } from '@/db/cache';
import { useCallback, useEffect } from 'react';

export interface OfflineQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  /**
   * Query key
   */
  queryKey: any[];

  /**
   * Query function
   */
  queryFn: () => Promise<TData>;

  /**
   * Cache key for AsyncStorage
   */
  cacheKey?: CacheKey;

  /**
   * Whether to use cache when offline (default: true)
   */
  useOfflineCache?: boolean;

  /**
   * Whether to sync when coming back online (default: true)
   */
  syncOnReconnect?: boolean;
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

  // Enhanced query function with offline support
  const enhancedQueryFn = useCallback(async () => {
    // If online, fetch from server
    if (isOnline) {
      try {
        const data = await queryFn();

        // Cache the result if cacheKey provided
        if (cacheKey) {
          await cacheService.saveToCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        console.error('[OfflineQuery] Fetch error:', error);

        // Try cache as fallback
        if (cacheKey && useOfflineCache) {
          const cached = await cacheService.getFromCache<TData>(cacheKey);
          if (cached) {
            console.log('[OfflineQuery] Using cached data as fallback');
            return cached;
          }
        }

        throw error;
      }
    }

    // If offline and cache enabled, use cache
    if (!isOnline && cacheKey && useOfflineCache) {
      const cached = await cacheService.getFromCache<TData>(cacheKey);

      if (cached) {
        console.log('[OfflineQuery] Using cached data (offline)');
        return cached;
      }

      throw new Error('No cached data available offline');
    }

    throw new Error('Cannot fetch data while offline');
  }, [isOnline, queryFn, cacheKey, useOfflineCache]);

  // Use React Query with enhanced function
  const query = useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...queryOptions,
  });

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && syncOnReconnect) {
      // Refetch query
      query.refetch();

      // Sync queued requests
      syncQueue();
    }
  }, [isOnline, syncOnReconnect]);

  // Check if using cached data
  const isCached = !isOnline && !!cacheKey;

  return {
    ...query,
    isCached,
    isOnline,
  };
}

export interface OfflineMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  /**
   * Mutation function
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Request builder for offline queue
   */
  buildRequest: (variables: TVariables) => {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    headers?: Record<string, string>;
    priority?: 'high' | 'medium' | 'low';
  };

  /**
   * Optimistic update function
   */
  onOptimisticUpdate?: (variables: TVariables) => void;

  /**
   * Rollback function
   */
  onRollback?: () => void;

  /**
   * Whether to queue request when offline (default: true)
   */
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
  const queryClient = useQueryClient();

  // Enhanced mutation function
  const enhancedMutationFn = useCallback(
    async (variables: TVariables) => {
      // Apply optimistic update
      if (onOptimisticUpdate) {
        onOptimisticUpdate(variables);
      }

      // If offline, queue the request
      if (!isOnline && queueWhenOffline) {
        try {
          const request = buildRequest(variables);
          await addToQueue({
            ...request,
            maxRetries: 3,
            priority: request.priority || 'medium',
          });

          console.log('[OfflineMutation] Request queued for later sync');
          return null as TData; // Return null as placeholder
        } catch (error) {
          // Rollback on error
          if (onRollback) {
            onRollback();
          }

          throw error;
        }
      }

      // If online, execute mutation
      try {
        const result = await mutationFn(variables);
        return result;
      } catch (error) {
        // Rollback on error
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

    // Sync queued requests
    const result = await syncQueue();

    // Invalidate all queries to refetch
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

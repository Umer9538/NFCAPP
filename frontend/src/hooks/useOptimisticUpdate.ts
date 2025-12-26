/**
 * Optimistic Update Hook
 * Handle optimistic updates with offline queue support
 */

import { useState, useCallback } from 'react';
import { useOfflineStore } from '@/store/offlineStore';
import { QueuedRequest } from '@/services/offlineService';

export interface OptimisticUpdateOptions<T> {
  /**
   * Function to execute the update
   */
  mutationFn: () => Promise<T>;

  /**
   * Function to optimistically update the UI
   */
  onOptimisticUpdate: (data: any) => void;

  /**
   * Function to rollback the optimistic update on error
   */
  onRollback?: () => void;

  /**
   * Function to confirm the update on success
   */
  onSuccess?: (data: T) => void;

  /**
   * Function to handle errors
   */
  onError?: (error: Error) => void;

  /**
   * Request data for offline queue
   */
  request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>;
}

export interface OptimisticUpdateState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for handling optimistic updates with offline support
 */
export function useOptimisticUpdate<T = unknown>() {
  const { isOnline, addToQueue } = useOfflineStore();
  const [state, setState] = useState<OptimisticUpdateState>({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const mutate = useCallback(
    async (options: OptimisticUpdateOptions<T>) => {
      const {
        mutationFn,
        onOptimisticUpdate,
        onRollback,
        onSuccess,
        onError,
        request,
      } = options;

      // Reset state
      setState({
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      // Apply optimistic update immediately
      try {
        onOptimisticUpdate(request.data);
      } catch (error) {
        console.error('[OptimisticUpdate] Error applying optimistic update:', error);
      }

      // If offline, queue the request
      if (!isOnline) {
        try {
          await addToQueue(request);

          setState({
            isPending: false,
            isSuccess: true,
            isError: false,
            error: null,
          });

          console.log('[OptimisticUpdate] Request queued for later sync');
          return;
        } catch (error) {
          console.error('[OptimisticUpdate] Error queuing request:', error);

          // Rollback on error
          if (onRollback) {
            onRollback();
          }

          const err = error instanceof Error ? error : new Error('Failed to queue request');

          setState({
            isPending: false,
            isSuccess: false,
            isError: true,
            error: err,
          });

          if (onError) {
            onError(err);
          }

          return;
        }
      }

      // If online, execute the mutation
      try {
        const result = await mutationFn();

        setState({
          isPending: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        if (onSuccess) {
          onSuccess(result);
        }

        console.log('[OptimisticUpdate] Mutation successful');
      } catch (error) {
        console.error('[OptimisticUpdate] Mutation error:', error);

        // Rollback on error
        if (onRollback) {
          onRollback();
        }

        const err = error instanceof Error ? error : new Error('Mutation failed');

        setState({
          isPending: false,
          isSuccess: false,
          isError: true,
          error: err,
        });

        if (onError) {
          onError(err);
        }
      }
    },
    [isOnline, addToQueue]
  );

  const reset = useCallback(() => {
    setState({
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  }, []);

  return {
    mutate,
    reset,
    ...state,
  };
}

/**
 * Hook for handling multiple optimistic updates
 */
export function useOptimisticUpdates() {
  const { isOnline, addToQueue } = useOfflineStore();

  const executeUpdate = useCallback(
    async <T,>(options: OptimisticUpdateOptions<T>) => {
      const {
        mutationFn,
        onOptimisticUpdate,
        onRollback,
        onSuccess,
        onError,
        request,
      } = options;

      // Apply optimistic update immediately
      try {
        onOptimisticUpdate(request.data);
      } catch (error) {
        console.error('[OptimisticUpdates] Error applying optimistic update:', error);
      }

      // If offline, queue the request
      if (!isOnline) {
        try {
          await addToQueue(request);
          console.log('[OptimisticUpdates] Request queued for later sync');
          return;
        } catch (error) {
          console.error('[OptimisticUpdates] Error queuing request:', error);

          if (onRollback) {
            onRollback();
          }

          if (onError) {
            onError(error instanceof Error ? error : new Error('Failed to queue request'));
          }

          throw error;
        }
      }

      // If online, execute the mutation
      try {
        const result = await mutationFn();

        if (onSuccess) {
          onSuccess(result);
        }

        console.log('[OptimisticUpdates] Mutation successful');
        return result;
      } catch (error) {
        console.error('[OptimisticUpdates] Mutation error:', error);

        if (onRollback) {
          onRollback();
        }

        if (onError) {
          onError(error instanceof Error ? error : new Error('Mutation failed'));
        }

        throw error;
      }
    },
    [isOnline, addToQueue]
  );

  return { executeUpdate, isOnline };
}

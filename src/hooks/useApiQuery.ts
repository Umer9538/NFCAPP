/**
 * useApiQuery Hook
 * Wrapper around React Query with automatic error handling and retry logic
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/utils/errors';

export interface UseApiQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  /**
   * Show error toast automatically
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Number of retries on failure
   * @default 2
   */
  retries?: number;

  /**
   * Retry delay in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

/**
 * Enhanced useQuery hook with automatic error handling
 */
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: UseApiQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const {
    showErrorToast = true,
    errorMessage,
    retries = 2,
    retryDelay = 1000,
    ...queryOptions
  } = options || {};

  const { error: showError } = useToast();

  // Execute query with retry logic
  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    retry: retries,
    retryDelay: (attemptIndex) => Math.min(retryDelay * 2 ** attemptIndex, 30000),
    ...queryOptions,
  });

  // Show error toast when query fails
  useEffect(() => {
    if (query.error && showErrorToast) {
      const message = errorMessage || getErrorMessage(query.error as any);
      showError(message);
    }
  }, [query.error, showErrorToast, errorMessage]);

  return query;
}

/**
 * Hook variant that returns data with loading and error states
 */
export function useApiQueryData<TData = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: UseApiQueryOptions<TData>
): {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useApiQuery(queryKey, queryFn, options);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

/**
 * Hook for paginated queries
 */
export function useApiInfiniteQuery<TData = unknown>(
  queryKey: any[],
  queryFn: (pageParam: number) => Promise<TData>,
  options?: UseApiQueryOptions<TData>
) {
  // TODO: Implement infinite query wrapper
  // This would use useInfiniteQuery from React Query
  // For now, return basic query
  return useApiQuery(queryKey, () => queryFn(1), options);
}

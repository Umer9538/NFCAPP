/**
 * useApiMutation Hook
 * Wrapper around React Query useMutation with optimistic updates and error handling
 */

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/utils/errors';

export interface UseApiMutationOptions<TData, TVariables, TError = Error>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  /**
   * Show success toast automatically
   * @default false
   */
  showSuccessToast?: boolean;

  /**
   * Success message to show
   */
  successMessage?: string;

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
   * Query keys to invalidate on success
   */
  invalidateQueries?: string[][];

  /**
   * Optimistic update configuration
   */
  optimistic?: {
    queryKey: any[];
    updateFn: (oldData: any, variables: TVariables) => any;
  };
}

/**
 * Enhanced useMutation hook with automatic error handling and optimistic updates
 */
export function useApiMutation<TData = unknown, TVariables = void, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables, TError>
): UseMutationResult<TData, TError, TVariables> {
  const {
    showSuccessToast = false,
    successMessage,
    showErrorToast = true,
    errorMessage,
    invalidateQueries = [],
    optimistic,
    onSuccess,
    onError,
    onSettled,
    ...mutationOptions
  } = options || {};

  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();

  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn,

    // Optimistic update
    onMutate: async (variables) => {
      if (optimistic) {
        // Cancel outgoing queries
        await queryClient.cancelQueries({ queryKey: optimistic.queryKey });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(optimistic.queryKey);

        // Optimistically update
        queryClient.setQueryData(
          optimistic.queryKey,
          (old: any) => optimistic.updateFn(old, variables)
        );

        // Return context with previous data for rollback
        return { previousData };
      }

      // Call original onMutate if provided
      if (mutationOptions.onMutate) {
        return mutationOptions.onMutate(variables);
      }
    },

    // Success handler
    onSuccess: (data, variables, context) => {
      // Show success toast
      if (showSuccessToast && successMessage) {
        showSuccess(successMessage);
      }

      // Invalidate queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Call original onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },

    // Error handler
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (optimistic && context && 'previousData' in context) {
        queryClient.setQueryData(
          optimistic.queryKey,
          (context as any).previousData
        );
      }

      // Show error toast
      if (showErrorToast) {
        const message = errorMessage || getErrorMessage(error as any);
        showError(message);
      }

      // Call original onError if provided
      if (onError) {
        onError(error, variables, context);
      }
    },

    // Settled handler (called on both success and error)
    onSettled: (data, error, variables, context) => {
      // Refetch queries after mutation settles
      if (optimistic) {
        queryClient.invalidateQueries({ queryKey: optimistic.queryKey });
      }

      // Call original onSettled if provided
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    },

    ...mutationOptions,
  });

  return mutation;
}

/**
 * Hook for delete mutations with confirmation
 */
export function useDeleteMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: 'Deleted successfully',
    ...options,
  });
}

/**
 * Hook for create mutations
 */
export function useCreateMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: 'Created successfully',
    ...options,
  });
}

/**
 * Hook for update mutations
 */
export function useUpdateMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation(mutationFn, {
    showSuccessToast: true,
    successMessage: 'Updated successfully',
    ...options,
  });
}

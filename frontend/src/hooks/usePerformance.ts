/**
 * Performance Optimization Hooks
 * Custom hooks for React performance optimization
 */

import React, { useEffect, useRef, useMemo, useCallback, DependencyList } from 'react';
import { measureRender, trackScreenLoad, runAfterInteractions } from '@/utils/performance';

// Re-export React for convenience
import React from 'react';

/**
 * Use memoized value with custom comparison
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList,
  compare?: (prev: T, next: T) => boolean
): T {
  const previousValue = useRef<T>();

  return useMemo(() => {
    const nextValue = factory();

    if (previousValue.current !== undefined && compare) {
      if (compare(previousValue.current, nextValue)) {
        return previousValue.current;
      }
    }

    previousValue.current = nextValue;
    return nextValue;
  }, deps);
}

/**
 * Optimized callback that doesn't change unless dependencies change
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Defer expensive computations until after render
 */
export function useDeferredValue<T>(value: T, delay: number = 0): T {
  const [deferredValue, setDeferredValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      runAfterInteractions(() => {
        setDeferredValue(value);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return deferredValue;
}

/**
 * Run effect after interactions complete (won't block UI)
 */
export function useInteractionEffect(
  effect: () => void | (() => void),
  deps: DependencyList
): void {
  useEffect(() => {
    let cleanup: void | (() => void);

    runAfterInteractions(() => {
      cleanup = effect();
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}

/**
 * Track component render performance
 */
export function useRenderTracking(componentName: string): void {
  const renderMeasure = useRef(__DEV__ ? measureRender(componentName) : null);

  useEffect(() => {
    if (!__DEV__ || !renderMeasure.current) return;

    renderMeasure.current.start();
    return () => {
      renderMeasure.current?.end();
    };
  });
}

/**
 * Track screen load time
 */
export function useScreenLoadTracking(screenName: string): void {
  useEffect(() => {
    const endTracking = trackScreenLoad(screenName);
    return endTracking;
  }, [screenName]);
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled value hook
 */
export function useThrottledValue<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, interval - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Compare previous and current value
 */
export function useValueChanged<T>(value: T, compare?: (prev: T, next: T) => boolean): boolean {
  const previousValue = usePrevious(value);

  if (previousValue === undefined) {
    return false;
  }

  if (compare) {
    return !compare(previousValue, value);
  }

  return previousValue !== value;
}

/**
 * Lazy initialization hook
 */
export function useLazyInit<T>(initializer: () => T): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = initializer();
  }

  return ref.current;
}

/**
 * Cleanup on unmount hook
 */
export function useCleanup(cleanup: () => void): void {
  useEffect(() => {
    return cleanup;
  }, []);
}

/**
 * Mount/unmount effect hook
 */
export function useMountEffect(onMount: () => void, onUnmount?: () => void): void {
  useEffect(() => {
    onMount();
    return onUnmount;
  }, []);
}

/**
 * Update effect (skip on mount)
 */
export function useUpdateEffect(effect: () => void | (() => void), deps: DependencyList): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
  }, deps);
}

/**
 * Stable callback that never changes reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Memoized object/array that doesn't change unless contents change
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const ref = useRef<T>();
  const depsRef = useRef<DependencyList>(deps);

  const hasChanged = useMemo(() => {
    if (!depsRef.current) return true;

    return deps.some((dep, i) => {
      const prevDep = depsRef.current[i];
      return !Object.is(dep, prevDep);
    });
  }, deps);

  if (hasChanged || !ref.current) {
    ref.current = factory();
    depsRef.current = deps;
  }

  return ref.current!;
}

/**
 * Batch multiple state updates
 */
export function useBatchedState<T>(
  initialState: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = React.useState(initialState);
  const updateQueue = useRef<(T | ((prev: T) => T))[]>([]);
  const isProcessing = useRef(false);

  const batchedSetState = useCallback((value: T | ((prev: T) => T)) => {
    updateQueue.current.push(value);

    if (!isProcessing.current) {
      isProcessing.current = true;

      runAfterInteractions(() => {
        const updates = [...updateQueue.current];
        updateQueue.current = [];
        isProcessing.current = false;

        setState((prevState) => {
          return updates.reduce((state, update) => {
            return typeof update === 'function' ? (update as (prev: T) => T)(state) : update;
          }, prevState);
        });
      });
    }
  }, []);

  return [state, batchedSetState];
}

/**
 * Prefetch data before navigation
 */
export function usePrefetch<T>(
  queryKey: any[],
  fetchFn: () => Promise<T>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (enabled) {
      runAfterInteractions(() => {
        fetchFn().catch(console.error);
      });
    }
  }, [enabled, ...queryKey]);
}

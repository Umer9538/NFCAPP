/**
 * Performance Monitoring and Optimization Utilities
 */

import { InteractionManager } from 'react-native';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  SLOW_OPERATION: 1000,
  VERY_SLOW_OPERATION: 3000,
  ACCEPTABLE_RENDER: 16, // 60fps = 16.67ms per frame
  SLOW_RENDER: 32, // 30fps
};

/**
 * Performance mark for measuring operations
 */
interface PerformanceMark {
  name: string;
  startTime: number;
}

const marks = new Map<string, PerformanceMark>();

/**
 * Start measuring performance
 */
export function markStart(name: string): void {
  if (__DEV__) {
    marks.set(name, {
      name,
      startTime: Date.now(),
    });
  }
}

/**
 * End measuring and log if slow
 */
export function markEnd(name: string): number | null {
  if (!__DEV__) return null;

  const mark = marks.get(name);
  if (!mark) {
    console.warn(`⚠️ Performance mark "${name}" not found`);
    return null;
  }

  const duration = Date.now() - mark.startTime;
  marks.delete(name);

  // Log slow operations
  if (duration > THRESHOLDS.VERY_SLOW_OPERATION) {
    console.error(`🐌 VERY SLOW: ${name} took ${duration}ms`);
  } else if (duration > THRESHOLDS.SLOW_OPERATION) {
    console.warn(`⚠️ SLOW: ${name} took ${duration}ms`);
  } else if (duration > 100) {
    console.log(`⏱️ ${name} took ${duration}ms`);
  }

  return duration;
}

/**
 * Measure async operation
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  markStart(name);
  try {
    return await fn();
  } finally {
    markEnd(name);
  }
}

/**
 * Measure sync operation
 */
export function measure<T>(name: string, fn: () => T): T {
  markStart(name);
  try {
    return fn();
  } finally {
    markEnd(name);
  }
}

/**
 * Run after interactions complete (won't block animations)
 */
export function runAfterInteractions(callback: () => void): void {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
}

/**
 * Defer non-critical work
 */
export function defer(callback: () => void, delay: number = 0): NodeJS.Timeout {
  return setTimeout(() => {
    runAfterInteractions(callback);
  }, delay);
}

/**
 * Batch multiple state updates
 */
export function batchUpdates(callback: () => void): void {
  // React 18 automatically batches updates, but this can be used
  // for explicit batching if needed
  callback();
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  // This is a simple heuristic, in production you might want to use
  // react-native-device-info to get more accurate information
  return false; // TODO: Implement proper device detection
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Clear memoization cache periodically
 */
export function createMemoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });

    // Clean up old entries
    if (cache.size > 100) {
      const oldestKey = Array.from(cache.keys())[0];
      cache.delete(oldestKey);
    }

    return result;
  };
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string): {
  start: () => void;
  end: () => void;
} {
  let startTime: number;

  return {
    start: () => {
      if (__DEV__) {
        startTime = Date.now();
      }
    },
    end: () => {
      if (__DEV__) {
        const duration = Date.now() - startTime;

        if (duration > THRESHOLDS.SLOW_RENDER) {
          console.warn(`🐌 SLOW RENDER: ${componentName} took ${duration}ms`);
        } else if (duration > THRESHOLDS.ACCEPTABLE_RENDER) {
          console.log(`⚠️ ${componentName} render: ${duration}ms`);
        }
      }
    },
  };
}

/**
 * Memory warning handler
 */
export function onMemoryWarning(callback: () => void): () => void {
  // In React Native, you can listen to memory warnings
  // This is a placeholder for that functionality
  return () => {
    // Cleanup
  };
}

/**
 * Log bundle size analysis (dev only)
 */
export function logBundleSize(): void {
  if (__DEV__) {
    console.log('📦 Bundle size analysis:');
    console.log('Use `npx react-native-bundle-visualizer` to analyze bundle size');
  }
}

/**
 * Prefetch data before screen navigation
 */
export async function prefetchData<T>(
  queryKey: any[],
  fetchFn: () => Promise<T>
): Promise<void> {
  try {
    // This would integrate with React Query's prefetchQuery
    await fetchFn();
  } catch (error) {
    console.error('Prefetch failed:', error);
  }
}

/**
 * Lazy initialize expensive services
 */
export function lazyInitialize<T>(
  initializer: () => T
): () => T {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = initializer();
    }
    return instance;
  };
}

/**
 * Check if animations should be reduced (accessibility)
 */
export function shouldReduceMotion(): boolean {
  // In production, check AccessibilityInfo.isReduceMotionEnabled
  return false;
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric)!.push(value);
  }

  getStats(metric: string): {
    min: number;
    max: number;
    avg: number;
    count: number;
  } | null {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return null;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  }

  clear(): void {
    this.metrics.clear();
  }

  report(): void {
    if (__DEV__) {
      console.log('📊 Performance Report:');
      this.metrics.forEach((values, metric) => {
        const stats = this.getStats(metric);
        if (stats) {
          console.log(
            `  ${metric}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min}ms, max=${stats.max}ms (${stats.count} samples)`
          );
        }
      });
    }
  }
}

/**
 * Track screen load time
 */
export function trackScreenLoad(screenName: string): () => void {
  const startTime = Date.now();

  return () => {
    const loadTime = Date.now() - startTime;
    PerformanceMonitor.getInstance().record(`screen:${screenName}`, loadTime);

    if (__DEV__ && loadTime > 1000) {
      console.warn(`⚠️ ${screenName} took ${loadTime}ms to load`);
    }
  };
}

/**
 * FlatList optimization helpers
 */
export const flatListOptimizations = {
  /**
   * Get item layout for known item heights (improves scrolling)
   */
  getItemLayout: (itemHeight: number) => (
    _data: any,
    index: number
  ) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),

  /**
   * Optimal window size for list rendering
   */
  windowSize: isLowEndDevice() ? 5 : 10,

  /**
   * Remove clipping on Android for better performance
   */
  removeClippedSubviews: true,

  /**
   * Max items to render in batch
   */
  maxToRenderPerBatch: 10,

  /**
   * Update cells in batch for better performance
   */
  updateCellsBatchingPeriod: 50,

  /**
   * Initial items to render
   */
  initialNumToRender: 10,
};

/**
 * MedGuard Mobile App
 * Main entry point using React Navigation
 * Includes dynamic theme system based on account type
 */

import React from 'react';
import { Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootNavigator from '@/navigation/RootNavigator';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { API_CONFIG } from '@/constants/config';

// Cap OS-level font scaling so users with "Largest" text in their system
// settings still get accessibility scaling, but the UI doesn't break (text
// overflowing fixed-height rows, buttons wrapping, cards bursting, etc.).
// 1.2 keeps things readable while preserving the original layout proportions.
//
// In React 19, `Text.defaultProps` is silently ignored because Text and
// TextInput are forwardRef components. We instead wrap their `.render` so the
// default flows through to every instance unless the call site overrides it.
const MAX_FONT_SCALE = 1.2;

function injectFontScaleDefault(Component: unknown) {
  const c = Component as { render?: (p: unknown, r: unknown) => unknown };
  if (!c || typeof c.render !== 'function') return;
  const original = c.render;
  c.render = function patched(props: any, ref: any) {
    const next =
      props && props.maxFontSizeMultiplier != null
        ? props
        : { ...props, maxFontSizeMultiplier: MAX_FONT_SCALE };
    return original.call(this, next, ref);
  };
}

injectFontScaleDefault(Text);
injectFontScaleDefault(TextInput);

// Debug: Log API configuration
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
          <OfflineIndicator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;

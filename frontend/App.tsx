/**
 * MedGuard Mobile App
 * Main entry point using React Navigation
 * Includes dynamic theme system based on account type
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerRootComponent } from 'expo';

import RootNavigator from '@/navigation/RootNavigator';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { API_CONFIG } from '@/constants/config';

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

export default registerRootComponent(App);

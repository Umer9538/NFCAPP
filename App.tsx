/**
 * MedGuard Mobile App
 * Main entry point using React Navigation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerRootComponent } from 'expo';

import RootNavigator from '@/navigation/RootNavigator';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { API_CONFIG } from '@/constants/config';
import { initDatabase, getDatabaseStats } from '@/db/database';
import { seedDatabase } from '@/db/seed';

// Debug: Log API configuration
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
});
console.log('📡 Using local SQLite database');

// Create a QueryClient instance with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when internet reconnects
      networkMode: 'offlineFirst', // Work offline-first
    },
    mutations: {
      retry: 2, // Retry failed mutations 2 times
      retryDelay: 1000, // Wait 1 second between retries
      networkMode: 'offlineFirst', // Queue mutations when offline
    },
  },
});

function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('📦 Initializing SQLite database...');
        await initDatabase();

        // Check if we have any users, if not, seed the database
        const stats = await getDatabaseStats();
        console.log('📊 Database stats:', stats);

        if (!stats.user || stats.user === 0) {
          console.log('🌱 Seeding database with test data...');
          await seedDatabase();
          const newStats = await getDatabaseStats();
          console.log('📊 Updated database stats:', newStats);
        }

        setIsDbReady(true);
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        setDbError(error.message);
      }
    };

    setupDatabase();
  }, []);

  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
        <OfflineIndicator />
        <StatusBar style="auto" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default registerRootComponent(App);

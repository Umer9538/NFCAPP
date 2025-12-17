# Offline Mode Usage Guide

## Overview

The MedGuard app supports full offline functionality with automatic data synchronization, optimistic updates, and conflict resolution.

## Core Services

### 1. Cache Service (`src/db/cache.ts`)

Local data caching with TTL (Time To Live) support.

```typescript
import { cacheService } from '@/db/cache';

// Save to cache
await cacheService.saveToCache('user_profile', userData);

// Get from cache (returns null if expired)
const cached = await cacheService.getFromCache('user_profile');

// Check if expired
const expired = await cacheService.isExpired('user_profile');

// Clear specific cache
await cacheService.clearCache('user_profile');

// Clear all cache
await cacheService.clearAllCache();

// Get cache stats
const stats = await cacheService.getCacheStats();
// { totalEntries, expiredEntries, validEntries }

// Cleanup expired entries
const cleaned = await cacheService.cleanupExpired();
```

**Available Cache Keys:**
- `user_profile` - 24 hours TTL
- `medical_profile` - 24 hours TTL
- `emergency_contacts` - 24 hours TTL
- `bracelet_status` - 1 hour TTL
- `subscription` - 6 hours TTL
- `recent_activities` - 30 minutes TTL
- `dashboard_stats` - 15 minutes TTL
- `invoices` - 24 hours TTL

### 2. Offline Service (`src/services/offlineService.ts`)

Network detection and offline request queue management.

```typescript
import { offlineService } from '@/services/offlineService';

// Check online status
const isOnline = offlineService.getIsOnline();

// Subscribe to connectivity changes
const unsubscribe = offlineService.subscribe((isOnline) => {
  console.log('Online status:', isOnline);
});

// Add request to queue
const requestId = await offlineService.addToQueue({
  method: 'POST',
  url: 'https://api.medguard.app/medical-profile',
  data: { bloodType: 'O+' },
  headers: { 'Authorization': 'Bearer token' },
  maxRetries: 3,
  priority: 'high', // high | medium | low
});

// Get queue
const queue = await offlineService.getQueue();

// Sync queue (when back online)
const result = await offlineService.syncQueue();
// { success: 2, failed: 0, skipped: 0, errors: [] }

// Remove from queue
await offlineService.removeFromQueue(requestId);

// Clear queue
await offlineService.clearQueue();

// Detect conflicts
const conflicts = await offlineService.detectConflicts(
  localData,
  serverData,
  'id'
);

// Merge data
const merged = offlineService.mergeData(
  localData,
  serverData,
  'server' // server | local | merge
);
```

### 3. Offline Store (`src/store/offlineStore.ts`)

Zustand store for global offline state management.

```typescript
import { useOfflineStore } from '@/store/offlineStore';

function MyComponent() {
  const {
    isOnline,
    queuedRequests,
    lastSync,
    isSyncing,
    pendingSync,

    setOnline,
    addToQueue,
    syncQueue,
    clearQueue,
  } = useOfflineStore();

  // Add to queue
  const handleUpdate = async () => {
    await addToQueue({
      method: 'PATCH',
      url: '/api/profile',
      data: { name: 'John' },
      priority: 'high',
      maxRetries: 3,
    });
  };

  // Sync queue
  const handleSync = async () => {
    const result = await syncQueue();
    console.log('Sync result:', result);
  };

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Pending: {pendingSync}</Text>
      {lastSync && <Text>Last synced: {lastSync}</Text>}
    </View>
  );
}
```

## React Hooks

### 1. useOfflineQuery

Enhanced `useQuery` with automatic offline caching.

```typescript
import { useOfflineQuery } from '@/hooks/useOfflineQuery';
import { dashboardApi } from '@/api/dashboard';

function DashboardScreen() {
  const { data, isLoading, error, isCached, isOnline, refetch } = useOfflineQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardOverview,
    cacheKey: 'dashboard_stats',
    useOfflineCache: true,
    syncOnReconnect: true,
  });

  return (
    <View>
      {isCached && (
        <Banner>Using cached data (offline)</Banner>
      )}

      {data && (
        <DashboardStats stats={data.stats} />
      )}

      <Button onPress={() => refetch()}>
        Refresh
      </Button>
    </View>
  );
}
```

**Features:**
- Automatically caches successful responses
- Uses cache when offline
- Automatically refetches when back online
- Falls back to cache on network errors

### 2. useOfflineMutation

Enhanced `useMutation` with offline queue support and optimistic updates.

```typescript
import { useOfflineMutation } from '@/hooks/useOfflineQuery';
import { useQueryClient } from '@tanstack/react-query';
import { medicalProfileApi } from '@/api/medicalProfile';

function EditProfileScreen() {
  const queryClient = useQueryClient();

  const updateMutation = useOfflineMutation({
    mutationFn: medicalProfileApi.update,

    buildRequest: (variables) => ({
      method: 'PATCH',
      url: `/api/medical-profile/${variables.id}`,
      data: variables,
      priority: 'high',
    }),

    onOptimisticUpdate: (variables) => {
      // Update UI immediately
      queryClient.setQueryData(['medicalProfile'], (old) => ({
        ...old,
        ...variables,
      }));
    },

    onRollback: () => {
      // Rollback on error
      queryClient.invalidateQueries(['medicalProfile']);
    },

    onSuccess: (data) => {
      console.log('Profile updated:', data);
    },

    onError: (error) => {
      console.error('Update failed:', error);
    },

    queueWhenOffline: true,
  });

  const handleSave = (formData) => {
    updateMutation.mutate(formData);
  };

  return (
    <View>
      <Form onSubmit={handleSave} />

      {updateMutation.isQueued && (
        <Banner>Changes will sync when online</Banner>
      )}

      {updateMutation.isPending && (
        <LoadingSpinner />
      )}
    </View>
  );
}
```

**Features:**
- Applies optimistic updates immediately
- Queues request when offline
- Automatically syncs when back online
- Rollback on errors
- Shows queued status

### 3. useOptimisticUpdate

Lower-level hook for manual optimistic updates.

```typescript
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

function MyComponent() {
  const { mutate, isPending, isSuccess, isError, error } = useOptimisticUpdate();

  const handleUpdate = async () => {
    await mutate({
      mutationFn: async () => {
        return await api.updateData({ foo: 'bar' });
      },

      onOptimisticUpdate: (data) => {
        // Update UI immediately
        setLocalData(data);
      },

      onRollback: () => {
        // Rollback UI changes
        setLocalData(originalData);
      },

      onSuccess: (result) => {
        console.log('Success:', result);
      },

      onError: (error) => {
        console.error('Error:', error);
      },

      request: {
        method: 'PATCH',
        url: '/api/data',
        data: { foo: 'bar' },
        priority: 'medium',
        maxRetries: 3,
      },
    });
  };

  return (
    <View>
      <Button onPress={handleUpdate} loading={isPending}>
        Update
      </Button>

      {isSuccess && <Text>Updated!</Text>}
      {isError && <Text>Error: {error?.message}</Text>}
    </View>
  );
}
```

### 4. useOfflineSync

Hook for manual synchronization of all data.

```typescript
import { useOfflineSync } from '@/hooks/useOfflineQuery';

function SyncButton() {
  const { syncAll, isOnline, isSyncing, pendingSync } = useOfflineSync();

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    try {
      const result = await syncAll();
      Alert.alert(
        'Sync Complete',
        `Success: ${result.success}, Failed: ${result.failed}`
      );
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    }
  };

  return (
    <Button
      onPress={handleSync}
      disabled={!isOnline || isSyncing}
      loading={isSyncing}
    >
      {isSyncing
        ? `Syncing ${pendingSync} items...`
        : `Sync ${pendingSync} pending changes`}
    </Button>
  );
}
```

## Components

### OfflineIndicator

Banner displayed at top when device is offline.

```typescript
import { OfflineIndicator } from '@/components/OfflineIndicator';

function App() {
  return (
    <View>
      <Navigation />
      <OfflineIndicator />
    </View>
  );
}
```

**Features:**
- Automatically shows/hides based on connectivity
- Shows offline status
- Shows pending sync count
- Shows last sync timestamp
- Animates in/out smoothly

## Usage Examples

### Example 1: Dashboard with Cache

```typescript
import { useOfflineQuery } from '@/hooks/useOfflineQuery';
import { dashboardApi } from '@/api/dashboard';
import { OfflineIndicator } from '@/components/OfflineIndicator';

function HomeScreen() {
  const { data, isLoading, isCached, refetch } = useOfflineQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardOverview,
    cacheKey: 'dashboard_stats',
  });

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
        />
      }
    >
      <OfflineIndicator />

      {isCached && (
        <Banner type="info">
          Showing cached data from earlier
        </Banner>
      )}

      {data && (
        <>
          <StatCard value={data.stats.profileCompleteness} />
          <StatCard value={data.stats.upcomingReminders} />
        </>
      )}
    </ScrollView>
  );
}
```

### Example 2: Edit Form with Optimistic Updates

```typescript
import { useOfflineMutation } from '@/hooks/useOfflineQuery';
import { useQueryClient } from '@tanstack/react-query';

function EditMedicalProfileScreen() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ bloodType: 'O+' });

  const updateMutation = useOfflineMutation({
    mutationFn: (data) => api.updateMedicalProfile(data),

    buildRequest: (variables) => ({
      method: 'PATCH',
      url: '/api/medical-profile',
      data: variables,
      priority: 'high',
    }),

    onOptimisticUpdate: (variables) => {
      // Update cache immediately
      queryClient.setQueryData(['medicalProfile'], (old) => ({
        ...old,
        ...variables,
      }));
    },

    onRollback: () => {
      // Refetch on error
      queryClient.invalidateQueries(['medicalProfile']);
    },

    onSuccess: () => {
      navigation.goBack();
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  return (
    <View>
      <OfflineIndicator />

      <Form data={formData} onChange={setFormData} />

      {updateMutation.isQueued && (
        <Banner type="warning">
          Changes will sync when you're back online
        </Banner>
      )}

      <Button
        onPress={handleSubmit}
        loading={updateMutation.isPending}
      >
        Save Changes
      </Button>
    </View>
  );
}
```

### Example 3: Emergency Profile Offline Access

```typescript
import { useOfflineQuery } from '@/hooks/useOfflineQuery';

function EmergencyProfileScreen({ route }) {
  const { profileId } = route.params;

  const { data, isLoading, isCached, isOnline } = useOfflineQuery({
    queryKey: ['emergencyProfile', profileId],
    queryFn: () => api.getEmergencyProfile(profileId),
    cacheKey: 'emergency_profile',
    useOfflineCache: true,
  });

  return (
    <View>
      <OfflineIndicator />

      {!isOnline && (
        <Banner type="warning">
          Emergency profile available offline
        </Banner>
      )}

      {data && (
        <>
          <Text>Name: {data.name}</Text>
          <Text>Blood Type: {data.bloodType}</Text>
          <Text>Allergies: {data.allergies.join(', ')}</Text>
          <Text>Conditions: {data.conditions.join(', ')}</Text>
          <EmergencyContacts contacts={data.emergencyContacts} />
        </>
      )}
    </View>
  );
}
```

### Example 4: Pull-to-Refresh with Sync

```typescript
import { useOfflineSync } from '@/hooks/useOfflineQuery';

function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { syncAll, pendingSync } = useOfflineSync();

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Sync all pending requests and refetch all queries
      await syncAll();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <OfflineIndicator />

      {pendingSync > 0 && (
        <Banner>
          {pendingSync} changes will sync when you pull to refresh
        </Banner>
      )}

      <DashboardContent />
    </ScrollView>
  );
}
```

## Testing

### Test with Airplane Mode

1. Enable airplane mode on your device
2. Navigate through the app
3. Make changes (edit profile, add contacts, etc.)
4. Check that changes appear immediately (optimistic updates)
5. Check that "Offline" banner appears
6. Disable airplane mode
7. Watch automatic sync occur
8. Verify all changes persisted

### Test Cache Expiration

```typescript
// Force cache expiration for testing
await cacheService.saveToCache('test', data, 5000); // 5 seconds TTL

// Wait 6 seconds
await new Promise(resolve => setTimeout(resolve, 6000));

// Should return null (expired)
const cached = await cacheService.getFromCache('test');
```

### Test Queue Persistence

```typescript
// Add items to queue
await offlineStore.addToQueue({ method: 'POST', url: '/test', data: {} });

// Restart app (queue should persist)

// Check queue
const queue = await offlineService.getQueue();
console.log('Queue size:', queue.length);
```

## Best Practices

1. **Always use cache keys** for important data that should be available offline
2. **Set appropriate TTL values** - shorter for frequently changing data
3. **Use high priority** for critical requests (emergency contacts, medical data)
4. **Implement optimistic updates** for better UX
5. **Show offline indicators** so users know they're offline
6. **Test thoroughly** with airplane mode
7. **Handle conflicts** when data changes both locally and on server
8. **Clean up cache** periodically to free storage

## Troubleshooting

### Cache not working
- Check cache key is defined in `CacheKey` type
- Verify TTL hasn't expired
- Check AsyncStorage permissions

### Queue not syncing
- Verify device is online
- Check `isOnline` state
- Look for sync errors in logs
- Check request format is correct

### Optimistic updates not reverting
- Ensure `onRollback` is implemented
- Check query invalidation is working
- Verify error handling is correct

## Architecture

```
┌─────────────────────────────────────────┐
│            React Components             │
│  (UI with optimistic updates)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Custom Hooks Layer              │
│  useOfflineQuery, useOfflineMutation    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         State Management Layer          │
│  Zustand (offlineStore)                 │
│  React Query (queryClient)              │
└──────┬───────────────────────┬──────────┘
       │                       │
┌──────▼──────────┐    ┌──────▼──────────┐
│  Offline        │    │  Cache          │
│  Service        │    │  Service        │
│  (Queue mgmt)   │    │  (TTL cache)    │
└──────┬──────────┘    └──────┬──────────┘
       │                       │
┌──────▼───────────────────────▼──────────┐
│         AsyncStorage Layer              │
│  (Persistent storage)                   │
└─────────────────────────────────────────┘
```

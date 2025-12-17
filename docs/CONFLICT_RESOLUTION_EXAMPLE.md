# Conflict Resolution Examples

## Basic Usage

### Example 1: Manual Conflict Resolution

```typescript
import { useConflictResolver } from '@/hooks/useConflictResolver';
import { ConflictResolver } from '@/components/ConflictResolver';
import { useOfflineMutation } from '@/hooks/useOfflineQuery';

function EditProfileScreen() {
  const { showConflicts, isResolving, conflicts, hideConflicts, handleResolve } =
    useConflictResolver();
  const [formData, setFormData] = useState({ name: 'John', email: 'john@example.com' });

  const updateMutation = useOfflineMutation({
    mutationFn: async (data) => {
      // Fetch current server data
      const serverData = await api.getProfile();

      // Check for conflicts
      try {
        const resolved = await showConflicts(data, serverData);

        // Update with resolved data
        return await api.updateProfile(resolved);
      } catch (error) {
        if (error.message === 'Conflict resolution cancelled') {
          throw new Error('Update cancelled');
        }
        throw error;
      }
    },

    buildRequest: (data) => ({
      method: 'PATCH',
      url: '/api/profile',
      data,
      priority: 'high',
    }),

    onSuccess: () => {
      Alert.alert('Success', 'Profile updated');
    },
  });

  return (
    <View>
      <Form data={formData} onChange={setFormData} />

      <Button onPress={() => updateMutation.mutate(formData)}>
        Save
      </Button>

      <ConflictResolver
        visible={isResolving}
        conflicts={conflicts}
        onResolve={handleResolve}
        onCancel={hideConflicts}
        entityName="Profile"
      />
    </View>
  );
}
```

### Example 2: Automatic Conflict Resolution

```typescript
import { useAutoConflictResolver } from '@/hooks/useConflictResolver';

function EditMedicalProfileScreen() {
  const { resolve } = useAutoConflictResolver('newestWins');

  const updateMutation = useOfflineMutation({
    mutationFn: async (data) => {
      const serverData = await api.getMedicalProfile();

      // Automatically resolve conflicts (newest wins)
      const merged = resolve(data, serverData);

      return await api.updateMedicalProfile(merged);
    },

    buildRequest: (data) => ({
      method: 'PATCH',
      url: '/api/medical-profile',
      data,
      priority: 'high',
    }),
  });

  return (
    <View>
      <Form onSubmit={(data) => updateMutation.mutate(data)} />
    </View>
  );
}
```

### Example 3: Conflict Resolution with Offline Queue Sync

```typescript
import { useOfflineStore } from '@/store/offlineStore';
import { useConflictResolver } from '@/hooks/useConflictResolver';
import { ConflictResolver } from '@/components/ConflictResolver';

function SyncScreen() {
  const { syncQueue, queuedRequests, isOnline } = useOfflineStore();
  const { showConflicts, isResolving, conflicts, hideConflicts, handleResolve } =
    useConflictResolver();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    setSyncing(true);

    try {
      // Custom executor with conflict resolution
      const result = await syncQueue(async (request) => {
        // Execute request
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.data),
        });

        if (!response.ok) {
          // Check for conflict (409 status)
          if (response.status === 409) {
            const serverData = await response.json();

            // Show conflict resolver
            const resolved = await showConflicts(
              request.data,
              serverData.data,
              'id'
            );

            // Retry with resolved data
            const retryResponse = await fetch(request.url, {
              method: request.method,
              headers: request.headers,
              body: JSON.stringify(resolved),
            });

            return retryResponse.json();
          }

          throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
      });

      Alert.alert(
        'Sync Complete',
        `Success: ${result.success}, Failed: ${result.failed}, Skipped: ${result.skipped}`
      );
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View>
      <Text>Pending Sync: {queuedRequests.length} items</Text>

      <Button
        onPress={handleSync}
        loading={syncing}
        disabled={!isOnline}
      >
        Sync Now
      </Button>

      <ConflictResolver
        visible={isResolving}
        conflicts={conflicts}
        onResolve={handleResolve}
        onCancel={hideConflicts}
      />
    </View>
  );
}
```

### Example 4: Emergency Contacts with Conflict Resolution

```typescript
import { useConflictResolver } from '@/hooks/useConflictResolver';
import { ConflictResolver } from '@/components/ConflictResolver';

function EmergencyContactsScreen() {
  const { showConflicts, isResolving, conflicts, hideConflicts, handleResolve } =
    useConflictResolver();
  const [contacts, setContacts] = useState([]);

  const saveMutation = useOfflineMutation({
    mutationFn: async (newContacts) => {
      // Get current server data
      const serverContacts = await api.getEmergencyContacts();

      // Create comparison objects
      const localData = {
        id: 'contacts',
        contacts: newContacts,
        updatedAt: new Date().toISOString(),
      };

      const serverData = {
        id: 'contacts',
        contacts: serverContacts,
        updatedAt: serverContacts.updatedAt,
      };

      // Resolve conflicts
      const resolved = await showConflicts(localData, serverData);

      // Update with resolved contacts
      return await api.updateEmergencyContacts(resolved.contacts);
    },

    buildRequest: (newContacts) => ({
      method: 'PUT',
      url: '/api/emergency-contacts',
      data: { contacts: newContacts },
      priority: 'high',
    }),

    onOptimisticUpdate: (newContacts) => {
      setContacts(newContacts);
    },

    onRollback: () => {
      // Refetch contacts
      queryClient.invalidateQueries(['emergencyContacts']);
    },
  });

  return (
    <View>
      <ContactList contacts={contacts} onChange={setContacts} />

      <Button onPress={() => saveMutation.mutate(contacts)}>
        Save Contacts
      </Button>

      <ConflictResolver
        visible={isResolving}
        conflicts={conflicts}
        onResolve={handleResolve}
        onCancel={hideConflicts}
        entityName="Emergency Contacts"
      />
    </View>
  );
}
```

## Conflict Resolution Strategies

### 1. Server Wins (Default)

Always use server data. Good for reference data.

```typescript
const { resolve } = useAutoConflictResolver('serverWins');
const merged = resolve(localData, serverData);
// Returns: serverData
```

### 2. Local Wins

Always use local data. Good when local changes should take priority.

```typescript
const { resolve } = useAutoConflictResolver('localWins');
const merged = resolve(localData, serverData);
// Returns: localData
```

### 3. Newest Wins

Use data with the most recent `updatedAt` timestamp.

```typescript
const { resolve } = useAutoConflictResolver('newestWins');
const merged = resolve(
  { ...localData, updatedAt: '2024-01-15T10:00:00Z' },
  { ...serverData, updatedAt: '2024-01-15T09:00:00Z' }
);
// Returns: localData (newer)
```

### 4. Field-by-Field

Merge field by field based on overall timestamp.

```typescript
const { resolve } = useAutoConflictResolver('fieldByField');

const localData = {
  name: 'John Smith',
  email: 'john@example.com',
  updatedAt: '2024-01-15T10:00:00Z',
};

const serverData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  updatedAt: '2024-01-15T09:00:00Z',
};

const merged = resolve(localData, serverData);
// Returns: localData (all local fields because local is newer)
```

### 5. Deep Merge

Intelligently merge arrays and objects.

```typescript
const { resolve } = useAutoConflictResolver('deepMerge');

const localData = {
  name: 'John',
  allergies: ['Peanuts', 'Shellfish'],
  medications: { aspirin: '100mg' },
};

const serverData = {
  name: 'John Smith',
  allergies: ['Penicillin'],
  medications: { insulin: '10 units' },
};

const merged = resolve(localData, serverData);
// Returns: {
//   name: 'John Smith',
//   allergies: ['Penicillin', 'Peanuts', 'Shellfish'],
//   medications: { insulin: '10 units', aspirin: '100mg' },
// }
```

## Advanced Examples

### Example 5: Conditional Conflict Resolution

```typescript
function SmartEditScreen() {
  const { showConflicts, isResolving, conflicts, hideConflicts, handleResolve } =
    useConflictResolver();
  const { resolve: autoResolve } = useAutoConflictResolver('fieldByField');

  const saveMutation = useOfflineMutation({
    mutationFn: async (data) => {
      const serverData = await api.getData();

      // Detect conflicts
      const conflicts = await offlineService.detectConflicts(
        data,
        serverData,
        'id'
      );

      // If few conflicts, auto-resolve
      if (conflicts.length <= 2) {
        const merged = autoResolve(data, serverData);
        return await api.updateData(merged);
      }

      // If many conflicts, show UI
      const resolved = await showConflicts(data, serverData);
      return await api.updateData(resolved);
    },

    buildRequest: (data) => ({
      method: 'PATCH',
      url: '/api/data',
      data,
    }),
  });

  return (
    <View>
      <Form onSubmit={(data) => saveMutation.mutate(data)} />

      <ConflictResolver
        visible={isResolving}
        conflicts={conflicts}
        onResolve={handleResolve}
        onCancel={hideConflicts}
      />
    </View>
  );
}
```

### Example 6: Batch Sync with Conflict Resolution

```typescript
function BatchSyncScreen() {
  const { syncQueue, queuedRequests } = useOfflineStore();
  const [conflictQueue, setConflictQueue] = useState([]);
  const [currentConflict, setCurrentConflict] = useState(null);

  const handleBatchSync = async () => {
    const conflicts = [];

    // Sync with conflict detection
    await syncQueue(async (request) => {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.data),
        });

        if (response.status === 409) {
          // Conflict detected - queue for resolution
          const serverData = await response.json();
          conflicts.push({
            request,
            localData: request.data,
            serverData: serverData.data,
          });

          // Skip this request for now
          throw new Error('CONFLICT_DETECTED');
        }

        return response.json();
      } catch (error) {
        if (error.message === 'CONFLICT_DETECTED') {
          // Don't retry conflicts
          throw error;
        }
        throw error;
      }
    });

    // Process conflicts one by one
    if (conflicts.length > 0) {
      setConflictQueue(conflicts);
      setCurrentConflict(conflicts[0]);
    }
  };

  const handleConflictResolved = async (resolved) => {
    if (!currentConflict) return;

    // Update with resolved data
    await fetch(currentConflict.request.url, {
      method: currentConflict.request.method,
      headers: currentConflict.request.headers,
      body: JSON.stringify(resolved),
    });

    // Move to next conflict
    const remaining = conflictQueue.slice(1);
    setConflictQueue(remaining);
    setCurrentConflict(remaining[0] || null);
  };

  return (
    <View>
      <Button onPress={handleBatchSync}>
        Sync All ({queuedRequests.length})
      </Button>

      {currentConflict && (
        <ConflictResolver
          visible={true}
          conflicts={[/* detected conflicts */]}
          onResolve={(strategy, selections) => {
            const merged = /* merge based on strategy and selections */;
            handleConflictResolved(merged);
          }}
          onCancel={() => {
            setConflictQueue([]);
            setCurrentConflict(null);
          }}
        />
      )}

      {conflictQueue.length > 0 && (
        <Text>
          Resolving conflicts: {conflictQueue.length} remaining
        </Text>
      )}
    </View>
  );
}
```

### Example 7: Custom Merge Logic

```typescript
import { offlineService } from '@/services/offlineService';

function CustomMergeScreen() {
  const saveMutation = useOfflineMutation({
    mutationFn: async (data) => {
      const serverData = await api.getData();

      // Custom merge logic
      const merged = customMerge(data, serverData);

      return await api.updateData(merged);
    },

    buildRequest: (data) => ({
      method: 'PATCH',
      url: '/api/data',
      data,
    }),
  });

  const customMerge = (local, server) => {
    const merged = { ...server };

    // Critical fields - always use local
    const criticalFields = ['bloodType', 'allergies', 'emergencyContacts'];
    criticalFields.forEach((field) => {
      if (local[field] !== undefined) {
        merged[field] = local[field];
      }
    });

    // Non-critical fields - use newest
    const localTime = new Date(local.updatedAt).getTime();
    const serverTime = new Date(server.updatedAt).getTime();

    if (localTime > serverTime) {
      // Merge non-critical fields from local
      Object.keys(local).forEach((key) => {
        if (!criticalFields.includes(key) && key !== 'id') {
          merged[key] = local[key];
        }
      });
    }

    return merged;
  };

  return (
    <Form onSubmit={(data) => saveMutation.mutate(data)} />
  );
}
```

## Testing Conflicts

### Simulate a Conflict

```typescript
// In your test or development environment
async function simulateConflict() {
  // 1. Make local changes
  const localData = {
    id: '123',
    name: 'John Smith',
    email: 'john@example.com',
    updatedAt: new Date().toISOString(),
  };

  // 2. Simulate server changes (different data, same entity)
  const serverData = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    updatedAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
  };

  // 3. Detect conflicts
  const conflicts = await offlineService.detectConflicts(
    localData,
    serverData,
    'id'
  );

  console.log('Conflicts detected:', conflicts);
  // [
  //   { field: 'name', local: 'John Smith', server: 'John Doe' },
  //   { field: 'email', local: 'john@example.com', server: 'john.doe@example.com' }
  // ]

  // 4. Test auto-resolution
  const merged = offlineService.mergeData(localData, serverData, 'merge');
  console.log('Merged:', merged);
}
```

## Best Practices

1. **Choose the right strategy:**
   - Critical medical data: Use manual resolution or `localWins`
   - Reference data: Use `serverWins`
   - User preferences: Use `newestWins`
   - Lists/arrays: Use `deepMerge`

2. **Show conflict count:**
   ```typescript
   if (conflicts.length > 5) {
     Alert.alert(
       'Many Conflicts',
       `${conflicts.length} fields have conflicts. Review carefully.`
     );
   }
   ```

3. **Batch similar conflicts:**
   Group conflicts by entity type and resolve them together

4. **Provide context:**
   Show timestamps, user names, or other context to help users decide

5. **Allow preview:**
   Let users preview the merged result before confirming

6. **Log resolutions:**
   Track which strategy was used for analytics and debugging

7. **Test thoroughly:**
   Simulate conflicts in your test suite with various scenarios

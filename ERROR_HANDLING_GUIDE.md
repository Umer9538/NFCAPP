# Error Handling & Loading States Guide

This guide covers all error handling and loading state patterns used in the MedGuard app.

## Table of Contents

1. [Error Boundary](#error-boundary)
2. [API Error Handling](#api-error-handling)
3. [Loading States](#loading-states)
4. [Offline Handling](#offline-handling)
5. [Custom Hooks](#custom-hooks)
6. [Best Practices](#best-practices)

---

## Error Boundary

Catches React component errors and displays a friendly error screen.

### Usage

Wrap your app or specific sections:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Custom Fallback

```tsx
<ErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <CustomErrorScreen error={error} onRetry={reset} />
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### Features

- Catches unhandled React errors
- Shows dev error details in `__DEV__` mode
- Restart app button
- Try again button
- Auto-reports to error service (configurable)

---

## API Error Handling

### API Client Features

The API client (`src/api/client.ts`) automatically handles:

- **Network errors**: Detects no internet connection
- **Timeout errors**: 30-second default timeout
- **401 Unauthorized**: Auto token refresh
- **Rate limiting**: User-friendly 429 messages
- **Server errors**: Generic 5xx handling
- **Validation errors**: 400/422 with field details

### Error Messages

```typescript
// Network error
{
  message: "Network error. Please check your internet connection.",
  code: "NETWORK_ERROR"
}

// Timeout
{
  message: "Request timeout. The server is taking too long to respond.",
  code: "TIMEOUT"
}

// 401 Unauthorized
{
  message: "Your session has expired. Please log in again.",
  status: 401,
  code: "HTTP_401"
}

// 500 Server Error
{
  message: "Server error. Our team has been notified. Please try again later.",
  status: 500,
  code: "HTTP_500"
}
```

---

## Loading States

### 1. LoadingOverlay

Full-screen loading with backdrop for critical operations.

```tsx
import { LoadingOverlay } from '@/components/shared';

function MyScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <YourContent />
      <LoadingOverlay visible={loading} message="Saving..." />
    </>
  );
}
```

### 2. LoadingSpinner

Inline spinner for sections.

```tsx
import { LoadingSpinner } from '@/components/ui';

function MyComponent() {
  if (isLoading) {
    return <LoadingSpinner visible />;
  }

  return <Content />;
}
```

### 3. Skeleton Loading

Animated placeholder matching content layout.

```tsx
import {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonText,
  SkeletonImage,
  SkeletonStatsCard,
  SkeletonProfile,
} from '@/components/ui';

function MyScreen() {
  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  return <DataList data={data} />;
}
```

#### Available Skeleton Components

- `Skeleton` - Basic skeleton with custom dimensions
- `SkeletonCard` - Card with avatar, title, description
- `SkeletonList` - Multiple skeleton cards
- `SkeletonText` - Multiple text lines
- `SkeletonImage` - Image placeholder
- `SkeletonStatsCard` - Dashboard stat card
- `SkeletonProfile` - Profile header

---

## Offline Handling

### 1. useOffline Hook

Monitor network connectivity.

```tsx
import { useOffline } from '@/hooks/useOffline';

function MyComponent() {
  const { isOffline, isConnected, type, isInternetReachable } = useOffline();

  if (isOffline) {
    return <OfflineMessage />;
  }

  return <OnlineContent />;
}
```

### 2. OfflineBanner

Auto-displays when offline.

```tsx
import { OfflineBanner } from '@/components/shared';

function App() {
  return (
    <>
      <OfflineBanner />
      <YourApp />
    </>
  );
}
```

Features:
- Slides down when offline
- Slides up when back online
- Positioned at top of screen
- Non-blocking (pointer-events: none)

### 3. Wait for Network

```tsx
import { useWaitForNetwork } from '@/hooks/useOffline';

function MyComponent() {
  const { waitForNetwork, isWaiting } = useWaitForNetwork();

  const handleAction = async () => {
    await waitForNetwork(); // Waits until connected
    // Proceed with action
  };
}
```

---

## Custom Hooks

### useApiQuery

Enhanced React Query wrapper with automatic error handling.

```tsx
import { useApiQuery } from '@/hooks/useApiQuery';

function MyComponent() {
  const { data, isLoading, error, refetch } = useApiQuery(
    ['users', userId],
    () => fetchUser(userId),
    {
      showErrorToast: true, // Default: true
      errorMessage: 'Failed to load user',
      retries: 2, // Default: 2
      retryDelay: 1000, // Default: 1000ms
    }
  );

  if (isLoading) return <SkeletonProfile />;
  if (error) return <ErrorState onRetry={refetch} />;

  return <UserProfile data={data} />;
}
```

### useApiMutation

Enhanced mutation with optimistic updates.

```tsx
import { useApiMutation } from '@/hooks/useApiMutation';

function MyComponent() {
  const updateMutation = useApiMutation(
    (data) => updateUser(userId, data),
    {
      showSuccessToast: true,
      successMessage: 'Profile updated!',
      showErrorToast: true,
      invalidateQueries: [['users', userId]], // Refetch after success
      optimistic: {
        queryKey: ['users', userId],
        updateFn: (oldData, newData) => ({ ...oldData, ...newData }),
      },
    }
  );

  const handleSave = () => {
    updateMutation.mutate({ name: 'John' });
  };

  return (
    <Button
      onPress={handleSave}
      loading={updateMutation.isPending}
      disabled={updateMutation.isPending}
    />
  );
}
```

### Specialized Mutation Hooks

```tsx
import {
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
} from '@/hooks/useApiMutation';

// Create with auto success message
const createMutation = useCreateMutation(createUser);

// Update with auto success message
const updateMutation = useUpdateMutation(updateUser);

// Delete with auto success message
const deleteMutation = useDeleteMutation(deleteUser);
```

---

## Best Practices

### 1. Always Show Loading States

```tsx
// ❌ Bad - No loading indicator
function MyScreen() {
  const { data } = useQuery(['data'], fetchData);
  return <DataList data={data} />;
}

// ✅ Good - Skeleton loading
function MyScreen() {
  const { data, isLoading } = useQuery(['data'], fetchData);

  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  return <DataList data={data} />;
}
```

### 2. Handle Errors Gracefully

```tsx
// ❌ Bad - Error breaks UI
function MyScreen() {
  const { data } = useQuery(['data'], fetchData);
  return <DataList data={data} />;
}

// ✅ Good - Show error state
function MyScreen() {
  const { data, isLoading, error, refetch } = useApiQuery(
    ['data'],
    fetchData
  );

  if (isLoading) return <SkeletonList />;
  if (error) return <ErrorState onRetry={refetch} />;

  return <DataList data={data} />;
}
```

### 3. Use Optimistic Updates for Better UX

```tsx
// ❌ Bad - Wait for server response
const likeMutation = useMutation(likePost);

// ✅ Good - Instant feedback
const likeMutation = useApiMutation(likePost, {
  optimistic: {
    queryKey: ['post', postId],
    updateFn: (oldData) => ({
      ...oldData,
      liked: true,
      likes: oldData.likes + 1,
    }),
  },
});
```

### 4. Provide Empty States

```tsx
// ❌ Bad - Blank screen when no data
function MyList() {
  const { data } = useQuery(['items'], fetchItems);
  return <FlatList data={data} />;
}

// ✅ Good - Helpful empty state
function MyList() {
  const { data, isLoading } = useQuery(['items'], fetchItems);

  if (isLoading) return <SkeletonList />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="folder-open-outline"
        title="No items yet"
        description="Add your first item to get started"
        actionLabel="Add Item"
        onActionPress={handleAdd}
      />
    );
  }

  return <FlatList data={data} />;
}
```

### 5. Disable Buttons During Loading

```tsx
// ❌ Bad - Can tap multiple times
<Button onPress={handleSave} />

// ✅ Good - Prevents duplicate requests
<Button
  onPress={handleSave}
  loading={mutation.isPending}
  disabled={mutation.isPending}
/>
```

### 6. Handle Offline State

```tsx
function MyScreen() {
  const { isOffline } = useOffline();
  const { data, isLoading } = useQuery(['data'], fetchData, {
    enabled: !isOffline, // Don't fetch when offline
  });

  if (isOffline) {
    return (
      <ErrorState
        icon="cloud-offline"
        title="You're offline"
        message="Connect to the internet to access this feature"
      />
    );
  }

  return <Content />;
}
```

### 7. Use Error Boundaries

```tsx
// Wrap entire app
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Navigation />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Or wrap specific features
function DashboardScreen() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

---

## Error Utils

### Get Error Message

```tsx
import { getErrorMessage } from '@/utils/errors';

try {
  await someAction();
} catch (error) {
  const message = getErrorMessage(error);
  showError(message);
}
```

### Check Error Type

```tsx
import {
  isNetworkError,
  isAuthError,
  isValidationError,
  isServerError,
} from '@/utils/errors';

if (isNetworkError(error)) {
  // Handle network error
}

if (isAuthError(error)) {
  // Redirect to login
}

if (isValidationError(error)) {
  // Show validation errors
}
```

### Format Error for Display

```tsx
import { formatErrorForDisplay } from '@/utils/errors';

const { title, message, action } = formatErrorForDisplay(error);

Alert.alert(title, message, [
  { text: action, onPress: handleAction }
]);
```

### Retry with Backoff

```tsx
import { retryWithBackoff } from '@/utils/errors';

const data = await retryWithBackoff(
  () => fetchData(),
  3, // max retries
  1000 // initial delay
);
```

---

## Testing

### Test Error Boundaries

```tsx
// Trigger error boundary
throw new Error('Test error boundary');
```

### Test Network Errors

```tsx
// Disconnect network in simulator
// iOS: Simulator > Debug > Toggle Network Link Conditioner
// Android: Settings > Network & Internet > Airplane mode
```

### Test Loading States

```tsx
// Add delay to API calls
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## Summary

✅ **Always** show loading states (use Skeletons)
✅ **Always** handle errors gracefully (use ErrorState)
✅ **Always** provide empty states (use EmptyState)
✅ **Always** disable buttons during loading
✅ **Always** wrap app in ErrorBoundary
✅ **Consider** optimistic updates for better UX
✅ **Consider** offline state handling
✅ **Test** all error and loading scenarios

The app now has comprehensive error handling and loading states throughout!

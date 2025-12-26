# Performance Optimization Guide

Complete guide for optimizing the MedGuard React Native app for maximum performance.

## Table of Contents

1. [Image Optimization](#image-optimization)
2. [List Optimization](#list-optimization)
3. [React Optimization](#react-optimization)
4. [Bundle Size Optimization](#bundle-size-optimization)
5. [API Optimization](#api-optimization)
6. [State Management](#state-management)
7. [Navigation](#navigation)
8. [Startup Time](#startup-time)
9. [Memory Management](#memory-management)
10. [Monitoring](#monitoring)

---

## Image Optimization

### Use OptimizedImage Component

Replace standard `<Image>` with `<OptimizedImage>` for automatic optimization:

```tsx
import { OptimizedImage, AvatarImage, ThumbnailImage } from '@/components/ui';

// ❌ Bad - No caching, no loading state
<Image source={{ uri: imageUrl }} style={styles.image} />

// ✅ Good - Automatic caching, loading state, error handling
<OptimizedImage
  source={imageUrl}
  width={300}
  height={200}
  borderRadius={12}
  resizeMode="cover"
/>

// Avatar with circular shape
<AvatarImage source={avatarUrl} size={48} />

// Thumbnail with lazy loading
<ThumbnailImage
  source={thumbnailUrl}
  fullSource={fullImageUrl}
  width={100}
  height={100}
/>
```

### Features

- **Automatic caching**: Memory + disk caching via expo-image
- **Loading states**: Skeleton placeholder while loading
- **Error handling**: Graceful fallback on error
- **Blurhash placeholder**: Smooth loading experience
- **Optimized formats**: Supports WebP, AVIF, etc.

### Best Practices

```tsx
// ✅ Specify dimensions for better performance
<OptimizedImage source={url} width={200} height={150} />

// ✅ Use aspectRatio instead of both dimensions
<OptimizedImage source={url} width="100%" aspectRatio={16/9} />

// ✅ Use appropriate resize mode
<OptimizedImage source={url} resizeMode="cover" />

// ❌ Don't load huge images
// Resize on server or use CDN
```

---

## List Optimization

### Use OptimizedList Component

Replace `<FlatList>` with `<OptimizedList>`:

```tsx
import { OptimizedList, PerformantList } from '@/components/ui';

// ❌ Bad - No optimizations
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
/>

// ✅ Good - All optimizations included
<OptimizedList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  itemHeight={80} // If known, massive performance boost
/>

// ✅ Better - With all features
<PerformantList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  itemHeight={80}
  showSeparator
  emptyMessage="No items found"
  isLoadingMore={isLoadingMore}
/>
```

### Optimization Features

Automatically includes:
- ✅ `removeClippedSubviews={true}` - Remove off-screen views
- ✅ `maxToRenderPerBatch={10}` - Render in small batches
- ✅ `windowSize={10}` - Render minimal window
- ✅ `initialNumToRender={10}` - Fast initial render
- ✅ `getItemLayout` - If itemHeight provided
- ✅ Optimized key extraction
- ✅ Memoized components

### Memo List Items

```tsx
// ❌ Bad - Re-renders on every list update
const ItemCard = ({ item }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
);

// ✅ Good - Memoized, only re-renders when item changes
const ItemCard = memo(({ item }) => (
  <View>
    <Text>{item.name}</Text>
  </View>
), (prev, next) => prev.item.id === next.item.id);

// ✅ Alternative - Use MemoizedItem wrapper
import { MemoizedItem } from '@/components/ui';

<OptimizedList
  data={items}
  renderItem={({ item, index }) => (
    <MemoizedItem
      item={item}
      index={index}
      renderItem={(item) => <ItemCard item={item} />}
    />
  )}
/>
```

### Best Practices

```tsx
// ✅ Always provide keyExtractor
keyExtractor={(item) => item.id}

// ✅ Provide itemHeight if all items same height
itemHeight={80}

// ✅ Use getItemLayout for variable heights
getItemLayout={(data, index) => ({
  length: itemHeights[index],
  offset: itemHeights.slice(0, index).reduce((a, b) => a + b, 0),
  index,
})}

// ✅ Avoid inline functions
// Bad
renderItem={({ item }) => <ItemCard onPress={() => handlePress(item)} />}

// Good
const handlePress = useCallback((item) => { ... }, []);
renderItem={({ item }) => <ItemCard onPress={handlePress} item={item} />}

// ✅ Use pagination
onEndReached={loadMore}
onEndReachedThreshold={0.5}
```

---

## React Optimization

### Use React.memo

Memoize expensive components:

```tsx
import { memo } from 'react';

// ❌ Bad - Re-renders when parent re-renders
export function ExpensiveComponent({ data }) {
  return <ComplexVisualization data={data} />;
}

// ✅ Good - Only re-renders when data changes
export const ExpensiveComponent = memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// ✅ Better - Custom comparison
export const ExpensiveComponent = memo(
  ({ data }) => <ComplexVisualization data={data} />,
  (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
);
```

### Use useMemo for Expensive Calculations

```tsx
import { useMemo } from 'react';

// ❌ Bad - Recalculates on every render
function MyComponent({ items }) {
  const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <ItemsList items={sortedItems} total={total} />;
}

// ✅ Good - Only recalculates when items change
function MyComponent({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  return <ItemsList items={sortedItems} total={total} />;
}
```

### Use useCallback for Function Props

```tsx
import { useCallback } from 'react';

// ❌ Bad - New function on every render
function ParentComponent() {
  const handleClick = (id) => {
    console.log('Clicked:', id);
  };

  return <ChildComponent onPress={handleClick} />;
}

// ✅ Good - Same function reference
function ParentComponent() {
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);

  return <ChildComponent onPress={handleClick} />;
}
```

### Use Performance Hooks

```tsx
import {
  useOptimizedCallback,
  useDebouncedValue,
  useRenderTracking,
  useScreenLoadTracking,
} from '@/hooks/usePerformance';

function MyScreen() {
  // Track render performance
  useRenderTracking('MyScreen');

  // Track screen load time
  useScreenLoadTracking('MyScreen');

  // Debounce search input
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  // Optimized callback
  const handlePress = useOptimizedCallback((id) => {
    navigation.navigate('Details', { id });
  }, [navigation]);

  return <View>...</View>;
}
```

### Avoid Inline Objects/Arrays

```tsx
// ❌ Bad - New object/array on every render
<MyComponent style={{ marginTop: 10 }} data={[1, 2, 3]} />

// ✅ Good - Defined outside or memoized
const style = { marginTop: 10 };
const data = [1, 2, 3];
<MyComponent style={style} data={data} />

// Or use StyleSheet
const styles = StyleSheet.create({
  container: { marginTop: 10 },
});
<MyComponent style={styles.container} />
```

---

## Bundle Size Optimization

### Analyze Bundle

```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Check what's in your bundle
npx @rnx-kit/dep-check --vigilant
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove them
npm uninstall unused-package
```

### Code Splitting

```tsx
// ❌ Bad - Import everything upfront
import HugeLibrary from 'huge-library';

// ✅ Good - Lazy import
const HugeLibrary = React.lazy(() => import('huge-library'));

// Or dynamic import
const handleAction = async () => {
  const { processData } = await import('./heavyProcessing');
  processData();
};
```

### Tree Shaking

```tsx
// ❌ Bad - Imports entire library
import _ from 'lodash';

// ✅ Good - Only import what you need
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

// ✅ Better - Use native methods when possible
// Instead of lodash.map
array.map(...)

// Instead of lodash.filter
array.filter(...)
```

---

## API Optimization

### Implement Pagination

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function MyList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 1 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <FlatList
      data={data?.pages.flatMap(page => page.items)}
      onEndReached={() => hasNextPage && fetchNextPage()}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
}
```

### Debounce Search

```tsx
import { useDebouncedValue } from '@/hooks/usePerformance';

function SearchScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchAPI(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  return (
    <Input
      value={search}
      onChangeText={setSearch}
      placeholder="Search..."
    />
  );
}
```

### Parallel Requests

```tsx
// ❌ Bad - Sequential requests
const user = await fetchUser(userId);
const posts = await fetchPosts(userId);
const comments = await fetchComments(userId);

// ✅ Good - Parallel requests
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId),
]);

// With React Query
function MyScreen() {
  const userQuery = useQuery(['user', userId], () => fetchUser(userId));
  const postsQuery = useQuery(['posts', userId], () => fetchPosts(userId));
  const commentsQuery = useQuery(['comments', userId], () => fetchComments(userId));

  // All queries run in parallel
}
```

### Prefetch Data

```tsx
import { useQueryClient } from '@tanstack/react-query';

function MyList() {
  const queryClient = useQueryClient();

  const handleItemPress = (itemId) => {
    // Prefetch before navigation
    queryClient.prefetchQuery({
      queryKey: ['item', itemId],
      queryFn: () => fetchItem(itemId),
    });

    navigation.navigate('ItemDetails', { itemId });
  };

  return <ItemsList onPress={handleItemPress} />;
}
```

---

## State Management

### Only Subscribe to Needed State

```tsx
// ❌ Bad - Subscribes to entire store
const { user, settings, theme, notifications } = useStore();

// ✅ Good - Only subscribe to what you need
const user = useStore(state => state.user);
const theme = useStore(state => state.theme);
```

### Use Selectors

```tsx
import { useSelector } from 'react-redux';

// ❌ Bad - Re-renders on any state change
const user = useSelector(state => state.user);

// ✅ Good - Only re-renders when user.name changes
const userName = useSelector(state => state.user.name);

// ✅ Better - Memoized selector
const selectUserName = createSelector(
  state => state.user,
  user => user.name
);
const userName = useSelector(selectUserName);
```

---

## Navigation

### Lazy Load Screens

```tsx
// ❌ Bad - All screens loaded upfront
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

// ✅ Good - Lazy load screens
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));
```

### Unmount Inactive Screens

```tsx
<Tab.Navigator
  screenOptions={{
    unmountOnBlur: true, // Unmount when navigating away
    lazy: true, // Lazy render screens
  }}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
```

---

## Startup Time

### Splash Screen

```tsx
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Hide when ready
useEffect(() => {
  if (isReady) {
    SplashScreen.hideAsync();
  }
}, [isReady]);
```

### Lazy Initialize Services

```tsx
import { lazyInitialize } from '@/utils/performance';

// ❌ Bad - Initialize immediately
const analytics = new AnalyticsService();

// ✅ Good - Lazy initialize
const getAnalytics = lazyInitialize(() => new AnalyticsService());

// Use it
const analytics = getAnalytics();
```

### Defer Non-Critical Tasks

```tsx
import { defer } from '@/utils/performance';

function App() {
  useEffect(() => {
    // Critical: Run immediately
    loadUserData();

    // Non-critical: Defer
    defer(() => {
      trackAnalytics();
      checkForUpdates();
      warmupCache();
    }, 1000);
  }, []);
}
```

---

## Memory Management

### Clean Up Listeners

```tsx
// ✅ Always cleanup in useEffect
useEffect(() => {
  const subscription = NetInfo.addEventListener(handleNetworkChange);

  return () => {
    subscription.remove();
  };
}, []);
```

### Cancel Pending Requests

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal })
    .then(setData)
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });

  return () => {
    controller.abort();
  };
}, []);
```

### Clear Caches Periodically

```tsx
import { useQueryClient } from '@tanstack/react-query';

function useCacheCleaning() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Clear old cache entries
      queryClient.invalidateQueries({
        predicate: query => {
          const dataUpdatedAt = query.state.dataUpdatedAt;
          const now = Date.now();
          // Clear if older than 1 hour
          return now - dataUpdatedAt > 60 * 60 * 1000;
        },
      });
    }, 15 * 60 * 1000); // Every 15 minutes

    return () => clearInterval(interval);
  }, [queryClient]);
}
```

---

## Monitoring

### Performance Monitoring

```tsx
import { PerformanceMonitor, markStart, markEnd } from '@/utils/performance';

// Measure operations
markStart('fetchData');
const data = await fetchData();
markEnd('fetchData');

// Get performance report
PerformanceMonitor.getInstance().report();
```

### Track Render Performance

```tsx
import { useRenderTracking } from '@/hooks/usePerformance';

function MyComponent() {
  useRenderTracking('MyComponent');
  // Component will log if render takes > 32ms
}
```

### Track Screen Load

```tsx
import { useScreenLoadTracking } from '@/hooks/usePerformance';

function MyScreen() {
  useScreenLoadTracking('MyScreen');
  // Tracks time from mount to first render
}
```

### Use Flipper

```bash
# Install Flipper (if not already)
brew install --cask flipper

# Run app with Flipper
npm start
```

Flipper Features:
- Network inspector
- React DevTools
- Performance monitor
- Database inspector
- Crash reporter

---

## Performance Checklist

### Images
- [ ] Use `OptimizedImage` component
- [ ] Specify image dimensions
- [ ] Use appropriate resize modes
- [ ] Implement image caching
- [ ] Use CDN for remote images

### Lists
- [ ] Use `OptimizedList` component
- [ ] Provide `keyExtractor`
- [ ] Provide `itemHeight` if known
- [ ] Memoize list items
- [ ] Implement pagination

### React
- [ ] Use `React.memo` for expensive components
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for function props
- [ ] Avoid inline objects/arrays
- [ ] Proper key props

### API
- [ ] Implement pagination
- [ ] Debounce search inputs
- [ ] Use React Query caching
- [ ] Prefetch data
- [ ] Parallel requests

### Navigation
- [ ] Lazy load screens
- [ ] Unmount inactive screens
- [ ] Optimize transitions

### Startup
- [ ] Splash screen while loading
- [ ] Lazy initialize services
- [ ] Defer non-critical tasks

### Memory
- [ ] Clean up listeners
- [ ] Cancel pending requests
- [ ] Clear caches periodically
- [ ] Proper useEffect cleanup

---

## Testing Performance

### On Low-End Devices

Test on:
- iPhone 8 or older
- Android devices with 2GB RAM or less
- Slow network (use Network Link Conditioner)

### Measure Performance

```tsx
// Measure any operation
import { measure, measureAsync } from '@/utils/performance';

// Sync operation
const result = measure('sortData', () => {
  return data.sort();
});

// Async operation
const result = await measureAsync('fetchData', () => {
  return fetchData();
});
```

### Check for Slow Operations

Operations taking longer than:
- **16ms**: Will cause frame drops (< 60fps)
- **32ms**: Noticeable lag (< 30fps)
- **1000ms**: Slow operation warning
- **3000ms**: Very slow operation error

---

## Summary

**Must Do:**
✅ Use OptimizedImage for all images
✅ Use OptimizedList for all lists
✅ Memoize expensive components
✅ Use useMemo/useCallback appropriately
✅ Implement pagination
✅ Debounce search inputs
✅ Clean up effects properly

**Should Do:**
✅ Track performance metrics
✅ Lazy load screens
✅ Prefetch data
✅ Use CDN for images
✅ Test on low-end devices

**Nice to Have:**
✅ Bundle size optimization
✅ Code splitting
✅ Parallel API requests
✅ Cache management

The app is now optimized for maximum performance!

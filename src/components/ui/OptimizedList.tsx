/**
 * Optimized List Components
 * High-performance list implementations with proper optimization
 */

import React, { memo, useCallback } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import { flatListOptimizations } from '@/utils/performance';

interface OptimizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  itemHeight?: number;
  estimatedItemSize?: number;
  onEndReachedThreshold?: number;
}

/**
 * Optimized FlatList with performance best practices
 */
export function OptimizedList<T>({
  data,
  renderItem,
  itemHeight,
  estimatedItemSize = 80,
  keyExtractor,
  onEndReachedThreshold = 0.5,
  ...props
}: OptimizedListProps<T>) {
  // Memoized key extractor
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Fallback to index if no keyExtractor provided
      return `item-${index}`;
    },
    [keyExtractor]
  );

  // Get item layout for known heights (major performance boost)
  const getItemLayout = itemHeight
    ? flatListOptimizations.getItemLayout(itemHeight)
    : undefined;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={memoizedKeyExtractor}
      getItemLayout={getItemLayout}
      // Performance optimizations
      removeClippedSubviews={flatListOptimizations.removeClippedSubviews}
      maxToRenderPerBatch={flatListOptimizations.maxToRenderPerBatch}
      updateCellsBatchingPeriod={flatListOptimizations.updateCellsBatchingPeriod}
      initialNumToRender={flatListOptimizations.initialNumToRender}
      windowSize={flatListOptimizations.windowSize}
      onEndReachedThreshold={onEndReachedThreshold}
      // Avoid re-renders
      extraData={undefined}
      {...props}
    />
  );
}

/**
 * Memoized list item wrapper
 * Use this to wrap your list items for automatic memoization
 */
interface MemoizedItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactElement;
}

function MemoizedItemComponent<T>({
  item,
  index,
  renderItem,
}: MemoizedItemProps<T>) {
  return renderItem(item, index);
}

export const MemoizedItem = memo(
  MemoizedItemComponent,
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if item changes
    return prevProps.item === nextProps.item && prevProps.index === nextProps.index;
  }
) as typeof MemoizedItemComponent;

/**
 * Separator component for lists
 */
const ListSeparatorComponent = memo(() => <View style={styles.separator} />);

/**
 * Empty component for lists
 */
interface EmptyComponentProps {
  message?: string;
}

const ListEmptyComponent = memo(({ message = 'No items found' }: EmptyComponentProps) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyContent}>
      {/* Add EmptyState component here if needed */}
    </View>
  </View>
));

/**
 * Footer loading component
 */
const FooterLoadingComponent = memo(() => (
  <View style={styles.footerLoader}>
    {/* Add LoadingSpinner here if needed */}
  </View>
));

/**
 * Optimized list with all performance features
 */
interface PerformantListProps<T> extends OptimizedListProps<T> {
  showSeparator?: boolean;
  emptyMessage?: string;
  isLoadingMore?: boolean;
}

export function PerformantList<T>({
  showSeparator = false,
  emptyMessage,
  isLoadingMore = false,
  ...props
}: PerformantListProps<T>) {
  return (
    <OptimizedList
      ItemSeparatorComponent={showSeparator ? ListSeparatorComponent : undefined}
      ListEmptyComponent={
        emptyMessage ? () => <ListEmptyComponent message={emptyMessage} /> : undefined
      }
      ListFooterComponent={isLoadingMore ? FooterLoadingComponent : undefined}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContent: {
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

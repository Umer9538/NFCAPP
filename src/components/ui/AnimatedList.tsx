/**
 * Animated List Component
 * FlatList with staggered entrance animations and swipe-to-delete
 */

import React, { useCallback } from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItem,
  type ViewToken,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeOutDown,
  Layout,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { stagger, spring, timing } from '@/utils/animations';
import { haptics } from '@/utils/haptics';
import { COLORS } from '@/constants/theme';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export interface AnimatedListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: ListRenderItem<T>;
  staggerDelay?: number;
  animateEntrance?: boolean;
  swipeToDelete?: boolean;
  onDeleteItem?: (item: T, index: number) => void;
  deleteThreshold?: number;
  hapticFeedback?: boolean;
}

export function AnimatedList<T>({
  renderItem,
  staggerDelay = stagger.normal,
  animateEntrance = true,
  swipeToDelete = false,
  onDeleteItem,
  deleteThreshold = -100,
  hapticFeedback = true,
  ...props
}: AnimatedListProps<T>) {
  const viewableItems = useSharedValue<ViewToken[]>([]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems: items }: { viewableItems: ViewToken[] }) => {
      viewableItems.value = items;
    },
    []
  );

  const wrappedRenderItem: ListRenderItem<T> = useCallback(
    (info) => {
      if (!animateEntrance && !swipeToDelete) {
        return renderItem(info);
      }

      return (
        <AnimatedListItem
          info={info}
          renderItem={renderItem}
          staggerDelay={staggerDelay}
          animateEntrance={animateEntrance}
          swipeToDelete={swipeToDelete}
          onDeleteItem={onDeleteItem}
          deleteThreshold={deleteThreshold}
          hapticFeedback={hapticFeedback}
        />
      );
    },
    [
      renderItem,
      staggerDelay,
      animateEntrance,
      swipeToDelete,
      onDeleteItem,
      deleteThreshold,
      hapticFeedback,
    ]
  );

  return (
    <AnimatedFlatList
      {...props}
      renderItem={wrappedRenderItem}
      onViewableItemsChanged={animateEntrance ? handleViewableItemsChanged : undefined}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
    />
  );
}

interface AnimatedListItemProps<T> {
  info: { item: T; index: number };
  renderItem: ListRenderItem<T>;
  staggerDelay: number;
  animateEntrance: boolean;
  swipeToDelete: boolean;
  onDeleteItem?: (item: T, index: number) => void;
  deleteThreshold: number;
  hapticFeedback: boolean;
}

function AnimatedListItem<T>({
  info,
  renderItem,
  staggerDelay,
  animateEntrance,
  swipeToDelete,
  onDeleteItem,
  deleteThreshold,
  hapticFeedback,
}: AnimatedListItemProps<T>) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(100);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(swipeToDelete)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow left swipe for delete
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const shouldDelete = event.translationX < deleteThreshold;

      if (shouldDelete) {
        // Animate out
        translateX.value = withTiming(-400, timing.fast);
        opacity.value = withTiming(0, timing.fast);
        itemHeight.value = withTiming(0, timing.normal, (finished) => {
          if (finished) {
            if (hapticFeedback) {
              haptics.deleteAction();
            }
            onDeleteItem?.(info.item, info.index);
          }
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, spring.gentle);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
    height: itemHeight.value === 100 ? undefined : itemHeight.value,
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor =
      translateX.value < deleteThreshold / 2
        ? COLORS.error[500]
        : COLORS.error[300];

    return {
      backgroundColor,
      opacity: Math.min(Math.abs(translateX.value) / 100, 1),
    };
  });

  const content = (
    <Animated.View
      entering={
        animateEntrance
          ? FadeInDown.delay(info.index * staggerDelay)
              .springify()
              .damping(15)
              .stiffness(150)
          : undefined
      }
      exiting={FadeOutDown}
      layout={Layout.springify()}
    >
      {swipeToDelete && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
            },
            deleteBackgroundStyle,
          ]}
        >
          <Animated.Text style={{ color: '#fff', fontWeight: '600' }}>
            Delete
          </Animated.Text>
        </Animated.View>
      )}

      <Animated.View style={animatedStyle}>
        {renderItem(info)}
      </Animated.View>
    </Animated.View>
  );

  if (swipeToDelete) {
    return <GestureDetector gesture={panGesture}>{content}</GestureDetector>;
  }

  return content;
}

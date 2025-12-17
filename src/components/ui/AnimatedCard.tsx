/**
 * Animated Card Component
 * Card with press animations, hover effects, and gestures
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  type ViewStyle,
  type PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { spring, timing } from '@/utils/animations';
import { haptics } from '@/utils/haptics';
import { COLORS, SPACING } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  pressable?: boolean;
  swipeable?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  hapticFeedback?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onExpand?: () => void;
  animateEntrance?: boolean;
  entranceDelay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  pressable = false,
  swipeable = false,
  expandable = false,
  expanded = false,
  hapticFeedback = true,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  onExpand,
  animateEntrance = true,
  entranceDelay = 0,
  ...props
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(animateEntrance ? 0 : 1);
  const translateY = useSharedValue(animateEntrance ? 20 : 0);
  const elevation = useSharedValue(getElevation(variant));

  // Entrance animation
  React.useEffect(() => {
    if (animateEntrance) {
      setTimeout(() => {
        opacity.value = withTiming(1, timing.normal);
        translateY.value = withSpring(0, spring.gentle);
      }, entranceDelay);
    }
  }, [animateEntrance, entranceDelay]);

  const handlePressIn = useCallback(() => {
    if (pressable) {
      scale.value = withSpring(0.98, spring.gentle);
      elevation.value = withTiming(getElevation(variant) - 2, timing.fast);
    }
  }, [pressable, variant]);

  const handlePressOut = useCallback(() => {
    if (pressable) {
      scale.value = withSpring(1, spring.bouncy);
      elevation.value = withSpring(getElevation(variant), spring.gentle);
    }
  }, [pressable, variant]);

  const handlePress = useCallback(
    (event: any) => {
      if (hapticFeedback) {
        haptics.light();
      }
      onPress?.(event);
    },
    [hapticFeedback, onPress]
  );

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .enabled(swipeable)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -100 && event.velocityX < -500;
      const shouldSwipeRight = event.translationX > 100 && event.velocityX > 500;

      if (shouldSwipeLeft) {
        translateX.value = withTiming(-400, timing.fast, () => {
          if (hapticFeedback) {
            haptics.swipe();
          }
        });
        onSwipeLeft?.();
      } else if (shouldSwipeRight) {
        translateX.value = withTiming(400, timing.fast, () => {
          if (hapticFeedback) {
            haptics.swipe();
          }
        });
        onSwipeRight?.();
      } else {
        translateX.value = withSpring(0, spring.gentle);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
    shadowOpacity: interpolate(
      elevation.value,
      [0, 10],
      [0, 0.15]
    ),
    shadowRadius: interpolate(
      elevation.value,
      [0, 10],
      [0, 8]
    ),
    elevation: elevation.value,
  }));

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return '#fff';
      case 'outline':
        return 'transparent';
      case 'filled':
        return COLORS.gray[50];
      default:
        return '#fff';
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: COLORS.gray[200],
      };
    }
    return {};
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return SPACING.sm;
      case 'md':
        return SPACING.md;
      case 'lg':
        return SPACING.lg;
      case 'xl':
        return SPACING.xl;
      default:
        return SPACING.md;
    }
  };

  const content = (
    <AnimatedPressable
      onPress={pressable ? handlePress : undefined}
      onPressIn={pressable ? handlePressIn : undefined}
      onPressOut={pressable ? handlePressOut : undefined}
      disabled={!pressable}
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          ...getBorderStyle(),
          padding: getPadding(),
        },
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );

  if (swipeable) {
    return <GestureDetector gesture={panGesture}>{content}</GestureDetector>;
  }

  return content;
};

function getElevation(variant: 'elevated' | 'outline' | 'filled'): number {
  switch (variant) {
    case 'elevated':
      return 4;
    case 'outline':
      return 0;
    case 'filled':
      return 0;
    default:
      return 4;
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

/**
 * Animated Loading Components
 * Various loading animations: skeleton, shimmer, pulse, spinner
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '@/constants/theme';

/**
 * Skeleton Shimmer Effect
 * Use for loading placeholders
 */
export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const outputRange = typeof width === 'number' ? [-width, width] : [-300, 300];

    return {
      transform: [
        {
          translateX: interpolate(translateX.value, [-1, 1], outputRange),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            overflow: 'hidden',
            borderRadius,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            COLORS.gray[200],
            COLORS.gray[100],
            COLORS.gray[200],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Pulse Loading
 * Pulsing effect for loading states
 */
export interface PulseProps {
  children?: React.ReactNode;
  scale?: number;
  duration?: number;
  style?: ViewStyle;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  scale = 1.05,
  duration = 1000,
  style,
}) => {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    scaleValue.value = withRepeat(
      withSequence(
        withTiming(scale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [scale, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Spinning Loader
 * Circular spinning animation
 */
export interface SpinnerProps {
  size?: number;
  color?: string;
  duration?: number;
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = COLORS.primary[500],
  duration = 1000,
  style,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: COLORS.gray[200],
          borderTopColor: color,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * Dots Loading
 * Three dots bouncing animation
 */
export interface DotsProps {
  size?: number;
  color?: string;
  spacing?: number;
  style?: ViewStyle;
}

export const Dots: React.FC<DotsProps> = ({
  size = 8,
  color = COLORS.primary[500],
  spacing = 8,
  style,
}) => {
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    const animation = (delay: number) =>
      withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(-10, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      );

    dot1Y.value = animation(0);
    dot2Y.value = animation(200);
    dot3Y.value = animation(400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }));

  const dotStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View style={[dotStyle, dot1Style]} />
      <View style={{ width: spacing }} />
      <Animated.View style={[dotStyle, dot2Style]} />
      <View style={{ width: spacing }} />
      <Animated.View style={[dotStyle, dot3Style]} />
    </View>
  );
};

/**
 * Progress Bar
 * Animated progress indicator
 */
export interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  color = COLORS.primary[500],
  backgroundColor = COLORS.gray[200],
  borderRadius = 2,
  animated = true,
  style,
}) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(progress, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      progressValue.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

/**
 * Radar Scan Animation
 * For NFC scanning effect
 */
export interface RadarScanProps {
  size?: number;
  color?: string;
  duration?: number;
  style?: ViewStyle;
}

export const RadarScan: React.FC<RadarScanProps> = ({
  size = 200,
  color = COLORS.primary[500],
  duration = 2000,
  style,
}) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      ),
      -1,
      false
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {/* Center dot */}
      <View
        style={{
          position: 'absolute',
          width: size / 10,
          height: size / 10,
          borderRadius: size / 20,
          backgroundColor: color,
        }}
      />

      {/* Expanding circle */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

/**
 * Success Checkmark Animation
 */
export interface CheckmarkProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Checkmark: React.FC<CheckmarkProps> = ({
  size = 60,
  color = COLORS.success[500],
  style,
}) => {
  const scale = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(1.7)) }),
      withTiming(1, { duration: 100, easing: Easing.inOut(Easing.ease) })
    );

    checkScale.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) })
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
          },
          circleStyle,
        ]}
      >
        <Animated.Text
          style={[
            {
              fontSize: size * 0.6,
              color: '#fff',
              fontWeight: '700',
            },
            checkStyle,
          ]}
        >
          ✓
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[200],
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  Skeleton,
  Pulse,
  Spinner,
  Dots,
  ProgressBar,
  RadarScan,
  Checkmark,
};

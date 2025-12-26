/**
 * Skeleton Component
 * Animated loading placeholder with shimmer effect
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { SEMANTIC } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, { opacity }]} />
    </View>
  );
}

/**
 * Card Skeleton - Loading placeholder for cards
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={48} height={48} borderRadius={24} style={styles.avatar} />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={18} style={styles.title} />
        <Skeleton width="100%" height={14} style={styles.description} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

/**
 * List Skeleton - Multiple skeleton items
 */
interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

/**
 * Text Skeleton - For text content
 */
interface SkeletonTextProps {
  lines?: number;
  spacing?: number;
}

export function SkeletonText({ lines = 3, spacing = 8 }: SkeletonTextProps) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={14}
        />
      ))}
    </View>
  );
}

/**
 * Image Skeleton - For image placeholders
 */
interface SkeletonImageProps {
  width?: number | string;
  height?: number;
  aspectRatio?: number;
}

export function SkeletonImage({
  width = '100%',
  height,
  aspectRatio,
}: SkeletonImageProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={8}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );
}

/**
 * Stats Card Skeleton - For dashboard stat cards
 */
export function SkeletonStatsCard() {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={60} height={24} />
      </View>
      <Skeleton width="80%" height={20} style={{ marginTop: 12 }} />
      <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

/**
 * Profile Skeleton - For profile screens
 */
export function SkeletonProfile() {
  return (
    <View style={styles.profile}>
      <View style={styles.profileHeader}>
        <Skeleton width={96} height={96} borderRadius={48} />
        <Skeleton width={150} height={24} style={{ marginTop: 16 }} />
        <Skeleton width={200} height={16} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.profileContent}>
        <SkeletonText lines={5} spacing={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SEMANTIC.border.light,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: SEMANTIC.background.secondary,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: SEMANTIC.background.elevated,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: SEMANTIC.background.elevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profile: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profileContent: {
    padding: 16,
  },
});

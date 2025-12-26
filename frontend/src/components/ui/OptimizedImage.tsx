/**
 * Optimized Image Component
 * Uses expo-image for better performance, caching, and loading
 */

import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageProps as ExpoImageProps } from 'expo-image';
import { Skeleton } from './Skeleton';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export interface OptimizedImageProps extends Omit<ExpoImageProps, 'source'> {
  source: string | { uri: string } | number;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  style?: ViewStyle;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * Optimized image with automatic caching and loading states
 */
export function OptimizedImage({
  source,
  width = '100%',
  height,
  aspectRatio,
  style,
  showPlaceholder = true,
  placeholderColor = '#E5E7EB',
  borderRadius = 0,
  resizeMode = 'cover',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convert source to uri format
  const imageSource =
    typeof source === 'string'
      ? { uri: source }
      : typeof source === 'number'
      ? source
      : source;

  const imageStyle = [
    styles.image,
    {
      width,
      height,
      aspectRatio,
      borderRadius,
    },
    style,
  ];

  return (
    <View style={[styles.container, { width, height, aspectRatio, borderRadius }]}>
      {/* Placeholder skeleton while loading */}
      {showPlaceholder && isLoading && !hasError && (
        <View style={styles.placeholder}>
          <Skeleton
            width={width}
            height={height}
            borderRadius={borderRadius}
            style={{ aspectRatio }}
          />
        </View>
      )}

      {/* Error placeholder */}
      {hasError && (
        <View
          style={[
            styles.errorPlaceholder,
            { width, height, aspectRatio, borderRadius, backgroundColor: placeholderColor },
          ]}
        />
      )}

      {/* Actual image */}
      <Image
        source={imageSource}
        style={imageStyle}
        contentFit={resizeMode}
        transition={200}
        placeholder={blurhash}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        cachePolicy="memory-disk"
        {...props}
      />
    </View>
  );
}

/**
 * Avatar image component with circular shape
 */
interface AvatarImageProps {
  source: string | { uri: string } | number;
  size?: number;
  style?: ViewStyle;
}

export function AvatarImage({ source, size = 40, style }: AvatarImageProps) {
  return (
    <OptimizedImage
      source={source}
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
      resizeMode="cover"
    />
  );
}

/**
 * Thumbnail image with lazy loading
 */
interface ThumbnailImageProps extends OptimizedImageProps {
  fullSource?: string | { uri: string };
}

export function ThumbnailImage({
  source,
  fullSource,
  ...props
}: ThumbnailImageProps) {
  const [showFull, setShowFull] = useState(false);

  return (
    <OptimizedImage
      source={showFull && fullSource ? fullSource : source}
      onLoad={() => {
        if (fullSource && !showFull) {
          // Load full image after thumbnail
          setTimeout(() => setShowFull(true), 100);
        }
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  errorPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

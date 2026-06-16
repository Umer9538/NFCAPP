import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

/**
 * Lucide-style "Heart" icon (outline by default). Used as the Conditions step
 * icon, the Quick Add card icon, and the empty-state illustration.
 */
export function HeartIcon({
  size = 20,
  color = '#dc2626',
  fill = 'none',
  strokeWidth = 2,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <Path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

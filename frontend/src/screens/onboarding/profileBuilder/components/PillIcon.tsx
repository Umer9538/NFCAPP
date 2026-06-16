import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Lucide-style "Pill" capsule icon. Slanted capsule with a diagonal line
 * separating the two halves. Used in the Medications step header, the Quick
 * Add card heading, and the empty-state illustration — mirrors the web's
 * Lucide `Pill` icon (matches the visual in localhost:3000 step 3).
 */
export function PillIcon({ size = 20, color = '#dc2626', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m8.5 8.5 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
}

/**
 * The MedID allergy badge — white round name-tag with a dark-red half-dome
 * on top, white medical cross, and two horizontal bars below. Mirrors the
 * web's inline `AllergyBadgeIcon` SVG (app/auth/profile-setup/page.tsx:72).
 */
export function MedicalBadgeIcon({ size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={49} fill="#ffffff" stroke="#d1d5db" strokeWidth={2} />
      <Path d="M 1 50 A 49 49 0 0 1 99 50 Z" fill="#b91c1c" />
      <Rect x={43} y={18} width={14} height={34} fill="#ffffff" />
      <Rect x={33} y={28} width={34} height={14} fill="#ffffff" />
      <Rect x={20} y={62} width={60} height={6} rx={2} fill="#111827" />
      <Rect x={20} y={72} width={60} height={6} rx={2} fill="#111827" />
    </Svg>
  );
}

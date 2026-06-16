import React from 'react';
import { ChipMultiSelect } from './ChipMultiSelect';
import type { Option } from '../enums';

interface Props {
  label?: string;
  options: Option[];
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
}

/**
 * Single-select radio group rendered as chips. Empty string means nothing
 * selected. The backend treats blank as "not provided" — that's fine.
 */
export function EnumRadioGroup({ label, options, value, onChange, required }: Props) {
  return (
    <ChipMultiSelect
      label={label}
      options={options}
      value={value ? [value] : []}
      onChange={(next) => onChange(next[0] || '')}
      single
      required={required}
    />
  );
}

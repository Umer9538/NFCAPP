import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';
import {
  type MedicalTermType,
  type WaterfallResult,
  verifyMedicalTerm,
} from '@/api/waterfall';

interface Props {
  /** The current value of the input we're verifying (the allergen / med / condition name). */
  term: string;
  /** Which kind of term — drives the backend routing. */
  type: MedicalTermType;
  /**
   * Called when the user taps a suggested correction. The caller should update
   * its underlying field to this value.
   */
  onAcceptSuggestion?: (term: string) => void;
  /**
   * Called when verification resolves to a confirmed match. Useful when the
   * caller wants to capture rxcui / din alongside the term.
   */
  onVerified?: (result: WaterfallResult) => void;
  /** Debounce in ms before firing the verify request. Default 500. */
  debounceMs?: number;
}

/**
 * Shows a small status chip beside a medical-term input:
 *   • emerald — verified (RxNorm / Health Canada / local NLP match)
 *   • amber   — partial match; tap a suggestion to accept the correction
 *   • gray    — unknown / network failure (non-blocking)
 *
 * The chip stays out of the way until the user has typed ≥ 3 chars. It never
 * blocks form submission — verification is purely advisory.
 */
export function VerificationChip({
  term,
  type,
  onAcceptSuggestion,
  onVerified,
  debounceMs = 500,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterfallResult | null>(null);
  const [errored, setErrored] = useState(false);
  const lastVerifiedTerm = useRef<string>('');

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed.length < 3) {
      setResult(null);
      setErrored(false);
      return;
    }
    if (trimmed === lastVerifiedTerm.current) return;

    const handle = setTimeout(async () => {
      setLoading(true);
      setErrored(false);
      try {
        const res = await verifyMedicalTerm(trimmed, type);
        lastVerifiedTerm.current = trimmed;
        setResult(res);
        if (res.verified) onVerified?.(res);
      } catch {
        setErrored(true);
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [term, type, debounceMs, onVerified]);

  if (term.trim().length < 3) return null;

  if (loading) {
    return (
      <View style={[styles.chip, styles.chipGray]}>
        <ActivityIndicator size="small" color={GRAY[500]} />
        <Text style={styles.chipText}>Checking…</Text>
      </View>
    );
  }

  if (errored) {
    // Don't scream at the user — verification is a "nice to have" not a gate.
    return null;
  }

  if (!result) return null;

  const palette = colorFor(result.color);

  return (
    <View>
      <View style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.border }]}>
        <Ionicons name={iconFor(result.color)} size={14} color={palette.fg} />
        <Text style={[styles.chipText, { color: palette.fg }]}>
          {labelFor(result)}
        </Text>
      </View>

      {result.suggestions && result.suggestions.length > 0 && onAcceptSuggestion && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>Did you mean:</Text>
          <View style={styles.suggestionRow}>
            {result.suggestions.slice(0, 5).map((s, idx) => (
              <Pressable
                key={`${s.term}-${idx}`}
                style={styles.suggestionChip}
                onPress={() => onAcceptSuggestion(s.displayName || s.term)}
              >
                <Text style={styles.suggestionText}>{s.displayName || s.term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function colorFor(color: 'emerald' | 'amber' | 'gray') {
  switch (color) {
    case 'emerald':
      return {
        bg: MEDICAL_COLORS.green.light,
        border: MEDICAL_COLORS.green.main,
        fg: MEDICAL_COLORS.green.text,
      };
    case 'amber':
      return {
        bg: STATUS.warning.light,
        border: STATUS.warning.main,
        fg: STATUS.warning.text,
      };
    default:
      return {
        bg: GRAY[100],
        border: GRAY[300],
        fg: GRAY[600],
      };
  }
}

function iconFor(color: 'emerald' | 'amber' | 'gray'): keyof typeof Ionicons.glyphMap {
  if (color === 'emerald') return 'checkmark-circle';
  if (color === 'amber') return 'alert-circle';
  return 'help-circle';
}

function labelFor(r: WaterfallResult): string {
  if (r.verified) {
    const display = r.displayName && r.displayName !== r.term ? ` · ${r.displayName}` : '';
    return `Verified${display}`;
  }
  if (r.color === 'amber') return 'Needs confirmation';
  return 'Not recognized';
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginTop: spacing[1],
  },
  chipGray: {
    backgroundColor: GRAY[100],
    borderColor: GRAY[300],
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.secondary,
  },
  suggestions: {
    marginTop: spacing[2],
    padding: spacing[2],
    backgroundColor: GRAY[50],
    borderRadius: borderRadius.md,
  },
  suggestionsLabel: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[1],
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  suggestionChip: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.surface.default,
  },
  suggestionText: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

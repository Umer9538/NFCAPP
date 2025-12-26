/**
 * Common Reusable Styles
 * Matching web app design patterns
 */

import { StyleSheet } from 'react-native';
import { spacing, borderRadius, shadows, typography } from '@/theme/theme';
import { SEMANTIC, PRIMARY, GRAY } from './colors';

/**
 * Container Styles
 */
export const containers = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
    padding: spacing[4],
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },

  // Content containers
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredHorizontal: {
    alignItems: 'center',
  },
  centeredVertical: {
    justifyContent: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Section containers
  section: {
    marginBottom: spacing[6],
  },
  sectionWithBorder: {
    marginBottom: spacing[6],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
});

/**
 * Card Styles
 */
export const cards = StyleSheet.create({
  // Base card
  base: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.md,
  },

  // Medical category cards
  medical: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY[600],
    ...shadows.sm,
  },

  // Interactive cards
  interactive: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  interactivePressed: {
    backgroundColor: SEMANTIC.background.secondary,
    borderColor: SEMANTIC.border.medium,
  },

  // Compact card
  compact: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    ...shadows.xs,
  },

  // Outlined card
  outlined: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
});

/**
 * Text Styles
 */
export const text = StyleSheet.create({
  // Headings
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.snug,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.xl * typography.lineHeight.snug,
  },
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  h6: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },

  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },

  // Labels
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  labelSmall: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },

  // Utility text styles
  secondary: {
    color: SEMANTIC.text.secondary,
  },
  tertiary: {
    color: SEMANTIC.text.tertiary,
  },
  disabled: {
    color: SEMANTIC.text.disabled,
  },
  link: {
    color: SEMANTIC.text.link,
    textDecorationLine: 'underline',
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.border.error,
    marginTop: spacing[1],
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
  },
  semibold: {
    fontWeight: typography.fontWeight.semibold,
  },
});

/**
 * Button Styles
 */
export const buttons = StyleSheet.create({
  // Primary button
  primary: {
    backgroundColor: PRIMARY[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  primaryDisabled: {
    backgroundColor: SEMANTIC.interactive.disabled,
    opacity: 0.6,
  },

  // Secondary button
  secondary: {
    backgroundColor: SEMANTIC.interactive.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  secondaryText: {
    color: SEMANTIC.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  // Outline button
  outline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PRIMARY[600],
  },
  outlineText: {
    color: PRIMARY[600],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  // Ghost button
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: PRIMARY[600],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },

  // Icon button
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.interactive.secondary,
  },
  iconButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.interactive.secondary,
  },
});

/**
 * Input Styles
 */
export const inputs = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  input: {
    backgroundColor: SEMANTIC.surface.default,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  inputFocused: {
    borderColor: SEMANTIC.border.focus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: SEMANTIC.border.error,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

/**
 * Badge Styles
 */
export const badges = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: PRIMARY[100],
  },
  primaryText: {
    color: PRIMARY[700],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  successText: {
    color: '#166534',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  warningText: {
    color: '#92400e',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  error: {
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#7f1d1d',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

/**
 * List Styles
 */
export const lists = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: SEMANTIC.surface.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  itemPressed: {
    backgroundColor: SEMANTIC.background.secondary,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  separator: {
    height: 1,
    backgroundColor: SEMANTIC.border.default,
  },
});

/**
 * Avatar Styles
 */
export const avatars = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  text: {
    color: PRIMARY[700],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

/**
 * Divider Styles
 */
export const dividers = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: SEMANTIC.border.default,
    marginVertical: spacing[4],
  },
  vertical: {
    width: 1,
    backgroundColor: SEMANTIC.border.default,
    marginHorizontal: spacing[4],
  },
  thick: {
    height: 2,
    backgroundColor: SEMANTIC.border.medium,
  },
});

/**
 * Modal/Overlay Styles
 */
export const overlays = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SEMANTIC.background.overlay,
  },
  modal: {
    backgroundColor: SEMANTIC.surface.default,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[6],
    ...shadows['2xl'],
  },
  modalFull: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    margin: spacing[4],
    ...shadows['2xl'],
  },
});

/**
 * Spacing Utilities
 */
export const spacingUtils = {
  mt1: { marginTop: spacing[1] },
  mt2: { marginTop: spacing[2] },
  mt3: { marginTop: spacing[3] },
  mt4: { marginTop: spacing[4] },
  mt6: { marginTop: spacing[6] },
  mb1: { marginBottom: spacing[1] },
  mb2: { marginBottom: spacing[2] },
  mb3: { marginBottom: spacing[3] },
  mb4: { marginBottom: spacing[4] },
  mb6: { marginBottom: spacing[6] },
  ml1: { marginLeft: spacing[1] },
  ml2: { marginLeft: spacing[2] },
  ml3: { marginLeft: spacing[3] },
  ml4: { marginLeft: spacing[4] },
  mr1: { marginRight: spacing[1] },
  mr2: { marginRight: spacing[2] },
  mr3: { marginRight: spacing[3] },
  mr4: { marginRight: spacing[4] },
  p1: { padding: spacing[1] },
  p2: { padding: spacing[2] },
  p3: { padding: spacing[3] },
  p4: { padding: spacing[4] },
  p6: { padding: spacing[6] },
};

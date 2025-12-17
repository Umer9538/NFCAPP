/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for user interactions
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback types
 */
export type HapticType =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'impact'
  | 'rigid'
  | 'soft';

/**
 * Success haptic
 * Use for successful operations (save, submit, complete)
 */
export const success = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Warning haptic
 * Use for warning messages or caution states
 */
export const warning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Error haptic
 * Use for errors, failures, or validation issues
 */
export const error = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Light impact
 * Use for subtle interactions (toggle, checkbox)
 */
export const light = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Medium impact
 * Use for standard interactions (button press, navigation)
 */
export const medium = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Heavy impact
 * Use for important interactions (delete, confirm, primary action)
 */
export const heavy = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Rigid impact (iOS 13+)
 * Sharp, defined feedback
 */
export const rigid = async () => {
  try {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    } else {
      await heavy();
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Soft impact (iOS 13+)
 * Gentle, soft feedback
 */
export const soft = async () => {
  try {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } else {
      await light();
    }
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Selection haptic
 * Use for picker, slider, or selection changes
 */
export const selection = async () => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Generic impact
 * Fallback for custom impact styles
 */
export const impact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    console.warn('Haptic feedback not available:', error);
  }
};

/**
 * Trigger haptic by type
 */
export const trigger = async (type: HapticType) => {
  switch (type) {
    case 'success':
      return success();
    case 'warning':
      return warning();
    case 'error':
      return error();
    case 'light':
      return light();
    case 'medium':
      return medium();
    case 'heavy':
      return heavy();
    case 'rigid':
      return rigid();
    case 'soft':
      return soft();
    case 'selection':
      return selection();
    case 'impact':
      return impact();
    default:
      return medium();
  }
};

/**
 * Haptic patterns for complex feedback
 */

/**
 * Double tap haptic
 * Two quick light impacts
 */
export const doubleTap = async () => {
  await light();
  setTimeout(() => light(), 100);
};

/**
 * Triple tap haptic
 * Three quick light impacts
 */
export const tripleTap = async () => {
  await light();
  setTimeout(() => light(), 100);
  setTimeout(() => light(), 200);
};

/**
 * Success pattern
 * Light -> Heavy (confirmation feel)
 */
export const successPattern = async () => {
  await light();
  setTimeout(() => success(), 100);
};

/**
 * Error pattern
 * Heavy -> Heavy -> Heavy (urgent feel)
 */
export const errorPattern = async () => {
  await heavy();
  setTimeout(() => heavy(), 100);
  setTimeout(() => heavy(), 200);
};

/**
 * Scanning haptic
 * Repeating light impacts
 */
export const scanning = async (duration = 2000) => {
  const interval = 200;
  const iterations = Math.floor(duration / interval);

  for (let i = 0; i < iterations; i++) {
    setTimeout(() => light(), i * interval);
  }
};

/**
 * Swipe haptic
 * Selection feedback for swipe gestures
 */
export const swipe = async () => {
  await selection();
};

/**
 * Long press haptic
 * Medium impact to confirm long press detected
 */
export const longPress = async () => {
  await medium();
};

/**
 * Pull to refresh haptic
 * Light impact when threshold reached
 */
export const pullToRefresh = async () => {
  await light();
};

/**
 * Page transition haptic
 * Soft impact for smooth feel
 */
export const pageTransition = async () => {
  await soft();
};

/**
 * Modal open haptic
 * Light impact when modal appears
 */
export const modalOpen = async () => {
  await light();
};

/**
 * Modal close haptic
 * Light impact when modal dismisses
 */
export const modalClose = async () => {
  await light();
};

/**
 * Delete haptic
 * Heavy impact for destructive action
 */
export const deleteAction = async () => {
  await heavy();
};

/**
 * Undo haptic
 * Medium impact for undo action
 */
export const undo = async () => {
  await medium();
};

/**
 * Context-specific haptics
 */

/**
 * Button press haptic
 */
export const buttonPress = async (variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary') => {
  switch (variant) {
    case 'primary':
      return medium();
    case 'secondary':
      return light();
    case 'ghost':
      return soft();
    case 'danger':
      return heavy();
    default:
      return medium();
  }
};

/**
 * Toggle haptic
 */
export const toggle = async (isOn: boolean) => {
  if (isOn) {
    await medium();
  } else {
    await light();
  }
};

/**
 * Checkbox haptic
 */
export const checkbox = async (isChecked: boolean) => {
  if (isChecked) {
    await medium();
  } else {
    await light();
  }
};

/**
 * Radio button haptic
 */
export const radio = async () => {
  await medium();
};

/**
 * Tab switch haptic
 */
export const tabSwitch = async () => {
  await light();
};

/**
 * Picker change haptic
 */
export const pickerChange = async () => {
  await selection();
};

/**
 * Slider haptic
 */
export const slider = async () => {
  await selection();
};

/**
 * NFC scan haptics
 */

/**
 * NFC scanning start
 */
export const nfcScanStart = async () => {
  await light();
};

/**
 * NFC scan success
 */
export const nfcScanSuccess = async () => {
  await successPattern();
};

/**
 * NFC scan error
 */
export const nfcScanError = async () => {
  await errorPattern();
};

/**
 * QR scan haptics
 */

/**
 * QR code detected
 */
export const qrCodeDetected = async () => {
  await medium();
};

/**
 * QR scan success
 */
export const qrScanSuccess = async () => {
  await success();
};

/**
 * QR scan error
 */
export const qrScanError = async () => {
  await error();
};

/**
 * Form haptics
 */

/**
 * Input focus
 */
export const inputFocus = async () => {
  await soft();
};

/**
 * Input validation error
 */
export const inputError = async () => {
  await error();
};

/**
 * Form submit success
 */
export const formSubmitSuccess = async () => {
  await successPattern();
};

/**
 * Form submit error
 */
export const formSubmitError = async () => {
  await errorPattern();
};

/**
 * List haptics
 */

/**
 * List item press
 */
export const listItemPress = async () => {
  await light();
};

/**
 * Swipe to delete
 */
export const swipeToDelete = async () => {
  await heavy();
};

/**
 * Reorder item
 */
export const reorderItem = async () => {
  await selection();
};

/**
 * Notification haptics
 */

/**
 * Notification received
 */
export const notificationReceived = async () => {
  await medium();
};

/**
 * Check if haptics are available
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    // Try to trigger a light haptic
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return true;
  } catch {
    return false;
  }
};

/**
 * Default export with all haptic functions
 */
export default {
  // Basic haptics
  success,
  warning,
  error,
  light,
  medium,
  heavy,
  rigid,
  soft,
  selection,
  impact,
  trigger,

  // Patterns
  doubleTap,
  tripleTap,
  successPattern,
  errorPattern,
  scanning,
  swipe,
  longPress,
  pullToRefresh,
  pageTransition,
  modalOpen,
  modalClose,
  deleteAction,
  undo,

  // Context-specific
  buttonPress,
  toggle,
  checkbox,
  radio,
  tabSwitch,
  pickerChange,
  slider,

  // NFC
  nfcScanStart,
  nfcScanSuccess,
  nfcScanError,

  // QR
  qrCodeDetected,
  qrScanSuccess,
  qrScanError,

  // Form
  inputFocus,
  inputError,
  formSubmitSuccess,
  formSubmitError,

  // List
  listItemPress,
  swipeToDelete,
  reorderItem,

  // Notification
  notificationReceived,

  // Utility
  isAvailable,
};

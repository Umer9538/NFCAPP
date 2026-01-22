/**
 * Toast Component
 * Notification toast with auto-dismiss and variants
 * Matches web app toast notifications
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { STATUS, SEMANTIC } from '@/constants/colors';
import { spacing, borderRadius, typography, shadows } from '@/theme/theme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: number;
  onDismiss: () => void;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Toast({
  visible,
  message,
  variant = 'info',
  position = 'top',
  duration = 3000,
  onDismiss,
  icon,
  action,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const variantStyle = getVariantStyle(variant);
  const defaultIcon = getDefaultIcon(variant);

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.containerTop : styles.containerBottom,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        onPress={handleDismiss}
        style={[styles.toast, variantStyle.container]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          {icon || <Text style={styles.defaultIcon}>{defaultIcon}</Text>}
        </View>

        {/* Message */}
        <Text style={[styles.message, variantStyle.text]} numberOfLines={3}>
          {message}
        </Text>

        {/* Action Button */}
        {action && (
          <Pressable
            onPress={action.onPress}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.actionText, variantStyle.text]}>
              {action.label}
            </Text>
          </Pressable>
        )}

        {/* Close Button */}
        <Pressable
          onPress={handleDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.closeButtonText, variantStyle.text]}>✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Get variant styles
 */
function getVariantStyle(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return {
        container: {
          backgroundColor: STATUS.success.light,
          borderLeftColor: STATUS.success.main,
        },
        text: {
          color: STATUS.success.text,
        },
      };

    case 'error':
      return {
        container: {
          backgroundColor: STATUS.error.light,
          borderLeftColor: STATUS.error.main,
        },
        text: {
          color: STATUS.error.text,
        },
      };

    case 'warning':
      return {
        container: {
          backgroundColor: STATUS.warning.light,
          borderLeftColor: STATUS.warning.main,
        },
        text: {
          color: STATUS.warning.text,
        },
      };

    case 'info':
      return {
        container: {
          backgroundColor: STATUS.info.light,
          borderLeftColor: STATUS.info.main,
        },
        text: {
          color: STATUS.info.text,
        },
      };

    default:
      return {
        container: {
          backgroundColor: SEMANTIC.surface.default,
          borderLeftColor: SEMANTIC.border.default,
        },
        text: {
          color: SEMANTIC.text.primary,
        },
      };
  }
}

/**
 * Get default icon for variant
 */
function getDefaultIcon(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return 'ℹ';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  containerTop: {
    top: spacing[6] + 50, // Account for status bar
  },
  containerBottom: {
    bottom: spacing[6] + 50, // Account for safe area
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...shadows.lg,
    maxWidth: Dimensions.get('window').width - spacing[4] * 2,
  },
  iconContainer: {
    marginRight: spacing[2],
  },
  defaultIcon: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  actionButton: {
    marginLeft: spacing[3],
    paddingHorizontal: spacing[2],
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
  },
});

/**
 * Messages to suppress in production (auth errors handled by logout)
 */
const SUPPRESSED_MESSAGES = [
  '401',
  'unauthorized',
  'session has expired',
  'please log in again',
  'token expired',
  'invalid token',
  'authentication required',
];

/**
 * Check if a message should be suppressed
 */
function shouldSuppressMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SUPPRESSED_MESSAGES.some(suppressed => lowerMessage.includes(suppressed));
}

/**
 * Toast Manager Hook (optional helper)
 */
export function useToast() {
  const [toastConfig, setToastConfig] = React.useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
    duration?: number;
  }>({
    visible: false,
    message: '',
    variant: 'info',
    duration: 3000,
  });

  const showToast = (
    message: string,
    variant: ToastVariant = 'info',
    duration?: number
  ) => {
    // Suppress certain error messages in production (401 auth errors)
    if (variant === 'error' && shouldSuppressMessage(message)) {
      return;
    }

    // Default durations: errors show longer so users can read them
    const defaultDuration = variant === 'error' ? 5000 : variant === 'warning' ? 4000 : 3000;
    setToastConfig({ visible: true, message, variant, duration: duration ?? defaultDuration });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const success = (message: string, duration?: number) =>
    showToast(message, 'success', duration ?? 3000);

  const error = (message: string, duration?: number) =>
    showToast(message, 'error', duration ?? 5000); // Errors show for 5 seconds

  const warning = (message: string, duration?: number) =>
    showToast(message, 'warning', duration ?? 4000);

  const info = (message: string, duration?: number) =>
    showToast(message, 'info', duration ?? 3000);

  /**
   * Handle API error - only shows toast for non-auth errors
   * Use this instead of directly calling error() for API responses
   */
  const handleApiError = (err: any, fallbackMessage?: string) => {
    // Don't show toast for 401 errors (user will be logged out)
    if (err?.status === 401 || err?.code === 'HTTP_401') {
      return;
    }

    const message = err?.message || fallbackMessage || 'Something went wrong. Please try again.';

    // Skip if the message indicates an auth error
    if (shouldSuppressMessage(message)) {
      return;
    }

    error(message);
  };

  return {
    toastConfig,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
    handleApiError,
  };
}

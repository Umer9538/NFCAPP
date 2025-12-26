/**
 * Modal Component
 * Full-screen and center modal with animations
 * Matches web app Modal design
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, borderRadius, shadows, typography } from '@/theme/theme';

export type ModalVariant = 'center' | 'fullscreen' | 'bottom';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: ModalVariant;
  showCloseButton?: boolean;
  title?: string;
  animationType?: 'slide' | 'fade' | 'none';
  swipeToDismiss?: boolean;
  style?: ViewStyle;
}

export function Modal({
  visible,
  onClose,
  children,
  variant = 'center',
  showCloseButton = true,
  title,
  animationType = 'fade',
  swipeToDismiss = false,
  style,
}: ModalProps) {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(Dimensions.get('window').height);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 15,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getModalContent = () => {
    switch (variant) {
      case 'fullscreen':
        return (
          <View style={styles.fullscreenContainer}>
            {showCloseButton && (
              <View style={styles.fullscreenHeader}>
                {title && <Text style={styles.fullscreenTitle}>{title}</Text>}
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>
            )}
            <ScrollView style={styles.fullscreenContent}>{children}</ScrollView>
          </View>
        );

      case 'bottom':
        return (
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] },
              style,
            ]}
          >
            {swipeToDismiss && (
              <View style={styles.swipeIndicator}>
                <View style={styles.swipeBar} />
              </View>
            )}
            {(title || showCloseButton) && (
              <View style={styles.bottomSheetHeader}>
                {title && <Text style={styles.bottomSheetTitle}>{title}</Text>}
                {showCloseButton && (
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView style={styles.bottomSheetContent}>{children}</ScrollView>
          </Animated.View>
        );

      case 'center':
      default:
        return (
          <Animated.View style={[styles.centerModal, { opacity: fadeAnim }, style]}>
            {(title || showCloseButton) && (
              <View style={styles.centerModalHeader}>
                {title && <Text style={styles.centerModalTitle}>{title}</Text>}
                {showCloseButton && (
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView style={styles.centerModalContent}>{children}</ScrollView>
          </Animated.View>
        );
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={variant !== 'fullscreen' ? onClose : undefined}
        />
        {getModalContent()}
      </View>
    </RNModal>
  );
}

/**
 * Modal Header Component
 */
interface ModalHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ModalHeader({ children, style }: ModalHeaderProps) {
  return <View style={[styles.modalHeader, style]}>{children}</View>;
}

/**
 * Modal Body Component
 */
interface ModalBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ModalBody({ children, style }: ModalBodyProps) {
  return <View style={[styles.modalBody, style]}>{children}</View>;
}

/**
 * Modal Footer Component
 */
interface ModalFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ModalFooter({ children, style }: ModalFooterProps) {
  return <View style={[styles.modalFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SEMANTIC.background.overlay,
  },

  // Fullscreen Modal
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: SEMANTIC.background.default,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  fullscreenTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  fullscreenContent: {
    flex: 1,
    padding: spacing[4],
  },

  // Center Modal
  centerModal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },
  centerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  centerModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  centerModalContent: {
    padding: spacing[4],
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
    backgroundColor: SEMANTIC.surface.default,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    ...shadows['2xl'],
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: GRAY[300],
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  bottomSheetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  bottomSheetContent: {
    padding: spacing[4],
    maxHeight: 500,
  },

  // Common
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.background.secondary,
  },
  closeButtonText: {
    fontSize: 20,
    color: SEMANTIC.text.secondary,
    fontWeight: typography.fontWeight.bold,
  },

  // Subcomponents
  modalHeader: {
    marginBottom: spacing[4],
  },
  modalBody: {
    flex: 1,
  },
  modalFooter: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
});

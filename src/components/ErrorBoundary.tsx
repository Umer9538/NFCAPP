/**
 * Error Boundary Component
 * Catches React errors and displays a friendly error screen
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error reporting service (Sentry, Bugsnag, etc.)
    // this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Example: Send to Sentry
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
      // Fallback to reset
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo!,
          this.handleReset
        );
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color={SEMANTIC.error} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Oops! Something went wrong</Text>

            {/* Message */}
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an unexpected
              error and needs to restart.
            </Text>

            {/* Error Details (only in dev mode) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <>
                    <Text style={styles.errorDetailsTitle}>Component Stack:</Text>
                    <Text style={styles.errorDetailsText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={this.handleReload}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Restart App</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={this.handleReset}
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </Pressable>
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              If this problem persists, please contact support at{' '}
              <Text style={styles.helpLink}>support@medguard.com</Text>
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  message: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  errorDetails: {
    width: '100%',
    backgroundColor: SEMANTIC.background.elevated,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  errorDetailsText: {
    fontSize: 12,
    color: SEMANTIC.text.secondary,
    fontFamily: 'monospace',
    marginBottom: spacing[3],
  },
  actions: {
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: 12,
    gap: spacing[2],
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: PRIMARY[600],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: SEMANTIC.background.elevated,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  helpText: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpLink: {
    color: PRIMARY[600],
    fontWeight: '600',
  },
});

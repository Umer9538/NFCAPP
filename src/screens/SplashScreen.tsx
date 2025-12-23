/**
 * Splash Screen
 * Displays branding while checking auth state and onboarding status
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Heart, Shield } from 'lucide-react-native';
import * as SplashScreen from 'expo-splash-screen';

// Keep native splash screen visible while we initialize
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if splash screen is already hidden
});

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onReady: () => void;
}

export default function AppSplashScreen({ onReady }: SplashScreenProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide the native splash screen
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();

    // Start animations
    Animated.parallel([
      // Fade in logo
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Scale up logo
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After logo appears, fade in tagline
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Start pulse animation on icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Minimum display time of 2 seconds for branding
    const timer = setTimeout(() => {
      onReady();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, pulseAnim, taglineFade, onReady]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Shield/Heart Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Shield background */}
          <View style={styles.shieldBackground}>
            <Shield size={64} color="#DC2626" strokeWidth={2} fill="#DC2626" />
          </View>
          {/* Heart overlay */}
          <View style={styles.heartOverlay}>
            <Heart size={28} color="#ffffff" strokeWidth={2.5} fill="#ffffff" />
          </View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>MedID</Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineFade,
            },
          ]}
        >
          Your Life. One Tap Away.
        </Animated.Text>
      </Animated.View>

      {/* Bottom branding */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: taglineFade,
          },
        ]}
      >
        <View style={styles.featureBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Medical Grade</Text>
          </View>
          <View style={styles.badgeDot} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>256-bit Encrypted</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  shieldBackground: {
    position: 'absolute',
  },
  heartOverlay: {
    position: 'absolute',
    top: 22,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  featureBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
});

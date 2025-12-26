/**
 * Onboarding Screen
 * Full-screen swipeable slides explaining MedID features for first-time users
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Shield,
  Heart,
  Smartphone,
  Nfc,
  Zap,
  Droplets,
  MessageSquare,
  Lock,
  Check,
  Flag,
  ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@medguard_onboarding_completed';

// Slide data
interface Slide {
  id: string;
  type: 'hero' | 'howItWorks' | 'features' | 'trust';
}

const slides: Slide[] = [
  { id: '1', type: 'hero' },
  { id: '2', type: 'howItWorks' },
  { id: '3', type: 'features' },
  { id: '4', type: 'trust' },
];

// Feature badge component
interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

function FeatureBadge({ icon, label, color, bgColor }: FeatureBadgeProps) {
  return (
    <View style={[styles.featureBadge, { backgroundColor: bgColor }]}>
      <View style={styles.featureBadgeIcon}>{icon}</View>
      <Text style={[styles.featureBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

// Trust badge component
interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
}

function TrustBadge({ icon, label }: TrustBadgeProps) {
  return (
    <View style={styles.trustBadge}>
      <View style={styles.trustBadgeIcon}>{icon}</View>
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  );
}

// Slide 1: Hero/Welcome
function HeroSlide() {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={styles.heroIconContainer}>
          <View style={styles.heroIconShield}>
            <Shield size={80} color="#DC2626" strokeWidth={1.5} fill="#DC2626" />
          </View>
          <View style={styles.heroIconHeart}>
            <Heart size={36} color="#ffffff" strokeWidth={2} fill="#ffffff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>Emergency Ready</Text>

        {/* Subtitle with highlighted text */}
        <Text style={styles.slideSubtitle}>
          Collapsed at a mall? Your bracelet saves you.{'\n'}
          <Text style={styles.highlightText}>Under 2 seconds</Text> to access your vital info.
        </Text>
      </View>
    </View>
  );
}

// Slide 2: How It Works
function HowItWorksSlide() {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Smartphone size={50} color="#DC2626" strokeWidth={1.5} />
            <View style={styles.nfcBadge}>
              <Nfc size={24} color="#ffffff" strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>One Tap Access</Text>

        {/* Subtitle */}
        <Text style={styles.slideSubtitle}>
          Paramedics tap your bracelet — your blood type, allergies, medications, and emergency contacts appear instantly.
        </Text>
      </View>
    </View>
  );
}

// Slide 3: Features
function FeaturesSlide() {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureRow}>
            <FeatureBadge
              icon={<Zap size={28} color="#22c55e" strokeWidth={2} />}
              label="No Battery"
              color="#22c55e"
              bgColor="#f0fdf4"
            />
            <FeatureBadge
              icon={<Droplets size={28} color="#3b82f6" strokeWidth={2} />}
              label="Waterproof"
              color="#3b82f6"
              bgColor="#eff6ff"
            />
          </View>
          <View style={styles.featureRow}>
            <FeatureBadge
              icon={<Shield size={28} color="#8b5cf6" strokeWidth={2} />}
              label="Medical Grade"
              color="#8b5cf6"
              bgColor="#f5f3ff"
            />
            <FeatureBadge
              icon={<MessageSquare size={28} color="#DC2626" strokeWidth={2} />}
              label="Instant SMS Alerts"
              color="#DC2626"
              bgColor="#fef2f2"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>Built for Emergencies</Text>

        {/* Subtitle */}
        <Text style={styles.slideSubtitle}>
          Durable, reliable, always ready when you need it most.
        </Text>
      </View>
    </View>
  );
}

// Slide 4: Trust & Security
function TrustSlide() {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Lock size={60} color="#DC2626" strokeWidth={1.5} />
            <View style={styles.shieldOverlay}>
              <Shield size={30} color="#DC2626" strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>Your Privacy Protected</Text>

        {/* Trust Badges */}
        <View style={styles.trustBadgesContainer}>
          <TrustBadge
            icon={<Check size={18} color="#22c55e" strokeWidth={2.5} />}
            label="PIPEDA Compliant"
          />
          <TrustBadge
            icon={<Lock size={18} color="#DC2626" strokeWidth={2} />}
            label="256-bit Encrypted"
          />
          <TrustBadge
            icon={<Flag size={18} color="#DC2626" strokeWidth={2} />}
            label="Made in Canada"
          />
        </View>

        {/* Subtitle */}
        <Text style={styles.slideSubtitle}>
          Your medical data is encrypted and secure.
        </Text>
      </View>
    </View>
  );
}

// Render slide based on type
function renderSlide(type: Slide['type']) {
  switch (type) {
    case 'hero':
      return <HeroSlide />;
    case 'howItWorks':
      return <HowItWorksSlide />;
    case 'features':
      return <FeaturesSlide />;
    case 'trust':
      return <TrustSlide />;
    default:
      return null;
  }
}

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Handle viewable items change
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // Navigate to next slide
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  // Skip to login
  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: slides.length - 1,
      animated: true,
    });
  };

  // Complete onboarding
  const handleGetStarted = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      // Call the onComplete callback - RootNavigator will handle navigation
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setIsCompleting(false);
      // Still try to complete even if storage fails
      if (onComplete) {
        onComplete();
      }
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>{renderSlide(item.type)}</View>
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dot Indicators */}
        <View style={styles.dotContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: currentIndex === index ? '#DC2626' : '#d1d5db',
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={[styles.nextButton, isLastSlide && styles.getStartedButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          {!isLastSlide && (
            <ChevronRight size={20} color="#ffffff" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  slide: {
    width,
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  // Hero slide styles
  heroIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  heroIconShield: {
    position: 'absolute',
  },
  heroIconHeart: {
    position: 'absolute',
    top: 30,
  },
  // Generic icon styles
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  // Text styles
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  highlightText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  // Feature grid styles
  featureGrid: {
    marginBottom: 32,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 16,
  },
  featureBadge: {
    width: (width - 80) / 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  featureBadgeIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Trust badges styles
  trustBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trustBadgeIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  // Bottom section
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 16,
    gap: 24,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  getStartedButton: {
    paddingVertical: 18,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

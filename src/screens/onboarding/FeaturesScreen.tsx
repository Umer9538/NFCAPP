/**
 * Features Screen
 * Showcase key app features
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { OnboardingNavigationProp } from '@/navigation/types';
import { Button } from '@/components/ui';
import { PRIMARY, GRAY, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

const { width, height } = Dimensions.get('window');

interface Feature {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    id: '1',
    icon: 'watch',
    title: 'NFC Bracelet',
    description:
      'Wear your medical information on a stylish NFC bracelet. First responders can tap it with their phone to access your emergency profile instantly.',
    color: PRIMARY[500],
  },
  {
    id: '2',
    icon: 'medical',
    title: 'Medical Profile',
    description:
      'Store all your critical medical information including allergies, medications, medical conditions, and blood type in one secure place.',
    color: '#ef4444',
  },
  {
    id: '3',
    icon: 'people',
    title: 'Emergency Contacts',
    description:
      'Keep your emergency contacts updated and accessible. In an emergency, responders can quickly reach your loved ones or primary care physician.',
    color: '#3b82f6',
  },
  {
    id: '4',
    icon: 'qr-code',
    title: 'QR Code Access',
    description:
      'Generate a QR code for your emergency profile. Share it or keep it in your wallet for quick access without NFC technology.',
    color: '#8b5cf6',
  },
  {
    id: '5',
    icon: 'shield-checkmark',
    title: 'Privacy & Security',
    description:
      'Your medical data is encrypted and stored securely. You control what information is shared and who can access it.',
    color: '#10b981',
  },
];

export default function FeaturesScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < FEATURES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate('OnboardingProfile');
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingProfile');
  };

  const renderFeature = ({ item }: { item: Feature }) => (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={80} color={item.color} />
        </View>
        <Text style={styles.featureTitle}>{item.title}</Text>
        <Text style={styles.featureDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.pagination}>
      {FEATURES.map((_, index) => {
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

        const opacity = scrollX.interpolate({
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
                opacity,
                backgroundColor: PRIMARY[500],
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={FEATURES}
        renderItem={renderFeature}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button variant="ghost" onPress={handleSkip} style={styles.skipButton}>
            Skip
          </Button>
          <Button onPress={handleNext} style={styles.nextButton}>
            {currentIndex === FEATURES.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  slide: {
    width,
    height: height - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  featureTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    padding: spacing[6],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.default,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

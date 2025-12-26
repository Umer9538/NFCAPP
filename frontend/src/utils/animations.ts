/**
 * Animation Utilities
 * Reusable animation configurations and helpers
 */

import {
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  type WithTimingConfig,
  type WithSpringConfig,
} from 'react-native-reanimated';

/**
 * Timing Configurations
 */
export const timing = {
  // Fast - Quick interactions (100-200ms)
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,

  // Normal - Standard animations (200-300ms)
  normal: {
    duration: 250,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  } as WithTimingConfig,

  // Slow - Emphasis animations (300-500ms)
  slow: {
    duration: 400,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  } as WithTimingConfig,

  // Very Slow - Large transitions (500ms+)
  verySlow: {
    duration: 600,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  } as WithTimingConfig,

  // Linear - For continuous animations
  linear: {
    duration: 300,
    easing: Easing.linear,
  } as WithTimingConfig,
};

/**
 * Spring Configurations
 */
export const spring = {
  // Gentle - Subtle spring
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,

  // Bouncy - Noticeable spring
  bouncy: {
    damping: 15,
    stiffness: 200,
    mass: 1,
  } as WithSpringConfig,

  // Very Bouncy - Emphasized spring
  veryBouncy: {
    damping: 10,
    stiffness: 250,
    mass: 0.8,
  } as WithSpringConfig,

  // Stiff - Quick, minimal overshoot
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  } as WithSpringConfig,

  // Wobbly - More overshoot
  wobbly: {
    damping: 8,
    stiffness: 180,
    mass: 1,
  } as WithSpringConfig,
};

/**
 * Easing Functions (matching web app's Framer Motion)
 */
export const easings = {
  // Ease Out - Decelerates (most common)
  easeOut: Easing.bezier(0.0, 0.0, 0.2, 1),

  // Ease In - Accelerates
  easeIn: Easing.bezier(0.4, 0.0, 1, 1),

  // Ease In Out - Accelerates then decelerates
  easeInOut: Easing.bezier(0.4, 0.0, 0.2, 1),

  // Ease - Standard ease
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),

  // Sharp - Quick start and stop
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),

  // Back Out - Slight overshoot
  backOut: Easing.bezier(0.34, 1.56, 0.64, 1),

  // Back In - Slight undershoot before animating
  backIn: Easing.bezier(0.36, 0, 0.66, -0.56),

  // Elastic - More pronounced overshoot
  elastic: Easing.elastic(1.5),

  // Bounce - Bouncing effect
  bounce: Easing.bounce,
};

/**
 * Animation Presets
 */

// Scale animations
export const scaleAnimation = {
  pressIn: (scale = 0.95) => withSpring(scale, spring.gentle),
  pressOut: () => withSpring(1, spring.gentle),

  bounce: () =>
    withSequence(
      withTiming(0.95, timing.fast),
      withSpring(1, spring.bouncy)
    ),

  pop: () =>
    withSequence(
      withTiming(1.1, timing.fast),
      withSpring(1, spring.gentle)
    ),
};

// Fade animations
export const fadeAnimation = {
  in: (duration = 250) =>
    withTiming(1, { duration, easing: easings.easeOut }),

  out: (duration = 250) =>
    withTiming(0, { duration, easing: easings.easeIn }),

  inOut: (duration = 250) =>
    withSequence(
      withTiming(1, { duration, easing: easings.easeOut }),
      withDelay(1000, withTiming(0, { duration, easing: easings.easeIn }))
    ),
};

// Slide animations
export const slideAnimation = {
  inFromRight: (distance = 300) =>
    withTiming(0, {
      duration: 300,
      easing: easings.easeOut,
    }),

  inFromLeft: (distance = 300) =>
    withTiming(0, {
      duration: 300,
      easing: easings.easeOut,
    }),

  inFromTop: (distance = 300) =>
    withTiming(0, {
      duration: 300,
      easing: easings.easeOut,
    }),

  inFromBottom: (distance = 300) =>
    withTiming(0, {
      duration: 300,
      easing: easings.easeOut,
    }),
};

// Rotate animations
export const rotateAnimation = {
  rotate360: (duration = 1000) =>
    withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1, // Infinite
      false
    ),

  rotate180: () =>
    withTiming(180, timing.normal),

  rotateBack: () =>
    withTiming(0, timing.normal),

  shake: () =>
    withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    ),
};

// Shake animation (for errors)
export const shakeAnimation = () =>
  withSequence(
    withTiming(-10, { duration: 50 }),
    withRepeat(withTiming(10, { duration: 100 }), 3, true),
    withTiming(0, { duration: 50 })
  );

// Pulse animation
export const pulseAnimation = (scale = 1.1, duration = 1000) =>
  withRepeat(
    withSequence(
      withTiming(scale, { duration: duration / 2, easing: easings.easeInOut }),
      withTiming(1, { duration: duration / 2, easing: easings.easeInOut })
    ),
    -1, // Infinite
    false
  );

// Bounce animation
export const bounceAnimation = (height = -20, duration = 600) =>
  withRepeat(
    withSequence(
      withTiming(height, { duration: duration / 2, easing: easings.easeOut }),
      withTiming(0, { duration: duration / 2, easing: easings.bounce })
    ),
    -1, // Infinite
    false
  );

// Shimmer animation (for loading skeletons)
export const shimmerAnimation = (duration = 1500) =>
  withRepeat(
    withTiming(1, { duration, easing: Easing.linear }),
    -1, // Infinite
    false
  );

// Progress animation
export const progressAnimation = (toValue: number, duration = 500) =>
  withTiming(toValue, {
    duration,
    easing: easings.easeOut,
  });

/**
 * Stagger Configuration
 * For animating lists with delays
 */
export const stagger = {
  // Delay between items (ms)
  fast: 50,
  normal: 100,
  slow: 150,

  // Calculate delay for index
  getDelay: (index: number, interval = 100) => index * interval,
};

/**
 * Gesture Configurations
 */
export const gesture = {
  // Swipe thresholds
  swipe: {
    velocityThreshold: 500,
    distanceThreshold: 100,
  },

  // Pan thresholds
  pan: {
    minDistance: 10,
  },

  // Tap thresholds
  tap: {
    maxDuration: 200,
    maxDistance: 10,
  },
};

/**
 * Animation Helpers
 */

/**
 * Staggered entrance animation for lists
 */
export const createStaggeredAnimation = (
  index: number,
  staggerDelay = stagger.normal,
  animationDuration = timing.normal.duration
) => {
  'worklet';
  const delay = index * staggerDelay;

  return {
    opacity: withDelay(delay, withTiming(1, { duration: animationDuration })),
    transform: [
      {
        translateY: withDelay(
          delay,
          withSpring(0, spring.gentle)
        ),
      },
    ],
  };
};

/**
 * Entrance animation (fade + slide)
 */
export const entranceAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 20
) => {
  'worklet';
  const translateKey = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';
  const translateValue = direction === 'up' || direction === 'left' ? distance : -distance;

  return {
    opacity: withTiming(1, timing.normal),
    transform: [
      {
        [translateKey]: withSpring(0, spring.gentle),
      },
    ],
  };
};

/**
 * Exit animation (fade + slide)
 */
export const exitAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'down',
  distance = 20
) => {
  'worklet';
  const translateKey = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';
  const translateValue = direction === 'up' || direction === 'left' ? -distance : distance;

  return {
    opacity: withTiming(0, timing.normal),
    transform: [
      {
        [translateKey]: withTiming(translateValue, timing.normal),
      },
    ],
  };
};

/**
 * Scale button press animation
 */
export const buttonPressAnimation = (scale = 0.95) => {
  'worklet';
  return withSequence(
    withTiming(scale, { duration: 100 }),
    withSpring(1, spring.gentle)
  );
};

/**
 * Success checkmark animation
 */
export const successAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(0, { duration: 0 }),
    withDelay(
      100,
      withSpring(1, {
        damping: 10,
        stiffness: 200,
      })
    )
  );
};

/**
 * Error shake animation
 */
export const errorAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withRepeat(withTiming(10, { duration: 100 }), 3, true),
    withTiming(0, { duration: 50 })
  );
};

/**
 * Loading pulse animation
 */
export const loadingPulse = (scale = 1.05) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(scale, { duration: 800, easing: easings.easeInOut }),
      withTiming(1, { duration: 800, easing: easings.easeInOut })
    ),
    -1,
    false
  );
};

/**
 * Radar scanning animation (for NFC)
 */
export const radarScanAnimation = () => {
  'worklet';
  return withRepeat(
    withTiming(1, {
      duration: 2000,
      easing: Easing.linear,
    }),
    -1,
    false
  );
};

/**
 * Card flip animation
 */
export const flipAnimation = (duration = 600) => {
  'worklet';
  return withTiming(180, {
    duration,
    easing: easings.easeInOut,
  });
};

/**
 * Expandable animation
 */
export const expandAnimation = (toHeight: number, duration = 300) => {
  'worklet';
  return withTiming(toHeight, {
    duration,
    easing: easings.easeOut,
  });
};

export const collapseAnimation = (duration = 300) => {
  'worklet';
  return withTiming(0, {
    duration,
    easing: easings.easeIn,
  });
};

/**
 * Swipe animation
 */
export const swipeAnimation = (direction: 'left' | 'right', distance = 300) => {
  'worklet';
  const targetValue = direction === 'left' ? -distance : distance;

  return withSequence(
    withTiming(targetValue, {
      duration: 200,
      easing: easings.easeOut,
    }),
    withTiming(0, {
      duration: 200,
      easing: easings.easeIn,
    })
  );
};

/**
 * Navigation transitions (matching CardStyleInterpolators)
 */
export const navigationTransitions = {
  // Horizontal slide (iOS style)
  slideFromRight: {
    duration: 300,
    easing: easings.easeOut,
  },

  // Vertical slide (modal style)
  slideFromBottom: {
    duration: 300,
    easing: easings.easeOut,
  },

  // Fade (for simple transitions)
  fade: {
    duration: 200,
    easing: easings.ease,
  },

  // Scale (for modals/dialogs)
  scale: {
    duration: 250,
    easing: easings.easeOut,
  },
};

/**
 * Micro-interaction animations
 */
export const microInteractions = {
  // Checkbox check animation
  checkboxCheck: () =>
    withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, spring.bouncy)
    ),

  // Toggle switch animation
  toggleSwitch: (toValue: number) =>
    withSpring(toValue, spring.gentle),

  // Radio button selection
  radioSelect: () =>
    withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, spring.bouncy)
    ),

  // Progress bar fill
  progressFill: (toValue: number, duration = 500) =>
    withTiming(toValue, {
      duration,
      easing: easings.easeOut,
    }),
};

/**
 * Layout animation configs
 */
export const layoutAnimations = {
  // Default layout animation
  default: {
    duration: 300,
    easing: easings.easeInOut,
  },

  // Fast layout animation
  fast: {
    duration: 150,
    easing: easings.easeOut,
  },

  // Slow layout animation
  slow: {
    duration: 500,
    easing: easings.easeInOut,
  },
};

/**
 * Constants
 */
export const ANIMATION_CONSTANTS = {
  // Default durations
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  VERY_SLOW: 600,

  // Scale values
  PRESS_SCALE: 0.95,
  POP_SCALE: 1.1,
  PULSE_SCALE: 1.05,

  // Distances
  SLIDE_DISTANCE: 20,
  SWIPE_DISTANCE: 300,

  // Rotation
  ROTATE_90: 90,
  ROTATE_180: 180,
  ROTATE_360: 360,

  // Opacity
  FADE_OUT: 0,
  FADE_IN: 1,
  FADE_HALF: 0.5,
};

export default {
  timing,
  spring,
  easings,
  scaleAnimation,
  fadeAnimation,
  slideAnimation,
  rotateAnimation,
  shakeAnimation,
  pulseAnimation,
  bounceAnimation,
  shimmerAnimation,
  progressAnimation,
  stagger,
  gesture,
  createStaggeredAnimation,
  entranceAnimation,
  exitAnimation,
  buttonPressAnimation,
  successAnimation,
  errorAnimation,
  loadingPulse,
  radarScanAnimation,
  flipAnimation,
  expandAnimation,
  collapseAnimation,
  swipeAnimation,
  navigationTransitions,
  microInteractions,
  layoutAnimations,
  ANIMATION_CONSTANTS,
};

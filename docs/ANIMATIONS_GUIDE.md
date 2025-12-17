# Animations & Interactions Guide

## Overview

The MedGuard app uses **react-native-reanimated** and **expo-haptics** to provide smooth 60 FPS animations and tactile feedback, matching the professional feel of the web app's Framer Motion animations.

## Installation

All required packages are already installed:

```json
{
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "expo-haptics": "~13.x"
}
```

## Core Utilities

### 1. Animation Utilities (`src/utils/animations.ts`)

Reusable animation configurations and helpers.

#### Timing Configurations

```typescript
import { timing } from '@/utils/animations';

// Fast - 150ms (quick interactions)
withTiming(value, timing.fast);

// Normal - 250ms (standard animations)
withTiming(value, timing.normal);

// Slow - 400ms (emphasis animations)
withTiming(value, timing.slow);

// Very Slow - 600ms (large transitions)
withTiming(value, timing.verySlow);
```

#### Spring Configurations

```typescript
import { spring } from '@/utils/animations';

// Gentle - subtle spring
withSpring(value, spring.gentle);

// Bouncy - noticeable spring
withSpring(value, spring.bouncy);

// Very Bouncy - emphasized spring
withSpring(value, spring.veryBouncy);

// Stiff - quick, minimal overshoot
withSpring(value, spring.stiff);

// Wobbly - more overshoot
withSpring(value, spring.wobbly);
```

#### Easing Functions

```typescript
import { easings } from '@/utils/animations';

// Matching Framer Motion easings
withTiming(value, { easing: easings.easeOut });
withTiming(value, { easing: easings.easeIn });
withTiming(value, { easing: easings.easeInOut });
withTiming(value, { easing: easings.backOut });
withTiming(value, { easing: easings.elastic });
```

#### Animation Presets

```typescript
import {
  scaleAnimation,
  fadeAnimation,
  slideAnimation,
  rotateAnimation,
  shakeAnimation,
  pulseAnimation,
} from '@/utils/animations';

// Scale down on press
scale.value = scaleAnimation.pressIn();

// Fade in
opacity.value = fadeAnimation.in();

// Slide in from right
translateX.value = slideAnimation.inFromRight();

// Shake (for errors)
translateX.value = shakeAnimation();

// Pulse (for loading)
scale.value = pulseAnimation();
```

### 2. Haptic Feedback (`src/utils/haptics.ts`)

Tactile feedback for user interactions.

#### Basic Haptics

```typescript
import { haptics } from '@/utils/haptics';

// Success feedback
await haptics.success();

// Warning feedback
await haptics.warning();

// Error feedback
await haptics.error();

// Light impact
await haptics.light();

// Medium impact
await haptics.medium();

// Heavy impact
await haptics.heavy();

// Selection change
await haptics.selection();
```

#### Context-Specific Haptics

```typescript
// Button press
await haptics.buttonPress('primary'); // or 'secondary', 'ghost', 'danger'

// Toggle switch
await haptics.toggle(isOn);

// Checkbox
await haptics.checkbox(isChecked);

// Tab switch
await haptics.tabSwitch();

// NFC scan
await haptics.nfcScanStart();
await haptics.nfcScanSuccess();
await haptics.nfcScanError();

// Form input
await haptics.inputFocus();
await haptics.inputError();
await haptics.formSubmitSuccess();
```

## Animated Components

### 1. AnimatedButton

Button with press animations and haptic feedback.

```typescript
import { AnimatedButton } from '@/components/ui/AnimatedButton';

<AnimatedButton
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size="md" // 'sm' | 'md' | 'lg'
  fullWidth
  loading={false}
  disabled={false}
  hapticFeedback={true}
  scaleOnPress={true}
  animationType="both" // 'scale' | 'opacity' | 'both'
  icon={<Ionicons name="save" size={20} />}
  iconPosition="left" // 'left' | 'right'
  onPress={() => console.log('Pressed')}
>
  Save Changes
</AnimatedButton>
```

**Features:**
- Scale down on press (0.95)
- Haptic feedback on press
- Loading spinner state
- Icon support
- Multiple variants and sizes

### 2. AnimatedCard

Card with press animations and swipe gestures.

```typescript
import { AnimatedCard } from '@/components/ui/AnimatedCard';

<AnimatedCard
  variant="elevated" // 'elevated' | 'outline' | 'filled'
  padding="md" // 'none' | 'sm' | 'md' | 'lg' | 'xl'
  pressable={true}
  swipeable={true}
  hapticFeedback={true}
  animateEntrance={true}
  entranceDelay={0}
  onPress={() => console.log('Pressed')}
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
>
  <Text>Card content</Text>
</AnimatedCard>
```

**Features:**
- Press animation with scale and elevation
- Swipe gestures (left/right)
- Entrance animation (fade + slide up)
- Staggered delays for lists
- Haptic feedback

### 3. AnimatedList

FlatList with staggered entrance animations and swipe-to-delete.

```typescript
import { AnimatedList } from '@/components/ui/AnimatedList';

<AnimatedList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  staggerDelay={100} // Delay between items (ms)
  animateEntrance={true}
  swipeToDelete={true}
  onDeleteItem={(item, index) => handleDelete(item)}
  deleteThreshold={-100}
  hapticFeedback={true}
  keyExtractor={(item) => item.id}
/>
```

**Features:**
- Staggered entrance animation
- Swipe-to-delete with red background
- Layout animations on item add/remove
- Haptic feedback on delete
- All FlatList props supported

### 4. AnimatedInput

Text input with floating label and error shake.

```typescript
import { AnimatedInput } from '@/components/ui/AnimatedInput';

<AnimatedInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  success={emailValid}
  helperText="We'll never share your email"
  leftIcon="mail"
  rightIcon="eye-off"
  onRightIconPress={togglePasswordVisibility}
  floatingLabel={true}
  showSuccessCheck={true}
  hapticFeedback={true}
  placeholder="Enter your email"
  keyboardType="email-address"
/>
```

**Features:**
- Floating label animation
- Error shake animation
- Success checkmark animation
- Icon support (left and right)
- Haptic feedback on focus and error
- Helper text and error messages

### 5. Loading Animations

Various loading states and skeletons.

#### Skeleton Shimmer

```typescript
import { Skeleton } from '@/components/ui/AnimatedLoading';

<Skeleton width={200} height={20} borderRadius={8} />
<Skeleton width="100%" height={60} />
<Skeleton width={40} height={40} borderRadius={20} /> {/* Circle */}
```

#### Pulse Loading

```typescript
import { Pulse } from '@/components/ui/AnimatedLoading';

<Pulse scale={1.05} duration={1000}>
  <View>
    <Text>Loading content</Text>
  </View>
</Pulse>
```

#### Spinner

```typescript
import { Spinner } from '@/components/ui/AnimatedLoading';

<Spinner size={40} color={COLORS.primary[500]} duration={1000} />
```

#### Dots Loading

```typescript
import { Dots } from '@/components/ui/AnimatedLoading';

<Dots size={8} color={COLORS.primary[500]} spacing={8} />
```

#### Progress Bar

```typescript
import { ProgressBar } from '@/components/ui/AnimatedLoading';

<ProgressBar
  progress={0.7} // 0 to 1
  height={4}
  color={COLORS.primary[500]}
  backgroundColor={COLORS.gray[200]}
  animated={true}
/>
```

#### Radar Scan (NFC)

```typescript
import { RadarScan } from '@/components/ui/AnimatedLoading';

<RadarScan size={200} color={COLORS.primary[500]} duration={2000} />
```

#### Success Checkmark

```typescript
import { Checkmark } from '@/components/ui/AnimatedLoading';

<Checkmark size={60} color={COLORS.success[500]} />
```

## Common Patterns

### 1. Staggered List Entrance

```typescript
import { createStaggeredAnimation } from '@/utils/animations';

const animatedStyle = useAnimatedStyle(() => {
  return createStaggeredAnimation(index, 100, 250);
});
```

### 2. Button Press with Haptics

```typescript
const handlePress = async () => {
  await haptics.medium();
  // Perform action
};
```

### 3. Error Shake

```typescript
import { errorAnimation } from '@/utils/animations';

useEffect(() => {
  if (error) {
    translateX.value = errorAnimation();
    haptics.error();
  }
}, [error]);
```

### 4. Success Animation

```typescript
import { successAnimation } from '@/utils/animations';

useEffect(() => {
  if (success) {
    scale.value = successAnimation();
    haptics.success();
  }
}, [success]);
```

### 5. Pull to Refresh

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  await haptics.pullToRefresh();
  // Fetch data
  setRefreshing(false);
};
```

### 6. Swipe to Delete

```typescript
const panGesture = Gesture.Pan()
  .onEnd((event) => {
    if (event.translationX < -100) {
      // Delete animation
      translateX.value = withTiming(-400, timing.fast);
      opacity.value = withTiming(0, timing.fast);
      haptics.deleteAction();
    }
  });
```

### 7. Modal Entrance

```typescript
useEffect(() => {
  if (visible) {
    opacity.value = withTiming(1, timing.normal);
    scale.value = withSpring(1, spring.bouncy);
    haptics.modalOpen();
  }
}, [visible]);
```

### 8. Tab Bar Animation

```typescript
const handleTabPress = (tab: string) => {
  scale.value = withSequence(
    withTiming(0.8, { duration: 100 }),
    withSpring(1, spring.bouncy)
  );
  haptics.tabSwitch();
};
```

## Screen Transitions

### Navigation Animations

Update `AppNavigator.tsx` for custom transitions:

```typescript
import { CardStyleInterpolators } from '@react-navigation/stack';

<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    gestureDirection: 'horizontal',
  }}
/>

// Available interpolators:
// - forHorizontalIOS (iOS style slide)
// - forVerticalIOS (modal style slide)
// - forFadeFromBottomAndroid (Android style fade)
// - forRevealFromBottomAndroid (Android style reveal)
```

### Modal Presentations

```typescript
<Stack.Screen
  name="QRCodeScanner"
  component={QRScannerScreen}
  options={{
    presentation: 'modal',
    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
  }}
/>
```

## Best Practices

### Performance

1. **Use `worklet` for complex animations:**
   ```typescript
   const animatedStyle = useAnimatedStyle(() => {
     'worklet';
     // Animation logic
   });
   ```

2. **Minimize rerenders:**
   - Use `useSharedValue` for animated values
   - Use `useAnimatedStyle` instead of inline styles
   - Memoize callbacks with `useCallback`

3. **Optimize list animations:**
   - Use `getItemLayout` for FlatList
   - Limit stagger delay (< 150ms)
   - Use `removeClippedSubviews`

### Accessibility

1. **Respect reduced motion:**
   ```typescript
   import { AccessibilityInfo } from 'react-native';

   const [reduceMotion, setReduceMotion] = useState(false);

   useEffect(() => {
     AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
   }, []);

   // Disable animations if reduceMotion is true
   ```

2. **Provide haptic alternatives:**
   - Always provide visual feedback
   - Don't rely solely on haptics

### UX Guidelines

1. **Animation Durations:**
   - Fast interactions: 100-200ms
   - Standard animations: 200-300ms
   - Emphasis animations: 300-500ms
   - Large transitions: 500-600ms

2. **Haptic Usage:**
   - Use sparingly to avoid fatigue
   - Match intensity to action importance
   - Provide opt-out setting

3. **Purpose:**
   - Every animation should have a purpose
   - Avoid distracting or gratuitous animations
   - Use to guide attention or provide feedback

## Examples

### Example 1: Animated Form

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    await haptics.formSubmitSuccess();
    // Submit form
  };

  return (
    <View>
      <AnimatedInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        leftIcon="mail"
        keyboardType="email-address"
      />

      <AnimatedInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        leftIcon="lock-closed"
        rightIcon="eye-off"
        secureTextEntry
      />

      <AnimatedButton
        variant="primary"
        fullWidth
        onPress={handleSubmit}
      >
        Sign In
      </AnimatedButton>
    </View>
  );
}
```

### Example 2: Animated Card List

```typescript
function ContactsList() {
  const [contacts, setContacts] = useState([]);

  const handleDelete = (contact, index) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatedList
      data={contacts}
      renderItem={({ item, index }) => (
        <AnimatedCard
          pressable
          swipeable
          animateEntrance
          entranceDelay={index * 100}
          onPress={() => navigate('ContactDetails', { id: item.id })}
        >
          <Text>{item.name}</Text>
          <Text>{item.phone}</Text>
        </AnimatedCard>
      )}
      swipeToDelete
      onDeleteItem={handleDelete}
      staggerDelay={100}
      keyExtractor={item => item.id}
    />
  );
}
```

### Example 3: Loading States

```typescript
function ProfileScreen() {
  const { data, isLoading } = useQuery(['profile'], fetchProfile);

  if (isLoading) {
    return (
      <View>
        <Skeleton width="100%" height={60} />
        <Skeleton width="80%" height={20} style={{ marginTop: 16 }} />
        <Skeleton width="60%" height={20} style={{ marginTop: 8 }} />

        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Spinner size={40} />
        </View>
      </View>
    );
  }

  return <ProfileContent data={data} />;
}
```

### Example 4: NFC Scanning Animation

```typescript
function NFCScanScreen() {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      haptics.nfcScanStart();
    }
  }, [scanning]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {scanning && <RadarScan size={200} />}

      <AnimatedButton
        variant="primary"
        onPress={() => setScanning(true)}
        loading={scanning}
      >
        {scanning ? 'Scanning...' : 'Start Scan'}
      </AnimatedButton>
    </View>
  );
}
```

## Troubleshooting

### Common Issues

**Issue:** Animations stuttering or janky

**Solution:**
- Check for heavy computations on UI thread
- Use `useAnimatedStyle` instead of inline styles
- Verify 60 FPS with React DevTools Profiler
- Add `worklet` directive to animation functions

**Issue:** Haptics not working

**Solution:**
- Check device capabilities (some don't support haptics)
- Verify permissions in app.json
- Test on real device (not simulator)
- Wrap in try/catch for graceful fallback

**Issue:** Gestures conflicting with scrolling

**Solution:**
- Use `activeOffsetX` or `activeOffsetY`
- Set proper gesture thresholds
- Use `simultaneousHandlers` if needed

## Performance Monitoring

### Check Animation Performance

```typescript
import { setGestureState } from 'react-native-reanimated';

// Enable debug mode (dev only)
setGestureState(true);

// Monitor FPS
import { FpsMonitor } from 'react-native-fps-monitor';
<FpsMonitor />
```

### Optimize Heavy Animations

```typescript
// Use LayoutAnimation for simple layout changes
import { LayoutAnimation } from 'react-native';

LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
setState(newState);
```

## Resources

- [react-native-reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [react-native-gesture-handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [expo-haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Material Motion Guidelines](https://m2.material.io/design/motion/)
- [iOS Human Interface Guidelines - Animation](https://developer.apple.com/design/human-interface-guidelines/motion)

## Summary

✅ **60 FPS Animations** - Smooth, performant animations using Reanimated 3
✅ **Haptic Feedback** - Tactile feedback for all interactions
✅ **Gesture Support** - Swipe, pan, and tap gestures
✅ **Loading States** - Skeleton, shimmer, pulse, and spinner components
✅ **Form Animations** - Floating labels, error shake, success checkmark
✅ **List Animations** - Staggered entrance, swipe-to-delete
✅ **Professional Feel** - Matches web app's Framer Motion animations

All components are production-ready and optimized for performance!

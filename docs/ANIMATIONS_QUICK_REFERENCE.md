

# Animations Quick Reference

## Quick Imports

```typescript
// Animation utilities
import { timing, spring, easings } from '@/utils/animations';

// Haptics
import { haptics } from '@/utils/haptics';

// Animated components
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { AnimatedInput } from '@/components/ui/AnimatedInput';
import {
  Skeleton,
  Spinner,
  Pulse,
  Dots,
  ProgressBar,
  RadarScan,
  Checkmark,
} from '@/components/ui/AnimatedLoading';

// Reanimated
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
```

## Common Patterns

### Button with Press Animation

```typescript
<AnimatedButton variant="primary" onPress={handlePress}>
  Save
</AnimatedButton>
```

### Card with Swipe

```typescript
<AnimatedCard
  swipeable
  onSwipeLeft={handleDelete}
  onSwipeRight={handleArchive}
>
  <Text>Swipeable card</Text>
</AnimatedCard>
```

### List with Stagger

```typescript
<AnimatedList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  staggerDelay={100}
  swipeToDelete
  onDeleteItem={handleDelete}
/>
```

### Input with Floating Label

```typescript
<AnimatedInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  leftIcon="mail"
/>
```

### Loading Skeleton

```typescript
<Skeleton width="100%" height={60} />
<Skeleton width="80%" height={20} />
```

### Progress Indicator

```typescript
<ProgressBar progress={0.7} />
```

## Haptic Cheat Sheet

```typescript
// Basic
haptics.light()      // Subtle tap
haptics.medium()     // Standard tap
haptics.heavy()      // Strong tap

// Notifications
haptics.success()    // Success notification
haptics.warning()    // Warning notification
haptics.error()      // Error notification

// Context
haptics.buttonPress('primary')
haptics.toggle(true)
haptics.checkbox(true)
haptics.tabSwitch()
haptics.inputFocus()
haptics.inputError()

// NFC
haptics.nfcScanStart()
haptics.nfcScanSuccess()
haptics.nfcScanError()

// Form
haptics.formSubmitSuccess()
haptics.formSubmitError()

// List
haptics.swipeToDelete()
haptics.listItemPress()
```

## Animation Timing

```typescript
// Fast (150ms) - Quick interactions
withTiming(value, timing.fast)

// Normal (250ms) - Standard animations
withTiming(value, timing.normal)

// Slow (400ms) - Emphasis
withTiming(value, timing.slow)

// Very Slow (600ms) - Large transitions
withTiming(value, timing.verySlow)
```

## Spring Types

```typescript
// Gentle - Subtle spring
withSpring(value, spring.gentle)

// Bouncy - Noticeable spring
withSpring(value, spring.bouncy)

// Very Bouncy - Emphasized
withSpring(value, spring.veryBouncy)

// Stiff - Quick, minimal overshoot
withSpring(value, spring.stiff)

// Wobbly - More overshoot
withSpring(value, spring.wobbly)
```

## Common Animations

### Scale on Press

```typescript
const scale = useSharedValue(1);

const handlePressIn = () => {
  scale.value = withSpring(0.95, spring.gentle);
};

const handlePressOut = () => {
  scale.value = withSpring(1, spring.gentle);
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### Fade In

```typescript
const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, timing.normal);
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));
```

### Slide In

```typescript
const translateY = useSharedValue(20);

useEffect(() => {
  translateY.value = withSpring(0, spring.gentle);
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
}));
```

### Error Shake

```typescript
import { errorAnimation } from '@/utils/animations';

const translateX = useSharedValue(0);

useEffect(() => {
  if (error) {
    translateX.value = errorAnimation();
    haptics.error();
  }
}, [error]);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### Pulse

```typescript
const scale = useSharedValue(1);

useEffect(() => {
  scale.value = withRepeat(
    withSequence(
      withTiming(1.05, { duration: 500 }),
      withTiming(1, { duration: 500 })
    ),
    -1,
    false
  );
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

## Loading States

### Skeleton Grid

```typescript
<View>
  <Skeleton width="100%" height={60} />
  <Skeleton width="80%" height={20} style={{ marginTop: 16 }} />
  <Skeleton width="60%" height={20} style={{ marginTop: 8 }} />
</View>
```

### Spinner with Text

```typescript
<View style={{ alignItems: 'center' }}>
  <Spinner size={40} />
  <Text style={{ marginTop: 16 }}>Loading...</Text>
</View>
```

### Progress Bar

```typescript
<View>
  <Text>Uploading: {Math.round(progress * 100)}%</Text>
  <ProgressBar progress={progress} />
</View>
```

### Dots Loading

```typescript
<View style={{ alignItems: 'center' }}>
  <Dots size={8} />
</View>
```

## Gesture Patterns

### Swipe to Delete

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = event.translationX;
  })
  .onEnd((event) => {
    if (event.translationX < -100) {
      // Delete
      translateX.value = withTiming(-400);
      haptics.deleteAction();
      onDelete();
    } else {
      // Snap back
      translateX.value = withSpring(0);
    }
  });

<GestureDetector gesture={panGesture}>
  <Animated.View style={animatedStyle}>
    {/* Content */}
  </Animated.View>
</GestureDetector>
```

### Pull to Refresh

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  await haptics.pullToRefresh();
  await fetchData();
  setRefreshing(false);
};

<FlatList
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

## Navigation Transitions

### Horizontal Slide (iOS)

```typescript
import { CardStyleInterpolators } from '@react-navigation/stack';

<Stack.Screen
  options={{
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  }}
/>
```

### Modal Presentation

```typescript
<Stack.Screen
  options={{
    presentation: 'modal',
    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
  }}
/>
```

### Fade Transition

```typescript
<Stack.Screen
  options={{
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  }}
/>
```

## Performance Tips

1. **Use `worklet` for complex animations**
2. **Memoize callbacks** with `useCallback`
3. **Use `getItemLayout`** for FlatList
4. **Minimize rerenders** with `React.memo`
5. **Use `removeClippedSubviews`** for long lists
6. **Profile with React DevTools** to check FPS

## Accessibility

```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// Disable animations if reduceMotion is true
const duration = reduceMotion ? 0 : 250;
```

## Timing Guidelines

| Duration | Use Case |
|----------|----------|
| 100-200ms | Quick interactions (button press, checkbox) |
| 200-300ms | Standard animations (fade, slide) |
| 300-500ms | Emphasis animations (modal, dialog) |
| 500-600ms | Large transitions (screen navigation) |

## Common Mistakes

❌ **Don't:** Animate every element
✅ **Do:** Animate with purpose

❌ **Don't:** Use long durations (> 600ms)
✅ **Do:** Keep animations snappy

❌ **Don't:** Overuse haptics
✅ **Do:** Use haptics sparingly

❌ **Don't:** Animate on UI thread
✅ **Do:** Use Reanimated for 60 FPS

❌ **Don't:** Forget accessibility
✅ **Do:** Respect reduced motion

## Component Props Quick Reference

### AnimatedButton
```typescript
variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
size: 'sm' | 'md' | 'lg'
loading: boolean
disabled: boolean
hapticFeedback: boolean
scaleOnPress: boolean
icon: ReactNode
```

### AnimatedCard
```typescript
variant: 'elevated' | 'outline' | 'filled'
padding: 'none' | 'sm' | 'md' | 'lg' | 'xl'
pressable: boolean
swipeable: boolean
hapticFeedback: boolean
animateEntrance: boolean
onSwipeLeft: () => void
onSwipeRight: () => void
```

### AnimatedList
```typescript
staggerDelay: number (default: 100)
animateEntrance: boolean
swipeToDelete: boolean
onDeleteItem: (item, index) => void
deleteThreshold: number (default: -100)
hapticFeedback: boolean
```

### AnimatedInput
```typescript
label: string
error: string
success: boolean
leftIcon: IconName
rightIcon: IconName
floatingLabel: boolean
showSuccessCheck: boolean
hapticFeedback: boolean
```

## File Structure

```
src/
  utils/
    animations.ts       # Animation configs
    haptics.ts          # Haptic feedback
  components/
    ui/
      AnimatedButton.tsx
      AnimatedCard.tsx
      AnimatedList.tsx
      AnimatedInput.tsx
      AnimatedLoading.tsx
```

## Resources

- [Full Guide](./ANIMATIONS_GUIDE.md)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/)

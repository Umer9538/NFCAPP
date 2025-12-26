# MedGuard Mobile - Theme & Design System Guide

## Overview
This guide documents the complete design system for MedGuard Mobile, matching the web application's design tokens exactly.

## Color System

### Primary Colors (Red Brand)
```typescript
import { PRIMARY } from '@/constants/colors';

// Usage
PRIMARY[600] // #dc2626 - Main brand color
PRIMARY[500] // #ef4444 - Lighter primary
PRIMARY[700] // #b91c1c - Darker primary
```

**Full Scale**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Medical Category Colors
Pre-defined colors for medical information categories:

```typescript
import { MEDICAL_COLORS } from '@/constants/colors';

MEDICAL_COLORS.red      // Blood type, critical info
MEDICAL_COLORS.blue     // Medications, information
MEDICAL_COLORS.yellow   // Allergies, warnings
MEDICAL_COLORS.purple   // Conditions, emergency
MEDICAL_COLORS.green    // Contacts, success
```

Each category has: `light`, `main`, `dark`, `text` variants

### Semantic Colors
Context-aware color tokens:

```typescript
import { SEMANTIC } from '@/constants/colors';

// Backgrounds
SEMANTIC.background.default
SEMANTIC.background.secondary
SEMANTIC.background.tertiary

// Text
SEMANTIC.text.primary
SEMANTIC.text.secondary
SEMANTIC.text.tertiary
SEMANTIC.text.disabled

// Borders
SEMANTIC.border.default
SEMANTIC.border.focus
SEMANTIC.border.error
```

### Status Colors
```typescript
import { STATUS } from '@/constants/colors';

STATUS.success  // Green - #22c55e
STATUS.warning  // Yellow - #f59e0b
STATUS.error    // Red - #ef4444
STATUS.info     // Blue - #3b82f6
```

## Typography

### Font Sizes
```typescript
import { typography } from '@/theme/theme';

typography.fontSize.xs    // 12px
typography.fontSize.sm    // 14px
typography.fontSize.base  // 16px
typography.fontSize.lg    // 18px
typography.fontSize.xl    // 20px
typography.fontSize['2xl'] // 24px
typography.fontSize['3xl'] // 30px
typography.fontSize['4xl'] // 36px
```

### Font Weights
```typescript
typography.fontWeight.normal    // 400
typography.fontWeight.medium    // 500
typography.fontWeight.semibold  // 600
typography.fontWeight.bold      // 700
```

### Line Heights
```typescript
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.625
```

### Usage Example
```tsx
import { text } from '@/constants/styles';

<Text style={text.h1}>Main Heading</Text>
<Text style={text.h2}>Section Heading</Text>
<Text style={text.body}>Body text</Text>
<Text style={text.bodySmall}>Small text</Text>
```

## Spacing

Based on 4px unit system:

```typescript
import { spacing } from '@/theme/theme';

spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[5]  // 20px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
spacing[16] // 64px
```

### Spacing Utilities
```typescript
import { spacingUtils } from '@/constants/styles';

// Quick margin/padding utilities
spacingUtils.mt4  // marginTop: 16
spacingUtils.mb6  // marginBottom: 24
spacingUtils.p4   // padding: 16
```

## Border Radius

```typescript
import { borderRadius } from '@/theme/theme';

borderRadius.sm   // 4px
borderRadius.md   // 8px
borderRadius.lg   // 12px
borderRadius.xl   // 16px
borderRadius.full // 9999px (pill shape)
```

## Shadows

Elevation system matching web app:

```typescript
import { shadows } from '@/theme/theme';

shadows.sm   // Subtle shadow
shadows.md   // Medium elevation
shadows.lg   // High elevation
shadows.xl   // Maximum elevation
```

### Usage Example
```tsx
<View style={[styles.card, shadows.md]}>
  {/* Card content */}
</View>
```

## Pre-built Components Styles

### Cards
```tsx
import { cards } from '@/constants/styles';

// Basic card
<View style={cards.base}>
  <Text>Card content</Text>
</View>

// Elevated card
<View style={cards.elevated}>
  <Text>Elevated card</Text>
</View>

// Medical category card (with left border)
<View style={cards.medical}>
  <Text>Medical info</Text>
</View>

// Interactive card (for pressable items)
<Pressable style={cards.interactive}>
  <Text>Tap me</Text>
</Pressable>
```

### Buttons
```tsx
import { buttons } from '@/constants/styles';

// Primary button
<Pressable style={buttons.primary}>
  <Text style={buttons.primaryText}>Primary Action</Text>
</Pressable>

// Secondary button
<Pressable style={buttons.secondary}>
  <Text style={buttons.secondaryText}>Secondary</Text>
</Pressable>

// Outline button
<Pressable style={buttons.outline}>
  <Text style={buttons.outlineText}>Outline</Text>
</Pressable>

// Icon button
<Pressable style={buttons.iconButton}>
  <Icon name="plus" size={20} />
</Pressable>
```

### Inputs
```tsx
import { inputs } from '@/constants/styles';

<View style={inputs.container}>
  <Text style={text.label}>Email</Text>
  <TextInput
    style={inputs.input}
    placeholder="Enter email"
  />
</View>

// Focused state
<TextInput
  style={[inputs.input, inputs.inputFocused]}
/>

// Error state
<TextInput
  style={[inputs.input, inputs.inputError]}
/>
<Text style={text.error}>Error message</Text>
```

### Badges
```tsx
import { badges } from '@/constants/styles';

// Primary badge
<View style={[badges.base, badges.primary]}>
  <Text style={badges.primaryText}>Active</Text>
</View>

// Success badge
<View style={[badges.base, badges.success]}>
  <Text style={badges.successText}>Verified</Text>
</View>

// Warning badge
<View style={[badges.base, badges.warning]}>
  <Text style={badges.warningText}>Warning</Text>
</View>

// Error badge
<View style={[badges.base, badges.error]}>
  <Text style={badges.errorText}>Critical</Text>
</View>
```

### Lists
```tsx
import { lists } from '@/constants/styles';

<Pressable style={lists.item}>
  <Icon name="heart" size={24} />
  <View style={lists.itemContent}>
    <Text style={text.h6}>Item Title</Text>
    <Text style={text.bodySmall}>Item description</Text>
  </View>
</Pressable>

{/* Separator */}
<View style={lists.separator} />
```

### Avatars
```tsx
import { avatars } from '@/constants/styles';

<View style={avatars.base}>
  <Text style={avatars.text}>JD</Text>
</View>

// Large avatar
<View style={[avatars.base, avatars.large]}>
  <Text style={avatars.text}>JD</Text>
</View>

// Small avatar
<View style={[avatars.base, avatars.small]}>
  <Text style={avatars.text}>JD</Text>
</View>
```

## React Native Paper Integration

### Using Paper Theme
```tsx
import { PaperProvider } from 'react-native-paper';
import { paperLightTheme, paperDarkTheme } from '@/theme';

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <PaperProvider theme={isDark ? paperDarkTheme : paperLightTheme}>
      {/* Your app */}
    </PaperProvider>
  );
}
```

### Paper Components with Custom Theme
```tsx
import { Button, Card, TextInput } from 'react-native-paper';

// Paper components automatically use theme
<Button mode="contained">Primary Button</Button>
<Button mode="outlined">Outlined Button</Button>

<Card>
  <Card.Title title="Card Title" />
  <Card.Content>
    <Text>Card content</Text>
  </Card.Content>
</Card>

<TextInput
  label="Email"
  mode="outlined"
/>
```

## Container Layouts

### Screen Containers
```tsx
import { containers } from '@/constants/styles';

// Basic screen
<View style={containers.screen}>
  {/* Content */}
</View>

// Screen with padding
<View style={containers.screenPadded}>
  {/* Content with default padding */}
</View>

// ScrollView container
<ScrollView contentContainerStyle={containers.scrollContainer}>
  {/* Scrollable content */}
</ScrollView>

// Centered content
<View style={[containers.screen, containers.centered]}>
  {/* Centered content */}
</View>

// Space between items
<View style={containers.spaceBetween}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

## Dark Mode Support

Both light and dark themes are provided:

```tsx
import { lightTheme, darkTheme } from '@/theme';
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

// Use theme colors
<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>
    Adapts to theme
  </Text>
</View>
```

## Best Practices

### 1. Always Use Theme Tokens
```tsx
// ✅ Good
import { PRIMARY } from '@/constants/colors';
backgroundColor: PRIMARY[600]

// ❌ Bad
backgroundColor: '#dc2626'
```

### 2. Use Pre-built Styles
```tsx
// ✅ Good
import { cards, text } from '@/constants/styles';
<View style={cards.base}>
  <Text style={text.h3}>Title</Text>
</View>

// ❌ Bad
<View style={{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  // ... more properties
}}>
```

### 3. Combine Styles Appropriately
```tsx
import { cards, spacingUtils } from '@/constants/styles';

<View style={[cards.base, spacingUtils.mt4]}>
  {/* Card with top margin */}
</View>
```

### 4. Use Semantic Colors
```tsx
// ✅ Good - semantic meaning
import { SEMANTIC } from '@/constants/colors';
color: SEMANTIC.text.secondary

// ❌ Bad - hard to maintain
color: '#6b7280'
```

### 5. Responsive Spacing
```tsx
import { spacing } from '@/theme/theme';

// ✅ Good - uses spacing scale
paddingHorizontal: spacing[4]
marginBottom: spacing[6]

// ❌ Bad - arbitrary values
paddingHorizontal: 15
marginBottom: 23
```

## Animation

```typescript
import { animation } from '@/theme/theme';

animation.duration.fast   // 150ms
animation.duration.normal // 200ms
animation.duration.slow   // 300ms
```

## Icon Sizes

```typescript
import { iconSizes } from '@/theme/theme';

iconSizes.sm   // 16px
iconSizes.base // 20px
iconSizes.md   // 24px
iconSizes.lg   // 32px
iconSizes.xl   // 40px
```

## Complete Import Examples

```tsx
// Single file imports
import { PRIMARY, SEMANTIC, MEDICAL_COLORS } from '@/constants/colors';
import { typography, spacing, shadows } from '@/theme/theme';
import { cards, buttons, text } from '@/constants/styles';

// Or import everything from theme
import {
  PRIMARY,
  typography,
  spacing,
  cards,
  buttons,
  paperLightTheme
} from '@/theme';
```

## Summary

The MedGuard design system provides:
- ✅ Complete color palette matching web app
- ✅ Comprehensive typography scale
- ✅ 4px-based spacing system
- ✅ Pre-built component styles
- ✅ React Native Paper integration
- ✅ Dark mode support
- ✅ Medical-specific color categories
- ✅ Semantic color tokens
- ✅ Type-safe constants

All design tokens are centralized, typed, and easy to maintain across the entire application.

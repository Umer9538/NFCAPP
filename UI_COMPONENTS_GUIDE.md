## UI Components Library - Usage Guide

Complete set of reusable UI components matching the web app's design system exactly.

## Components Overview

### ✅ Button
### ✅ Input
### ✅ Card
### ✅ Badge
### ✅ Avatar
### ✅ Divider
### ✅ Loading

---

## Button Component

Full-featured button with variants, sizes, loading states, and icons.

### Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

### Usage Examples

**Basic Button:**
```tsx
import { Button } from '@/components/ui';

<Button onPress={() => console.log('Pressed')}>
  Click Me
</Button>
```

**Variants:**
```tsx
// Primary (default) - Red background, white text
<Button variant="primary" onPress={handleSubmit}>
  Submit
</Button>

// Secondary - Gray background, black text
<Button variant="secondary" onPress={handleCancel}>
  Cancel
</Button>

// Outline - Transparent with red border
<Button variant="outline" onPress={handleAction}>
  Learn More
</Button>

// Ghost - Transparent background
<Button variant="ghost" onPress={handleAction}>
  Skip
</Button>

// Danger - Red background for destructive actions
<Button variant="danger" onPress={handleDelete}>
  Delete Account
</Button>
```

**Sizes:**
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

**Loading State:**
```tsx
<Button loading={isLoading} onPress={handleLogin}>
  {isLoading ? 'Logging in...' : 'Login'}
</Button>
```

**With Icons:**
```tsx
import { Ionicons } from '@expo/vector-icons';

<Button
  icon={<Ionicons name="add" size={20} color="#fff" />}
  iconPosition="left"
  onPress={handleAdd}
>
  Add Item
</Button>

<Button
  icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
  iconPosition="right"
>
  Continue
</Button>
```

**Disabled:**
```tsx
<Button disabled onPress={handleAction}>
  Not Available
</Button>
```

**Full Width:**
```tsx
<Button fullWidth onPress={handleSubmit}>
  Submit Form
</Button>
```

---

## Input Component

Text input with label, error states, icons, and full accessibility.

### Props

```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}
```

### Usage Examples

**Basic Input:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

**With Validation:**
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  required
/>
```

**Password Input:**
```tsx
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry  // Automatically shows eye icon to toggle visibility
  required
/>
```

**With Icons:**
```tsx
import { Ionicons } from '@expo/vector-icons';

<Input
  label="Search"
  placeholder="Search medications..."
  leftIcon={<Ionicons name="search" size={20} color="#666" />}
  value={search}
  onChangeText={setSearch}
/>

<Input
  label="Password"
  rightIcon={<Ionicons name="lock-closed" size={20} color="#666" />}
  secureTextEntry
/>
```

**With Helper Text:**
```tsx
<Input
  label="Phone Number"
  placeholder="+1 (555) 000-0000"
  helperText="Include country code"
  value={phone}
  onChangeText={setPhone}
/>
```

**Disabled:**
```tsx
<Input
  label="Username"
  value={username}
  editable={false}
/>
```

---

## Card Component

Container card with variants, padding options, and pressable support.

### Props

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'medical';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  pressable?: boolean;
  borderLeftColor?: string;
}
```

### Usage Examples

**Basic Card:**
```tsx
import { Card } from '@/components/ui';

<Card>
  <Text>Card content</Text>
</Card>
```

**Variants:**
```tsx
// Default - Standard shadow
<Card variant="default">
  <Text>Default Card</Text>
</Card>

// Elevated - Larger shadow
<Card variant="elevated">
  <Text>Elevated Card</Text>
</Card>

// Outlined - Border, no shadow
<Card variant="outlined">
  <Text>Outlined Card</Text>
</Card>

// Medical - Left border accent
<Card variant="medical">
  <Text>Medical Information</Text>
</Card>
```

**Padding Options:**
```tsx
<Card padding="none">No Padding</Card>
<Card padding="sm">Small Padding</Card>
<Card padding="md">Medium Padding (default)</Card>
<Card padding="lg">Large Padding</Card>
```

**Pressable Card:**
```tsx
<Card pressable onPress={() => navigation.navigate('Details')}>
  <Text>Tap to view details</Text>
</Card>
```

**With Custom Border:**
```tsx
import { PRIMARY } from '@/constants/colors';

<Card borderLeftColor={PRIMARY[600]}>
  <Text>Emergency Alert</Text>
</Card>
```

**Card Subcomponents:**
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <Text style={text.h4}>Profile Information</Text>
  </CardHeader>

  <CardContent>
    <Text>This is the main content area</Text>
  </CardContent>

  <CardFooter>
    <Button size="sm">Edit</Button>
  </CardFooter>
</Card>
```

---

## Badge Component

Status badges with color variants and sizes.

### Props

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' |
           'info' | 'medical' | 'allergy' | 'medication';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  dot?: boolean;
}
```

### Usage Examples

**Basic Badge:**
```tsx
import { Badge } from '@/components/ui';

<Badge>Default</Badge>
```

**Variants:**
```tsx
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Critical</Badge>
<Badge variant="info">Info</Badge>

// Medical-specific
<Badge variant="medical">Blood Type</Badge>
<Badge variant="allergy">Allergy</Badge>
<Badge variant="medication">Medication</Badge>
```

**Sizes:**
```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium (default)</Badge>
<Badge size="lg">Large</Badge>
```

**With Icon:**
```tsx
import { Ionicons } from '@expo/vector-icons';

<Badge
  variant="success"
  icon={<Ionicons name="checkmark-circle" size={14} color="#166534" />}
>
  Verified
</Badge>
```

**With Dot Indicator:**
```tsx
<Badge variant="success" dot>
  Active
</Badge>
```

---

## Avatar Component

User avatar with initials or image support.

### Props

```typescript
interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  initials?: string;
  imageUri?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}
```

### Usage Examples

**With Initials:**
```tsx
import { Avatar } from '@/components/ui';

<Avatar initials="JD" size="md" />
```

**With Image:**
```tsx
<Avatar
  imageUri="https://example.com/avatar.jpg"
  size="lg"
/>
```

**Different Sizes:**
```tsx
<Avatar initials="JS" size="xs" />
<Avatar initials="JS" size="sm" />
<Avatar initials="JS" size="md" />
<Avatar initials="JS" size="lg" />
<Avatar initials="JS" size="xl" />
<Avatar initials="JS" size="2xl" />
```

**Custom Colors:**
```tsx
import { MEDICAL_COLORS } from '@/constants/colors';

<Avatar
  initials="DR"
  backgroundColor={MEDICAL_COLORS.red.light}
  textColor={MEDICAL_COLORS.red.text}
/>
```

---

## Divider Component

Horizontal or vertical line separator.

### Props

```typescript
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}
```

### Usage Examples

**Horizontal Divider:**
```tsx
import { Divider } from '@/components/ui';

<Divider />
```

**Vertical Divider:**
```tsx
<View style={{ flexDirection: 'row', height: 50 }}>
  <Text>Left</Text>
  <Divider orientation="vertical" />
  <Text>Right</Text>
</View>
```

**Custom Styling:**
```tsx
import { PRIMARY } from '@/constants/colors';

<Divider
  thickness={2}
  color={PRIMARY[600]}
  spacing="lg"
/>
```

---

## Loading Component

Centered loading spinner with optional text.

### Props

```typescript
interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}
```

### Usage Examples

**Basic Loading:**
```tsx
import { Loading } from '@/components/ui';

<Loading />
```

**With Text:**
```tsx
<Loading text="Loading your profile..." />
```

**Full Screen:**
```tsx
<Loading fullScreen text="Please wait..." />
```

**Custom Color:**
```tsx
import { PRIMARY } from '@/constants/colors';

<Loading color={PRIMARY[600]} size="large" />
```

**In Component:**
```tsx
function MyScreen() {
  const { data, isLoading } = useQuery(...);

  if (isLoading) {
    return <Loading fullScreen text="Loading data..." />;
  }

  return <YourContent data={data} />;
}
```

---

## Complete Example

Here's a complete login form using multiple components:

```tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  Button,
  Input,
  Card,
  Badge,
  Avatar,
  Divider,
  Loading,
} from '@/components/ui';
import { containers, text } from '@/constants/styles';
import { Ionicons } from '@expo/vector-icons';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleLogin = async () => {
    setIsLoading(true);
    // Login logic here
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loading fullScreen text="Logging in..." />;
  }

  return (
    <ScrollView contentContainerStyle={containers.scrollContainer}>
      <Card padding="lg" variant="elevated">
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Avatar initials="MG" size="xl" />
          <Text style={[text.h2, { marginTop: 16 }]}>Welcome Back</Text>
          <Badge variant="success" size="sm" style={{ marginTop: 8 }}>
            Secure Login
          </Badge>
        </View>

        <Divider spacing="md" />

        {/* Form */}
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          leftIcon={<Ionicons name="mail" size={20} color="#666" />}
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          required
        />

        {/* Actions */}
        <Button
          fullWidth
          onPress={handleLogin}
          loading={isLoading}
          style={{ marginTop: 8 }}
        >
          Login
        </Button>

        <Button
          variant="ghost"
          fullWidth
          onPress={() => {}}
          style={{ marginTop: 8 }}
        >
          Forgot Password?
        </Button>

        <Divider spacing="lg" />

        <Button
          variant="outline"
          fullWidth
          icon={<Ionicons name="person-add" size={20} color="#dc2626" />}
          onPress={() => {}}
        >
          Create Account
        </Button>
      </Card>
    </ScrollView>
  );
}
```

---

## Best Practices

1. **Always use UI components** instead of raw React Native components
2. **Combine with theme constants** for spacing and colors
3. **Use variants** for consistent styling
4. **Leverage loading states** for better UX
5. **Add proper accessibility** props (already built-in)
6. **Keep custom styling minimal** - use variants first
7. **Use Card for grouping** related content
8. **Show loading** during async operations

## Summary

✅ **7 fully-functional UI components**
✅ **Exact visual match** to web app design
✅ **Complete TypeScript** typing
✅ **All variants** and sizes
✅ **Loading states** built-in
✅ **Accessibility** support
✅ **Pressable/interactive** states
✅ **Icon support** throughout
✅ **Responsive** to theme changes

All components are production-ready and match the web app's design system perfectly!

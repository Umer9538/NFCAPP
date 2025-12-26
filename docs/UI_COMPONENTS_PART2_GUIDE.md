# UI Components Library - Part 2 Guide

Advanced UI components for MedGuard Mobile app, matching web app design exactly.

## New Components

### ✅ Modal
### ✅ Select
### ✅ TextArea
### ✅ LoadingSpinner
### ✅ Toast

---

## Modal Component

Full-featured modal with multiple variants, animations, and backdrop.

### Props

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'center' | 'fullscreen' | 'bottom';
  showCloseButton?: boolean;
  title?: string;
  animationType?: 'slide' | 'fade' | 'none';
  swipeToDismiss?: boolean;
  style?: ViewStyle;
}
```

### Usage Examples

**Center Modal (default):**
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';

const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Confirm Action"
>
  <ModalBody>
    <Text>Are you sure you want to delete this item?</Text>
  </ModalBody>

  <ModalFooter>
    <Button variant="secondary" onPress={() => setVisible(false)}>
      Cancel
    </Button>
    <Button variant="danger" onPress={handleDelete}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

**Fullscreen Modal:**
```tsx
<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  variant="fullscreen"
  title="Edit Profile"
>
  <View style={{ padding: 16 }}>
    <Input label="First Name" />
    <Input label="Last Name" />
    <Input label="Email" />
    <Button fullWidth onPress={handleSave}>
      Save Changes
    </Button>
  </View>
</Modal>
```

**Bottom Sheet:**
```tsx
<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  variant="bottom"
  title="Filter Options"
  swipeToDismiss
>
  <View>
    <Select label="Blood Type" options={bloodTypes} />
    <Select label="Status" options={statusOptions} />
    <Button fullWidth onPress={applyFilters}>
      Apply Filters
    </Button>
  </View>
</Modal>
```

**Without Title/Close Button:**
```tsx
<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  showCloseButton={false}
>
  <View style={{ padding: 24, alignItems: 'center' }}>
    <LoadingSpinner />
    <Text>Processing...</Text>
  </View>
</Modal>
```

---

## Select Component

Dropdown selector with search, multi-select, and custom rendering.

### Props

```typescript
interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number | (string | number)[];
  options: SelectOption[];
  onChange: (value: string | number | (string | number)[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

### Usage Examples

**Basic Select:**
```tsx
import { Select } from '@/components/ui';

const bloodTypes = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'O+', value: 'O+' },
];

<Select
  label="Blood Type"
  placeholder="Select your blood type"
  options={bloodTypes}
  value={bloodType}
  onChange={setBloodType}
  required
/>
```

**With Search:**
```tsx
const medications = [
  { label: 'Aspirin', value: 'aspirin' },
  { label: 'Ibuprofen', value: 'ibuprofen' },
  { label: 'Acetaminophen', value: 'acetaminophen' },
  // ... many more options
];

<Select
  label="Medication"
  placeholder="Search medications..."
  options={medications}
  value={medication}
  onChange={setMedication}
  searchable
/>
```

**Multi-Select:**
```tsx
<Select
  label="Allergies"
  placeholder="Select allergies"
  options={allergyOptions}
  value={selectedAllergies}
  onChange={setSelectedAllergies}
  multiple
  searchable
/>
```

**With Error:**
```tsx
<Select
  label="Emergency Contact Relationship"
  options={relationshipTypes}
  value={relationship}
  onChange={setRelationship}
  error={errors.relationship}
  required
/>
```

**Custom Option Rendering:**
```tsx
<Select
  label="Contact"
  options={contacts}
  value={selectedContact}
  onChange={setSelectedContact}
  renderOption={(option) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar initials={option.label.substring(0, 2)} size="sm" />
      <View style={{ marginLeft: 8 }}>
        <Text>{option.label}</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {option.phoneNumber}
        </Text>
      </View>
    </View>
  )}
/>
```

---

## TextArea Component

Multi-line text input with character count and auto-grow.

### Props

```typescript
interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  maxHeight?: number;
  autoGrow?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  rows?: number;
}
```

### Usage Examples

**Basic TextArea:**
```tsx
import { TextArea } from '@/components/ui';

<TextArea
  label="Additional Notes"
  placeholder="Enter any additional medical information..."
  value={notes}
  onChangeText={setNotes}
  rows={4}
/>
```

**With Character Count:**
```tsx
<TextArea
  label="Medical History"
  placeholder="Describe your medical history..."
  value={history}
  onChangeText={setHistory}
  maxLength={500}
  showCharCount
/>
```

**Auto-Growing TextArea:**
```tsx
<TextArea
  label="Symptoms"
  placeholder="Describe your symptoms..."
  value={symptoms}
  onChangeText={setSymptoms}
  minHeight={100}
  maxHeight={300}
  autoGrow
/>
```

**With Validation:**
```tsx
<TextArea
  label="Reason for Visit"
  placeholder="Please describe..."
  value={reason}
  onChangeText={setReason}
  error={errors.reason}
  required
  maxLength={200}
  showCharCount
/>
```

**With Helper Text:**
```tsx
<TextArea
  label="Special Instructions"
  placeholder="Any special dietary restrictions, mobility issues, etc."
  value={instructions}
  onChangeText={setInstructions}
  helperText="Include any information that emergency responders should know"
  rows={5}
/>
```

---

## LoadingSpinner Component

Multiple spinner variants for different loading scenarios.

### Main LoadingSpinner Props

```typescript
interface LoadingSpinnerProps {
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}
```

### Usage Examples

**Full Screen Loading:**
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner
  visible={isLoading}
  fullScreen
  text="Loading your profile..."
/>
```

**Overlay Loading:**
```tsx
<View>
  {/* Your content */}
  <LoadingSpinner
    visible={isProcessing}
    overlay
    text="Processing..."
  />
</View>
```

**Inline Spinner:**
```tsx
import { InlineSpinner } from '@/components/ui';

<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Text>Loading data</Text>
  <InlineSpinner />
</View>
```

**Button Spinner:**
```tsx
import { ButtonSpinner } from '@/components/ui';

<Button onPress={handleSubmit}>
  {isSubmitting ? (
    <ButtonSpinner color="#fff" />
  ) : (
    'Submit'
  )}
</Button>
```

**Card Spinner:**
```tsx
import { CardSpinner } from '@/components/ui';

<Card>
  {isLoading ? (
    <CardSpinner text="Loading medications..." />
  ) : (
    <MedicationsList data={medications} />
  )}
</Card>
```

**Page Spinner:**
```tsx
import { PageSpinner } from '@/components/ui';

function MyScreen() {
  if (isLoading) {
    return <PageSpinner text="Loading emergency profile..." />;
  }

  return <YourContent />;
}
```

---

## Toast Component

Notification toasts with auto-dismiss and variants.

### Props

```typescript
interface ToastProps {
  visible: boolean;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  position?: 'top' | 'bottom';
  duration?: number;
  onDismiss: () => void;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

### Usage Examples

**Basic Toast:**
```tsx
import { Toast } from '@/components/ui';

const [toastVisible, setToastVisible] = useState(false);

<Toast
  visible={toastVisible}
  message="Profile updated successfully"
  variant="success"
  onDismiss={() => setToastVisible(false)}
/>
```

**Using Toast Hook:**
```tsx
import { useToast, Toast } from '@/components/ui';

function MyScreen() {
  const { toastConfig, hideToast, success, error, warning, info } = useToast();

  const handleSave = async () => {
    try {
      await saveProfile();
      success('Profile saved successfully!');
    } catch (err) {
      error('Failed to save profile');
    }
  };

  return (
    <>
      {/* Your content */}
      <Button onPress={handleSave}>Save</Button>

      {/* Toast display */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        variant={toastConfig.variant}
        duration={toastConfig.duration}
        onDismiss={hideToast}
      />
    </>
  );
}
```

**All Variants:**
```tsx
// Success
success('Profile updated successfully');

// Error
error('Failed to delete item');

// Warning
warning('Your session will expire soon');

// Info
info('New feature available');
```

**With Action Button:**
```tsx
<Toast
  visible={toastVisible}
  message="Item deleted"
  variant="success"
  onDismiss={() => setToastVisible(false)}
  action={{
    label: 'Undo',
    onPress: handleUndo,
  }}
/>
```

**Custom Duration:**
```tsx
<Toast
  visible={toastVisible}
  message="This stays longer"
  variant="info"
  duration={5000}
  onDismiss={() => setToastVisible(false)}
/>
```

**Bottom Position:**
```tsx
<Toast
  visible={toastVisible}
  message="Downloaded successfully"
  variant="success"
  position="bottom"
  onDismiss={() => setToastVisible(false)}
/>
```

**Custom Icon:**
```tsx
import { Ionicons } from '@expo/vector-icons';

<Toast
  visible={toastVisible}
  message="Medication reminder"
  variant="info"
  icon={<Ionicons name="medical" size={20} color="#1e40af" />}
  onDismiss={() => setToastVisible(false)}
/>
```

---

## Complete Examples

### Form with Select and TextArea

```tsx
import { Select, TextArea, Button, Card } from '@/components/ui';

function MedicalHistoryForm() {
  const [condition, setCondition] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Card>
      <Select
        label="Medical Condition"
        placeholder="Select condition"
        options={conditionOptions}
        value={condition}
        onChange={setCondition}
        searchable
        required
      />

      <Select
        label="Severity"
        options={[
          { label: 'Mild', value: 'mild' },
          { label: 'Moderate', value: 'moderate' },
          { label: 'Severe', value: 'severe' },
        ]}
        value={severity}
        onChange={setSeverity}
        required
      />

      <TextArea
        label="Additional Notes"
        placeholder="Provide any additional details..."
        value={notes}
        onChangeText={setNotes}
        maxLength={500}
        showCharCount
        autoGrow
      />

      <Button fullWidth onPress={handleSubmit}>
        Save Information
      </Button>
    </Card>
  );
}
```

### Modal with Form

```tsx
import { Modal, Select, Input, Button, Toast, useToast } from '@/components/ui';

function AddMedicationModal() {
  const [visible, setVisible] = useState(false);
  const [medication, setMedication] = useState('');
  const [frequency, setFrequency] = useState('');
  const { toastConfig, hideToast, success, error } = useToast();

  const handleSave = async () => {
    try {
      await saveMedication({ medication, frequency });
      success('Medication added successfully');
      setVisible(false);
    } catch (err) {
      error('Failed to add medication');
    }
  };

  return (
    <>
      <Button onPress={() => setVisible(true)}>
        Add Medication
      </Button>

      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        variant="bottom"
        title="Add Medication"
      >
        <Select
          label="Medication"
          placeholder="Search medications..."
          options={medicationOptions}
          value={medication}
          onChange={setMedication}
          searchable
          required
        />

        <Select
          label="Frequency"
          options={frequencyOptions}
          value={frequency}
          onChange={setFrequency}
          required
        />

        <Button fullWidth onPress={handleSave}>
          Add Medication
        </Button>
      </Modal>

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        variant={toastConfig.variant}
        onDismiss={hideToast}
      />
    </>
  );
}
```

---

## Best Practices

### Modal
1. Use **center** variant for confirmations
2. Use **fullscreen** for complex forms
3. Use **bottom sheet** for quick selections
4. Always provide a close mechanism
5. Use `swipeToDismiss` for bottom sheets

### Select
1. Enable **searchable** for long lists (>10 items)
2. Use **multiple** for multi-select scenarios
3. Provide clear placeholder text
4. Show validation errors
5. Use custom rendering for complex options

### TextArea
1. Set appropriate **maxLength** for validation
2. Show **character count** for length limits
3. Use **autoGrow** for dynamic content
4. Provide helpful **helperText**
5. Set reasonable min/max heights

### LoadingSpinner
1. Use **fullScreen** for initial page loads
2. Use **overlay** for form submissions
3. Use **inline** for partial updates
4. Provide descriptive loading text
5. Use appropriate variant for context

### Toast
1. Keep messages **short and clear**
2. Use appropriate **variant** for message type
3. Set reasonable **duration** (3-5 seconds)
4. Provide **action** for undo operations
5. Position based on UI context

---

## Summary

✅ **5 advanced UI components** completed
✅ **Modal** with 3 variants and animations
✅ **Select** with search and multi-select
✅ **TextArea** with auto-grow and char count
✅ **LoadingSpinner** with 6 variants
✅ **Toast** with auto-dismiss and actions
✅ **Complete TypeScript** typing
✅ **Animations** throughout
✅ **Accessibility** support
✅ **Production-ready** components

All components match the web app design perfectly and are ready for use!

# QR Code Scanning - Implementation Guide

## Overview

The MedGuard app now supports QR code scanning as an alternative to NFC for accessing emergency profiles. This feature is especially useful for:
- Devices without NFC capability
- When NFC is disabled
- Printed materials (posters, cards, badges)
- Long-range scanning (no need to touch)

## Features Implemented

### 1. QR Scanner Screen (`src/screens/dashboard/QRScannerScreen.tsx`)

Full-screen camera-based QR code scanner with:

#### UI Components
- **Full-screen camera view** - Uses expo-camera for barcode scanning
- **Scanning frame overlay** - Visual guide with animated corners
- **Animated scan line** - Visual feedback during scanning
- **Flashlight toggle** - Enable/disable torch for low light
- **Cancel button** - Close scanner and return
- **Instructions card** - Clear guidance for users
- **Alternative method button** - Quick switch to NFC scanning

#### Permissions Handling
```typescript
// Automatic permission request on mount
const [permission, requestPermission] = useCameraPermissions();

// Permission denied screen with:
- Clear explanation of why permission is needed
- "Grant Permission" button (if can ask again)
- "Open Settings" button (if permission permanently denied)
- "Cancel" button to go back
```

#### QR Code Validation
```typescript
const validateAndParseQRCode = async (data: string) => {
  // 1. Validate URL format
  // 2. Check if it's a MedGuard URL
  // 3. Parse emergency profile ID
  // 4. Extract NFC ID if present
  // Returns: { valid, profileId, nfcId, error }
}
```

**Expected QR Code Formats:**
- `https://medguard.app/emergency/{profileId}`
- `https://medguard.app/emergency/{profileId}?nfc={nfcId}`
- `https://www.medguard.app/emergency/{profileId}`

#### Scanning Flow
1. User taps "Scan QR Code" button
2. Camera permission requested (if needed)
3. Camera opens with scanning frame
4. User positions QR code within frame
5. QR code detected automatically
6. Vibration feedback (100ms)
7. Validation of QR code
8. Navigation to emergency profile or error alert

#### Error Handling
```typescript
// Invalid QR code
Alert.alert(
  'Invalid QR Code',
  'This is not a valid MedGuard QR code.',
  [
    { text: 'Try Again', onPress: () => resetScanner() },
    { text: 'Cancel', onPress: () => goBack() }
  ]
);

// Network error
Alert.alert(
  'Scan Error',
  'Failed to process QR code. Please try again.',
  [/* ... */]
);

// Not a MedGuard URL
Alert.alert(
  'Invalid QR Code',
  'Not a MedGuard URL',
  [/* ... */]
);
```

### 2. QR Code Generation (Already Implemented)

The `QRCodeScreen.tsx` already exists with:
- Full-screen QR code display
- Download to photo library
- Share via native share sheet
- Print functionality
- Emergency profile URL display

### 3. Navigation Integration

#### AppNavigator
```typescript
<Stack.Screen
  name="QRCodeScanner"
  component={QRScannerScreen}
  options={{
    headerShown: false,
    presentation: 'modal',
  }}
/>
```

#### Quick Access from Dashboard
Added to `HomeScreen.tsx` Quick Actions:
```typescript
<Pressable
  style={styles.quickAction}
  onPress={() => navigation.navigate('QRCodeScanner')}
>
  <View style={[styles.quickActionIcon, { backgroundColor: MEDICAL_COLORS.purple[50] }]}>
    <Ionicons name="qr-code" size={28} color={MEDICAL_COLORS.purple[600]} />
  </View>
  <Text style={styles.quickActionText}>Scan QR Code</Text>
</Pressable>
```

#### Access from BraceletScreen
Already has "View QR Code" button that navigates to QRCodeScreen

## Usage Examples

### Example 1: Basic QR Code Scan

```typescript
// User taps "Scan QR Code" on dashboard
navigation.navigate('QRCodeScanner');

// Scanner opens, detects QR code
// Automatically validates and navigates to profile
```

### Example 2: Switch Between NFC and QR

```typescript
// In QRScannerScreen, user can switch to NFC
<Pressable
  style={styles.alternativeButton}
  onPress={() => {
    navigation.goBack();
    navigation.navigate('NFCScan');
  }}
>
  <Ionicons name="phone-portrait" size={20} />
  <Text>Use NFC Instead</Text>
</Pressable>

// In NFCScanScreen, user can switch to QR
// (Similar button can be added)
```

### Example 3: Generate QR Code

```typescript
// From BraceletScreen
<Button onPress={handleViewQR}>
  View QR Code
</Button>

// Navigate to QRCodeScreen
const handleViewQR = () => {
  navigation.navigate('QRCodeGenerator', {
    profileId: bracelet.nfcId,
  });
};
```

## Testing Guide

### Test Scenarios

#### 1. Camera Permissions

**Test Case: First Time Permission**
1. Install fresh app
2. Tap "Scan QR Code"
3. Expected: Permission dialog appears
4. Grant permission
5. Expected: Camera opens successfully

**Test Case: Permission Denied**
1. Deny camera permission
2. Expected: Permission denied screen appears
3. Tap "Grant Permission" (if can ask again)
4. Expected: Permission dialog reappears

**Test Case: Permanently Denied**
1. Deny permission twice (iOS) or check "Don't ask again" (Android)
2. Expected: "Open Settings" button appears
3. Tap button
4. Expected: Opens system settings

#### 2. QR Code Scanning

**Test Case: Valid MedGuard QR Code**
1. Generate QR code from web app or another device
2. Open scanner
3. Point camera at QR code
4. Expected:
   - Vibration feedback
   - "QR Code Scanned" alert
   - Navigation to emergency profile

**Test Case: Invalid QR Code (Not MedGuard)**
1. Scan any other QR code (not MedGuard)
2. Expected:
   - "Invalid QR Code" alert
   - "Not a MedGuard URL" message
   - Options to try again or cancel

**Test Case: Malformed URL**
1. Create QR code with malformed URL
2. Scan it
3. Expected:
   - "Invalid QR Code" alert
   - "Not a valid URL" message

**Test Case: Low Light**
1. Scan in dark environment
2. Tap flashlight button
3. Expected: Camera torch turns on
4. Scan QR code successfully
5. Tap flashlight again
6. Expected: Torch turns off

#### 3. UI/UX Testing

**Test Case: Scanning Frame Alignment**
1. Open scanner
2. Verify:
   - Four corner markers visible
   - Centered on screen
   - Clear instructions below

**Test Case: Cancel Scanning**
1. Open scanner
2. Tap X button (top-left)
3. Expected: Returns to previous screen

**Test Case: Processing State**
1. Scan valid QR code
2. Verify:
   - "Processing..." message appears
   - Instructions change to "Please wait..."
   - User cannot scan another code

#### 4. Edge Cases

**Test Case: Multiple QR Codes in View**
1. Place multiple QR codes in camera view
2. Expected: First detected code is scanned

**Test Case: Damaged QR Code**
1. Create partially damaged QR code
2. Scan it
3. Expected:
   - May fail to scan
   - Or reads incorrectly and shows error

**Test Case: Very Small QR Code**
1. Print very small QR code (< 1cm)
2. Try to scan from normal distance
3. Expected: Difficult to scan
4. Move closer
5. Expected: Scans successfully

**Test Case: Very Large QR Code**
1. Display QR code on large screen
2. Try to scan
3. Expected: Scans successfully from normal distance

### Test with Actual QR Codes

#### Generate Test QR Codes

**Option 1: Using Web App**
```
1. Go to https://medguard.app (or staging URL)
2. Create/login to account
3. Navigate to bracelet management
4. Generate QR code
5. Download or display on screen
```

**Option 2: Using QR Generator Websites**
```
1. Go to qr-code-generator.com or similar
2. Enter URL: https://medguard.app/emergency/test-profile-123
3. Generate QR code
4. Download image
```

**Option 3: Using App's QR Code Screen**
```
1. Open app
2. Navigate to Bracelet screen
3. Tap "View QR Code"
4. Display on another device
5. Scan with first device
```

#### Test Data

Valid test URLs:
```
https://medguard.app/emergency/EMG-2024-001234
https://medguard.app/emergency/test-profile-123
https://www.medguard.app/emergency/user-abc-def-123
https://medguard.app/emergency/profile-456?nfc=NFC-MG-789
```

Invalid test URLs (for error testing):
```
https://google.com (not MedGuard)
https://medguard.app (no profile ID)
https://medguard.app/profile/123 (wrong path)
not-a-url (invalid format)
```

## Implementation Details

### Dependencies

```json
{
  "expo-camera": "~15.0.16",
  "react-native-qrcode-svg": "^6.3.2"
}
```

### Camera Configuration

```typescript
<CameraView
  style={styles.camera}
  facing="back"
  enableTorch={flashEnabled}
  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
  barcodeScannerSettings={{
    barcodeTypes: ['qr'],
  }}
/>
```

**Settings:**
- `facing: "back"` - Uses rear camera
- `enableTorch` - Controlled by flashlight button
- `barcodeTypes: ['qr']` - Only detect QR codes, ignore other barcodes
- Scanning disabled after first scan to prevent duplicates

### Scanning Area

```typescript
const SCAN_AREA_SIZE = width * 0.7; // 70% of screen width

// Corner markers positioned to create square frame
const cornerPositions = {
  topLeft: { top: Y, left: X },
  topRight: { top: Y, right: X },
  bottomLeft: { bottom: Y, left: X },
  bottomRight: { bottom: Y, right: X },
};
```

### Vibration Feedback

```typescript
import { Vibration } from 'react-native';

// On successful scan
Vibration.vibrate(100); // 100ms vibration
```

## Best Practices

### 1. User Guidance

**Do:**
- Show clear instructions ("Position QR code within frame")
- Provide visual frame for alignment
- Give feedback on scan status
- Explain why permission is needed

**Don't:**
- Start scanning without permission
- Allow multiple scans without user action
- Hide error messages

### 2. Error Handling

**Do:**
- Validate QR code format
- Check if URL is MedGuard domain
- Handle network errors gracefully
- Provide clear error messages
- Offer retry option

**Don't:**
- Crash on invalid QR codes
- Show technical error messages to users
- Fail silently

### 3. Performance

**Do:**
- Disable scanning after first detection
- Release camera resources when leaving screen
- Use vibration for immediate feedback
- Process QR codes asynchronously

**Don't:**
- Keep camera running in background
- Scan continuously after detection
- Block UI during processing

### 4. Accessibility

**Do:**
- Provide alternative text for icons
- Use sufficient contrast for overlays
- Support both light and dark environments
- Allow manual URL entry as fallback

**Don't:**
- Rely solely on camera
- Use small touch targets
- Hide important controls

## Troubleshooting

### Common Issues

**Issue: Camera not opening**
**Solution:**
- Check camera permissions in device settings
- Restart app
- Check if another app is using camera

**Issue: QR code not scanning**
**Solution:**
- Ensure QR code is clear and not damaged
- Improve lighting (use flashlight)
- Move closer/farther from QR code
- Clean camera lens

**Issue: "Invalid QR Code" for valid MedGuard QR**
**Solution:**
- Check URL format matches expected pattern
- Verify domain is exact match
- Check for typos in URL
- Ensure QR code was generated correctly

**Issue: Camera permission permanently denied**
**Solution:**
- Guide user to Settings app
- Provide step-by-step instructions
- Offer alternative (manual URL entry)

## Future Enhancements

Potential improvements for future versions:

1. **Batch Scanning**
   - Scan multiple QR codes in sequence
   - Queue profiles for viewing

2. **QR Code History**
   - Save scanned QR codes
   - Quick re-access to recent scans

3. **Auto-Zoom**
   - Automatically zoom for small QR codes
   - Improve scan accuracy

4. **Gallery Scanning**
   - Scan QR codes from photos
   - Import from camera roll

5. **Custom QR Designs**
   - Branded QR codes
   - Logo integration
   - Color customization

6. **Offline Scanning**
   - Cache emergency profiles
   - Scan and view without internet

7. **Multi-Language Support**
   - Localized instructions
   - Support international domains

8. **Analytics**
   - Track scan success rate
   - Monitor common errors
   - Improve UX based on data

## Comparison: QR vs NFC

### QR Code Advantages
✅ Works on all devices (no NFC required)
✅ Long-range scanning (up to several feet)
✅ Can be printed on paper, cards, posters
✅ Easy to share (image file)
✅ No special hardware needed
✅ Works through glass/plastic
✅ Can be displayed on screens

### QR Code Disadvantages
❌ Requires camera
❌ Needs adequate lighting
❌ More steps (open app, point camera)
❌ Can be damaged if printed
❌ Larger physical size needed
❌ May fail with damaged codes

### NFC Advantages
✅ Very fast (instant tap)
✅ Works in any lighting
✅ Small physical tag
✅ More durable
✅ More secure (harder to copy)
✅ Works with locked screen (iOS)

### NFC Disadvantages
❌ Requires NFC-capable device
❌ Must be very close (< 5cm)
❌ Doesn't work through metal
❌ Can't be printed
❌ Harder to share

### Recommendation
**Use both!** They complement each other:
- QR for printed materials, posters, sharing
- NFC for bracelets, cards, quick access
- Offer both options to users
- Let user choose preferred method

## Conclusion

The QR code scanning feature provides a reliable alternative to NFC, ensuring all users can access emergency profiles regardless of device capabilities. The implementation follows best practices for camera usage, permission handling, and user experience.

Key achievements:
- ✅ Full-screen camera with clear UI
- ✅ Robust QR code validation
- ✅ Excellent error handling
- ✅ Smooth user experience
- ✅ Integrated with existing navigation
- ✅ Comprehensive documentation
- ✅ Ready for production use

For support or questions, refer to the main documentation or contact the development team.

# QR Code Scanning - Quick Start Guide

## Quick Navigation to QR Scanner

### From Any Screen

```typescript
import { useNavigation } from '@react-navigation/native';
import type { AppScreenNavigationProp } from '@/navigation/types';

function MyScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();

  const handleScanQR = () => {
    navigation.navigate('QRCodeScanner');
  };

  return (
    <Button onPress={handleScanQR}>
      Scan QR Code
    </Button>
  );
}
```

### From Dashboard/Home Screen

Already implemented! Quick Actions section includes:
```typescript
<Pressable onPress={() => navigation.navigate('QRCodeScanner')}>
  <Ionicons name="qr-code" size={28} color={MEDICAL_COLORS.purple[600]} />
  <Text>Scan QR Code</Text>
</Pressable>
```

## Display QR Code

### Navigate to QR Code Generator

```typescript
navigation.navigate('QRCodeGenerator', {
  profileId: 'your-profile-id',
});
```

### Already Implemented In:

**BraceletScreen** - "View QR Code" button
```typescript
<Button onPress={handleViewQR}>
  View QR Code
</Button>

const handleViewQR = () => {
  navigation.navigate('QRCodeGenerator', {
    profileId: bracelet.nfcId,
  });
};
```

## Generate QR Code Programmatically

### Using react-native-qrcode-svg

```typescript
import QRCode from 'react-native-qrcode-svg';

function MyComponent() {
  const profileUrl = 'https://medguard.app/emergency/profile-123';

  return (
    <QRCode
      value={profileUrl}
      size={200}
      color="#000"
      backgroundColor="#fff"
      logo={require('@/assets/logo.png')}
      logoSize={40}
      logoMargin={2}
      logoBackgroundColor="#fff"
    />
  );
}
```

### With getRef for Download

```typescript
import QRCode from 'react-native-qrcode-svg';

function MyComponent() {
  const qrCodeRef = useRef(null);

  const handleDownload = () => {
    qrCodeRef.current.toDataURL((dataURL) => {
      // dataURL is base64 encoded image
      // Save to file system or share
    });
  };

  return (
    <>
      <QRCode
        value="https://medguard.app/emergency/123"
        size={200}
        getRef={qrCodeRef}
      />
      <Button onPress={handleDownload}>Download</Button>
    </>
  );
}
```

## Parse Scanned QR Code

### Validate MedGuard URL

```typescript
function parseMedGuardQR(data: string): {
  valid: boolean;
  profileId?: string;
  nfcId?: string;
  error?: string;
} {
  try {
    const url = new URL(data);

    // Check domain
    if (!url.hostname.includes('medguard')) {
      return { valid: false, error: 'Not a MedGuard URL' };
    }

    // Parse path: /emergency/{profileId}
    const pathParts = url.pathname.split('/');
    const emergencyIndex = pathParts.findIndex(p => p === 'emergency');

    if (emergencyIndex === -1 || emergencyIndex >= pathParts.length - 1) {
      return { valid: false, error: 'Invalid emergency profile URL' };
    }

    const profileId = pathParts[emergencyIndex + 1];
    const nfcId = url.searchParams.get('nfc') || undefined;

    return { valid: true, profileId, nfcId };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
```

### Usage

```typescript
const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
  const result = parseMedGuardQR(data);

  if (result.valid) {
    navigation.navigate('ViewEmergencyProfile', {
      profileId: result.profileId,
    });
  } else {
    Alert.alert('Invalid QR Code', result.error);
  }
};
```

## Camera Permissions

### Request Permission

```typescript
import { useCameraPermissions } from 'expo-camera';

function MyScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission?.granted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <Button onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return <CameraView /* ... */ />;
}
```

### Check Permission Status

```typescript
if (!permission) {
  // Loading
} else if (permission.granted) {
  // Allowed - show camera
} else if (permission.canAskAgain) {
  // Can request again
  <Button onPress={requestPermission}>Grant</Button>
} else {
  // Permanently denied - send to settings
  <Button onPress={() => Linking.openSettings()}>
    Open Settings
  </Button>
}
```

## Custom Scanner Implementation

### Basic Scanner

```typescript
import { CameraView } from 'expo-camera';
import { useState } from 'react';
import { Vibration } from 'react-native';

function SimpleQRScanner() {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(100);

    Alert.alert('QR Code', data, [
      {
        text: 'Scan Again',
        onPress: () => setScanned(false),
      },
    ]);
  };

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    />
  );
}
```

### With Flashlight

```typescript
function ScannerWithFlash() {
  const [flashEnabled, setFlashEnabled] = useState(false);

  return (
    <>
      <CameraView
        enableTorch={flashEnabled}
        /* ... */
      />

      <Button onPress={() => setFlashEnabled(prev => !prev)}>
        {flashEnabled ? 'Flash Off' : 'Flash On'}
      </Button>
    </>
  );
}
```

### With Scanning Frame

```typescript
function ScannerWithFrame() {
  const SCAN_SIZE = 250;

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} /* ... */ >
        {/* Overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Scanning frame */}
          <View style={{
            width: SCAN_SIZE,
            height: SCAN_SIZE,
            borderWidth: 2,
            borderColor: '#fff',
            borderRadius: 12,
          }} />
        </View>
      </CameraView>
    </View>
  );
}
```

## Test QR Codes

### Generate Test URLs

```typescript
// Valid test URLs
const testURLs = [
  'https://medguard.app/emergency/test-123',
  'https://medguard.app/emergency/EMG-2024-001',
  'https://www.medguard.app/emergency/user-abc?nfc=NFC-001',
];

// Invalid test URLs (for error testing)
const invalidURLs = [
  'https://google.com', // Not MedGuard
  'https://medguard.app', // No profile
  'not-a-url', // Invalid format
];
```

### Generate QR Code Online

1. Go to https://www.qr-code-generator.com/
2. Enter URL: `https://medguard.app/emergency/test-profile-123`
3. Download and scan with app

## Common Patterns

### Pattern 1: Scan Button with Icon

```typescript
<Pressable onPress={() => navigation.navigate('QRCodeScanner')}>
  <Ionicons name="qr-code-outline" size={24} />
  <Text>Scan QR</Text>
</Pressable>
```

### Pattern 2: Scan + Alternative (NFC)

```typescript
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Button onPress={() => navigation.navigate('QRCodeScanner')}>
    Scan QR Code
  </Button>
  <Button
    variant="outline"
    onPress={() => navigation.navigate('NFCScanner')}
  >
    Use NFC
  </Button>
</View>
```

### Pattern 3: QR Code Display Card

```typescript
<Card>
  <Text>Emergency QR Code</Text>
  <QRCode value={profileUrl} size={200} />
  <Button onPress={handleDownload}>Download</Button>
  <Button onPress={handleShare}>Share</Button>
</Card>
```

### Pattern 4: Scan Result Modal

```typescript
function ScanResultModal({ visible, data, onClose }) {
  return (
    <Modal visible={visible}>
      <View>
        <Text>Scanned Profile</Text>
        <Text>{data.name}</Text>
        <Button onPress={onClose}>Close</Button>
      </View>
    </Modal>
  );
}
```

## Styling Tips

### Scanner Overlay Colors

```typescript
const COLORS = {
  frame: '#00D9FF',      // Bright cyan for visibility
  background: 'rgba(0,0,0,0.5)', // Semi-transparent black
  instructions: '#fff',   // White text for contrast
  error: '#FF3B30',      // Red for errors
  success: '#34C759',    // Green for success
};
```

### Responsive Scan Frame

```typescript
const { width, height } = Dimensions.get('window');
const SCAN_SIZE = Math.min(width, height) * 0.7; // 70% of smaller dimension

<View style={{
  width: SCAN_SIZE,
  height: SCAN_SIZE,
  borderWidth: 2,
  borderColor: COLORS.frame,
}} />
```

### Animated Scan Line

```typescript
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function ScanLine() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(SCAN_SIZE, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: SCAN_SIZE - 40,
          height: 2,
          backgroundColor: COLORS.frame,
        },
        animatedStyle,
      ]}
    />
  );
}
```

## Error Handling

### Common Errors

```typescript
// Camera not available
if (!CameraView.isAvailableAsync()) {
  Alert.alert('Error', 'Camera not available on this device');
  return;
}

// Permission denied
if (!permission.granted) {
  Alert.alert(
    'Permission Required',
    'Camera access is needed to scan QR codes'
  );
  return;
}

// Invalid QR code
if (!isValidMedGuardURL(data)) {
  Alert.alert('Invalid QR Code', 'Not a MedGuard emergency profile');
  return;
}

// Network error
try {
  await fetchProfile(profileId);
} catch (error) {
  Alert.alert('Network Error', 'Failed to load profile. Check your connection.');
}
```

## Performance Tips

1. **Disable scanning after detection**
   ```typescript
   onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
   ```

2. **Limit barcode types**
   ```typescript
   barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
   ```

3. **Cleanup camera on unmount**
   ```typescript
   useEffect(() => {
     return () => {
       // Camera automatically cleaned up
     };
   }, []);
   ```

4. **Debounce scans**
   ```typescript
   const [canScan, setCanScan] = useState(true);

   const handleScan = (data) => {
     if (!canScan) return;

     setCanScan(false);
     processQRCode(data);

     setTimeout(() => setCanScan(true), 1000);
   };
   ```

## Cheat Sheet

### Quick Implementation (5 minutes)

```typescript
// 1. Import
import { CameraView, useCameraPermissions } from 'expo-camera';

// 2. Component
function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission?.granted) {
    return <Button onPress={requestPermission}>Allow Camera</Button>;
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      onBarcodeScanned={scanned ? undefined : ({ data }) => {
        setScanned(true);
        Alert.alert('Scanned', data);
      }}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
    />
  );
}

// 3. Navigate
navigation.navigate('QRCodeScanner');
```

## Resources

- [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)
- [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg)
- [QR Code Generator (Testing)](https://www.qr-code-generator.com/)

## Next Steps

1. Test scanner with actual QR codes
2. Customize styling to match app theme
3. Add analytics tracking
4. Implement error reporting
5. Create user documentation

## Support

For questions or issues:
- Check main documentation: `docs/QR_CODE_SCANNING.md`
- Review implementation: `src/screens/dashboard/QRScannerScreen.tsx`
- Contact development team

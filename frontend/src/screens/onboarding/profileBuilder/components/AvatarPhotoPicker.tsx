import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import { uploadFile, UploadStorageUnconfiguredError } from '@/api/upload';
import { UserIcon } from './LucideIcons';

interface Props {
  value: string;
  onChange: (key: string) => void;
}

/**
 * Large circular profile-photo picker rendered at the top of Step 1. Mirrors
 * the web app's avatar + "Add Photo" affordance. Tapping anywhere on the
 * avatar or the label opens the image library, uploads to /api/upload, and
 * stores the returned S3 key on `photoUrl`.
 */
export function AvatarPhotoPicker({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pick = async () => {
    if (busy || disabled) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access in Settings to add a profile photo.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setBusy(true);
    try {
      const uploaded = await uploadFile({
        uri: asset.uri,
        name: asset.fileName || `profile-${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        category: 'profile-photo',
      });
      onChange(uploaded.key);
      setPreviewUri(asset.uri);
    } catch (e) {
      if (e instanceof UploadStorageUnconfiguredError) {
        setDisabled(true);
        Alert.alert(
          'Uploads unavailable',
          "Photo uploads aren't enabled on the server. You can finish without it."
        );
      } else {
        Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const hasPhoto = Boolean(previewUri || value);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={pick} disabled={busy || disabled}>
        <View style={styles.circle}>
          {hasPhoto && previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.image} />
          ) : (
            <UserIcon size={64} color={GRAY[400]} strokeWidth={1.5} />
          )}
          {busy && (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color={PRIMARY[600]} />
            </View>
          )}
        </View>
      </Pressable>
      <Pressable onPress={pick} disabled={busy || disabled} hitSlop={8}>
        <Text style={styles.label}>
          {busy
            ? 'Uploading…'
            : disabled
            ? 'Uploads unavailable'
            : hasPhoto
            ? 'Change Photo'
            : 'Add Photo'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing[3],
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: GRAY[100],
    borderWidth: 2,
    borderColor: GRAY[200],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: PRIMARY[600],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

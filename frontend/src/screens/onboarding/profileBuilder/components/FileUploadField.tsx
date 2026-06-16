import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SEMANTIC, PRIMARY, GRAY, STATUS } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';
import {
  uploadFile,
  type UploadCategory,
  UploadStorageUnconfiguredError,
} from '@/api/upload';

interface Props {
  label: string;
  helperText?: string;
  /** The S3 key currently stored on the profile field (photoUrl / dnrDocumentUrl). */
  value: string;
  onChange: (key: string) => void;
  category: UploadCategory;
  /** Image picker preset — defaults to "any image" (best for DNR document photos). */
  preset?: 'photo' | 'document';
}

/**
 * Tap → open image picker → upload to /api/upload → store the returned `key`
 * on the field. Shows a preview thumbnail when the value is set. Gracefully
 * degrades to "uploads unavailable" if the backend returns 503 (S3 not
 * configured) — that branch is purposely non-blocking; the wizard can be
 * finished without a photo.
 */
export function FileUploadField({
  label,
  helperText,
  value,
  onChange,
  category,
  preset = 'photo',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access in Settings to attach a file.'
      );
      return;
    }

    const aspect = preset === 'photo' ? ([1, 1] as [number, number]) : undefined;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: preset === 'photo',
      aspect,
      quality: preset === 'photo' ? 0.8 : 0.9,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setBusy(true);
    try {
      const uploaded = await uploadFile({
        uri: asset.uri,
        name: asset.fileName || guessName(asset.uri, category),
        mimeType: asset.mimeType || 'image/jpeg',
        category,
      });
      onChange(uploaded.key);
      setPreviewUri(asset.uri);
    } catch (e) {
      if (e instanceof UploadStorageUnconfiguredError) {
        setDisabled(true);
        Alert.alert(
          'Uploads unavailable',
          "File uploads aren't enabled on the server right now. You can finish without it and add this later."
        );
      } else {
        Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    onChange('');
    setPreviewUri(null);
  };

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {helperText && <Text style={styles.helper}>{helperText}</Text>}

      {value ? (
        <View style={styles.attached}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="document-attach" size={24} color={PRIMARY[600]} />
            </View>
          )}
          <View style={styles.attachedMeta}>
            <Text style={styles.attachedTitle} numberOfLines={1}>
              File attached
            </Text>
            <Text style={styles.attachedKey} numberOfLines={1}>
              {value}
            </Text>
          </View>
          <Pressable onPress={clear} hitSlop={8} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={STATUS.error.main} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.button, (busy || disabled) && { opacity: 0.6 }]}
          disabled={busy || disabled}
          onPress={pickAndUpload}
        >
          {busy ? (
            <ActivityIndicator color={PRIMARY[700]} />
          ) : (
            <Ionicons
              name={preset === 'photo' ? 'camera-outline' : 'cloud-upload-outline'}
              size={20}
              color={PRIMARY[700]}
            />
          )}
          <Text style={styles.buttonText}>
            {busy
              ? 'Uploading…'
              : disabled
              ? 'Uploads unavailable'
              : preset === 'photo'
              ? 'Choose a photo'
              : 'Attach a document'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function guessName(uri: string, category: UploadCategory): string {
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  return `${category}-${Date.now()}.${ext}`;
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  helper: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[2],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: PRIMARY[300],
    backgroundColor: PRIMARY[50],
  },
  buttonText: {
    color: PRIMARY[700],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
  attached: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.surface.default,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY[50],
  },
  attachedMeta: {
    flex: 1,
    minWidth: 0,
  },
  attachedTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  attachedKey: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
  },
  removeBtn: {
    padding: spacing[1],
  },
});

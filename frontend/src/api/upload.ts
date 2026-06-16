/**
 * File upload helper.
 *
 * Backend: POST /api/upload (multipart/form-data) — app/api/upload/route.ts.
 * Auth: requires Authorization: Bearer <token>.
 * Backend may respond 503 { error: "File storage not configured" } if S3 isn't
 * wired up — callers should handle that gracefully (we degrade to "skip photo"
 * UX rather than blocking the wizard).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '@/constants';

export type UploadCategory = 'dnr' | 'profile-photo' | 'medical-doc' | 'other';

export interface UploadResult {
  key: string; // store this in the profile (photoUrl / dnrDocumentUrl)
  url: string; // signed URL — useful for immediate preview only
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadInput {
  uri: string; // local file:// or content:// URI from expo-image-picker / document-picker
  name: string;
  mimeType: string;
  category: UploadCategory;
}

export class UploadStorageUnconfiguredError extends Error {
  constructor() {
    super('File storage not configured on the server.');
    this.name = 'UploadStorageUnconfiguredError';
  }
}

/**
 * Upload a single file via multipart/form-data. Uses FormData directly (axios
 * isn't great at RN multipart) and reads the auth token straight from storage.
 */
export async function uploadFile({
  uri,
  name,
  mimeType,
  category,
}: UploadInput): Promise<UploadResult> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) throw new Error('Not authenticated — please log in again.');

  const form = new FormData();
  // React Native quirk: { uri, name, type } object is the file payload.
  form.append('file', {
    uri,
    name,
    type: mimeType,
  } as unknown as Blob);
  form.append('category', category);

  const res = await fetch(`${API_CONFIG.BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — RN sets the multipart boundary itself.
    },
    body: form,
  });

  if (res.status === 503) {
    throw new UploadStorageUnconfiguredError();
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Upload failed (HTTP ${res.status})`);
  }
  return json as UploadResult;
}

/** Delete an uploaded file by its S3 key. */
export async function deleteUpload(key: string): Promise<void> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (!token) throw new Error('Not authenticated.');
  const res = await fetch(`${API_CONFIG.BASE_URL}/api/upload`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Delete failed (HTTP ${res.status})`);
  }
}

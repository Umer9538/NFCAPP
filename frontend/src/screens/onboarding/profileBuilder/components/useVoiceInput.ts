import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface Options {
  /** BCP-47 locale, e.g. "en-US". Defaults to the device locale. */
  lang?: string;
  /** Called with the final transcript when the user stops speaking. */
  onFinalResult?: (transcript: string) => void;
  /** Called with every interim transcript so the UI can show live text. */
  onInterimResult?: (transcript: string) => void;
}

/**
 * `expo-speech-recognition` is a native module; if the app binary was built
 * before the package was added, the import itself throws "Cannot find native
 * module 'ExpoSpeechRecognition'". We lazy-require it inside try/catch so the
 * screen still renders, and surface a friendly alert instead of crashing.
 */
let nativeModule: typeof import('expo-speech-recognition') | null = null;
let loadError: Error | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nativeModule = require('expo-speech-recognition');
} catch (e) {
  loadError = e instanceof Error ? e : new Error(String(e));
}

export function isVoiceInputAvailable(): boolean {
  return nativeModule !== null;
}

/**
 * Wraps `expo-speech-recognition` with a one-shot mic toggle:
 *   tap → request permissions → start → user speaks → final transcript fires.
 *
 * When the native module isn't bundled (e.g. JS-only reload after install),
 * `start()` shows an alert telling the user to rebuild the app, and `listening`
 * stays false.
 */
export function useVoiceInput({
  lang = 'en-US',
  onFinalResult,
  onInterimResult,
}: Options = {}) {
  const [listening, setListening] = useState(false);
  const finalRef = useRef('');

  // Subscribe to events imperatively so the hook still works when the native
  // module is missing (we just no-op the subscriptions).
  useEffect(() => {
    if (!nativeModule) return;
    const { ExpoSpeechRecognitionModule } = nativeModule;
    const subStart = ExpoSpeechRecognitionModule.addListener('start', () => {
      finalRef.current = '';
      setListening(true);
    });
    const subEnd = ExpoSpeechRecognitionModule.addListener('end', () => {
      setListening(false);
      const text = finalRef.current.trim();
      if (text) onFinalResult?.(text);
    });
    const subResult = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
      const transcript = event.results?.[0]?.transcript ?? '';
      if (event.isFinal) {
        finalRef.current = transcript;
      } else {
        onInterimResult?.(transcript);
      }
    });
    const subError = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
      setListening(false);
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      Alert.alert(
        'Voice input error',
        event.message || event.error || 'Could not capture audio. Please try again.'
      );
    });
    return () => {
      subStart.remove();
      subEnd.remove();
      subResult.remove();
      subError.remove();
    };
  }, [onFinalResult, onInterimResult]);

  const start = useCallback(async () => {
    if (!nativeModule) {
      Alert.alert(
        'Voice input not available',
        'The voice-recognition native module is not in this build. Stop the dev server and run:\n\nnpx expo prebuild --clean\nnpx expo run:' +
          (Platform.OS === 'ios' ? 'ios' : 'android') +
          '\n\nthen try again.'
      );
      return;
    }
    try {
      const { ExpoSpeechRecognitionModule } = nativeModule;
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission needed',
          Platform.OS === 'ios'
            ? 'Enable Microphone and Speech Recognition for MedGuard in Settings.'
            : 'Enable Microphone access for MedGuard in Settings.'
        );
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
      });
    } catch (e) {
      setListening(false);
      Alert.alert(
        'Voice input unavailable',
        e instanceof Error ? e.message : 'Voice recognition is not available on this device.'
      );
    }
  }, [lang]);

  const stop = useCallback(() => {
    if (!nativeModule) return;
    try {
      nativeModule.ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignore — stop() throws if not running
    }
    setListening(false);
  }, []);

  return { listening, start, stop, available: nativeModule !== null, loadError };
}

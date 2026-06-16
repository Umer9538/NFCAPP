/**
 * 12-Step Profile Builder — container.
 *
 * Owns:
 *   • the flat formData + arrays state for every step,
 *   • the dynamic step list (steps 7 & 8 hidden until DOB+gender trigger them),
 *   • Next/Back navigation and per-step validation,
 *   • final POST /api/auth/profile-setup submit and post-submit routing.
 *
 * Each Step component is a pure renderer that receives `data`, `arrays`, an
 * `update` setter, an `updateArray` setter, and the computed `age`.
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
  UIManager,
  findNodeHandle,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, selectIsAuthenticated, selectUser } from '@/store/authStore';
import type { AuthStore } from '@/types/auth';
import { authApi } from '@/api/auth';
import { api } from '@/api/client';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { ProgressHeader } from './components/ProgressHeader';
import { MedicalBadgeIcon } from './components/MedicalBadgeIcon';
import { PillIcon } from './components/PillIcon';
import { HeartIcon } from './components/HeartIcon';
import {
  ActivityIcon,
  BabyIcon,
  BrainIcon,
  FileTextIcon,
  HomeIcon,
  MessageSquareIcon,
  UserIcon,
  UsersIcon,
} from './components/LucideIcons';
import { ValidationErrorModal } from './components/ValidationErrorModal';
import { useOnboardingDraft } from './useOnboardingDraft';
import { emptyArrays, emptyFormData, buildPayload } from './buildPayload';
import { calculateAge, showPediatricTab, showPregnancyTab, validateAgeRules } from './ageRules';
import type {
  ProfileArrays,
  ProfileFormData,
  StepDescriptor,
  ValidatorFn,
} from './types';

import { Step1BasicInfo, validateStep1 } from './steps/Step1BasicInfo';
import { Step2Allergies, validateStep2 } from './steps/Step2Allergies';
import { Step3Medications, validateStep3 } from './steps/Step3Medications';
import { Step4Conditions, validateStep4 } from './steps/Step4Conditions';
import { Step5EmergencyInstructions, validateStep5 } from './steps/Step5EmergencyInstructions';
import { Step6MentalHealth, validateStep6 } from './steps/Step6MentalHealth';
import { Step7Pregnancy, validateStep7 } from './steps/Step7Pregnancy';
import { Step8Pediatric, validateStep8 } from './steps/Step8Pediatric';
import { Step9HomeSafety, validateStep9 } from './steps/Step9HomeSafety';
import { Step10Legal, validateStep10 } from './steps/Step10Legal';
import { Step11Contacts, validateStep11 } from './steps/Step11Contacts';
import { Step12Notes } from './steps/Step12Notes';

interface StepEntry extends StepDescriptor {
  Component: React.ComponentType<{
    data: ProfileFormData;
    arrays: ProfileArrays;
    update: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
    updateArray: <K extends keyof ProfileArrays>(field: K, value: ProfileArrays[K]) => void;
    age: number | null;
    attemptedSubmit?: boolean;
  }>;
  validate?: ValidatorFn;
}

const ALL_STEPS: StepEntry[] = [
  {
    id: 1,
    key: 'basic',
    title: 'Basic Info',
    description: 'Personal information',
    iconNode: <UserIcon size={24} color="#dc2626" />,
    Component: Step1BasicInfo,
    validate: validateStep1,
  },
  {
    id: 2,
    key: 'allergies',
    title: 'Allergies',
    description: 'Allergy information',
    iconNode: <MedicalBadgeIcon size={26} />,
    Component: Step2Allergies,
    validate: validateStep2,
  },
  {
    id: 3,
    key: 'medications',
    title: 'Medications',
    description: 'Current medications',
    iconNode: <PillIcon size={26} color="#dc2626" />,
    Component: Step3Medications,
    validate: validateStep3,
  },
  {
    id: 4,
    key: 'conditions',
    title: 'Conditions',
    description: 'Medical conditions',
    iconNode: <HeartIcon size={26} color="#dc2626" />,
    Component: Step4Conditions,
    validate: validateStep4,
  },
  {
    id: 5,
    key: 'instructions',
    title: 'Emergency Instructions',
    description: 'First responder info',
    iconNode: <ActivityIcon size={24} color="#dc2626" />,
    Component: Step5EmergencyInstructions,
    validate: validateStep5,
  },
  {
    id: 6,
    key: 'mental',
    title: 'Mental Health',
    description: 'Mental health info',
    iconNode: <BrainIcon size={24} color="#a855f7" />,
    Component: Step6MentalHealth,
    validate: validateStep6,
  },
  {
    id: 7,
    key: 'pregnancy',
    title: 'Pregnancy',
    description: 'Pregnancy info',
    iconNode: <BabyIcon size={24} color="#dc2626" />,
    conditional: 'pregnancy',
    Component: Step7Pregnancy,
    validate: validateStep7,
  },
  {
    id: 8,
    key: 'pediatric',
    title: 'Pediatric',
    description: 'Child info',
    iconNode: <BabyIcon size={24} color="#dc2626" />,
    conditional: 'pediatric',
    Component: Step8Pediatric,
    validate: validateStep8,
  },
  {
    id: 9,
    key: 'home',
    title: 'Home Safety',
    description: 'Home & safety info',
    iconNode: <HomeIcon size={24} color="#dc2626" />,
    Component: Step9HomeSafety,
    validate: validateStep9,
  },
  {
    id: 10,
    key: 'legal',
    title: 'Legal',
    description: 'Legal directives',
    iconNode: <FileTextIcon size={24} color="#dc2626" />,
    Component: Step10Legal,
    validate: validateStep10,
  },
  {
    id: 11,
    key: 'contacts',
    title: 'Contacts',
    description: 'Emergency contacts',
    iconNode: <UsersIcon size={24} color="#dc2626" />,
    Component: Step11Contacts,
    validate: validateStep11,
  },
  {
    id: 12,
    key: 'notes',
    title: 'Notes',
    description: 'Additional notes',
    iconNode: <MessageSquareIcon size={24} color="#dc2626" />,
    Component: Step12Notes,
  },
];

export default function ProfileBuilderContainer() {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((s: AuthStore) => s.setUser);
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const userId = user?.id || '';

  const [data, setData] = useState<ProfileFormData>(() => emptyFormData());
  const [arrays, setArrays] = useState<ProfileArrays>(() => emptyArrays());
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [keyboardPad, setKeyboardPad] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollYRef.current = e.nativeEvent.contentOffset.y;
    },
    []
  );

  // On keyboard show: scroll the currently focused TextInput above the keyboard.
  //
  // We deliberately avoid measuring the ScrollView's height to compute the
  // visible region. With Expo's edge-to-edge mode + new architecture,
  // adjustResize doesn't actually shrink the activity window on Android, so
  // the ScrollView reports its full pre-keyboard height and the focused input
  // ends up "in view" mathematically but actually behind the keyboard.
  //
  // Instead we use the Keyboard event's own `endCoordinates.screenY` (the
  // absolute top of the keyboard in screen coords). With edge-to-edge enabled
  // the app window starts at screen Y = 0, so `measureInWindow` Y is directly
  // comparable to it.
  useEffect(() => {
    const measureAndScroll = (kbScreenTop: number) => {
      const focused: any =
        (RNTextInput.State as any).currentlyFocusedInput?.() ??
        (RNTextInput.State as any).currentlyFocusedField?.();
      const scrollView = scrollRef.current;
      if (!focused || !scrollView) return;

      const margin = 32; // breathing room above the keyboard / footer

      const doScroll = (visibleBottom: number, inputY: number, inputH: number) => {
        const inputBottom = inputY + inputH;
        const desiredBottom = visibleBottom - margin;
        if (inputBottom <= desiredBottom) return;
        const delta = inputBottom - desiredBottom;
        scrollView.scrollTo({
          y: Math.max(0, scrollYRef.current + delta),
          animated: true,
        });
      };

      const measureInput = (cb: (y: number, h: number) => void) => {
        if (typeof focused === 'object' && typeof focused.measureInWindow === 'function') {
          focused.measureInWindow((_x: number, y: number, _w: number, h: number) =>
            cb(y, h)
          );
          return;
        }
        const inputHandle =
          typeof focused === 'number' ? focused : findNodeHandle(focused);
        if (!inputHandle) return;
        UIManager.measure(inputHandle, (_x, _y, _w, h, _pageX, pageY) => cb(pageY, h));
      };

      // Take the min of (ScrollView's measured visible bottom, keyboard top).
      // If KeyboardAvoidingView has shrunk the ScrollView above the keyboard,
      // we want to land just inside the ScrollView (so the input stays above
      // the footer). If KAV hasn't propagated yet, we fall back to the
      // keyboard's screen top so the input is at least above the keyboard.
      (scrollView as any).measureInWindow?.(
        (_sx: number, sy: number, _sw: number, sh: number) => {
          const scrollBottom = sy + sh;
          const visibleBottom = Math.min(scrollBottom, kbScreenTop);
          measureInput((iy, ih) => doScroll(visibleBottom, iy, ih));
        }
      );
    };

    const onShow = (e: {
      endCoordinates: { height: number; screenY?: number };
    }) => {
      const kbHeight = e.endCoordinates.height;
      setKeyboardPad(kbHeight);

      // Prefer the event's own screenY (most accurate). Fall back to deriving
      // it from the physical screen height if the event doesn't include it.
      const kbScreenTop =
        typeof e.endCoordinates.screenY === 'number'
          ? e.endCoordinates.screenY
          : Dimensions.get('screen').height - kbHeight;

      // iOS' keyboardWillShow fires before the keyboard is shown, so we can
      // scroll right away. Android's keyboardDidShow fires after the keyboard
      // is up, but the KeyboardAvoidingView's padding animation may still be
      // in flight — wait a beat for layout to settle so the ScrollView's
      // measured bottom is accurate.
      const delay = Platform.OS === 'ios' ? 0 : 220;
      setTimeout(() => measureAndScroll(kbScreenTop), delay);
    };
    const onHide = () => setKeyboardPad(0);

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const normalizeErrors = (
    out: string | string[] | null | undefined
  ): string[] => {
    if (!out) return [];
    return Array.isArray(out) ? out : [out];
  };

  // Draft persistence — mirrors the web's useOnboardingDraft. Restores the
  // last in-flight wizard on mount, debounce-saves changes locally, and syncs
  // to the server on each step change. Cleared after a successful submit.
  const draft = useOnboardingDraft({
    draftType: 'guardian',
    routeContext: '/auth/profile-setup',
  });

  // One-shot restore: when the draft hook surfaces a saved snapshot, hydrate
  // our local state. Guarded by a flag so subsequent edits aren't overwritten.
  const hydratedRef = React.useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!draft.loaded || !draft.restored) return;
    const snap = draft.restored;
    const savedData = (snap.stepData?.data as ProfileFormData | undefined) || null;
    const savedArrays = (snap.stepData?.arrays as ProfileArrays | undefined) || null;
    if (savedData) setData({ ...emptyFormData(), ...savedData });
    if (savedArrays) setArrays({ ...emptyArrays(), ...savedArrays });
    if (typeof snap.currentStep === 'number' && snap.currentStep > 0) {
      // Web stores currentStep as 1-based id; our state is 0-based array index.
      setStepIndex(Math.max(0, snap.currentStep - 1));
    }
    hydratedRef.current = true;
  }, [draft.loaded, draft.restored]);

  // Local-cache write on every edit (debounced inside the hook).
  useEffect(() => {
    if (!hydratedRef.current && draft.loaded === false) return;
    draft.trackChange({ data, arrays }, stepIndex + 1);
  }, [data, arrays, stepIndex, draft]);

  const age = useMemo(() => calculateAge(data.dateOfBirth), [data.dateOfBirth]);

  // Filter the step list against current age/gender so the user never sees a
  // pregnancy tab they don't qualify for, etc.
  const visibleSteps = useMemo<StepEntry[]>(() => {
    const preg = showPregnancyTab(data.gender, age);
    const ped = showPediatricTab(age);
    // Temporary: surface what the filter sees so we can diagnose visible-step
    // counts that disagree with the web. Remove once parity is confirmed.
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[ProfileBuilder] visibleSteps inputs', {
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        age,
        showPregnancyTab: preg,
        showPediatricTab: ped,
      });
    }
    return ALL_STEPS.filter((s) => {
      if (s.conditional === 'pregnancy') return preg;
      if (s.conditional === 'pediatric') return ped;
      return true;
    });
  }, [data.gender, data.dateOfBirth, age]);

  // If the visible-step list shrinks under our current index (e.g. user changed
  // DOB from child→adult), clamp.
  const safeIndex = Math.min(stepIndex, visibleSteps.length - 1);
  const current = visibleSteps[safeIndex];

  const update = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateArray = useCallback(
    <K extends keyof ProfileArrays>(field: K, value: ProfileArrays[K]) => {
      setArrays((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBack = () => {
    if (safeIndex > 0) {
      const next = safeIndex - 1;
      setStepIndex(next);
      setAttemptedSubmit(false);
      void draft.syncToServer({ data, arrays }, next + 1);
    }
  };

  const handleNext = () => {
    if (current.validate) {
      const errs = normalizeErrors(current.validate(data, arrays));
      if (errs.length > 0) {
        setValidationErrors(errs);
        setShowValidationModal(true);
        setAttemptedSubmit(true);
        return;
      }
    }
    setAttemptedSubmit(false);
    if (safeIndex < visibleSteps.length - 1) {
      const next = safeIndex + 1;
      setStepIndex(next);
      void draft.syncToServer({ data, arrays }, next + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert(
        'Session expired',
        'Your session has expired. Please log in again to finish setting up your profile.'
      );
      return;
    }

    // Run every step's validator once before submitting so the user lands on
    // the bad step instead of seeing a backend 400.
    for (let i = 0; i < visibleSteps.length; i++) {
      const v = visibleSteps[i].validate;
      if (!v) continue;
      const errs = normalizeErrors(v(data, arrays));
      if (errs.length > 0) {
        setStepIndex(i);
        setAttemptedSubmit(true);
        setValidationErrors(errs);
        setShowValidationModal(true);
        return;
      }
    }
    const ageErr = validateAgeRules(data);
    if (ageErr) {
      setValidationErrors([ageErr]);
      setShowValidationModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(userId, data, arrays);
      const response = await api.post<{ success?: boolean; message?: string; error?: string }>(
        '/api/auth/profile-setup',
        payload
      );

      if (!response?.success) {
        throw new Error(response?.error || response?.message || 'Profile setup failed');
      }

      // Successful submit — drop the draft so reopening the app doesn't try
      // to restore a stale half-finished wizard.
      await draft.clear();

      if (isAuthenticated) {
        // RootNavigator watches user.profileComplete — refresh and let it swap
        // us over to the dashboard automatically.
        const updatedUser = await authApi.getMe();
        setUser(updatedUser);
      } else {
        Alert.alert(
          'Profile complete',
          'Your profile is set up. Please log in to continue.',
          [
            {
              text: 'Log in',
              onPress: () =>
                navigation.dispatch(
                  CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
                ),
            },
          ]
        );
      }
    } catch (e: any) {
      const msg = e?.message || 'We could not save your profile. Please try again.';
      Alert.alert('Unable to save profile', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!current) return null;

  // While the hook is fetching a previously-saved draft from the server, show
  // a lightweight splash rather than a flash of the empty form (which would
  // then jump back to the saved values once hydrate completes).
  if (draft.loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Restoring your progress…</Text>
      </SafeAreaView>
    );
  }

  const StepComponent = current.Component;
  const isLast = safeIndex === visibleSteps.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressHeader
        currentIndex={safeIndex}
        totalSteps={visibleSteps.length}
        title={current.title}
        description={current.description}
        icon={current.icon as any}
        iconNode={current.iconNode}
        saving={draft.syncing}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            keyboardPad > 0 && { paddingBottom: spacing[8] + keyboardPad },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <StepComponent
            data={data}
            arrays={arrays}
            update={update}
            updateArray={updateArray}
            age={age}
            attemptedSubmit={attemptedSubmit}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            style={[styles.prevBtn, safeIndex === 0 && styles.prevBtnDisabled]}
            onPress={handleBack}
            disabled={safeIndex === 0 || submitting}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={safeIndex === 0 ? GRAY[400] : PRIMARY[600]}
            />
            <Text
              style={[
                styles.prevBtnText,
                safeIndex === 0 && styles.prevBtnTextDisabled,
              ]}
              numberOfLines={1}
            >
              Previous
            </Text>
          </Pressable>
          <Text style={styles.stepCounter} numberOfLines={1}>
            Step {safeIndex + 1} of {visibleSteps.length}
          </Text>
          <Pressable
            style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.nextBtnText} numberOfLines={1}>
                  {isLast ? 'Finish' : 'Next'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </View>
        <ValidationErrorModal
          visible={showValidationModal}
          errors={validationErrors}
          onDismiss={() => setShowValidationModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.secondary,
  },
  flex: { flex: 1 },
  scroll: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: SEMANTIC.surface.default,
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: PRIMARY[200],
    backgroundColor: PRIMARY[50],
    flexShrink: 1,
    minWidth: 0,
  },
  prevBtnDisabled: {
    opacity: 0.4,
  },
  prevBtnText: {
    color: PRIMARY[600],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
  prevBtnTextDisabled: {
    color: GRAY[400],
  },
  stepCounter: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    fontWeight: typography.fontWeight.medium,
    flexShrink: 1,
    textAlign: 'center',
    minWidth: 0,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[600],
    flexShrink: 1,
    minWidth: 0,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: {
    marginTop: spacing[3],
    color: SEMANTIC.text.secondary,
  },
});

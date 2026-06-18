/**
 * Settings — mirrors the web's /dashboard/settings page 1:1 with four
 * internal tabs: Profile, Security, Notifications, Privacy & Data.
 *
 * Same backend endpoints the web uses:
 *   GET/PUT  /api/settings/profile
 *   POST     /api/settings/password
 *   GET/PUT  /api/settings/security
 *   GET/PUT  /api/settings/notifications
 *   GET      /api/settings/export
 *   DELETE   /api/auth/account
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  ShieldAlert,
  Smartphone,
  Mail,
  MessageSquare,
  Download,
  Trash2,
  AlertCircle,
  ChevronDown,
  PlayCircle,
  CreditCard,
  Crown,
} from 'lucide-react-native';
import { Linking } from 'react-native';

import { subscriptionApi } from '@/api/subscription';

import { PRIMARY, GRAY } from '@/constants/colors';
import { settingsApi } from '@/api/settings';
import type {
  NotificationSettings,
  ProfileUpdateInput,
} from '@/types/settings';

type TabKey =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'subscription'
  | 'privacy';

const TABS: { key: TabKey; label: string; Icon: React.ComponentType<any> }[] = [
  { key: 'profile', label: 'Profile', Icon: User },
  { key: 'security', label: 'Security', Icon: Lock },
  { key: 'notifications', label: 'Notifications', Icon: Bell },
  { key: 'subscription', label: 'Subscription', Icon: CreditCard },
  { key: 'privacy', label: 'Privacy & Data', Icon: Shield },
];

export default function SettingsScreen() {
  const [active, setActive] = useState<TabKey>('profile');
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>
            Manage your account settings and preferences.
          </Text>
        </View>

        <View style={styles.tabsCard}>
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <Pressable
                key={t.key}
                onPress={() => setActive(t.key)}
                style={[styles.tabRow, isActive && styles.tabRowActive]}
              >
                <t.Icon size={16} color={isActive ? PRIMARY[600] : GRAY[600]} />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {active === 'profile' && <ProfileTab />}
        {active === 'security' && <SecurityTab />}
        {active === 'notifications' && <NotificationsTab />}
        {active === 'subscription' && <SubscriptionTab />}
        {active === 'privacy' && <PrivacyTab />}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PROFILE
// ──────────────────────────────────────────────────────────────────────────

function ProfileTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsApi.getProfile,
  });

  const [form, setForm] = useState<ProfileUpdateInput>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      username: profile.username,
      phone: profile.phone,
    });
  }, [profile]);

  const dirty = useMemo(() => {
    if (!profile) return false;
    return (
      form.firstName !== profile.firstName ||
      form.lastName !== profile.lastName ||
      form.email !== profile.email ||
      form.username !== profile.username ||
      form.phone !== profile.phone
    );
  }, [form, profile]);

  const saveMut = useMutation({
    mutationFn: (body: ProfileUpdateInput) => settingsApi.updateProfile(body),
    onSuccess: () => {
      setResult('Profile updated successfully.');
      qc.invalidateQueries({ queryKey: ['settings', 'profile'] });
    },
    onError: (e: any) =>
      setError(e?.response?.data?.error || e?.message || 'Update failed'),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingBlock}>
        <ActivityIndicator color={PRIMARY[600]} />
      </View>
    );
  }

  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const splitName = (full: string) => {
    const parts = full.trim().split(' ');
    return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Information</Text>

        <View style={styles.profilePicCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {fullName ? initials(fullName) : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profilePicTitle}>Profile Picture</Text>
            <Text style={styles.profilePicHelp}>Upload from this device.</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Upload not implemented',
                    'Photo upload will be enabled in a future build.',
                  )
                }
                style={styles.outlineBtn}
              >
                <Text style={styles.outlineBtnText}>Upload from File</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color={PRIMARY[600]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!!result && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{result}</Text>
          </View>
        )}

        <View style={styles.row2}>
          <Field label="Full Name" optional style={{ flex: 1 }}>
            <TextInput
              value={`${form.firstName ?? ''}${
                form.lastName ? ` ${form.lastName}` : ''
              }`}
              onChangeText={(t) => setForm({ ...form, ...splitName(t) })}
              placeholder="Full name"
              placeholderTextColor={GRAY[400]}
              style={styles.input}
            />
          </Field>
          <Field label="Nickname" optional style={{ flex: 1 }}>
            <TextInput
              placeholder="What people call you"
              placeholderTextColor={GRAY[400]}
              style={styles.input}
            />
          </Field>
        </View>

        <View style={styles.row2}>
          <Field label="Username" optional style={{ flex: 1 }}>
            <TextInput
              value={form.username ?? ''}
              onChangeText={(t) => setForm({ ...form, username: t })}
              editable={false}
              style={[styles.input, styles.inputReadOnly]}
            />
          </Field>
          <Field label="Email" optional style={{ flex: 1 }}>
            <TextInput
              value={form.email ?? ''}
              onChangeText={(t) => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </Field>
        </View>

        <Field label="Phone" optional>
          <TextInput
            value={form.phone ?? ''}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            keyboardType="phone-pad"
            placeholder="+1 (604) 555-0187"
            placeholderTextColor={GRAY[400]}
            style={styles.input}
          />
        </Field>

        <View style={{ alignItems: 'flex-end', marginTop: 4 }}>
          <Pressable
            disabled={!dirty || saveMut.isPending}
            onPress={() => {
              setError(null);
              setResult(null);
              saveMut.mutate(form);
            }}
            style={[
              styles.primaryBtn,
              (!dirty || saveMut.isPending) && styles.primaryBtnDisabled,
            ]}
          >
            {saveMut.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Save size={14} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>
              {dirty ? 'Save Changes' : 'No Changes'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SECURITY
// ──────────────────────────────────────────────────────────────────────────

function SecurityTab() {
  const { data: sec } = useQuery({
    queryKey: ['settings', 'security'],
    queryFn: settingsApi.getSecuritySettings,
  });
  // Note: GET /api/auth/sessions isn't live on the backend yet — skipping the
  // call entirely so it doesn't trigger a LogBox-visible interceptor error.
  const sessions: any[] = [];

  const [showChangePassword, setShowChangePassword] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.bigSectionTitle}>Security Settings</Text>

      <SettingRow
        title="Change Password"
        hint="Update your password regularly to keep your account secure."
      >
        <Pressable
          onPress={() => setShowChangePassword((s) => !s)}
          style={styles.outlineBtn}
        >
          <Text style={styles.outlineBtnText}>Change Password</Text>
        </Pressable>
      </SettingRow>

      {showChangePassword && (
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      )}

      <SettingRow
        title="Two-Factor Authentication"
        hint="Add an extra layer of security to your account."
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: sec?.twoFactorEnabled ? '#dcfce7' : '#fef9c3',
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: sec?.twoFactorEnabled ? '#15803d' : '#854d0e',
                },
              ]}
            >
              {sec?.twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              Alert.alert(
                '2FA',
                'Two-factor authentication setup is launched from the web for now.',
              )
            }
            style={styles.outlineBtn}
          >
            <Text style={styles.outlineBtnText}>
              {sec?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
            </Text>
          </Pressable>
        </View>
      </SettingRow>

      <View style={styles.warningCard}>
        <Text style={styles.cardTitle}>Emergency PIN Protection</Text>
        <Text style={styles.cardSubtitle}>
          When enabled, emergency disclosure for teen/adult/senior events
          requires your PIN before protected details are revealed.
        </Text>
        <ToggleRow
          label="Enable account emergency PIN"
          value={false}
          onValueChange={() => {}}
        />
        <Pressable
          disabled
          style={[
            styles.primaryBtn,
            styles.primaryBtnDisabled,
            { alignSelf: 'flex-end' },
          ]}
        >
          <Save size={14} color="#fff" />
          <Text style={styles.primaryBtnText}>Save Emergency PIN Settings</Text>
        </Pressable>
      </View>

      <SettingRow
        title="Active Sessions"
        hint={`You have ${sessions?.length ?? 0} active session(s).`}
      >
        <Text style={styles.helperText}>
          Session management features coming soon.
        </Text>
      </SettingRow>

      <View style={styles.drillCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.drillIconTile}>
            <ShieldAlert size={18} color="#9a3412" />
          </View>
          <Text style={styles.cardTitle}>Emergency Drill Mode</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Practice your emergency flow without triggering real alerts. SMS
          messages are prefixed with [TEST DRILL].
        </Text>
        <Text style={styles.helperText}>Select a drill type to practice</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[styles.selectInput, { flex: 1 }]}>
            <Text style={styles.selectText}>Bracelet Scan</Text>
            <ChevronDown size={14} color={GRAY[500]} />
          </View>
          <Pressable
            onPress={() =>
              Alert.alert('Drill', 'Drill mode is launched from the web for now.')
            }
            style={styles.primaryBtn}
          >
            <PlayCircle size={14} color="#fff" />
            <Text style={styles.primaryBtnText}>Start Drill</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      settingsApi.changePassword({ oldPassword, newPassword, confirmPassword }),
    onSuccess: () => {
      Alert.alert('Password changed', 'Your password was updated.');
      onClose();
    },
    onError: (e: any) =>
      setError(e?.response?.data?.error || e?.message || 'Update failed'),
  });

  const submit = () => {
    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError(null);
    mut.mutate();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Change Password</Text>
      {!!error && (
        <View style={styles.errorBox}>
          <AlertCircle size={14} color={PRIMARY[600]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <Field label="Current Password" required>
        <TextInput
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          style={styles.input}
        />
      </Field>
      <Field label="New Password" required>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
        />
      </Field>
      <Field label="Confirm New Password" required>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
      </Field>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={mut.isPending}
          style={[styles.primaryBtn, mut.isPending && { opacity: 0.6 }]}
        >
          {mut.isPending && <ActivityIndicator size="small" color="#fff" />}
          <Text style={styles.primaryBtnText}>Update Password</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────────────

function NotificationsTab() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: settingsApi.getNotificationSettings,
  });
  const [local, setLocal] = useState<NotificationSettings | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setLocal(settings);
  }, [settings]);

  const dirty = useMemo(() => {
    if (!settings || !local) return false;
    return JSON.stringify(settings) !== JSON.stringify(local);
  }, [settings, local]);

  const saveMut = useMutation({
    mutationFn: (body: Partial<NotificationSettings>) =>
      settingsApi.updateNotificationSettings(body),
    onSuccess: () => {
      setResult('Notification preferences saved.');
      qc.invalidateQueries({ queryKey: ['settings', 'notifications'] });
    },
    onError: () => Alert.alert('Couldn’t save', 'Please try again later.'),
  });

  if (isLoading || !local) {
    return (
      <View style={styles.loadingBlock}>
        <ActivityIndicator color={PRIMARY[600]} />
      </View>
    );
  }

  const set = (k: keyof NotificationSettings, v: boolean) =>
    setLocal({ ...local, [k]: v });

  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.bigSectionTitle}>Notification Preferences</Text>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Notification Channels</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#dbeafe' }]}>
            <Text style={[styles.statusBadgeText, { color: '#1d4ed8' }]}>
              Telnyx Compliant
            </Text>
          </View>
        </View>

        <ChannelRow
          tint="blue"
          Icon={MessageSquare}
          title="SMS Notifications"
          subtitle="Receive security codes and safety notifications via SMS"
          extra="Message and data rates may apply. Reply STOP to opt out."
          value={local.smsNotifications}
          onValueChange={(v) => set('smsNotifications', v)}
        />
        <ChannelRow
          tint="purple"
          Icon={Smartphone}
          title="Push Notifications"
          subtitle="Receive emergency alerts and account updates on your device"
          extra="You can change this anytime in your device settings"
          value={local.pushNotifications}
          onValueChange={(v) => set('pushNotifications', v)}
        />
        <ChannelRow
          tint="green"
          Icon={Mail}
          title="Email Notifications"
          subtitle="Receive important updates and alerts via email"
          value={local.emailNotifications}
          onValueChange={(v) => set('emailNotifications', v)}
        />

        <View style={styles.cardFooter}>
          {!!result && <Text style={styles.successText}>{result}</Text>}
          <Pressable
            onPress={() => {
              setResult(null);
              saveMut.mutate(local);
            }}
            disabled={!dirty || saveMut.isPending}
            style={[
              styles.primaryBtn,
              (!dirty || saveMut.isPending) && styles.primaryBtnDisabled,
            ]}
          >
            {saveMut.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Save size={14} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>
              {dirty ? 'Save Changes' : 'No Changes'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Types</Text>
        <ToggleRow
          label="Profile Access Alerts"
          help="Receive notifications about profile access alerts"
          value={local.profileAccessAlerts}
          onValueChange={(v) => set('profileAccessAlerts', v)}
        />
        <ToggleRow
          label="Subscription Updates"
          help="Receive notifications about subscription updates"
          value={local.subscriptionUpdates}
          onValueChange={(v) => set('subscriptionUpdates', v)}
        />
        <ToggleRow
          label="Security Alerts"
          help="Receive notifications about security alerts"
          value={local.securityAlerts}
          onValueChange={(v) => set('securityAlerts', v)}
        />
        <ToggleRow
          label="Marketing Emails"
          help="Receive notifications about marketing emails"
          value={local.marketingEmails}
          onValueChange={(v) => set('marketingEmails', v)}
        />
      </View>
    </View>
  );
}

function ChannelRow({
  tint,
  Icon,
  title,
  subtitle,
  extra,
  value,
  onValueChange,
}: {
  tint: 'blue' | 'purple' | 'green';
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  subtitle: string;
  extra?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const colors = {
    blue: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb' },
    purple: { bg: '#faf5ff', border: '#e9d5ff', icon: '#9333ea' },
    green: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a' },
  }[tint];
  return (
    <View
      style={[
        styles.channelRow,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <View style={[styles.channelIcon, { backgroundColor: '#fff' }]}>
        <Icon size={18} color={colors.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.channelTitle}>{title}</Text>
        <Text style={styles.channelSubtitle}>{subtitle}</Text>
        {!!extra && <Text style={styles.channelExtra}>{extra}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: GRAY[200], true: '#86efac' }}
        thumbColor={value ? '#16a34a' : '#fff'}
      />
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION & BILLING
// ──────────────────────────────────────────────────────────────────────────

function SubscriptionTab() {
  const { data: sub, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
  });

  const checkoutMut = useMutation({
    mutationFn: (planId: string) => subscriptionApi.createCheckoutSession(planId),
    onSuccess: (res: any) => {
      const url = res?.url || res?.checkoutUrl;
      if (url) Linking.openURL(url);
      else
        Alert.alert(
          'Couldn’t start checkout',
          'No checkout URL was returned. Please try again or contact support.',
        );
    },
    onError: () =>
      Alert.alert('Couldn’t start checkout', 'Please try again later.'),
  });

  const plan = (sub as any)?.plan ?? (sub as any)?.subscription?.plan ?? 'free';
  const isPremium = plan !== 'free' && plan !== 'expired';

  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.bigSectionTitle}>Subscription &amp; Billing</Text>

      {isLoading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={PRIMARY[600]} />
        </View>
      ) : (
        <View style={[styles.card, { borderColor: PRIMARY[200] }]}>
          <View style={styles.subHeaderRow}>
            <View style={styles.crownTile}>
              <Crown size={20} color={PRIMARY[600]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {isPremium ? 'You’re on Premium' : 'Upgrade to Premium'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isPremium
                  ? 'Thanks for supporting MedID. Manage your billing below.'
                  : 'Get access to unlimited profile updates, emergency contact management, and more!'}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <View style={styles.planRow}>
              <Pressable
                onPress={() => checkoutMut.mutate('premium_monthly')}
                disabled={checkoutMut.isPending}
                style={[styles.primaryBtn, { flex: 1 }]}
              >
                {checkoutMut.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Crown size={14} color="#fff" />
                )}
                <Text style={styles.primaryBtnText}>
                  Monthly · $9.99/mo
                </Text>
              </Pressable>
              <Pressable
                onPress={() => checkoutMut.mutate('premium_yearly')}
                disabled={checkoutMut.isPending}
                style={[styles.outlineBtn, { flex: 1 }]}
              >
                <Text style={styles.outlineBtnText}>Yearly · $99.99/yr</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Shield size={16} color={PRIMARY[600]} />
          <Text style={styles.cardTitle}>Need Help?</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Contact our support team for billing questions or assistance.
        </Text>
        <Pressable
          onPress={() => Linking.openURL('mailto:support@firstaidtag.com')}
          style={styles.outlineBtn}
        >
          <Text style={styles.outlineBtnText}>Contact Support</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PRIVACY & DATA
// ──────────────────────────────────────────────────────────────────────────

function PrivacyTab() {
  const [travelMode, setTravelMode] = useState(false);
  const [shareUpdates, setShareUpdates] = useState(false);
  const [guardianLocate, setGuardianLocate] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [sharingActive, setSharingActive] = useState(true);

  const exportMut = useMutation({
    mutationFn: () => settingsApi.exportData(),
    onSuccess: () =>
      Alert.alert(
        'Export started',
        'Your data export has been requested. You’ll get a download link by email.',
      ),
    onError: () => Alert.alert('Export failed', 'Please try again later.'),
  });

  const deleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes all of your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Confirmation required',
              'For security, account deletion must be confirmed via the web app.',
            ),
        },
      ],
    );
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={styles.bigSectionTitle}>Privacy &amp; Data</Text>

      <View style={[styles.card, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
        <Text style={[styles.cardTitle, { color: '#1e40af' }]}>Data Export</Text>
        <Text style={styles.cardSubtitle}>
          Download your complete medical profile as JSON, CSV, or PDF.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['JSON', 'CSV', 'PDF'].map((fmt) => (
            <Pressable
              key={fmt}
              onPress={() => exportMut.mutate()}
              style={[styles.outlineBtn, { flexGrow: 1 }]}
            >
              <Download size={14} color={PRIMARY[600]} />
              <Text style={styles.outlineBtnText}>Export as {fmt}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location &amp; safety</Text>
        <Text style={styles.cardSubtitle}>
          Web check-ins use your browser or device position. Adults keep
          tracking off until you turn it on; dependents follow your account
          rules.
        </Text>
        <ToggleRow
          label="Share position updates (safe zones and wander alerts)"
          value={shareUpdates}
          onValueChange={setShareUpdates}
        />
        <ToggleRow
          label="Guardian Locate Now"
          help="Block one-time location requests from guardians linked to your profile (adults only)."
          value={guardianLocate}
          onValueChange={setGuardianLocate}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Travel Mode</Text>
          <Text style={styles.cardSubtitleInline}>
            {travelMode ? 'On' : 'Off'}
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
          Show local emergency numbers when travelling abroad.
        </Text>
        <ToggleRow
          label="Enable Travel Mode"
          help="Overrides emergency numbers on your profile with the destination country's numbers."
          value={travelMode}
          onValueChange={setTravelMode}
        />
        <View style={styles.homeCountryRow}>
          <Text style={styles.homeCountryText}>Home country: Canada</Text>
          <View style={styles.homeCountryBadge}>
            <Text style={styles.homeCountryBadgeText}>911</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location sharing preferences</Text>
        <View style={styles.nestedCard}>
          <Text style={styles.cardTitle}>Sharing frequency</Text>
          <Text style={styles.cardSubtitle}>
            How often your location is updated when sharing is active.
          </Text>
          <View style={styles.selectInput}>
            <Text style={styles.selectText}>Every 5 minutes</Text>
            <ChevronDown size={14} color={GRAY[500]} />
          </View>
        </View>
        <ToggleRow
          label="Quiet hours"
          help="Location sharing and alerts are paused during quiet hours."
          value={quietHours}
          onValueChange={setQuietHours}
        />
        <ToggleRow
          label="Sharing active"
          help="Temporarily stop all location sharing. Emergency features remain active."
          value={sharingActive}
          onValueChange={setSharingActive}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location Data Management</Text>
        <View style={styles.locationStatsBox}>
          <Text style={styles.locationStatsTitle}>
            You have <Text style={{ fontWeight: '800' }}>0</Text> location
            records stored.
          </Text>
          <Text style={styles.locationStatsHint}>
            Location records older than 90 days are automatically deleted per
            our privacy policy.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pressable style={[styles.outlineBtn, { flexGrow: 1 }]}>
            <Download size={14} color={GRAY[500]} />
            <Text style={[styles.outlineBtnText, { color: GRAY[500] }]}>
              Download Location History
            </Text>
          </Pressable>
          <Pressable style={[styles.outlineBtn, { flexGrow: 1, opacity: 0.6 }]}>
            <Trash2 size={14} color={PRIMARY[600]} />
            <Text style={styles.outlineBtnText}>Delete All Location Data</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Retention</Text>
        <Text style={styles.cardSubtitle}>
          Your data is stored securely on Canadian servers and retained for as
          long as your account is active. Audit logs are kept for 7 years as
          per PIPEDA regulations.
        </Text>
      </View>

      <View style={styles.dangerCard}>
        <View style={styles.cardHeaderRow}>
          <AlertCircle size={16} color={PRIMARY[600]} />
          <Text style={[styles.cardTitle, { color: PRIMARY[700] }]}>
            Delete Account
          </Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: PRIMARY[700] }]}>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </Text>
        <Pressable onPress={deleteAccount} style={styles.dangerBtn}>
          <Trash2 size={14} color="#fff" />
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Reusable rows
// ──────────────────────────────────────────────────────────────────────────

function SettingRow({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {!!hint && <Text style={styles.cardSubtitle}>{hint}</Text>}
      <View>{children}</View>
    </View>
  );
}

function ToggleRow({
  label,
  help,
  value,
  onValueChange,
}: {
  label: string;
  help?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {!!help && <Text style={styles.toggleHelp}>{help}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: GRAY[300], true: '#fecaca' }}
        thumbColor={value ? PRIMARY[600] : '#fff'}
      />
    </View>
  );
}

function Field({
  label,
  optional,
  required,
  children,
  style,
}: {
  label: string;
  optional?: boolean;
  required?: boolean;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ marginBottom: 10 }, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={{ color: PRIMARY[600] }}> *</Text>}
        </Text>
        {optional && <Text style={styles.optional}>(Optional)</Text>}
      </View>
      {children}
    </View>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 6, fontSize: 13, color: GRAY[600], lineHeight: 18 },

  tabsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 4,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabRowActive: { backgroundColor: '#fee2e2' },
  tabLabel: { color: GRAY[700], fontSize: 14, fontWeight: '600' },
  tabLabelActive: { color: PRIMARY[600], fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 10,
  },
  nestedCard: {
    backgroundColor: GRAY[50],
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  bigSectionTitle: { fontSize: 18, fontWeight: '800', color: GRAY[900] },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  cardSubtitle: { fontSize: 12, color: GRAY[600], lineHeight: 17 },
  cardSubtitleInline: { fontSize: 12, color: GRAY[500] },
  helperText: { fontSize: 12, color: GRAY[600] },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },

  loadingBlock: { paddingVertical: 32, alignItems: 'center' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  errorText: { color: PRIMARY[700], fontSize: 12, flex: 1 },
  successBox: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  successText: { color: '#15803d', fontSize: 12, fontWeight: '600' },

  profilePicCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: GRAY[50],
    padding: 12,
    borderRadius: 12,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: PRIMARY[700], fontWeight: '800', fontSize: 18 },
  profilePicTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  profilePicHelp: { fontSize: 12, color: GRAY[600], marginTop: 2 },

  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: GRAY[800] },
  optional: { fontSize: 12, color: GRAY[500] },
  input: {
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: GRAY[900],
    backgroundColor: '#fff',
  },
  inputReadOnly: { backgroundColor: GRAY[100], color: GRAY[600] },
  row2: { flexDirection: 'row', gap: 12 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnDisabled: { backgroundColor: PRIMARY[300] },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: '#fff',
  },
  outlineBtnText: { color: PRIMARY[600], fontWeight: '700', fontSize: 12 },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: GRAY[100],
  },
  cancelBtnText: { color: GRAY[700], fontWeight: '700', fontSize: 13 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  warningCard: {
    backgroundColor: '#fef9c3',
    borderColor: '#fde047',
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },

  drillCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  drillIconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: GRAY[900] },
  toggleHelp: { fontSize: 12, color: GRAY[600], marginTop: 2, lineHeight: 17 },

  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  channelIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitle: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  channelSubtitle: { fontSize: 12, color: GRAY[700], marginTop: 2 },
  channelExtra: { fontSize: 11, color: GRAY[500], marginTop: 4 },

  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 13, color: GRAY[900] },

  homeCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GRAY[50],
    padding: 10,
    borderRadius: 10,
  },
  homeCountryText: { flex: 1, fontSize: 13, color: GRAY[700] },
  homeCountryBadge: {
    backgroundColor: GRAY[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  homeCountryBadgeText: { fontSize: 11, color: GRAY[700], fontWeight: '700' },

  locationStatsBox: {
    backgroundColor: GRAY[700],
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  locationStatsTitle: { fontSize: 13, color: '#fff' },
  locationStatsHint: { fontSize: 11, color: GRAY[300] },

  dangerCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  dangerBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Subscription tab
  subHeaderRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  crownTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});

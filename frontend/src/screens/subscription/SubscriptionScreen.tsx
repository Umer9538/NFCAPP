/**
 * Subscription & Billing — mirrors the web's /dashboard/subscription 1:1.
 * GET /api/subscription, POST /api/subscription/create-checkout (same backend).
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Crown, Shield } from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import { subscriptionApi } from '@/api/subscription';

const SUPPORT_EMAIL = 'support@firstaidtag.com';

export default function SubscriptionScreen() {
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.headerTitle}>Subscription &amp; Billing</Text>
          <Text style={styles.headerSub}>
            Manage your subscription plan and payment information.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={PRIMARY[600]} />
          </View>
        ) : (
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeHeader}>
              <View style={styles.crownTile}>
                <Crown size={20} color={PRIMARY[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradeTitle}>
                  {isPremium ? 'You’re on Premium' : 'Upgrade to Premium'}
                </Text>
                <Text style={styles.upgradeText}>
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
                    Start Monthly – $9.99/month
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => checkoutMut.mutate('premium_yearly')}
                  disabled={checkoutMut.isPending}
                  style={[styles.outlineBtn, { flex: 1 }]}
                >
                  <Text style={styles.outlineBtnText}>
                    Start Yearly – $99.99/year
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <Shield size={16} color={PRIMARY[600]} />
            <Text style={styles.helpTitle}>Need Help?</Text>
          </View>
          <Text style={styles.helpText}>
            Contact our support team for billing questions or assistance.
          </Text>
          <Pressable
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
            style={styles.outlineBtn}
          >
            <Text style={styles.outlineBtnText}>Contact Support</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
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

  loadingBlock: { paddingVertical: 40, alignItems: 'center' },

  upgradeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRIMARY[200],
    gap: 14,
  },
  upgradeHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  crownTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: { fontSize: 16, fontWeight: '700', color: GRAY[900] },
  upgradeText: { fontSize: 13, color: GRAY[700], marginTop: 4, lineHeight: 18 },

  planRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PRIMARY[600],
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  outlineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  outlineBtnText: { color: PRIMARY[600], fontWeight: '700', fontSize: 13 },

  helpCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 8,
  },
  helpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  helpTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  helpText: { fontSize: 12, color: GRAY[600], lineHeight: 17 },
});

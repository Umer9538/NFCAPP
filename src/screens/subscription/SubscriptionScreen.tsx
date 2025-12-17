/**
 * Subscription Screen
 * Manage subscription plans, billing, and payment methods
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { subscriptionApi } from '@/api/subscription';
import type { Plan, SubscriptionPlan, Invoice } from '@/types/subscription';
import { PRIMARY, GRAY, STATUS, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';

// Plan definitions
const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'CAD',
    interval: null,
    description: 'Basic emergency profile features',
    features: [
      { name: 'Basic emergency profile', included: true },
      { name: 'Up to 2 emergency contacts', included: true },
      { name: 'Basic medical information', included: true },
      { name: 'QR code access', included: true },
      { name: 'NFC bracelet linking', included: false },
      { name: 'Unlimited emergency contacts', included: false },
      { name: 'Document storage', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Full features with monthly billing',
    stripePriceId: 'price_monthly_cad',
    features: [
      { name: 'Complete emergency profile', included: true },
      { name: 'Unlimited emergency contacts', included: true },
      { name: 'Full medical records', included: true },
      { name: 'QR code & NFC bracelet', included: true },
      { name: 'Document storage (50MB)', included: true },
      { name: 'Access history & logs', included: true },
      { name: 'Priority support', included: true },
      { name: 'No commitment', included: true },
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 99.99,
    currency: 'CAD',
    interval: 'year',
    description: 'Best value - 2 months free',
    stripePriceId: 'price_yearly_cad',
    popular: true,
    features: [
      { name: 'Everything in Monthly', included: true },
      { name: 'Save $20/year', included: true },
      { name: 'Document storage (200MB)', included: true },
      { name: 'Premium support', included: true },
      { name: 'Early access to new features', included: true },
      { name: 'Family sharing (coming soon)', included: true },
    ],
  },
];

export default function SubscriptionScreen() {
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Fetch subscription data
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    placeholderData: getMockSubscriptionData(),
  });

  // Fetch invoices
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => subscriptionApi.getInvoices(12),
    placeholderData: getMockInvoices(),
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: (data: { cancelAtPeriodEnd: boolean; reason?: string }) =>
      subscriptionApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      Alert.alert('Success', 'Your subscription has been cancelled. You can continue using premium features until the end of your billing period.');
      setShowCancelModal(false);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    },
  });

  // Resume subscription mutation
  const resumeMutation = useMutation({
    mutationFn: subscriptionApi.resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      Alert.alert('Success', 'Your subscription has been resumed!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to resume subscription. Please try again.');
    },
  });

  // Create checkout session mutation
  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => subscriptionApi.createCheckoutSession(planId),
    onSuccess: async (data) => {
      // Open Stripe checkout in browser
      const supported = await Linking.canOpenURL(data.url);
      if (supported) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'Cannot open checkout page');
      }
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create checkout session. Please try again.');
    },
  });

  const subscription = subscriptionData?.subscription;
  const paymentMethod = subscriptionData?.paymentMethod;
  const currentPlan = PLANS.find((p) => p.id === subscription?.plan) || PLANS[0];

  const handleUpgrade = (planId: SubscriptionPlan) => {
    if (subscription?.plan === 'free') {
      // Create new subscription
      Alert.alert(
        'Upgrade Plan',
        `Upgrade to ${PLANS.find((p) => p.id === planId)?.name} plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => checkoutMutation.mutate(planId),
          },
        ]
      );
    } else {
      // Upgrade existing subscription
      Alert.alert(
        'Change Plan',
        'Change your subscription plan? The change will be prorated.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              // In production, this would update the subscription
              Alert.alert('Info', 'This feature will update your subscription in production.');
            },
          },
        ]
      );
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    cancelMutation.mutate({
      cancelAtPeriodEnd: true,
      reason: cancelReason,
    });
  };

  const handleResumeSubscription = () => {
    Alert.alert(
      'Resume Subscription',
      'Resume your subscription? You will be charged at the next billing date.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resume',
          onPress: () => resumeMutation.mutate(),
        },
      ]
    );
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const session = await subscriptionApi.createPaymentMethodSession();
      const supported = await Linking.canOpenURL(session.url);
      if (supported) {
        await Linking.openURL(session.url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open payment method update page');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const { url } = await subscriptionApi.downloadInvoice(invoiceId);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active' },
      cancelled: { variant: 'warning' as const, label: 'Cancelled' },
      expired: { variant: 'error' as const, label: 'Expired' },
      trialing: { variant: 'info' as const, label: 'Trial' },
      past_due: { variant: 'error' as const, label: 'Past Due' },
    };

    const config = statusConfig[subscription.status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <LoadingSpinner visible text="Loading subscription..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Subscription Card */}
      <Card variant="elevated" padding="lg" style={styles.currentPlanCard}>
        <View style={styles.currentPlanHeader}>
          <View>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <Text style={styles.planName}>{currentPlan.name}</Text>
          </View>
          {getStatusBadge()}
        </View>

        <View style={styles.planDetails}>
          <View style={styles.planDetailRow}>
            <Ionicons name="calendar-outline" size={20} color={GRAY[600]} />
            <Text style={styles.planDetailLabel}>Billing Period</Text>
            <Text style={styles.planDetailValue}>
              {subscription?.currentPeriodStart && subscription?.currentPeriodEnd
                ? `${format(new Date(subscription.currentPeriodStart), 'MMM d')} - ${format(
                    new Date(subscription.currentPeriodEnd),
                    'MMM d, yyyy'
                  )}`
                : 'N/A'}
            </Text>
          </View>

          {subscription?.plan !== 'free' && (
            <>
              <View style={styles.planDetailRow}>
                <Ionicons name="card-outline" size={20} color={GRAY[600]} />
                <Text style={styles.planDetailLabel}>Amount</Text>
                <Text style={styles.planDetailValue}>
                  ${(subscription?.amount || 0) / 100} {subscription?.currency || 'CAD'}
                </Text>
              </View>

              <View style={styles.planDetailRow}>
                <Ionicons name="time-outline" size={20} color={GRAY[600]} />
                <Text style={styles.planDetailLabel}>Next Billing</Text>
                <Text style={styles.planDetailValue}>
                  {subscription?.currentPeriodEnd
                    ? format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')
                    : 'N/A'}
                </Text>
              </View>
            </>
          )}
        </View>

        {subscription?.cancelAtPeriodEnd && (
          <View style={styles.cancelNotice}>
            <Ionicons name="information-circle" size={20} color={STATUS.warning.dark} />
            <Text style={styles.cancelNoticeText}>
              Your subscription will be cancelled on{' '}
              {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </Text>
          </View>
        )}

        {subscription?.plan !== 'free' && (
          <View style={styles.currentPlanActions}>
            {subscription?.cancelAtPeriodEnd ? (
              <Button
                variant="primary"
                fullWidth
                onPress={handleResumeSubscription}
                loading={resumeMutation.isPending}
              >
                Resume Subscription
              </Button>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onPress={handleCancelSubscription}
                style={styles.cancelButton}
              >
                Cancel Subscription
              </Button>
            )}
          </View>
        )}
      </Card>

      {/* Plan Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Plans</Text>
        <Text style={styles.sectionDescription}>
          Choose the plan that best fits your needs
        </Text>

        <View style={styles.plansGrid}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === subscription?.plan}
              onSelect={handleUpgrade}
              isLoading={checkoutMutation.isPending}
            />
          ))}
        </View>
      </View>

      {/* Payment Method */}
      {subscription?.plan !== 'free' && paymentMethod && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <Card variant="outline" padding="md">
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodInfo}>
                <Ionicons name="card" size={24} color={PRIMARY[600]} />
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodBrand}>
                    {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}
                  </Text>
                  <Text style={styles.paymentMethodExpiry}>
                    Expires {paymentMethod.card.expMonth}/{paymentMethod.card.expYear}
                  </Text>
                </View>
              </View>
              <Button
                variant="ghost"
                size="sm"
                onPress={handleUpdatePaymentMethod}
                icon={<Ionicons name="create-outline" size={16} color={PRIMARY[600]} />}
              >
                Update
              </Button>
            </View>
          </Card>
        </View>
      )}

      {/* Billing History */}
      {subscription?.plan !== 'free' && invoices && invoices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing History</Text>

          <Card variant="outline" padding="none">
            {invoices.map((invoice, index) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                isLast={index === invoices.length - 1}
                onDownload={handleDownloadInvoice}
              />
            ))}
          </Card>
        </View>
      )}

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
          </Text>

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              onPress={() => setShowCancelModal(false)}
              style={styles.modalButton}
            >
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              onPress={confirmCancel}
              loading={cancelMutation.isPending}
              style={styles.modalButton}
            >
              Cancel Subscription
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Plan Card Component
interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: (planId: SubscriptionPlan) => void;
  isLoading: boolean;
}

function PlanCard({ plan, isCurrentPlan, onSelect, isLoading }: PlanCardProps) {
  return (
    <Card
      variant={plan.popular ? 'elevated' : 'outline'}
      padding="lg"
      style={[
        styles.planCard,
        plan.popular && styles.popularPlanCard,
        isCurrentPlan && styles.currentPlanCardBorder,
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      <View style={styles.planCardHeader}>
        <Text style={styles.planCardName}>{plan.name}</Text>
        <View style={styles.planCardPrice}>
          <Text style={styles.planCardPriceAmount}>
            ${plan.price}
          </Text>
          {plan.interval && (
            <Text style={styles.planCardPriceInterval}>/{plan.interval}</Text>
          )}
        </View>
        <Text style={styles.planCardDescription}>{plan.description}</Text>
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.planFeature}>
            <Ionicons
              name={feature.included ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={feature.included ? STATUS.success.main : GRAY[300]}
            />
            <Text
              style={[
                styles.planFeatureText,
                !feature.included && styles.planFeatureTextDisabled,
              ]}
            >
              {feature.name}
            </Text>
          </View>
        ))}
      </View>

      <Button
        variant={plan.popular ? 'primary' : 'outline'}
        fullWidth
        onPress={() => onSelect(plan.id)}
        disabled={isCurrentPlan || isLoading}
        loading={isLoading}
      >
        {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
      </Button>
    </Card>
  );
}

// Invoice Row Component
interface InvoiceRowProps {
  invoice: Invoice;
  isLast: boolean;
  onDownload: (invoiceId: string) => void;
}

function InvoiceRow({ invoice, isLast, onDownload }: InvoiceRowProps) {
  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid':
        return STATUS.success.main;
      case 'pending':
        return STATUS.warning.main;
      case 'failed':
        return STATUS.error.main;
      default:
        return GRAY[500];
    }
  };

  return (
    <Pressable
      style={[styles.invoiceRow, !isLast && styles.invoiceRowBorder]}
      onPress={() => onDownload(invoice.id)}
    >
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceDate}>
          {format(new Date(invoice.date), 'MMM d, yyyy')}
        </Text>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
      </View>

      <View style={styles.invoiceAmount}>
        <Text style={styles.invoiceAmountText}>
          ${(invoice.amount / 100).toFixed(2)} {invoice.currency}
        </Text>
        <View style={[styles.invoiceStatusDot, { backgroundColor: getStatusColor() }]} />
      </View>

      <Ionicons name="download-outline" size={20} color={PRIMARY[600]} />
    </Pressable>
  );
}

// Mock data functions
function getMockSubscriptionData() {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    subscription: {
      id: 'sub_mock_123',
      userId: 'user_mock_1',
      plan: 'monthly' as const,
      status: 'active' as const,
      currentPeriodStart: periodStart.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      amount: 999, // $9.99 in cents
      currency: 'CAD',
      stripeCustomerId: 'cus_mock_123',
      stripeSubscriptionId: 'sub_stripe_mock_123',
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
      updatedAt: now.toISOString(),
    },
    paymentMethod: {
      id: 'pm_mock_123',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
      },
      isDefault: true,
      createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
    },
  };
}

function getMockInvoices() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => ({
    id: `inv_mock_${i + 1}`,
    subscriptionId: 'sub_mock_123',
    amount: 999,
    currency: 'CAD',
    status: 'paid' as const,
    date: new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString(),
    periodStart: new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString(),
    periodEnd: new Date(now.getFullYear(), now.getMonth() - i + 1, 0).toISOString(),
    invoiceNumber: `INV-2024-${String(1000 + i).padStart(4, '0')}`,
    invoiceUrl: 'https://medguard.app/invoices/mock',
    pdfUrl: 'https://medguard.app/invoices/mock.pdf',
    createdAt: new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString(),
  }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY[50],
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  currentPlanCard: {
    marginBottom: spacing[6],
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: GRAY[900],
    marginBottom: spacing[2],
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY[600],
  },
  planDetails: {
    gap: spacing[3],
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  planDetailLabel: {
    flex: 1,
    fontSize: 14,
    color: GRAY[600],
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
  },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: STATUS.warning.light,
    borderRadius: 8,
  },
  cancelNoticeText: {
    flex: 1,
    fontSize: 13,
    color: STATUS.warning.text,
  },
  currentPlanActions: {
    marginTop: spacing[4],
  },
  cancelButton: {
    borderColor: STATUS.error.main,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionDescription: {
    fontSize: 14,
    color: GRAY[600],
    marginBottom: spacing[4],
  },
  plansGrid: {
    gap: spacing[4],
  },
  planCard: {
    position: 'relative',
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: PRIMARY[600],
  },
  currentPlanCardBorder: {
    borderWidth: 2,
    borderColor: STATUS.success.main,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planCardHeader: {
    marginBottom: spacing[4],
  },
  planCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: GRAY[900],
    marginBottom: spacing[1],
  },
  planCardPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[2],
  },
  planCardPriceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: PRIMARY[600],
  },
  planCardPriceInterval: {
    fontSize: 16,
    color: GRAY[600],
    marginLeft: spacing[1],
  },
  planCardDescription: {
    fontSize: 14,
    color: GRAY[600],
  },
  planFeatures: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  planFeatureText: {
    flex: 1,
    fontSize: 14,
    color: GRAY[700],
  },
  planFeatureTextDisabled: {
    color: GRAY[400],
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: spacing[1],
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: GRAY[600],
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  invoiceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY[200],
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
    marginBottom: spacing[1],
  },
  invoiceNumber: {
    fontSize: 12,
    color: GRAY[600],
  },
  invoiceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[3],
  },
  invoiceAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[900],
  },
  invoiceStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContent: {
    gap: spacing[4],
  },
  modalText: {
    fontSize: 14,
    color: GRAY[700],
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
});

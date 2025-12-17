/**
 * Subscription API
 * API endpoints for subscription management - Using SQLite database
 */

import { subscriptionService, invoicesService } from '@/db/services';
import type {
  Subscription,
  SubscriptionResponse,
  Invoice,
  PaymentMethod,
  CheckoutSession,
  SubscriptionUpdateRequest,
  CancelSubscriptionRequest,
} from '@/types/subscription';

// Demo user ID for local development
const DEMO_USER_ID = 'user-demo-001';

/**
 * Get current subscription
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  try {
    const subscription = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    return {
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan,
        status: subscription.status as any,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd === 1,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
      usage: {
        scans: 15, // From bracelet access count
        scansLimit: 1000,
        storage: 2.5,
        storageLimit: 100,
      },
    };
  } catch (error) {
    console.error('[Subscription API] Error getting subscription:', error);
    throw error;
  }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(planId: string): Promise<CheckoutSession> {
  // This would typically create a Stripe checkout session
  // For now, return mock data
  return {
    id: 'mock-checkout-session-id',
    url: 'https://checkout.stripe.com/mock-session',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  };
}

/**
 * Upgrade or downgrade subscription plan
 */
export async function updateSubscription(data: SubscriptionUpdateRequest): Promise<Subscription> {
  try {
    const subscription = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await subscriptionService.update(subscription.id, {
      plan: data.planId,
    });

    const updated = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!updated) {
      throw new Error('Failed to update subscription');
    }

    return {
      id: updated.id,
      userId: updated.userId,
      plan: updated.plan,
      status: updated.status as any,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd === 1,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error) {
    console.error('[Subscription API] Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
  try {
    const subscription = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await subscriptionService.update(subscription.id, {
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ? 1 : 0,
      status: data.cancelAtPeriodEnd ? 'active' : 'cancelled',
    });

    const updated = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!updated) {
      throw new Error('Failed to cancel subscription');
    }

    return {
      id: updated.id,
      userId: updated.userId,
      plan: updated.plan,
      status: updated.status as any,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd === 1,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error) {
    console.error('[Subscription API] Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(): Promise<Subscription> {
  try {
    const subscription = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await subscriptionService.update(subscription.id, {
      cancelAtPeriodEnd: 0,
      status: 'active',
    });

    const updated = await subscriptionService.getByUserId(DEMO_USER_ID);

    if (!updated) {
      throw new Error('Failed to resume subscription');
    }

    return {
      id: updated.id,
      userId: updated.userId,
      plan: updated.plan,
      status: updated.status as any,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd === 1,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (error) {
    console.error('[Subscription API] Error resuming subscription:', error);
    throw error;
  }
}

/**
 * Get billing history (invoices)
 */
export async function getInvoices(limit: number = 12): Promise<Invoice[]> {
  try {
    const invoices = await invoicesService.getByUserId(DEMO_USER_ID);

    return invoices.slice(0, limit).map((invoice) => ({
      id: invoice.id,
      subscriptionId: invoice.subscriptionId,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status as any,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      invoiceUrl: invoice.invoiceUrl,
      createdAt: invoice.createdAt,
    }));
  } catch (error) {
    console.error('[Subscription API] Error getting invoices:', error);
    throw error;
  }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(invoiceId: string): Promise<{ url: string }> {
  try {
    return {
      url: `https://medguard.app/invoices/${invoiceId}.pdf`,
    };
  } catch (error) {
    console.error('[Subscription API] Error downloading invoice:', error);
    throw error;
  }
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  // Mock payment methods - would typically come from Stripe
  return [
    {
      id: 'pm_mock_1',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
      },
      isDefault: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

/**
 * Create payment method setup session
 */
export async function createPaymentMethodSession(): Promise<CheckoutSession> {
  // Would typically create a Stripe setup session
  return {
    id: 'mock-setup-session-id',
    url: 'https://checkout.stripe.com/mock-setup',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
  // Would typically delete from Stripe
  return { message: 'Payment method deleted successfully' };
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  // Would typically update in Stripe
  return {
    id: paymentMethodId,
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
  };
}

export const subscriptionApi = {
  getSubscription,
  createCheckoutSession,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  getInvoices,
  downloadInvoice,
  getPaymentMethods,
  createPaymentMethodSession,
  deletePaymentMethod,
  setDefaultPaymentMethod,
};

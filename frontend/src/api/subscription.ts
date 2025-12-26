/**
 * Subscription API
 * API endpoints for subscription management - Connected to real backend
 */

import { api } from './client';
import type {
  Subscription,
  SubscriptionResponse,
  Invoice,
  PaymentMethod,
  CheckoutSession,
  SubscriptionUpdateRequest,
  CancelSubscriptionRequest,
} from '@/types/subscription';

/**
 * Get current subscription
 */
export async function getSubscription(): Promise<SubscriptionResponse> {
  return await api.get<SubscriptionResponse>('/subscription');
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(planId: string): Promise<CheckoutSession> {
  return await api.post<CheckoutSession>('/subscription/checkout', { planId });
}

/**
 * Upgrade or downgrade subscription plan
 */
export async function updateSubscription(data: SubscriptionUpdateRequest): Promise<Subscription> {
  return await api.put<Subscription>('/subscription', data);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
  return await api.post<Subscription>('/subscription/cancel', data);
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(): Promise<Subscription> {
  return await api.post<Subscription>('/subscription/resume');
}

/**
 * Get billing history (invoices)
 */
export async function getInvoices(limit: number = 12): Promise<Invoice[]> {
  return await api.get<Invoice[]>(`/subscription/invoices?limit=${limit}`);
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(invoiceId: string): Promise<{ url: string }> {
  return await api.get<{ url: string }>(`/subscription/invoices/${invoiceId}/download`);
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return await api.get<PaymentMethod[]>('/subscription/payment-methods');
}

/**
 * Create payment method setup session
 */
export async function createPaymentMethodSession(): Promise<CheckoutSession> {
  return await api.post<CheckoutSession>('/subscription/payment-methods/setup');
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
  return await api.delete<{ message: string }>(`/subscription/payment-methods/${paymentMethodId}`);
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  return await api.put<PaymentMethod>(`/subscription/payment-methods/${paymentMethodId}/default`);
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

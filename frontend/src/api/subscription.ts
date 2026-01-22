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
  return await api.get<SubscriptionResponse>('/api/subscription');
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(planId: string): Promise<CheckoutSession> {
  return await api.post<CheckoutSession>('/api/subscription/checkout', { planId });
}

/**
 * Upgrade or downgrade subscription plan
 */
export async function updateSubscription(data: SubscriptionUpdateRequest): Promise<Subscription> {
  return await api.put<Subscription>('/api/subscription', data);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
  return await api.post<Subscription>('/api/subscription/cancel', data);
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(): Promise<Subscription> {
  return await api.post<Subscription>('/api/subscription/resume');
}

/**
 * Get billing history (invoices)
 */
export async function getInvoices(limit: number = 12): Promise<Invoice[]> {
  return await api.get<Invoice[]>(`/api/subscription/invoices?limit=${limit}`);
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(invoiceId: string): Promise<{ url: string }> {
  return await api.get<{ url: string }>(`/api/subscription/invoices/${invoiceId}/download`);
}

/**
 * Get payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return await api.get<PaymentMethod[]>('/api/subscription/payment-methods');
}

/**
 * Create payment method setup session
 */
export async function createPaymentMethodSession(): Promise<CheckoutSession> {
  return await api.post<CheckoutSession>('/api/subscription/payment-methods/setup');
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
  return await api.delete<{ message: string }>(`/api/subscription/payment-methods/${paymentMethodId}`);
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  return await api.put<PaymentMethod>(`/api/subscription/payment-methods/${paymentMethodId}/default`);
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

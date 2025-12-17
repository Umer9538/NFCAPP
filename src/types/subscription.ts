/**
 * Subscription Types
 * TypeScript types for subscription management
 */

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due';
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  amount: number; // in cents
  currency: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  price: number; // in dollars
  currency: string;
  interval: 'month' | 'year' | null;
  description: string;
  features: PlanFeature[];
  stripePriceId?: string;
  popular?: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number; // in cents
  currency: string;
  status: InvoiceStatus;
  date: string;
  periodStart: string;
  periodEnd: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string; // 'visa', 'mastercard', etc.
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionUpdateRequest {
  planId: SubscriptionPlan;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd: boolean;
  reason?: string;
}

export interface SubscriptionResponse {
  subscription: Subscription;
  paymentMethod?: PaymentMethod;
}

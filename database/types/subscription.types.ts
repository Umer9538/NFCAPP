import { SubscriptionPlan, SubscriptionStatus } from './common.types';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripePaymentMethodId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceNumber: string;
  stripeInvoiceId?: string | null;
  invoiceUrl?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
}

export interface CreateSubscriptionInput {
  plan: SubscriptionPlan;
  paymentMethodId?: string;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'CAD',
    interval: 'month',
    features: [
      'Basic medical profile',
      'Single emergency contact',
      'NFC bracelet linking',
      'Limited access logs'
    ]
  },
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 9.99,
    currency: 'CAD',
    interval: 'month',
    features: [
      'Complete medical profile',
      'Unlimited emergency contacts',
      'NFC bracelet linking',
      'Full access logs',
      'Health reminders',
      'Export data',
      'Priority support'
    ]
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 99.99,
    currency: 'CAD',
    interval: 'year',
    features: [
      'All Premium Monthly features',
      '2 months free',
      'Priority support',
      'Early access to new features'
    ]
  }
];


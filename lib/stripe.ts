/**
 * Stripe Integration Library
 *
 * Handles payment processing, subscription management, and webhook events
 */

import Stripe from 'stripe'

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Pricing configuration
export const STRIPE_PLANS = {
  pro: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    price: 4900, // $49.00 in cents
    tier: 'pro' as const,
    features: {
      projects: 10,
      analysesPerMonth: 500,
      apiAccess: true,
      customReports: true,
      prioritySupport: true,
    },
  },
  agency: {
    name: 'Agency',
    priceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY || '',
    price: 19900, // $199.00 in cents
    tier: 'agency' as const,
    features: {
      projects: -1, // unlimited
      analysesPerMonth: -1, // unlimited
      apiAccess: true,
      customReports: true,
      whiteLabel: true,
      teamCollaboration: true,
      dedicatedSupport: true,
    },
  },
} as const

export type StripePlanKey = keyof typeof STRIPE_PLANS

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  planKey,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  planKey: StripePlanKey
  successUrl: string
  cancelUrl: string
}) {
  const plan = STRIPE_PLANS[planKey]

  if (!plan.priceId) {
    throw new Error(`Missing Stripe Price ID for ${planKey} plan. Please set STRIPE_PRICE_${planKey.toUpperCase()}_MONTHLY in environment variables.`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      planKey,
    },
    subscription_data: {
      metadata: {
        userId,
        planKey,
      },
    },
    allow_promotion_codes: true,
  })

  return session
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer({
  userId,
  email,
  name,
}: {
  userId: string
  email: string
  name?: string
}) {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })

  return customer
}

/**
 * Create a customer portal session for subscription management
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })

  return subscription
}

/**
 * List customer invoices
 */
export async function getCustomerInvoices(customerId: string, limit = 10) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

/**
 * Get customer payment methods
 */
export async function getCustomerPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data
}

/**
 * Map Stripe subscription status to our app status
 */
export function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'canceled'
    case 'paused':
      return 'paused'
    default:
      return 'canceled'
  }
}

/**
 * Get tier from Stripe subscription
 */
export function getTierFromSubscription(subscription: Stripe.Subscription): 'free' | 'pro' | 'agency' {
  const metadata = subscription.metadata

  if (metadata.planKey === 'agency') {
    return 'agency'
  } else if (metadata.planKey === 'pro') {
    return 'pro'
  }

  // Fallback to checking price ID
  const priceId = subscription.items.data[0]?.price.id

  if (priceId === STRIPE_PLANS.agency.priceId) {
    return 'agency'
  } else if (priceId === STRIPE_PLANS.pro.priceId) {
    return 'pro'
  }

  return 'free'
}

/**
 * Webhook signature verification
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

/**
 * Get plan limits for usage enforcement
 */
export function getPlanLimits(tier: 'free' | 'pro' | 'agency') {
  switch (tier) {
    case 'free':
      return {
        projects: 1,
        analysesPerMonth: 10,
        keywords: 10,
        apiAccess: false,
        teamMembers: 1,
      }
    case 'pro':
      return {
        projects: 10,
        analysesPerMonth: 500,
        keywords: 100,
        apiAccess: true,
        teamMembers: 3,
      }
    case 'agency':
      return {
        projects: -1, // unlimited
        analysesPerMonth: -1, // unlimited
        keywords: -1, // unlimited
        apiAccess: true,
        teamMembers: -1, // unlimited
      }
  }
}

/**
 * Check if user has exceeded limits
 */
export function hasExceededLimit(current: number, limit: number): boolean {
  // -1 means unlimited
  if (limit === -1) return false
  return current >= limit
}

/**
 * Stripe Integration
 *
 * Full subscription management: checkout, billing portal, webhooks.
 * Handles Stripe SDK v20 where current_period_end lives on
 * subscription.items.data[0].current_period_end.
 */

import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { sendSubscriptionEmail } from "@/lib/email";

// ---------------------------------------------------------------------------
// Stripe client
// ---------------------------------------------------------------------------

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    })
  : null;

// ---------------------------------------------------------------------------
// Price -> tier mapping
// ---------------------------------------------------------------------------

const PRICE_TO_TIER: Record<string, string> = {};
const TIER_TO_PRICE: Record<string, string> = {};

function initPriceMappings() {
  const mappings: [string | undefined, string][] = [
    [process.env.STRIPE_PRICE_PRO_MONTHLY, "pro"],
    [process.env.STRIPE_PRICE_PRO_YEARLY, "pro"],
    [process.env.STRIPE_PRICE_AGENCY_MONTHLY, "agency"],
    [process.env.STRIPE_PRICE_AGENCY_YEARLY, "agency"],
  ];

  for (const [priceId, tier] of mappings) {
    if (priceId) {
      PRICE_TO_TIER[priceId] = tier;
      // Store the first price for each tier (monthly takes precedence)
      if (!TIER_TO_PRICE[tier]) {
        TIER_TO_PRICE[tier] = priceId;
      }
    }
  }
}

initPriceMappings();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * In Stripe SDK v20, current_period_end is on subscription.items.data[0],
 * not on the subscription object directly.
 */
function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Date | null {
  const item = subscription.items?.data?.[0] as unknown as Record<string, unknown> | undefined;
  if (item && typeof item.current_period_end === "number") {
    return new Date(item.current_period_end * 1000);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export function getTierFromPriceId(priceId: string): string | null {
  return PRICE_TO_TIER[priceId] ?? null;
}

export function getPriceIdForTier(tier: string): string | null {
  return TIER_TO_PRICE[tier] ?? null;
}

export async function createOrGetCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  // Save customer ID to user record
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  name: string | null,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  const customerId = await createOrGetCustomer(userId, email, name || undefined);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("User does not have a Stripe customer ID");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function manuallyUpdateTier(
  userId: string,
  tier: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tier,
      subscriptionStatus: tier === "free" ? null : "active",
    },
  });
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function handleWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; type?: string }> {
  if (!stripe) throw new Error("Stripe is not configured");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    }

    case "customer.subscription.updated": {
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    }

    case "customer.subscription.deleted": {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    }

    case "invoice.payment_failed": {
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    }

    case "invoice.paid": {
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    }
  }

  return { received: true, type: event.type };
}

// ---------------------------------------------------------------------------
// Webhook event handlers
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId || !stripe) return;

  // Retrieve subscription to get the price and period
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? getTierFromPriceId(priceId) : null;
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tier: tier || "pro",
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "active",
      subscriptionEndsAt: periodEnd,
    },
  });

  // Send confirmation email
  if (user.email) {
    await sendSubscriptionEmail(user.email, user.name || "", "activated");
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? getTierFromPriceId(priceId) : null;
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  const status = subscription.status;
  let subscriptionStatus: string;

  if (status === "active" || status === "trialing") {
    subscriptionStatus = "active";
  } else if (status === "past_due") {
    subscriptionStatus = "past_due";
  } else if (status === "canceled" || status === "unpaid") {
    subscriptionStatus = "canceled";
  } else {
    subscriptionStatus = status;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      tier: tier || undefined,
      subscriptionStatus,
      subscriptionEndsAt: periodEnd,
    },
  });
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tier: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
    },
  });

  // Send cancellation email
  if (user.email) {
    await sendSubscriptionEmail(user.email, user.name || "", "canceled");
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "past_due" },
  });

  // Send payment failed email
  if (user.email) {
    await sendSubscriptionEmail(user.email, user.name || "", "payment_failed");
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const sub = (invoice as any).subscription;
  const subscriptionId =
    typeof sub === "string"
      ? sub
      : sub?.id;

  if (!subscriptionId || !stripe) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Retrieve the updated subscription for the new period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "active",
      subscriptionEndsAt: periodEnd,
    },
  });
}

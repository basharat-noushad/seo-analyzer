/**
 * Stripe Webhook Handler
 *
 * Handles subscription events from Stripe
 * Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, constructWebhookEvent, mapSubscriptionStatus, getTierFromSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log(`Received Stripe webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed', session.id)

  const userId = session.client_reference_id || session.metadata?.userId

  if (!userId) {
    console.error('No userId found in checkout session')
    return
  }

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!customerId || !subscriptionId) {
    console.error('Missing customer or subscription ID')
    return
  }

  // Get the full subscription object
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update user with Stripe customer and subscription details
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      tier: getTierFromSubscription(subscription),
      subscriptionStatus: mapSubscriptionStatus(subscription.status),
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`User ${userId} subscription activated: ${subscriptionId}`)

  // TODO: Send welcome email
  // TODO: Track conversion event
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription.updated', subscription.id)

  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  const tier = getTierFromSubscription(subscription)
  const status = mapSubscriptionStatus(subscription.status)

  // Update user subscription details
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier,
      subscriptionStatus: status,
      subscriptionEndsAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`User ${user.id} subscription updated: ${tier} - ${status}`)

  // If subscription is being canceled at period end
  if (subscription.cancel_at_period_end) {
    console.log(`Subscription ${subscription.id} will cancel at ${new Date(subscription.cancel_at! * 1000)}`)
    // TODO: Send cancellation confirmation email
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription.deleted', subscription.id)

  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Downgrade user to free tier
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier: 'free',
      subscriptionStatus: 'canceled',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`User ${user.id} downgraded to free tier`)

  // TODO: Send downgrade notification email
  // TODO: Track churn event
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded', invoice.id)

  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) {
    // One-time payment, not a subscription renewal
    return
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Get the subscription to update period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  })

  console.log(`Payment succeeded for user ${user.id}`)

  // TODO: Send payment receipt email
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed', invoice.id)

  const customerId = invoice.customer as string

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`No user found for customer ${customerId}`)
    return
  }

  // Update subscription status to past_due
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  })

  console.log(`Payment failed for user ${user.id}`)

  // TODO: Send payment failed notification email
  // TODO: Create alert for user
}

/**
 * Stripe Checkout Session API
 *
 * Creates a Stripe checkout session for subscription upgrades
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createCheckoutSession, STRIPE_PLANS, type StripePlanKey } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'agency']),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid plan', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { plan } = validation.data

    // Check if user already has this plan
    if (user.tier === plan) {
      return NextResponse.json(
        { error: 'You already have this plan' },
        { status: 400 }
      )
    }

    // Check if user already has a higher tier
    if (user.tier === 'agency' && plan === 'pro') {
      return NextResponse.json(
        { error: 'Cannot downgrade to Pro from Agency. Please contact support.' },
        { status: 400 }
      )
    }

    // Get the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      planKey: plan as StripePlanKey,
      successUrl: `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

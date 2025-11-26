/**
 * Stripe Customer Portal API
 *
 * Creates a Stripe customer portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createCustomerPortalSession, getOrCreateCustomer } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

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

    // Check if user has a subscription
    if (user.tier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await getOrCreateCustomer({
        userId: user.id,
        email: user.email,
        name: user.name || undefined,
      })

      customerId = customer.id

      // Update user with customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Get the base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create portal session
    const session = await createCustomerPortalSession({
      customerId,
      returnUrl: `${baseUrl}/dashboard/billing`,
    })

    return NextResponse.json({
      url: session.url,
    })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    )
  }
}

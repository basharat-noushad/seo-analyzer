/**
 * Reactivate Subscription API
 *
 * Reactivates a canceled subscription before period end
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { reactivateSubscription } from '@/lib/stripe'

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
    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Reactivate subscription
    const subscription = await reactivateSubscription(user.stripeSubscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })
  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}

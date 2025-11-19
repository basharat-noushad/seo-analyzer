/**
 * Authentication Utilities
 *
 * Helper functions for managing authentication throughout the app.
 * Use these in Server Components and API routes.
 */

import { getServerSession } from "@/lib/auth-config"
import { prisma } from "./db"
import { redirect } from "next/navigation"

/**
 * Get the current user from the session
 * Returns null if no user is logged in
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        tier: true,
        emailVerified: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        createdAt: true,
      }
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

/**
 * Require admin role - redirects if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return user
}

/**
 * Check if user has a specific tier or higher
 */
export async function checkUserTier(requiredTier: "free" | "pro" | "agency") {
  const user = await requireAuth()

  const tierHierarchy = {
    free: 0,
    pro: 1,
    agency: 2,
  }

  const userTierLevel = tierHierarchy[user.tier as keyof typeof tierHierarchy] || 0
  const requiredTierLevel = tierHierarchy[requiredTier]

  return userTierLevel >= requiredTierLevel
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      isSubscribed: false,
      tier: "free",
      status: null,
      endsAt: null,
    }
  }

  return {
    isSubscribed: user.subscriptionStatus === "active",
    tier: user.tier,
    status: user.subscriptionStatus,
    endsAt: user.subscriptionEndsAt,
  }
}

/**
 * API Auth - for use in API routes
 * Throws error if not authenticated
 */
export async function requireApiAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

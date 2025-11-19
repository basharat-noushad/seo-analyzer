/**
 * API Authentication Middleware
 * Validates API keys for public API access
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export interface ApiContext {
  userId: string
  apiKeyId: string
  permissions: any
}

/**
 * Authenticate API request using API key
 */
export async function authenticateApiRequest(
  req: NextRequest
): Promise<{ success: boolean; context?: ApiContext; error?: string }> {
  // Extract API key from Authorization header
  const authHeader = req.headers.get("authorization")

  if (!authHeader) {
    return { success: false, error: "Missing authorization header" }
  }

  // Expected format: "Bearer sk_live_..."
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { success: false, error: "Invalid authorization header format" }
  }

  const apiKey = parts[1]

  // Validate key format
  if (!apiKey.startsWith("sk_live_")) {
    return { success: false, error: "Invalid API key format" }
  }

  // Hash the provided key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

  // Look up the key in database
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          tier: true,
          role: true,
        },
      },
    },
  })

  if (!apiKeyRecord) {
    return { success: false, error: "Invalid API key" }
  }

  // Check if key is expired
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return { success: false, error: "API key has expired" }
  }

  // Update last used timestamp (async, don't await)
  prisma.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((error: any) => console.error("Failed to update lastUsedAt:", error))

  // Return authentication context
  return {
    success: true,
    context: {
      userId: apiKeyRecord.userId,
      apiKeyId: apiKeyRecord.id,
      permissions: apiKeyRecord.permissions,
    },
  }
}

/**
 * Log API usage for analytics and rate limiting
 */
export async function logApiUsage(data: {
  apiKeyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime?: number
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.apiUsageLog.create({
      data: {
        apiKeyId: data.apiKeyId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to log API usage:", error)
  }
}

/**
 * Check rate limit for API key
 * Returns true if rate limit is exceeded
 */
export async function isRateLimitExceeded(
  apiKeyId: string,
  windowMinutes: number = 60,
  maxRequests: number = 1000
): Promise<boolean> {
  try {
    const windowStart = new Date()
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes)

    const count = await prisma.apiUsageLog.count({
      where: {
        apiKeyId,
        createdAt: {
          gte: windowStart,
        },
      },
    })

    return count >= maxRequests
  } catch (error) {
    console.error("Failed to check rate limit:", error)
    return false // Fail open
  }
}

/**
 * Check if API key has specific permission
 */
export function hasApiPermission(
  context: ApiContext,
  resource: string,
  action: "read" | "write"
): boolean {
  // If no permissions specified, allow all
  if (!context.permissions) {
    return true
  }

  const permissions = context.permissions as Record<string, string[]>

  // Check if resource exists and has the required action
  return permissions[resource]?.includes(action) || false
}

/**
 * Helper to create authenticated API response with error
 */
export function createApiError(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Helper to create successful API response
 */
export function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      ...data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Rate limit tiers by user tier
 */
export const RATE_LIMITS = {
  free: {
    windowMinutes: 60,
    maxRequests: 100,
  },
  pro: {
    windowMinutes: 60,
    maxRequests: 1000,
  },
  agency: {
    windowMinutes: 60,
    maxRequests: 10000,
  },
} as const

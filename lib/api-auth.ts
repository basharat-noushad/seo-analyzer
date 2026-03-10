/**
 * API Authentication Middleware
 * Validates API keys for public API access
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"
import { apiError, apiSuccess } from "@/lib/api-response"

export type ApiPermissions = Record<string, ('read' | 'write')[]>

export interface ApiContext {
  userId: string
  apiKeyId: string
  permissions: ApiPermissions | null
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
    .catch((error: Error) => console.error("Failed to update lastUsedAt:", error.message))

  // Return authentication context
  return {
    success: true,
    context: {
      userId: apiKeyRecord.userId,
      apiKeyId: apiKeyRecord.id,
      permissions: apiKeyRecord.permissions as ApiPermissions | null,
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
  // No permissions object means full access
  if (!context.permissions) return true
  return context.permissions[resource]?.includes(action) ?? false
}

/**
 * Helper to create authenticated API response with error
 */
export function createApiError(message: string, status: number = 400) {
  return apiError(message, status)
}

/**
 * Helper to create successful API response
 */
export function createApiResponse(data: Record<string, unknown>, status: number = 200) {
  return apiSuccess(data, status)
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

/**
 * Log a completed v1 API request.
 * Wraps logApiUsage so callers don't repeat the same boilerplate.
 */
export async function logRequest(
  req: NextRequest,
  context: ApiContext,
  endpoint: string,
  method: string,
  statusCode: number,
  startTime: number
): Promise<void> {
  await logApiUsage({
    apiKeyId: context.apiKeyId,
    endpoint,
    method,
    statusCode,
    responseTime: Date.now() - startTime,
    ipAddress: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  })
}

/**
 * Checks the API key rate limit for a given context.
 * Returns a 429 error response if exceeded, otherwise null.
 */
export async function checkApiRateLimit(
  context: ApiContext
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    select: { tier: true },
  })

  const limits = RATE_LIMITS[user?.tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
  const exceeded = await isRateLimitExceeded(
    context.apiKeyId,
    limits.windowMinutes,
    limits.maxRequests
  )

  return exceeded ? createApiError("Rate limit exceeded", 429) : null
}

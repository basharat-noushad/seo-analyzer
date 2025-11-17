import { NextRequest } from "next/server"
import {
  authenticateApiRequest,
  hasApiPermission,
  createApiError,
  createApiResponse,
  logApiUsage,
  isRateLimitExceeded,
  RATE_LIMITS,
} from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/projects
 * List all projects for the authenticated user
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Authenticate request
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    // Check permissions
    if (!hasApiPermission(context, "projects", "read")) {
      return createApiError("Insufficient permissions", 403)
    }

    // Check rate limit
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { tier: true },
    })

    const limits = RATE_LIMITS[user?.tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
    const rateLimitExceeded = await isRateLimitExceeded(
      context.apiKeyId,
      limits.windowMinutes,
      limits.maxRequests
    )

    if (rateLimitExceeded) {
      return createApiError("Rate limit exceeded", 429)
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Fetch projects
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId: context.userId },
        select: {
          id: true,
          name: true,
          domain: true,
          description: true,
          seoScore: true,
          lastScanAt: true,
          monitoringEnabled: true,
          monitoringFrequency: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              analyses: true,
              issues: true,
              keywords: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.project.count({
        where: { userId: context.userId },
      }),
    ])

    // Log API usage
    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: "/api/v1/projects",
      method: "GET",
      statusCode: 200,
      responseTime,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return createApiResponse({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

/**
 * POST /api/v1/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Authenticate request
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    // Check permissions
    if (!hasApiPermission(context, "projects", "write")) {
      return createApiError("Insufficient permissions", 403)
    }

    // Check rate limit
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { tier: true },
    })

    const limits = RATE_LIMITS[user?.tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
    const rateLimitExceeded = await isRateLimitExceeded(
      context.apiKeyId,
      limits.windowMinutes,
      limits.maxRequests
    )

    if (rateLimitExceeded) {
      return createApiError("Rate limit exceeded", 429)
    }

    // Parse body
    const body = await req.json()
    const { name, domain, description } = body

    // Validate required fields
    if (!name || !domain) {
      return createApiError("Name and domain are required", 400)
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        userId: context.userId,
        name,
        domain,
        description,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        description: true,
        seoScore: true,
        lastScanAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log API usage
    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: "/api/v1/projects",
      method: "POST",
      statusCode: 201,
      responseTime,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return createApiResponse({ project }, 201)
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

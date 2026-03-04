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
 * GET /api/v1/analyses
 * List analyses for the authenticated user
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    if (!hasApiPermission(context, "analyses", "read")) {
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

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")
    const projectId = searchParams.get("projectId")
    const type = searchParams.get("type")

    const where: any = { userId: context.userId }
    if (projectId) where.projectId = projectId
    if (type) where.type = type

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        select: {
          id: true,
          url: true,
          type: true,
          status: true,
          seoScore: true,
          performanceScore: true,
          criticalIssues: true,
          highIssues: true,
          mediumIssues: true,
          lowIssues: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.analysis.count({ where }),
    ])

    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: "/api/v1/analyses",
      method: "GET",
      statusCode: 200,
      responseTime,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return createApiResponse({
      analyses,
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
 * POST /api/v1/analyses
 * Trigger a new analysis
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    if (!hasApiPermission(context, "analyses", "write")) {
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

    // Check usage limits
    const { checkUsageLimit } = await import("@/lib/usage-limits")
    const usageCheck = await checkUsageLimit(context.userId, "run_analysis")
    if (!usageCheck.allowed) {
      return createApiError(usageCheck.message || "Usage limit reached", 403)
    }

    const body = await req.json()
    const { url, projectId, type = "page" } = body

    if (!url) {
      return createApiError("URL is required", 400)
    }

    // If projectId provided, verify ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: context.userId,
        },
      })

      if (!project) {
        return createApiError("Project not found", 404)
      }
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: context.userId,
        projectId: projectId || null,
        url,
        type,
        status: "pending",
      },
      select: {
        id: true,
        url: true,
        type: true,
        status: true,
        createdAt: true,
      },
    })

    // Trigger background analysis processing
    import("@/lib/analysis-processor")
      .then(({ processAnalysis }) => processAnalysis(analysis.id))
      .catch((err) => console.error("Analysis processing error:", err))

    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: "/api/v1/analyses",
      method: "POST",
      statusCode: 201,
      responseTime,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return createApiResponse(
      {
        analysis,
        message: "Analysis created. Check status at /api/v1/analyses/{id}",
      },
      201
    )
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

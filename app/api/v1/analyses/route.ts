import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
import {
  authenticateApiRequest,
  hasApiPermission,
  createApiError,
  createApiResponse,
  logRequest,
  checkApiRateLimit,
} from "@/lib/api-auth"
import { prisma } from "@/lib/db"
import { checkUsageLimit } from "@/lib/usage-limits"

/**
 * GET /api/v1/analyses
 * List analyses for the authenticated user
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) return createApiError(auth.error || "Unauthorized", 401)

    const context = auth.context!

    if (!hasApiPermission(context, "analyses", "read")) {
      return createApiError("Insufficient permissions", 403)
    }

    const rateLimitErr = await checkApiRateLimit(context)
    if (rateLimitErr) return rateLimitErr

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")
    const projectId = searchParams.get("projectId")
    const type = searchParams.get("type")

    const where: Prisma.AnalysisWhereInput = { userId: context.userId }
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
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.analysis.count({ where }),
    ])

    await logRequest(req, context, "/api/v1/analyses", "GET", 200, startTime)

    return createApiResponse({ analyses, pagination: { total, limit, offset, hasMore: offset + limit < total } })
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
    if (!auth.success) return createApiError(auth.error || "Unauthorized", 401)

    const context = auth.context!

    if (!hasApiPermission(context, "analyses", "write")) {
      return createApiError("Insufficient permissions", 403)
    }

    const rateLimitErr = await checkApiRateLimit(context)
    if (rateLimitErr) return rateLimitErr

    const usageCheck = await checkUsageLimit(context.userId, "run_analysis")
    if (!usageCheck.allowed) {
      return createApiError(usageCheck.message || "Usage limit reached", 403)
    }

    const body = await req.json()
    const { url, projectId, type = "page" } = body

    if (!url) return createApiError("URL is required", 400)

    if (projectId) {
      const owned = await prisma.project.count({ where: { id: projectId, userId: context.userId } })
      if (!owned) return createApiError("Project not found", 404)
    }

    const analysis = await prisma.analysis.create({
      data: { userId: context.userId, projectId: projectId || null, url, type, status: "pending" },
      select: { id: true, url: true, type: true, status: true, createdAt: true },
    })

    // Fire-and-forget background processing
    import("@/lib/analysis-processor")
      .then(({ processAnalysis }) => processAnalysis(analysis.id))
      .catch((err: Error) => console.error("Analysis processing error:", err.message))

    await logRequest(req, context, "/api/v1/analyses", "POST", 201, startTime)

    return createApiResponse(
      { analysis, message: "Analysis created. Check status at /api/v1/analyses/{id}" },
      201
    )
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

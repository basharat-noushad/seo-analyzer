import { NextRequest } from "next/server"
import {
  authenticateApiRequest,
  hasApiPermission,
  createApiError,
  createApiResponse,
  logRequest,
  checkApiRateLimit,
} from "@/lib/api-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/v1/projects
 * List all projects for the authenticated user
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) return createApiError(auth.error || "Unauthorized", 401)

    const context = auth.context!

    if (!hasApiPermission(context, "projects", "read")) {
      return createApiError("Insufficient permissions", 403)
    }

    const rateLimitErr = await checkApiRateLimit(context)
    if (rateLimitErr) return rateLimitErr

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

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
          _count: { select: { analyses: true, issues: true, keywords: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.project.count({ where: { userId: context.userId } }),
    ])

    await logRequest(req, context, "/api/v1/projects", "GET", 200, startTime)

    return createApiResponse({ projects, pagination: { total, limit, offset, hasMore: offset + limit < total } })
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
    const auth = await authenticateApiRequest(req)
    if (!auth.success) return createApiError(auth.error || "Unauthorized", 401)

    const context = auth.context!

    if (!hasApiPermission(context, "projects", "write")) {
      return createApiError("Insufficient permissions", 403)
    }

    const rateLimitErr = await checkApiRateLimit(context)
    if (rateLimitErr) return rateLimitErr

    const body = await req.json()
    const { name, domain, description } = body

    if (!name || !domain) return createApiError("Name and domain are required", 400)

    const project = await prisma.project.create({
      data: { userId: context.userId, name, domain, description },
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

    await logRequest(req, context, "/api/v1/projects", "POST", 201, startTime)

    return createApiResponse({ project }, 201)
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

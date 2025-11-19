import { NextRequest } from "next/server"
import {
  authenticateApiRequest,
  hasApiPermission,
  createApiError,
  createApiResponse,
  logApiUsage,
} from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/projects/[id]
 * Get a specific project by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    if (!hasApiPermission(context, "projects", "read")) {
      return createApiError("Insufficient permissions", 403)
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: context.userId,
      },
      include: {
        _count: {
          select: {
            analyses: true,
            issues: true,
            keywords: true,
            pages: true,
          },
        },
      },
    })

    if (!project) {
      return createApiError("Project not found", 404)
    }

    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: `/api/v1/projects/${params.id}`,
      method: "GET",
      statusCode: 200,
      responseTime,
    })

    return createApiResponse({ project })
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

/**
 * PATCH /api/v1/projects/[id]
 * Update a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    if (!hasApiPermission(context, "projects", "write")) {
      return createApiError("Insufficient permissions", 403)
    }

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: context.userId,
      },
    })

    if (!existingProject) {
      return createApiError("Project not found", 404)
    }

    const body = await req.json()
    const { name, domain, description, monitoringEnabled, monitoringFrequency } = body

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(description !== undefined && { description }),
        ...(monitoringEnabled !== undefined && { monitoringEnabled }),
        ...(monitoringFrequency && { monitoringFrequency }),
      },
    })

    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: `/api/v1/projects/${params.id}`,
      method: "PATCH",
      statusCode: 200,
      responseTime,
    })

    return createApiResponse({ project })
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

/**
 * DELETE /api/v1/projects/[id]
 * Delete a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    const auth = await authenticateApiRequest(req)
    if (!auth.success) {
      return createApiError(auth.error || "Unauthorized", 401)
    }

    const context = auth.context!

    if (!hasApiPermission(context, "projects", "write")) {
      return createApiError("Insufficient permissions", 403)
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: context.userId,
      },
    })

    if (!existingProject) {
      return createApiError("Project not found", 404)
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    const responseTime = Date.now() - startTime
    await logApiUsage({
      apiKeyId: context.apiKeyId,
      endpoint: `/api/v1/projects/${params.id}`,
      method: "DELETE",
      statusCode: 200,
      responseTime,
    })

    return createApiResponse({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return createApiError("Internal server error", 500)
  }
}

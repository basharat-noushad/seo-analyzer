import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/alerts
 * Get all alerts for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const type = searchParams.get("type")
    const severity = searchParams.get("severity")
    const read = searchParams.get("read")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build query
    const where: any = {
      userId: session.user.id,
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (type) {
      where.type = type
    }

    if (severity) {
      where.severity = severity
    }

    if (read !== null && read !== undefined) {
      where.read = read === "true"
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Get unread count
    const unreadCount = await prisma.alert.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    })

    // Get stats
    const stats = {
      total: alerts.length,
      unread: unreadCount,
      critical: await prisma.alert.count({
        where: { userId: session.user.id, severity: "critical", read: false },
      }),
      high: await prisma.alert.count({
        where: { userId: session.user.id, severity: "high", read: false },
      }),
    }

    return NextResponse.json({ alerts, stats })
  } catch (error: any) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts
 * Create a new alert (typically called internally by monitoring system)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, type, severity, title, message } = body

    if (!type || !severity || !title) {
      return NextResponse.json(
        { error: "Type, severity, and title are required" },
        { status: 400 }
      )
    }

    // Validate severity
    if (!["critical", "high", "medium", "low"].includes(severity)) {
      return NextResponse.json(
        { error: "Invalid severity level" },
        { status: 400 }
      )
    }

    // If projectId provided, verify ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        )
      }
    }

    const alert = await prisma.alert.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        type,
        severity,
        title,
        message: message || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating alert:", error)
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/alerts
 * Bulk update alerts (mark multiple as read)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { alertIds, read } = body

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return NextResponse.json(
        { error: "Alert IDs array is required" },
        { status: 400 }
      )
    }

    // Update alerts (only if they belong to the user)
    const result = await prisma.alert.updateMany({
      where: {
        id: { in: alertIds },
        userId: session.user.id,
      },
      data: {
        read: read !== false,
      },
    })

    return NextResponse.json({
      message: `${result.count} alert(s) updated`,
      count: result.count,
    })
  } catch (error: any) {
    console.error("Error updating alerts:", error)
    return NextResponse.json(
      { error: "Failed to update alerts" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/alerts
 * Bulk delete alerts
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const alertIdsParam = searchParams.get("ids")

    if (!alertIdsParam) {
      return NextResponse.json(
        { error: "Alert IDs are required" },
        { status: 400 }
      )
    }

    const alertIds = alertIdsParam.split(",")

    // Delete alerts (only if they belong to the user)
    const result = await prisma.alert.deleteMany({
      where: {
        id: { in: alertIds },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: `${result.count} alert(s) deleted`,
      count: result.count,
    })
  } catch (error: any) {
    console.error("Error deleting alerts:", error)
    return NextResponse.json(
      { error: "Failed to delete alerts" },
      { status: 500 }
    )
  }
}

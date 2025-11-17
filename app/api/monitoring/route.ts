import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/monitoring
 * Get all monitoring jobs for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status") // active, paused, failed

    // Build query
    const where: any = {}

    // Get user's projects first
    const userProjects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
    const projectIds = userProjects.map((p: any) => p.id)

    where.projectId = { in: projectIds }

    if (projectId) {
      where.projectId = projectId
    }

    if (status) {
      where.status = status
    }

    const monitoringJobs = await prisma.monitoringJob.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        page: {
          select: {
            id: true,
            url: true,
            pageTitle: true,
          },
        },
      },
      orderBy: { nextRunAt: "asc" },
    })

    return NextResponse.json({ monitoringJobs })
  } catch (error: any) {
    console.error("Error fetching monitoring jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch monitoring jobs" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/monitoring
 * Create or update a monitoring job
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, pageId, frequency } = body

    if (!projectId || !frequency) {
      return NextResponse.json(
        { error: "Project ID and frequency are required" },
        { status: 400 }
      )
    }

    // Verify project ownership
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

    // Calculate next run time based on frequency
    const nextRunAt = calculateNextRunTime(frequency)

    // Check if monitoring job already exists
    const existingJob = await prisma.monitoringJob.findFirst({
      where: {
        projectId,
        pageId: pageId || null,
      },
    })

    let monitoringJob

    if (existingJob) {
      // Update existing job
      monitoringJob = await prisma.monitoringJob.update({
        where: { id: existingJob.id },
        data: {
          frequency,
          nextRunAt,
          status: "active",
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          page: {
            select: {
              id: true,
              url: true,
              pageTitle: true,
            },
          },
        },
      })
    } else {
      // Create new job
      monitoringJob = await prisma.monitoringJob.create({
        data: {
          projectId,
          pageId: pageId || null,
          frequency,
          nextRunAt,
          status: "active",
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          page: {
            select: {
              id: true,
              url: true,
              pageTitle: true,
            },
          },
        },
      })
    }

    // Update project monitoring status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        monitoringEnabled: true,
        monitoringFrequency: frequency,
      },
    })

    return NextResponse.json({ monitoringJob }, { status: existingJob ? 200 : 201 })
  } catch (error: any) {
    console.error("Error creating monitoring job:", error)
    return NextResponse.json(
      { error: "Failed to create monitoring job" },
      { status: 500 }
    )
  }
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRunTime(frequency: string): Date {
  const now = new Date()

  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}

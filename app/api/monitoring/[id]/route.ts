import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * PATCH /api/monitoring/[id]
 * Update monitoring job status (pause/resume)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !["active", "paused", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required (active, paused, failed)" },
        { status: 400 }
      )
    }

    // Get monitoring job and verify ownership
    const monitoringJob = await prisma.monitoringJob.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    })

    if (!monitoringJob) {
      return NextResponse.json(
        { error: "Monitoring job not found" },
        { status: 404 }
      )
    }

    if (monitoringJob.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Update status
    const updated = await prisma.monitoringJob.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json({ monitoringJob: updated })
  } catch (error) {
    console.error("Error updating monitoring job:", error)
    return NextResponse.json(
      { error: "Failed to update monitoring job" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/monitoring/[id]
 * Delete a monitoring job
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get monitoring job and verify ownership
    const monitoringJob = await prisma.monitoringJob.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    })

    if (!monitoringJob) {
      return NextResponse.json(
        { error: "Monitoring job not found" },
        { status: 404 }
      )
    }

    if (monitoringJob.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Delete monitoring job
    await prisma.monitoringJob.delete({
      where: { id: params.id },
    })

    // Check if there are other active monitoring jobs for this project
    const remainingJobs = await prisma.monitoringJob.count({
      where: {
        projectId: monitoringJob.projectId,
        status: "active",
      },
    })

    // If no more active jobs, update project monitoring status
    if (remainingJobs === 0) {
      await prisma.project.update({
        where: { id: monitoringJob.projectId },
        data: {
          monitoringEnabled: false,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting monitoring job:", error)
    return NextResponse.json(
      { error: "Failed to delete monitoring job" },
      { status: 500 }
    )
  }
}

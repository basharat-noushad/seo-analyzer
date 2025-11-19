/**
 * Individual Project API Routes
 *
 * GET    /api/projects/[id] - Get project details
 * PATCH  /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireApiAuth()
    const { id } = params

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        pages: true,
        _count: {
          select: {
            analyses: true,
            issues: true,
            keywords: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireApiAuth()
    const { id } = params
    const body = await req.json()

    const { name, domain, description, monitoringEnabled, monitoringFrequency } = body

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Validate domain if provided
    if (domain) {
      try {
        new URL(domain)
      } catch {
        return NextResponse.json(
          { error: "Invalid domain URL" },
          { status: 400 }
        )
      }
    }

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(description !== undefined && { description }),
        ...(monitoringEnabled !== undefined && { monitoringEnabled }),
        ...(monitoringFrequency && { monitoringFrequency }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      project,
      message: "Project updated successfully",
    })
  } catch (error) {
    console.error("Error updating project:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

// PUT is an alias for PATCH
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(req, { params })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireApiAuth()
    const { id } = params

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Delete project (cascades to related records due to schema)
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Project deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting project:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}

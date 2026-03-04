/**
 * Projects API Routes
 *
 * GET  /api/projects - List all projects for current user
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth()

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            pages: true,
            analyses: true,
            issues: true,
          },
        },
      },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const body = await req.json()

    const { name, domain, description } = body

    // Validation
    if (!name || !domain) {
      return NextResponse.json(
        { error: "Name and domain are required" },
        { status: 400 }
      )
    }

    // Check tier limits using centralized usage limits
    const { checkUsageLimit } = await import("@/lib/usage-limits")
    const usageCheck = await checkUsageLimit(user.id, "create_project")
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.message,
          code: "TIER_LIMIT_REACHED",
          currentCount: usageCheck.current,
          limit: usageCheck.limit,
        },
        { status: 403 }
      )
    }

    // Validate domain URL
    try {
      new URL(domain)
    } catch {
      return NextResponse.json(
        { error: "Invalid domain URL" },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name,
        domain,
        description: description || null,
      },
    })

    return NextResponse.json(
      { project, message: "Project created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating project:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}

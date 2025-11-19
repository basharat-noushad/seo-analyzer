/**
 * Projects API Routes
 *
 * GET  /api/projects - List all projects for current user
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Tier limits for projects
const TIER_LIMITS = {
  free: 1,
  pro: 10,
  agency: Infinity,
}

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

    // Check tier limits
    const projectCount = await prisma.project.count({
      where: { userId: user.id },
    })

    const limit = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] || 1

    if (projectCount >= limit) {
      return NextResponse.json(
        {
          error: `Project limit reached for ${user.tier} tier. Please upgrade to create more projects.`,
          code: "TIER_LIMIT_REACHED",
          currentCount: projectCount,
          limit,
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

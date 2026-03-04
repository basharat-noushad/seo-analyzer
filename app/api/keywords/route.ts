/**
 * Keywords API Routes
 *
 * GET  /api/keywords - List keywords for a project
 * POST /api/keywords - Save a keyword to track
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    // Build query to get keywords for user's projects
    const where: any = {}
    if (projectId) {
      // Verify project belongs to user
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      })
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        )
      }
      where.projectId = projectId
    } else {
      // Get keywords for all user's projects
      where.project = { userId: user.id }
    }

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
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

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("Error fetching keywords:", error)
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

    const { projectId, keyword, searchVolume, difficulty, targetUrl } = body

    // Validation
    if (!projectId || !keyword) {
      return NextResponse.json(
        { error: "Project ID and keyword are required" },
        { status: 400 }
      )
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check usage limits
    const { checkUsageLimit } = await import("@/lib/usage-limits")
    const usageCheck = await checkUsageLimit(user.id, "add_keyword")
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message, code: "TIER_LIMIT_REACHED" },
        { status: 403 }
      )
    }

    // Check if keyword already exists for this project
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        projectId,
        keyword: keyword.toLowerCase(),
      },
    })

    if (existingKeyword) {
      return NextResponse.json(
        { error: "Keyword already tracked for this project" },
        { status: 409 }
      )
    }

    // Create keyword record
    const savedKeyword = await prisma.keyword.create({
      data: {
        projectId,
        keyword: keyword.toLowerCase(),
        searchVolume: searchVolume || null,
        difficultyScore: difficulty || null,
        currentRank: null,
        targetUrl: targetUrl || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        keyword: savedKeyword,
        message: "Keyword saved successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving keyword:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save keyword" },
      { status: 500 }
    )
  }
}

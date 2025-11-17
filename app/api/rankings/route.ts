/**
 * Rankings API Routes
 *
 * GET  /api/rankings - List ranking history
 * POST /api/rankings - Save a ranking check
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const keywordId = searchParams.get("keywordId")

    const where: any = {}

    if (keywordId) {
      // Get rankings for a specific keyword
      where.keywordId = keywordId
    } else if (projectId) {
      // Get rankings for all keywords in a project
      where.keyword = {
        projectId: projectId,
        userId: user.id,
      }
    } else {
      // Get all rankings for user
      where.keyword = {
        userId: user.id,
      }
    }

    const rankings = await prisma.ranking.findMany({
      where,
      orderBy: { checkedAt: "desc" },
      take: 500,
      include: {
        keyword: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ rankings })
  } catch (error) {
    console.error("Error fetching rankings:", error)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { projectId, keyword, url, rank, searchEngine, country } = await req.json()

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

    // Find or create keyword
    let keywordRecord = await prisma.keyword.findFirst({
      where: {
        projectId,
        keyword: keyword.toLowerCase(),
      },
    })

    if (!keywordRecord) {
      // Create new keyword record
      keywordRecord = await prisma.keyword.create({
        data: {
          userId: user.id,
          projectId,
          keyword: keyword.toLowerCase(),
          currentRank: rank,
          bestRank: rank,
          previousRank: null,
        },
      })
    } else {
      // Update keyword with new rank
      const updates: any = {
        previousRank: keywordRecord.currentRank,
        currentRank: rank,
      }

      // Update best rank if current is better
      if (rank && (!keywordRecord.bestRank || rank < keywordRecord.bestRank)) {
        updates.bestRank = rank
      }

      keywordRecord = await prisma.keyword.update({
        where: { id: keywordRecord.id },
        data: updates,
      })
    }

    // Create ranking record
    const ranking = await prisma.ranking.create({
      data: {
        keywordId: keywordRecord.id,
        rank: rank || null,
        url: url || null,
        searchEngine: searchEngine || "google",
        country: country || "US",
        checkedAt: new Date(),
      },
      include: {
        keyword: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        ranking,
        keyword: keywordRecord,
        message: "Ranking saved successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving ranking:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save ranking" },
      { status: 500 }
    )
  }
}

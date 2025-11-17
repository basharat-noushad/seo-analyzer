/**
 * Bulk Keywords API
 *
 * POST /api/keywords/bulk - Save multiple keywords at once
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { keywords } = await req.json()

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "Keywords array is required" },
        { status: 400 }
      )
    }

    // Validate all keywords have required fields
    for (const kw of keywords) {
      if (!kw.projectId || !kw.keyword) {
        return NextResponse.json(
          { error: "Each keyword must have projectId and keyword" },
          { status: 400 }
        )
      }
    }

    // Verify all projects belong to user
    const projectIds = [...new Set(keywords.map(kw => kw.projectId))]
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        userId: user.id,
      },
    })

    if (projects.length !== projectIds.length) {
      return NextResponse.json(
        { error: "One or more projects not found" },
        { status: 404 }
      )
    }

    // Get existing keywords to avoid duplicates
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        userId: user.id,
        projectId: { in: projectIds },
      },
      select: {
        projectId: true,
        keyword: true,
      },
    })

    const existingSet = new Set(
      existingKeywords.map(kw => `${kw.projectId}:${kw.keyword.toLowerCase()}`)
    )

    // Filter out duplicates
    const newKeywords = keywords.filter(kw => {
      const key = `${kw.projectId}:${kw.keyword.toLowerCase()}`
      return !existingSet.has(key)
    })

    if (newKeywords.length === 0) {
      return NextResponse.json(
        {
          message: "All keywords already tracked",
          saved: 0,
          skipped: keywords.length,
        },
        { status: 200 }
      )
    }

    // Create keyword records
    const created = await prisma.keyword.createMany({
      data: newKeywords.map(kw => ({
        userId: user.id,
        projectId: kw.projectId,
        keyword: kw.keyword.toLowerCase(),
        searchVolume: kw.searchVolume || null,
        difficulty: kw.difficulty || null,
        cpc: kw.cpc || null,
        competition: kw.competition || null,
        currentRank: null,
        bestRank: null,
        previousRank: null,
      })),
    })

    return NextResponse.json(
      {
        message: "Keywords saved successfully",
        saved: created.count,
        skipped: keywords.length - created.count,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving keywords:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save keywords" },
      { status: 500 }
    )
  }
}

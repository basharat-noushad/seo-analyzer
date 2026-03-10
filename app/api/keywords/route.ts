/**
 * Keywords API Routes
 *
 * GET  /api/keywords - List keywords for a project
 * POST /api/keywords - Save a keyword to track
 */

import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkUsageLimit } from "@/lib/usage-limits"

export async function GET(req: NextRequest) {
  const user = await requireApiAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const where: Prisma.KeywordWhereInput = {}
    if (projectId) {
      const owned = await prisma.project.count({ where: { id: projectId, userId: user.id } })
      if (!owned) return NextResponse.json({ error: "Project not found" }, { status: 404 })
      where.projectId = projectId
    } else {
      where.project = { userId: user.id }
    }

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        project: {
          select: { id: true, name: true, domain: true },
        },
      },
    })

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("Error fetching keywords:", error)
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApiAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { projectId, keyword, searchVolume, difficulty, targetUrl } = body

    if (!projectId || !keyword) {
      return NextResponse.json({ error: "Project ID and keyword are required" }, { status: 400 })
    }

    const owned = await prisma.project.count({ where: { id: projectId, userId: user.id } })
    if (!owned) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const usageCheck = await checkUsageLimit(user.id, "add_keyword")
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message, code: "TIER_LIMIT_REACHED" }, { status: 403 })
    }

    const existingKeyword = await prisma.keyword.findFirst({
      where: { projectId, keyword: keyword.toLowerCase() },
    })
    if (existingKeyword) {
      return NextResponse.json({ error: "Keyword already tracked for this project" }, { status: 409 })
    }

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
        project: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ keyword: savedKeyword, message: "Keyword saved successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error saving keyword:", error)
    return NextResponse.json({ error: "Failed to save keyword" }, { status: 500 })
  }
}

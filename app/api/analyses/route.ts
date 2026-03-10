/**
 * Analyses API Routes
 *
 * GET  /api/analyses - List all analyses for current user
 * POST /api/analyses - Save a new analysis
 */

import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { calculateSeoScore } from "@/lib/seo-score"

export async function GET(req: NextRequest) {
  const user = await requireApiAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const where: Prisma.AnalysisWhereInput = { userId: user.id }
    if (projectId) where.projectId = projectId

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        project: {
          select: { id: true, name: true, domain: true },
        },
      },
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApiAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()

    const { projectId, url, competitorUrl, analysisData } = body

    // Validation
    if (!url || !analysisData) {
      return NextResponse.json(
        { error: "URL and analysis data are required" },
        { status: 400 }
      )
    }

    const competitor = analysisData.competitor || analysisData
    const seoScore = calculateSeoScore(competitor)

    // Build issue records in a single pass (counts derived from the same array)
    const issueData = buildIssues(competitor)

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        url,
        type: competitorUrl ? "competitor" : "page",
        status: "completed",
        seoScore,
        seoData: analysisData.competitor?.seo || analysisData.seo || null,
        contentData: analysisData.competitor?.content || analysisData.content || null,
        technicalData: {
          basicInfo: analysisData.competitor?.basicInfo || analysisData.basicInfo,
          technical: analysisData.competitor?.technical || analysisData.technical,
        },
        competitorUrl: competitorUrl || null,
        competitorData: competitorUrl && analysisData.mine ? analysisData.mine : null,
        comparisonData: analysisData.comparison || null,
        criticalIssues: issueData.filter(i => i.severity === "critical").length,
        highIssues: issueData.filter(i => i.severity === "high").length,
        mediumIssues: issueData.filter(i => i.severity === "medium").length,
        lowIssues: issueData.filter(i => i.severity === "low").length,
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

    // Persist issue records
    if (issueData.length > 0) {
      await prisma.issue.createMany({
        data: issueData.map(issue => ({ ...issue, analysisId: analysis.id, projectId: projectId || null })),
      })
    }

    // Update project's last scan time if associated
    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          lastScanAt: new Date(),
          seoScore: seoScore,
        },
      })
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        action: "analysis",
        creditsUsed: 1,
      },
    })

    return NextResponse.json(
      {
        analysis,
        message: "Analysis saved successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
  }
}

type IssueSeed = {
  category: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  recommendation: string
  url?: string
}

function buildIssues(competitor: any): IssueSeed[] {
  const issues: IssueSeed[] = []
  const pageUrl: string | undefined = competitor.url

  if (!competitor.seo?.title?.content) {
    issues.push({
      category: "seo",
      severity: "critical",
      title: "Missing Page Title",
      description: "The page doesn't have a title tag",
      recommendation: "Add a descriptive title tag (30-60 characters)",
      url: pageUrl,
    })
  } else {
    const titleLength: number = competitor.seo.title.length
    if (titleLength > 60) {
      issues.push({
        category: "seo",
        severity: "high",
        title: "Title Too Long",
        description: `Title is ${titleLength} characters (recommended: 30-60)`,
        recommendation: "Shorten your title to 60 characters or less",
        url: pageUrl,
      })
    } else if (titleLength < 30) {
      issues.push({
        category: "seo",
        severity: "medium",
        title: "Title Too Short",
        description: `Title is ${titleLength} characters (recommended: 30-60)`,
        recommendation: "Lengthen your title to at least 30 characters",
        url: pageUrl,
      })
    }
  }

  if (!competitor.seo?.metaDescription?.content) {
    issues.push({
      category: "seo",
      severity: "critical",
      title: "Missing Meta Description",
      description: "The page doesn't have a meta description",
      recommendation: "Add a compelling meta description (150-160 characters)",
      url: pageUrl,
    })
  }

  const h1Count: number = competitor.headings?.quality?.h1Count ?? -1
  if (h1Count === 0) {
    issues.push({
      category: "seo",
      severity: "critical",
      title: "Missing H1 Tag",
      description: "The page doesn't have an H1 heading",
      recommendation: "Add a single, descriptive H1 heading",
      url: pageUrl,
    })
  } else if (h1Count > 1) {
    issues.push({
      category: "seo",
      severity: "high",
      title: "Multiple H1 Tags",
      description: `The page has ${h1Count} H1 headings`,
      recommendation: "Use only one H1 heading per page",
      url: pageUrl,
    })
  }

  if (competitor.content?.wordCount < 300) {
    issues.push({
      category: "content",
      severity: "high",
      title: "Low Word Count",
      description: `Page has only ${competitor.content.wordCount} words`,
      recommendation: "Add more quality content (aim for 1000+ words for key pages)",
      url: pageUrl,
    })
  }

  if (competitor.media?.imagesWithoutAlt > 0) {
    issues.push({
      category: "seo",
      severity: "medium",
      title: "Images Missing Alt Text",
      description: `${competitor.media.imagesWithoutAlt} out of ${competitor.media.totalImages} images missing alt text`,
      recommendation: "Add descriptive alt text to all images",
      url: pageUrl,
    })
  }

  return issues
}

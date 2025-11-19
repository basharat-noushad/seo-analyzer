/**
 * Analyses API Routes
 *
 * GET  /api/analyses - List all analyses for current user
 * POST /api/analyses - Save a new analysis
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const where: any = { userId: user.id }
    if (projectId) {
      where.projectId = projectId
    }

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
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

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Error fetching analyses:", error)
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

    const { projectId, url, competitorUrl, analysisData } = body

    // Validation
    if (!url || !analysisData) {
      return NextResponse.json(
        { error: "URL and analysis data are required" },
        { status: 400 }
      )
    }

    // Calculate SEO score from analysis data
    const calculateSeoScore = (data: any): number => {
      let score = 50 // Base score

      const competitor = data.competitor || data

      // Title (15 points)
      if (competitor.seo?.title?.content) {
        score += 10
        if (competitor.seo.title.length >= 30 && competitor.seo.title.length <= 60) {
          score += 5
        }
      }

      // Meta description (10 points)
      if (competitor.seo?.metaDescription?.content) {
        score += 10
      }

      // H1 (10 points)
      if (competitor.headings?.quality?.h1Count === 1) {
        score += 10
      }

      // Content (15 points)
      if (competitor.content?.wordCount) {
        if (competitor.content.wordCount > 300) score += 5
        if (competitor.content.wordCount > 1000) score += 5
        if (competitor.content.paragraphCount > 3) score += 5
      }

      return Math.min(score, 100)
    }

    const seoScore = calculateSeoScore(analysisData)

    // Count issues by severity
    const countIssues = (data: any) => {
      const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      }

      const competitor = data.competitor || data

      // Critical issues
      if (!competitor.seo?.title?.content) counts.critical++
      if (!competitor.seo?.metaDescription?.content) counts.critical++
      if (competitor.headings?.quality?.h1Count !== 1) counts.critical++

      // High issues
      if (competitor.seo?.title?.length > 60 || competitor.seo?.title?.length < 30) counts.high++
      if (competitor.content?.wordCount < 300) counts.high++

      // Medium issues
      if (competitor.media?.totalImages > 0 && competitor.media?.imagesWithoutAlt > 0) {
        counts.medium++
      }

      return counts
    }

    const issueCounts = countIssues(analysisData)

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
        criticalIssues: issueCounts.critical,
        highIssues: issueCounts.high,
        mediumIssues: issueCounts.medium,
        lowIssues: issueCounts.low,
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

    // Create issue records from analysis
    await createIssuesFromAnalysis(analysis.id, projectId, analysisData)

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

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    )
  }
}

// Helper function to create issues from analysis
async function createIssuesFromAnalysis(
  analysisId: string,
  projectId: string | null,
  data: any
) {
  const issues: any[] = []
  const competitor = data.competitor || data

  // Critical: Missing title
  if (!competitor.seo?.title?.content) {
    issues.push({
      analysisId,
      projectId,
      category: "seo",
      severity: "critical",
      title: "Missing Page Title",
      description: "The page doesn't have a title tag",
      recommendation: "Add a descriptive title tag (30-60 characters)",
      url: competitor.url,
    })
  }

  // Critical: Missing meta description
  if (!competitor.seo?.metaDescription?.content) {
    issues.push({
      analysisId,
      projectId,
      category: "seo",
      severity: "critical",
      title: "Missing Meta Description",
      description: "The page doesn't have a meta description",
      recommendation: "Add a compelling meta description (150-160 characters)",
      url: competitor.url,
    })
  }

  // Critical: H1 issues
  if (competitor.headings?.quality?.h1Count === 0) {
    issues.push({
      analysisId,
      projectId,
      category: "seo",
      severity: "critical",
      title: "Missing H1 Tag",
      description: "The page doesn't have an H1 heading",
      recommendation: "Add a single, descriptive H1 heading",
      url: competitor.url,
    })
  } else if (competitor.headings?.quality?.h1Count > 1) {
    issues.push({
      analysisId,
      projectId,
      category: "seo",
      severity: "high",
      title: "Multiple H1 Tags",
      description: `The page has ${competitor.headings.quality.h1Count} H1 headings`,
      recommendation: "Use only one H1 heading per page",
      url: competitor.url,
    })
  }

  // High: Title length issues
  if (competitor.seo?.title?.content) {
    const titleLength = competitor.seo.title.length
    if (titleLength > 60) {
      issues.push({
        analysisId,
        projectId,
        category: "seo",
        severity: "high",
        title: "Title Too Long",
        description: `Title is ${titleLength} characters (recommended: 30-60)`,
        recommendation: "Shorten your title to 60 characters or less",
        url: competitor.url,
      })
    } else if (titleLength < 30) {
      issues.push({
        analysisId,
        projectId,
        category: "seo",
        severity: "medium",
        title: "Title Too Short",
        description: `Title is ${titleLength} characters (recommended: 30-60)`,
        recommendation: "Lengthen your title to at least 30 characters",
        url: competitor.url,
      })
    }
  }

  // High: Low word count
  if (competitor.content?.wordCount < 300) {
    issues.push({
      analysisId,
      projectId,
      category: "content",
      severity: "high",
      title: "Low Word Count",
      description: `Page has only ${competitor.content.wordCount} words`,
      recommendation: "Add more quality content (aim for 1000+ words for key pages)",
      url: competitor.url,
    })
  }

  // Medium: Images without alt text
  if (competitor.media?.imagesWithoutAlt > 0) {
    issues.push({
      analysisId,
      projectId,
      category: "seo",
      severity: "medium",
      title: "Images Missing Alt Text",
      description: `${competitor.media.imagesWithoutAlt} out of ${competitor.media.totalImages} images missing alt text`,
      recommendation: "Add descriptive alt text to all images",
      url: competitor.url,
    })
  }

  // Create all issues
  if (issues.length > 0) {
    await prisma.issue.createMany({
      data: issues,
    })
  }
}

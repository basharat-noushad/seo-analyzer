import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

/**
 * GET /api/reports
 * Get all reports for the user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const type = searchParams.get("type")

    // Build query
    const where: Prisma.ReportWhereInput = {}

    // Get user's projects first
    const userProjects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
    const projectIds = userProjects.map(p => p.id)

    where.projectId = { in: projectIds }

    if (projectId) {
      where.projectId = projectId
    }

    if (type) {
      where.type = type
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reports
 * Generate a new report
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, name, type, dateRangeStart, dateRangeEnd, isPublic } = body

    if (!projectId || !name || !type) {
      return NextResponse.json(
        { error: "Project ID, name, and type are required" },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Generate report data based on type
    const reportData = await generateReportData(
      projectId,
      type,
      dateRangeStart ? new Date(dateRangeStart) : undefined,
      dateRangeEnd ? new Date(dateRangeEnd) : undefined
    )

    // Generate public token if report is public
    const publicToken = isPublic ? nanoid(32) : null

    // Create report
    const report = await prisma.report.create({
      data: {
        projectId,
        createdBy: session.user.id,
        name,
        type,
        dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : null,
        dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : null,
        reportData,
        isPublic: isPublic || false,
        publicToken,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}

/**
 * Generate report data based on type
 */
async function generateReportData(
  projectId: string,
  type: string,
  dateRangeStart?: Date,
  dateRangeEnd?: Date
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      analyses: {
        where: {
          ...(dateRangeStart && dateRangeEnd
            ? {
                createdAt: {
                  gte: dateRangeStart,
                  lte: dateRangeEnd,
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      issues: {
        where: { status: "open" },
      },
      keywords: {
        include: {
          rankings: {
            orderBy: { checkedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const now = new Date()
  const startDate = dateRangeStart || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const endDate = dateRangeEnd || now

  switch (type) {
    case "seo_audit":
      return generateSEOAuditReport(project)
    case "progress":
      return generateProgressReport(project, startDate, endDate)
    case "competitor":
      return generateCompetitorReport(project)
    default:
      return generateSEOAuditReport(project)
  }
}

/**
 * Generate SEO Audit Report
 */
function generateSEOAuditReport(project: any) {
  const latestAnalysis = project.analyses[0]
  const issuesBySeverity = {
    critical: project.issues.filter((i: any) => i.severity === "critical").length,
    high: project.issues.filter((i: any) => i.severity === "high").length,
    medium: project.issues.filter((i: any) => i.severity === "medium").length,
    low: project.issues.filter((i: any) => i.severity === "low").length,
  }

  const issuesByCategory = project.issues.reduce((acc: any, issue: any) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1
    return acc
  }, {})

  return {
    summary: {
      projectName: project.name,
      domain: project.domain,
      currentSEOScore: project.seoScore || 0,
      totalIssues: project.issues.length,
      lastScan: project.lastScanAt,
    },
    seoScore: {
      current: project.seoScore || 0,
      breakdown: latestAnalysis?.seoData || {},
    },
    issues: {
      bySeverity: issuesBySeverity,
      byCategory: issuesByCategory,
      topIssues: project.issues.slice(0, 10),
    },
    technical: latestAnalysis?.technicalData || {},
    content: latestAnalysis?.contentData || {},
    recommendations: generateRecommendations(project.issues),
  }
}

/**
 * Generate Progress Report
 */
function generateProgressReport(project: any, startDate: Date, endDate: Date) {
  const analyses = project.analyses.filter((a: any) => {
    const date = new Date(a.createdAt)
    return date >= startDate && date <= endDate
  })

  const seoScores = analyses.map((a: any) => ({
    date: a.createdAt,
    score: a.seoScore,
  }))

  const issuesOverTime = analyses.map((a: any) => ({
    date: a.createdAt,
    critical: a.criticalIssues,
    high: a.highIssues,
    medium: a.mediumIssues,
    low: a.lowIssues,
  }))

  const firstScore = analyses[analyses.length - 1]?.seoScore || 0
  const lastScore = analyses[0]?.seoScore || 0
  const scoreDelta = lastScore - firstScore

  return {
    summary: {
      projectName: project.name,
      domain: project.domain,
      period: {
        start: startDate,
        end: endDate,
      },
      totalScans: analyses.length,
      scoreDelta,
      scoreImprovement: scoreDelta > 0,
    },
    seoScoreTrend: seoScores,
    issuesTrend: issuesOverTime,
    keyChanges: detectKeyChanges(analyses),
    improvements: detectImprovements(analyses),
    regressions: detectRegressions(analyses),
  }
}

/**
 * Generate Competitor Report
 */
function generateCompetitorReport(project: any) {
  // Get competitor analyses (analyses with competitorUrl)
  const competitorAnalyses = project.analyses.filter((a: any) => a.competitorUrl)

  return {
    summary: {
      projectName: project.name,
      domain: project.domain,
      competitorsAnalyzed: competitorAnalyses.length,
    },
    comparisons: competitorAnalyses.slice(0, 5).map((a: any) => ({
      competitorUrl: a.competitorUrl,
      date: a.createdAt,
      yourScore: a.seoScore,
      competitorScore: a.competitorData?.seoScore || 0,
      comparison: a.comparisonData || {},
    })),
    strengths: [],
    weaknesses: [],
    opportunities: [],
  }
}

/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues: any[]) {
  const recommendations = []

  const criticalIssues = issues.filter((i: any) => i.severity === "critical")
  if (criticalIssues.length > 0) {
    recommendations.push({
      priority: "critical",
      title: "Fix Critical SEO Issues",
      description: `You have ${criticalIssues.length} critical issue(s) that need immediate attention.`,
      actions: criticalIssues.slice(0, 3).map((i: any) => i.recommendation || i.title),
    })
  }

  const technicalIssues = issues.filter((i: any) => i.category === "technical")
  if (technicalIssues.length > 0) {
    recommendations.push({
      priority: "high",
      title: "Address Technical SEO",
      description: `${technicalIssues.length} technical issue(s) detected.`,
      actions: technicalIssues.slice(0, 3).map((i: any) => i.recommendation || i.title),
    })
  }

  return recommendations
}

/**
 * Detect key changes between analyses
 */
function detectKeyChanges(analyses: any[]) {
  const changes = []

  for (let i = 0; i < analyses.length - 1; i++) {
    const current = analyses[i]
    const previous = analyses[i + 1]

    if (Math.abs(current.seoScore - previous.seoScore) >= 10) {
      changes.push({
        date: current.createdAt,
        type: "seo_score",
        description: `SEO score changed from ${previous.seoScore} to ${current.seoScore}`,
        delta: current.seoScore - previous.seoScore,
      })
    }
  }

  return changes
}

/**
 * Detect improvements
 */
function detectImprovements(analyses: any[]) {
  const improvements = []

  for (let i = 0; i < analyses.length - 1; i++) {
    const current = analyses[i]
    const previous = analyses[i + 1]

    if (current.seoScore > previous.seoScore) {
      improvements.push({
        date: current.createdAt,
        metric: "SEO Score",
        improvement: current.seoScore - previous.seoScore,
      })
    }

    if (current.criticalIssues < previous.criticalIssues) {
      improvements.push({
        date: current.createdAt,
        metric: "Critical Issues",
        improvement: previous.criticalIssues - current.criticalIssues,
      })
    }
  }

  return improvements
}

/**
 * Detect regressions
 */
function detectRegressions(analyses: any[]) {
  const regressions = []

  for (let i = 0; i < analyses.length - 1; i++) {
    const current = analyses[i]
    const previous = analyses[i + 1]

    if (current.seoScore < previous.seoScore) {
      regressions.push({
        date: current.createdAt,
        metric: "SEO Score",
        regression: previous.seoScore - current.seoScore,
      })
    }

    if (current.criticalIssues > previous.criticalIssues) {
      regressions.push({
        date: current.createdAt,
        metric: "Critical Issues",
        regression: current.criticalIssues - previous.criticalIssues,
      })
    }
  }

  return regressions
}

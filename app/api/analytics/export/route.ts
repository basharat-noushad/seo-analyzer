import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/export
 * Export analytics data in various formats (CSV, JSON)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const format = searchParams.get("format") || "json"
    const dataType = searchParams.get("type") || "all" // all, traffic, seo, keywords

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 90,
        },
        keywords: {
          include: {
            rankings: {
              orderBy: { checkedAt: "desc" },
              take: 30,
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Prepare export data
    const exportData = prepareExportData(project, dataType)

    // Format based on requested format
    if (format === "csv") {
      const csv = convertToCSV(exportData, dataType)
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${project.name}-analytics-${Date.now()}.csv"`,
        },
      })
    } else {
      // JSON format
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${project.name}-analytics-${Date.now()}.json"`,
        },
      })
    }
  } catch (error: any) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json(
      { error: "Failed to export analytics" },
      { status: 500 }
    )
  }
}

/**
 * Prepare data for export
 */
function prepareExportData(project: any, dataType: string) {
  const data: any = {
    project: {
      name: project.name,
      domain: project.domain,
      exportDate: new Date().toISOString(),
    },
  }

  if (dataType === "all" || dataType === "seo") {
    data.seoAnalyses = project.analyses.map((a: any) => ({
      date: a.createdAt,
      url: a.url,
      seoScore: a.seoScore,
      performanceScore: a.performanceScore,
      criticalIssues: a.criticalIssues,
      highIssues: a.highIssues,
      mediumIssues: a.mediumIssues,
      lowIssues: a.lowIssues,
    }))
  }

  if (dataType === "all" || dataType === "keywords") {
    data.keywords = project.keywords.map((k: any) => ({
      keyword: k.keyword,
      searchVolume: k.searchVolume,
      difficulty: k.difficultyScore,
      currentRank: k.currentRank,
      targetUrl: k.targetUrl,
      rankings: k.rankings.map((r: any) => ({
        date: r.checkedAt,
        rank: r.rank,
        searchEngine: r.searchEngine,
      })),
    }))
  }

  return data
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any, dataType: string): string {
  let csv = ""

  // Project info header
  csv += `Project: ${data.project.name}\n`
  csv += `Domain: ${data.project.domain}\n`
  csv += `Export Date: ${data.project.exportDate}\n\n`

  // SEO Analyses
  if (data.seoAnalyses && (dataType === "all" || dataType === "seo")) {
    csv += "=== SEO ANALYSES ===\n"
    csv += "Date,URL,SEO Score,Performance Score,Critical Issues,High Issues,Medium Issues,Low Issues\n"

    data.seoAnalyses.forEach((a: any) => {
      csv += `${a.date},${a.url},${a.seoScore},${a.performanceScore},${a.criticalIssues},${a.highIssues},${a.mediumIssues},${a.lowIssues}\n`
    })

    csv += "\n"
  }

  // Keywords
  if (data.keywords && (dataType === "all" || dataType === "keywords")) {
    csv += "=== KEYWORDS ===\n"
    csv += "Keyword,Search Volume,Difficulty,Current Rank,Target URL\n"

    data.keywords.forEach((k: any) => {
      csv += `${k.keyword},${k.searchVolume || 0},${k.difficulty || 0},${k.currentRank || "N/A"},${k.targetUrl || ""}\n`
    })

    csv += "\n"

    // Ranking history
    csv += "=== RANKING HISTORY ===\n"
    csv += "Keyword,Date,Rank,Search Engine\n"

    data.keywords.forEach((k: any) => {
      k.rankings.forEach((r: any) => {
        csv += `${k.keyword},${r.date},${r.rank},${r.searchEngine}\n`
      })
    })
  }

  return csv
}

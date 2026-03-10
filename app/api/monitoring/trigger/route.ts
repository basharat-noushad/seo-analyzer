import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"
import * as cheerio from "cheerio"

/**
 * POST /api/monitoring/trigger
 * Manually trigger a monitoring scan for a project or specific page
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, pageId, url } = body

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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Determine URL to scan
    let scanUrl = url
    if (!scanUrl && pageId) {
      const page = await prisma.projectPage.findUnique({
        where: { id: pageId },
      })
      if (page) {
        scanUrl = page.url
      }
    }
    if (!scanUrl) {
      scanUrl = `https://${project.domain}`
    }

    // Get previous analysis for comparison
    const previousAnalysis = await prisma.analysis.findFirst({
      where: {
        projectId,
        url: scanUrl,
        status: "completed",
      },
      orderBy: { createdAt: "desc" },
    })

    // Perform SEO analysis
    const analysisResult = await performSEOAnalysis(scanUrl)

    // Create new analysis
    const newAnalysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        projectId,
        pageId: pageId || null,
        url: scanUrl,
        type: "monitoring",
        status: "completed",
        seoScore: analysisResult.seoScore,
        performanceScore: analysisResult.performanceScore,
        seoData: analysisResult.seoData,
        technicalData: analysisResult.technicalData,
        contentData: analysisResult.contentData,
        criticalIssues: analysisResult.criticalIssues,
        highIssues: analysisResult.highIssues,
        mediumIssues: analysisResult.mediumIssues,
        lowIssues: analysisResult.lowIssues,
      },
    })

    // Detect changes and create alerts if needed
    const alerts = []
    if (previousAnalysis) {
      const changes = detectChanges(previousAnalysis, newAnalysis)

      for (const change of changes) {
        const alert = await prisma.alert.create({
          data: {
            userId: session.user.id,
            projectId,
            type: change.type,
            severity: change.severity,
            title: change.title,
            message: change.message,
            // Auto-send email for critical and high severity alerts
            sentEmail: change.severity === "critical" || change.severity === "high",
          },
        })
        alerts.push(alert)

        // Log email notification for critical/high severity alerts
        if (change.severity === "critical" || change.severity === "high") {
          console.log(`[EMAIL NOTIFICATION] ${change.severity.toUpperCase()}: ${change.title}`)
          console.log(`Message: ${change.message}`)
          console.log(`Project: ${projectId}`)
        }
      }
    }

    // Update project last scan time
    await prisma.project.update({
      where: { id: projectId },
      data: {
        lastScanAt: new Date(),
        seoScore: analysisResult.seoScore,
      },
    })

    // Update page if pageId provided
    if (pageId) {
      await prisma.projectPage.update({
        where: { id: pageId },
        data: {
          lastScanAt: new Date(),
          seoScore: analysisResult.seoScore,
        },
      })
    }

    // Update monitoring job last run time
    const monitoringJob = await prisma.monitoringJob.findFirst({
      where: {
        projectId,
        pageId: pageId || null,
      },
    })

    if (monitoringJob) {
      await prisma.monitoringJob.update({
        where: { id: monitoringJob.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: calculateNextRunTime(monitoringJob.frequency),
        },
      })
    }

    return NextResponse.json({
      analysis: newAnalysis,
      alerts,
      changes: previousAnalysis ? detectChanges(previousAnalysis, newAnalysis) : [],
    })
  } catch (error) {
    console.error("Error triggering monitoring scan:", error)
    return NextResponse.json(
      { error: "Failed to trigger monitoring scan" },
      { status: 500 }
    )
  }
}

/**
 * Perform SEO analysis on a URL
 */
async function performSEOAnalysis(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Analyzer/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract SEO data
    const title = $("title").text()
    const metaDescription = $('meta[name="description"]').attr("content") || ""
    const h1Count = $("h1").length
    const h1Text = $("h1").first().text()
    const imageCount = $("img").length
    const imagesWithoutAlt = $("img:not([alt])").length
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]').length
    const externalLinks = $('a[href^="http"]:not([href^="' + url + '"])').length

    // Calculate SEO score (simplified)
    let seoScore = 100
    let issues = { critical: 0, high: 0, medium: 0, low: 0 }

    if (!title || title.length < 30) {
      seoScore -= 15
      issues.critical++
    }
    if (!metaDescription || metaDescription.length < 120) {
      seoScore -= 10
      issues.high++
    }
    if (h1Count === 0) {
      seoScore -= 15
      issues.critical++
    }
    if (h1Count > 1) {
      seoScore -= 5
      issues.medium++
    }
    if (imagesWithoutAlt > 0) {
      seoScore -= 10
      issues.high++
    }
    if (internalLinks < 3) {
      seoScore -= 5
      issues.low++
    }

    return {
      seoScore: Math.max(0, seoScore),
      performanceScore: 85, // Simulated
      seoData: {
        title,
        titleLength: title.length,
        metaDescription,
        metaDescriptionLength: metaDescription.length,
        h1Count,
        h1Text,
      },
      technicalData: {
        httpStatus: response.status,
        contentType: response.headers.get("content-type"),
        hasHttps: url.startsWith("https"),
      },
      contentData: {
        imageCount,
        imagesWithoutAlt,
        internalLinks,
        externalLinks,
        wordCount: $("body").text().split(/\s+/).length,
      },
      criticalIssues: issues.critical,
      highIssues: issues.high,
      mediumIssues: issues.medium,
      lowIssues: issues.low,
    }
  } catch (error) {
    throw new Error(`Failed to analyze URL: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Detect changes between two analyses
 */
function detectChanges(previous: any, current: any) {
  const changes = []

  // SEO Score change
  const scoreDiff = current.seoScore - previous.seoScore
  if (Math.abs(scoreDiff) >= 10) {
    changes.push({
      type: scoreDiff > 0 ? "seo_improvement" : "seo_decline",
      severity: Math.abs(scoreDiff) >= 20 ? "high" : "medium",
      title: `SEO Score ${scoreDiff > 0 ? "Improved" : "Declined"} by ${Math.abs(scoreDiff)} points`,
      message: `SEO score changed from ${previous.seoScore} to ${current.seoScore}`,
    })
  }

  // Critical issues change
  const criticalDiff = current.criticalIssues - previous.criticalIssues
  if (criticalDiff > 0) {
    changes.push({
      type: "new_critical_issues",
      severity: "critical",
      title: `${criticalDiff} New Critical Issue${criticalDiff > 1 ? "s" : ""} Detected`,
      message: `Critical issues increased from ${previous.criticalIssues} to ${current.criticalIssues}`,
    })
  }

  // Title change
  const prevTitle = previous.seoData?.title
  const currTitle = current.seoData?.title
  if (prevTitle !== currTitle) {
    changes.push({
      type: "title_changed",
      severity: "medium",
      title: "Page Title Changed",
      message: `Title changed from "${prevTitle}" to "${currTitle}"`,
    })
  }

  // Meta description change
  const prevDesc = previous.seoData?.metaDescription
  const currDesc = current.seoData?.metaDescription
  if (prevDesc !== currDesc) {
    changes.push({
      type: "meta_description_changed",
      severity: "low",
      title: "Meta Description Changed",
      message: `Meta description has been updated`,
    })
  }

  // H1 count change
  const prevH1 = previous.seoData?.h1Count
  const currH1 = current.seoData?.h1Count
  if (prevH1 !== currH1) {
    changes.push({
      type: "h1_changed",
      severity: currH1 === 0 || currH1 > 1 ? "high" : "low",
      title: "H1 Tag Count Changed",
      message: `H1 tags changed from ${prevH1} to ${currH1}`,
    })
  }

  return changes
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRunTime(frequency: string): Date {
  const now = new Date()

  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics
 * Get analytics data for a project
 *
 * In production, this would integrate with:
 * - Google Analytics 4 API
 * - Google Search Console API
 * - Custom tracking data
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const days = parseInt(searchParams.get("days") || "30")

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
          take: days,
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
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      )
    }

    // Generate analytics data
    const analyticsData = await generateAnalyticsData(project, days)

    return NextResponse.json(analyticsData)
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

/**
 * Generate analytics data
 * In production, this would fetch from Google Analytics and Search Console
 */
async function generateAnalyticsData(project: any, days: number) {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // Simulated traffic data (would come from Google Analytics)
  const trafficData = generateTrafficData(days)

  // SEO performance data (from our analyses)
  const seoData = generateSEOData(project.analyses, days)

  // Search Console data (simulated)
  const searchConsoleData = generateSearchConsoleData(days)

  // Keyword performance (from our rankings)
  const keywordData = generateKeywordData(project.keywords)

  // Correlations
  const correlations = calculateCorrelations(trafficData, seoData)

  return {
    summary: {
      projectName: project.name,
      domain: project.domain,
      period: {
        start: startDate,
        end: now,
        days,
      },
      currentSEOScore: project.seoScore || 0,
    },
    traffic: trafficData,
    seo: seoData,
    searchConsole: searchConsoleData,
    keywords: keywordData,
    correlations,
  }
}

/**
 * Generate simulated traffic data
 * In production: fetch from Google Analytics 4 API
 */
function generateTrafficData(days: number) {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

    // Simulated data with some variance
    const baseUsers = 1000
    const variance = Math.random() * 400 - 200
    const users = Math.max(0, Math.floor(baseUsers + variance))

    const basePageViews = users * (2.5 + Math.random())
    const pageViews = Math.floor(basePageViews)

    const bounceRate = 35 + Math.random() * 20
    const avgSessionDuration = 120 + Math.random() * 180

    data.push({
      date: date.toISOString().split('T')[0],
      users,
      sessions: Math.floor(users * 1.2),
      pageViews,
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      avgSessionDuration: parseFloat(avgSessionDuration.toFixed(0)),
      organicTraffic: Math.floor(users * 0.6),
      directTraffic: Math.floor(users * 0.2),
      referralTraffic: Math.floor(users * 0.15),
      socialTraffic: Math.floor(users * 0.05),
    })
  }

  return {
    timeline: data,
    totals: {
      users: data.reduce((sum, d) => sum + d.users, 0),
      sessions: data.reduce((sum, d) => sum + d.sessions, 0),
      pageViews: data.reduce((sum, d) => sum + d.pageViews, 0),
      avgBounceRate: data.reduce((sum, d) => sum + d.bounceRate, 0) / data.length,
      avgSessionDuration: data.reduce((sum, d) => sum + d.avgSessionDuration, 0) / data.length,
    },
  }
}

/**
 * Generate SEO performance data from analyses
 */
function generateSEOData(analyses: any[], days: number) {
  const timeline = []
  const now = new Date()

  // Create a map of dates to analyses
  const analysisMap = new Map()
  analyses.forEach((analysis: any) => {
    const date = new Date(analysis.createdAt).toISOString().split('T')[0]
    if (!analysisMap.has(date) || new Date(analysis.createdAt) > new Date(analysisMap.get(date).createdAt)) {
      analysisMap.set(date, analysis)
    }
  })

  let lastScore = 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const analysis = analysisMap.get(dateStr)
    const score = analysis ? analysis.seoScore : lastScore
    lastScore = score || lastScore

    timeline.push({
      date: dateStr,
      seoScore: score || 0,
      criticalIssues: analysis?.criticalIssues || 0,
      highIssues: analysis?.highIssues || 0,
      mediumIssues: analysis?.mediumIssues || 0,
      lowIssues: analysis?.lowIssues || 0,
    })
  }

  const latestAnalysis = analyses[0]

  return {
    timeline,
    current: {
      seoScore: latestAnalysis?.seoScore || 0,
      totalIssues: (latestAnalysis?.criticalIssues || 0) +
                   (latestAnalysis?.highIssues || 0) +
                   (latestAnalysis?.mediumIssues || 0) +
                   (latestAnalysis?.lowIssues || 0),
      criticalIssues: latestAnalysis?.criticalIssues || 0,
      highIssues: latestAnalysis?.highIssues || 0,
    },
  }
}

/**
 * Generate simulated Search Console data
 * In production: fetch from Google Search Console API
 */
function generateSearchConsoleData(days: number) {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)

    // Simulated search data
    const impressions = Math.floor(5000 + Math.random() * 2000)
    const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.03))
    const ctr = (clicks / impressions) * 100
    const position = 15 + Math.random() * 10

    data.push({
      date: date.toISOString().split('T')[0],
      impressions,
      clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      position: parseFloat(position.toFixed(1)),
    })
  }

  // Top queries (simulated)
  const topQueries = [
    { query: "seo optimization", impressions: 12500, clicks: 450, ctr: 3.6, position: 8.5 },
    { query: "website seo", impressions: 8300, clicks: 320, ctr: 3.9, position: 7.2 },
    { query: "seo tools", impressions: 6700, clicks: 280, ctr: 4.2, position: 6.8 },
    { query: "search engine optimization", impressions: 5400, clicks: 210, ctr: 3.9, position: 9.1 },
    { query: "seo analysis", impressions: 4200, clicks: 180, ctr: 4.3, position: 6.5 },
  ]

  // Top pages (simulated)
  const topPages = [
    { page: "/", impressions: 15000, clicks: 600, ctr: 4.0, position: 7.5 },
    { page: "/blog/seo-guide", impressions: 8500, clicks: 380, ctr: 4.5, position: 6.2 },
    { page: "/tools", impressions: 6200, clicks: 250, ctr: 4.0, position: 8.1 },
    { page: "/pricing", impressions: 4800, clicks: 190, ctr: 4.0, position: 8.5 },
    { page: "/about", impressions: 3500, clicks: 140, ctr: 4.0, position: 9.2 },
  ]

  return {
    timeline: data,
    totals: {
      impressions: data.reduce((sum, d) => sum + d.impressions, 0),
      clicks: data.reduce((sum, d) => sum + d.clicks, 0),
      avgCTR: data.reduce((sum, d) => sum + d.ctr, 0) / data.length,
      avgPosition: data.reduce((sum, d) => sum + d.position, 0) / data.length,
    },
    topQueries,
    topPages,
  }
}

/**
 * Generate keyword performance data
 */
function generateKeywordData(keywords: any[]) {
  return {
    total: keywords.length,
    tracked: keywords.filter((k: any) => k.rankings.length > 0).length,
    topRankings: keywords
      .filter((k: any) => k.rankings.length > 0)
      .map((k: any) => ({
        keyword: k.keyword,
        currentRank: k.rankings[0]?.rank || null,
        searchVolume: k.searchVolume,
        difficulty: k.difficultyScore,
      }))
      .filter((k: any) => k.currentRank !== null)
      .sort((a: any, b: any) => (a.currentRank || 999) - (b.currentRank || 999))
      .slice(0, 10),
  }
}

/**
 * Calculate correlations between traffic and SEO
 */
function calculateCorrelations(trafficData: any, seoData: any) {
  const trafficTimeline = trafficData.timeline
  const seoTimeline = seoData.timeline

  // Simple correlation calculation
  let sumTraffic = 0
  let sumSEO = 0
  let sumTrafficSEO = 0
  let sumTrafficSq = 0
  let sumSEOSq = 0
  let n = Math.min(trafficTimeline.length, seoTimeline.length)

  for (let i = 0; i < n; i++) {
    const traffic = trafficTimeline[i].users
    const seo = seoTimeline[i].seoScore

    sumTraffic += traffic
    sumSEO += seo
    sumTrafficSEO += traffic * seo
    sumTrafficSq += traffic * traffic
    sumSEOSq += seo * seo
  }

  const correlation = n > 0
    ? (n * sumTrafficSEO - sumTraffic * sumSEO) /
      Math.sqrt((n * sumTrafficSq - sumTraffic * sumTraffic) * (n * sumSEOSq - sumSEO * sumSEO))
    : 0

  return {
    seoTrafficCorrelation: parseFloat(correlation.toFixed(3)),
    interpretation:
      Math.abs(correlation) > 0.7 ? "Strong" :
      Math.abs(correlation) > 0.4 ? "Moderate" :
      "Weak",
  }
}

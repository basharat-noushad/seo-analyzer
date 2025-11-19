/**
 * Rank Checking API
 *
 * Checks current search engine rankings for a keyword
 * NOTE: This is a simulation. In production, use services like:
 * - SerpAPI
 * - DataForSEO
 * - ValueSerp
 * - ScraperAPI
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface TopRankingPage {
  position: number
  url: string
  title: string
}

interface RankResult {
  keyword: string
  url: string
  currentRank: number | null
  previousRank: number | null
  topRankingPages: TopRankingPage[]
  searchEngine: string
  country: string
  checkedAt: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { keyword, targetUrl, searchEngine = "google", country = "US", projectId } = await req.json()

    // Validation
    if (!keyword || !targetUrl) {
      return NextResponse.json(
        { error: "Keyword and target URL are required" },
        { status: 400 }
      )
    }

    // Normalize URL
    let normalizedUrl = targetUrl.trim()
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl
    }
    normalizedUrl = normalizedUrl.replace(/\/$/, "")

    // Extract domain from URL
    const domain = new URL(normalizedUrl).hostname.replace("www.", "")

    // Check if keyword is tracked for this project/user
    let previousRank: number | null = null

    if (projectId) {
      const existingKeyword = await prisma.keyword.findFirst({
        where: {
          projectId,
          keyword: keyword.toLowerCase(),
        },
      })

      if (existingKeyword) {
        previousRank = existingKeyword.currentRank
      }
    } else {
      // Check without project - find in user's projects
      const existingKeyword = await prisma.keyword.findFirst({
        where: {
          keyword: keyword.toLowerCase(),
          project: {
            domain: { contains: domain },
            userId: user.id
          }
        },
      })

      if (existingKeyword) {
        previousRank = existingKeyword.currentRank
      }
    }

    // Simulate rank checking
    const rankData = simulateRankCheck(keyword, domain, searchEngine, country)

    // Determine current rank
    const currentRank = rankData.topRankingPages.find(
      page => new URL(page.url).hostname.replace("www.", "") === domain
    )?.position || null

    const result: RankResult = {
      keyword,
      url: normalizedUrl,
      currentRank,
      previousRank,
      topRankingPages: rankData.topRankingPages,
      searchEngine,
      country,
      checkedAt: new Date().toISOString(),
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error checking rankings:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to check rankings" },
      { status: 500 }
    )
  }
}

/**
 * Simulate rank checking
 * NOTE: This is for demo purposes
 * In production, use real SERP APIs
 */
function simulateRankCheck(
  keyword: string,
  targetDomain: string,
  searchEngine: string,
  country: string
): { topRankingPages: TopRankingPage[] } {
  const pages: TopRankingPage[] = []

  // Generate simulated top 10 results
  for (let i = 1; i <= 10; i++) {
    const isTarget = Math.random() < 0.15 && !pages.some(p => new URL(p.url).hostname.includes(targetDomain))

    if (isTarget) {
      // Insert target site at this position
      pages.push({
        position: i,
        url: `https://${targetDomain}/${keyword.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${keyword} - Complete Guide | ${targetDomain}`,
      })
    } else {
      // Generate competitor result
      const domains = [
        "example.com",
        "wikipedia.org",
        "forbes.com",
        "medium.com",
        "hubspot.com",
        "moz.com",
        "searchenginejournal.com",
        "neilpatel.com",
        "backlinko.com",
        "ahrefs.com",
      ]

      const randomDomain = domains[Math.floor(Math.random() * domains.length)]
      const titles = [
        `${keyword} - Ultimate Guide`,
        `Best ${keyword} Tips`,
        `How to ${keyword}`,
        `${keyword}: Complete Tutorial`,
        `${keyword} - Everything You Need to Know`,
        `Top ${keyword} Strategies`,
        `${keyword} Guide for Beginners`,
        `${keyword} Best Practices`,
      ]

      const randomTitle = titles[Math.floor(Math.random() * titles.length)]

      pages.push({
        position: i,
        url: `https://${randomDomain}/${keyword.toLowerCase().replace(/\s+/g, "-")}`,
        title: randomTitle,
      })
    }
  }

  return { topRankingPages: pages }
}

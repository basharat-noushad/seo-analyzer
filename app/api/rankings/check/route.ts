/**
 * Rank Checking API
 *
 * Uses SerpAPI for real SERP data with simulation fallback.
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const user = await requireApiAuth()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { keyword, targetUrl, searchEngine = "google", country = "US", projectId } = await req.json()

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

    const domain = new URL(normalizedUrl).hostname.replace("www.", "")

    // Get previous rank
    let previousRank: number | null = null
    if (projectId) {
      const existingKeyword = await prisma.keyword.findFirst({
        where: { projectId, keyword: keyword.toLowerCase() },
      })
      if (existingKeyword) {
        previousRank = existingKeyword.currentRank
      }
    }

    // Check rank using SerpAPI integration
    const { checkKeywordRank } = await import("@/lib/integrations/serpapi")
    const rankResult = await checkKeywordRank(keyword, domain, searchEngine, country)

    // Persist ranking if we have a project
    if (projectId) {
      const keywordRecord = await prisma.keyword.findFirst({
        where: { projectId, keyword: keyword.toLowerCase() },
      })

      if (keywordRecord) {
        // Update current rank
        await prisma.keyword.update({
          where: { id: keywordRecord.id },
          data: { currentRank: rankResult.position },
        })

        // Store ranking history
        await prisma.keywordRanking.create({
          data: {
            keywordId: keywordRecord.id,
            rank: rankResult.position,
            url: rankResult.url,
            searchEngine,
            location: country,
          },
        })
      }
    }

    return NextResponse.json({
      keyword,
      url: normalizedUrl,
      currentRank: rankResult.position,
      previousRank,
      searchEngine,
      country,
      checkedAt: new Date().toISOString(),
      dataSource: rankResult.dataSource,
    })
  } catch (error) {
    console.error("Error checking rankings:", error)
    return NextResponse.json({ error: "Failed to check rankings" }, { status: 500 })
  }
}

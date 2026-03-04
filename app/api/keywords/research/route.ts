/**
 * Keyword Research API
 *
 * Uses DataForSEO API for real keyword data with simulation fallback.
 * Requires Pro+ tier.
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()

    // Check tier - keyword research requires Pro+
    if (user.tier === "free") {
      return NextResponse.json(
        {
          error: "Keyword research requires a Pro or Agency subscription.",
          code: "TIER_LIMIT_REACHED",
        },
        { status: 403 }
      )
    }

    const { seedKeyword, country = "US" } = await req.json()

    if (!seedKeyword) {
      return NextResponse.json(
        { error: "Seed keyword is required" },
        { status: 400 }
      )
    }

    const { getKeywordSuggestions } = await import("@/lib/integrations/dataforseo")
    const { keywords, dataSource } = await getKeywordSuggestions(seedKeyword, country)

    return NextResponse.json({
      seedKeyword,
      keywords,
      totalResults: keywords.length,
      timestamp: new Date().toISOString(),
      country,
      dataSource,
    })
  } catch (error) {
    console.error("Error researching keywords:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to research keywords" },
      { status: 500 }
    )
  }
}

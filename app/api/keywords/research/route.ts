/**
 * Keyword Research API
 *
 * Generates keyword suggestions with search volume, difficulty, and metrics
 * NOTE: This is a simulation. In production, integrate with real APIs like:
 * - Google Keyword Planner API
 * - Ahrefs API
 * - SEMrush API
 * - DataForSEO API
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"

interface KeywordData {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  trend: "up" | "down" | "stable"
  competition: "low" | "medium" | "high"
  relatedKeywords: string[]
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { seedKeyword, country = "US" } = await req.json()

    // Validation
    if (!seedKeyword) {
      return NextResponse.json(
        { error: "Seed keyword is required" },
        { status: 400 }
      )
    }

    // Generate keyword suggestions
    const keywords = generateKeywordSuggestions(seedKeyword, country)

    const result = {
      seedKeyword,
      keywords,
      totalResults: keywords.length,
      timestamp: new Date().toISOString(),
      country,
    }

    return NextResponse.json(result, { status: 200 })
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

/**
 * Generate keyword suggestions
 * NOTE: This is a simulation for demo purposes
 * In production, replace with real API calls
 */
function generateKeywordSuggestions(seedKeyword: string, country: string): KeywordData[] {
  const seed = seedKeyword.toLowerCase().trim()
  const keywords: KeywordData[] = []

  // Generate variations and related keywords
  const prefixes = ["best", "top", "how to", "what is", "free", "online", "cheap"]
  const suffixes = ["tool", "software", "guide", "tutorial", "review", "comparison", "tips", "2024"]
  const related = ["for beginners", "for small business", "pricing", "alternatives", "vs"]

  // Add the seed keyword itself
  keywords.push(generateKeywordData(seed, 1.0))

  // Add prefix variations
  prefixes.forEach((prefix, index) => {
    const keyword = `${prefix} ${seed}`
    const multiplier = 0.8 - (index * 0.05)
    keywords.push(generateKeywordData(keyword, multiplier))
  })

  // Add suffix variations
  suffixes.forEach((suffix, index) => {
    const keyword = `${seed} ${suffix}`
    const multiplier = 0.7 - (index * 0.04)
    keywords.push(generateKeywordData(keyword, multiplier))
  })

  // Add related variations
  related.forEach((rel, index) => {
    const keyword = `${seed} ${rel}`
    const multiplier = 0.6 - (index * 0.05)
    keywords.push(generateKeywordData(keyword, multiplier))
  })

  // Add long-tail variations
  const longTail = [
    `how to use ${seed}`,
    `${seed} for website`,
    `${seed} step by step`,
    `${seed} features`,
    `why use ${seed}`,
  ]

  longTail.forEach((keyword, index) => {
    const multiplier = 0.4 - (index * 0.03)
    keywords.push(generateKeywordData(keyword, multiplier))
  })

  // Sort by search volume (descending)
  keywords.sort((a, b) => b.searchVolume - a.searchVolume)

  // Return top 30 results
  return keywords.slice(0, 30)
}

/**
 * Generate keyword data with realistic metrics
 */
function generateKeywordData(keyword: string, volumeMultiplier: number): KeywordData {
  // Base volume depends on keyword length (shorter = higher volume typically)
  const wordCount = keyword.split(" ").length
  const baseVolume = Math.max(1000, 50000 - (wordCount * 8000))

  // Apply multiplier and add some randomness
  const randomFactor = 0.7 + (Math.random() * 0.6) // 0.7 to 1.3
  const searchVolume = Math.round(baseVolume * volumeMultiplier * randomFactor)

  // Difficulty: shorter keywords = harder, long-tail = easier
  const baseDifficulty = Math.max(20, 80 - (wordCount * 12))
  const difficulty = Math.min(100, Math.max(10, Math.round(baseDifficulty + (Math.random() * 20 - 10))))

  // CPC: correlates somewhat with difficulty and volume
  const baseCPC = (difficulty / 100) * 5 + (searchVolume / 50000)
  const cpc = Math.max(0.1, Math.min(15, baseCPC * (0.8 + Math.random() * 0.4)))

  // Competition
  let competition: "low" | "medium" | "high"
  if (difficulty < 40) competition = "low"
  else if (difficulty < 70) competition = "medium"
  else competition = "high"

  // Trend
  const trendRandom = Math.random()
  let trend: "up" | "down" | "stable"
  if (trendRandom > 0.7) trend = "up"
  else if (trendRandom < 0.3) trend = "down"
  else trend = "stable"

  // Generate related keywords
  const relatedKeywords = generateRelatedKeywords(keyword)

  return {
    keyword,
    searchVolume,
    difficulty,
    cpc: parseFloat(cpc.toFixed(2)),
    trend,
    competition,
    relatedKeywords,
  }
}

/**
 * Generate related keywords
 */
function generateRelatedKeywords(keyword: string): string[] {
  const words = keyword.split(" ")
  const related: string[] = []

  // Add synonyms/variations
  const variations = [
    keyword.replace(/best/i, "top"),
    keyword.replace(/guide/i, "tutorial"),
    keyword.replace(/tool/i, "software"),
    keyword + " online",
    keyword + " free",
    `${words[0]} ${words[words.length - 1]}`, // first and last word
  ]

  // Add only unique and different from original
  variations.forEach(v => {
    if (v !== keyword && v.length > 3 && !related.includes(v)) {
      related.push(v)
    }
  })

  return related.slice(0, 5)
}

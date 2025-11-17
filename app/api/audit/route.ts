/**
 * Site Audit API
 *
 * Crawls multiple pages of a website and performs SEO analysis
 */

import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth"
import * as cheerio from "cheerio"

// Tier-based crawl limits
const TIER_LIMITS = {
  free: 10,
  pro: 100,
  agency: 500,
}

interface PageAnalysis {
  url: string
  status: "success" | "error"
  seoScore: number | null
  issues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  title?: string
  error?: string
  seoData?: any
}

interface CrawlResult {
  domain: string
  totalPages: number
  avgSeoScore: number
  totalIssues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  pages: PageAnalysis[]
  completedAt: string
  errors: string[]
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { domain, maxPages = 10 } = await req.json()

    // Validation
    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      )
    }

    // Check tier limits
    const tierLimit = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS] || 10
    const actualMaxPages = Math.min(maxPages, tierLimit)

    if (maxPages > tierLimit) {
      return NextResponse.json(
        {
          error: `Your ${user.tier} plan allows up to ${tierLimit} pages. Please upgrade for more.`,
          code: "TIER_LIMIT_EXCEEDED"
        },
        { status: 403 }
      )
    }

    // Normalize domain
    let normalizedDomain = domain.trim()
    if (!normalizedDomain.startsWith("http")) {
      normalizedDomain = "https://" + normalizedDomain
    }

    // Remove trailing slash
    normalizedDomain = normalizedDomain.replace(/\/$/, "")

    // Start crawling
    const crawlResult = await crawlSite(normalizedDomain, actualMaxPages)

    return NextResponse.json(crawlResult, { status: 200 })
  } catch (error) {
    console.error("Error auditing site:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to audit site" },
      { status: 500 }
    )
  }
}

async function crawlSite(domain: string, maxPages: number): Promise<CrawlResult> {
  const visited = new Set<string>()
  const toVisit: string[] = [domain]
  const pages: PageAnalysis[] = []
  const errors: string[] = []

  // Try to get sitemap URLs first
  try {
    const sitemapUrls = await parseSitemap(domain)
    if (sitemapUrls.length > 0) {
      toVisit.push(...sitemapUrls.slice(0, maxPages - 1))
    }
  } catch (err) {
    // Sitemap parsing failed, continue with regular crawling
  }

  // Crawl pages
  while (toVisit.length > 0 && visited.size < maxPages) {
    const url = toVisit.shift()
    if (!url || visited.has(url)) continue

    visited.add(url)

    try {
      const pageAnalysis = await analyzePage(url)
      pages.push(pageAnalysis)

      // If successful, discover more links
      if (pageAnalysis.status === "success" && pageAnalysis.seoData?.links) {
        const internalLinks = pageAnalysis.seoData.links.filter((link: string) => {
          try {
            const linkUrl = new URL(link, url)
            const domainUrl = new URL(domain)
            return linkUrl.hostname === domainUrl.hostname
          } catch {
            return false
          }
        })

        for (const link of internalLinks) {
          if (visited.size + toVisit.length < maxPages && !visited.has(link)) {
            toVisit.push(link)
          }
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"
      errors.push(`Failed to analyze ${url}: ${error}`)
      pages.push({
        url,
        status: "error",
        seoScore: null,
        issues: { critical: 0, high: 0, medium: 0, low: 0 },
        error,
      })
    }
  }

  // Calculate aggregate statistics
  const successfulPages = pages.filter(p => p.status === "success" && p.seoScore !== null)
  const avgSeoScore = successfulPages.length > 0
    ? successfulPages.reduce((sum, p) => sum + (p.seoScore || 0), 0) / successfulPages.length
    : 0

  const totalIssues = pages.reduce(
    (acc, page) => ({
      critical: acc.critical + page.issues.critical,
      high: acc.high + page.issues.high,
      medium: acc.medium + page.issues.medium,
      low: acc.low + page.issues.low,
    }),
    { critical: 0, high: 0, medium: 0, low: 0 }
  )

  return {
    domain,
    totalPages: pages.length,
    avgSeoScore: Math.round(avgSeoScore),
    totalIssues,
    pages,
    completedAt: new Date().toISOString(),
    errors,
  }
}

async function parseSitemap(domain: string): Promise<string[]> {
  const sitemapUrl = `${domain}/sitemap.xml`
  const urls: string[] = []

  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "SEO-Analyzer-Bot/1.0",
      },
    })

    if (!response.ok) {
      return urls
    }

    const xml = await response.text()

    // Parse XML to extract URLs
    const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g)
    for (const match of urlMatches) {
      const url = match[1].trim()
      if (url) {
        urls.push(url)
      }
    }

    return urls
  } catch (err) {
    return urls
  }
}

async function analyzePage(url: string): Promise<PageAnalysis> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0)",
      },
      redirect: "follow",
    })

    if (!response.ok) {
      return {
        url,
        status: "error",
        seoScore: null,
        issues: { critical: 0, high: 0, medium: 0, low: 0 },
        error: `HTTP ${response.status}`,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract SEO data
    const title = $("title").text().trim()
    const metaDescription = $('meta[name="description"]').attr("content")?.trim()
    const h1Count = $("h1").length
    const h1Text = $("h1").first().text().trim()

    // Count content
    const textContent = $("body").text().trim()
    const words = textContent.split(/\s+/).filter((w: string) => w.length > 0)
    const wordCount = words.length
    const paragraphCount = $("p").length

    // Count images
    const totalImages = $("img").length
    const imagesWithoutAlt = $("img:not([alt])").length + $('img[alt=""]').length

    // Extract links
    const links: string[] = []
    $("a[href]").each((_: number, el: any) => {
      const href = $(el).attr("href")
      if (href) {
        try {
          const absoluteUrl = new URL(href, url).href
          links.push(absoluteUrl)
        } catch {
          // Invalid URL, skip
        }
      }
    })

    // Calculate SEO score
    let score = 50

    // Title (15 points)
    if (title) {
      score += 10
      if (title.length >= 30 && title.length <= 60) {
        score += 5
      }
    }

    // Meta description (10 points)
    if (metaDescription) {
      score += 10
    }

    // H1 (10 points)
    if (h1Count === 1) {
      score += 10
    }

    // Content (15 points)
    if (wordCount > 300) score += 5
    if (wordCount > 1000) score += 5
    if (paragraphCount > 3) score += 5

    const seoScore = Math.min(score, 100)

    // Count issues
    const issues = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }

    // Critical issues
    if (!title) issues.critical++
    if (!metaDescription) issues.critical++
    if (h1Count !== 1) issues.critical++

    // High issues
    if (title && (title.length > 60 || title.length < 30)) issues.high++
    if (wordCount < 300) issues.high++

    // Medium issues
    if (imagesWithoutAlt > 0) issues.medium++

    return {
      url,
      status: "success",
      seoScore,
      issues,
      title,
      seoData: {
        title: { content: title, length: title.length },
        metaDescription: { content: metaDescription, length: metaDescription?.length || 0 },
        h1: { count: h1Count, text: h1Text },
        content: { wordCount, paragraphCount },
        media: { totalImages, imagesWithoutAlt },
        links,
      },
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : "Failed to fetch page"
    return {
      url,
      status: "error",
      seoScore: null,
      issues: { critical: 0, high: 0, medium: 0, low: 0 },
      error,
    }
  }
}

/**
 * Background SEO Analysis Processor
 *
 * Fetches a URL, parses HTML with cheerio, and performs comprehensive SEO checks.
 * Creates Issue records for problems found and updates the Analysis with scores.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import * as cheerio from "cheerio";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeoCheckResult {
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
}

interface SeoData {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonicalUrl: string | null;
  h1Tags: string[];
  h2Tags: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  structuredData: unknown[];
  hasViewportMeta: boolean;
  isHttps: boolean;
}

interface TechnicalData {
  httpStatus: number;
  responseTime: number;
  contentLength: number;
  isHttps: boolean;
  hasViewportMeta: boolean;
  hasCanonical: boolean;
  robotsMeta: string | null;
  language: string | null;
}

interface ContentData {
  wordCount: number;
  headingStructure: { tag: string; text: string }[];
  imagesTotal: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
}

// ---------------------------------------------------------------------------
// Main processor
// ---------------------------------------------------------------------------

export async function processAnalysis(analysisId: string): Promise<void> {
  try {
    // Mark analysis as processing
    const analysis = await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: "processing" },
    });

    const { url } = analysis;

    // Fetch the page
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "SEOAnalyzer/1.0 (compatible; SEO analysis bot; +https://seoanalyzer.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    const responseTime = Date.now() - startTime;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Run all checks
    const issues: SeoCheckResult[] = [];
    const parsedUrl = new URL(url);

    // --- SEO Data Extraction ---
    const title = $("title").first().text().trim() || null;
    const titleLength = title?.length ?? 0;
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || null;
    const metaDescriptionLength = metaDescription?.length ?? 0;
    const canonicalUrl =
      $('link[rel="canonical"]').attr("href")?.trim() || null;
    const h1Tags = $("h1")
      .map((_, el) => $(el).text().trim())
      .get();
    const h2Tags = $("h2")
      .map((_, el) => $(el).text().trim())
      .get();
    const ogTitle = $('meta[property="og:title"]').attr("content") || null;
    const ogDescription =
      $('meta[property="og:description"]').attr("content") || null;
    const ogImage = $('meta[property="og:image"]').attr("content") || null;
    const hasViewportMeta = $('meta[name="viewport"]').length > 0;
    const isHttps = parsedUrl.protocol === "https:";
    const robotsMeta =
      $('meta[name="robots"]').attr("content")?.trim() || null;
    const language = $("html").attr("lang") || null;

    // Structured data (JSON-LD)
    const structuredData: unknown[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || "");
        structuredData.push(parsed);
      } catch {
        // Ignore malformed JSON-LD
      }
    });

    // --- Content Data ---
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    const headingStructure: { tag: string; text: string }[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      headingStructure.push({
        tag: el.tagName.toLowerCase(),
        text: $(el).text().trim(),
      });
    });

    const allImages = $("img");
    const imagesTotal = allImages.length;
    const imagesWithoutAlt = allImages.filter(
      (_, el) => !$(el).attr("alt")?.trim()
    ).length;

    let internalLinks = 0;
    let externalLinks = 0;
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === parsedUrl.hostname) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch {
        // Relative or malformed links count as internal
        internalLinks++;
      }
    });

    // --- SEO Checks ---

    // Title tag
    if (!title) {
      issues.push({
        category: "seo",
        severity: "critical",
        title: "Missing title tag",
        description: "The page does not have a <title> tag.",
        recommendation:
          "Add a unique, descriptive title tag between 30-60 characters.",
      });
    } else if (titleLength < 30) {
      issues.push({
        category: "seo",
        severity: "medium",
        title: "Title tag too short",
        description: `The title tag is only ${titleLength} characters long.`,
        recommendation:
          "Expand the title to at least 30 characters for better SEO visibility.",
      });
    } else if (titleLength > 60) {
      issues.push({
        category: "seo",
        severity: "low",
        title: "Title tag too long",
        description: `The title tag is ${titleLength} characters long and may be truncated in search results.`,
        recommendation: "Shorten the title to 60 characters or fewer.",
      });
    }

    // Meta description
    if (!metaDescription) {
      issues.push({
        category: "seo",
        severity: "high",
        title: "Missing meta description",
        description:
          "The page does not have a meta description tag.",
        recommendation:
          "Add a compelling meta description between 120-160 characters.",
      });
    } else if (metaDescriptionLength < 120) {
      issues.push({
        category: "seo",
        severity: "medium",
        title: "Meta description too short",
        description: `The meta description is only ${metaDescriptionLength} characters long.`,
        recommendation:
          "Expand the meta description to at least 120 characters.",
      });
    } else if (metaDescriptionLength > 160) {
      issues.push({
        category: "seo",
        severity: "low",
        title: "Meta description too long",
        description: `The meta description is ${metaDescriptionLength} characters and may be truncated.`,
        recommendation: "Shorten the meta description to 160 characters or fewer.",
      });
    }

    // H1 tags
    if (h1Tags.length === 0) {
      issues.push({
        category: "seo",
        severity: "high",
        title: "Missing H1 tag",
        description: "The page does not contain an H1 heading.",
        recommendation:
          "Add a single, descriptive H1 tag that includes the primary keyword.",
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        category: "seo",
        severity: "medium",
        title: "Multiple H1 tags",
        description: `The page contains ${h1Tags.length} H1 tags. Best practice is to have exactly one.`,
        recommendation:
          "Reduce to a single H1 tag and use H2-H6 for subheadings.",
      });
    }

    // Images without alt text
    if (imagesWithoutAlt > 0) {
      issues.push({
        category: "content",
        severity: imagesWithoutAlt > 5 ? "high" : "medium",
        title: "Images missing alt text",
        description: `${imagesWithoutAlt} of ${imagesTotal} images are missing alt attributes.`,
        recommendation:
          "Add descriptive alt text to all images for accessibility and SEO.",
      });
    }

    // HTTPS
    if (!isHttps) {
      issues.push({
        category: "technical",
        severity: "critical",
        title: "Site not using HTTPS",
        description: "The page is served over HTTP instead of HTTPS.",
        recommendation:
          "Migrate to HTTPS to improve security and search engine rankings.",
      });
    }

    // Viewport meta
    if (!hasViewportMeta) {
      issues.push({
        category: "technical",
        severity: "high",
        title: "Missing viewport meta tag",
        description:
          "The page does not have a viewport meta tag for mobile responsiveness.",
        recommendation:
          'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to the <head>.',
      });
    }

    // Canonical link
    if (!canonicalUrl) {
      issues.push({
        category: "seo",
        severity: "medium",
        title: "Missing canonical link",
        description: "The page does not specify a canonical URL.",
        recommendation:
          "Add a canonical link tag to prevent duplicate content issues.",
      });
    }

    // OpenGraph tags
    if (!ogTitle || !ogDescription) {
      issues.push({
        category: "seo",
        severity: "low",
        title: "Incomplete OpenGraph tags",
        description: `Missing ${[!ogTitle && "og:title", !ogDescription && "og:description"].filter(Boolean).join(", ")}.`,
        recommendation:
          "Add OpenGraph meta tags for better social media sharing previews.",
      });
    }

    if (!ogImage) {
      issues.push({
        category: "seo",
        severity: "low",
        title: "Missing OpenGraph image",
        description: "No og:image tag found.",
        recommendation:
          "Add an og:image tag for a visual preview when the page is shared on social media.",
      });
    }

    // Structured data
    if (structuredData.length === 0) {
      issues.push({
        category: "seo",
        severity: "low",
        title: "No structured data found",
        description:
          "The page does not contain any JSON-LD structured data.",
        recommendation:
          "Add structured data (Schema.org) to enhance search engine results with rich snippets.",
      });
    }

    // Word count
    if (wordCount < 300) {
      issues.push({
        category: "content",
        severity: "high",
        title: "Thin content",
        description: `The page has only ${wordCount} words, which is considered thin content.`,
        recommendation:
          "Aim for at least 300 words of quality content per page. Most top-ranking pages have 1000+ words.",
      });
    }

    // Internal links
    if (internalLinks === 0) {
      issues.push({
        category: "links",
        severity: "medium",
        title: "No internal links",
        description: "The page has no internal links to other pages on the site.",
        recommendation:
          "Add internal links to improve site navigation and distribute link authority.",
      });
    }

    // --- Calculate Scores ---
    const issueSeverityWeights = {
      critical: 20,
      high: 10,
      medium: 5,
      low: 2,
    };

    const totalPenalty = issues.reduce(
      (sum, issue) => sum + issueSeverityWeights[issue.severity],
      0
    );
    const seoScore = Math.max(0, Math.min(100, 100 - totalPenalty));

    // Performance score based on response time
    let performanceScore: number;
    if (responseTime < 500) {
      performanceScore = 100;
    } else if (responseTime < 1000) {
      performanceScore = 90;
    } else if (responseTime < 2000) {
      performanceScore = 75;
    } else if (responseTime < 3000) {
      performanceScore = 60;
    } else if (responseTime < 5000) {
      performanceScore = 40;
    } else {
      performanceScore = 20;
    }

    // Count issues by severity
    const criticalIssues = issues.filter((i) => i.severity === "critical").length;
    const highIssues = issues.filter((i) => i.severity === "high").length;
    const mediumIssues = issues.filter((i) => i.severity === "medium").length;
    const lowIssues = issues.filter((i) => i.severity === "low").length;

    // Build JSON data objects
    const seoData: SeoData = {
      title,
      titleLength,
      metaDescription,
      metaDescriptionLength,
      canonicalUrl,
      h1Tags,
      h2Tags,
      ogTitle,
      ogDescription,
      ogImage,
      structuredData,
      hasViewportMeta,
      isHttps,
    };

    const technicalData: TechnicalData = {
      httpStatus: response.status,
      responseTime,
      contentLength: html.length,
      isHttps,
      hasViewportMeta,
      hasCanonical: !!canonicalUrl,
      robotsMeta,
      language,
    };

    const contentData: ContentData = {
      wordCount,
      headingStructure,
      imagesTotal,
      imagesWithoutAlt,
      internalLinks,
      externalLinks,
    };

    // --- Persist results ---

    // Create Issue records
    if (issues.length > 0) {
      await prisma.issue.createMany({
        data: issues.map((issue) => ({
          analysisId,
          projectId: analysis.projectId,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          url,
        })),
      });
    }

    // Update Analysis with results
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "completed",
        seoScore,
        performanceScore,
        seoData: seoData as unknown as Prisma.InputJsonValue,
        technicalData: technicalData as unknown as Prisma.InputJsonValue,
        contentData: contentData as unknown as Prisma.InputJsonValue,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
      },
    });

    // Log usage
    if (analysis.userId) {
      await prisma.usageLog.create({
        data: {
          userId: analysis.userId,
          action: "analysis",
          creditsUsed: 1,
        },
      });
    }

    // Update project seoScore
    if (analysis.projectId) {
      await prisma.project.update({
        where: { id: analysis.projectId },
        data: {
          seoScore,
          lastScanAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error(`Analysis ${analysisId} failed:`, error);

    // Mark analysis as failed
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: "failed" },
    });
  }
}

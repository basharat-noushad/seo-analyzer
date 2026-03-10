/**
 * Shared SEO scoring logic
 *
 * Used by both the analyze API route (comparison scoring)
 * and the analyses save route (persisted score).
 * Single source of truth for how scores are calculated.
 */

interface ScoredPage {
  seo?: {
    title?: { content?: string | null; length?: number; quality?: { withinIdealLength?: boolean } }
    metaDescription?: { content?: string | null }
    canonical?: { exists?: boolean }
  }
  headings?: { quality?: { h1Count?: number } }
  content?: { wordCount?: number; paragraphCount?: number }
  technical?: { viewport?: { isMobileFriendly?: boolean } }
  structuredData?: { hasStructuredData?: boolean }
}

/**
 * Calculates a 0–100 SEO score from page analysis data.
 */
export function calculateSeoScore(page: ScoredPage): number {
  let score = 50

  if (page.seo?.title?.content) {
    score += 10
    if (page.seo.title.quality?.withinIdealLength) score += 5
  }

  if (page.seo?.metaDescription?.content) score += 10
  if (page.headings?.quality?.h1Count === 1) score += 10
  if (page.seo?.canonical?.exists) score += 3

  const wordCount = page.content?.wordCount ?? 0
  if (wordCount > 1000) score += 10
  else if (wordCount > 300) score += 5

  if (page.content?.paragraphCount && page.content.paragraphCount > 3) score += 5
  if (page.technical?.viewport?.isMobileFriendly) score += 5
  if (page.structuredData?.hasStructuredData) score += 7

  return Math.min(score, 100)
}

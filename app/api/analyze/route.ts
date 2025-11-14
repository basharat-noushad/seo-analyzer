/**
 * Competitor Page Analyzer - API Route
 * POST /api/analyze
 *
 * Analyzes one or two URLs for on-page SEO metrics.
 * Respects robots.txt and returns comprehensive analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzeRequest {
  competitorUrl: string;
  myUrl?: string;
}

interface PageAnalysisResult {
  url: string;
  originalUrl: string;
  timestamp: string;
  basicInfo: BasicInfo;
  seo: SEOMetrics;
  headings: HeadingAnalysis;
  content: ContentMetrics;
  links: LinkAnalysis;
  media: MediaAnalysis;
  structuredData: StructuredDataAnalysis;
  technical: TechnicalHints;
  warnings: string[];
  errors: string[];
  success: boolean;
}

interface BasicInfo {
  httpStatus: number;
  finalUrl: string;
  wasRedirected: boolean;
  redirectChain?: string[];
  contentType: string;
  contentLength: number;
  responseTime: number;
  server?: string;
}

interface SEOMetrics {
  title: {
    content: string | null;
    length: number;
    quality: {
      exists: boolean;
      withinIdealLength: boolean;
      tooShort: boolean;
      tooLong: boolean;
      excessCharacters: number;
    };
    recommendations: string[];
  };
  metaDescription: {
    content: string | null;
    length: number;
    quality: {
      exists: boolean;
      withinIdealLength: boolean;
      tooShort: boolean;
      tooLong: boolean;
      excessCharacters: number;
    };
    recommendations: string[];
  };
  metaRobots: {
    content: string | null;
    directives: string[];
    hasNoindex: boolean;
    hasNofollow: boolean;
  };
  canonical: {
    exists: boolean;
    url: string | null;
    isSelfReferencing: boolean;
  };
  lang: string | null;
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    isComplete: boolean;
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    isComplete: boolean;
  };
}

interface HeadingAnalysis {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  structure: { level: number; text: string; index: number }[];
  quality: {
    hasH1: boolean;
    h1Count: number;
    multipleH1Warning: boolean;
    missingH1Warning: boolean;
    totalCount: number;
  };
}

interface ContentMetrics {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  textToHtmlRatio: number;
  topKeywords: { keyword: string; count: number; density: number }[];
  readingTime: number;
}

interface LinkAnalysis {
  total: number;
  internal: number;
  external: number;
  follow: number;
  nofollow: number;
  internalPercentage: number;
  nofollowPercentage: number;
  internalLinks: { href: string; text: string; isNofollow: boolean }[];
  externalLinks: { href: string; text: string; isNofollow: boolean }[];
}

interface MediaAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  altPercentage: number;
  images: { src: string; alt: string | null; hasAlt: boolean }[];
}

interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  jsonLd: { type: string | string[]; raw: any }[];
  total: number;
  schemaTypes: string[];
}

interface TechnicalHints {
  viewport: {
    exists: boolean;
    content: string | null;
    isMobileFriendly: boolean;
  };
  charset: string | null;
  hasDoctype: boolean;
  favicon: {
    exists: boolean;
    href: string | null;
  };
}

interface ComparisonResult {
  opportunities: Array<{
    category: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
  }>;
  strengths: Array<{
    category: string;
    title: string;
    description: string;
  }>;
  score: {
    overall: number;
    verdict: string;
    summary: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const USER_AGENT = 'CompetitorPageAnalyzer/1.0 (SEO Analysis Tool)';
const TIMEOUT_MS = 15000;
const MAX_PAGE_SIZE = 10 * 1024 * 1024; // 10MB
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a standardized error response with urlContext
 */
function createErrorResponse(
  message: string,
  code: string,
  urlContext?: 'competitor' | 'mine'
): NextResponse {
  return NextResponse.json(
    {
      error: true,
      message,
      code,
      urlContext,
      statusCode: code === 'RATE_LIMIT_EXCEEDED' ? 429 : code === 'ROBOTS_TXT_DISALLOWED' ? 403 : 400,
      timestamp: new Date().toISOString(),
    },
    {
      status: code === 'RATE_LIMIT_EXCEEDED' ? 429 : code === 'ROBOTS_TXT_DISALLOWED' ? 403 : 400
    }
  );
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: AnalyzeRequest = await req.json();

    // Validate required field
    if (!body.competitorUrl) {
      return createErrorResponse(
        'competitorUrl is required',
        'MALFORMED_REQUEST',
        'competitor'
      );
    }

    // Validate URLs
    const competitorValidation = validateUrl(body.competitorUrl);
    if (!competitorValidation.valid) {
      return createErrorResponse(
        competitorValidation.error || 'Invalid competitor URL',
        'INVALID_URL',
        'competitor'
      );
    }

    let myUrlValidation: { valid: boolean; error?: string } = { valid: true };
    if (body.myUrl) {
      myUrlValidation = validateUrl(body.myUrl);
      if (!myUrlValidation.valid) {
        return createErrorResponse(
          myUrlValidation.error || 'Invalid myUrl',
          'INVALID_URL',
          'mine'
        );
      }

      // Check if URLs are the same
      if (body.competitorUrl === body.myUrl) {
        return createErrorResponse(
          'Competitor URL and your URL must be different',
          'INVALID_URL',
          'mine'
        );
      }
    }

    // Check rate limit (simplified - in production use Redis or similar)
    const clientIp = getClientIp(req);
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: true,
        message: `Rate limit exceeded. Try again in ${rateLimitCheck.retryAfter} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        details: { retryAfter: rateLimitCheck.retryAfter },
      }, {
        status: 429,
        headers: { 'Retry-After': rateLimitCheck.retryAfter!.toString() }
      });
    }

    // Check robots.txt for both URLs (in parallel if both provided)
    const robotsChecks = body.myUrl
      ? await Promise.all([
          checkRobotsTxt(body.competitorUrl),
          checkRobotsTxt(body.myUrl),
        ])
      : [await checkRobotsTxt(body.competitorUrl)];

    if (!robotsChecks[0].allowed) {
      return createErrorResponse(
        'Analysis blocked: robots.txt disallows crawling of competitor URL',
        'ROBOTS_TXT_DISALLOWED',
        'competitor'
      );
    }

    if (body.myUrl && !robotsChecks[1]?.allowed) {
      return createErrorResponse(
        'Analysis blocked: robots.txt disallows crawling of your URL',
        'ROBOTS_TXT_DISALLOWED',
        'mine'
      );
    }

    // Analyze URL(s) - parallel if both provided
    const analyses = body.myUrl
      ? await Promise.all([
          analyzeUrl(body.competitorUrl),
          analyzeUrl(body.myUrl),
        ])
      : [await analyzeUrl(body.competitorUrl)];

    const [competitorAnalysis, myAnalysis] = analyses;

    // Generate comparison if both URLs analyzed
    let comparison: ComparisonResult | undefined;
    if (myAnalysis && competitorAnalysis.success && myAnalysis.success) {
      comparison = generateComparison(competitorAnalysis, myAnalysis);
    }

    // Build response
    const response = {
      competitor: competitorAnalysis,
      mine: myAnalysis,
      comparison,
      meta: {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        version: '1.0.0',
        urlsAnalyzed: myAnalysis ? 2 : 1,
      },
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('API error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json({
        error: true,
        message: 'Request timeout. The page took too long to respond.',
        code: 'FETCH_TIMEOUT',
        statusCode: 504,
        timestamp: new Date().toISOString(),
      }, { status: 504 });
    }

    return NextResponse.json({
      error: true,
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      details: {
        originalError: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    }, { status: 500 });
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check for localhost
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(parsed.hostname)) {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }

    // Check for private IP ranges
    if (
      /^10\./.test(parsed.hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(parsed.hostname) ||
      /^192\.168\./.test(parsed.hostname)
    ) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }

    // Check for SERP URLs
    const serpDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
    const domain = parsed.hostname.replace(/^www\./, '');
    if (serpDomains.some(serp => domain.includes(serp))) {
      if (parsed.pathname.includes('/search') || parsed.pathname.includes('/results')) {
        return { valid: false, error: 'Search engine result pages cannot be analyzed' };
      }
    }

    // Check length
    if (url.length > 2048) {
      return { valid: false, error: 'URL too long (max 2048 characters)' };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// ============================================================================
// RATE LIMITING (In-memory - use Redis in production)
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const maxRequests = 10;
  const windowMs = 60 * 60 * 1000; // 1 hour

  const entry = rateLimitStore.get(clientIp);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(clientIp, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  rateLimitStore.set(clientIp, entry);
  return { allowed: true };
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

// ============================================================================
// ROBOTS.TXT CHECKING
// ============================================================================

async function checkRobotsTxt(targetUrl: string): Promise<{ allowed: boolean }> {
  try {
    const parsed = new URL(targetUrl);
    const robotsTxtUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(robotsTxtUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If robots.txt not found, allow by default
    if (!response.ok) {
      return { allowed: true };
    }

    const robotsTxt = await response.text();

    // Simple robots.txt parser
    const isAllowed = parseRobotsTxt(robotsTxt, parsed.pathname);

    return { allowed: isAllowed };

  } catch (error) {
    // If robots.txt fetch fails, fail-open (allow)
    console.warn('robots.txt check failed, allowing:', error);
    return { allowed: true };
  }
}

function parseRobotsTxt(robotsTxt: string, pathname: string): boolean {
  const lines = robotsTxt.split('\n');
  let userAgentMatch = false;
  let isDisallowed = false;

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    // Check for User-agent
    if (trimmed.startsWith('user-agent:')) {
      const agent = trimmed.substring(11).trim();
      userAgentMatch = agent === '*' || agent === 'competitorpageanalyzer';
    }

    // Check for Disallow rules
    if (userAgentMatch && trimmed.startsWith('disallow:')) {
      const disallowPath = trimmed.substring(9).trim();

      if (disallowPath === '') {
        // Empty disallow means allow all
        continue;
      }

      // Simple path matching (exact or prefix)
      if (pathname === disallowPath || pathname.startsWith(disallowPath)) {
        isDisallowed = true;
        break;
      }
    }

    // Check for Allow rules (takes precedence)
    if (userAgentMatch && trimmed.startsWith('allow:')) {
      const allowPath = trimmed.substring(6).trim();
      if (pathname === allowPath || pathname.startsWith(allowPath)) {
        isDisallowed = false;
        break;
      }
    }
  }

  return !isDisallowed;
}

// ============================================================================
// PAGE ANALYSIS
// ============================================================================

async function analyzeUrl(url: string): Promise<PageAnalysisResult> {
  const timestamp = new Date().toISOString();
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Fetch HTML
    const fetchResult = await fetchPageHtml(url);

    if (!fetchResult.success) {
      errors.push(fetchResult.error || 'Failed to fetch page');
      return createErrorResult(url, timestamp, errors);
    }

    const { html, metadata } = fetchResult;

    if (!html) {
      errors.push('No HTML content received');
      return createErrorResult(url, timestamp, errors);
    }

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Extract all metrics
    const basicInfo: BasicInfo = {
      httpStatus: metadata.statusCode,
      finalUrl: metadata.finalUrl,
      wasRedirected: metadata.finalUrl !== url,
      contentType: metadata.contentType,
      contentLength: metadata.contentLength,
      responseTime: metadata.responseTime,
      server: metadata.server,
    };

    const seo = extractSEO($, metadata.finalUrl);
    const headings = extractHeadings($);
    const content = extractContent($, html);
    const links = extractLinks($, metadata.finalUrl);
    const media = extractMedia($);
    const structuredData = extractStructuredData($);
    const technical = extractTechnical($);

    return {
      url: metadata.finalUrl,
      originalUrl: url,
      timestamp,
      basicInfo,
      seo,
      headings,
      content,
      links,
      media,
      structuredData,
      technical,
      warnings,
      errors,
      success: true,
    };

  } catch (error: any) {
    console.error('Analysis error:', error);
    errors.push(error.message || 'Analysis failed');
    return createErrorResult(url, timestamp, errors);
  }
}

function createErrorResult(url: string, timestamp: string, errors: string[]): PageAnalysisResult {
  return {
    url,
    originalUrl: url,
    timestamp,
    basicInfo: {} as any,
    seo: {} as any,
    headings: {} as any,
    content: {} as any,
    links: {} as any,
    media: {} as any,
    structuredData: {} as any,
    technical: {} as any,
    warnings: [],
    errors,
    success: false,
  };
}

// ============================================================================
// HTML FETCHING
// ============================================================================

async function fetchPageHtml(url: string): Promise<{
  success: boolean;
  html?: string;
  metadata?: any;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return {
        success: false,
        error: `Non-HTML content: ${contentType}`,
      };
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > MAX_PAGE_SIZE) {
      return {
        success: false,
        error: 'Page too large (exceeds 10MB limit)',
      };
    }

    const html = await response.text();

    if (html.length > MAX_PAGE_SIZE) {
      return {
        success: false,
        error: 'Page too large (exceeds 10MB limit)',
      };
    }

    return {
      success: true,
      html,
      metadata: {
        finalUrl: response.url,
        statusCode: response.status,
        contentType,
        contentLength: html.length,
        responseTime: Date.now() - startTime,
        server: response.headers.get('server') || undefined,
      },
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EXTRACTORS
// ============================================================================

function extractSEO($: CheerioAPI, pageUrl: string): SEOMetrics {
  // Title
  const titleContent = $('title').first().text().trim() || null;
  const titleLength = titleContent?.length || 0;
  const title = {
    content: titleContent,
    length: titleLength,
    quality: {
      exists: titleContent !== null,
      withinIdealLength: titleLength >= 50 && titleLength <= 60,
      tooShort: titleLength > 0 && titleLength < 30,
      tooLong: titleLength > 60,
      excessCharacters: Math.max(0, titleLength - 60),
    },
    recommendations: [] as string[],
  };

  if (!title.quality.exists) {
    title.recommendations.push('Add a title tag');
  } else if (title.quality.tooShort) {
    title.recommendations.push(`Add ${30 - titleLength} more characters`);
  } else if (title.quality.tooLong) {
    title.recommendations.push(`Shorten by ${title.quality.excessCharacters} characters`);
  }

  // Meta Description
  const descContent = $('meta[name="description"]').attr('content')?.trim() || null;
  const descLength = descContent?.length || 0;
  const metaDescription = {
    content: descContent,
    length: descLength,
    quality: {
      exists: descContent !== null,
      withinIdealLength: descLength >= 150 && descLength <= 160,
      tooShort: descLength > 0 && descLength < 120,
      tooLong: descLength > 160,
      excessCharacters: Math.max(0, descLength - 160),
    },
    recommendations: [] as string[],
  };

  if (!metaDescription.quality.exists) {
    metaDescription.recommendations.push('Add a meta description');
  } else if (metaDescription.quality.tooShort) {
    metaDescription.recommendations.push(`Add ${120 - descLength} more characters`);
  } else if (metaDescription.quality.tooLong) {
    metaDescription.recommendations.push(`Shorten by ${metaDescription.quality.excessCharacters} characters`);
  }

  // Meta Robots
  const robotsContent = $('meta[name="robots"]').attr('content')?.trim() || null;
  const robotsDirectives = robotsContent ? robotsContent.split(',').map(d => d.trim()) : [];
  const metaRobots = {
    content: robotsContent,
    directives: robotsDirectives,
    hasNoindex: robotsDirectives.includes('noindex'),
    hasNofollow: robotsDirectives.includes('nofollow'),
  };

  // Canonical
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
  const canonical = {
    exists: canonicalUrl !== null,
    url: canonicalUrl,
    isSelfReferencing: canonicalUrl === pageUrl,
  };

  // Language
  const lang = $('html').attr('lang') || null;

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');
  const openGraph = {
    title: ogTitle,
    description: ogDescription,
    image: ogImage,
    type: ogType,
    isComplete: !!(ogTitle && ogDescription && ogImage),
  };

  // Twitter Card
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterDescription = $('meta[name="twitter:description"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  const twitterCardData = {
    card: twitterCard,
    title: twitterTitle,
    description: twitterDescription,
    image: twitterImage,
    isComplete: !!(twitterCard && twitterTitle && twitterDescription),
  };

  return {
    title,
    metaDescription,
    metaRobots,
    canonical,
    lang,
    openGraph,
    twitterCard: twitterCardData,
  };
}

function extractHeadings($: CheerioAPI): HeadingAnalysis {
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];
  const h4: string[] = [];
  const h5: string[] = [];
  const h6: string[] = [];
  const structure: { level: number; text: string; index: number }[] = [];

  let index = 0;

  // Extract all headings in order
  $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
    const tagName = elem.tagName.toLowerCase();
    const text = $(elem).text().trim();
    const level = parseInt(tagName[1]);

    structure.push({ level, text, index: index++ });

    switch (tagName) {
      case 'h1': h1.push(text); break;
      case 'h2': h2.push(text); break;
      case 'h3': h3.push(text); break;
      case 'h4': h4.push(text); break;
      case 'h5': h5.push(text); break;
      case 'h6': h6.push(text); break;
    }
  });

  const quality = {
    hasH1: h1.length > 0,
    h1Count: h1.length,
    multipleH1Warning: h1.length > 1,
    missingH1Warning: h1.length === 0,
    totalCount: structure.length,
  };

  return { h1, h2, h3, h4, h5, h6, structure, quality };
}

function extractContent($: CheerioAPI, html: string): ContentMetrics {
  // Extract text content (excluding scripts, styles, etc.)
  $('script, style, noscript, iframe').remove();
  const textContent = $('body').text();

  // Word count
  const words = textContent
    .trim()
    .split(/\s+/)
    .filter(word => word.length >= 3);
  const wordCount = words.length;

  // Character count
  const characterCount = textContent.trim().length;

  // Paragraph count
  const paragraphCount = $('p').length;

  // Text to HTML ratio
  const htmlLength = html.length;
  const textToHtmlRatio = htmlLength > 0 ? (characterCount / htmlLength) * 100 : 0;

  // Top keywords
  const topKeywords = extractTopKeywords(words);

  // Reading time (200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  return {
    wordCount,
    characterCount,
    paragraphCount,
    textToHtmlRatio: Math.round(textToHtmlRatio * 10) / 10,
    topKeywords,
    readingTime,
  };
}

function extractTopKeywords(words: string[]): { keyword: string; count: number; density: number }[] {
  const wordFrequency = new Map<string, number>();

  // Count word frequency
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.length >= 3 && !STOP_WORDS.has(normalized)) {
      wordFrequency.set(normalized, (wordFrequency.get(normalized) || 0) + 1);
    }
  }

  // Sort by frequency and take top 10
  const sorted = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalWords = words.length;

  return sorted.map(([keyword, count]) => ({
    keyword,
    count,
    density: totalWords > 0 ? Math.round((count / totalWords) * 1000) / 10 : 0,
  }));
}

function extractLinks($: CheerioAPI, pageUrl: string): LinkAnalysis {
  const parsedPageUrl = new URL(pageUrl);
  const internalLinks: { href: string; text: string; isNofollow: boolean }[] = [];
  const externalLinks: { href: string; text: string; isNofollow: boolean }[] = [];

  let totalInternal = 0;
  let totalExternal = 0;
  let totalFollow = 0;
  let totalNofollow = 0;

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (!href) return;

    // Skip anchors and javascript links
    if (href.startsWith('#') || href.startsWith('javascript:')) return;

    const text = $(elem).text().trim() || href;
    const rel = $(elem).attr('rel') || '';
    const isNofollow = rel.includes('nofollow');

    if (isNofollow) {
      totalNofollow++;
    } else {
      totalFollow++;
    }

    try {
      const absoluteUrl = new URL(href, pageUrl);
      const isInternal = absoluteUrl.hostname === parsedPageUrl.hostname;

      const linkData = {
        href: absoluteUrl.href,
        text: text.substring(0, 100), // Truncate long text
        isNofollow
      };

      if (isInternal) {
        totalInternal++;
        if (internalLinks.length < 50) {
          internalLinks.push(linkData);
        }
      } else {
        totalExternal++;
        if (externalLinks.length < 50) {
          externalLinks.push(linkData);
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  const total = totalInternal + totalExternal;

  return {
    total,
    internal: totalInternal,
    external: totalExternal,
    follow: totalFollow,
    nofollow: totalNofollow,
    internalPercentage: total > 0 ? Math.round((totalInternal / total) * 100) : 0,
    nofollowPercentage: total > 0 ? Math.round((totalNofollow / total) * 100) : 0,
    internalLinks,
    externalLinks,
  };
}

function extractMedia($: CheerioAPI): MediaAnalysis {
  const images: { src: string; alt: string | null; hasAlt: boolean }[] = [];
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;

  $('img').each((_, elem) => {
    const src = $(elem).attr('src') || '';
    const alt = $(elem).attr('alt');
    const hasAlt = alt !== undefined;

    if (hasAlt) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
    }

    if (images.length < 20) {
      images.push({ src, alt: alt || null, hasAlt });
    }
  });

  const totalImages = imagesWithAlt + imagesWithoutAlt;
  const altPercentage = totalImages > 0
    ? Math.round((imagesWithAlt / totalImages) * 100)
    : 0;

  return {
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt,
    altPercentage,
    images,
  };
}

function extractStructuredData($: CheerioAPI): StructuredDataAnalysis {
  const jsonLd: { type: string | string[]; raw: any }[] = [];

  // Extract JSON-LD
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const content = $(elem).html() || '';
      const parsed = JSON.parse(content);

      const type = parsed['@type'] || parsed.type || 'Unknown';
      jsonLd.push({ type, raw: parsed });
    } catch (e) {
      // Invalid JSON, skip
    }
  });

  const schemaTypes = jsonLd.map(schema => {
    if (Array.isArray(schema.type)) {
      return schema.type.join(', ');
    }
    return schema.type;
  });

  return {
    hasStructuredData: jsonLd.length > 0,
    jsonLd,
    total: jsonLd.length,
    schemaTypes,
  };
}

function extractTechnical($: CheerioAPI): TechnicalHints {
  // Viewport
  const viewportContent = $('meta[name="viewport"]').attr('content') || null;
  const viewport = {
    exists: viewportContent !== null,
    content: viewportContent,
    isMobileFriendly: viewportContent?.includes('width=device-width') || false,
  };

  // Charset
  const charset = $('meta[charset]').attr('charset') ||
                  $('meta[http-equiv="Content-Type"]').attr('content')?.match(/charset=([^;]+)/)?.[1] ||
                  null;

  // DOCTYPE
  const html = $.html();
  const hasDoctype = html.trim().toLowerCase().startsWith('<!doctype');

  // Favicon
  const faviconHref = $('link[rel="icon"], link[rel="shortcut icon"]').first().attr('href') || null;
  const favicon = {
    exists: faviconHref !== null,
    href: faviconHref,
  };

  return {
    viewport,
    charset,
    hasDoctype,
    favicon,
  };
}

// ============================================================================
// COMPARISON
// ============================================================================

function generateComparison(
  competitor: PageAnalysisResult,
  yours: PageAnalysisResult
): ComparisonResult {
  const opportunities: ComparisonResult['opportunities'] = [];
  const strengths: ComparisonResult['strengths'] = [];

  // Check meta description
  if (competitor.seo.metaDescription.content && !yours.seo.metaDescription.content) {
    opportunities.push({
      category: 'seo',
      severity: 'high',
      title: 'Add Meta Description',
      description: 'Competitor has a meta description, but your page is missing one.',
      recommendation: 'Add a 150-160 character meta description that summarizes your page content.',
    });
  } else if (!competitor.seo.metaDescription.content && yours.seo.metaDescription.content) {
    strengths.push({
      category: 'seo',
      title: 'Has Meta Description',
      description: 'Your page has a meta description while competitor does not.',
    });
  }

  // Check word count
  const wordDiff = competitor.content.wordCount - yours.content.wordCount;
  if (wordDiff > 200) {
    opportunities.push({
      category: 'content',
      severity: 'medium',
      title: `Increase Word Count by ${wordDiff} words`,
      description: `Competitor has ${competitor.content.wordCount} words, you have ${yours.content.wordCount}.`,
      recommendation: `Add approximately ${wordDiff} words of quality content to match competitor depth.`,
    });
  } else if (wordDiff < -200) {
    strengths.push({
      category: 'content',
      title: 'More Comprehensive Content',
      description: `Your page has ${Math.abs(wordDiff)} more words than competitor.`,
    });
  }

  // Check H1
  if (competitor.headings.quality.h1Count === 1 && yours.headings.quality.h1Count !== 1) {
    if (yours.headings.quality.h1Count === 0) {
      opportunities.push({
        category: 'seo',
        severity: 'high',
        title: 'Add H1 Heading',
        description: 'Your page is missing an H1 heading.',
        recommendation: 'Add a single, descriptive H1 heading to your page.',
      });
    } else if (yours.headings.quality.h1Count > 1) {
      opportunities.push({
        category: 'seo',
        severity: 'medium',
        title: 'Multiple H1 Headings',
        description: `Your page has ${yours.headings.quality.h1Count} H1 headings. Competitor has just 1.`,
        recommendation: 'Use only one H1 heading per page for better SEO.',
      });
    }
  }

  // Check internal links
  if (yours.links.internal > competitor.links.internal) {
    strengths.push({
      category: 'links',
      title: 'Better Internal Linking',
      description: `Your page has ${yours.links.internal - competitor.links.internal} more internal links.`,
    });
  } else if (competitor.links.internal - yours.links.internal > 10) {
    opportunities.push({
      category: 'links',
      severity: 'low',
      title: 'Improve Internal Linking',
      description: `Competitor has ${competitor.links.internal - yours.links.internal} more internal links.`,
      recommendation: 'Add more relevant internal links to improve site navigation and SEO.',
    });
  }

  // Check structured data
  if (competitor.structuredData.hasStructuredData && !yours.structuredData.hasStructuredData) {
    opportunities.push({
      category: 'seo',
      severity: 'medium',
      title: 'Add Structured Data',
      description: `Competitor uses structured data (${competitor.structuredData.schemaTypes.join(', ')}), but your page doesn't.`,
      recommendation: 'Implement JSON-LD structured data to enhance search engine understanding.',
    });
  } else if (yours.structuredData.hasStructuredData && !competitor.structuredData.hasStructuredData) {
    strengths.push({
      category: 'seo',
      title: 'Has Structured Data',
      description: 'Your page uses structured data while competitor does not.',
    });
  }

  // Check image alt text
  if (competitor.media.altPercentage > yours.media.altPercentage + 20) {
    opportunities.push({
      category: 'media',
      severity: 'medium',
      title: 'Improve Image Alt Text Coverage',
      description: `Competitor has ${competitor.media.altPercentage}% alt coverage, you have ${yours.media.altPercentage}%.`,
      recommendation: `Add alt text to ${yours.media.imagesWithoutAlt} images.`,
    });
  } else if (yours.media.altPercentage > competitor.media.altPercentage + 20) {
    strengths.push({
      category: 'media',
      title: 'Better Image Accessibility',
      description: `Your page has ${yours.media.altPercentage}% alt text coverage vs competitor's ${competitor.media.altPercentage}%.`,
    });
  }

  // Calculate overall score
  let score = 50; // Base score

  // SEO factors
  if (yours.seo.title.content) score += 5;
  if (yours.seo.metaDescription.content) score += 5;
  if (yours.headings.quality.h1Count === 1) score += 5;
  if (yours.seo.canonical.exists) score += 3;

  // Content factors
  if (yours.content.wordCount > 1000) score += 10;
  else if (yours.content.wordCount > 500) score += 5;

  // Technical factors
  if (yours.technical.viewport.isMobileFriendly) score += 5;
  if (yours.structuredData.hasStructuredData) score += 7;

  // Comparison adjustments
  if (wordDiff > 300) score -= 10;
  else if (wordDiff < -300) score += 10;

  score = Math.min(100, Math.max(0, score));

  const verdict = score > 55 ? 'yours-better' : score < 45 ? 'competitor-better' : 'similar';
  const summary =
    verdict === 'yours-better' ? 'Your page performs better overall' :
    verdict === 'competitor-better' ? 'Competitor performs better overall' :
    'Both pages are similar in quality';

  return {
    opportunities,
    strengths,
    score: {
      overall: score,
      verdict,
      summary,
    },
  };
}

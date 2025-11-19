/**
 * Shared Types
 *
 * These types are used by both backend and frontend to ensure consistency.
 * Import these instead of redefining types in components.
 */

// ============================================================================
// API REQUEST & RESPONSE
// ============================================================================

export interface AnalyzeRequest {
  competitorUrl: string;
  myUrl?: string;
}

export interface AnalyzeResponse {
  competitor: PageAnalysisResult;
  mine?: PageAnalysisResult;
  comparison?: ComparisonResult;
  meta: AnalysisMeta;
}

export interface AnalysisMeta {
  timestamp: string;
  processingTime: number;
  version: string;
  urlsAnalyzed: number;
}

// ============================================================================
// PAGE ANALYSIS RESULT
// ============================================================================

export interface PageAnalysisResult {
  url: string;
  originalUrl: string;
  timestamp: string;
  success: boolean;
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
}

export interface BasicInfo {
  httpStatus: number;
  finalUrl: string;
  wasRedirected: boolean;
  redirectChain?: string[];
  contentType: string;
  contentLength: number;
  responseTime: number;
  server?: string;
}

export interface SEOMetrics {
  title: TitleAnalysis;
  metaDescription: MetaDescriptionAnalysis;
  metaRobots: MetaRobotsAnalysis;
  canonical: CanonicalAnalysis;
  lang: string | null;
  openGraph: OpenGraphTags;
  twitterCard: TwitterCardTags;
}

export interface TitleAnalysis {
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
}

export interface MetaDescriptionAnalysis {
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
}

export interface MetaRobotsAnalysis {
  content: string | null;
  directives: string[];
  hasNoindex: boolean;
  hasNofollow: boolean;
}

export interface CanonicalAnalysis {
  exists: boolean;
  url: string | null;
  isSelfReferencing: boolean;
}

export interface OpenGraphTags {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  isComplete: boolean;
}

export interface TwitterCardTags {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  isComplete: boolean;
}

export interface HeadingAnalysis {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  structure: HeadingStructure[];
  quality: HeadingQuality;
}

export interface HeadingStructure {
  level: number;
  text: string;
  index: number;
}

export interface HeadingQuality {
  hasH1: boolean;
  h1Count: number;
  multipleH1Warning: boolean;
  missingH1Warning: boolean;
  totalCount: number;
}

export interface ContentMetrics {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  textToHtmlRatio: number;
  topKeywords: KeywordFrequency[];
  readingTime: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
  density: number;
}

export interface LinkAnalysis {
  total: number;
  internal: number;
  external: number;
  follow: number;
  nofollow: number;
  internalPercentage: number;
  nofollowPercentage: number;
  internalLinks: LinkDetail[];
  externalLinks: LinkDetail[];
}

export interface LinkDetail {
  href: string;
  text: string;
  isNofollow: boolean;
}

export interface MediaAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  altPercentage: number;
  images: ImageDetail[];
}

export interface ImageDetail {
  src: string;
  alt: string | null;
  hasAlt: boolean;
}

export interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  jsonLd: JSONLDSchema[];
  total: number;
  schemaTypes: string[];
}

export interface JSONLDSchema {
  type: string | string[];
  raw: any;
}

export interface TechnicalHints {
  viewport: ViewportAnalysis;
  charset: string | null;
  hasDoctype: boolean;
  favicon: FaviconAnalysis;
}

export interface ViewportAnalysis {
  exists: boolean;
  content: string | null;
  isMobileFriendly: boolean;
}

export interface FaviconAnalysis {
  exists: boolean;
  href: string | null;
}

// ============================================================================
// COMPARISON
// ============================================================================

export interface ComparisonResult {
  opportunities: Opportunity[];
  strengths: Strength[];
  score: ComparisonScore;
}

export interface Opportunity {
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface Strength {
  category: string;
  title: string;
  description: string;
}

export interface ComparisonScore {
  overall: number;
  verdict: string;
  summary: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiErrorResponse {
  error: true;
  message: string;
  code: ErrorCode;
  statusCode: number;
  timestamp: string;
  details?: ErrorDetails;
  urlContext?: 'competitor' | 'mine';
}

export enum ErrorCode {
  // Validation errors (400)
  INVALID_URL = 'INVALID_URL',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',
  URL_TOO_LONG = 'URL_TOO_LONG',
  SAME_URLS = 'SAME_URLS',

  // Access errors (403)
  ROBOTS_TXT_DISALLOWED = 'ROBOTS_TXT_DISALLOWED',
  BLOCKED_DOMAIN = 'BLOCKED_DOMAIN',
  SERP_SCRAPING_PROHIBITED = 'SERP_SCRAPING_PROHIBITED',

  // Resource errors (404)
  URL_NOT_FOUND = 'URL_NOT_FOUND',
  DNS_ERROR = 'DNS_ERROR',

  // Content errors (400, 413)
  NON_HTML_CONTENT = 'NON_HTML_CONTENT',
  PAGE_TOO_LARGE = 'PAGE_TOO_LARGE',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server/network errors (500, 503, 504)
  FETCH_TIMEOUT = 'FETCH_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorDetails {
  originalError?: string;
  url?: string;
  retryAfter?: number;
  validationErrors?: ValidationError[];
  suggestions?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  expected?: string;
  received?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isErrorResponse(
  response: AnalyzeResponse | ApiErrorResponse
): response is ApiErrorResponse {
  return 'error' in response && response.error === true;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: ErrorCode;
}

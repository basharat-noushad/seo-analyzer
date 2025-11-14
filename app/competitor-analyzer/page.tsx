'use client';

/**
 * Competitor Page Analyzer - Main Page
 *
 * Full-featured SEO analysis tool with comparison mode.
 */

import { useState } from 'react';
import { AdSlot } from '@/components/AdSlot';
import { LoadingSkeleton, LoadingProgress } from '@/components/LoadingSkeleton';
import { useUrlValidation } from '@/hooks/useUrlValidation';
import { StructuredData } from '@/components/StructuredData';

// ============================================================================
// TYPES (matching API types)
// ============================================================================

interface AnalyzeResponse {
  competitor: PageAnalysisResult;
  mine?: PageAnalysisResult;
  comparison?: ComparisonResult;
  meta: {
    timestamp: string;
    processingTime: number;
    version: string;
    urlsAnalyzed: number;
  };
}

interface PageAnalysisResult {
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

interface BasicInfo {
  httpStatus: number;
  finalUrl: string;
  wasRedirected: boolean;
  contentType: string;
  contentLength: number;
  responseTime: number;
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

interface ApiErrorResponse {
  error: true;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorAnalyzerPage() {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [myUrl, setMyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('meta');

  // Client-side validation
  const {
    competitorError,
    myUrlError,
    isValid,
    validate
  } = useUrlValidation(competitorUrl, myUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate before submitting
    const isFormValid = validate();
    if (!isFormValid) {
      setError('Please fix the validation errors above');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorUrl: competitorUrl.trim(),
          myUrl: myUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Show specific error based on urlContext
        let errorMsg = data.message || 'Analysis failed';
        if (data.urlContext === 'competitor') {
          errorMsg = `Competitor URL: ${data.message}`;
        } else if (data.urlContext === 'mine') {
          errorMsg = `Your URL: ${data.message}`;
        }
        setError(errorMsg);
      } else {
        setResult(data);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Structured Data for SEO */}
      <StructuredData />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">SEO Analyzer Pro</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Competitor Page Analyzer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Analyze any webpage&apos;s on-page SEO metrics and compare against your own page.
            Get actionable insights instantly.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Title & Meta Tags
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Content Analysis
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Heading Structure
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Link Analysis
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Schema Markup
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Technical SEO
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Analyze URLs</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Competitor URL */}
            <div>
              <label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Competitor URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <input
                  type="url"
                  id="competitorUrl"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 text-base ${
                    competitorError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="https://competitor.com/page"
                  disabled={loading}
                  aria-invalid={!!competitorError}
                  aria-describedby={competitorError ? 'competitor-error' : undefined}
                  required
                />
              </div>
              {competitorError && (
                <p id="competitor-error" className="mt-2 text-sm text-red-600 flex items-start">
                  <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {competitorError}
                </p>
              )}
            </div>

            {/* My URL (Optional) */}
            <div>
              <label htmlFor="myUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Your URL <span className="text-gray-400">(Optional - for comparison)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <input
                  type="url"
                  id="myUrl"
                  value={myUrl}
                  onChange={(e) => setMyUrl(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 text-base ${
                    myUrlError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="https://yoursite.com/page"
                  disabled={loading}
                  aria-invalid={!!myUrlError}
                  aria-describedby={myUrlError ? 'my-url-error' : 'my-url-hint'}
                />
              </div>
              {myUrlError ? (
                <p id="my-url-error" className="mt-2 text-sm text-red-600 flex items-start">
                  <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {myUrlError}
                </p>
              ) : (
                <p id="my-url-hint" className="mt-2 text-sm text-gray-500 flex items-start">
                  <svg className="w-4 h-4 text-primary-500 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Add your URL to see side-by-side comparison and get improvement recommendations</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center ${
                loading || !isValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Pages...
                </>
              ) : (
                <>
                  Analyze Pages
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-xs text-gray-500 text-center">
              ℹ️ Analysis respects robots.txt and only analyzes public content
            </p>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Analysis Failed</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Empty State - shown when no analysis has been run */}
      {!loading && !result && !error && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Analyze
            </h3>
            <p className="text-gray-600 mb-4">
              Enter a competitor&apos;s URL above to get started with comprehensive SEO analysis.
            </p>
            <div className="text-sm text-gray-500">
              <p className="mb-2">You&apos;ll receive insights on:</p>
              <ul className="text-left max-w-md mx-auto space-y-1">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Meta tags and SEO elements
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Content structure and keywords
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Links, images, and technical SEO
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading State - shown during analysis */}
      {loading && (
        <LoadingProgress
          competitorUrl={competitorUrl}
          myUrl={myUrl || undefined}
        />
      )}

      {/* Ad Slot - Top (appears after submission) */}
      {result && <AdSlot position="top" />}

      {/* Results Section */}
      {!loading && result && result.competitor.success && (
        <section id="results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Summary Cards */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Analysis Results for {result.competitor.url}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <SummaryCard
                title="Title Tag"
                value={result.competitor.seo.title.quality.exists ? 'Yes' : 'No'}
                detail={`${result.competitor.seo.title.length} chars`}
                status={result.competitor.seo.title.quality.withinIdealLength ? 'good' : result.competitor.seo.title.quality.exists ? 'warning' : 'error'}
              />
              <SummaryCard
                title="Meta Desc"
                value={result.competitor.seo.metaDescription.quality.exists ? 'Yes' : 'No'}
                detail={`${result.competitor.seo.metaDescription.length} chars`}
                status={result.competitor.seo.metaDescription.quality.withinIdealLength ? 'good' : result.competitor.seo.metaDescription.quality.exists ? 'warning' : 'error'}
              />
              <SummaryCard
                title="Word Count"
                value={result.competitor.content.wordCount.toLocaleString()}
                detail={`${result.competitor.content.readingTime} min read`}
                status={result.competitor.content.wordCount > 1000 ? 'good' : result.competitor.content.wordCount > 300 ? 'warning' : 'error'}
              />
              <SummaryCard
                title="H1 Count"
                value={result.competitor.headings.quality.h1Count.toString()}
                detail={`${result.competitor.headings.quality.totalCount} total`}
                status={result.competitor.headings.quality.h1Count === 1 ? 'good' : 'warning'}
              />
              <SummaryCard
                title="Links"
                value={result.competitor.links.total.toString()}
                detail={`${result.competitor.links.internalPercentage}% internal`}
                status="info"
              />
              <SummaryCard
                title="Schema"
                value={result.competitor.structuredData.hasStructuredData ? 'Yes' : 'No'}
                detail={result.competitor.structuredData.schemaTypes.join(', ').substring(0, 20) || 'None'}
                status={result.competitor.structuredData.hasStructuredData ? 'good' : 'warning'}
              />
            </div>
          </div>

          {/* Detailed Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto">
                <TabButton active={activeTab === 'meta'} onClick={() => setActiveTab('meta')}>
                  Meta & Head
                </TabButton>
                <TabButton active={activeTab === 'headings'} onClick={() => setActiveTab('headings')}>
                  Headings
                </TabButton>
                <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')}>
                  Content
                </TabButton>
                <TabButton active={activeTab === 'links'} onClick={() => setActiveTab('links')}>
                  Links
                </TabButton>
                <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')}>
                  Media
                </TabButton>
                <TabButton active={activeTab === 'structured'} onClick={() => setActiveTab('structured')}>
                  Schema
                </TabButton>
                <TabButton active={activeTab === 'technical'} onClick={() => setActiveTab('technical')}>
                  Technical
                </TabButton>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'meta' && <MetaTab data={result.competitor.seo} />}
              {activeTab === 'headings' && <HeadingsTab data={result.competitor.headings} />}
              {activeTab === 'content' && <ContentTab data={result.competitor.content} />}
              {activeTab === 'links' && <LinksTab data={result.competitor.links} />}
              {activeTab === 'media' && <MediaTab data={result.competitor.media} />}
              {activeTab === 'structured' && <StructuredDataTab data={result.competitor.structuredData} />}
              {activeTab === 'technical' && <TechnicalTab data={result.competitor.technical} />}
            </div>
          </div>
        </section>
      )}

      {/* Comparison Section */}
      {result && result.comparison && result.mine && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Head-to-Head Comparison</h3>

            {/* Score Card */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {result.comparison.score.overall}/100
                </div>
                <div className="text-lg text-gray-700 mb-1">
                  {result.comparison.score.verdict === 'yours-better' ? '🎉 Your Page Wins!' :
                   result.comparison.score.verdict === 'competitor-better' ? '⚠️ Competitor Ahead' :
                   '🤝 Similar Performance'}
                </div>
                <div className="text-sm text-gray-600">
                  {result.comparison.score.summary}
                </div>
              </div>
            </div>

            {/* Opportunities */}
            {result.comparison.opportunities.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  🎯 Opportunities ({result.comparison.opportunities.length})
                </h4>
                <div className="space-y-4">
                  {result.comparison.opportunities.map((opp, idx) => (
                    <div key={idx} className={`border-l-4 ${
                      opp.severity === 'high' ? 'border-red-500 bg-red-50' :
                      opp.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    } p-4 rounded-r-lg`}>
                      <div className="flex items-start">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opp.severity === 'high' ? 'bg-red-100 text-red-800' :
                          opp.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        } mr-3 mt-1`}>
                          {opp.severity.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{opp.title}</h5>
                          <p className="text-sm text-gray-700 mb-2">{opp.description}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Recommendation:</strong> {opp.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {result.comparison.strengths.length > 0 && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  💪 Your Strengths ({result.comparison.strengths.length})
                </h4>
                <div className="space-y-3">
                  {result.comparison.strengths.map((strength, idx) => (
                    <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                      <h5 className="font-semibold text-gray-900 mb-1">{strength.title}</h5>
                      <p className="text-sm text-gray-700">{strength.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ad Slot - Bottom */}
      {result && <AdSlot position="bottom" />}

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <FAQItem
            question="What does this tool analyze?"
            answer="This tool analyzes on-page SEO elements including title tags, meta descriptions, heading structure, content metrics, internal/external links, image alt text, structured data (JSON-LD), and technical SEO hints like viewport and charset."
          />
          <FAQItem
            question="Do you respect robots.txt?"
            answer="Yes! Before analyzing any page, we check the site's robots.txt file. If crawling is disallowed, we will not analyze the page and will show you a clear error message."
          />
          <FAQItem
            question="Do you store my analyzed URLs?"
            answer="No. This tool is stateless and does not store any URLs or analysis results in a database. Each analysis is performed fresh and the results are only displayed to you."
          />
          <FAQItem
            question="Can I analyze password-protected pages?"
            answer="No. This tool only analyzes publicly accessible content. We do not bypass paywalls, login walls, or any access restrictions."
          />
          <FAQItem
            question="How accurate are the metrics?"
            answer="The metrics are extracted directly from the HTML source code and are highly accurate for on-page elements. However, this tool does not execute JavaScript, so single-page applications (SPAs) may show incomplete data."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            <p className="mb-2">
              <strong className="text-white">Disclaimer:</strong> This tool is for educational and competitive analysis purposes.
              Users are responsible for ensuring they have permission to analyze URLs. We respect robots.txt and do not bypass access controls.
            </p>
            <p>&copy; 2025 SEO Analyzer Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SummaryCard({ title, value, detail, status }: {
  title: string;
  value: string;
  detail: string;
  status: 'good' | 'warning' | 'error' | 'info';
}) {
  const colors = {
    good: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50',
    info: 'border-blue-500 bg-blue-50',
  };

  const badgeColors = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className={`border-l-4 ${colors[status]} rounded-lg p-4 shadow-sm`}>
      <div className="text-xs font-medium text-gray-600 mb-2">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600 truncate">{detail}</div>
      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeColors[status]} mt-2`}>
        {status === 'good' ? '✓' : status === 'error' ? '✗' : status === 'warning' ? '⚠' : 'ℹ'}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        active
          ? 'border-primary-500 text-primary-600 bg-white'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function MetaTab({ data }: { data: SEOMetrics }) {
  return (
    <div className="space-y-6">
      <MetricRow
        label="Title Tag"
        value={data.title.content || 'Missing'}
        detail={`${data.title.length} characters`}
        status={data.title.quality.withinIdealLength ? 'good' : data.title.quality.exists ? 'warning' : 'error'}
        recommendations={data.title.recommendations}
      />
      <MetricRow
        label="Meta Description"
        value={data.metaDescription.content || 'Missing'}
        detail={`${data.metaDescription.length} characters`}
        status={data.metaDescription.quality.withinIdealLength ? 'good' : data.metaDescription.quality.exists ? 'warning' : 'error'}
        recommendations={data.metaDescription.recommendations}
      />
      <MetricRow
        label="Canonical URL"
        value={data.canonical.url || 'Not set'}
        detail={data.canonical.isSelfReferencing ? 'Self-referencing' : data.canonical.exists ? 'External' : 'Missing'}
        status={data.canonical.exists ? 'good' : 'warning'}
      />
      <MetricRow
        label="Open Graph"
        value={data.openGraph.isComplete ? 'Complete' : 'Incomplete'}
        detail={`${data.openGraph.title ? '✓' : '✗'} Title, ${data.openGraph.description ? '✓' : '✗'} Description, ${data.openGraph.image ? '✓' : '✗'} Image`}
        status={data.openGraph.isComplete ? 'good' : 'warning'}
      />
      <MetricRow
        label="Twitter Card"
        value={data.twitterCard.isComplete ? 'Complete' : 'Incomplete'}
        detail={`${data.twitterCard.card ? '✓' : '✗'} Card Type, ${data.twitterCard.title ? '✓' : '✗'} Title`}
        status={data.twitterCard.isComplete ? 'good' : 'warning'}
      />
    </div>
  );
}

function HeadingsTab({ data }: { data: HeadingAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Quality Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Quality Check</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            {data.quality.hasH1 ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{data.quality.hasH1 ? 'Has H1 heading' : 'Missing H1 heading'}</span>
          </div>
          <div className="flex items-center">
            {data.quality.h1Count === 1 ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{data.quality.h1Count === 1 ? 'Single H1 (recommended)' : `${data.quality.h1Count} H1 tags found`}</span>
          </div>
          <div className="text-gray-600">
            Total headings: {data.quality.totalCount}
          </div>
        </div>
      </div>

      {/* Heading Distribution */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Distribution</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h1.length}</div>
            <div className="text-xs text-gray-600">H1</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h2.length}</div>
            <div className="text-xs text-gray-600">H2</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h3.length}</div>
            <div className="text-xs text-gray-600">H3</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h4.length}</div>
            <div className="text-xs text-gray-600">H4</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h5.length}</div>
            <div className="text-xs text-gray-600">H5</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{data.h6.length}</div>
            <div className="text-xs text-gray-600">H6</div>
          </div>
        </div>
      </div>

      {/* Heading Structure */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Structure</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.structure.slice(0, 20).map((heading, idx) => (
            <div key={idx} className={`pl-${(heading.level - 1) * 4} py-2 border-l-2 border-gray-200`}>
              <span className="text-xs font-mono text-gray-500 mr-2">H{heading.level}</span>
              <span className="text-sm text-gray-900">{heading.text}</span>
            </div>
          ))}
          {data.structure.length > 20 && (
            <div className="text-sm text-gray-500 italic">
              Showing 20 of {data.structure.length} headings
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentTab({ data }: { data: ContentMetrics }) {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.wordCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.paragraphCount}</div>
          <div className="text-sm text-gray-600">Paragraphs</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.readingTime}</div>
          <div className="text-sm text-gray-600">Min Read</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.textToHtmlRatio.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Text Ratio</div>
        </div>
      </div>

      {/* Top Keywords */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Top Keywords</h4>
        <div className="space-y-2">
          {data.topKeywords.map((kw, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-sm font-medium text-gray-900 w-32">{kw.keyword}</span>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, kw.density * 10)}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-20 text-right">
                {kw.count} ({kw.density.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinksTab({ data }: { data: LinkAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.internal}</div>
          <div className="text-sm text-gray-600">Internal</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.external}</div>
          <div className="text-sm text-gray-600">External</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.internalPercentage}%</div>
          <div className="text-sm text-gray-600">Internal %</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.nofollowPercentage}%</div>
          <div className="text-sm text-gray-600">Nofollow %</div>
        </div>
      </div>

      {/* Internal Links */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Internal Links (showing {Math.min(10, data.internalLinks.length)} of {data.internal})
        </h4>
        <div className="space-y-2">
          {data.internalLinks.slice(0, 10).map((link, idx) => (
            <div key={idx} className="bg-gray-50 rounded p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">{link.text || 'No anchor text'}</div>
              <div className="text-xs text-gray-600 break-all">{link.href}</div>
            </div>
          ))}
        </div>
      </div>

      {/* External Links */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          External Links (showing {Math.min(10, data.externalLinks.length)} of {data.external})
        </h4>
        <div className="space-y-2">
          {data.externalLinks.slice(0, 10).map((link, idx) => (
            <div key={idx} className="bg-gray-50 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-900">{link.text || 'No anchor text'}</div>
                {link.isNofollow && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">nofollow</span>
                )}
              </div>
              <div className="text-xs text-gray-600 break-all">{link.href}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MediaTab({ data }: { data: MediaAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.totalImages}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.imagesWithAlt}</div>
          <div className="text-sm text-gray-600">With Alt</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.imagesWithoutAlt}</div>
          <div className="text-sm text-gray-600">Without Alt</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.altPercentage}%</div>
          <div className="text-sm text-gray-600">Coverage</div>
        </div>
      </div>

      {/* Alt Coverage Bar */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Alt Text Coverage</h4>
        <div className="bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${data.altPercentage >= 90 ? 'bg-green-500' : data.altPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${data.altPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {data.altPercentage >= 90 ? '✓ Excellent coverage' : data.altPercentage >= 70 ? '⚠ Good, but can improve' : '✗ Poor coverage, add alt text'}
        </p>
      </div>

      {/* Sample Images */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Sample Images (showing {Math.min(10, data.images.length)} of {data.totalImages})
        </h4>
        <div className="space-y-3">
          {data.images.slice(0, 10).map((img, idx) => (
            <div key={idx} className={`border rounded-lg p-3 ${img.hasAlt ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500">Image {idx + 1}</span>
                {!img.hasAlt && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Missing Alt</span>
                )}
              </div>
              <div className="text-sm text-gray-900 mb-1 break-all">{img.src}</div>
              <div className="text-sm text-gray-600">
                <strong>Alt:</strong> {img.alt || <span className="text-red-600">None</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StructuredDataTab({ data }: { data: StructuredDataAnalysis }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className={`rounded-lg p-4 ${data.hasStructuredData ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          {data.hasStructuredData ? (
            <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <div>
            <div className="font-semibold text-gray-900">
              {data.hasStructuredData ? `Structured Data Found (${data.total})` : 'No Structured Data'}
            </div>
            <div className="text-sm text-gray-600">
              {data.hasStructuredData ? data.schemaTypes.join(', ') : 'Consider adding JSON-LD schema markup'}
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Schemas */}
      {data.jsonLd.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">JSON-LD Schemas</h4>
          <div className="space-y-3">
            {data.jsonLd.map((schema, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded text-sm font-medium mr-3">
                      {Array.isArray(schema.type) ? schema.type.join(', ') : schema.type}
                    </span>
                    <span className="text-sm text-gray-600">JSON-LD</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedIndex === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedIndex === idx && (
                  <div className="p-4 bg-gray-900 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(schema.raw, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TechnicalTab({ data }: { data: TechnicalHints }) {
  return (
    <div className="space-y-6">
      <MetricRow
        label="Viewport"
        value={data.viewport.exists ? 'Configured' : 'Missing'}
        detail={data.viewport.content || 'Not set'}
        status={data.viewport.isMobileFriendly ? 'good' : 'warning'}
      />
      <MetricRow
        label="Mobile-Friendly"
        value={data.viewport.isMobileFriendly ? 'Yes' : 'No'}
        detail={data.viewport.isMobileFriendly ? 'Viewport includes width=device-width' : 'Add viewport meta tag'}
        status={data.viewport.isMobileFriendly ? 'good' : 'error'}
      />
      <MetricRow
        label="Character Encoding"
        value={data.charset || 'Not specified'}
        detail={data.charset === 'UTF-8' ? 'Standard encoding' : 'Consider using UTF-8'}
        status={data.charset ? 'good' : 'warning'}
      />
      <MetricRow
        label="DOCTYPE"
        value={data.hasDoctype ? 'Present' : 'Missing'}
        detail={data.hasDoctype ? 'HTML5 DOCTYPE detected' : 'Add DOCTYPE declaration'}
        status={data.hasDoctype ? 'good' : 'warning'}
      />
      <MetricRow
        label="Favicon"
        value={data.favicon.exists ? 'Present' : 'Missing'}
        detail={data.favicon.href || 'Not set'}
        status={data.favicon.exists ? 'good' : 'info'}
      />
    </div>
  );
}

function MetricRow({ label, value, detail, status, recommendations }: {
  label: string;
  value: string;
  detail: string;
  status: 'good' | 'warning' | 'error' | 'info';
  recommendations?: string[];
}) {
  const colors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900">{label}</div>
        <div className={`text-sm font-medium ${colors[status]}`}>
          {status === 'good' ? '✓' : status === 'error' ? '✗' : status === 'warning' ? '⚠' : 'ℹ'}
        </div>
      </div>
      <div className="text-sm text-gray-900 mb-1 break-words">{value}</div>
      <div className="text-sm text-gray-600">{detail}</div>
      {recommendations && recommendations.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Recommendations:</strong>
          <ul className="list-disc list-inside ml-2 mt-1">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}

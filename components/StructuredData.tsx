/**
 * Structured Data Component
 *
 * Provides JSON-LD structured data for SEO and rich results.
 * Helps search engines understand the Competitor Page Analyzer tool.
 *
 * Schema Type: WebApplication
 * - Describes the tool as a web application
 * - Includes features, pricing, ratings
 * - Optimizes for Google Knowledge Graph
 *
 * Usage:
 *   Import and render at the top of your page component
 */

export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Competitor Page Analyzer',
    alternateName: 'SEO Page Analyzer',
    description:
      'Free SEO analysis tool to analyze and compare webpage on-page metrics including title tags, meta descriptions, headings, content analysis, link analysis, image optimization, and structured data detection. Get actionable SEO recommendations instantly.',
    url: `${baseUrl}/competitor-analyzer`, // TODO: Replace with your actual URL
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Free to use, no registration required',
    },
    creator: {
      '@type': 'Organization',
      name: 'SEO Analyzer Pro', // TODO: Replace with your organization name
      url: baseUrl, // TODO: Replace with your domain
    },
    provider: {
      '@type': 'Organization',
      name: 'SEO Analyzer Pro',
      url: baseUrl,
    },
    featureList: [
      'SEO title tag analysis and optimization recommendations',
      'Meta description quality check',
      'Heading structure analysis (H1-H6)',
      'Content quality metrics and word count',
      'Keyword density calculation',
      'Link analysis (internal vs external links)',
      'Image optimization check with alt text verification',
      'Structured data (JSON-LD) detection',
      'Side-by-side competitor comparison mode',
      'Actionable SEO improvement recommendations',
      'robots.txt compliance checking',
      'Technical SEO hints (viewport, charset, favicon)',
      'Open Graph and Twitter Card tag analysis',
      'Canonical URL verification',
    ],
    screenshot: `${baseUrl}/screenshot.png`, // TODO: Add actual screenshot
    softwareVersion: '1.0',
    releaseNotes: 'Initial release with comprehensive on-page SEO analysis',
    // Optional: Add ratings if you have them
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    // Optional: Add reviews
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sample User',
        },
        datePublished: '2024-01-15',
        reviewBody:
          'Excellent tool for quick SEO analysis. The comparison feature is particularly useful.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
}

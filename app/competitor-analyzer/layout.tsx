/**
 * Competitor Analyzer Layout
 *
 * Provides SEO metadata for the Competitor Page Analyzer tool.
 * This layout wraps the analyzer page and sets title, description, Open Graph, etc.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
  description:
    'Analyze any webpage for SEO metrics. Compare competitor pages, check title tags, meta descriptions, headings, links, images, and structured data. Free online SEO tool with instant results.',
  keywords: [
    'seo analyzer',
    'competitor analysis',
    'seo audit',
    'page analyzer',
    'meta tags checker',
    'seo tool',
    'free seo analysis',
    'on-page seo',
    'seo comparison',
    'competitor seo',
    'title tag checker',
    'meta description checker',
    'heading analyzer',
    'link analyzer',
    'structured data checker',
  ],
  authors: [{ name: 'SEO Analyzer Pro' }],
  creator: 'SEO Analyzer Pro',
  publisher: 'SEO Analyzer Pro',

  // Open Graph metadata for social sharing
  openGraph: {
    title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
    description:
      'Analyze any webpage for SEO metrics. Compare competitor pages and get actionable insights to improve your SEO performance.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seo-analyzer-eta-umber.vercel.app'}/competitor-analyzer`.replace(/([^:]\/)\/+/g, '$1'),
    siteName: 'SEO Analyzer Pro',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seo-analyzer-eta-umber.vercel.app'}/og-image-analyzer.png`.replace(/([^:]\/)\/+/g, '$1'), // TODO: Create and add actual image
        width: 1200,
        height: 630,
        alt: 'Competitor Page Analyzer - SEO Tool Screenshot',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
    description:
      'Analyze any webpage for SEO metrics. Compare competitor pages and get actionable insights instantly.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://seo-analyzer-eta-umber.vercel.app'}/twitter-image-analyzer.png`.replace(/([^:]\/)\/+/g, '$1')], // TODO: Create and add actual image
    creator: '@yourtwitterhandle', // TODO: Replace with your Twitter handle
    site: '@yourtwitterhandle',
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://seo-analyzer-eta-umber.vercel.app'}/competitor-analyzer`.replace(/([^:]\/)\/+/g, '$1'),
  },

  // Additional metadata
  category: 'Technology',
  classification: 'SEO Tools',

  // Viewport is set in root layout, but can be overridden here if needed
  // viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function CompetitorAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

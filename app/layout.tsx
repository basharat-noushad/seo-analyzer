/**
 * Root Layout
 *
 * Wraps the entire application with global metadata, styles, and scripts.
 * Includes AdSense script for monetization.
 */

import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AdSenseScript } from '@/components/AdSenseScript';
import { Providers } from '@/components/providers';
import './globals.css';

// Base URL for your application
// TODO: Replace with your actual domain
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://seo-analyzer-eta-umber.vercel.app').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  // Title configuration with template
  title: {
    default: 'SEO Analyzer Pro - Free SEO Tools',
    template: '%s | SEO Analyzer Pro',
  },

  description:
    'Free SEO analysis tools for webmasters and marketers. Analyze competitor pages, check on-page SEO, and get actionable insights to improve your rankings.',

  keywords: [
    'seo analyzer',
    'seo tools',
    'competitor analysis',
    'seo audit',
    'free seo tools',
    'on-page seo',
    'meta tags checker',
  ],

  authors: [{ name: 'SEO Analyzer Pro', url: baseUrl }],
  creator: 'SEO Analyzer Pro',
  publisher: 'SEO Analyzer Pro',
  category: 'Technology',

  // Verification codes for search engines
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  },

  // Manifest for PWA (optional)
  manifest: '/manifest.json',

  // Open Graph defaults
  openGraph: {
    type: 'website',
    siteName: 'SEO Analyzer Pro',
    locale: 'en_US',
  },

  // Twitter Card defaults
  twitter: {
    card: 'summary_large_image',
    site: '@yourtwitterhandle', // TODO: Replace with your Twitter handle
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script */}
        {/* TODO: Replace with your actual publisher ID */}
        <AdSenseScript publisherId={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-XXXXXXXXXXXX"} />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

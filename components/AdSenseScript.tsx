/**
 * AdSense Script Component
 *
 * Loads the Google AdSense script once for the entire application.
 * Uses Next.js Script component for optimal loading performance.
 *
 * Usage:
 *   Import in app/layout.tsx and place in <head>
 *
 * Important:
 *   - Only loads in production (prevents AdSense policy violations)
 *   - Replace 'ca-pub-XXXXXXXXXXXX' with your actual publisher ID
 *   - Uses afterInteractive strategy for non-blocking load
 */

'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface AdSenseScriptProps {
  /**
   * Your Google AdSense publisher ID
   * Format: ca-pub-XXXXXXXXXXXX
   * Get this from your AdSense account
   */
  publisherId: string;
}

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Only load AdSense in production environment
    // This prevents policy violations during development
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  // Don't render script in development
  if (!isProduction) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdSense] Script not loaded in development mode');
    }
    return null;
  }

  // Validate publisher ID format
  if (!publisherId.startsWith('ca-pub-')) {
    console.error('[AdSense] Invalid publisher ID format. Should start with "ca-pub-"');
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('[AdSense] Script loaded successfully');
      }}
      onError={(e) => {
        console.error('[AdSense] Script failed to load:', e);
      }}
    />
  );
}

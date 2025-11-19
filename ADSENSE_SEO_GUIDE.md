# AdSense Integration & SEO Guide - Competitor Page Analyzer

This guide covers how to integrate Google AdSense and optimize SEO for the Competitor Page Analyzer in Next.js 14 App Router.

---

## Table of Contents

1. [AdSense Integration](#adsense-integration)
2. [SEO Optimization](#seo-optimization)
3. [Performance & Core Web Vitals](#performance--core-web-vitals)
4. [Testing AdSense](#testing-adsense)
5. [Common Issues](#common-issues)

---

## AdSense Integration

### Overview

Google AdSense integration in Next.js App Router requires:
1. **AdSense script** loaded once in the root layout
2. **Ad slots** placed strategically with reserved space (CLS prevention)
3. **Safe initialization** to handle client-side rendering and hydration

### Step 1: Get AdSense Publisher ID

1. Sign up at [Google AdSense](https://www.google.com/adsense/)
2. Get your publisher ID (format: `ca-pub-XXXXXXXXXXXX`)
3. Create ad units and note their slot IDs

### Step 2: AdSense Script Component

**Location:** `components/AdSenseScript.tsx`

This component loads the AdSense script once in your app:

```typescript
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface AdSenseScriptProps {
  publisherId: string; // Your ca-pub-XXXXXXXXXXXX
}

export function AdSenseScript({ publisherId }: AdSenseScriptProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Only load AdSense in production
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  // Don't load AdSense in development
  if (!isProduction) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
```

**Key points:**
- Uses Next.js `<Script>` component for optimal loading
- `strategy="afterInteractive"` loads after page is interactive
- Only loads in production (prevents AdSense policy violations in dev)
- `crossOrigin="anonymous"` for CORS compliance

### Step 3: Add Script to Root Layout

**Location:** `app/layout.tsx`

```typescript
import { AdSenseScript } from '@/components/AdSenseScript';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* AdSense Script - Loads once for entire app */}
        <AdSenseScript publisherId="ca-pub-XXXXXXXXXXXX" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Why in layout?**
- Loads once for the entire application
- Cached across page navigations
- No re-initialization on client-side routing

### Step 4: Updated AdSlot Component

**Location:** `components/AdSlot.tsx`

This component renders individual ad slots:

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  adSlot: string; // Your ad slot ID (e.g., '1234567890')
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  fullWidthResponsive?: boolean;
}

// Placeholder publisher ID - Replace with your actual ID
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXX';

// Ad dimensions for CLS prevention
const AD_DIMENSIONS = {
  top: { width: 'w-full', height: 'min-h-[90px] md:min-h-[90px]' }, // Leaderboard
  middle: { width: 'w-full', height: 'min-h-[250px] md:min-h-[90px]' }, // Mobile banner / Leaderboard
  bottom: { width: 'w-full', height: 'min-h-[90px] md:min-h-[90px]' }, // Leaderboard
  sidebar: { width: 'w-full', height: 'min-h-[600px]' }, // Wide skyscraper
};

export function AdSlot({
  position,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return;

    // Check if running in browser and adsbygoogle exists
    if (typeof window === 'undefined') return;

    try {
      // Push ad to adsbygoogle queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      hasInitialized.current = true;
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const dimensions = AD_DIMENSIONS[position];

  return (
    <div
      className={`ad-slot-container ${dimensions.width} ${dimensions.height} flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden my-8`}
      data-ad-position={position}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
```

**Key improvements:**
- Uses real `<ins class="adsbygoogle">` element
- Calls `adsbygoogle.push({})` on mount
- Guards against double-initialization with `useRef`
- Reserved height prevents CLS
- Fallback background shows while ad loads

### Step 5: Using AdSlot in Pages

**Example:** `app/competitor-analyzer/page.tsx`

```typescript
import { AdSlot } from '@/components/AdSlot';

export default function CompetitorAnalyzerPage() {
  return (
    <div>
      {/* Form section */}
      <section>{/* ... form ... */}</section>

      {/* Ad Slot - Top */}
      {result && (
        <AdSlot
          position="top"
          adSlot="1234567890" // Replace with your ad slot ID
          adFormat="auto"
        />
      )}

      {/* Results section */}
      {result && <section>{/* ... results ... */}</section>}

      {/* Ad Slot - Middle */}
      {result && (
        <AdSlot
          position="middle"
          adSlot="0987654321" // Different slot ID
          adFormat="auto"
        />
      )}

      {/* Ad Slot - Bottom */}
      {result && (
        <AdSlot
          position="bottom"
          adSlot="1122334455"
          adFormat="horizontal"
        />
      )}
    </div>
  );
}
```

**Ad placement strategy:**
- **Top:** After form submission, before results
- **Middle:** Between result sections
- **Bottom:** After all results
- **Conditional rendering:** Only show ads when results are visible

---

## SEO Optimization

### Step 1: Page Metadata (Next.js App Router)

**Location:** `app/competitor-analyzer/page.tsx`

Add metadata export:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
  description:
    'Analyze any webpage for SEO metrics. Compare competitor pages, check title tags, meta descriptions, headings, links, and structured data. Free online SEO tool.',
  keywords: [
    'seo analyzer',
    'competitor analysis',
    'seo audit',
    'page analyzer',
    'meta tags checker',
    'seo tool',
    'free seo analysis',
  ],
  authors: [{ name: 'SEO Analyzer Pro' }],
  creator: 'SEO Analyzer Pro',
  publisher: 'SEO Analyzer Pro',
  openGraph: {
    title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
    description:
      'Analyze any webpage for SEO metrics. Compare competitor pages and get actionable insights.',
    url: 'https://yourdomain.com/competitor-analyzer',
    siteName: 'SEO Analyzer Pro',
    images: [
      {
        url: 'https://yourdomain.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Competitor Page Analyzer Screenshot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Competitor Page Analyzer - Free SEO Analysis Tool',
    description:
      'Analyze any webpage for SEO metrics. Compare competitor pages and get actionable insights.',
    images: ['https://yourdomain.com/twitter-image.png'],
    creator: '@yourtwitterhandle',
  },
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
  alternates: {
    canonical: 'https://yourdomain.com/competitor-analyzer',
  },
};
```

**Benefits:**
- **Title tag:** Shows in search results and browser tab
- **Meta description:** Entices clicks from search results
- **Open Graph:** Better sharing on Facebook, LinkedIn
- **Twitter Card:** Rich preview on Twitter
- **Robots directives:** Control crawling and indexing
- **Canonical URL:** Prevents duplicate content issues

### Step 2: Root Layout Metadata

**Location:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: 'SEO Analyzer Pro - Free SEO Tools',
    template: '%s | SEO Analyzer Pro',
  },
  description: 'Free SEO analysis tools for webmasters and marketers.',
  verification: {
    google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};
```

**Template pattern:**
- Default: "SEO Analyzer Pro - Free SEO Tools"
- Page: "Competitor Page Analyzer | SEO Analyzer Pro"

### Step 3: JSON-LD Structured Data

**Location:** `components/StructuredData.tsx`

```typescript
export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Competitor Page Analyzer',
    description:
      'Free SEO analysis tool to analyze and compare webpage on-page metrics including title tags, meta descriptions, headings, links, and structured data.',
    url: 'https://yourdomain.com/competitor-analyzer',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'SEO Analyzer Pro',
      url: 'https://yourdomain.com',
    },
    featureList: [
      'SEO title and meta description analysis',
      'Heading structure analysis',
      'Content quality metrics',
      'Link analysis (internal vs external)',
      'Image optimization check',
      'Structured data detection',
      'Side-by-side competitor comparison',
      'Actionable SEO recommendations',
    ],
    screenshot: 'https://yourdomain.com/screenshot.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Add to page:**

```typescript
// app/competitor-analyzer/page.tsx
import { StructuredData } from '@/components/StructuredData';

export default function CompetitorAnalyzerPage() {
  return (
    <>
      <StructuredData />
      {/* ... rest of page ... */}
    </>
  );
}
```

**Benefits:**
- **Rich results:** Potential for enhanced search listings
- **Google Knowledge Graph:** Better understanding of your tool
- **Voice search:** Helps voice assistants understand your app

### Step 4: Additional SEO Elements

**Favicon:**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  },
};
```

**robots.txt:**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

**Sitemap:**

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://yourdomain.com/competitor-analyzer',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
```

---

## Performance & Core Web Vitals

### Cumulative Layout Shift (CLS) Prevention

**Problem:** Ads loading can push content down, causing layout shift.

**Solution:** Reserved space with min-height

```tsx
// AdSlot component already has reserved heights
const AD_DIMENSIONS = {
  top: { width: 'w-full', height: 'min-h-[90px] md:min-h-[90px]' },
  // ...
};
```

**How it works:**
1. Ad container has `min-h-[90px]` (90px minimum height)
2. Space is reserved BEFORE ad loads
3. When ad loads, it fills the reserved space
4. No layout shift occurs

**Verification:**
```bash
# Run Lighthouse audit
npm run build
npm start
# Open Chrome DevTools → Lighthouse → Run audit
# Check CLS score (should be < 0.1)
```

### Largest Contentful Paint (LCP)

**Strategy:** Non-blocking ads

- AdSense script loads with `strategy="afterInteractive"`
- Main content (form, results) loads first
- Ads load after page is interactive

**Result:** Fast LCP (< 2.5s)

### First Input Delay (FID) / Interaction to Next Paint (INP)

**Strategy:** Lazy initialization

```typescript
// AdSlot only initializes when mounted
useEffect(() => {
  if (hasInitialized.current) return;
  ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
}, []);
```

**Result:** Form remains responsive even during ad loading

### Time to Interactive (TTI)

**Strategy:** Defer AdSense script

```tsx
<Script
  src="..."
  strategy="afterInteractive" // Loads after main content is interactive
/>
```

**Result:** User can interact with form immediately

### Performance Monitoring

**Add to layout:**

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

**What it tracks:**
- Core Web Vitals (LCP, FID/INP, CLS)
- Real user metrics
- Performance over time

---

## Testing AdSense

### Local Testing

**Issue:** AdSense doesn't load in development mode

**Solution:** Use placeholder ads in development

```typescript
// components/AdSlot.tsx
export function AdSlot({ position, adSlot }: AdSlotProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production');
  }, []);

  const dimensions = AD_DIMENSIONS[position];

  if (!isProduction) {
    // Show placeholder in development
    return (
      <div
        className={`${dimensions.width} ${dimensions.height} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg`}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm font-semibold">AdSense Placeholder</div>
          <div className="text-xs mt-1">Position: {position}</div>
          <div className="text-xs">Slot: {adSlot}</div>
        </div>
      </div>
    );
  }

  // Real AdSense in production
  return (
    <div className={`ad-slot-container ${dimensions.width} ${dimensions.height}...`}>
      <ins className="adsbygoogle" {...} />
    </div>
  );
}
```

### Production Testing

1. **Deploy to production/staging**
2. **Verify script loads:**
   - Open DevTools → Network
   - Look for `adsbygoogle.js`
   - Should load with 200 status
3. **Check ad requests:**
   - Network tab → Filter: `googlesyndication`
   - Should see ad requests
4. **Verify no errors:**
   - Console → No AdSense errors
   - Check for "adsbygoogle.push() error"
5. **Test CLS:**
   - Lighthouse → Check CLS < 0.1
   - No layout shifts when ads load

### AdSense Approval Requirements

Before ads show, ensure:
- [ ] Sufficient unique content (500+ words recommended)
- [ ] Privacy policy page
- [ ] About page
- [ ] Contact information
- [ ] Navigation menu
- [ ] No prohibited content
- [ ] HTTPS enabled
- [ ] Custom domain (not localhost)

---

## Common Issues

### 1. "adsbygoogle.push() error: All ins elements in the DOM with class=adsbygoogle already have ads in them."

**Cause:** Calling `push()` multiple times on same element

**Solution:** Use `hasInitialized` ref:

```typescript
const hasInitialized = useRef(false);

useEffect(() => {
  if (hasInitialized.current) return; // Prevent double init
  // ...
  hasInitialized.current = true;
}, []);
```

### 2. Ads not showing

**Possible causes:**
- Still in development mode
- AdSense account not approved
- Invalid publisher ID
- Ad blockers enabled
- Insufficient content

**Debug steps:**
1. Check console for errors
2. Verify publisher ID is correct
3. Check AdSense account status
4. Disable ad blockers
5. Verify script loads (Network tab)

### 3. Layout shift when ads load

**Cause:** No reserved space

**Solution:** Use min-height:

```tsx
<div className="min-h-[90px]">
  <ins className="adsbygoogle" />
</div>
```

### 4. Hydration errors

**Cause:** Server/client mismatch

**Solution:** Use client component with useEffect:

```typescript
'use client'; // Mark as client component

export function AdSlot() {
  useEffect(() => {
    // Client-side only code
  }, []);
}
```

---

## Checklist

Before going live:

- [ ] Replace `ca-pub-XXXXXXXXXXXX` with real publisher ID
- [ ] Replace ad slot IDs with real slot IDs
- [ ] Add privacy policy page (required by AdSense)
- [ ] Verify HTTPS is enabled
- [ ] Test on mobile and desktop
- [ ] Run Lighthouse audit (CLS < 0.1)
- [ ] Verify meta tags with [Open Graph Preview](https://www.opengraph.xyz/)
- [ ] Submit sitemap to Google Search Console
- [ ] Verify structured data with [Schema Markup Validator](https://validator.schema.org/)

---

## Summary

✅ **AdSense Integration:**
- Script loads once in root layout
- Ad slots have reserved space (CLS prevention)
- Safe initialization prevents double-push errors
- Only loads in production

✅ **SEO Optimization:**
- Metadata with title, description, Open Graph
- JSON-LD structured data for rich results
- Canonical URLs and robots directives
- Sitemap for search engines

✅ **Performance:**
- CLS < 0.1 with reserved ad space
- Non-blocking ad loading
- Fast LCP and TTI
- Real user monitoring with Vercel Analytics

🎉 **Result:** A monetized, SEO-optimized, performant SEO analysis tool!

/**
 * Unit Tests: HTML Parser
 *
 * Tests the HTML parsing logic for extracting SEO data.
 * Uses Cheerio to parse sample HTML snippets.
 */

import * as cheerio from 'cheerio';

// ============================================================================
// HELPER FUNCTIONS (extracted from main API route for testing)
// ============================================================================

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
  };
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    isComplete: boolean;
  };
}

function extractSEOMetrics($: cheerio.CheerioAPI): SEOMetrics {
  const title = $('title').first().text() || null;
  const titleLength = title?.length || 0;

  const metaDescription =
    $('meta[name="description"]').attr('content') || null;
  const metaDescLength = metaDescription?.length || 0;

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');

  return {
    title: {
      content: title,
      length: titleLength,
      quality: {
        exists: !!title,
        withinIdealLength: titleLength >= 50 && titleLength <= 60,
        tooShort: titleLength < 50 && titleLength > 0,
        tooLong: titleLength > 60,
      },
    },
    metaDescription: {
      content: metaDescription,
      length: metaDescLength,
      quality: {
        exists: !!metaDescription,
        withinIdealLength: metaDescLength >= 150 && metaDescLength <= 160,
        tooShort: metaDescLength < 150 && metaDescLength > 0,
        tooLong: metaDescLength > 160,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      isComplete: !!(ogTitle && ogDescription && ogImage),
    },
  };
}

interface HeadingAnalysis {
  h1: string[];
  h2: string[];
  quality: {
    hasH1: boolean;
    h1Count: number;
    multipleH1Warning: boolean;
    missingH1Warning: boolean;
  };
}

function extractHeadings($: cheerio.CheerioAPI): HeadingAnalysis {
  const h1 = $('h1')
    .map((_, el) => $(el).text().trim())
    .get();
  const h2 = $('h2')
    .map((_, el) => $(el).text().trim())
    .get();

  return {
    h1,
    h2,
    quality: {
      hasH1: h1.length > 0,
      h1Count: h1.length,
      multipleH1Warning: h1.length > 1,
      missingH1Warning: h1.length === 0,
    },
  };
}

interface LinkAnalysis {
  total: number;
  internal: number;
  external: number;
  internalLinks: Array<{ href: string; text: string }>;
  externalLinks: Array<{ href: string; text: string }>;
}

function extractLinks($: cheerio.CheerioAPI, pageUrl: string): LinkAnalysis {
  const links = $('a[href]');
  const internalLinks: Array<{ href: string; text: string }> = [];
  const externalLinks: Array<{ href: string; text: string }> = [];

  const pageHost = new URL(pageUrl).host;

  links.each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();

    if (!href) return;

    try {
      // Handle relative URLs
      const absoluteUrl = new URL(href, pageUrl);

      if (absoluteUrl.host === pageHost) {
        internalLinks.push({ href: absoluteUrl.href, text });
      } else {
        externalLinks.push({ href: absoluteUrl.href, text });
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return {
    total: internalLinks.length + externalLinks.length,
    internal: internalLinks.length,
    external: externalLinks.length,
    internalLinks,
    externalLinks,
  };
}

interface StructuredDataAnalysis {
  hasStructuredData: boolean;
  total: number;
  schemaTypes: string[];
}

function extractStructuredData($: cheerio.CheerioAPI): StructuredDataAnalysis {
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const schemas: any[] = [];

  jsonLdScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        schemas.push(parsed);
      }
    } catch {
      // Invalid JSON, skip
    }
  });

  const schemaTypes = schemas.map((s) => s['@type'] || 'Unknown').flat();

  return {
    hasStructuredData: schemas.length > 0,
    total: schemas.length,
    schemaTypes,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('HTML Parser', () => {
  describe('SEO Metrics Extraction', () => {
    it('should extract title correctly', () => {
      const html = '<html><head><title>Example Page Title</title></head></html>';
      const $ = cheerio.load(html);
      const metrics = extractSEOMetrics($);

      expect(metrics.title.content).toBe('Example Page Title');
      expect(metrics.title.length).toBe(18);
      expect(metrics.title.quality.exists).toBe(true);
    });

    it('should detect missing title', () => {
      const html = '<html><head></head></html>';
      const $ = cheerio.load(html);
      const metrics = extractSEOMetrics($);

      expect(metrics.title.content).toBeNull();
      expect(metrics.title.quality.exists).toBe(false);
    });

    it('should detect title length quality', () => {
      // Too short title (< 50 chars)
      let html = '<html><head><title>Short</title></head></html>';
      let $ = cheerio.load(html);
      let metrics = extractSEOMetrics($);
      expect(metrics.title.quality.tooShort).toBe(true);
      expect(metrics.title.quality.withinIdealLength).toBe(false);

      // Ideal title (50-60 chars)
      html =
        '<html><head><title>This is an ideal title with exactly 55 characters!</title></head></html>';
      $ = cheerio.load(html);
      metrics = extractSEOMetrics($);
      expect(metrics.title.quality.withinIdealLength).toBe(true);

      // Too long title (> 60 chars)
      html =
        '<html><head><title>This is a very long title that exceeds the recommended 60 character limit for SEO</title></head></html>';
      $ = cheerio.load(html);
      metrics = extractSEOMetrics($);
      expect(metrics.title.quality.tooLong).toBe(true);
    });

    it('should extract meta description correctly', () => {
      const html =
        '<html><head><meta name="description" content="This is a meta description"></head></html>';
      const $ = cheerio.load(html);
      const metrics = extractSEOMetrics($);

      expect(metrics.metaDescription.content).toBe('This is a meta description');
      expect(metrics.metaDescription.quality.exists).toBe(true);
    });

    it('should extract Open Graph tags', () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
            <meta property="og:image" content="https://example.com/image.jpg">
          </head>
        </html>
      `;
      const $ = cheerio.load(html);
      const metrics = extractSEOMetrics($);

      expect(metrics.openGraph.title).toBe('OG Title');
      expect(metrics.openGraph.description).toBe('OG Description');
      expect(metrics.openGraph.image).toBe('https://example.com/image.jpg');
      expect(metrics.openGraph.isComplete).toBe(true);
    });

    it('should detect incomplete Open Graph tags', () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="OG Title">
          </head>
        </html>
      `;
      const $ = cheerio.load(html);
      const metrics = extractSEOMetrics($);

      expect(metrics.openGraph.isComplete).toBe(false);
    });
  });

  describe('Heading Extraction', () => {
    it('should extract H1 and H2 headings', () => {
      const html = `
        <html>
          <body>
            <h1>Main Heading</h1>
            <h2>Subheading 1</h2>
            <h2>Subheading 2</h2>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const headings = extractHeadings($);

      expect(headings.h1).toEqual(['Main Heading']);
      expect(headings.h2).toEqual(['Subheading 1', 'Subheading 2']);
      expect(headings.quality.h1Count).toBe(1);
    });

    it('should detect missing H1', () => {
      const html = '<html><body><h2>Only H2</h2></body></html>';
      const $ = cheerio.load(html);
      const headings = extractHeadings($);

      expect(headings.quality.hasH1).toBe(false);
      expect(headings.quality.missingH1Warning).toBe(true);
    });

    it('should detect multiple H1s', () => {
      const html = `
        <html>
          <body>
            <h1>First H1</h1>
            <h1>Second H1</h1>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const headings = extractHeadings($);

      expect(headings.quality.h1Count).toBe(2);
      expect(headings.quality.multipleH1Warning).toBe(true);
    });

    it('should trim whitespace from headings', () => {
      const html = '<html><body><h1>  Heading with spaces  </h1></body></html>';
      const $ = cheerio.load(html);
      const headings = extractHeadings($);

      expect(headings.h1[0]).toBe('Heading with spaces');
    });
  });

  describe('Link Extraction', () => {
    const pageUrl = 'https://example.com/page';

    it('should distinguish internal and external links', () => {
      const html = `
        <html>
          <body>
            <a href="/internal">Internal Link</a>
            <a href="https://example.com/another">Internal Absolute</a>
            <a href="https://external.com">External Link</a>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const links = extractLinks($, pageUrl);

      expect(links.internal).toBe(2);
      expect(links.external).toBe(1);
      expect(links.total).toBe(3);
    });

    it('should extract link text', () => {
      const html = '<html><body><a href="/page">Link Text</a></body></html>';
      const $ = cheerio.load(html);
      const links = extractLinks($, pageUrl);

      expect(links.internalLinks[0].text).toBe('Link Text');
    });

    it('should handle relative URLs correctly', () => {
      const html = `
        <html>
          <body>
            <a href="/path">Root relative</a>
            <a href="../other">Parent relative</a>
            <a href="sibling">Sibling</a>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const links = extractLinks($, pageUrl);

      // All should be internal
      expect(links.internal).toBeGreaterThan(0);
      expect(links.external).toBe(0);
    });

    it('should skip invalid URLs', () => {
      const html = `
        <html>
          <body>
            <a href="javascript:void(0)">Invalid</a>
            <a href="#">Hash</a>
            <a href="mailto:test@example.com">Email</a>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      const links = extractLinks($, pageUrl);

      // These should be skipped or handled gracefully
      expect(links.total).toBe(0);
    });
  });

  describe('Structured Data Extraction', () => {
    it('should detect JSON-LD structured data', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "Example Article"
            }
            </script>
          </head>
        </html>
      `;
      const $ = cheerio.load(html);
      const structured = extractStructuredData($);

      expect(structured.hasStructuredData).toBe(true);
      expect(structured.total).toBe(1);
      expect(structured.schemaTypes).toContain('Article');
    });

    it('should handle multiple schemas', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article"
            }
            </script>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Organization"
            }
            </script>
          </head>
        </html>
      `;
      const $ = cheerio.load(html);
      const structured = extractStructuredData($);

      expect(structured.total).toBe(2);
      expect(structured.schemaTypes).toContain('Article');
      expect(structured.schemaTypes).toContain('Organization');
    });

    it('should handle invalid JSON gracefully', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
            { invalid json }
            </script>
          </head>
        </html>
      `;
      const $ = cheerio.load(html);
      const structured = extractStructuredData($);

      expect(structured.hasStructuredData).toBe(false);
      expect(structured.total).toBe(0);
    });

    it('should detect no structured data', () => {
      const html = '<html><head></head></html>';
      const $ = cheerio.load(html);
      const structured = extractStructuredData($);

      expect(structured.hasStructuredData).toBe(false);
      expect(structured.total).toBe(0);
      expect(structured.schemaTypes).toEqual([]);
    });
  });
});

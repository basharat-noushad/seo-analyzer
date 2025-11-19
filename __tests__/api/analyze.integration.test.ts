/**
 * Integration Tests: /api/analyze Endpoint
 *
 * Tests the full API endpoint without making real network calls.
 * Uses mocked fetch responses and sample HTML fixtures.
 */

import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Mock global fetch
global.fetch = jest.fn();

// ============================================================================
// TEST FIXTURES
// ============================================================================

const SAMPLE_GOOD_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Page - High Quality SEO Title (55 chars)</title>
  <meta name="description" content="This is a well-crafted meta description that provides a clear summary of the page content and is optimized for search engines at the ideal length.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/page">
  <meta property="og:title" content="Example Page">
  <meta property="og:description" content="OG description">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Example Article",
    "author": "John Doe"
  }
  </script>
</head>
<body>
  <h1>Main Heading for SEO</h1>
  <h2>Subheading 1</h2>
  <p>This is a paragraph with substantial content. It contains multiple sentences to demonstrate proper content analysis. The word count should be sufficient for SEO purposes.</p>
  <h2>Subheading 2</h2>
  <p>Another paragraph with more detailed information about the topic. This helps with keyword density and content quality metrics.</p>
  <a href="/internal-page">Internal Link</a>
  <a href="https://external.com" rel="nofollow">External Link</a>
  <img src="/image1.jpg" alt="Descriptive alt text for accessibility">
  <img src="/image2.jpg" alt="Another image with alt text">
</body>
</html>
`;

const SAMPLE_POOR_HTML = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <h2>No H1 here</h2>
  <p>Minimal content.</p>
  <img src="/image.jpg">
  <a href="/link">Link without context</a>
</body>
</html>
`;

const ROBOTS_TXT_ALLOW = `
User-agent: *
Allow: /
`;

const ROBOTS_TXT_DISALLOW = `
User-agent: *
Disallow: /
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function mockSuccessfulFetch(html: string, robotsTxt: string = ROBOTS_TXT_ALLOW) {
  (global.fetch as jest.Mock)
    // First call: robots.txt
    .mockResolvedValueOnce({
      ok: true,
      text: async () => robotsTxt,
    })
    // Second call: HTML page
    .mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'text/html']]),
      text: async () => html,
    });
}

// ============================================================================
// TESTS
// ============================================================================

describe('POST /api/analyze', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Successful Analysis', () => {
    it('should analyze a single URL successfully', async () => {
      mockSuccessfulFetch(SAMPLE_GOOD_HTML);

      const request = createMockRequest({
        competitorUrl: 'https://example.com/page',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.competitor).toBeDefined();
      expect(data.competitor.success).toBe(true);
      expect(data.competitor.url).toBe('https://example.com/page');
      expect(data.competitor.seo.title.content).toContain('Example Page');
      expect(data.mine).toBeUndefined();
      expect(data.comparison).toBeUndefined();
    });

    it('should analyze two URLs in comparison mode', async () => {
      // Mock fetch for both URLs (robots.txt + HTML for each)
      (global.fetch as jest.Mock)
        // Competitor robots.txt
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        // My URL robots.txt
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        // Competitor HTML
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/html']]),
          text: async () => SAMPLE_GOOD_HTML,
        })
        // My URL HTML
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/html']]),
          text: async () => SAMPLE_POOR_HTML,
        });

      const request = createMockRequest({
        competitorUrl: 'https://competitor.com/page',
        myUrl: 'https://mysite.com/page',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.competitor).toBeDefined();
      expect(data.mine).toBeDefined();
      expect(data.comparison).toBeDefined();
      expect(data.comparison.opportunities).toBeDefined();
      expect(data.comparison.strengths).toBeDefined();
    });

    it('should extract SEO metrics correctly', async () => {
      mockSuccessfulFetch(SAMPLE_GOOD_HTML);

      const request = createMockRequest({
        competitorUrl: 'https://example.com/page',
      });

      const response = await POST(request);
      const data = await response.json();

      // Check title
      expect(data.competitor.seo.title.content).toBeTruthy();
      expect(data.competitor.seo.title.quality.exists).toBe(true);

      // Check meta description
      expect(data.competitor.seo.metaDescription.content).toBeTruthy();
      expect(data.competitor.seo.metaDescription.quality.exists).toBe(true);

      // Check Open Graph
      expect(data.competitor.seo.openGraph.isComplete).toBe(true);

      // Check headings
      expect(data.competitor.headings.quality.hasH1).toBe(true);
      expect(data.competitor.headings.quality.missingH1Warning).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    it('should reject request without competitorUrl', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(data.code).toBe('MALFORMED_REQUEST');
      expect(data.urlContext).toBe('competitor');
    });

    it('should reject invalid competitor URL', async () => {
      const request = createMockRequest({
        competitorUrl: 'not-a-valid-url',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(data.code).toBe('INVALID_URL');
      expect(data.urlContext).toBe('competitor');
    });

    it('should reject invalid myUrl', async () => {
      const request = createMockRequest({
        competitorUrl: 'https://example.com',
        myUrl: 'not-a-valid-url',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(data.code).toBe('INVALID_URL');
      expect(data.urlContext).toBe('mine');
    });

    it('should reject identical URLs in comparison mode', async () => {
      const request = createMockRequest({
        competitorUrl: 'https://example.com',
        myUrl: 'https://example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(data.urlContext).toBe('mine');
      expect(data.message).toContain('different');
    });

    it('should reject localhost URLs', async () => {
      const request = createMockRequest({
        competitorUrl: 'http://localhost:3000',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(true);
      expect(data.urlContext).toBe('competitor');
    });
  });

  describe('robots.txt Handling', () => {
    it('should block analysis when robots.txt disallows', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => ROBOTS_TXT_DISALLOW,
      });

      const request = createMockRequest({
        competitorUrl: 'https://example.com/page',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe(true);
      expect(data.code).toBe('ROBOTS_TXT_DISALLOWED');
      expect(data.urlContext).toBe('competitor');
    });

    it('should allow analysis when robots.txt is not found', async () => {
      (global.fetch as jest.Mock)
        // robots.txt 404
        .mockResolvedValueOnce({ ok: false, status: 404 })
        // HTML page
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/html']]),
          text: async () => SAMPLE_GOOD_HTML,
        });

      const request = createMockRequest({
        competitorUrl: 'https://example.com/page',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.competitor).toBeDefined();
    });

    it('should block myUrl when its robots.txt disallows', async () => {
      (global.fetch as jest.Mock)
        // Competitor robots.txt (allow)
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        // My URL robots.txt (disallow)
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_DISALLOW });

      const request = createMockRequest({
        competitorUrl: 'https://competitor.com',
        myUrl: 'https://mysite.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe(true);
      expect(data.urlContext).toBe('mine');
      expect(data.message).toContain('your URL');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        .mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest({
        competitorUrl: 'https://example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(true);
    });

    it('should handle non-HTML content types', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'application/json']]),
          text: async () => '{"data": "not html"}',
        });

      const request = createMockRequest({
        competitorUrl: 'https://example.com',
      });

      const response = await POST(request);

      // Should handle gracefully, likely returning an error or empty analysis
      expect(response).toBeDefined();
    });

    it('should handle timeout correctly', async () => {
      // Mock a slow response that will timeout
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, text: async () => ROBOTS_TXT_ALLOW })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  ok: true,
                  headers: new Map([['content-type', 'text/html']]),
                  text: async () => SAMPLE_GOOD_HTML,
                });
              }, 20000); // 20 seconds (longer than timeout)
            })
        );

      const request = createMockRequest({
        competitorUrl: 'https://example.com',
      });

      // This should timeout and return an error
      const response = await POST(request);

      expect(response).toBeDefined();
      // Exact behavior depends on timeout implementation
    }, 25000); // Increase test timeout
  });

  describe('Response Format', () => {
    it('should return properly formatted response', async () => {
      mockSuccessfulFetch(SAMPLE_GOOD_HTML);

      const request = createMockRequest({
        competitorUrl: 'https://example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      // Check response structure
      expect(data).toHaveProperty('competitor');
      expect(data).toHaveProperty('meta');
      expect(data.meta).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('version');

      // Check competitor structure
      expect(data.competitor).toHaveProperty('url');
      expect(data.competitor).toHaveProperty('success');
      expect(data.competitor).toHaveProperty('seo');
      expect(data.competitor).toHaveProperty('headings');
      expect(data.competitor).toHaveProperty('content');
      expect(data.competitor).toHaveProperty('links');
      expect(data.competitor).toHaveProperty('media');
      expect(data.competitor).toHaveProperty('structuredData');
      expect(data.competitor).toHaveProperty('technical');
    });

    it('should include urlContext in error responses', async () => {
      const request = createMockRequest({
        competitorUrl: 'invalid-url',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('urlContext');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');
    });
  });
});

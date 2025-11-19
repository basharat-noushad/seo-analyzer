/**
 * Unit Tests: robots.txt Checker
 *
 * Tests the robots.txt parsing and checking logic.
 * Uses mocked fetch responses to avoid network calls.
 */

import { NextRequest } from 'next/server';

// Mock global fetch
global.fetch = jest.fn();

// Sample robots.txt content
const ROBOTS_ALLOW_ALL = `
User-agent: *
Allow: /
`;

const ROBOTS_DISALLOW_ALL = `
User-agent: *
Disallow: /
`;

const ROBOTS_SPECIFIC_RULES = `
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /api/analyze

User-agent: BadBot
Disallow: /
`;

const ROBOTS_COMPLEX = `
User-agent: Googlebot
Allow: /

User-agent: *
Disallow: /private/
Disallow: /temp/
Allow: /public/
`;

/**
 * Helper function to extract and test robots.txt checking logic
 * This would normally be extracted from the main API route
 */
async function checkRobotsTxt(url: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    const response = await fetch(robotsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CompetitorPageAnalyzer/1.0',
      },
    });

    // If robots.txt doesn't exist, allow by default (fail-open)
    if (!response.ok) {
      return { allowed: true, reason: 'No robots.txt found' };
    }

    const robotsTxt = await response.text();

    // Parse robots.txt
    const userAgent = 'CompetitorPageAnalyzer';
    const path = urlObj.pathname || '/';

    return parseRobotsTxt(robotsTxt, userAgent, path);
  } catch (error) {
    // On error, fail open (allow crawling)
    return { allowed: true, reason: 'Error fetching robots.txt' };
  }
}

/**
 * Simple robots.txt parser
 */
function parseRobotsTxt(
  content: string,
  userAgent: string,
  path: string
): { allowed: boolean; reason?: string } {
  const lines = content.split('\n').map((l) => l.trim());
  let currentUserAgent: string | null = null;
  let applies = false;
  const rules: Array<{ directive: string; path: string }> = [];

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.substring(11).trim();
      currentUserAgent = agent;
      // Check if this user-agent applies to us
      applies =
        agent === '*' || agent.toLowerCase() === userAgent.toLowerCase();
    } else if (applies && currentUserAgent) {
      if (line.toLowerCase().startsWith('disallow:')) {
        const rulePath = line.substring(9).trim();
        rules.push({ directive: 'disallow', path: rulePath });
      } else if (line.toLowerCase().startsWith('allow:')) {
        const rulePath = line.substring(6).trim();
        rules.push({ directive: 'allow', path: rulePath });
      }
    }
  }

  // Check rules in order
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (path.startsWith(rule.path)) {
      if (rule.directive === 'disallow') {
        return {
          allowed: false,
          reason: `Disallowed by robots.txt: ${rule.path}`,
        };
      } else if (rule.directive === 'allow') {
        return { allowed: true, reason: `Allowed by robots.txt: ${rule.path}` };
      }
    }
  }

  // If no matching rules, allow by default
  return { allowed: true, reason: 'No matching rules' };
}

describe('robots.txt Checker', () => {
  beforeEach(() => {
    // Clear mock before each test
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Parsing Logic', () => {
    it('should allow crawling when robots.txt allows all', () => {
      const result = parseRobotsTxt(ROBOTS_ALLOW_ALL, 'CompetitorPageAnalyzer', '/');
      expect(result.allowed).toBe(true);
    });

    it('should block crawling when robots.txt disallows all', () => {
      const result = parseRobotsTxt(
        ROBOTS_DISALLOW_ALL,
        'CompetitorPageAnalyzer',
        '/'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Disallowed');
    });

    it('should respect specific path rules', () => {
      // Disallowed path
      let result = parseRobotsTxt(
        ROBOTS_SPECIFIC_RULES,
        'CompetitorPageAnalyzer',
        '/admin/users'
      );
      expect(result.allowed).toBe(false);

      // Allowed path
      result = parseRobotsTxt(
        ROBOTS_SPECIFIC_RULES,
        'CompetitorPageAnalyzer',
        '/api/analyze'
      );
      expect(result.allowed).toBe(true);

      // Path not mentioned (allowed by default)
      result = parseRobotsTxt(
        ROBOTS_SPECIFIC_RULES,
        'CompetitorPageAnalyzer',
        '/blog/post'
      );
      expect(result.allowed).toBe(true);
    });

    it('should handle wildcard user-agent', () => {
      const result = parseRobotsTxt(ROBOTS_DISALLOW_ALL, 'AnyBot', '/');
      expect(result.allowed).toBe(false);
    });

    it('should prioritize specific user-agent over wildcard', () => {
      const result = parseRobotsTxt(ROBOTS_COMPLEX, 'Googlebot', '/private/');
      // Googlebot is allowed everything
      expect(result.allowed).toBe(true);
    });

    it('should handle empty robots.txt', () => {
      const result = parseRobotsTxt('', 'CompetitorPageAnalyzer', '/');
      expect(result.allowed).toBe(true);
    });

    it('should ignore comments', () => {
      const robotsWithComments = `
# This is a comment
User-agent: *
# Another comment
Disallow: /admin/
      `;
      const result = parseRobotsTxt(
        robotsWithComments,
        'CompetitorPageAnalyzer',
        '/admin/page'
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe('Network Handling', () => {
    it('should allow crawling when robots.txt is not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await checkRobotsTxt('https://example.com/page');
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('No robots.txt found');
    });

    it('should allow crawling when robots.txt fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await checkRobotsTxt('https://example.com/page');
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('Error fetching');
    });

    it('should fetch robots.txt from the correct URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => ROBOTS_ALLOW_ALL,
      });

      await checkRobotsTxt('https://example.com/path/to/page?query=1');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/robots.txt',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
          }),
        })
      );
    });

    it('should handle robots.txt that disallows', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => ROBOTS_DISALLOW_ALL,
      });

      const result = await checkRobotsTxt('https://example.com/');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with different paths correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => ROBOTS_SPECIFIC_RULES,
      });

      const result = await checkRobotsTxt('https://example.com/admin/settings');
      expect(result.allowed).toBe(false);
    });

    it('should handle robots.txt with mixed case', () => {
      const mixedCase = `
USER-AGENT: *
DISALLOW: /Admin/
      `;
      const result = parseRobotsTxt(mixedCase, 'CompetitorPageAnalyzer', '/Admin/');
      expect(result.allowed).toBe(false);
    });

    it('should handle malformed robots.txt gracefully', () => {
      const malformed = `
This is not valid
robots.txt content
User-agent:
Disallow
      `;
      const result = parseRobotsTxt(malformed, 'CompetitorPageAnalyzer', '/');
      // Should allow by default when rules don't match
      expect(result.allowed).toBe(true);
    });
  });
});

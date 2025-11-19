/**
 * Unit Tests: URL Validator
 *
 * Tests the URL validation logic to ensure:
 * - Valid URLs pass
 * - Invalid URLs are rejected
 * - Localhost and private IPs are blocked
 * - SERP URLs are blocked
 * - URL sanitization works correctly
 */

import { validateUrl, validateDifferentUrls, sanitizeUrl } from '@/lib/url-validator';

describe('URL Validator', () => {
  describe('validateUrl', () => {
    describe('Valid URLs', () => {
      it('should accept valid HTTP URLs', () => {
        const result = validateUrl('http://example.com');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept valid HTTPS URLs', () => {
        const result = validateUrl('https://example.com');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept URLs with paths', () => {
        const result = validateUrl('https://example.com/path/to/page');
        expect(result.valid).toBe(true);
      });

      it('should accept URLs with query parameters', () => {
        const result = validateUrl('https://example.com/page?id=123&sort=date');
        expect(result.valid).toBe(true);
      });

      it('should accept URLs with subdomains', () => {
        const result = validateUrl('https://blog.example.com');
        expect(result.valid).toBe(true);
      });

      it('should accept international domain names', () => {
        const result = validateUrl('https://例え.jp');
        expect(result.valid).toBe(true);
      });
    });

    describe('Invalid URLs', () => {
      it('should reject empty URLs', () => {
        const result = validateUrl('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('URL is required');
        expect(result.code).toBe('INVALID_URL');
      });

      it('should reject URLs that are too long', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(2100);
        const result = validateUrl(longUrl);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too long');
      });

      it('should reject malformed URLs', () => {
        const result = validateUrl('not a url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid URL format');
      });

      it('should reject URLs with invalid protocols', () => {
        const testCases = [
          'ftp://example.com',
          'file:///etc/passwd',
          'javascript:alert(1)',
          'data:text/html,<script>alert(1)</script>',
        ];

        testCases.forEach((url) => {
          const result = validateUrl(url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Only HTTP and HTTPS');
        });
      });
    });

    describe('Localhost and Private IPs', () => {
      it('should reject localhost URLs', () => {
        const testCases = [
          'http://localhost',
          'http://localhost:3000',
          'http://127.0.0.1',
          'http://127.0.0.1:8080',
          'http://[::1]',
          'http://[::1]:3000',
        ];

        testCases.forEach((url) => {
          const result = validateUrl(url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Localhost');
          expect(result.code).toBe('LOCALHOST_NOT_ALLOWED');
        });
      });

      it('should reject private IP addresses', () => {
        const testCases = [
          'http://192.168.1.1',
          'http://10.0.0.1',
          'http://172.16.0.1',
          'http://169.254.1.1',
        ];

        testCases.forEach((url) => {
          const result = validateUrl(url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('private IP');
          expect(result.code).toBe('PRIVATE_IP_NOT_ALLOWED');
        });
      });
    });

    describe('SERP URLs', () => {
      it('should reject Google SERP URLs', () => {
        const testCases = [
          'https://www.google.com/search?q=test',
          'https://google.com/search?q=seo',
          'https://www.google.co.uk/search?q=query',
        ];

        testCases.forEach((url) => {
          const result = validateUrl(url);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('SERP');
          expect(result.code).toBe('SERP_NOT_ALLOWED');
        });
      });

      it('should reject Bing SERP URLs', () => {
        const result = validateUrl('https://www.bing.com/search?q=test');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('SERP');
      });

      it('should reject DuckDuckGo SERP URLs', () => {
        const result = validateUrl('https://duckduckgo.com/?q=test');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('SERP');
      });

      it('should allow non-SERP pages on search engines', () => {
        const testCases = [
          'https://www.google.com/about',
          'https://blog.google',
        ];

        testCases.forEach((url) => {
          const result = validateUrl(url);
          expect(result.valid).toBe(true);
        });
      });
    });
  });

  describe('validateDifferentUrls', () => {
    it('should accept different URLs', () => {
      const result = validateDifferentUrls(
        'https://example.com',
        'https://competitor.com'
      );
      expect(result.valid).toBe(true);
    });

    it('should reject identical URLs', () => {
      const result = validateDifferentUrls(
        'https://example.com',
        'https://example.com'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be different');
    });

    it('should reject URLs that are the same after normalization', () => {
      const result = validateDifferentUrls(
        'https://example.com/',
        'https://example.com'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be different');
    });

    it('should treat http and https as different', () => {
      const result = validateDifferentUrls(
        'http://example.com',
        'https://example.com'
      );
      // This should be valid as they are technically different URLs
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeUrl', () => {
    it('should remove trailing slashes', () => {
      expect(sanitizeUrl('https://example.com/')).toBe('https://example.com');
      expect(sanitizeUrl('https://example.com/path/')).toBe('https://example.com/path');
    });

    it('should remove URL fragments', () => {
      expect(sanitizeUrl('https://example.com#section')).toBe('https://example.com');
      expect(sanitizeUrl('https://example.com/page#top')).toBe('https://example.com/page');
    });

    it('should preserve query parameters', () => {
      expect(sanitizeUrl('https://example.com?id=123')).toBe('https://example.com?id=123');
    });

    it('should handle complex URLs', () => {
      const input = 'https://example.com/path/?id=123&sort=date#section';
      const expected = 'https://example.com/path?id=123&sort=date';
      expect(sanitizeUrl(input)).toBe(expected);
    });

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('should lowercase the protocol and domain', () => {
      expect(sanitizeUrl('HTTPS://EXAMPLE.COM/Path')).toBe('https://example.com/Path');
    });
  });
});

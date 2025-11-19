/**
 * URL Validation Utility
 *
 * Shared validation logic for both frontend and backend.
 * Prevents invalid URLs from being processed.
 */

import { ValidationResult, ErrorCode } from '@/types/shared';

const BLOCKED_PROTOCOLS = ['file', 'ftp', 'javascript', 'data', 'blob'];
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
const BLOCKED_IP_RANGES = [
  /^10\./,                           // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^169\.254\./,                     // 169.254.0.0/16 (link-local)
  /^fd[0-9a-f]{2}:/i,               // IPv6 private
];

const SERP_DOMAINS = [
  'google.com',
  'google.co.uk',
  'google.ca',
  'bing.com',
  'yahoo.com',
  'duckduckgo.com',
  'baidu.com',
  'yandex.com',
  'yandex.ru',
];

/**
 * Validates a URL for analysis
 * Can be used on both client and server
 */
export function validateUrl(url: string): ValidationResult {
  // Check if URL is empty
  if (!url || url.trim() === '') {
    return {
      valid: false,
      error: 'URL is required',
      code: ErrorCode.MALFORMED_REQUEST,
    };
  }

  // Trim whitespace
  url = url.trim();

  // Check URL length
  if (url.length > 2048) {
    return {
      valid: false,
      error: 'URL is too long (maximum 2048 characters)',
      code: ErrorCode.URL_TOO_LONG,
    };
  }

  // Try to parse URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://',
      code: ErrorCode.INVALID_URL,
    };
  }

  // Check protocol
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    if (BLOCKED_PROTOCOLS.includes(parsed.protocol.replace(':', ''))) {
      return {
        valid: false,
        error: `Protocol ${parsed.protocol} is not allowed. Only HTTP and HTTPS are supported.`,
        code: ErrorCode.INVALID_URL,
      };
    }
    return {
      valid: false,
      error: 'Only HTTP and HTTPS protocols are allowed',
      code: ErrorCode.INVALID_URL,
    };
  }

  // Check for localhost
  if (BLOCKED_HOSTS.includes(parsed.hostname.toLowerCase())) {
    return {
      valid: false,
      error: 'Localhost URLs are not allowed. Please enter a public URL.',
      code: ErrorCode.BLOCKED_DOMAIN,
    };
  }

  // Check for private IP ranges
  if (BLOCKED_IP_RANGES.some(regex => regex.test(parsed.hostname))) {
    return {
      valid: false,
      error: 'Private IP addresses are not allowed. Please enter a public URL.',
      code: ErrorCode.BLOCKED_DOMAIN,
    };
  }

  // Check for SERP URLs
  const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (SERP_DOMAINS.some(serp => domain.includes(serp))) {
    if (
      parsed.pathname.includes('/search') ||
      parsed.pathname.includes('/results') ||
      parsed.search.includes('q=')
    ) {
      return {
        valid: false,
        error: 'Search engine result pages cannot be analyzed. Please enter a direct page URL.',
        code: ErrorCode.SERP_SCRAPING_PROHIBITED,
      };
    }
  }

  // Check for suspicious patterns
  if (parsed.hostname.includes('..')) {
    return {
      valid: false,
      error: 'Invalid URL format',
      code: ErrorCode.INVALID_URL,
    };
  }

  // All checks passed
  return { valid: true };
}

/**
 * Validates that two URLs are different
 */
export function validateDifferentUrls(url1: string, url2: string): ValidationResult {
  if (url1.trim().toLowerCase() === url2.trim().toLowerCase()) {
    return {
      valid: false,
      error: 'Both URLs cannot be the same. Please enter different URLs.',
      code: ErrorCode.SAME_URLS,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a URL (trims whitespace, removes control characters)
 */
export function sanitizeUrl(url: string): string {
  return url
    .trim()
    .replace(/[\r\n\t]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Gets a user-friendly error message for a validation error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_URL]: 'Invalid URL format. Please enter a valid URL starting with http:// or https://',
    [ErrorCode.MALFORMED_REQUEST]: 'Invalid request. Please check your input.',
    [ErrorCode.URL_TOO_LONG]: 'URL is too long (maximum 2048 characters)',
    [ErrorCode.SAME_URLS]: 'Both URLs cannot be the same',
    [ErrorCode.ROBOTS_TXT_DISALLOWED]: 'This site\'s robots.txt file blocks analysis',
    [ErrorCode.BLOCKED_DOMAIN]: 'This URL cannot be analyzed (blocked domain or private IP)',
    [ErrorCode.SERP_SCRAPING_PROHIBITED]: 'Search engine result pages cannot be analyzed',
    [ErrorCode.URL_NOT_FOUND]: 'URL not found (404)',
    [ErrorCode.DNS_ERROR]: 'Domain not found. Please check the URL.',
    [ErrorCode.NON_HTML_CONTENT]: 'This URL does not return HTML content',
    [ErrorCode.PAGE_TOO_LARGE]: 'Page size exceeds 10MB limit',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later.',
    [ErrorCode.FETCH_TIMEOUT]: 'Request timeout. The page took too long to respond.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [ErrorCode.PARSE_ERROR]: 'Failed to parse page content',
    [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  return messages[code] || 'An unknown error occurred';
}

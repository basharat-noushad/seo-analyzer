# Testing Strategy - Competitor Page Analyzer

## Overview

This document outlines the testing strategy for the Competitor Page Analyzer, covering unit tests, integration tests, frontend tests, and manual QA.

**Goals:**
- Ensure core SEO analysis logic is accurate
- Prevent regressions in URL validation and robots.txt handling
- Verify API endpoint behavior under various scenarios
- Test user flows and error handling in the UI
- Maintain high code quality with automated tests

---

## 1. Unit Tests (Backend)

### Test Coverage Areas

#### 1.1 URL Validation (`lib/url-validator.ts`)

**What to test:**
- ✅ Valid HTTP/HTTPS URLs pass
- ❌ Invalid protocols (ftp, file, javascript) are rejected
- ❌ Localhost and private IPs are blocked
- ❌ SERP URLs (google.com/search, bing.com/search) are blocked
- ❌ Malformed URLs are rejected
- ✅ URL sanitization removes trailing slashes and fragments
- ✅ Different URLs validation works correctly

**Test file:** `__tests__/lib/url-validator.test.ts`

#### 1.2 robots.txt Parsing (`app/api/analyze/route.ts`)

**What to test:**
- ✅ Allows crawling when robots.txt allows
- ❌ Blocks crawling when Disallow: / present
- ✅ Handles User-agent matching (wildcard * and specific agents)
- ✅ Gracefully handles missing robots.txt (fail-open)
- ✅ Handles network errors gracefully
- ✅ Respects specific path rules

**Test file:** `__tests__/api/robots-txt.test.ts`

#### 1.3 HTML Parsing Logic

**What to test:**

**Title and Meta Tags:**
- ✅ Extracts title correctly
- ✅ Extracts meta description
- ✅ Detects missing title/description
- ✅ Calculates length correctly
- ✅ Identifies too short/too long titles/descriptions
- ✅ Extracts Open Graph tags
- ✅ Extracts Twitter Card tags

**Headings:**
- ✅ Counts H1-H6 headings correctly
- ✅ Detects multiple H1s
- ✅ Detects missing H1
- ✅ Builds heading hierarchy correctly

**Links:**
- ✅ Counts internal vs external links
- ✅ Detects follow vs nofollow links
- ✅ Handles relative URLs correctly
- ✅ Calculates link percentages

**Structured Data:**
- ✅ Detects JSON-LD scripts
- ✅ Parses schema types correctly
- ✅ Handles multiple schemas
- ✅ Handles invalid JSON gracefully

**Test file:** `__tests__/api/html-parser.test.ts`

#### 1.4 Content Analysis

**What to test:**
- ✅ Word count is accurate
- ✅ Keyword extraction works
- ✅ Keyword density calculation is correct
- ✅ Reading time calculation is accurate
- ✅ Text-to-HTML ratio is calculated

**Test file:** `__tests__/api/content-analysis.test.ts`

---

## 2. Integration Tests

### Test Coverage Areas

#### 2.1 API Endpoint (`/api/analyze`)

**What to test:**
- ✅ Successful analysis with valid URL
- ✅ Comparison mode with two valid URLs
- ❌ Rejects invalid URLs
- ❌ Rejects identical URLs in comparison mode
- ❌ Blocks URLs disallowed by robots.txt
- ❌ Rate limiting works (429 after threshold)
- ✅ Returns proper error responses with urlContext
- ✅ Handles network timeouts gracefully
- ✅ Handles non-HTML content types

**Test file:** `__tests__/api/analyze.integration.test.ts`

**Key approach:**
- Mock `fetch()` globally to avoid real network calls
- Use sample HTML fixtures for testing
- Test both success and error paths

---

## 3. Frontend Tests

### Test Coverage Areas

#### 3.1 Component Rendering

**What to test:**
- ✅ Page renders without crashing
- ✅ Form inputs are present
- ✅ Submit button is present
- ✅ Empty state shows on initial load
- ✅ AdSlot components render

**Test file:** `__tests__/components/competitor-analyzer-page.test.tsx`

#### 3.2 User Interactions

**What to test:**
- ✅ Typing in URL inputs updates state
- ✅ Submit button is disabled when form is invalid
- ✅ Validation errors show for invalid URLs
- ✅ Form submission triggers API call
- ✅ Loading state shows during analysis
- ✅ Results display after successful analysis
- ✅ Error message shows for failed analysis
- ✅ Error distinguishes between competitor and my URL

**Test file:** `__tests__/components/user-flows.test.tsx`

#### 3.3 Validation Hook

**What to test:**
- ✅ Hook validates URLs correctly
- ✅ Errors clear when URLs change
- ✅ isValid flag is accurate
- ✅ validate() function returns correct boolean

**Test file:** `__tests__/hooks/useUrlValidation.test.ts`

---

## 4. Manual QA Checklist

### 4.1 Core Workflow

**Basic Analysis:**
- [ ] Enter a valid competitor URL
- [ ] Click "Analyze Pages"
- [ ] Verify loading state shows with progress steps
- [ ] Verify results display correctly with all tabs
- [ ] Verify summary cards show accurate data
- [ ] Verify each tab (Meta, Headings, Content, Links, Media, Schema, Technical) has data

**Comparison Mode:**
- [ ] Enter both competitor URL and your URL
- [ ] Click "Analyze Pages"
- [ ] Verify both analyses complete
- [ ] Verify comparison section appears
- [ ] Verify opportunities and strengths are shown
- [ ] Verify comparison score is displayed

### 4.2 Error Handling

**Validation Errors:**
- [ ] Enter invalid URL → See inline error with red border
- [ ] Enter localhost URL → See "localhost not allowed" error
- [ ] Enter same URL twice → See "URLs must be different" error
- [ ] Submit button is disabled when errors present

**API Errors:**
- [ ] Enter URL blocked by robots.txt → See "robots.txt disallows" error
- [ ] Trigger rate limit → See "Rate limit exceeded" error
- [ ] Enter non-existent domain → See network error
- [ ] Error message indicates which URL failed (Competitor or Your URL)

### 4.3 Edge Cases

**URL Handling:**
- [ ] URLs with trailing slashes work
- [ ] URLs with query parameters work
- [ ] URLs with fragments (#) work
- [ ] Very long URLs are handled
- [ ] International domain names work

**Content Edge Cases:**
- [ ] Pages with no title/meta description
- [ ] Pages with multiple H1s
- [ ] Pages with no structured data
- [ ] Pages with very little content
- [ ] Pages with lots of images

**Performance:**
- [ ] Analysis completes within 20 seconds
- [ ] No memory leaks on repeated analyses
- [ ] Loading state is responsive

### 4.4 Responsive Design

**Mobile (320px - 767px):**
- [ ] Header is readable
- [ ] Form inputs are full width
- [ ] Submit button is tappable
- [ ] Summary cards stack vertically
- [ ] Tabs are scrollable horizontally
- [ ] Results are readable
- [ ] Ad slots fit on screen

**Tablet (768px - 1023px):**
- [ ] Layout uses available space
- [ ] Summary cards show 3 per row
- [ ] Tabs are easily clickable
- [ ] Comparison section is readable

**Desktop (1024px+):**
- [ ] Content is centered with max-width
- [ ] Summary cards show all 6 in one row
- [ ] Tabs are horizontally aligned
- [ ] Side-by-side comparison is clear

### 4.5 Ad Slots & CLS Prevention

**Ad Slot Verification:**
- [ ] Top ad slot appears after results load
- [ ] Middle ad slot is present in results
- [ ] Bottom ad slot appears after all results
- [ ] Sidebar ad slot (if any) is visible on desktop

**CLS Prevention:**
- [ ] Ad slots have reserved min-height before load
- [ ] No layout shift when scrolling to results
- [ ] Content doesn't jump when ads load
- [ ] Use Chrome DevTools Lighthouse to check CLS score < 0.1

### 4.6 Accessibility

**Keyboard Navigation:**
- [ ] Can tab through all form inputs
- [ ] Can submit form with Enter key
- [ ] Can navigate tabs with keyboard
- [ ] Focus indicators are visible

**Screen Reader:**
- [ ] Form labels are announced
- [ ] Error messages are announced
- [ ] Loading state is announced
- [ ] Results are navigable with screen reader

**Color Contrast:**
- [ ] Text has sufficient contrast (WCAG AA)
- [ ] Error states are not color-only
- [ ] Disabled states are clearly indicated

### 4.7 Browser Compatibility

**Test in:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 5. Test Data Fixtures

### Sample robots.txt Files

**Allows all:**
```
User-agent: *
Allow: /
```

**Disallows all:**
```
User-agent: *
Disallow: /
```

**Specific rules:**
```
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /api/analyze
```

### Sample HTML Pages

**Complete page (good SEO):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Example Page - 50 Character Title</title>
  <meta name="description" content="This is a well-crafted meta description that is between 150-160 characters long for optimal SEO performance.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/page">
  <meta property="og:title" content="Example Page">
  <meta property="og:description" content="OG description">
  <meta property="og:image" content="https://example.com/image.jpg">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Example Article"
  }
  </script>
</head>
<body>
  <h1>Main Heading</h1>
  <h2>Subheading 1</h2>
  <p>This is a paragraph with some content. It has multiple words to test word count.</p>
  <h2>Subheading 2</h2>
  <p>Another paragraph with more content.</p>
  <a href="/internal">Internal link</a>
  <a href="https://external.com">External link</a>
  <img src="/image.jpg" alt="Descriptive alt text">
</body>
</html>
```

**Minimal page (poor SEO):**
```html
<!DOCTYPE html>
<html>
<head></head>
<body>
  <h2>No H1 Here</h2>
  <p>Minimal content.</p>
  <img src="/image.jpg">
</body>
</html>
```

---

## 6. Running Tests

### Setup

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest

# Create jest.config.js
npm run test:setup
```

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only frontend tests
npm run test:frontend
```

### Coverage Goals

- **Overall:** 80%+
- **Critical paths:** 95%+
  - URL validation
  - robots.txt checking
  - API endpoint
  - User form submission

---

## 7. CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm test"
```

---

## 8. Test Maintenance

### When to Update Tests

- ✅ **Before adding new features** - Write tests first (TDD)
- ✅ **When fixing bugs** - Add test to prevent regression
- ✅ **When refactoring** - Ensure tests still pass
- ✅ **When changing API contracts** - Update integration tests

### Red Flags

- ⚠️ Tests that only pass sometimes (flaky tests)
- ⚠️ Tests that test implementation details
- ⚠️ Tests with hardcoded timeouts
- ⚠️ Tests that depend on external services

---

## Summary

This testing strategy provides:
1. **Unit tests** for core backend logic (validation, parsing, analysis)
2. **Integration tests** for API endpoints with mocked dependencies
3. **Frontend tests** for user interactions and component rendering
4. **Manual QA** checklist for human verification

**Next steps:**
1. Implement the example test files (see separate files)
2. Set up Jest and testing infrastructure
3. Add test scripts to package.json
4. Integrate tests into CI/CD pipeline
5. Aim for 80%+ test coverage

The combination of automated tests and manual QA ensures the Competitor Page Analyzer is robust, reliable, and maintainable.

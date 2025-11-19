# API Examples

Comprehensive examples for using the SEO Analyzer API.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Comparison Mode](#comparison-mode)
3. [Error Handling](#error-handling)
4. [Integration Examples](#integration-examples)
5. [Response Parsing](#response-parsing)

---

## Basic Usage

### Example 1: Analyze a Single URL

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "competitorUrl": "https://example.com"
  }'
```

**Response:**
```json
{
  "competitor": {
    "url": "https://example.com",
    "success": true,
    "seo": {
      "title": {
        "content": "Example Domain",
        "length": 14,
        "quality": {
          "exists": true,
          "withinIdealLength": false,
          "tooShort": true,
          "tooLong": false,
          "excessCharacters": 0
        },
        "recommendations": ["Add 36 more characters"]
      }
    },
    "content": {
      "wordCount": 122,
      "readingTime": 1
    }
  },
  "meta": {
    "processingTime": 1234,
    "urlsAnalyzed": 1
  }
}
```

### Example 2: Analyze with JavaScript

```javascript
async function analyzePage(url) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitorUrl: url })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Analysis failed:', data.message);
      return null;
    }

    return data.competitor;
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Usage
const result = await analyzePage('https://example.com');
if (result) {
  console.log('Title:', result.seo.title.content);
  console.log('Word Count:', result.content.wordCount);
}
```

---

## Comparison Mode

### Example 3: Compare Two URLs

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "competitorUrl": "https://competitor.com/blog/seo-tips",
    "myUrl": "https://mysite.com/blog/seo-guide"
  }'
```

**Response (excerpt):**
```json
{
  "competitor": { /* full analysis */ },
  "mine": { /* full analysis */ },
  "comparison": {
    "score": {
      "overall": 68,
      "verdict": "competitor-better",
      "summary": "Competitor performs slightly better overall"
    },
    "opportunities": [
      {
        "category": "content",
        "severity": "medium",
        "title": "Increase Word Count by 400 words",
        "description": "Competitor has 1847 words, you have 1447.",
        "recommendation": "Add approximately 400 words of quality content..."
      },
      {
        "category": "seo",
        "severity": "high",
        "title": "Add Meta Description",
        "description": "Competitor has a meta description, but your page is missing one.",
        "recommendation": "Add a 150-160 character meta description..."
      }
    ],
    "strengths": [
      {
        "category": "links",
        "title": "Better Internal Linking",
        "description": "Your page has 14 more internal links than competitor."
      }
    ]
  }
}
```

### Example 4: Process Comparison Results

```javascript
async function comparePages(competitorUrl, myUrl) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitorUrl, myUrl })
  });

  const data = await response.json();

  if (data.error) {
    console.error('Error:', data.message);
    return;
  }

  // Display score
  console.log(`\n📊 Overall Score: ${data.comparison.score.overall}/100`);
  console.log(`Verdict: ${data.comparison.score.verdict}`);
  console.log(`${data.comparison.score.summary}\n`);

  // Display high-priority opportunities
  const highPriority = data.comparison.opportunities
    .filter(opp => opp.severity === 'high');

  if (highPriority.length > 0) {
    console.log('🔴 High Priority Improvements:');
    highPriority.forEach(opp => {
      console.log(`  • ${opp.title}`);
      console.log(`    ${opp.recommendation}\n`);
    });
  }

  // Display strengths
  if (data.comparison.strengths.length > 0) {
    console.log('💪 Your Strengths:');
    data.comparison.strengths.forEach(strength => {
      console.log(`  • ${strength.title}`);
      console.log(`    ${strength.description}\n`);
    });
  }
}

// Usage
await comparePages(
  'https://competitor.com/page',
  'https://mysite.com/page'
);
```

---

## Error Handling

### Example 5: Handle Invalid URL

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "not-a-url"}'
```

**Response:**
```json
{
  "error": true,
  "message": "Invalid URL format",
  "code": "INVALID_URL",
  "statusCode": 400,
  "timestamp": "2025-11-14T10:30:00Z"
}
```

### Example 6: Handle robots.txt Blocking

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "https://example.com/admin"}'
```

**Response:**
```json
{
  "error": true,
  "message": "Analysis blocked: robots.txt disallows crawling of competitor URL",
  "code": "ROBOTS_TXT_DISALLOWED",
  "statusCode": 403,
  "timestamp": "2025-11-14T10:30:00Z"
}
```

### Example 7: Comprehensive Error Handling

```javascript
async function analyzeWithErrorHandling(url) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitorUrl: url })
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      switch (data.code) {
        case 'INVALID_URL':
          return { error: 'Please enter a valid URL' };

        case 'ROBOTS_TXT_DISALLOWED':
          return { error: 'This site blocks crawlers via robots.txt' };

        case 'RATE_LIMIT_EXCEEDED':
          return {
            error: `Rate limit exceeded. Retry in ${data.details?.retryAfter}s`
          };

        case 'FETCH_TIMEOUT':
          return { error: 'The page took too long to respond' };

        case 'NON_HTML_CONTENT':
          return { error: 'URL does not return HTML content' };

        case 'PAGE_TOO_LARGE':
          return { error: 'Page size exceeds 10MB limit' };

        default:
          return { error: data.message || 'Analysis failed' };
      }
    }

    // Check if analysis was successful
    if (!data.competitor.success) {
      return {
        error: 'Analysis failed',
        details: data.competitor.errors
      };
    }

    return { success: true, data: data.competitor };

  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

// Usage
const result = await analyzeWithErrorHandling('https://example.com');
if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('Analysis successful:', result.data);
}
```

---

## Integration Examples

### Example 8: React Component

```typescript
'use client';

import { useState } from 'react';

interface AnalysisResult {
  url: string;
  success: boolean;
  seo: {
    title: { content: string | null; length: number };
    metaDescription: { content: string | null };
  };
  content: {
    wordCount: number;
    readingTime: number;
  };
  headings: {
    h1Count: number;
  };
}

export function AnalyzerForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorUrl: url })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message);
      } else {
        setResult(data.competitor);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <h2>Results for {result.url}</h2>
          <p>Title: {result.seo.title.content}</p>
          <p>Word Count: {result.content.wordCount}</p>
          <p>Reading Time: {result.content.readingTime} min</p>
          <p>H1 Count: {result.headings.h1Count}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 9: Node.js Script

```javascript
// analyze-urls.js
const fs = require('fs');

async function analyzeMultipleUrls(urls) {
  const results = [];

  for (const url of urls) {
    console.log(`Analyzing ${url}...`);

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorUrl: url })
      });

      const data = await response.json();

      if (data.error) {
        results.push({ url, error: data.message });
      } else {
        results.push({
          url,
          title: data.competitor.seo.title.content,
          wordCount: data.competitor.content.wordCount,
          h1Count: data.competitor.headings.h1Count,
          links: data.competitor.links.total,
        });
      }

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      results.push({ url, error: error.message });
    }
  }

  return results;
}

// Read URLs from file
const urls = fs.readFileSync('urls.txt', 'utf-8')
  .split('\n')
  .filter(line => line.trim());

// Analyze all URLs
analyzeMultipleUrls(urls).then(results => {
  // Write results to JSON file
  fs.writeFileSync(
    'analysis-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('Results saved to analysis-results.json');
});
```

### Example 10: Python Integration

```python
import requests
import json
import time

def analyze_url(url):
    """Analyze a single URL"""
    try:
        response = requests.post(
            'http://localhost:3000/api/analyze',
            json={'competitorUrl': url},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': True, 'message': str(e)}

def analyze_competitor_set(competitor_urls, my_url):
    """Analyze your URL against multiple competitors"""
    results = []

    for competitor_url in competitor_urls:
        print(f'Comparing against {competitor_url}...')

        data = analyze_url_pair(competitor_url, my_url)

        if not data.get('error'):
            results.append({
                'competitor': competitor_url,
                'score': data['comparison']['score']['overall'],
                'verdict': data['comparison']['score']['verdict'],
                'opportunities': len(data['comparison']['opportunities']),
                'strengths': len(data['comparison']['strengths'])
            })

        # Rate limiting
        time.sleep(1)

    return results

def analyze_url_pair(competitor_url, my_url):
    """Compare two URLs"""
    try:
        response = requests.post(
            'http://localhost:3000/api/analyze',
            json={
                'competitorUrl': competitor_url,
                'myUrl': my_url
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': True, 'message': str(e)}

# Example usage
competitors = [
    'https://competitor1.com/page',
    'https://competitor2.com/page',
    'https://competitor3.com/page'
]

my_page = 'https://mysite.com/page'

results = analyze_competitor_set(competitors, my_page)

# Save to file
with open('comparison-results.json', 'w') as f:
    json.dump(results, f, indent=2)

print('Analysis complete!')
```

---

## Response Parsing

### Example 11: Extract Key Metrics

```javascript
function extractKeyMetrics(analysisResult) {
  const { competitor } = analysisResult;

  return {
    // Basic Info
    url: competitor.url,
    statusCode: competitor.basicInfo.httpStatus,
    loadTime: competitor.basicInfo.responseTime,

    // SEO
    hasTitle: competitor.seo.title.quality.exists,
    titleLength: competitor.seo.title.length,
    hasMetaDescription: competitor.seo.metaDescription.quality.exists,
    descriptionLength: competitor.seo.metaDescription.length,
    hasCanonical: competitor.seo.canonical.exists,

    // Content
    wordCount: competitor.content.wordCount,
    readingTime: competitor.content.readingTime,
    topKeyword: competitor.content.topKeywords[0]?.keyword,

    // Headings
    h1Count: competitor.headings.h1Count,
    totalHeadings: competitor.headings.quality.totalCount,

    // Links
    totalLinks: competitor.links.total,
    internalLinkRatio: competitor.links.internalPercentage,

    // Media
    totalImages: competitor.media.totalImages,
    altCoverage: competitor.media.altPercentage,

    // Technical
    isMobileFriendly: competitor.technical.viewport.isMobileFriendly,
    hasStructuredData: competitor.structuredData.hasStructuredData,

    // Warnings & Errors
    hasWarnings: competitor.warnings.length > 0,
    hasErrors: competitor.errors.length > 0,
  };
}

// Usage
const data = await analyzePage('https://example.com');
const metrics = extractKeyMetrics(data);
console.table(metrics);
```

### Example 12: Generate SEO Report

```javascript
function generateSEOReport(analysisResult) {
  const { competitor } = analysisResult;
  const issues = [];
  const suggestions = [];

  // Check title
  if (!competitor.seo.title.quality.exists) {
    issues.push('CRITICAL: Missing title tag');
  } else if (competitor.seo.title.quality.tooShort) {
    suggestions.push(`Title is too short (${competitor.seo.title.length} chars). Aim for 50-60 characters.`);
  } else if (competitor.seo.title.quality.tooLong) {
    suggestions.push(`Title is too long (${competitor.seo.title.length} chars). Shorten to 60 characters.`);
  }

  // Check meta description
  if (!competitor.seo.metaDescription.quality.exists) {
    issues.push('CRITICAL: Missing meta description');
  } else if (competitor.seo.metaDescription.quality.tooShort) {
    suggestions.push(`Meta description is too short. Aim for 150-160 characters.`);
  }

  // Check H1
  if (competitor.headings.quality.h1Count === 0) {
    issues.push('CRITICAL: Missing H1 heading');
  } else if (competitor.headings.quality.h1Count > 1) {
    suggestions.push(`Multiple H1 headings found (${competitor.headings.quality.h1Count}). Use only one H1 per page.`);
  }

  // Check content
  if (competitor.content.wordCount < 300) {
    suggestions.push(`Thin content (${competitor.content.wordCount} words). Aim for at least 500 words.`);
  }

  // Check images
  if (competitor.media.altPercentage < 90) {
    suggestions.push(`${competitor.media.imagesWithoutAlt} images missing alt text. Add descriptive alt text for accessibility.`);
  }

  // Check technical
  if (!competitor.technical.viewport.isMobileFriendly) {
    issues.push('CRITICAL: Page is not mobile-friendly');
  }

  if (!competitor.structuredData.hasStructuredData) {
    suggestions.push('Consider adding structured data (JSON-LD) for better search visibility.');
  }

  return {
    url: competitor.url,
    score: calculateSEOScore(competitor),
    criticalIssues: issues,
    suggestions: suggestions,
    summary: `Found ${issues.length} critical issues and ${suggestions.length} improvement suggestions.`
  };
}

function calculateSEOScore(result) {
  let score = 0;

  // Title (15 points)
  if (result.seo.title.quality.exists) score += 15;
  else if (result.seo.title.quality.withinIdealLength) score += 15;

  // Meta description (15 points)
  if (result.seo.metaDescription.quality.exists) score += 15;

  // H1 (10 points)
  if (result.headings.quality.h1Count === 1) score += 10;

  // Content (20 points)
  if (result.content.wordCount > 1500) score += 20;
  else if (result.content.wordCount > 500) score += 10;

  // Links (10 points)
  if (result.links.internalPercentage >= 40) score += 10;

  // Images (10 points)
  if (result.media.altPercentage > 90) score += 10;

  // Mobile (10 points)
  if (result.technical.viewport.isMobileFriendly) score += 10;

  // Structured data (10 points)
  if (result.structuredData.hasStructuredData) score += 10;

  return score;
}

// Usage
const analysis = await analyzePage('https://example.com');
const report = generateSEOReport(analysis);
console.log(report);
```

---

## Best Practices

1. **Rate Limiting**: Always respect the API rate limits (10 requests/hour). For bulk analysis, add delays between requests.

2. **Error Handling**: Always check for `data.error` before accessing results.

3. **Timeout Handling**: Set appropriate timeouts on the client side (recommend 30 seconds to account for API timeout + network).

4. **Result Validation**: Check `result.success` before processing analysis data.

5. **Caching**: Cache results on the client side to avoid re-analyzing the same URLs.

6. **Progress Indication**: For long-running analyses, show loading indicators to users.

7. **Batch Processing**: When analyzing multiple URLs, use sequential requests with delays, not parallel requests.

---

For more examples and documentation, see:
- [README.md](./README.md) - Complete API documentation
- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [test-api.js](./test-api.js) - Automated test script

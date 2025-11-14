# SEO Analyzer - Competitor Page Analyzer

A production-ready API for analyzing on-page SEO metrics of any webpage. Respects robots.txt, includes rate limiting, and provides comprehensive analysis.

## Features

- ✅ **Ethical Crawling**: Respects robots.txt before analyzing any page
- ✅ **Comprehensive Analysis**: Extracts 50+ SEO metrics per page
- ✅ **Comparison Mode**: Compare two pages side-by-side with actionable insights
- ✅ **Rate Limiting**: 10 requests per hour per IP (configurable)
- ✅ **Security**: Blocks localhost, private IPs, and SERP URLs
- ✅ **Error Handling**: Detailed error messages for all failure scenarios
- ✅ **Performance**: 15-second timeout, 10MB page size limit

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/analyze`

### Production Build

```bash
npm run build
npm start
```

## API Documentation

### Endpoint

```
POST /api/analyze
```

### Request Body

```json
{
  "competitorUrl": "https://competitor.com/page",
  "myUrl": "https://yoursite.com/page"  // Optional
}
```

**Parameters:**
- `competitorUrl` (string, required): The URL to analyze
- `myUrl` (string, optional): Your URL for comparison mode

### Response

#### Success Response (200 OK)

```json
{
  "competitor": {
    "url": "https://competitor.com/page",
    "originalUrl": "https://competitor.com/page",
    "timestamp": "2025-11-14T10:30:00Z",
    "success": true,
    "basicInfo": {
      "httpStatus": 200,
      "finalUrl": "https://competitor.com/page",
      "wasRedirected": false,
      "contentType": "text/html; charset=utf-8",
      "contentLength": 45678,
      "responseTime": 543
    },
    "seo": {
      "title": {
        "content": "Page Title",
        "length": 42,
        "quality": {
          "exists": true,
          "withinIdealLength": false,
          "tooShort": true,
          "tooLong": false,
          "excessCharacters": 0
        },
        "recommendations": ["Add 8 more characters"]
      },
      "metaDescription": { /* ... */ },
      "metaRobots": { /* ... */ },
      "canonical": { /* ... */ },
      "openGraph": { /* ... */ },
      "twitterCard": { /* ... */ }
    },
    "headings": {
      "h1": ["Main Heading"],
      "h2": ["Subheading 1", "Subheading 2"],
      "structure": [ /* ... */ ],
      "quality": {
        "hasH1": true,
        "h1Count": 1,
        "multipleH1Warning": false,
        "missingH1Warning": false,
        "totalCount": 15
      }
    },
    "content": {
      "wordCount": 1847,
      "characterCount": 12456,
      "paragraphCount": 23,
      "textToHtmlRatio": 18.5,
      "topKeywords": [
        { "keyword": "seo", "count": 47, "density": 2.5 }
      ],
      "readingTime": 9
    },
    "links": {
      "total": 87,
      "internal": 53,
      "external": 34,
      "internalPercentage": 61,
      "nofollowPercentage": 9,
      "internalLinks": [ /* ... */ ],
      "externalLinks": [ /* ... */ ]
    },
    "media": {
      "totalImages": 24,
      "imagesWithAlt": 18,
      "imagesWithoutAlt": 6,
      "altPercentage": 75,
      "images": [ /* ... */ ]
    },
    "structuredData": {
      "hasStructuredData": true,
      "jsonLd": [ /* ... */ ],
      "total": 3,
      "schemaTypes": ["Article", "BreadcrumbList"]
    },
    "technical": {
      "viewport": {
        "exists": true,
        "content": "width=device-width, initial-scale=1",
        "isMobileFriendly": true
      },
      "charset": "UTF-8",
      "hasDoctype": true,
      "favicon": { /* ... */ }
    },
    "warnings": [],
    "errors": []
  },
  "mine": { /* Same structure as competitor */ },
  "comparison": {
    "opportunities": [
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
        "category": "content",
        "title": "More Comprehensive Content",
        "description": "Your page has 200 more words than competitor."
      }
    ],
    "score": {
      "overall": 68,
      "verdict": "competitor-better",
      "summary": "Competitor performs slightly better overall"
    }
  },
  "meta": {
    "timestamp": "2025-11-14T10:30:15Z",
    "processingTime": 8234,
    "version": "1.0.0",
    "urlsAnalyzed": 2
  }
}
```

#### Error Response (4xx/5xx)

```json
{
  "error": true,
  "message": "Analysis blocked: robots.txt disallows crawling",
  "code": "ROBOTS_TXT_DISALLOWED",
  "statusCode": 403,
  "timestamp": "2025-11-14T10:30:00Z",
  "details": {
    "url": "https://competitor.com/admin"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_URL` | 400 | Invalid URL format or blocked URL |
| `MALFORMED_REQUEST` | 400 | Missing required fields |
| `NON_HTML_CONTENT` | 400 | URL does not return HTML |
| `ROBOTS_TXT_DISALLOWED` | 403 | robots.txt blocks crawling |
| `SERP_SCRAPING_PROHIBITED` | 403 | Search engine result pages not allowed |
| `PAGE_TOO_LARGE` | 413 | Page exceeds 10MB limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `FETCH_TIMEOUT` | 504 | Page took too long to respond |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Usage Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitorUrl: 'https://example.com',
    myUrl: 'https://yoursite.com'
  })
});

const data = await response.json();

if (data.error) {
  console.error('Error:', data.message);
} else {
  console.log('Analysis:', data.competitor);
  if (data.comparison) {
    console.log('Opportunities:', data.comparison.opportunities);
  }
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "competitorUrl": "https://example.com",
    "myUrl": "https://yoursite.com"
  }'
```

### Python

```python
import requests

response = requests.post('http://localhost:3000/api/analyze', json={
    'competitorUrl': 'https://example.com',
    'myUrl': 'https://yoursite.com'
})

data = response.json()
print(data)
```

## Analysis Metrics

### SEO Metrics
- Title tag (content, length, quality assessment)
- Meta description (content, length, quality assessment)
- Meta robots (directives, noindex, nofollow)
- Canonical URL (validation, self-referencing check)
- Language attribute
- Open Graph tags (completeness check)
- Twitter Card tags (completeness check)

### Content Metrics
- Word count
- Character count
- Paragraph count
- Text-to-HTML ratio
- Top 10 keywords with frequency and density
- Reading time estimate

### Heading Structure
- All H1-H6 tags
- Heading hierarchy validation
- Multiple/missing H1 warnings
- Complete document structure

### Link Analysis
- Total, internal, external link counts
- Follow vs nofollow breakdown
- Percentage calculations
- Sample links (up to 50 internal, 50 external)

### Media Analysis
- Total image count
- Images with/without alt text
- Alt text coverage percentage
- Sample images (up to 20)

### Structured Data
- JSON-LD schema detection
- Schema types found
- Complete parsed objects

### Technical Hints
- Viewport meta tag (mobile-friendly check)
- Character encoding
- DOCTYPE presence
- Favicon detection

### Comparison (When Both URLs Provided)
- Opportunities (prioritized improvements)
- Strengths (areas where you excel)
- Overall score and verdict

## Configuration

### Rate Limiting

Default: 10 requests per hour per IP

To modify, edit the `checkRateLimit` function in `/app/api/analyze/route.ts`:

```typescript
const maxRequests = 10;
const windowMs = 60 * 60 * 1000; // 1 hour
```

For production, consider using Redis:
```typescript
// Use Redis for distributed rate limiting
import { Redis } from '@upstash/redis';
const redis = new Redis({ /* config */ });
```

### Timeouts

- robots.txt check: 5 seconds
- Page fetch: 15 seconds

To modify, edit constants:

```typescript
const TIMEOUT_MS = 15000; // Page fetch timeout
```

### Size Limits

- Maximum page size: 10MB
- Maximum URL length: 2048 characters

```typescript
const MAX_PAGE_SIZE = 10 * 1024 * 1024; // 10MB
```

## Security

### URL Validation

The API blocks:
- Non-HTTP/HTTPS protocols (`file://`, `ftp://`, `javascript://`)
- Localhost and loopback addresses
- Private IP ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
- Search engine result pages (Google, Bing, etc.)

### Robots.txt Compliance

The API:
1. Fetches `/robots.txt` from the target domain
2. Parses Disallow and Allow rules
3. Returns 403 if crawling is not allowed
4. Fails open (allows) if robots.txt is unavailable

### Rate Limiting

- IP-based limiting (10 requests/hour by default)
- Returns 429 status with `Retry-After` header
- In-memory store (use Redis for production)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy

Environment variables (optional):
```bash
# Add to Vercel dashboard
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t seo-analyzer .
docker run -p 3000:3000 seo-analyzer
```

## Testing

### Test URLs

**Valid URLs:**
- `https://example.com` - Simple test page
- `https://developer.mozilla.org` - Well-optimized page
- `https://wikipedia.org` - Rich structured data

**Error Testing:**
- `https://httpstat.us/404` - 404 error
- `https://httpstat.us/500` - 500 error
- `https://google.com/search?q=test` - SERP blocking
- `http://localhost:3000` - Localhost blocking

### Manual Testing

```bash
# Test valid URL
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "https://example.com"}'

# Test comparison mode
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "https://example.com", "myUrl": "https://wikipedia.org"}'

# Test robots.txt blocking (will fail if site allows crawling)
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "https://example.com/admin"}'

# Test rate limiting (send 11 requests in succession)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"competitorUrl": "https://example.com"}' &
done
```

## Architecture

```
POST /api/analyze
    ↓
Validate URLs
    ↓
Check Rate Limit
    ↓
Check robots.txt (parallel if 2 URLs)
    ↓
Fetch HTML (parallel if 2 URLs)
    ↓
Parse with Cheerio
    ↓
Extract Metrics (parallel)
    ├─ SEO (title, meta, canonical)
    ├─ Headings (H1-H6 hierarchy)
    ├─ Content (word count, keywords)
    ├─ Links (internal/external)
    ├─ Media (images, alt text)
    ├─ Structured Data (JSON-LD)
    └─ Technical (viewport, charset)
    ↓
Generate Comparison (if 2 URLs)
    ↓
Return JSON Response
```

## Next Steps

To complete the full application per the Master Specification:

1. **Frontend UI** (`/app/competitor-analyzer/page.tsx`)
   - Form component with URL inputs
   - Loading states and progress indicators
   - Results display with tabs/accordions
   - Comparison visualization

2. **Styling** (Tailwind CSS)
   - Install and configure Tailwind
   - Create responsive layouts
   - Design summary cards and detailed panels

3. **AdSense Integration**
   - Add Google AdSense script
   - Create ad slot components
   - Prevent Cumulative Layout Shift (CLS)

4. **Additional Features**
   - Export results (PDF/JSON)
   - Results caching (15-minute TTL)
   - Analytics integration
   - Error tracking (Sentry)

5. **Production Optimizations**
   - Redis-based rate limiting
   - CDN for static assets
   - Database for analytics (optional)
   - Monitoring and alerts

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

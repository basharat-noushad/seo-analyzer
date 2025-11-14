# Quick Start Guide

Get the SEO Analyzer API up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14 (React framework)
- Cheerio (HTML parsing)
- TypeScript

### 2. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 3. Test the API

Open your browser to `http://localhost:3000` to see the test interface.

Or test with curl:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"competitorUrl": "https://example.com"}'
```

Or run the test script:

```bash
node test-api.js
```

## Basic Usage

### Single URL Analysis

```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitorUrl: 'https://example.com'
  })
});

const data = await response.json();
console.log(data.competitor.seo.title.content);
```

### Comparison Mode

```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitorUrl: 'https://competitor.com',
    myUrl: 'https://yoursite.com'
  })
});

const data = await response.json();
console.log('Score:', data.comparison.score.overall);
console.log('Opportunities:', data.comparison.opportunities);
```

## What You Get

For each analyzed URL:

- ✅ **SEO Metrics**: Title, meta description, canonical, Open Graph, Twitter Card
- ✅ **Headings**: H1-H6 hierarchy with quality checks
- ✅ **Content**: Word count, keyword analysis, reading time
- ✅ **Links**: Internal/external breakdown with nofollow detection
- ✅ **Media**: Image count with alt text analysis
- ✅ **Structured Data**: JSON-LD schema detection
- ✅ **Technical**: Viewport, charset, favicon, DOCTYPE

When comparing two URLs:

- 📊 **Opportunities**: Prioritized improvements (high/medium/low severity)
- 💪 **Strengths**: Areas where your page excels
- 🎯 **Score**: Overall comparison score (0-100)

## Features

### Security & Ethics
- ✅ Respects robots.txt (checks before crawling)
- ✅ Blocks localhost and private IPs
- ✅ Blocks search engine result pages (no SERP scraping)
- ✅ Rate limiting (10 requests/hour/IP)

### Performance
- ⚡ 15-second timeout per request
- 🚀 Parallel processing when analyzing 2 URLs
- 📦 10MB page size limit
- 🎯 Returns partial results on non-fatal errors

### Error Handling
- Clear error messages for all failure scenarios
- HTTP status codes following REST conventions
- Detailed error codes for programmatic handling

## Next Steps

### Add Frontend UI

Follow the Master Specification to implement:

1. **Form Component** (`/app/competitor-analyzer/page.tsx`)
   - URL input fields with validation
   - Submit button with loading states
   - Error message display

2. **Results Component**
   - Summary cards (6-card grid)
   - Detailed tabs (7 sections)
   - Mobile responsive layout

3. **Comparison Component**
   - Side-by-side metrics table
   - Opportunities list with severity badges
   - Strengths list
   - Overall score visualization

### Add Styling

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` and create components with Tailwind classes.

### Add AdSense

1. Get AdSense publisher ID
2. Add AdSense script to `app/layout.tsx`
3. Create `AdSlot` component with reserved space
4. Test CLS (Cumulative Layout Shift) < 0.1

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow prompts to deploy. Your API will be live in minutes!

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### robots.txt Timeout

The API allows 5 seconds for robots.txt check. If a site's robots.txt is slow, the request may timeout but will fail-open (allow crawling).

### Rate Limit Testing

Rate limit is IP-based. If testing locally, all requests come from localhost. To test with different IPs, deploy to production or modify the rate limiter to use a different key.

### CORS Errors

If calling the API from a different domain, add CORS headers to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
      ],
    },
  ];
}
```

## Development Tips

### Hot Reload

Next.js has built-in hot reload. Changes to code will automatically refresh.

### Debug Mode

Add console logs in `/app/api/analyze/route.ts`:

```typescript
console.log('Analyzing URL:', url);
console.log('robots.txt result:', robotsCheck);
console.log('SEO metrics:', seo);
```

### Test Different Scenarios

Use the `test-api.js` script to test:
- Valid URLs
- Invalid URLs
- Localhost blocking
- SERP blocking
- robots.txt blocking
- Comparison mode
- Error handling

### Production Build

Test production build locally:

```bash
npm run build
npm start
```

This runs the optimized production version.

## Resources

- [Master Specification](./README.md) - Complete API documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Cheerio Docs](https://cheerio.js.org/) - HTML parsing library
- [robots.txt Spec](https://developers.google.com/search/docs/crawling-indexing/robots/intro) - robots.txt standard

## Support

- Check the README for detailed documentation
- Open an issue on GitHub for bugs or questions
- Review the Master Specification for implementation details

---

**You're ready! Start building your SEO analysis tool.** 🚀

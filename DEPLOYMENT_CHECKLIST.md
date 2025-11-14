# Deployment Checklist - Competitor Page Analyzer

Before deploying to production, complete these tasks to ensure AdSense integration and SEO are properly configured.

---

## 🔴 Critical (Must Do)

### 1. AdSense Configuration

- [ ] **Sign up for Google AdSense**
  - Go to https://www.google.com/adsense/
  - Complete application and get approved
  - Note: Approval can take 24-48 hours

- [ ] **Get Publisher ID**
  - Format: `ca-pub-XXXXXXXXXXXX`
  - Find in AdSense dashboard → Account → Account Information

- [ ] **Create Ad Units**
  - Create 3-4 ad units in AdSense dashboard
  - Recommended sizes:
    - Top: Leaderboard (728×90) or Responsive
    - Middle: Mobile Banner (320×50) or Responsive
    - Bottom: Leaderboard (728×90) or Responsive
  - Note the ad slot IDs (10-digit numbers)

- [ ] **Update Publisher ID**
  ```bash
  # Find and replace in these files:
  # 1. app/layout.tsx (line 98)
  <AdSenseScript publisherId="ca-pub-XXXXXXXXXXXX" />

  # 2. components/AdSlot.tsx (line 38)
  const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXX';
  ```

- [ ] **Update Ad Slot IDs**
  ```tsx
  // In app/competitor-analyzer/page.tsx
  <AdSlot position="top" adSlot="1234567890" />      // ← Replace with real ID
  <AdSlot position="middle" adSlot="0987654321" />   // ← Replace with real ID
  <AdSlot position="bottom" adSlot="1122334455" />   // ← Replace with real ID
  ```

### 2. Domain & URLs

- [ ] **Update Base URL**
  ```bash
  # Find and replace "yourdomain.com" in:
  # 1. app/layout.tsx (line 14)
  const baseUrl = 'https://yourdomain.com';

  # 2. app/competitor-analyzer/layout.tsx (line 35, 45, 69)
  # 3. components/StructuredData.tsx (line 20, 24, 35, 53)
  ```

- [ ] **Update Twitter Handle**
  ```bash
  # Find and replace "@yourtwitterhandle" in:
  # 1. app/layout.tsx (line 71)
  # 2. app/competitor-analyzer/layout.tsx (line 68)
  ```

### 3. Search Engine Verification

- [ ] **Google Search Console**
  - Add property at https://search.google.com/search-console
  - Get verification code
  - Update in `app/layout.tsx` line 46

- [ ] **Create robots.txt**
  ```bash
  # File: public/robots.txt
  User-agent: *
  Allow: /

  Sitemap: https://yourdomain.com/sitemap.xml
  ```

- [ ] **Create sitemap**
  - File already exists: `app/sitemap.ts`
  - Update URLs with your actual domain

### 4. Privacy & Legal

- [ ] **Create Privacy Policy Page**
  - Required by AdSense
  - Must mention:
    - Google AdSense cookies
    - Google Analytics (if used)
    - Data collection practices
  - Template: https://www.privacypolicygenerator.info/

- [ ] **Add Privacy Policy Link**
  - In footer or header
  - Must be accessible from all pages

- [ ] **Create Terms of Service** (optional but recommended)

### 5. Images

- [ ] **Create Open Graph Image**
  - Size: 1200×630px
  - Save as: `public/og-image-analyzer.png`
  - Shows when page is shared on social media

- [ ] **Create Twitter Card Image**
  - Size: 1200×600px
  - Save as: `public/twitter-image-analyzer.png`

- [ ] **Create Screenshot**
  - Size: 1200×800px
  - Save as: `public/screenshot.png`
  - Used in structured data

- [ ] **Create Favicons**
  - Use https://realfavicongenerator.net/
  - Place in `public/` directory:
    - favicon.ico
    - apple-touch-icon.png
    - favicon-16x16.png
    - favicon-32x32.png

---

## 🟡 Important (Should Do)

### 6. SEO Optimization

- [ ] **Update Organization Name**
  ```bash
  # Find and replace "SEO Analyzer Pro" with your brand name in:
  # - app/layout.tsx
  # - app/competitor-analyzer/layout.tsx
  # - components/StructuredData.tsx
  ```

- [ ] **Customize Meta Descriptions**
  - Review and customize all meta descriptions
  - Keep them unique and compelling
  - Aim for 150-160 characters

- [ ] **Add Keywords**
  - Research relevant keywords
  - Update keyword lists in metadata

- [ ] **Test with SEO Tools**
  - Test with https://www.opengraph.xyz/
  - Validate structured data at https://validator.schema.org/
  - Check with https://search.google.com/test/rich-results

### 7. Analytics Setup

- [ ] **Add Google Analytics 4** (optional)
  ```bash
  npm install @vercel/analytics
  ```
  - Get measurement ID from https://analytics.google.com/
  - Add to layout (see PERFORMANCE_GUIDE.md)

- [ ] **Add Vercel Analytics** (if deploying to Vercel)
  ```bash
  npm install @vercel/analytics @vercel/speed-insights
  ```

### 8. Performance Testing

- [ ] **Run Lighthouse Audit**
  ```bash
  npm run build
  npm start
  # Open Chrome DevTools → Lighthouse → Run audit
  ```
  - Target scores:
    - Performance: 90+
    - SEO: 100
    - Accessibility: 95+
    - Best Practices: 100

- [ ] **Test Core Web Vitals**
  - CLS: < 0.1
  - LCP: < 2.5s
  - FID: < 100ms

- [ ] **Test on Mobile**
  - Use Chrome DevTools device emulation
  - Test on real mobile devices

### 9. Security

- [ ] **Enable HTTPS**
  - Required by AdSense
  - Free with Vercel/Netlify/Cloudflare

- [ ] **Add Security Headers**
  - Already configured in `next.config.js`
  - Verify with https://securityheaders.com/

- [ ] **Review Rate Limiting**
  - Current: 10 requests/hour per IP
  - Adjust if needed in `app/api/analyze/route.ts`

---

## 🟢 Optional (Nice to Have)

### 10. Enhanced Features

- [ ] **Add User Authentication** (for premium features)
- [ ] **Add Database** (to save analysis history)
- [ ] **Add API Rate Limiting** (Redis-based)
- [ ] **Add More Ad Slots** (sidebar, in-content)
- [ ] **Add A/B Testing** (for ad placements)

### 11. Marketing

- [ ] **Submit to Search Engines**
  - Google Search Console
  - Bing Webmaster Tools

- [ ] **Create Social Media Accounts**
  - Twitter
  - LinkedIn
  - Facebook

- [ ] **Write Blog Posts**
  - "How to Analyze Competitor SEO"
  - "On-Page SEO Checklist"
  - Link to your tool

### 12. Monitoring

- [ ] **Set up Uptime Monitoring**
  - UptimeRobot (free)
  - Pingdom
  - StatusCake

- [ ] **Set up Error Tracking**
  - Sentry
  - LogRocket
  - Bugsnag

- [ ] **Monitor AdSense Revenue**
  - Check daily earnings
  - A/B test ad placements
  - Optimize for viewability

---

## Deployment Steps

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Follow prompts
# 4. Set environment variables (if any)
# 5. Deploy to production
vercel --prod
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod
```

### Option 3: Manual Deployment

```bash
# 1. Build
npm run build

# 2. Export (if using static export)
npm run export

# 3. Upload to your server
# - Upload .next/ directory or out/ directory
# - Configure web server (Nginx/Apache)
```

---

## Post-Deployment

### Verify Everything Works

- [ ] **Test all pages load**
  - Visit https://yourdomain.com
  - Visit https://yourdomain.com/competitor-analyzer

- [ ] **Test tool functionality**
  - Analyze a real URL
  - Verify results display correctly
  - Test comparison mode

- [ ] **Check AdSense**
  - Verify ads appear (may take 24-48 hours)
  - Check browser console for errors
  - Verify no CLS issues (Lighthouse)

- [ ] **Verify SEO**
  - Search for your site in Google (after indexing)
  - Check meta tags in page source
  - Verify structured data

- [ ] **Monitor Performance**
  - Run PageSpeed Insights: https://pagespeed.web.dev/
  - Check real user data after 28 days
  - Monitor Core Web Vitals in Search Console

### Ongoing Maintenance

- [ ] **Weekly:** Check AdSense earnings and performance
- [ ] **Weekly:** Monitor site uptime and errors
- [ ] **Monthly:** Review analytics and user behavior
- [ ] **Monthly:** Update content and SEO
- [ ] **Quarterly:** Run full Lighthouse audit
- [ ] **Yearly:** Renew domain and hosting

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linting

# Testing
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage

# Deployment
vercel                   # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
```

---

## Need Help?

- **AdSense Issues:** https://support.google.com/adsense/
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Support:** https://vercel.com/support
- **SEO Help:** https://developers.google.com/search/docs

---

## Summary

Before going live, complete:
- ✅ Replace all `ca-pub-XXXXXXXXXXXX` with your AdSense ID
- ✅ Replace all `yourdomain.com` with your actual domain
- ✅ Create privacy policy page
- ✅ Enable HTTPS
- ✅ Test thoroughly
- ✅ Submit to Google Search Console

**Once complete, you're ready to launch! 🚀**

# SEO Analyzer Platform - Complete File Structure

This document shows the complete file structure for the expanded SEO platform.

## 📁 Complete Directory Structure

```
seo-analyzer/
├── .env.local                          # Environment variables
├── .env.example                        # Example environment file
├── next.config.js
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .eslintrc.json
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── migrations/                     # Database migrations
│   └── seed.ts                         # Database seeding
│
├── public/
│   ├── images/
│   ├── icons/
│   └── og-image.png                    # Open Graph image
│
├── app/
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Landing page
│   ├── globals.css
│   │
│   ├── (auth)/                         # Auth group layout
│   │   ├── layout.tsx                  # Auth pages layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── [token]/
│   │           └── page.tsx
│   │
│   ├── (marketing)/                    # Marketing pages
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx                # Blog list
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Blog post
│   │   └── docs/
│   │       └── page.tsx
│   │
│   ├── dashboard/                      # Protected dashboard
│   │   ├── layout.tsx                  # Dashboard layout (sidebar, nav)
│   │   ├── page.tsx                    # Dashboard home
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   └── page.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx                # Projects list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Project detail
│   │   │       ├── pages/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── analyses/
│   │   │   ├── page.tsx                # Analysis history
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Analysis detail
│   │   │
│   │   ├── monitoring/
│   │   │   └── page.tsx
│   │   ├── issues/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   │
│   │   ├── team/
│   │   │   └── page.tsx
│   │   └── api-keys/
│   │       └── page.tsx
│   │
│   ├── tools/
│   │   ├── page-analyzer/
│   │   │   └── page.tsx                # Enhanced page analyzer
│   │   ├── site-audit/
│   │   │   └── page.tsx
│   │   ├── keyword-research/
│   │   │   └── page.tsx
│   │   ├── backlink-checker/
│   │   │   └── page.tsx
│   │   ├── rank-tracker/
│   │   │   └── page.tsx
│   │   └── free-page-analyzer/
│   │       └── page.tsx                # Public free tool
│   │
│   ├── admin/                          # Admin panel
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   └── api/                            # API routes
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts            # NextAuth configuration
│       │
│       ├── users/
│       │   ├── route.ts                # GET, POST users
│       │   └── [id]/
│       │       └── route.ts            # GET, PATCH, DELETE user
│       │
│       ├── projects/
│       │   ├── route.ts                # GET, POST projects
│       │   └── [id]/
│       │       ├── route.ts            # GET, PATCH, DELETE project
│       │       └── pages/
│       │           └── route.ts
│       │
│       ├── analyses/
│       │   ├── route.ts                # GET, POST analyses
│       │   └── [id]/
│       │       └── route.ts            # GET analysis
│       │
│       ├── analyze/
│       │   └── route.ts                # POST analyze URL (current)
│       │
│       ├── site-audit/
│       │   └── route.ts                # POST full site audit
│       │
│       ├── keywords/
│       │   ├── research/
│       │   │   └── route.ts            # POST keyword research
│       │   └── track/
│       │       └── route.ts            # POST track rankings
│       │
│       ├── monitoring/
│       │   ├── jobs/
│       │   │   └── route.ts
│       │   └── run/
│       │       └── route.ts
│       │
│       ├── issues/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       │
│       ├── reports/
│       │   ├── route.ts
│       │   ├── generate/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── pdf/
│       │           └── route.ts
│       │
│       ├── alerts/
│       │   └── route.ts
│       │
│       ├── team/
│       │   └── route.ts
│       │
│       ├── webhooks/
│       │   ├── stripe/
│       │   │   └── route.ts            # Stripe webhooks
│       │   └── inngest/
│       │       └── route.ts            # Background jobs
│       │
│       └── public/
│           └── v1/                     # Public API v1
│               ├── analyze/
│               │   └── route.ts
│               └── site-audit/
│                   └── route.ts
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── progress.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   ├── navigation.tsx
│   │   └── mobile-menu.tsx
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── auth-provider.tsx
│   │
│   ├── dashboard/
│   │   ├── overview-stats.tsx
│   │   ├── recent-analyses.tsx
│   │   ├── project-list.tsx
│   │   ├── seo-score-chart.tsx
│   │   └── quick-actions.tsx
│   │
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   ├── project-settings.tsx
│   │   └── page-list.tsx
│   │
│   ├── analyses/
│   │   ├── analysis-card.tsx
│   │   ├── analysis-detail.tsx
│   │   ├── seo-metrics-display.tsx
│   │   ├── comparison-view.tsx
│   │   └── historical-chart.tsx
│   │
│   ├── tools/
│   │   ├── page-analyzer-form.tsx
│   │   ├── site-audit-config.tsx
│   │   ├── keyword-research-tool.tsx
│   │   ├── rank-tracker-widget.tsx
│   │   └── backlink-checker.tsx
│   │
│   ├── issues/
│   │   ├── issue-list.tsx
│   │   ├── issue-card.tsx
│   │   ├── issue-detail.tsx
│   │   └── issue-filter.tsx
│   │
│   ├── monitoring/
│   │   ├── monitoring-schedule.tsx
│   │   ├── monitoring-status.tsx
│   │   └── monitoring-config.tsx
│   │
│   ├── reports/
│   │   ├── report-builder.tsx
│   │   ├── report-preview.tsx
│   │   ├── report-templates.tsx
│   │   └── report-share.tsx
│   │
│   ├── charts/
│   │   ├── line-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── pie-chart.tsx
│   │   └── area-chart.tsx
│   │
│   ├── shared/
│   │   ├── loading-spinner.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── seo-score-badge.tsx
│   │   ├── severity-badge.tsx
│   │   └── data-table.tsx
│   │
│   ├── AdSlot.tsx                      # Current AdSense component
│   ├── AdSenseScript.tsx
│   ├── StructuredData.tsx
│   └── LoadingSkeleton.tsx
│
├── lib/
│   ├── db.ts                           # Prisma client instance
│   ├── auth.ts                         # Auth utilities
│   ├── session.ts                      # Session management
│   │
│   ├── api/
│   │   ├── client.ts                   # API client (frontend)
│   │   └── middleware.ts               # API middleware
│   │
│   ├── analysis/
│   │   ├── page-analyzer.ts            # Core page analysis logic
│   │   ├── site-crawler.ts             # Site crawling logic
│   │   ├── seo-metrics.ts              # SEO metrics calculator
│   │   ├── content-analyzer.ts
│   │   └── comparison-engine.ts
│   │
│   ├── monitoring/
│   │   ├── scheduler.ts                # Job scheduling
│   │   ├── change-detector.ts
│   │   └── alert-manager.ts
│   │
│   ├── integrations/
│   │   ├── google-analytics.ts
│   │   ├── search-console.ts
│   │   ├── pagespeed-insights.ts
│   │   ├── dataforseo.ts               # Keyword data
│   │   └── serpapi.ts                  # SERP tracking
│   │
│   ├── reports/
│   │   ├── generator.ts                # Report generation
│   │   ├── pdf-exporter.ts
│   │   └── templates.ts
│   │
│   ├── email/
│   │   ├── sender.ts                   # Email sending
│   │   └── templates/
│   │       ├── welcome.tsx
│   │       ├── alert.tsx
│   │       └── report.tsx
│   │
│   ├── payments/
│   │   ├── stripe.ts                   # Stripe client
│   │   ├── subscriptions.ts
│   │   └── webhooks.ts
│   │
│   ├── validators/
│   │   ├── auth.ts                     # Zod schemas for auth
│   │   ├── projects.ts
│   │   ├── analyses.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                       # Tailwind class merge
│   │   ├── format.ts                   # Formatting utilities
│   │   ├── date.ts
│   │   └── seo-score.ts
│   │
│   ├── url-validator.ts                # Current URL validator
│   ├── rate-limiter.ts
│   ├── cache.ts                        # Redis cache
│   └── constants.ts
│
├── hooks/
│   ├── use-auth.ts                     # Auth hook
│   ├── use-projects.ts                 # Projects data hook
│   ├── use-analyses.ts
│   ├── use-issues.ts
│   ├── use-monitoring.ts
│   ├── use-toast.ts                    # Toast notifications
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── useUrlValidation.ts             # Current validation hook
│
├── store/
│   ├── auth-store.ts                   # Zustand auth state
│   ├── project-store.ts
│   └── ui-store.ts                     # UI state (sidebar, modals)
│
├── types/
│   ├── index.ts                        # Main types export
│   ├── database.ts                     # Prisma types
│   ├── api.ts                          # API request/response types
│   ├── analysis.ts                     # Analysis types
│   ├── auth.ts
│   ├── projects.ts
│   └── shared.ts                       # Current shared types
│
├── middleware.ts                       # Next.js middleware (auth, redirects)
│
├── inngest/
│   ├── client.ts                       # Inngest client
│   └── functions/
│       ├── scheduled-scans.ts
│       ├── generate-reports.ts
│       ├── send-alerts.ts
│       └── rank-tracking.ts
│
├── emails/                             # React Email templates
│   ├── welcome.tsx
│   ├── alert.tsx
│   ├── report-ready.tsx
│   └── subscription-expiring.tsx
│
├── __tests__/                          # Current tests
│   ├── lib/
│   ├── api/
│   ├── components/
│   └── integration/
│
└── docs/
    ├── MASTER_PROJECT_PLAN.md          # This plan
    ├── API.md                          # API documentation
    ├── DEPLOYMENT.md
    ├── TESTING_STRATEGY.md             # Current
    ├── ADSENSE_SEO_GUIDE.md            # Current
    ├── PERFORMANCE_GUIDE.md            # Current
    └── CONTRIBUTING.md
```

## 🔑 Key Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# External APIs
GOOGLE_API_KEY=""
DATAFORSEO_LOGIN=""
DATAFORSEO_PASSWORD=""
SERPAPI_KEY=""

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# AdSense (current)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=""

# Other
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📝 Migration from Current Structure

### Files to Keep
- ✅ `app/api/analyze/route.ts` (enhance and move to tools)
- ✅ `components/AdSlot.tsx`
- ✅ `components/AdSenseScript.tsx`
- ✅ `components/StructuredData.tsx`
- ✅ `components/LoadingSkeleton.tsx`
- ✅ `lib/url-validator.ts`
- ✅ `hooks/useUrlValidation.ts`
- ✅ `types/shared.ts`
- ✅ All test files
- ✅ All documentation

### Files to Refactor
- `app/competitor-analyzer/page.tsx` → Move to `app/tools/page-analyzer/page.tsx`
- Extract reusable components from current page

### New Files to Create
Everything in the structure above that doesn't exist yet!

---

## 🚀 Getting Started with Phase 1

When you're ready to begin implementation, we'll:

1. **Set up Supabase/Database**
   ```bash
   npm install @prisma/client prisma
   npx prisma init
   # Copy schema from MASTER_PROJECT_PLAN.md
   npx prisma migrate dev --name init
   ```

2. **Add Authentication**
   ```bash
   npm install next-auth @auth/prisma-adapter bcryptjs
   npm install -D @types/bcryptjs
   ```

3. **Install UI Components**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input select dialog
   # ... add more as needed
   ```

4. **Set up Forms**
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

Ready to start building? Let me know which phase you'd like to begin with!

---

*Last updated: 2025-11-17*

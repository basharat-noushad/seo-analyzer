# SEO Analyzer - Vercel Deployment Guide

This guide will help you deploy the SEO Analyzer platform to Vercel with all features working correctly.

## Prerequisites

- GitHub account with this repository
- Vercel account (free or paid)
- PostgreSQL database (recommend Vercel Postgres or Supabase)
- Domain name (optional, but recommended)

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database**
3. Select **Postgres**
4. Choose your region (closest to your users)
5. Click **Create**
6. Copy the connection string (format: `postgres://...`)

### Option B: Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for database to provision
4. Go to **Settings** → **Database**
5. Copy the connection string (choose "Connection Pooling" mode)

### Option C: Other PostgreSQL Providers

- [Neon](https://neon.tech) - Serverless Postgres
- [Railway](https://railway.app) - Simple deployment
- [PlanetScale](https://planetscale.com) - MySQL alternative (requires schema changes)

## Step 2: Prepare Environment Variables

Create a `.env` file locally with these variables (we'll add them to Vercel later):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secure-random-secret-here" # Generate with: openssl rand -base64 32

# Email (Optional - for invitations and notifications)
EMAIL_SERVER="smtp://username:password@smtp.gmail.com:587"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# API Rate Limiting
RATE_LIMIT_ENABLED="true"
```

## Step 3: Deploy to Vercel

### Via Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` or `npx prisma generate && npm run build`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click **Environment Variables**
   - Add all variables from your `.env` file
   - Make sure to add them for **Production**, **Preview**, and **Development**

6. Click **Deploy**

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 4: Database Migration

After first deployment, you need to run database migrations:

### Option A: Using Vercel CLI

```bash
# Connect to your production environment
vercel env pull .env.production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Or use migrate deploy for production
npx prisma migrate deploy
```

### Option B: Using Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Functions**
3. Add a temporary build command:
   ```
   npx prisma generate && npx prisma db push && npm run build
   ```
4. Redeploy
5. After successful deployment, remove the `prisma db push` from build command

### Option C: Manual SQL (Advanced)

1. Generate SQL from your schema:
   ```bash
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > migration.sql
   ```
2. Run the SQL directly on your database

## Step 5: Enable Vercel Analytics

### Web Analytics (Free)

1. Go to your project in Vercel Dashboard
2. Click **Analytics** tab
3. Click **Enable Web Analytics**
4. Analytics will automatically start tracking after next deployment

### Speed Insights (Free)

1. Install the package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to your root layout (already integrated if you follow Step 6)

### Audience Analytics (Paid)

1. Go to **Analytics** → **Audience**
2. Click **Enable**
3. Follow the integration steps

## Step 6: Integrate Vercel Analytics in Code

The analytics will be integrated automatically in the next step.

## Step 7: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain
5. Redeploy

## Step 8: Post-Deployment Checklist

- [ ] Database is accessible and migrations ran successfully
- [ ] Environment variables are set correctly
- [ ] Authentication works (test sign up/login)
- [ ] Email sending works (if configured)
- [ ] Stripe payments work (if configured)
- [ ] API endpoints respond correctly
- [ ] Vercel Analytics is tracking page views
- [ ] Custom domain is working (if configured)
- [ ] SSL certificate is active

## Common Issues & Troubleshooting

### Issue 1: Build Fails with Prisma Error

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
# Update build command to:
npx prisma generate && next build
```

Or add to `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

### Issue 2: Database Connection Fails

**Error**: `Can't reach database server`

**Solutions**:
1. Ensure `DATABASE_URL` has `?sslmode=require` at the end
2. Check if database allows connections from `0.0.0.0/0` (all IPs)
3. For Vercel Postgres, use the connection pooling URL
4. Add `?connection_limit=1` for serverless environments:
   ```
   DATABASE_URL="postgresql://...?sslmode=require&connection_limit=1"
   ```

### Issue 3: NextAuth Callback URL Mismatch

**Error**: `Callback URL mismatch`

**Solution**:
1. Ensure `NEXTAUTH_URL` matches your deployment URL exactly
2. Add both URLs (with and without trailing slash) to OAuth providers
3. For preview deployments, use:
   ```
   NEXTAUTH_URL="${VERCEL_URL}"
   ```

### Issue 4: Environment Variables Not Loading

**Solutions**:
1. Check variable names are exactly correct (case-sensitive)
2. Redeploy after adding new environment variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables
4. Don't commit `.env` files to git

### Issue 5: API Routes Return 500 Error

**Debug Steps**:
1. Check Vercel Function logs:
   - Go to **Deployments** → Select deployment → **Functions**
   - Click on failing function to see logs
2. Ensure serverless function timeout is sufficient:
   - Add to `vercel.json`:
   ```json
   {
     "functions": {
       "app/api/**/*": {
         "maxDuration": 60
       }
     }
   }
   ```

### Issue 6: Module Not Found Errors

**Solution**:
```bash
# Clear Vercel build cache
vercel --force

# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 7: Prisma Client Out of Sync

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Update build script in package.json
"build": "prisma generate && next build"
```

### Issue 8: Images Not Loading

**Solution**:
Add to `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['your-domain.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
}
```

## Performance Optimization

### 1. Enable Edge Runtime (Optional)

For faster API responses, convert some routes to Edge:

```typescript
// app/api/some-route/route.ts
export const runtime = 'edge'
```

### 2. Database Connection Pooling

Use PgBouncer or connection pooling from your provider:
```
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

### 3. Enable Vercel Caching

Add caching headers to static responses:
```typescript
return new Response(data, {
  headers: {
    'Cache-Control': 's-maxage=3600, stale-while-revalidate',
  },
})
```

### 4. Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
vercel logs [deployment-url] --follow

# Or in dashboard
# Deployments → Select deployment → View Function Logs
```

### Enable Debug Mode

Add to environment variables:
```
DEBUG="*"
NODE_ENV="production"
```

### Performance Monitoring

1. Use Vercel Analytics dashboard
2. Enable Speed Insights
3. Check Core Web Vitals scores

## Scaling Considerations

### Free Tier Limits
- 100GB bandwidth/month
- Unlimited deployments
- 100GB-hours serverless function execution

### Pro Tier Benefits
- Custom domains
- Password protection
- Advanced analytics
- Higher limits

### Enterprise Features
- SSO/SAML
- Team collaboration
- Priority support
- SLA guarantees

## Security Checklist

- [ ] All sensitive data in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Database uses SSL
- [ ] API keys are rotated regularly
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] CSP headers configured

## Next Steps

1. Set up monitoring alerts
2. Configure backup strategy for database
3. Set up staging environment (use Preview deployments)
4. Configure CI/CD for automated testing
5. Set up error tracking (Sentry, LogRocket, etc.)

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Community Discord](https://vercel.com/discord)

## Getting Help

If you encounter issues not covered here:

1. Check Vercel Function logs in dashboard
2. Search [Vercel Discussions](https://github.com/vercel/vercel/discussions)
3. Check this project's GitHub Issues
4. Ask in [Next.js Discord](https://nextjs.org/discord)

---

**Last Updated**: 2024
**Vercel Version**: Latest
**Next.js Version**: 14+

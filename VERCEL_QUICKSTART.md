# Vercel Deployment - Quick Start Guide

Get your SEO Analyzer platform deployed to Vercel in 10 minutes.

## Prerequisites

✅ GitHub account with this repository
✅ Vercel account (sign up at [vercel.com](https://vercel.com))
✅ PostgreSQL database (we'll use Vercel Postgres)

## Step 1: Create Database (2 minutes)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database**
3. Select **Postgres** → Click **Create**
4. Wait for provisioning (~1 minute)
5. Copy the **DATABASE_URL** (keep this tab open)

## Step 2: Deploy to Vercel (3 minutes)

### Option A: One-Click Deploy (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/seo-analyzer)

### Option B: Import from GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your repository
4. Click **Import**

## Step 3: Configure Environment Variables (3 minutes)

In the Vercel import screen, add these **required** variables:

```bash
# Database (from Step 1)
DATABASE_URL=postgresql://user:password@host.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-super-secret-random-string-32-chars-minimum
NEXTAUTH_URL=https://your-project.vercel.app
```

Click **Deploy** and wait (~2 minutes).

## Step 4: Run Database Migrations (2 minutes)

After deployment succeeds:

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
npx prisma db push
```

### Option B: Via Vercel Dashboard

1. Go to **Settings** → **Environment Variables**
2. Temporarily update **Build Command** to:
   ```
   prisma generate && prisma db push && next build
   ```
3. Go to **Deployments** → Click **...** → **Redeploy**
4. After successful deployment, revert Build Command to:
   ```
   prisma generate && next build
   ```

## Step 5: Enable Vercel Analytics (1 minute)

1. Go to your project → **Analytics** tab
2. Click **Enable Analytics**
3. Done! Analytics are now tracking (already integrated in code)

## ✅ You're Done!

Your SEO Analyzer is now live at: `https://your-project.vercel.app`

### Test Your Deployment

- [ ] Visit your site
- [ ] Create an account (sign up)
- [ ] Log in
- [ ] Create a test project
- [ ] Run an analysis
- [ ] Check Analytics dashboard shows data

## Common Issues

### Issue: "Prisma Client not initialized"

**Fix**: Redeploy with this build command:
```bash
prisma generate && next build
```

### Issue: "Database connection failed"

**Fix**: Ensure `DATABASE_URL` includes `?sslmode=require&pgbouncer=true`

### Issue: "NextAuth callback URL mismatch"

**Fix**: Update `NEXTAUTH_URL` to match your Vercel URL exactly:
```bash
NEXTAUTH_URL=https://your-actual-project.vercel.app
```

### Issue: "Build fails with module not found"

**Fix**: Clear build cache:
```bash
vercel --force
```

## Optional: Add Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update DNS records (instructions provided)
4. Update `NEXTAUTH_URL` environment variable
5. Redeploy

## Optional: Configure Email (For Invitations)

Add to environment variables:

```bash
EMAIL_SERVER=smtp://username:password@smtp.gmail.com:587
EMAIL_FROM=noreply@yourdomain.com
```

## Optional: Enable Payments (Stripe)

1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com/apikeys)
2. Add to environment variables:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Need Help?

- 📚 Full deployment guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Found an issue? Check logs in Vercel Dashboard → Deployments → Functions
- 💬 Get help: [Vercel Discord](https://vercel.com/discord)

## Next Steps

- [ ] Set up custom domain
- [ ] Configure email service
- [ ] Enable Stripe payments
- [ ] Add team members
- [ ] Set up monitoring alerts
- [ ] Configure backups

---

**Estimated Total Time**: ~10 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free (Vercel Hobby plan + Vercel Postgres free tier)

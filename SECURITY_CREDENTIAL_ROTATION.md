# 🔐 Security: Credential Rotation Guide

**Date Created:** 2025-12-26
**Status:** ⚠️ URGENT - Credentials may have been exposed

## Overview

This guide helps you rotate all credentials that may have been exposed in your `.env` file. Even though the `.env` file is now properly ignored by git, you should rotate all credentials as a security best practice.

---

## 🚨 Critical: Credentials to Rotate

Based on your current `.env` file, the following credentials need to be rotated:

### 1. Database Credentials (Neon PostgreSQL) - **HIGHEST PRIORITY**

**Current Status:** Exposed
**Impact:** Full database access

**Steps to Rotate:**

1. **Go to Neon Console:** https://console.neon.tech/
2. **Navigate to your project:** `ep-spring-mouse-adkk7csi`
3. **Reset Password:**
   - Click on "Settings" → "Database"
   - Click "Reset Password"
   - Generate a new password
   - Copy the new connection string

4. **Update Your Environment:**
   ```bash
   # Update .env.local with new connection string
   DATABASE_URL="postgresql://neondb_owner:NEW_PASSWORD@ep-spring-mouse-adkk7csi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

5. **Update Vercel:**
   - Go to: https://vercel.com/basharat-noushad/seo-analyzer/settings/environment-variables
   - Update `DATABASE_URL` with the new value
   - Redeploy your application

---

### 2. NextAuth Secret - **HIGH PRIORITY**

**Current Status:** Exposed
**Impact:** Session hijacking, authentication bypass

**Steps to Rotate:**

1. **Generate New Secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update .env.local:**
   ```bash
   NEXTAUTH_SECRET="YOUR_NEW_SECRET_HERE"
   ```

3. **Update Vercel:**
   - Go to Vercel Environment Variables
   - Update `NEXTAUTH_SECRET`
   - Redeploy

**Note:** This will invalidate all existing user sessions. Users will need to log in again.

---

### 3. Resend API Key - **MEDIUM PRIORITY**

**Current Status:** Exposed (`re_26ejCJX4_9Jdt2GmnUHjkdLChrQpBRG1Z`)
**Impact:** Unauthorized email sending

**Steps to Rotate:**

1. **Go to Resend Dashboard:** https://resend.com/api-keys
2. **Revoke Old Key:**
   - Find key ending in `...G1Z`
   - Click "Revoke"

3. **Create New Key:**
   - Click "Create API Key"
   - Name: "SEO Analyzer Production"
   - Copy the new key

4. **Update Environment:**
   ```bash
   # .env.local
   RESEND_API_KEY="re_NEW_KEY_HERE"
   ```

5. **Update Vercel:** Same as above

---

### 4. SerpAPI Key - **MEDIUM PRIORITY**

**Current Status:** Exposed (`3b1028460019747e20bfcef08185f3af6f1752b16fb82d5c2202349157d8de6b`)
**Impact:** Unauthorized API usage, billing abuse

**Steps to Rotate:**

1. **Go to SerpAPI Dashboard:** https://serpapi.com/manage-api-key
2. **Regenerate Key:**
   - Click "Regenerate API Key"
   - Copy the new key

3. **Update Environment:**
   ```bash
   # .env.local
   SERPAPI_KEY="YOUR_NEW_SERPAPI_KEY"
   ```

4. **Update Vercel:** Same as above

---

### 5. Inngest Keys - **MEDIUM PRIORITY**

**Current Status:** Exposed (Event Key & Signing Key)
**Impact:** Unauthorized job triggering

**Steps to Rotate:**

1. **Go to Inngest Dashboard:** https://app.inngest.com/
2. **Navigate to Settings → Keys**
3. **Revoke Old Keys:**
   - Event Key ending in `...qwA`
   - Signing Key ending in `...768`

4. **Create New Keys:**
   - Click "Create New Event Key"
   - Click "Create New Signing Key"

5. **Update Environment:**
   ```bash
   INNGEST_EVENT_KEY="NEW_EVENT_KEY"
   INNGEST_SIGNING_KEY="NEW_SIGNING_KEY"
   ```

6. **Update Vercel:** Same as above

---

### 6. Stripe Keys - **LOW PRIORITY** (Test Keys Only)

**Current Status:** Test keys only (low risk)
**Impact:** None (test mode)

**Optional Steps:**
- If using production, rotate via Stripe Dashboard
- For test keys, rotation is optional

---

## ✅ Verification Checklist

After rotating credentials, verify everything works:

- [ ] Local development server starts without errors
- [ ] Database connection works (check dashboard)
- [ ] User authentication works (login/signup)
- [ ] Email notifications work (if using Resend)
- [ ] API integrations work (SerpAPI, Inngest)
- [ ] Production deployment works on Vercel

---

## 🔒 Prevention: Best Practices

To prevent future credential exposure:

### 1. Use .env.local for Local Development

```bash
# Never commit this file
cp .env.example .env.local

# Edit .env.local with your credentials
# This file is already in .gitignore
```

### 2. Use Vercel Environment Variables for Production

- Go to: https://vercel.com/basharat-noushad/seo-analyzer/settings/environment-variables
- Add all production credentials there
- Never commit credentials to git

### 3. Add Pre-commit Hook (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Check for .env file in staged changes
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "Please remove it from staged changes:"
    echo "  git reset HEAD .env"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 4. Use Environment-Specific Files

```
.env.example      # Template (committed to git)
.env.local        # Local development (NOT committed)
.env.production   # Production (NOT committed, use Vercel instead)
```

---

## 📋 Rotation Timeline

| Credential | Priority | Estimated Time | Status |
|------------|----------|----------------|--------|
| Database Password | **HIGH** | 5 minutes | ⏳ Pending |
| NextAuth Secret | **HIGH** | 2 minutes | ⏳ Pending |
| Resend API Key | **MEDIUM** | 3 minutes | ⏳ Pending |
| SerpAPI Key | **MEDIUM** | 2 minutes | ⏳ Pending |
| Inngest Keys | **MEDIUM** | 3 minutes | ⏳ Pending |
| Stripe Keys | **LOW** | Optional | ⏳ Pending |

**Total Time Required:** ~15-20 minutes

---

## 🆘 Need Help?

If you encounter issues during rotation:

1. **Database Connection Issues:**
   - Verify connection string format
   - Check Neon dashboard for connection info
   - Test connection: `npx prisma db push`

2. **Vercel Deployment Issues:**
   - Check deployment logs: https://vercel.com/basharat-noushad/seo-analyzer/deployments
   - Verify all environment variables are set
   - Trigger manual redeploy

3. **Authentication Issues:**
   - Clear browser cookies
   - Check NextAuth configuration
   - Verify `NEXTAUTH_URL` is set correctly

---

## ✅ Completion Checklist

Once you've rotated all credentials:

- [ ] All credentials rotated and updated
- [ ] `.env.local` updated with new credentials
- [ ] Vercel environment variables updated
- [ ] Local development tested
- [ ] Production deployment tested
- [ ] Old credentials revoked/deleted
- [ ] This file can be deleted (optional)

---

## 🔗 Quick Links

- **Neon Console:** https://console.neon.tech/
- **Vercel Settings:** https://vercel.com/basharat-noushad/seo-analyzer/settings/environment-variables
- **Resend Dashboard:** https://resend.com/api-keys
- **SerpAPI Dashboard:** https://serpapi.com/manage-api-key
- **Inngest Dashboard:** https://app.inngest.com/
- **GitHub Repository:** https://github.com/basharat-noushad/seo-analyzer

---

**Remember:** Security is an ongoing process. Rotate credentials regularly and never commit sensitive information to version control.

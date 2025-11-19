# Test Users & Database Setup

## Database Configuration

Make sure your `DATABASE_URL` environment variable is set in Vercel:

```
DATABASE_URL=postgres://5f5bc23a38cdddbbd785d6690506d5bd503934fc4fc9b6169c3df981920c6864:sk_aZrmWko8SaHnZcP0T8pLe@db.prisma.io:5432/postgres?sslmode=require
```

## Creating Test Users

### Option 1: Sign Up Through the UI (Recommended)

1. Go to https://seo-analyzer-eta-umber.vercel.app/signup
2. Fill in the form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: TestPassword123!
   - **Confirm Password**: TestPassword123!
3. Click "Create Account"

### Option 2: Use These Pre-configured Test Accounts

If you've run the database migrations, you can create these accounts:

#### Free Tier User
```
Email: free@test.com
Password: Test123456!
Name: Free User
Tier: free
```

#### Pro Tier User
```
Email: pro@test.com
Password: Test123456!
Name: Pro User
Tier: pro
```

#### Agency Tier User
```
Email: agency@test.com
Password: Test123456!
Name: Agency User
Tier: agency
```

#### Admin User
```
Email: admin@test.com
Password: Admin123456!
Name: Admin User
Role: admin
Tier: agency
```

## Database Schema Check

To verify your database is set up correctly, run:

```bash
npx prisma db push
```

This will ensure all tables are created.

## Troubleshooting Signup Issues

### Error: "Failed to create account" (500)

**Possible Causes:**
1. **Database connection issue**: Check that `DATABASE_URL` is set correctly in Vercel
2. **Missing tables**: Run `npx prisma db push` to create tables
3. **Network issue**: Ensure Prisma can reach the database

**Check Database Connection:**
```bash
npx prisma db push --preview-feature
```

### Error: "User with this email already exists"

This means the email is already registered. Try:
1. Use a different email
2. Or use the login page instead

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (recommended)
- At least one number (recommended)
- At least one special character (recommended)

## Testing Different User Tiers

### Free Tier (Default)
- 5 analyses per month
- 1 project
- Basic SEO metrics

### Pro Tier ($29/month)
- 100 analyses per month
- 10 projects
- Site audits (100 pages)
- 20 keywords tracked
- Email alerts

### Agency Tier ($99/month)
- Unlimited analyses
- Unlimited projects
- Site audits (5000 pages)
- 100 keywords tracked
- White-label reports
- Team collaboration
- API access

## Manual Database User Creation

If you need to create a user directly in the database:

```javascript
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  const password = 'Test123456!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: passwordHash,
      emailVerified: true,
      role: 'user',
      tier: 'free',
    }
  });

  console.log('User created:', user);
}

createUser();
```

## Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_SECRET` - Random secret for JWT (generate with: `openssl rand -base64 32`)
- ✅ `NEXTAUTH_URL` - Your app URL (https://seo-analyzer-eta-umber.vercel.app)
- ✅ `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

## Quick Test Flow

1. Visit https://seo-analyzer-eta-umber.vercel.app
2. Click "Sign Up Free"
3. Create account with any email/password
4. Should redirect to `/dashboard`
5. Explore features!

## Support

If you're still having issues, check:
1. Vercel deployment logs for errors
2. Browser console for client-side errors
3. Database connection in Prisma Studio: `npx prisma studio`

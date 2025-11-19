# Phase 1 Setup Guide - Database & Authentication

This guide will walk you through setting up the database and authentication for Phase 1.

## ✅ What's Already Done

- ✅ Prisma installed and configured
- ✅ Complete database schema created (`prisma/schema.prisma`)
- ✅ Prisma client singleton created (`lib/db.ts`)
- ✅ Environment variables documented (`.env.example`)

## 🚀 What You Need to Do

### Step 1: Set Up PostgreSQL Database

You have several options for hosting your PostgreSQL database:

#### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create a new account (free tier available)
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)

#### Option B: Neon
1. Go to https://neon.tech
2. Create account and new project
3. Copy the connection string

#### Option C: Railway
1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy connection string

### Step 2: Configure Environment Variables

1. **Create `.env.local` file** in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. **Update DATABASE_URL** with your connection string:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

   Copy the output and add to `.env.local`:
   ```bash
   NEXTAUTH_SECRET="<paste-generated-secret-here>"
   ```

4. **Update NEXTAUTH_URL** (keep as is for now):
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   ```

### Step 3: Run Database Migrations

Now that you have a database connection, run the Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run the initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create all the tables in your database
# 2. Generate the Prisma Client types
# 3. Apply the schema to your database
```

### Step 4: Verify Database Setup

Check that everything is working:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a browser at http://localhost:5555 where you can see all your tables.

### Step 5: (Optional) Seed Initial Data

If you want to add some initial data for testing, create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test user
  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      emailVerified: true,
      tier: 'pro', // Give pro access for testing
    },
  })

  console.log('Created user:', user.email)

  // Create a test project
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'My Website',
      domain: 'https://example.com',
      description: 'Test project',
    },
  })

  console.log('Created project:', project.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Then add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run the seed:
```bash
npx prisma db seed
```

## 📋 Environment Variables Checklist

Before proceeding to authentication setup, make sure you have:

- [ ] `DATABASE_URL` - Your PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - http://localhost:3000
- [ ] `NEXTAUTH_SECRET` - Generated random string

### Optional (for later):
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (for Google OAuth)
- [ ] `STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (for billing)

## ✅ Verification

You should now have:

1. ✅ PostgreSQL database running (Supabase/Neon/Railway)
2. ✅ `.env.local` file with DATABASE_URL and NEXTAUTH_SECRET
3. ✅ Database tables created (run `npx prisma studio` to verify)
4. ✅ Prisma Client generated

## 🚨 Common Issues

### Issue: "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure your database is running
- Check firewall/network settings

### Issue: "Environment variable not found: DATABASE_URL"
- Make sure `.env.local` exists in the root directory
- Verify the variable name is exactly `DATABASE_URL`
- Restart your development server

### Issue: Prisma Client not generated
```bash
npx prisma generate
```

### Issue: Migration fails
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name init
```

## 📚 Next Steps

Once database setup is complete, you're ready for:
- **Authentication**: Install NextAuth.js and create login/signup pages
- **Dashboard**: Build the dashboard layout
- **Projects**: Create project management features

See `PHASE_1_QUICKSTART.md` for detailed implementation steps.

---

## 🆘 Need Help?

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **NextAuth Docs**: https://next-auth.js.org

---

*Last updated: 2025-11-17*

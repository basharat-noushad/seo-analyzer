# Phase 1 Implementation - Quick Start Guide

This guide will help you get started with **Phase 1: Foundation & Authentication** (Weeks 1-3).

## 🎯 Phase 1 Goals

By the end of Phase 1, you'll have:
- ✅ Database set up with Prisma + PostgreSQL
- ✅ User authentication (email/password + OAuth)
- ✅ Basic dashboard with navigation
- ✅ Project management (CRUD)
- ✅ Subscription/billing with Stripe
- ✅ Usage tracking

---

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A PostgreSQL database (Supabase account recommended)
- Stripe account (for payments)
- Git repository set up

---

## Week 1: Infrastructure Setup

### Step 1: Set Up Database (Supabase)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your connection string

2. **Install Prisma**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   npx prisma init
   ```

3. **Update `.env.local`**
   ```bash
   # Copy from .env.example
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```

4. **Create Prisma Schema**

   Copy the database schema from `MASTER_PROJECT_PLAN.md` into `prisma/schema.prisma`:

   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model User {
     id                String    @id @default(uuid())
     email             String    @unique
     passwordHash      String?   @map("password_hash")
     name              String?
     avatarUrl         String?   @map("avatar_url")
     emailVerified     Boolean   @default(false) @map("email_verified")
     role              String    @default("user")
     tier              String    @default("free")
     stripeCustomerId  String?   @map("stripe_customer_id")
     createdAt         DateTime  @default(now()) @map("created_at")
     updatedAt         DateTime  @updatedAt @map("updated_at")

     projects          Project[]
     analyses          Analysis[]
     alerts            Alert[]
     reports           Report[]
     teamMembers       TeamMember[]
     apiKeys           ApiKey[]
     usageLogs         UsageLog[]
     createdTeamMembers TeamMember[] @relation("InvitedBy")

     @@map("users")
   }

   model Project {
     id                   String    @id @default(uuid())
     userId               String    @map("user_id")
     name                 String
     domain               String
     description          String?
     logoUrl              String?   @map("logo_url")
     monitoringEnabled    Boolean   @default(false) @map("monitoring_enabled")
     monitoringFrequency  String?   @map("monitoring_frequency")
     lastScanAt           DateTime? @map("last_scan_at")
     createdAt            DateTime  @default(now()) @map("created_at")
     updatedAt            DateTime  @updatedAt @map("updated_at")

     user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
     pages                ProjectPage[]
     analyses             Analysis[]
     issues               Issue[]
     keywords             Keyword[]
     monitoringJobs       MonitoringJob[]
     alerts               Alert[]
     reports              Report[]
     teamMembers          TeamMember[]

     @@index([userId])
     @@index([domain])
     @@map("projects")
   }

   // Add other models from MASTER_PROJECT_PLAN.md...
   ```

5. **Run Migration**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. **Create Prisma Client Singleton**

   Create `lib/db.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined
   }

   export const prisma = globalForPrisma.prisma ?? new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

### Step 2: Set Up Authentication

1. **Install Dependencies**
   ```bash
   npm install next-auth@beta @auth/prisma-adapter bcryptjs
   npm install -D @types/bcryptjs
   ```

2. **Update `.env.local`**
   ```bash
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

   # Optional OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Create NextAuth Configuration**

   Create `app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import NextAuth from "next-auth"
   import { PrismaAdapter } from "@auth/prisma-adapter"
   import CredentialsProvider from "next-auth/providers/credentials"
   import GoogleProvider from "next-auth/providers/google"
   import bcrypt from "bcryptjs"
   import { prisma } from "@/lib/db"

   export const authOptions = {
     adapter: PrismaAdapter(prisma),
     providers: [
       CredentialsProvider({
         name: "Credentials",
         credentials: {
           email: { label: "Email", type: "email" },
           password: { label: "Password", type: "password" }
         },
         async authorize(credentials) {
           if (!credentials?.email || !credentials?.password) {
             throw new Error("Missing credentials")
           }

           const user = await prisma.user.findUnique({
             where: { email: credentials.email }
           })

           if (!user || !user.passwordHash) {
             throw new Error("Invalid credentials")
           }

           const isValid = await bcrypt.compare(
             credentials.password,
             user.passwordHash
           )

           if (!isValid) {
             throw new Error("Invalid credentials")
           }

           return {
             id: user.id,
             email: user.email,
             name: user.name,
             role: user.role
           }
         }
       }),
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
     ],
     session: {
       strategy: "jwt",
     },
     pages: {
       signIn: "/login",
       error: "/login",
     },
     callbacks: {
       async jwt({ token, user }) {
         if (user) {
           token.id = user.id
           token.role = user.role
         }
         return token
       },
       async session({ session, token }) {
         if (session.user) {
           session.user.id = token.id
           session.user.role = token.role
         }
         return session
       },
     },
   }

   const handler = NextAuth(authOptions)
   export { handler as GET, handler as POST }
   ```

4. **Create Auth Utilities**

   Create `lib/auth.ts`:
   ```typescript
   import { getServerSession } from "next-auth"
   import { authOptions } from "@/app/api/auth/[...nextauth]/route"
   import { prisma } from "./db"

   export async function getCurrentUser() {
     const session = await getServerSession(authOptions)

     if (!session?.user?.email) {
       return null
     }

     const user = await prisma.user.findUnique({
       where: { email: session.user.email },
       select: {
         id: true,
         email: true,
         name: true,
         role: true,
         tier: true,
         avatarUrl: true,
       }
     })

     return user
   }

   export async function requireAuth() {
     const user = await getCurrentUser()

     if (!user) {
       throw new Error("Unauthorized")
     }

     return user
   }
   ```

5. **Create Middleware for Protected Routes**

   Create `middleware.ts`:
   ```typescript
   import { withAuth } from "next-auth/middleware"
   import { NextResponse } from "next/server"

   export default withAuth(
     function middleware(req) {
       // Allow request to proceed
       return NextResponse.next()
     },
     {
       callbacks: {
         authorized: ({ token, req }) => {
           // Check if trying to access protected routes
           if (req.nextUrl.pathname.startsWith("/dashboard")) {
             return !!token
           }
           if (req.nextUrl.pathname.startsWith("/tools")) {
             return !!token
           }
           return true
         },
       },
     }
   )

   export const config = {
     matcher: ["/dashboard/:path*", "/tools/:path*", "/api/:path*"],
   }
   ```

### Step 3: Create Auth Pages

1. **Install shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input label card
   ```

2. **Create Login Page**

   Create `app/(auth)/login/page.tsx`:
   ```typescript
   "use client"

   import { useState } from "react"
   import { signIn } from "next-auth/react"
   import { useRouter } from "next/navigation"
   import { Button } from "@/components/ui/button"
   import { Input } from "@/components/ui/input"
   import { Label } from "@/components/ui/label"
   import { Card } from "@/components/ui/card"

   export default function LoginPage() {
     const router = useRouter()
     const [email, setEmail] = useState("")
     const [password, setPassword] = useState("")
     const [error, setError] = useState("")
     const [loading, setLoading] = useState(false)

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault()
       setError("")
       setLoading(true)

       try {
         const result = await signIn("credentials", {
           email,
           password,
           redirect: false,
         })

         if (result?.error) {
           setError("Invalid email or password")
         } else {
           router.push("/dashboard")
           router.refresh()
         }
       } catch (error) {
         setError("Something went wrong")
       } finally {
         setLoading(false)
       }
     }

     return (
       <div className="flex min-h-screen items-center justify-center">
         <Card className="w-full max-w-md p-8">
           <h1 className="text-2xl font-bold mb-6">Sign In</h1>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>

             <div>
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>

             {error && (
               <p className="text-sm text-red-500">{error}</p>
             )}

             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? "Signing in..." : "Sign In"}
             </Button>
           </form>

           <div className="mt-4">
             <Button
               variant="outline"
               className="w-full"
               onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
             >
               Sign in with Google
             </Button>
           </div>

           <p className="mt-4 text-center text-sm">
             Don't have an account?{" "}
             <a href="/signup" className="text-primary hover:underline">
               Sign up
             </a>
           </p>
         </Card>
       </div>
     )
   }
   ```

3. **Create Signup Page**

   Similar structure to login, but with user creation logic.

---

## Week 2: Dashboard & Projects

### Step 1: Create Dashboard Layout

1. **Install Additional UI Components**
   ```bash
   npx shadcn-ui@latest add dropdown-menu avatar sidebar
   ```

2. **Create Dashboard Layout**

   Create `app/dashboard/layout.tsx`:
   ```typescript
   import { redirect } from "next/navigation"
   import { getCurrentUser } from "@/lib/auth"
   import { Sidebar } from "@/components/layout/sidebar"
   import { Header } from "@/components/layout/header"

   export default async function DashboardLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     const user = await getCurrentUser()

     if (!user) {
       redirect("/login")
     }

     return (
       <div className="flex h-screen">
         <Sidebar user={user} />
         <div className="flex-1 flex flex-col overflow-hidden">
           <Header user={user} />
           <main className="flex-1 overflow-y-auto p-6">
             {children}
           </main>
         </div>
       </div>
     )
   }
   ```

### Step 2: Create Project Management

1. **Create Projects API**

   Create `app/api/projects/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from "next/server"
   import { requireAuth } from "@/lib/auth"
   import { prisma } from "@/lib/db"
   import { z } from "zod"

   const projectSchema = z.object({
     name: z.string().min(1).max(255),
     domain: z.string().url(),
     description: z.string().optional(),
   })

   export async function GET(req: NextRequest) {
     try {
       const user = await requireAuth()

       const projects = await prisma.project.findMany({
         where: { userId: user.id },
         orderBy: { createdAt: "desc" },
       })

       return NextResponse.json({ projects })
     } catch (error) {
       return NextResponse.json(
         { error: "Unauthorized" },
         { status: 401 }
       )
     }
   }

   export async function POST(req: NextRequest) {
     try {
       const user = await requireAuth()
       const body = await req.json()

       const validatedData = projectSchema.parse(body)

       // Check tier limits
       const projectCount = await prisma.project.count({
         where: { userId: user.id }
       })

       const limits = {
         free: 1,
         pro: 10,
         agency: Infinity,
       }

       if (projectCount >= limits[user.tier as keyof typeof limits]) {
         return NextResponse.json(
           { error: "Project limit reached. Please upgrade." },
           { status: 403 }
         )
       }

       const project = await prisma.project.create({
         data: {
           ...validatedData,
           userId: user.id,
         },
       })

       return NextResponse.json({ project }, { status: 201 })
     } catch (error) {
       if (error instanceof z.ZodError) {
         return NextResponse.json(
           { error: error.errors },
           { status: 400 }
         )
       }
       return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
       )
     }
   }
   ```

2. **Create Projects Page**

   Create `app/dashboard/projects/page.tsx`:
   ```typescript
   import { getCurrentUser } from "@/lib/auth"
   import { prisma } from "@/lib/db"
   import { ProjectCard } from "@/components/projects/project-card"
   import { Button } from "@/components/ui/button"
   import Link from "next/link"

   export default async function ProjectsPage() {
     const user = await getCurrentUser()

     if (!user) {
       return null
     }

     const projects = await prisma.project.findMany({
       where: { userId: user.id },
       orderBy: { createdAt: "desc" },
     })

     return (
       <div>
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold">Projects</h1>
           <Link href="/dashboard/projects/new">
             <Button>Create Project</Button>
           </Link>
         </div>

         {projects.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-gray-500 mb-4">No projects yet</p>
             <Link href="/dashboard/projects/new">
               <Button>Create Your First Project</Button>
             </Link>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {projects.map((project) => (
               <ProjectCard key={project.id} project={project} />
             ))}
           </div>
         )}
       </div>
     )
   }
   ```

---

## Week 3: Billing & Subscription

### Step 1: Set Up Stripe

1. **Install Stripe**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Update `.env.local`**
   ```bash
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. **Create Stripe Client**

   Create `lib/payments/stripe.ts`:
   ```typescript
   import Stripe from "stripe"

   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: "2023-10-16",
   })

   export const getStripeCustomerId = async (userId: string, email: string) => {
     const user = await prisma.user.findUnique({
       where: { id: userId },
     })

     if (user?.stripeCustomerId) {
       return user.stripeCustomerId
     }

     const customer = await stripe.customers.create({
       email,
       metadata: { userId },
     })

     await prisma.user.update({
       where: { id: userId },
       data: { stripeCustomerId: customer.id },
     })

     return customer.id
   }
   ```

4. **Create Subscription Plans**

   In Stripe Dashboard:
   - Create products: "Pro" and "Agency"
   - Add pricing: $29/month and $99/month
   - Note the price IDs

5. **Create Checkout API**

   Create `app/api/billing/checkout/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from "next/server"
   import { requireAuth } from "@/lib/auth"
   import { stripe, getStripeCustomerId } from "@/lib/payments/stripe"

   export async function POST(req: NextRequest) {
     try {
       const user = await requireAuth()
       const { priceId } = await req.json()

       const customerId = await getStripeCustomerId(user.id, user.email)

       const session = await stripe.checkout.sessions.create({
         customer: customerId,
         mode: "subscription",
         payment_method_types: ["card"],
         line_items: [{ price: priceId, quantity: 1 }],
         success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
         cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
       })

       return NextResponse.json({ url: session.url })
     } catch (error) {
       return NextResponse.json(
         { error: "Failed to create checkout session" },
         { status: 500 }
       )
     }
   }
   ```

### Step 2: Usage Tracking

1. **Create Usage Tracking Utility**

   Create `lib/usage/tracker.ts`:
   ```typescript
   import { prisma } from "@/lib/db"

   const TIER_LIMITS = {
     free: { analyses: 5 },
     pro: { analyses: 100 },
     agency: { analyses: Infinity },
   }

   export async function trackUsage(userId: string, action: string) {
     await prisma.usageLog.create({
       data: {
         userId,
         action,
         creditsUsed: 1,
       },
     })
   }

   export async function checkUsageLimit(userId: string, action: string) {
     const user = await prisma.user.findUnique({
       where: { id: userId },
     })

     if (!user) throw new Error("User not found")

     const startOfMonth = new Date()
     startOfMonth.setDate(1)
     startOfMonth.setHours(0, 0, 0, 0)

     const usage = await prisma.usageLog.count({
       where: {
         userId,
         action,
         createdAt: { gte: startOfMonth },
       },
     })

     const limit = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS]?.analyses

     return {
       used: usage,
       limit,
       remaining: limit === Infinity ? Infinity : limit - usage,
       canUse: usage < limit,
     }
   }
   ```

---

## 🧪 Testing Phase 1

After completing Phase 1, test the following flows:

### Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] User receives verification email (if implemented)
- [ ] User can sign in with email/password
- [ ] User can sign in with Google OAuth
- [ ] User can reset password
- [ ] Unauthorized users are redirected to login
- [ ] Dashboard displays after login
- [ ] User can create a project
- [ ] Free tier users cannot create more than 1 project
- [ ] User can view project list
- [ ] User can update project details
- [ ] User can delete a project
- [ ] User can view billing page
- [ ] User can start checkout for Pro plan
- [ ] Stripe checkout works correctly
- [ ] Subscription updates after successful payment
- [ ] Usage tracking increments correctly

---

## 🎉 Phase 1 Complete!

Once all tests pass, you're ready to move to **Phase 2: Enhanced Analysis Tools**.

**What's Next?**
- Enhance the existing page analyzer
- Add full site audit capability
- Integrate with external APIs

---

Need help with any step? Refer to:
- `MASTER_PROJECT_PLAN.md` for overall vision
- `PROJECT_FILE_STRUCTURE.md` for file organization
- Official docs: Next.js, Prisma, NextAuth, Stripe

---

*Last updated: 2025-11-17*

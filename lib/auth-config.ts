/**
 * NextAuth Configuration
 *
 * Centralized auth configuration that can be imported by both
 * the auth route and server components
 */

import NextAuth, { type Session, type User, type Account } from "next-auth"
import { type JWT } from "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password")
        }

        const isValid = await bcrypt.compare(password, user.passwordHash as string)

        if (!isValid) {
          throw new Error("Invalid email or password")
        }

        // Email verification check (only enforced when REQUIRE_EMAIL_VERIFICATION=true)
        if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.emailVerified) {
          throw new Error("Please verify your email before signing in. Check your inbox for the verification link.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          tier: user.tier,
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Auto-verify email for OAuth users
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          emailVerified: profile.email_verified,
          role: "user",
          tier: "free",
        }
      }
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/login",
  },

  trustHost: true, // Required for Vercel deployment

  useSecureCookies: process.env.NODE_ENV === 'production',

  callbacks: {
    // JWT callback - add custom fields to token
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: Session }) {
      // Initial sign in
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.tier = user.tier
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },

    // Session callback - add custom fields to session
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tier = token.tier as string
      }
      return session
    },

    // Sign in callback - handle OAuth first-time users
    async signIn({ user, account }: { user: User; account: Account | null }) {
      // Allow credentials sign in
      if (account?.provider === "credentials") {
        return true
      }

      // For OAuth providers, ensure user exists in database
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        // Create user if doesn't exist
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              avatarUrl: user.image,
              emailVerified: true,
              emailVerifiedAt: new Date(),
              role: "user",
              tier: "free",
            }
          })
        } else {
          // Update existing user's avatar if changed
          if (user.image && existingUser.avatarUrl !== user.image) {
            await prisma.user.update({
              where: { email: user.email },
              data: { avatarUrl: user.image }
            })
          }
        }
      }

      return true
    },
  },

  events: {},

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
}

// Export configured NextAuth instance
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any)

// Export getServerSession for backward compatibility
export const getServerSession = auth

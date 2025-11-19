/**
 * NextAuth Configuration
 *
 * Centralized auth configuration that can be imported by both
 * the auth route and server components
 */

import NextAuth from "next-auth"
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
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password")
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash as string
        )

        if (!isValid) {
          throw new Error("Invalid email or password")
        }

        // Email verification check removed - auto-verify on signup for now
        // TODO: Implement proper email verification system

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

  callbacks: {
    // JWT callback - add custom fields to token
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tier = user.tier
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      // Fetch latest user data on each request (optional - can be expensive)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            role: true,
            tier: true,
            name: true,
            avatarUrl: true,
          }
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.tier = dbUser.tier
          token.name = dbUser.name
          token.picture = dbUser.avatarUrl
        }
      }

      return token
    },

    // Session callback - add custom fields to session
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tier = token.tier as string
      }
      return session
    },

    // Sign in callback - handle OAuth first-time users
    async signIn({ user, account, profile }: any) {
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

  events: {
    // Track user sign in
    async signIn({ user }: any) {
      console.log(`User signed in: ${user.email}`)
    },

    // Update last sign in
    async session({ session }: any) {
      if (session.user?.email) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { updatedAt: new Date() }
        })
      }
    },
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
}

// Export configured NextAuth instance
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any)

// Export getServerSession for backward compatibility
export const getServerSession = auth

/**
 * Edge-compatible NextAuth configuration for middleware
 *
 * This is a minimal auth config for Edge Runtime that only validates
 * JWT tokens without database access, keeping the bundle size small.
 */

import NextAuth from "next-auth"

export const { auth } = NextAuth({
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/login",
  },
  callbacks: {
    // Minimal JWT callback for edge - no database access
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tier = (user as any).tier
      }
      return token
    },
    // Minimal session callback for edge
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tier = token.tier as string
      }
      return session
    },
  },
  // Disable debug in production
  debug: false,
})

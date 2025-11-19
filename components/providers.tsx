"use client"

/**
 * Providers Component
 *
 * Wraps the app with necessary providers like NextAuth SessionProvider
 */

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

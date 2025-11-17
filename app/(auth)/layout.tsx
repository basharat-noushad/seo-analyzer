/**
 * Authentication Pages Layout
 *
 * Shared layout for login, signup, and password reset pages.
 * Centers the auth forms and provides consistent styling.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Authentication',
    template: '%s | SEO Analyzer',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SEO Analyzer
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Improve your website's search engine visibility
          </p>
        </div>

        {/* Auth Form */}
        {children}
      </div>
    </div>
  )
}

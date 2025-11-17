/**
 * Next.js Middleware
 *
 * Handles authentication and authorization for protected routes.
 * Runs before every request to check if user is authenticated.
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Check if accessing admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Check if accessing protected API routes
    if (path.startsWith("/api/")) {
      // Allow public APIs
      if (
        path.startsWith("/api/auth") ||
        path.startsWith("/api/public")
      ) {
        return NextResponse.next()
      }

      // Require authentication for other APIs
      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    // Allow request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes - always allow
        if (
          path === "/" ||
          path === "/features" ||
          path === "/pricing" ||
          path === "/blog" ||
          path.startsWith("/blog/") ||
          path === "/docs" ||
          path === "/login" ||
          path === "/signup" ||
          path === "/forgot-password" ||
          path.startsWith("/reset-password") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/public") ||
          path.startsWith("/tools/free-page-analyzer")
        ) {
          return true
        }

        // Protected routes - require authentication
        if (
          path.startsWith("/dashboard") ||
          path.startsWith("/tools") ||
          path.startsWith("/admin") ||
          path.startsWith("/api/")
        ) {
          return !!token
        }

        // Default: allow
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
}

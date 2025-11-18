/**
 * Next.js Middleware
 *
 * Handles authentication and authorization for protected routes.
 * Runs before every request to check if user is authenticated.
 *
 * Note: Uses lightweight token checking to stay within Edge Runtime size limits.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Public routes - always allow
  const publicRoutes = [
    "/",
    "/features",
    "/pricing",
    "/blog",
    "/docs",
    "/login",
    "/signup",
    "/forgot-password",
    "/competitor-analyzer",
    "/privacy",
    "/terms",
    "/contact",
  ]

  const isPublicRoute = publicRoutes.some((route) => path === route) ||
    path.startsWith("/blog/") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/public") ||
    path.startsWith("/api/analyze") ||
    path.startsWith("/tools/free-page-analyzer")

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/tools") ||
    path.startsWith("/admin") ||
    (path.startsWith("/api/") && !path.startsWith("/api/auth") && !path.startsWith("/api/public"))

  if (isProtectedRoute) {
    // Use getToken for Edge-compatible auth checking
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      // For API routes, return 401
      if (path.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      // For pages, redirect to login
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check admin routes
    if (path.startsWith("/admin")) {
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  }

  return NextResponse.next()
}

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

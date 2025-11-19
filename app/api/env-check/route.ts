/**
 * Environment Check API
 *
 * Shows which critical environment variables are set (for debugging)
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET ✓' : 'MISSING ✗',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET ✓' : 'MISSING ✗',
    },
    note: 'If NEXTAUTH_SECRET is missing, authentication will not work'
  })
}

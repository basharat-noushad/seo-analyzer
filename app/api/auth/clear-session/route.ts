/**
 * Clear Session API
 *
 * Helper endpoint to clear session cookies when debugging auth issues
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = cookies()

    // Clear all NextAuth cookies
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
    ]

    cookieNames.forEach(name => {
      cookieStore.delete(name)
    })

    return NextResponse.json({
      success: true,
      message: 'Session cleared successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}

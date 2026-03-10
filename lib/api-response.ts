/**
 * Shared API response helpers
 *
 * All API routes must use these helpers so error and success shapes
 * are consistent across the entire codebase.
 */

import { NextResponse } from 'next/server'

export interface ApiErrorBody {
  error: true
  message: string
  code?: string
  timestamp: string
}

export interface ApiSuccessBody {
  timestamp: string
  [key: string]: unknown
}

export function apiError(
  message: string,
  status: number,
  code?: string
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: true as const, message, code, timestamp: new Date().toISOString() },
    { status }
  )
}

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200
): NextResponse<T & { timestamp: string }> {
  return NextResponse.json(
    { ...data, timestamp: new Date().toISOString() },
    { status }
  )
}

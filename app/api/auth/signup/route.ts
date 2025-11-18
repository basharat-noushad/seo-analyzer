/**
 * Sign Up API Route
 *
 * Creates a new user account in the database.
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: true, // Auto-verify for now (TODO: implement email verification)
        emailVerifiedAt: new Date(),
        role: "user",
        tier: "free",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Account created successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Signup error:", error)

    // Provide more detailed error information
    const errorMessage = error.message || "Failed to create account"
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      message: error.message,
      code: error.code,
      meta: error.meta
    } : undefined

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

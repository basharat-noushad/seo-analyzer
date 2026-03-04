/**
 * Sign Up API Route
 *
 * Creates a new user account in the database.
 */

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
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
        emailVerified: false,
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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    await prisma.verificationToken.create({
      data: {
        identifier: `email_verify:${email}`,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email")
      const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`
      await sendVerificationEmail(email, name, verificationUrl)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
    }

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Account created. Please check your email to verify your account.",
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

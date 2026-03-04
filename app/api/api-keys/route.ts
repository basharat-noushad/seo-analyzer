import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import crypto from "crypto"

/**
 * GET /api/api-keys
 * List user's API keys (with masked keys)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/api-keys
 * Generate a new API key
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, permissions, expiresInDays } = body

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      )
    }

    // Check API access tier
    const { checkUsageLimit } = await import("@/lib/usage-limits")
    const usageCheck = await checkUsageLimit(session.user.id, "use_api")
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message, code: "TIER_LIMIT_REACHED" },
        { status: 403 }
      )
    }

    // Generate a secure API key
    // Format: sk_live_<32-char-random>
    const randomPart = nanoid(32)
    const apiKey = `sk_live_${randomPart}`

    // Hash the key for storage (we never store the plain key)
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

    // Store only the prefix for display
    const keyPrefix = `${apiKey.substring(0, 12)}...`

    // Calculate expiry date if provided
    let expiresAt = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    // Create API key record
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        keyPrefix,
        permissions: permissions || null,
        expiresAt,
      },
    })

    // Return the full key ONLY once (user must copy it now)
    return NextResponse.json(
      {
        apiKey: {
          ...newApiKey,
          key: apiKey, // Full key shown only once
        },
        message:
          "Important: Copy this key now. You won't be able to see it again.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}

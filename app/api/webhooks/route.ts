import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import crypto from "crypto"

/**
 * GET /api/webhooks
 * List user's webhooks
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const where: any = { userId: session.user.id }
    if (projectId) where.projectId = projectId

    const webhooks = await prisma.webhook.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        isActive: true,
        projectId: true,
        lastTriggeredAt: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/webhooks
 * Create a new webhook
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, url, events, projectId, isActive = true } = body

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: "Name, URL, and events are required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Validate events
    const validEvents = [
      "analysis_completed",
      "analysis_failed",
      "rank_changed",
      "issue_detected",
      "issue_resolved",
      "monitoring_triggered",
      "project_created",
      "project_updated",
    ]

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(", ")}` },
        { status: 400 }
      )
    }

    // If projectId provided, verify ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }
    }

    // Generate signing secret for webhook verification
    const secret = nanoid(64)

    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        name,
        url,
        events,
        secret,
        isActive,
      },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        secret: true, // Show secret only on creation
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        webhook,
        message:
          "Important: Save the secret. You'll need it to verify webhook signatures.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating webhook:", error)
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * GET /api/webhooks/[id]
 * Get webhook details including recent deliveries
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error("Error fetching webhook:", error)
    return NextResponse.json(
      { error: "Failed to fetch webhook" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/webhooks/[id]
 * Update webhook settings
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    const body = await req.json()
    const { name, url, events, isActive } = body

    // Validate URL if provided
    if (url) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }
    }

    const updatedWebhook = await prisma.webhook.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(events && { events }),
        ...(isActive !== undefined && { isActive }),
        // Reset failure count if reactivating
        ...(isActive && !webhook.isActive && { failureCount: 0 }),
      },
    })

    return NextResponse.json({ webhook: updatedWebhook })
  } catch (error) {
    console.error("Error updating webhook:", error)
    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/webhooks/[id]
 * Delete a webhook
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    await prisma.webhook.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    )
  }
}

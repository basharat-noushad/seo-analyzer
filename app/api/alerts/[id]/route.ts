import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/alerts/[id]
 * Update a single alert (typically to mark as read/unread)
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

    const body = await req.json()
    const { read } = body

    // Get alert and verify ownership
    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
    })

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update alert
    const updated = await prisma.alert.update({
      where: { id: params.id },
      data: {
        read: read !== false,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    })

    return NextResponse.json({ alert: updated })
  } catch (error: any) {
    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/alerts/[id]
 * Delete a single alert
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

    // Get alert and verify ownership
    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
    })

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Delete alert
    await prisma.alert.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting alert:", error)
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    )
  }
}

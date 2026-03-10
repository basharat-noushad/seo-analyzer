import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * POST /api/alerts/mark-all-read
 * Mark all alerts as read for the current user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await prisma.alert.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({
      message: `${result.count} alert(s) marked as read`,
      count: result.count,
    })
  } catch (error) {
    console.error("Error marking alerts as read:", error)
    return NextResponse.json(
      { error: "Failed to mark alerts as read" },
      { status: 500 }
    )
  }
}

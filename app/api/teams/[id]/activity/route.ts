import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * GET /api/teams/[id]/activity
 * Get activity logs for a team
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

    // Verify user has access to this team
    const team = await prisma.team.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or access denied" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const action = searchParams.get("action")

    const where: Prisma.ActivityLogWhereInput = { teamId: params.id }
    if (action) {
      where.action = action
    }

    const [activityLogs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      activityLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * GET /api/teams/[id]
 * Get a specific team with details
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

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            inviter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                domain: true,
                seoScore: true,
                lastScanAt: true,
                createdAt: true,
              },
            },
          },
        },
        invitations: {
          where: {
            acceptedAt: null,
            expiresAt: { gt: new Date() },
          },
          include: {
            inviter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
            activityLogs: true,
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if user has access to this team
    const isOwner = team.ownerId === session.user.id
    const isMember = team.members.some((m: any) => m.userId === session.user.id)

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Determine user's role
    const membership = team.members.find((m: any) => m.userId === session.user.id)
    const userRole = isOwner ? "owner" : membership?.role || "member"

    return NextResponse.json({
      team: {
        ...team,
        userRole,
      },
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/teams/[id]
 * Update team details (owner or admin only)
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

    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check permissions (owner or admin)
    const isOwner = team.ownerId === session.user.id
    const membership = team.members[0]
    const isAdmin = membership?.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, logoUrl, plan } = body

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(plan && isOwner && { plan }), // Only owner can change plan
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        userId: session.user.id,
        action: "team_updated",
        entityType: "team",
        entityId: params.id,
        metadata: { updates: Object.keys(body) },
      },
    })

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/teams/[id]
 * Delete a team (owner only)
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

    const team = await prisma.team.findUnique({
      where: { id: params.id },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Only owner can delete team
    if (team.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete team (cascade will handle related records)
    await prisma.team.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    )
  }
}

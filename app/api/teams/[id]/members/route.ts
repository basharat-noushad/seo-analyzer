import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * GET /api/teams/[id]/members
 * List team members
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

    const members = await prisma.teamMember.findMany({
      where: { teamId: params.id },
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
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams/[id]/members
 * Add or update a team member
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to add members (owner or admin)
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

    const isOwner = team.ownerId === session.user.id
    const membership = team.members[0]
    const isAdmin = membership?.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only owners and admins can add members" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, role = "member" } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ["owner", "admin", "member", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Only owner can assign owner role
    if (role === "owner" && !isOwner) {
      return NextResponse.json(
        { error: "Only owners can assign owner role" },
        { status: 403 }
      )
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: params.id,
          userId,
        },
      },
    })

    let member

    if (existingMember) {
      // Update existing member's role
      member = await prisma.teamMember.update({
        where: { id: existingMember.id },
        data: { role },
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
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          teamId: params.id,
          userId: session.user.id,
          action: "member_role_updated",
          entityType: "member",
          entityId: member.id,
          metadata: {
            targetUserId: userId,
            newRole: role,
          },
        },
      })
    } else {
      // Add new member
      member = await prisma.teamMember.create({
        data: {
          teamId: params.id,
          userId,
          role,
          invitedBy: session.user.id,
        },
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
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          teamId: params.id,
          userId: session.user.id,
          action: "member_added",
          entityType: "member",
          entityId: member.id,
          metadata: {
            targetUserId: userId,
            role,
          },
        },
      })
    }

    return NextResponse.json({ member }, { status: existingMember ? 200 : 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/teams/[id]/members/[memberId]
 * Remove a team member
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

    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get("memberId")

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }

    // Check if user has permission to remove members (owner or admin)
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

    const isOwner = team.ownerId === session.user.id
    const membership = team.members[0]
    const isAdmin = membership?.role === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only owners and admins can remove members" },
        { status: 403 }
      )
    }

    // Get the member to remove
    const memberToRemove = await prisma.teamMember.findUnique({
      where: { id: memberId },
    })

    if (!memberToRemove || memberToRemove.teamId !== params.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Cannot remove the owner
    if (memberToRemove.userId === team.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove team owner" },
        { status: 400 }
      )
    }

    // Remove member
    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        userId: session.user.id,
        action: "member_removed",
        entityType: "member",
        entityId: memberId,
        metadata: {
          removedUserId: memberToRemove.userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}

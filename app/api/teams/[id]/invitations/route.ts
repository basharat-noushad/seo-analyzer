import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

/**
 * GET /api/teams/[id]/invitations
 * List pending team invitations
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

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        teamId: params.id,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams/[id]/invitations
 * Invite a user to the team via email
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

    // Check if user has permission to invite members (owner or admin)
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
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, role = "member" } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["admin", "member", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user with this email already exists in the team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        user: {
          email: email.toLowerCase(),
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId: params.id,
        email: email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = nanoid(32)

    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: params.id,
        email: email.toLowerCase(),
        role,
        token,
        invitedBy: session.user.id,
        expiresAt,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
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
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        userId: session.user.id,
        action: "member_invited",
        entityType: "invitation",
        entityId: invitation.id,
        metadata: {
          invitedEmail: email,
          role,
        },
      },
    })

    // Send invitation email
    try {
      const { sendTeamInvitationEmail } = await import("@/lib/email")
      const inviteUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/invitations/${token}`
      await sendTeamInvitationEmail(email, session.user.name || "A team member", invitation.team.name, inviteUrl)
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError)
    }

    return NextResponse.json(
      {
        invitation,
        message: "Invitation created and email sent.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/teams/[id]/invitations
 * Cancel/revoke a team invitation
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
    const invitationId = searchParams.get("invitationId")

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      )
    }

    // Check if user has permission (owner or admin)
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
        { error: "Only owners and admins can cancel invitations" },
        { status: 403 }
      )
    }

    // Delete invitation
    const deleted = await prisma.teamInvitation.deleteMany({
      where: {
        id: invitationId,
        teamId: params.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      )
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        userId: session.user.id,
        action: "invitation_cancelled",
        entityType: "invitation",
        entityId: invitationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling invitation:", error)
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    )
  }
}

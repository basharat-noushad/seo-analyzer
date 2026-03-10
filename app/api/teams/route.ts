import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

/**
 * GET /api/teams
 * List all teams the user is a member of or owns
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teams where user is owner or member
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Add user's role to each team
    const teamsWithRole = teams.map((team: any) => {
      const isOwner = team.ownerId === session.user.id
      const membership = team.members.find((m: any) => m.userId === session.user.id)

      return {
        ...team,
        userRole: isOwner ? "owner" : membership?.role || "member",
      }
    })

    return NextResponse.json({ teams: teamsWithRole })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams
 * Create a new team
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, plan = "free" } = body

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      )
    }

    // Generate a unique slug from team name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Check if slug exists and make it unique
    let slug = baseSlug
    let slugExists = await prisma.team.findUnique({ where: { slug } })
    let counter = 1

    while (slugExists) {
      slug = `${baseSlug}-${counter}`
      slugExists = await prisma.team.findUnique({ where: { slug } })
      counter++
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description,
        plan,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "owner",
          },
        },
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
        teamId: team.id,
        userId: session.user.id,
        action: "team_created",
        entityType: "team",
        entityId: team.id,
        metadata: { teamName: name },
      },
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}

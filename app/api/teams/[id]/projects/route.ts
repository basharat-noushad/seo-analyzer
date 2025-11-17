import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/teams/[id]/projects
 * List team projects
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
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

    const teamProjects = await prisma.teamProject.findMany({
      where: { teamId: params.id },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                analyses: true,
                issues: true,
                keywords: true,
              },
            },
          },
        },
        adder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ projects: teamProjects })
  } catch (error) {
    console.error("Error fetching team projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch team projects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teams/[id]/projects
 * Add a project to the team
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to add projects (owner or admin)
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
    const isMember = membership?.role === "member"

    if (!isOwner && !isAdmin && !isMember) {
      return NextResponse.json(
        { error: "You don't have permission to add projects" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    // Check if project exists and user owns it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only add your own projects to teams" },
        { status: 403 }
      )
    }

    // Check if project is already in team
    const existingTeamProject = await prisma.teamProject.findUnique({
      where: {
        teamId_projectId: {
          teamId: params.id,
          projectId,
        },
      },
    })

    if (existingTeamProject) {
      return NextResponse.json(
        { error: "Project is already in this team" },
        { status: 400 }
      )
    }

    // Add project to team
    const teamProject = await prisma.teamProject.create({
      data: {
        teamId: params.id,
        projectId,
        addedBy: session.user.id,
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                analyses: true,
                issues: true,
                keywords: true,
              },
            },
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        projectId,
        userId: session.user.id,
        action: "project_added_to_team",
        entityType: "project",
        entityId: projectId,
        metadata: {
          projectName: project.name,
        },
      },
    })

    return NextResponse.json({ teamProject }, { status: 201 })
  } catch (error) {
    console.error("Error adding project to team:", error)
    return NextResponse.json(
      { error: "Failed to add project to team" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/teams/[id]/projects
 * Remove a project from the team
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      )
    }

    // Check if user has permission to remove projects (owner or admin)
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

    // Check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    const isProjectOwner = project?.userId === session.user.id

    if (!isOwner && !isAdmin && !isProjectOwner) {
      return NextResponse.json(
        { error: "You don't have permission to remove this project" },
        { status: 403 }
      )
    }

    // Remove project from team
    const deleted = await prisma.teamProject.deleteMany({
      where: {
        teamId: params.id,
        projectId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Project not found in this team" },
        { status: 404 }
      )
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        teamId: params.id,
        projectId,
        userId: session.user.id,
        action: "project_removed_from_team",
        entityType: "project",
        entityId: projectId,
        metadata: {
          projectName: project?.name,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing project from team:", error)
    return NextResponse.json(
      { error: "Failed to remove project from team" },
      { status: 500 }
    )
  }
}

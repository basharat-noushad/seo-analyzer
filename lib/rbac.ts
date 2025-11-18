/**
 * Role-Based Access Control (RBAC) Utilities
 * Defines permissions and helper functions for team collaboration
 */

import { prisma } from "@/lib/prisma"

export type TeamRole = "owner" | "admin" | "member" | "viewer"

export type Permission =
  | "team:manage" // Update team settings, delete team
  | "team:view" // View team details
  | "members:invite" // Invite new members
  | "members:manage" // Add/remove members, change roles
  | "members:view" // View team members
  | "projects:add" // Add projects to team
  | "projects:remove" // Remove projects from team
  | "projects:view" // View team projects
  | "activity:view" // View activity logs

/**
 * Role permissions matrix
 */
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  owner: [
    "team:manage",
    "team:view",
    "members:invite",
    "members:manage",
    "members:view",
    "projects:add",
    "projects:remove",
    "projects:view",
    "activity:view",
  ],
  admin: [
    "team:view",
    "members:invite",
    "members:manage",
    "members:view",
    "projects:add",
    "projects:remove",
    "projects:view",
    "activity:view",
  ],
  member: [
    "team:view",
    "members:view",
    "projects:add",
    "projects:view",
    "activity:view",
  ],
  viewer: ["team:view", "members:view", "projects:view", "activity:view"],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: TeamRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

/**
 * Check if a role can perform multiple permissions (AND logic)
 */
export function hasAllPermissions(
  role: TeamRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Check if a role can perform any of the permissions (OR logic)
 */
export function hasAnyPermission(
  role: TeamRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Get user's role in a team
 */
export async function getUserTeamRole(
  userId: string,
  teamId: string
): Promise<TeamRole | null> {
  // Check if user is team owner
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  })

  if (team) {
    return "owner"
  }

  // Check if user is a member
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  })

  return member?.role as TeamRole | null
}

/**
 * Check if user has access to a team
 */
export async function hasTeamAccess(
  userId: string,
  teamId: string
): Promise<boolean> {
  const role = await getUserTeamRole(userId, teamId)
  return role !== null
}

/**
 * Verify user has a specific permission in a team
 */
export async function verifyTeamPermission(
  userId: string,
  teamId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserTeamRole(userId, teamId)
  if (!role) return false

  return hasPermission(role, permission)
}

/**
 * Get all teams user has access to with their roles
 */
export async function getUserTeams(userId: string) {
  const [ownedTeams, memberTeams] = await Promise.all([
    prisma.team.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    }),
    prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: {
              select: { members: true, projects: true },
            },
          },
        },
      },
    }),
  ])

  const ownedTeamsWithRole = ownedTeams.map((team: any) => ({
    ...team,
    userRole: "owner" as TeamRole,
  }))

  const memberTeamsWithRole = memberTeams.map((member: any) => ({
    ...member.team,
    userRole: member.role as TeamRole,
  }))

  return [...ownedTeamsWithRole, ...memberTeamsWithRole]
}

/**
 * Activity log helper
 */
export async function logTeamActivity(data: {
  teamId: string
  userId: string
  action: string
  entityType?: string
  entityId?: string
  projectId?: string
  metadata?: any
}) {
  return prisma.activityLog.create({
    data: {
      teamId: data.teamId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      projectId: data.projectId,
      metadata: data.metadata,
    },
  })
}

/**
 * Common activity action types
 */
export const ACTIVITY_ACTIONS = {
  // Team actions
  TEAM_CREATED: "team_created",
  TEAM_UPDATED: "team_updated",
  TEAM_DELETED: "team_deleted",

  // Member actions
  MEMBER_INVITED: "member_invited",
  MEMBER_ADDED: "member_added",
  MEMBER_REMOVED: "member_removed",
  MEMBER_ROLE_UPDATED: "member_role_updated",
  INVITATION_ACCEPTED: "invitation_accepted",
  INVITATION_CANCELLED: "invitation_cancelled",

  // Project actions
  PROJECT_ADDED_TO_TEAM: "project_added_to_team",
  PROJECT_REMOVED_FROM_TEAM: "project_removed_from_team",

  // Analysis actions
  ANALYSIS_RUN: "analysis_run",
  ISSUE_CREATED: "issue_created",
  ISSUE_RESOLVED: "issue_resolved",

  // Report actions
  REPORT_CREATED: "report_created",
  REPORT_SHARED: "report_shared",
} as const

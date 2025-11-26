/**
 * Usage Limits and Enforcement
 *
 * Enforces tier-based limits on projects, analyses, and other features
 */

import { prisma } from '@/lib/prisma'
import { getPlanLimits, hasExceededLimit } from '@/lib/stripe'

export type UserTier = 'free' | 'pro' | 'agency'

export interface UsageLimits {
  projects: number
  analysesPerMonth: number
  keywords: number
  apiAccess: boolean
  teamMembers: number
}

export interface CurrentUsage {
  projects: number
  analysesThisMonth: number
  keywords: number
  teamMembers: number
}

/**
 * Get current month's date range
 */
function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * Get user's current usage
 */
export async function getCurrentUsage(userId: string): Promise<CurrentUsage> {
  const { start, end } = getCurrentMonthRange()

  const [projects, analyses, keywords, teamMembers] = await Promise.all([
    // Count projects
    prisma.project.count({
      where: { userId },
    }),

    // Count analyses this month
    prisma.analysis.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    // Count keywords
    prisma.keyword.count({
      where: {
        project: {
          userId,
        },
      },
    }),

    // Count team members (where user is owner)
    prisma.teamMember.count({
      where: {
        team: {
          ownerId: userId,
        },
      },
    }),
  ])

  return {
    projects,
    analysesThisMonth: analyses,
    keywords,
    teamMembers,
  }
}

/**
 * Check if user can create a new project
 */
export async function canCreateProject(userId: string, tier: UserTier): Promise<{
  allowed: boolean
  reason?: string
  current: number
  limit: number
}> {
  const limits = getPlanLimits(tier)
  const usage = await getCurrentUsage(userId)

  const allowed = !hasExceededLimit(usage.projects, limits.projects)

  return {
    allowed,
    reason: allowed ? undefined : `Project limit reached. Upgrade to create more projects.`,
    current: usage.projects,
    limit: limits.projects,
  }
}

/**
 * Check if user can perform an analysis
 */
export async function canPerformAnalysis(userId: string, tier: UserTier): Promise<{
  allowed: boolean
  reason?: string
  current: number
  limit: number
}> {
  const limits = getPlanLimits(tier)
  const usage = await getCurrentUsage(userId)

  const allowed = !hasExceededLimit(usage.analysesThisMonth, limits.analysesPerMonth)

  return {
    allowed,
    reason: allowed ? undefined : `Monthly analysis limit reached. Upgrade for more analyses.`,
    current: usage.analysesThisMonth,
    limit: limits.analysesPerMonth,
  }
}

/**
 * Check if user can add a keyword
 */
export async function canAddKeyword(userId: string, tier: UserTier): Promise<{
  allowed: boolean
  reason?: string
  current: number
  limit: number
}> {
  const limits = getPlanLimits(tier)
  const usage = await getCurrentUsage(userId)

  const allowed = !hasExceededLimit(usage.keywords, limits.keywords)

  return {
    allowed,
    reason: allowed ? undefined : `Keyword limit reached. Upgrade to track more keywords.`,
    current: usage.keywords,
    limit: limits.keywords,
  }
}

/**
 * Check if user has API access
 */
export function hasAPIAccess(tier: UserTier): boolean {
  const limits = getPlanLimits(tier)
  return limits.apiAccess
}

/**
 * Check if user can add team members
 */
export async function canAddTeamMember(userId: string, tier: UserTier): Promise<{
  allowed: boolean
  reason?: string
  current: number
  limit: number
}> {
  const limits = getPlanLimits(tier)
  const usage = await getCurrentUsage(userId)

  const allowed = !hasExceededLimit(usage.teamMembers, limits.teamMembers)

  return {
    allowed,
    reason: allowed ? undefined : `Team member limit reached. Upgrade for more team members.`,
    current: usage.teamMembers,
    limit: limits.teamMembers,
  }
}

/**
 * Log usage event
 */
export async function logUsage(userId: string, action: string, credits: number = 1) {
  try {
    await prisma.usageLog.create({
      data: {
        userId,
        action,
        credits,
      },
    })
  } catch (error) {
    console.error('Error logging usage:', error)
    // Don't fail the request if usage logging fails
  }
}

/**
 * Get usage summary for dashboard
 */
export async function getUsageSummary(userId: string, tier: UserTier) {
  const limits = getPlanLimits(tier)
  const usage = await getCurrentUsage(userId)

  return {
    projects: {
      current: usage.projects,
      limit: limits.projects,
      percentage: limits.projects === -1 ? 0 : (usage.projects / limits.projects) * 100,
      unlimited: limits.projects === -1,
    },
    analyses: {
      current: usage.analysesThisMonth,
      limit: limits.analysesPerMonth,
      percentage: limits.analysesPerMonth === -1 ? 0 : (usage.analysesThisMonth / limits.analysesPerMonth) * 100,
      unlimited: limits.analysesPerMonth === -1,
    },
    keywords: {
      current: usage.keywords,
      limit: limits.keywords,
      percentage: limits.keywords === -1 ? 0 : (usage.keywords / limits.keywords) * 100,
      unlimited: limits.keywords === -1,
    },
    teamMembers: {
      current: usage.teamMembers,
      limit: limits.teamMembers,
      percentage: limits.teamMembers === -1 ? 0 : (usage.teamMembers / limits.teamMembers) * 100,
      unlimited: limits.teamMembers === -1,
    },
  }
}

/**
 * Format limit for display
 */
export function formatLimit(limit: number): string {
  if (limit === -1) return 'Unlimited'
  return limit.toString()
}

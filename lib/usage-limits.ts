/**
 * Tier-Based Usage Limit Enforcement
 *
 * Checks whether a user is allowed to perform specific actions
 * based on their subscription tier and current monthly usage.
 */

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

export interface TierLimits {
  maxProjects: number;         // 0 = unlimited
  maxAnalysesPerMonth: number; // 0 = unlimited
  maxKeywords: number;         // 0 = unlimited (only when keywordsEnabled)
  keywordsEnabled: boolean;
  apiAccess: boolean;
}

const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    maxProjects: 5,
    maxAnalysesPerMonth: 10,
    maxKeywords: 0,
    keywordsEnabled: false,
    apiAccess: false,
  },
  pro: {
    maxProjects: 0, // unlimited
    maxAnalysesPerMonth: 500,
    maxKeywords: 50,
    keywordsEnabled: true,
    apiAccess: true,
  },
  agency: {
    maxProjects: 0, // unlimited
    maxAnalysesPerMonth: 0, // unlimited
    maxKeywords: 500,
    keywordsEnabled: true,
    apiAccess: true,
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[tier] ?? TIER_LIMITS.free;
}

export interface MonthlyUsage {
  analyses: number;
  projects: number;
  keywords: number;
}

export async function getMonthlyUsage(userId: string): Promise<MonthlyUsage> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [analysisCount, projectCount, keywordCount] = await Promise.all([
    prisma.usageLog.count({
      where: {
        userId,
        action: "analysis",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.project.count({
      where: { userId },
    }),
    prisma.keyword.count({
      where: {
        project: { userId },
      },
    }),
  ]);

  return {
    analyses: analysisCount,
    projects: projectCount,
    keywords: keywordCount,
  };
}

export interface UsageLimitResult {
  allowed: boolean;
  message?: string;
  current?: number;
  limit?: number;
}

export async function checkUsageLimit(
  userId: string,
  action: "create_project" | "run_analysis" | "add_keyword" | "use_api"
): Promise<UsageLimitResult> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch user tier and all usage counts in parallel (4 → 1 round trip)
  const [user, analysisCount, projectCount, keywordCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }),
    prisma.usageLog.count({ where: { userId, action: "analysis", createdAt: { gte: startOfMonth } } }),
    prisma.project.count({ where: { userId } }),
    prisma.keyword.count({ where: { project: { userId } } }),
  ]);

  if (!user) {
    return { allowed: false, message: "User not found." };
  }

  const limits = getTierLimits(user.tier);
  const usage: MonthlyUsage = {
    analyses: analysisCount,
    projects: projectCount,
    keywords: keywordCount,
  };

  switch (action) {
    case "create_project": {
      if (limits.maxProjects === 0) {
        return { allowed: true };
      }
      if (usage.projects >= limits.maxProjects) {
        return {
          allowed: false,
          message: `You have reached the maximum of ${limits.maxProjects} projects on the ${user.tier} tier. Upgrade to add more projects.`,
          current: usage.projects,
          limit: limits.maxProjects,
        };
      }
      return {
        allowed: true,
        current: usage.projects,
        limit: limits.maxProjects,
      };
    }

    case "run_analysis": {
      if (limits.maxAnalysesPerMonth === 0) {
        return { allowed: true };
      }
      if (usage.analyses >= limits.maxAnalysesPerMonth) {
        return {
          allowed: false,
          message: `You have used all ${limits.maxAnalysesPerMonth} analyses for this month on the ${user.tier} tier. Upgrade for more analyses.`,
          current: usage.analyses,
          limit: limits.maxAnalysesPerMonth,
        };
      }
      return {
        allowed: true,
        current: usage.analyses,
        limit: limits.maxAnalysesPerMonth,
      };
    }

    case "add_keyword": {
      if (!limits.keywordsEnabled) {
        return {
          allowed: false,
          message: "Keyword tracking is not available on the free tier. Upgrade to Pro or Agency to track keywords.",
          current: 0,
          limit: 0,
        };
      }
      if (limits.maxKeywords === 0) {
        return { allowed: true }; // unlimited
      }
      if (usage.keywords >= limits.maxKeywords) {
        return {
          allowed: false,
          message: `You have reached the maximum of ${limits.maxKeywords} keywords on the ${user.tier} tier. Upgrade for more keyword tracking.`,
          current: usage.keywords,
          limit: limits.maxKeywords,
        };
      }
      return { allowed: true, current: usage.keywords, limit: limits.maxKeywords };
    }

    case "use_api": {
      if (!limits.apiAccess) {
        return {
          allowed: false,
          message:
            "API access is not available on the free tier. Upgrade to Pro or Agency for API access.",
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: false, message: "Unknown action." };
  }
}

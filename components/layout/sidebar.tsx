"use client"

/**
 * Sidebar Navigation
 *
 * Main navigation sidebar for the dashboard.
 * Shows different menu items based on user role and tier.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  FileSearch,
  BarChart3,
  Users,
  Key,
  Settings,
  Target,
  Search,
  Globe,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  user: {
    name: string | null
    email: string
    tier: string
    role: string
  }
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    name: "Analyses",
    href: "/dashboard/analyses",
    icon: FileSearch,
  },
  {
    name: "Keywords",
    href: "/dashboard/keywords",
    icon: Target,
  },
  {
    name: "Rankings",
    href: "/dashboard/rankings",
    icon: BarChart3,
  },
  {
    name: "Issues",
    href: "/dashboard/issues",
    icon: AlertCircle,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
]

const toolsNavigation = [
  {
    name: "Page Analyzer",
    href: "/tools/page-analyzer",
    icon: Search,
  },
  {
    name: "Site Audit",
    href: "/tools/site-audit",
    icon: Globe,
  },
  {
    name: "Keyword Research",
    href: "/tools/keyword-research",
    icon: Target,
    badge: "Pro",
    tier: "pro" as const,
  },
  {
    name: "Rank Tracker",
    href: "/tools/rank-tracker",
    icon: BarChart3,
    badge: "Pro",
    tier: "pro" as const,
  },
]

const settingsNavigation = [
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: Settings,
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: Key,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
    badge: "Agency",
    tier: "agency" as const,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
    badge: "Pro",
    tier: "pro" as const,
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const tierLevels = {
    free: 0,
    pro: 1,
    agency: 2,
  }

  const userTierLevel = tierLevels[user.tier as keyof typeof tierLevels] || 0

  const canAccess = (itemTier?: "pro" | "agency") => {
    if (!itemTier) return true
    const requiredLevel = tierLevels[itemTier as keyof typeof tierLevels] || 0
    return userTierLevel >= requiredLevel
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold">SEO Analyzer</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-200"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Separator */}
        <div className="my-4 border-t" />

        {/* Tools */}
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            Tools
          </div>
          <div className="space-y-1">
            {toolsNavigation.map((item) => {
              const isActive = pathname === item.href
              const hasAccess = canAccess(item.tier)

              return (
                <Link
                  key={item.name}
                  href={hasAccess ? item.href : "/dashboard/billing"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : hasAccess
                      ? "text-gray-700 hover:bg-gray-200"
                      : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && !hasAccess && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 border-t" />

        {/* Settings */}
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            Settings
          </div>
          <div className="space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href
              const hasAccess = canAccess(item.tier)

              // Hide admin-only items for non-admin users
              if (item.name === "Team" && user.role !== "admin" && user.tier !== "agency") {
                return null
              }

              return (
                <Link
                  key={item.name}
                  href={hasAccess ? item.href : "/dashboard/billing"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : hasAccess
                      ? "text-gray-700 hover:bg-gray-200"
                      : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && !hasAccess && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User Tier Badge */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Plan</span>
          <Badge
            variant={user.tier === "free" ? "outline" : "default"}
            className="capitalize"
          >
            {user.tier}
          </Badge>
        </div>
        {user.tier === "free" && (
          <Link
            href="/dashboard/billing"
            className="mt-2 block text-center text-sm text-primary hover:underline"
          >
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  )
}

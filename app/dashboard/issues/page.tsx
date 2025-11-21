/**
 * SEO Issues Dashboard
 *
 * Track and manage SEO issues found across all projects
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

// Severity badge mapping
const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  high: {
    label: "High",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  medium: {
    label: "Medium",
    icon: Info,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  low: {
    label: "Low",
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
}

// Status badge mapping
const STATUS_CONFIG = {
  open: {
    label: "Open",
    icon: Clock,
    variant: "destructive" as const
  },
  fixed: {
    label: "Fixed",
    icon: CheckCircle2,
    variant: "default" as const
  },
  ignored: {
    label: "Ignored",
    icon: XCircle,
    variant: "secondary" as const
  }
}

// Category mapping
const CATEGORY_CONFIG = {
  seo: { label: "SEO", color: "bg-purple-100 text-purple-700" },
  technical: { label: "Technical", color: "bg-blue-100 text-blue-700" },
  content: { label: "Content", color: "bg-green-100 text-green-700" },
  performance: { label: "Performance", color: "bg-yellow-100 text-yellow-700" },
  links: { label: "Links", color: "bg-pink-100 text-pink-700" }
}

export default async function IssuesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true, name: true }
  })

  const projectIds = projects.map(p => p.id)

  // Fetch all issues
  const issues = await prisma.issue.findMany({
    where: {
      OR: [
        { analysis: { userId: user.id } },
        { projectId: { in: projectIds } }
      ]
    },
    include: {
      analysis: {
        select: {
          url: true
        }
      },
      project: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      { status: 'asc' },
      { severity: 'asc' },
      { createdAt: 'desc' }
    ],
    take: 100
  })

  // Calculate statistics
  const stats = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical' && i.status === 'open').length,
    high: issues.filter(i => i.severity === 'high' && i.status === 'open').length,
    medium: issues.filter(i => i.severity === 'medium' && i.status === 'open').length,
    low: issues.filter(i => i.severity === 'low' && i.status === 'open').length,
    open: issues.filter(i => i.status === 'open').length,
    fixed: issues.filter(i => i.status === 'fixed').length,
    ignored: issues.filter(i => i.status === 'ignored').length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Issues</h1>
          <p className="text-gray-600 mt-1">
            Track and resolve SEO issues across your projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High</p>
                <p className="text-3xl font-bold text-orange-600">{stats.high}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <Info className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low</p>
                <p className="text-3xl font-bold text-blue-600">{stats.low}</p>
              </div>
              <Info className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Status Overview</CardTitle>
          <CardDescription>
            Current status of all tracked issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-sm text-gray-600">Open Issues</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.fixed}</p>
                <p className="text-sm text-gray-600">Fixed Issues</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <XCircle className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold">{stats.ignored}</p>
                <p className="text-sm text-gray-600">Ignored Issues</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>All Issues</CardTitle>
          <CardDescription>
            Showing {issues.length} issues from your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
              <p className="text-gray-600 mb-4">
                Great job! Your projects don't have any tracked SEO issues.
              </p>
              <Link href="/tools/page-analyzer">
                <Button>
                  Analyze a Page
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => {
                const SeverityIcon = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG].icon
                const severityConfig = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG]
                const statusConfig = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig.icon
                const categoryConfig = CATEGORY_CONFIG[issue.category as keyof typeof CATEGORY_CONFIG]

                return (
                  <div
                    key={issue.id}
                    className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${severityConfig.borderColor} ${severityConfig.bgColor}`}
                  >
                    <div className="flex items-start gap-4">
                      <SeverityIcon className={`h-6 w-6 ${severityConfig.color} flex-shrink-0 mt-0.5`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                            {issue.description && (
                              <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                            )}
                            {issue.recommendation && (
                              <div className="text-sm text-gray-600 bg-white p-2 rounded border mt-2">
                                <span className="font-medium">Recommendation:</span> {issue.recommendation}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={statusConfig.variant} className="whitespace-nowrap">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className={categoryConfig.color}>
                              {categoryConfig.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {issue.project && (
                            <span>Project: {issue.project.name}</span>
                          )}
                          {issue.analysis && (
                            <span className="truncate max-w-xs">Page: {issue.analysis.url}</span>
                          )}
                          <span>
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {issue.url && (
                          <div className="mt-2">
                            <Link href={issue.url} target="_blank" className="text-sm text-blue-600 hover:underline">
                              View Page →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 ml-10">
                      {issue.status === 'open' && (
                        <>
                          <Button size="sm" variant="outline">
                            Mark as Fixed
                          </Button>
                          <Button size="sm" variant="ghost">
                            Ignore
                          </Button>
                        </>
                      )}
                      {issue.status === 'fixed' && (
                        <Button size="sm" variant="outline">
                          Reopen
                        </Button>
                      )}
                      {issue.status === 'ignored' && (
                        <Button size="sm" variant="outline">
                          Reopen
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Issues are automatically detected during page analyses.
              Click "Mark as Fixed" after resolving an issue, or "Ignore" if it's not applicable.
              Issue status updates and filtering functionality will be enhanced in the next phase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

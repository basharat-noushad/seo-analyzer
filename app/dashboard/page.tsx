/**
 * Dashboard Overview Page
 *
 * Main dashboard page showing:
 * - Quick stats
 * - Recent analyses
 * - Active projects
 * - Quick actions
 */

import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderKanban,
  FileSearch,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Globe,
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Fetch dashboard data
  const [projects, analyses, issues] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { analyses: true, issues: true },
        },
      },
    }),
    prisma.analysis.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.issue.aggregate({
      where: {
        project: { userId: user.id },
        status: "open",
      },
      _count: {
        _all: true,
      },
    }),
  ])

  // Calculate stats
  const totalProjects = await prisma.project.count({
    where: { userId: user.id },
  })

  const totalAnalyses = await prisma.analysis.count({
    where: { userId: user.id },
  })

  const criticalIssuesCount = await prisma.issue.count({
    where: {
      project: { userId: user.id },
      status: "open",
      severity: "critical",
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name || "User"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your SEO performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Websites being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              SEO analyses performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues._count._all}</div>
            <p className="text-xs text-muted-foreground">
              {criticalIssuesCount} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.tier}</div>
            {user.tier === "free" && (
              <Link
                href="/dashboard/billing"
                className="text-xs text-primary hover:underline"
              >
                Upgrade to Pro
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently created projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No projects yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.domain}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>{project._count.analyses} analyses</span>
                        <span>{project._count.issues} issues</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </Link>
                ))}
                {projects.length >= 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/projects">View All Projects</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your latest SEO analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-6">
                <FileSearch className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No analyses yet</p>
                <Button asChild className="mt-4">
                  <Link href="/tools/page-analyzer">
                    <Plus className="mr-2 h-4 w-4" />
                    Analyze a Page
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis: any) => (
                  <Link
                    key={analysis.id}
                    href={`/dashboard/analyses/${analysis.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{analysis.url}</h4>
                        {analysis.seoScore && (
                          <Badge
                            variant={
                              analysis.seoScore >= 80
                                ? "default"
                                : analysis.seoScore >= 60
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {analysis.seoScore}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </Link>
                ))}
                {analyses.length >= 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/analyses">View All Analyses</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/dashboard/projects/new">
                <Plus className="h-6 w-6" />
                <span>New Project</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/tools/page-analyzer">
                <FileSearch className="h-6 w-6" />
                <span>Analyze Page</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/tools/site-audit">
                <Globe className="h-6 w-6" />
                <span>Site Audit</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/dashboard/issues">
                <AlertCircle className="h-6 w-6" />
                <span>View Issues</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Project Detail Page
 *
 * Shows detailed information about a specific project
 */

import Link from "next/link"
import { notFound } from "next/navigation"
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
  ArrowLeft,
  Globe,
  Calendar,
  BarChart3,
  AlertCircle,
  FileSearch,
  Plus,
  Settings,
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      pages: true,
      analyses: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      issues: {
        where: { status: "open" },
        orderBy: { severity: "desc" },
        take: 10,
      },
      _count: {
        select: {
          pages: true,
          analyses: true,
          issues: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const criticalIssues = project.issues.filter((i: any) => i.severity === "critical").length
  const highIssues = project.issues.filter((i: any) => i.severity === "high").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <Globe className="h-4 w-4" />
              <a
                href={project.domain}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                {project.domain}
              </a>
            </div>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/projects/${project.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/tools/page-analyzer?project=${project.id}`}>
                <FileSearch className="mr-2 h-4 w-4" />
                Analyze
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.seoScore || "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.pages}</div>
            <p className="text-xs text-muted-foreground">
              Being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.analyses}</div>
            <p className="text-xs text-muted-foreground">
              Total scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.issues}</div>
            <p className="text-xs text-muted-foreground">
              {criticalIssues} critical, {highIssues} high
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">Monitoring</div>
              <Badge variant={project.monitoringEnabled ? "default" : "outline"}>
                {project.monitoringEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            {project.monitoringFrequency && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Frequency</div>
                <span className="font-medium capitalize">
                  {project.monitoringFrequency}
                </span>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-1">Created</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {project.lastScanAt && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Last Scan</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(project.lastScanAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest SEO scans for this project</CardDescription>
          </CardHeader>
          <CardContent>
            {project.analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileSearch className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No analyses yet</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href={`/tools/page-analyzer?project=${project.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Run Analysis
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.analyses.map((analysis: any) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{analysis.url}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Open Issues</CardTitle>
            <CardDescription>SEO issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {project.issues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No open issues</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.issues.map((issue: any) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            issue.severity === "critical"
                              ? "destructive"
                              : issue.severity === "high"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {issue.severity}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{issue.title}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/issues?project=${project.id}`}>
                    View All Issues
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

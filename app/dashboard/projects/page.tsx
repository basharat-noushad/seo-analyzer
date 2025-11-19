/**
 * Projects List Page
 *
 * Shows all projects for the current user
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
import { FolderKanban, Plus, Globe, BarChart3, AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          pages: true,
          analyses: true,
          issues: true,
        },
      },
    },
  })

  const projectCount = projects.length
  const tierLimits = {
    free: 1,
    pro: 10,
    agency: Infinity,
  }
  const limit = tierLimits[user.tier as keyof typeof tierLimits] || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your website projects and monitoring
          </p>
        </div>
        <Button asChild disabled={projectCount >= limit}>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Usage indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Projects: {projectCount} / {limit === Infinity ? "∞" : limit}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min((projectCount / (limit === Infinity ? projectCount + 1 : limit)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            {projectCount >= limit && user.tier !== "agency" && (
              <Button asChild variant="outline">
                <Link href="/dashboard/billing">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Create your first project to start analyzing and monitoring your website's SEO
            </p>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{project.domain}</span>
                    </CardDescription>
                  </div>
                  {project.monitoringEnabled && (
                    <Badge variant="default" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {project._count.pages}
                    </div>
                    <div className="text-xs text-gray-600">Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {project._count.analyses}
                    </div>
                    <div className="text-xs text-gray-600">Analyses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {project._count.issues}
                    </div>
                    <div className="text-xs text-gray-600">Issues</div>
                  </div>
                </div>

                {project.seoScore && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">SEO Score</span>
                      <span className="font-semibold">{project.seoScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          project.seoScore >= 80
                            ? "bg-green-500"
                            : project.seoScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${project.seoScore}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

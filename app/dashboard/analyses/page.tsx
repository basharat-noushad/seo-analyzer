/**
 * Analyses List Page
 *
 * Shows all analyses for the current user
 */

import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSearch, Plus, Calendar, FolderKanban } from "lucide-react"

export default async function AnalysesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const getSeoScoreBadge = (score: number | null) => {
    if (!score) return null

    if (score >= 80) {
      return <Badge variant="default">Excellent</Badge>
    } else if (score >= 60) {
      return <Badge variant="secondary">Good</Badge>
    } else {
      return <Badge variant="destructive">Needs Work</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analyses</h1>
          <p className="text-gray-600 mt-1">
            View your SEO analysis history
          </p>
        </div>
        <Button asChild>
          <Link href="/tools/page-analyzer">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSearch className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No analyses yet
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Run your first SEO analysis to start tracking your website's performance
            </p>
            <Button asChild>
              <Link href="/tools/page-analyzer">
                <Plus className="mr-2 h-4 w-4" />
                Analyze a Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {analysis.url}
                      </h3>
                      {analysis.seoScore !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {analysis.seoScore}
                          </span>
                          {getSeoScoreBadge(analysis.seoScore)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      </div>

                      {analysis.project && (
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-4 w-4" />
                          <Link
                            href={`/dashboard/projects/${analysis.project.id}`}
                            className="text-primary hover:underline"
                          >
                            {analysis.project.name}
                          </Link>
                        </div>
                      )}

                      <Badge variant="outline" className="capitalize">
                        {analysis.type}
                      </Badge>
                    </div>

                    {/* Issue Summary */}
                    {(analysis.criticalIssues > 0 || analysis.highIssues > 0) && (
                      <div className="flex gap-3 mt-3">
                        {analysis.criticalIssues > 0 && (
                          <span className="text-sm text-red-600">
                            {analysis.criticalIssues} critical issues
                          </span>
                        )}
                        {analysis.highIssues > 0 && (
                          <span className="text-sm text-orange-600">
                            {analysis.highIssues} high priority issues
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button asChild variant="outline">
                    <Link href={`/dashboard/analyses/${analysis.id}`}>
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

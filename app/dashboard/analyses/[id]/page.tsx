/**
 * Analysis Detail Page
 *
 * Shows detailed information about a specific analysis
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Globe,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AnalysisDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const analysis = await prisma.analysis.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
      issues: {
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      },
    },
  })

  if (!analysis) {
    notFound()
  }

  const seoData: any = analysis.seoData || {}
  const contentData: any = analysis.contentData || {}
  const technicalData: any = analysis.technicalData || {}

  const getSeoScoreColor = (score: number | null) => {
    if (!score) return "text-gray-600"
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/analyses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analyses
        </Link>
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Details</h1>
            <a
              href={analysis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {analysis.url}
            </a>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getSeoScoreColor(analysis.seoScore)}`}>
              {analysis.seoScore || "—"}
            </div>
            <div className="text-sm text-gray-600 mt-1">SEO Score</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {analysis.project && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
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
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analysis.criticalIssues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {analysis.highIssues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {analysis.mediumIssues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {analysis.lowIssues}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Overview */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Overview</CardTitle>
          <CardDescription>Key SEO elements found on the page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Title Tag</span>
              {seoData.title?.content ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            {seoData.title?.content ? (
              <div>
                <p className="text-sm">{seoData.title.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Length: {seoData.title.length} characters
                  {seoData.title.length < 30 && " (too short)"}
                  {seoData.title.length > 60 && " (too long)"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Missing title tag</p>
            )}
          </div>

          <Separator />

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Meta Description</span>
              {seoData.metaDescription?.content ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            {seoData.metaDescription?.content ? (
              <div>
                <p className="text-sm">{seoData.metaDescription.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Length: {seoData.metaDescription.length} characters
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Missing meta description</p>
            )}
          </div>

          <Separator />

          {/* Content Stats */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Content Statistics</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {contentData.wordCount || 0}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {contentData.paragraphCount || 0}
                </div>
                <div className="text-xs text-gray-600">Paragraphs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {contentData.sentenceCount || 0}
                </div>
                <div className="text-xs text-gray-600">Sentences</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Found ({analysis.issues.length})</CardTitle>
            <CardDescription>
              SEO issues that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.issues.map((issue: any) => (
                <div
                  key={issue.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(issue.severity) as any} className="capitalize">
                          {issue.severity}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">
                          {issue.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                    </div>
                    <Badge
                      variant={issue.status === "fixed" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {issue.status}
                    </Badge>
                  </div>

                  {issue.description && (
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  )}

                  {issue.recommendation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium text-blue-900">Recommendation:</span>{" "}
                      <span className="text-blue-800">{issue.recommendation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/tools/page-analyzer?url=${encodeURIComponent(analysis.url)}`}>
                <FileText className="mr-2 h-4 w-4" />
                Re-analyze
              </Link>
            </Button>
            {analysis.project && (
              <Button asChild variant="outline">
                <Link href={`/dashboard/projects/${analysis.project.id}`}>
                  <Globe className="mr-2 h-4 w-4" />
                  View Project
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

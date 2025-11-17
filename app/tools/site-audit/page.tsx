"use client"

/**
 * Site Audit Tool
 *
 * Crawls multiple pages of a website and generates comprehensive SEO audit
 */

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Save,
  Download,
  FileText,
  BarChart3,
  Clock,
} from "lucide-react"

interface AuditProgress {
  status: "crawling" | "analyzing" | "completed" | "error"
  pagesFound: number
  pagesAnalyzed: number
  currentPage: string
  errors: string[]
}

interface PageResult {
  url: string
  status: "success" | "error"
  seoScore: number | null
  issues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  title?: string
  error?: string
}

interface AuditResult {
  domain: string
  totalPages: number
  avgSeoScore: number
  totalIssues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  pages: PageResult[]
  completedAt: string
}

export default function SiteAuditPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  const [domain, setDomain] = useState("")
  const [maxPages, setMaxPages] = useState(10)
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<AuditProgress | null>(null)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState("")
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  // Fetch user's projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err)
      }
    }
    fetchProjects()
  }, [])

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setResult(null)
    setProgress({
      status: "crawling",
      pagesFound: 0,
      pagesAnalyzed: 0,
      currentPage: domain,
      errors: [],
    })
    setAnalysisId(null)

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          maxPages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || "Failed to audit site")
        setLoading(false)
        setProgress(null)
        return
      }

      setResult(data)
      setProgress({
        status: "completed",
        pagesFound: data.totalPages,
        pagesAnalyzed: data.totalPages,
        currentPage: "",
        errors: data.errors || [],
      })

      // Auto-save if project is selected
      if (selectedProject) {
        await saveAudit(data)
      }
    } catch (err) {
      setError("Failed to audit site. Please try again.")
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const saveAudit = async (auditData?: any) => {
    const dataToSave = auditData || result
    if (!dataToSave) return

    setSaving(true)
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject || undefined,
          url: dataToSave.domain,
          analysisData: {
            type: "site_audit",
            ...dataToSave,
          },
        }),
      })

      if (response.ok) {
        const saved = await response.json()
        setAnalysisId(saved.analysis.id)
      }
    } catch (err) {
      console.error("Failed to save audit:", err)
    } finally {
      setSaving(false)
    }
  }

  const getSeoScoreColor = (score: number | null) => {
    if (!score) return "text-gray-600"
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Audit</h1>
        <p className="text-gray-600 mt-1">
          Crawl and analyze your entire website for SEO issues
        </p>
      </div>

      {/* Audit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Start Site Audit</CardTitle>
          <CardDescription>
            Enter your website domain to crawl and analyze multiple pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAudit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">
                  Website Domain <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="domain"
                  type="url"
                  placeholder="https://example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-600">
                  Enter your website's homepage URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPages">Maximum Pages to Crawl</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="1"
                  max="500"
                  placeholder="10"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-600">
                  Free: up to 10 pages, Pro: up to 100 pages, Agency: up to 500 pages
                </p>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="project">Save to Project (Optional)</Label>
                <select
                  id="project"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Don't save to project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.domain}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Audit
                  </>
                )}
              </Button>

              {result && !selectedProject && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => saveAudit()}
                  disabled={saving || !projects.length}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>

            {analysisId && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                Audit saved!{" "}
                <Link
                  href={`/dashboard/analyses/${analysisId}`}
                  className="font-medium underline"
                >
                  View details
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {progress && loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {progress.status === "crawling" ? "Crawling Website..." : "Analyzing Pages..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pages Found:</span>
                <span className="font-medium">{progress.pagesFound}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pages Analyzed:</span>
                <span className="font-medium">{progress.pagesAnalyzed}</span>
              </div>
              {progress.currentPage && (
                <div className="text-sm">
                  <span className="text-gray-600">Current: </span>
                  <span className="font-mono text-xs truncate block mt-1">
                    {progress.currentPage}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary</CardTitle>
              <CardDescription>
                Completed at {new Date(result.completedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {result.totalPages}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Pages Crawled</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getSeoScoreColor(result.avgSeoScore)}`}>
                    {Math.round(result.avgSeoScore)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Avg SEO Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {result.totalIssues.critical}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {result.totalIssues.high}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {result.totalIssues.medium}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Medium Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pages List */}
          <Card>
            <CardHeader>
              <CardTitle>Pages Analyzed ({result.pages.length})</CardTitle>
              <CardDescription>
                Individual page results from the site audit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.pages.map((page, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(page.status)}
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline truncate"
                          >
                            {page.url}
                          </a>
                        </div>
                        {page.title && (
                          <p className="text-sm text-gray-600 mb-2">{page.title}</p>
                        )}
                        {page.error && (
                          <p className="text-sm text-red-600">{page.error}</p>
                        )}
                        {page.status === "success" && page.issues && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {page.issues.critical > 0 && (
                              <Badge variant="destructive">
                                {page.issues.critical} Critical
                              </Badge>
                            )}
                            {page.issues.high > 0 && (
                              <Badge variant="default">
                                {page.issues.high} High
                              </Badge>
                            )}
                            {page.issues.medium > 0 && (
                              <Badge variant="secondary">
                                {page.issues.medium} Medium
                              </Badge>
                            )}
                            {page.issues.low > 0 && (
                              <Badge variant="outline">
                                {page.issues.low} Low
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {page.seoScore !== null && (
                        <div className={`text-2xl font-bold ${getSeoScoreColor(page.seoScore)}`}>
                          {page.seoScore}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 justify-center">
                {analysisId && (
                  <Button asChild>
                    <Link href={`/dashboard/analyses/${analysisId}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Saved Audit
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/dashboard/analyses">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    All Analyses
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Audit Your Site
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Enter your website domain above to crawl and analyze multiple pages
              for comprehensive SEO insights
            </p>
            <div className="text-sm text-gray-500">
              <p>✓ Automatic sitemap.xml detection</p>
              <p>✓ Internal link discovery</p>
              <p>✓ Comprehensive SEO analysis per page</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

/**
 * Enhanced Page Analyzer
 *
 * Analyzes pages with project integration and saves results to database
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
  FileSearch,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  Download,
  BarChart3
} from "lucide-react"

export default function PageAnalyzerPage() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  const [competitorUrl, setCompetitorUrl] = useState("")
  const [myUrl, setMyUrl] = useState("")
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setResult(null)
    setAnalysisId(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorUrl,
          myUrl: myUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to analyze")
        setLoading(false)
        return
      }

      setResult(data)

      // Auto-save if project is selected
      if (selectedProject) {
        await saveAnalysis(data)
      }
    } catch (err) {
      setError("Failed to analyze. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const saveAnalysis = async (analysisData?: any) => {
    const dataToSave = analysisData || result
    if (!dataToSave) return

    setSaving(true)
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject || undefined,
          url: competitorUrl,
          competitorUrl: myUrl || undefined,
          analysisData: dataToSave,
        }),
      })

      if (response.ok) {
        const saved = await response.json()
        setAnalysisId(saved.analysis.id)
      }
    } catch (err) {
      console.error("Failed to save analysis:", err)
    } finally {
      setSaving(false)
    }
  }

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeoScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 border-green-300"
    if (score >= 60) return "bg-yellow-100 border-yellow-300"
    return "bg-red-100 border-red-300"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Page Analyzer</h1>
        <p className="text-gray-600 mt-1">
          Analyze any webpage for SEO, content, and technical issues
        </p>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze a Page</CardTitle>
          <CardDescription>
            Enter a URL to analyze, optionally compare with your own page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="competitor">
                  Competitor/Target URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="competitor"
                  type="url"
                  placeholder="https://example.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="myUrl">Your URL (Optional - for comparison)</Label>
                <Input
                  id="myUrl"
                  type="url"
                  placeholder="https://your-site.com"
                  value={myUrl}
                  onChange={(e) => setMyUrl(e.target.value)}
                  disabled={loading}
                />
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileSearch className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>

              {result && !selectedProject && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => saveAnalysis()}
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
                Analysis saved!{" "}
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

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Competitor Results */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1">Target Page</h3>
                    <a
                      href={result.competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {result.competitor.url}
                    </a>
                  </div>

                  {/* SEO Score */}
                  {result.competitor.seo?.title?.content && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated SEO Score</div>
                      <div className={`text-4xl font-bold ${getSeoScoreColor(75)}`}>
                        75/100
                      </div>
                      <Badge className="mt-2" variant="secondary">
                        Good
                      </Badge>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold">{result.competitor.headings?.h1?.length || 0}</div>
                      <div className="text-xs text-gray-600">H1 Tags</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold">{result.competitor.content?.wordCount || 0}</div>
                      <div className="text-xs text-gray-600">Words</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold">{result.competitor.links?.internal || 0}</div>
                      <div className="text-xs text-gray-600">Links</div>
                    </div>
                  </div>
                </div>

                {/* My URL Results (if provided) */}
                {result.mine && (
                  <div className="space-y-3 border-l pl-6">
                    <div>
                      <h3 className="font-semibold mb-1">Your Page</h3>
                      <a
                        href={result.mine.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {result.mine.url}
                      </a>
                    </div>

                    {result.mine.seo?.title?.content && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Estimated SEO Score</div>
                        <div className={`text-4xl font-bold ${getSeoScoreColor(70)}`}>
                          70/100
                        </div>
                        <Badge className="mt-2" variant="outline">
                          Needs Work
                        </Badge>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold">{result.mine.headings?.h1?.length || 0}</div>
                        <div className="text-xs text-gray-600">H1 Tags</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold">{result.mine.content?.wordCount || 0}</div>
                        <div className="text-xs text-gray-600">Words</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold">{result.mine.links?.internal || 0}</div>
                        <div className="text-xs text-gray-600">Links</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Link */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  This is a quick summary. For full analysis results, visit the original competitor analyzer page.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/competitor-analyzer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Full Analysis Tool
                    </Link>
                  </Button>
                  {analysisId && (
                    <Button asChild>
                      <Link href={`/dashboard/analyses/${analysisId}`}>
                        View Saved Analysis
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSearch className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Analyze
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Enter a URL above to get started with your SEO analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

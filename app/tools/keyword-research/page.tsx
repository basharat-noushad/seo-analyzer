"use client"

/**
 * Keyword Research Tool
 *
 * Research keywords with search volume, difficulty, and suggestions
 */

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Target,
  Loader2,
  TrendingUp,
  TrendingDown,
  Search,
  Save,
  Download,
  BarChart3,
  AlertCircle,
} from "lucide-react"

interface KeywordData {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  trend: "up" | "down" | "stable"
  competition: "low" | "medium" | "high"
  relatedKeywords: string[]
}

interface ResearchResult {
  seedKeyword: string
  keywords: KeywordData[]
  totalResults: number
  timestamp: string
}

function KeywordResearchContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  const [seedKeyword, setSeedKeyword] = useState("")
  const [country, setCountry] = useState("US")
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState("")
  const [savedKeywords, setSavedKeywords] = useState<Set<string>>(new Set())

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

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setResult(null)
    setSavedKeywords(new Set())

    try {
      const response = await fetch("/api/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedKeyword,
          country,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || "Failed to research keywords")
        setLoading(false)
        return
      }

      setResult(data)
    } catch (err) {
      setError("Failed to research keywords. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const saveKeyword = async (keyword: KeywordData) => {
    if (!selectedProject) {
      setError("Please select a project to save keywords")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          keyword: keyword.keyword,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty,
          cpc: keyword.cpc,
          competition: keyword.competition,
        }),
      })

      if (response.ok) {
        setSavedKeywords(prev => new Set([...prev, keyword.keyword]))
      }
    } catch (err) {
      console.error("Failed to save keyword:", err)
    } finally {
      setSaving(false)
    }
  }

  const saveAllKeywords = async () => {
    if (!selectedProject || !result) {
      setError("Please select a project to save keywords")
      return
    }

    setSaving(true)
    try {
      const keywordsToSave = result.keywords.map(kw => ({
        projectId: selectedProject,
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        competition: kw.competition,
      }))

      const response = await fetch("/api/keywords/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywordsToSave }),
      })

      if (response.ok) {
        setSavedKeywords(new Set(result.keywords.map(kw => kw.keyword)))
      }
    } catch (err) {
      console.error("Failed to save keywords:", err)
    } finally {
      setSaving(false)
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return "text-red-600"
    if (difficulty >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty >= 70) return <Badge variant="destructive">Hard</Badge>
    if (difficulty >= 40) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="default">Easy</Badge>
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      default:
        return "text-green-600"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Keyword Research</h1>
        <p className="text-gray-600 mt-1">
          Discover valuable keywords with search volume, difficulty, and trends
        </p>
      </div>

      {/* Research Form */}
      <Card>
        <CardHeader>
          <CardTitle>Research Keywords</CardTitle>
          <CardDescription>
            Enter a seed keyword to discover related keywords and their metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seedKeyword">
                  Seed Keyword <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="seedKeyword"
                  type="text"
                  placeholder="e.g., SEO tools"
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-600">
                  Enter a topic or keyword to research
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                </select>
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
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Research Keywords
                  </>
                )}
              </Button>

              {result && selectedProject && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveAllKeywords}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Research Results</CardTitle>
              <CardDescription>
                Found {result.totalResults} keywords for "{result.seedKeyword}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total Keywords: <span className="font-bold">{result.totalResults}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Generated at: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Ideas</CardTitle>
              <CardDescription>
                Keywords sorted by search volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{keyword.keyword}</h4>
                          {getTrendIcon(keyword.trend)}
                          {savedKeywords.has(keyword.keyword) && (
                            <Badge variant="outline" className="text-xs">
                              Saved
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Search Volume</div>
                            <div className="font-bold text-primary">
                              {keyword.searchVolume.toLocaleString()}/mo
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-600 text-xs mb-1">Difficulty</div>
                            <div className={`font-bold ${getDifficultyColor(keyword.difficulty)}`}>
                              {keyword.difficulty}/100
                            </div>
                            {getDifficultyBadge(keyword.difficulty)}
                          </div>

                          <div>
                            <div className="text-gray-600 text-xs mb-1">CPC</div>
                            <div className="font-bold">${keyword.cpc.toFixed(2)}</div>
                          </div>

                          <div>
                            <div className="text-gray-600 text-xs mb-1">Competition</div>
                            <div className={`font-bold capitalize ${getCompetitionColor(keyword.competition)}`}>
                              {keyword.competition}
                            </div>
                          </div>
                        </div>

                        {keyword.relatedKeywords.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-600 mb-1">Related:</div>
                            <div className="flex flex-wrap gap-1">
                              {keyword.relatedKeywords.slice(0, 5).map((related, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {related}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedProject && !savedKeywords.has(keyword.keyword) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveKeyword(keyword)}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {selectedProject && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <Link href={`/dashboard/keywords?project=${selectedProject}`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Saved Keywords
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/tools/rank-tracker">
                      <Target className="mr-2 h-4 w-4" />
                      Track Rankings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Research Keywords
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Enter a seed keyword above to discover related keywords with search volume,
              difficulty, and competition data
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ Search volume estimates</p>
              <p>✓ Keyword difficulty scores</p>
              <p>✓ Competition analysis</p>
              <p>✓ Related keyword suggestions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function KeywordResearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KeywordResearchContent />
    </Suspense>
  )
}

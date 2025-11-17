"use client"

/**
 * Rank Tracker Tool
 *
 * Check and track keyword rankings in search engines
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
  BarChart3,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Save,
  Target,
  Calendar,
  Globe,
} from "lucide-react"

interface RankResult {
  keyword: string
  url: string
  currentRank: number | null
  previousRank: number | null
  bestRank: number | null
  topRankingPages: Array<{
    position: number
    url: string
    title: string
  }>
  searchEngine: string
  country: string
  checkedAt: string
}

export default function RankTrackerPage() {
  const searchParams = useSearchParams()
  const initialKeyword = searchParams.get("keyword")
  const projectId = searchParams.get("project")

  const [keyword, setKeyword] = useState(initialKeyword || "")
  const [targetUrl, setTargetUrl] = useState("")
  const [searchEngine, setSearchEngine] = useState("google")
  const [country, setCountry] = useState("US")
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<RankResult | null>(null)
  const [error, setError] = useState("")
  const [savedKeywords, setSavedKeywords] = useState<any[]>([])

  // Fetch user's projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])

          // Set target URL from selected project
          if (projectId && data.projects) {
            const project = data.projects.find((p: any) => p.id === projectId)
            if (project) {
              setTargetUrl(project.domain)
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err)
      }
    }
    fetchProjects()
  }, [projectId])

  // Fetch saved keywords for selected project
  useEffect(() => {
    async function fetchKeywords() {
      if (!selectedProject) {
        setSavedKeywords([])
        return
      }

      try {
        const response = await fetch(`/api/keywords?projectId=${selectedProject}`)
        if (response.ok) {
          const data = await response.json()
          setSavedKeywords(data.keywords || [])
        }
      } catch (err) {
        console.error("Failed to fetch keywords:", err)
      }
    }
    fetchKeywords()
  }, [selectedProject])

  // Auto-set target URL when project changes
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject)
      if (project) {
        setTargetUrl(project.domain)
      }
    }
  }, [selectedProject, projects])

  const handleCheckRank = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/rankings/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          targetUrl,
          searchEngine,
          country,
          projectId: selectedProject || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || "Failed to check rankings")
        setLoading(false)
        return
      }

      setResult(data)
    } catch (err) {
      setError("Failed to check rankings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const saveRanking = async () => {
    if (!result || !selectedProject) {
      setError("Please select a project to save rankings")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          keyword: result.keyword,
          url: result.url,
          rank: result.currentRank,
          searchEngine: result.searchEngine,
          country: result.country,
        }),
      })

      if (response.ok) {
        // Refresh saved keywords
        const keywordsResponse = await fetch(`/api/keywords?projectId=${selectedProject}`)
        if (keywordsResponse.ok) {
          const data = await keywordsResponse.json()
          setSavedKeywords(data.keywords || [])
        }
      }
    } catch (err) {
      console.error("Failed to save ranking:", err)
    } finally {
      setSaving(false)
    }
  }

  const getRankColor = (rank: number | null) => {
    if (!rank) return "text-gray-600"
    if (rank <= 3) return "text-green-600"
    if (rank <= 10) return "text-blue-600"
    if (rank <= 20) return "text-yellow-600"
    return "text-gray-600"
  }

  const getRankBadge = (rank: number | null) => {
    if (!rank) return <Badge variant="outline">Not Ranking</Badge>
    if (rank <= 3) return <Badge variant="default">Top 3</Badge>
    if (rank <= 10) return <Badge variant="default">Top 10</Badge>
    if (rank <= 20) return <Badge variant="secondary">Top 20</Badge>
    if (rank <= 100) return <Badge variant="outline">Page {Math.ceil(rank / 10)}</Badge>
    return <Badge variant="outline">Not in Top 100</Badge>
  }

  const getRankChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null

    const change = previous - current
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-5 w-5" />
          <span className="font-bold">+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-5 w-5" />
          <span className="font-bold">{change}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-600">
          <Minus className="h-5 w-5" />
          <span className="font-bold">0</span>
        </div>
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rank Tracker</h1>
        <p className="text-gray-600 mt-1">
          Check your keyword rankings in search engines
        </p>
      </div>

      {/* Rank Check Form */}
      <Card>
        <CardHeader>
          <CardTitle>Check Rankings</CardTitle>
          <CardDescription>
            Enter a keyword and URL to check current search engine rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckRank} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="keyword">
                  Keyword <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="keyword"
                  type="text"
                  placeholder="e.g., SEO tools"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUrl">
                  Your Website URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="targetUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="searchEngine">Search Engine</Label>
                <select
                  id="searchEngine"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchEngine}
                  onChange={(e) => setSearchEngine(e.target.value)}
                  disabled={loading}
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                </select>
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

              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <select
                    id="project"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Saved Keywords Quick Select */}
            {savedKeywords.length > 0 && (
              <div className="space-y-2">
                <Label>Quick Select (Saved Keywords)</Label>
                <div className="flex flex-wrap gap-2">
                  {savedKeywords.slice(0, 10).map((kw) => (
                    <Button
                      key={kw.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setKeyword(kw.keyword)}
                      disabled={loading}
                    >
                      {kw.keyword}
                      {kw.currentRank && (
                        <Badge variant="secondary" className="ml-2">
                          #{kw.currentRank}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
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
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check Rank
                  </>
                )}
              </Button>

              {result && selectedProject && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveRanking}
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
                      Save Result
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
          {/* Rank Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking Result</CardTitle>
              <CardDescription>
                "{result.keyword}" on {result.searchEngine} ({result.country})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Current Rank</div>
                  <div className={`text-5xl font-bold ${getRankColor(result.currentRank)}`}>
                    {result.currentRank ? `#${result.currentRank}` : "N/A"}
                  </div>
                  <div className="mt-2">
                    {getRankBadge(result.currentRank)}
                  </div>
                </div>

                {result.previousRank && (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Change</div>
                    <div className="flex items-center justify-center h-16">
                      {getRankChange(result.currentRank, result.previousRank)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Previous: #{result.previousRank}
                    </div>
                  </div>
                )}

                {result.bestRank && (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Best Rank</div>
                    <div className="text-5xl font-bold text-green-600">
                      #{result.bestRank}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      All-time best
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Checked: {new Date(result.checkedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{result.url}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Ranking Pages */}
          {result.topRankingPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Ranking Pages</CardTitle>
                <CardDescription>
                  Top 10 results for this keyword
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.topRankingPages.map((page) => (
                    <div
                      key={page.position}
                      className={`p-3 border rounded-lg ${
                        page.url === result.url ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-sm flex-shrink-0">
                          {page.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {page.title}
                          </h4>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {page.url}
                          </a>
                        </div>
                        {page.url === result.url && (
                          <Badge variant="default">Your Site</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 justify-center">
                {selectedProject && (
                  <Button asChild>
                    <Link href={`/dashboard/rankings?project=${selectedProject}`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View All Rankings
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/tools/keyword-research">
                    <Target className="mr-2 h-4 w-4" />
                    Research Keywords
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
            <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Track Rankings
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Enter a keyword and your website URL to check current search engine rankings
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ Real-time rank checking</p>
              <p>✓ Track rank changes over time</p>
              <p>✓ View top 10 competitors</p>
              <p>✓ Multiple search engines</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Rankings Dashboard Page
 *
 * Shows ranking history for tracked keywords
 */

import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Plus, TrendingUp, TrendingDown, Minus, Search, Calendar } from "lucide-react"

export default async function RankingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get recent rankings
  const rankings = await prisma.keywordRanking.findMany({
    where: {
      keyword: { project: { userId: user.id },
      },
    },
    orderBy: { checkedAt: "desc" },
    take: 100,
    include: {
      keyword: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
      },
    },
  })

  // Get all tracked keywords with their latest rankings
  const keywords = await prisma.keyword.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
      _count: {
        select: {
          keywordRankings: true,
        },
      },
    },
  })

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
    return <Badge variant="outline">#{rank}</Badge>
  }

  const getRankChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null

    const change = previous - current
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-bold">+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-bold">{change}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-600">
          <Minus className="h-4 w-4" />
          <span className="text-xs">0</span>
        </div>
      )
    }
  }

  // Calculate stats
  const topRankings = keywords.filter((k: any) => k.currentRank && k.currentRank <= 10).length
  const improving = keywords.filter(
    (k: any) => k.currentRank && k.previousRank && k.currentRank < k.previousRank
  ).length
  const declining = keywords.filter(
    (k: any) => k.currentRank && k.previousRank && k.currentRank > k.previousRank
  ).length

  // Group keywords by project
  const keywordsByProject = keywords.reduce((acc: any, keyword: any) => {
    const projectId = keyword.project?.id || "none"
    if (!acc[projectId]) {
      acc[projectId] = {
        project: keyword.project,
        keywords: [],
      }
    }
    acc[projectId].keywords.push(keyword)
    return acc
  }, {} as Record<string, { project: any; keywords: any[] }>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rankings</h1>
          <p className="text-gray-600 mt-1">
            Track your keyword rankings over time
          </p>
        </div>
        <Button asChild>
          <Link href="/tools/rank-tracker">
            <Plus className="mr-2 h-4 w-4" />
            Check Rankings
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Keywords Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {keywords.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top 10 Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {topRankings}
            </div>
            <p className="text-xs text-gray-600">
              {keywords.length > 0 ? Math.round((topRankings / keywords.length) * 100) : 0}% of keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Improving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {improving}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Declining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-red-600" />
              <div className="text-3xl font-bold text-red-600">
                {declining}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords by Project */}
      {keywords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No rankings tracked yet
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Start tracking keyword rankings to monitor your SEO performance
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/tools/rank-tracker">
                  <Search className="mr-2 h-4 w-4" />
                  Check Rankings
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tools/keyword-research">
                  Research Keywords
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(keywordsByProject).map(([projectId, data]: [string, any]) => (
          <Card key={projectId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {data.project ? data.project.name : "No Project"}
                  </CardTitle>
                  {data.project && (
                    <CardDescription>{data.project.domain}</CardDescription>
                  )}
                </div>
                <Badge variant="outline">{data.keywords.length} keywords</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.keywords.map((keyword: any) => (
                  <div
                    key={keyword.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-semibold text-lg">{keyword.keyword}</h4>
                          {getRankBadge(keyword.currentRank)}
                          {getRankChange(keyword.currentRank, keyword.previousRank)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Current Rank</div>
                            <div className={`text-2xl font-bold ${getRankColor(keyword.currentRank)}`}>
                              {keyword.currentRank ? `#${keyword.currentRank}` : "N/A"}
                            </div>
                          </div>

                          {keyword.bestRank && (
                            <div>
                              <div className="text-gray-600 text-xs mb-1">Best Rank</div>
                              <div className="text-2xl font-bold text-green-600">
                                #{keyword.bestRank}
                              </div>
                            </div>
                          )}

                          {keyword.searchVolume && (
                            <div>
                              <div className="text-gray-600 text-xs mb-1">Search Volume</div>
                              <div className="text-lg font-bold">
                                {keyword.searchVolume.toLocaleString()}/mo
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-gray-600 text-xs mb-1">Checks</div>
                            <div className="text-lg font-bold">
                              {keyword._count.keywordRankings}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tools/rank-tracker?keyword=${encodeURIComponent(keyword.keyword)}&project=${keyword.projectId}`}>
                          Check Again
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Recent Ranking Checks */}
      {rankings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Ranking Checks</CardTitle>
            <CardDescription>
              Latest rank check history across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.slice(0, 20).map((ranking: any) => (
                <div
                  key={ranking.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ranking.keyword.keyword}</span>
                      {getRankBadge(ranking.rank)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      {ranking.keyword.project && (
                        <span>{ranking.keyword.project.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ranking.checkedAt).toLocaleDateString()}
                      </span>
                      <span>{ranking.searchEngine}</span>
                      <span>{ranking.location}</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getRankColor(ranking.rank)}`}>
                    {ranking.rank ? `#${ranking.rank}` : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Keywords Dashboard Page
 *
 * Shows all tracked keywords for the user
 */

import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function KeywordsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const keywords = await prisma.keyword.findMany({
    where: { project: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
    },
  })

  const getDifficultyColor = (difficulty: number | null) => {
    if (!difficulty) return "text-gray-600"
    if (difficulty >= 70) return "text-red-600"
    if (difficulty >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getDifficultyBadge = (difficulty: number | null) => {
    if (!difficulty) return null
    if (difficulty >= 70) return <Badge variant="destructive">Hard</Badge>
    if (difficulty >= 40) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="default">Easy</Badge>
  }

  const getRankChange = (keyword: any) => {
    if (!keyword.currentRank || !keyword.previousRank) return null

    const change = keyword.previousRank - keyword.currentRank
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs">+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs">{change}</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-600 mt-1">
            Tracked keywords across all your projects
          </p>
        </div>
        <Button asChild>
          <Link href="/tools/keyword-research">
            <Plus className="mr-2 h-4 w-4" />
            Research Keywords
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Keywords
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
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {keywords.filter((k: any) => k.currentRank && k.currentRank <= 10).length}
            </div>
            <p className="text-xs text-gray-600">Top 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {keywords.length > 0
                ? Math.round(
                    keywords.reduce((sum: any, k: any) => sum + (k.searchVolume || 0), 0) /
                      keywords.length
                  ).toLocaleString()
                : 0}
            </div>
            <p className="text-xs text-gray-600">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {keywords.length > 0
                ? Math.round(
                    keywords.reduce((sum: any, k: any) => sum + (k.difficultyScore || 0), 0) /
                      keywords.length
                  )
                : 0}
            </div>
            <p className="text-xs text-gray-600">out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Keywords by Project */}
      {keywords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No keywords tracked yet
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Start researching keywords to track their rankings and performance
            </p>
            <Button asChild>
              <Link href="/tools/keyword-research">
                <Search className="mr-2 h-4 w-4" />
                Research Keywords
              </Link>
            </Button>
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
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{keyword.keyword}</h4>
                          {keyword.currentRank && (
                            <Badge variant="default">
                              Rank #{keyword.currentRank}
                            </Badge>
                          )}
                          {getRankChange(keyword)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {keyword.searchVolume !== null && (
                            <div>
                              <div className="text-gray-600 text-xs">Search Volume</div>
                              <div className="font-bold">
                                {keyword.searchVolume.toLocaleString()}/mo
                              </div>
                            </div>
                          )}

                          {keyword.difficultyScore !== null && (
                            <div>
                              <div className="text-gray-600 text-xs">Difficulty</div>
                              <div className={`font-bold ${getDifficultyColor(keyword.difficultyScore)}`}>
                                {keyword.difficultyScore}/100
                              </div>
                              {getDifficultyBadge(keyword.difficultyScore)}
                            </div>
                          )}

                          {keyword.cpc !== null && (
                            <div>
                              <div className="text-gray-600 text-xs">CPC</div>
                              <div className="font-bold">${keyword.cpc.toFixed(2)}</div>
                            </div>
                          )}

                          {keyword.competition && (
                            <div>
                              <div className="text-gray-600 text-xs">Competition</div>
                              <div className="font-bold capitalize">
                                {keyword.competition}
                              </div>
                            </div>
                          )}
                        </div>

                        {keyword.bestRank && (
                          <div className="mt-2 text-xs text-gray-600">
                            Best rank: #{keyword.bestRank}
                          </div>
                        )}
                      </div>

                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tools/rank-tracker?keyword=${encodeURIComponent(keyword.keyword)}&project=${keyword.projectId}`}>
                          Track
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
    </div>
  )
}

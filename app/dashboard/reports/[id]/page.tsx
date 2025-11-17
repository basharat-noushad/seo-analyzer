"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const dynamic = \'force-dynamic\'

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (response.ok) {
        const data: any = await response.json()
        setReport(data.report)
      } else {
        alert("Report not found")
        router.push("/dashboard/reports")
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=pdf`, {
        method: "POST",
      })

      if (response.ok) {
        const data: any = await response.json()
        alert(`PDF generated! This would download: ${data.url}`)
      } else {
        alert("Failed to export report")
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("Error exporting report")
    }
  }

  const copyPublicLink = () => {
    if (report.publicToken) {
      const url = `${window.location.origin}/reports/public/${report.publicToken}`
      navigator.clipboard.writeText(url)
      alert("Public link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading report...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Report not found</h2>
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    )
  }

  const reportData = report.reportData as any

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/reports")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Reports
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{report.name}</h1>
              <p className="mt-2 text-gray-600">
                {report.project.name} • Created{" "}
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-3">
              {report.isPublic && report.publicToken && (
                <button
                  onClick={copyPublicLink}
                  className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
                >
                  🔗 Copy Public Link
                </button>
              )}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {report.type === "seo_audit" && (
          <SEOAuditReport data={reportData} />
        )}

        {report.type === "progress" && (
          <ProgressReport data={reportData} />
        )}

        {report.type === "competitor" && (
          <CompetitorReport data={reportData} />
        )}
      </div>
    </div>
  )
}

// SEO Audit Report Component
function SEOAuditReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600">Domain</div>
            <div className="mt-1 font-medium text-gray-900">{data.summary?.domain}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">SEO Score</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {data.summary?.currentSEOScore || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Issues</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {data.summary?.totalIssues || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Scan</div>
            <div className="mt-1 font-medium text-gray-900">
              {data.summary?.lastScan
                ? new Date(data.summary.lastScan).toLocaleDateString()
                : "Never"}
            </div>
          </div>
        </div>
      </div>

      {/* Issues Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Issues by Severity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Critical</div>
            <div className="mt-2 text-3xl font-bold text-red-700">
              {data.issues?.bySeverity?.critical || 0}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">High</div>
            <div className="mt-2 text-3xl font-bold text-orange-700">
              {data.issues?.bySeverity?.high || 0}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Medium</div>
            <div className="mt-2 text-3xl font-bold text-yellow-700">
              {data.issues?.bySeverity?.medium || 0}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Low</div>
            <div className="mt-2 text-3xl font-bold text-blue-700">
              {data.issues?.bySeverity?.low || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-4">
            {data.recommendations.map((rec: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                {rec.actions && rec.actions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {rec.actions.map((action: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {action}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Data */}
      {data.seoScore?.breakdown && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.seoScore.breakdown).map(([key, value]: any) => (
              <div key={key} className="border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase">{key.replace(/([A-Z])/g, " $1")}</div>
                <div className="mt-1 font-medium text-gray-900">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Progress Report Component
function ProgressReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600">Time Period</div>
            <div className="mt-1 text-sm font-medium text-gray-900">
              {data.summary?.period?.start
                ? `${new Date(data.summary.period.start).toLocaleDateString()} - ${new Date(data.summary.period.end).toLocaleDateString()}`
                : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Scans</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {data.summary?.totalScans || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Score Change</div>
            <div
              className={`mt-1 text-2xl font-bold ${
                (data.summary?.scoreDelta || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {(data.summary?.scoreDelta || 0) >= 0 ? "+" : ""}
              {data.summary?.scoreDelta || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="mt-1">
              {data.summary?.scoreImprovement ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  📈 Improving
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  📉 Declining
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Improvements */}
      {data.improvements && data.improvements.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Improvements</h2>
          <div className="space-y-3">
            {data.improvements.map((improvement: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{improvement.metric}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(improvement.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{improvement.improvement}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regressions */}
      {data.regressions && data.regressions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Regressions</h2>
          <div className="space-y-3">
            {data.regressions.map((regression: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{regression.metric}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(regression.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-lg font-bold text-red-600">
                  -{regression.regression}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Changes */}
      {data.keyChanges && data.keyChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Key Changes</h2>
          <div className="space-y-3">
            {data.keyChanges.map((change: any, index: number) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{change.description}</div>
                  <div
                    className={`text-lg font-bold ${
                      change.delta >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {change.delta >= 0 ? "+" : ""}
                    {change.delta}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {new Date(change.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Competitor Report Component
function CompetitorReport({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitor Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Your Site</div>
            <div className="mt-1 font-medium text-gray-900">{data.summary?.domain}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Competitors Analyzed</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {data.summary?.competitorsAnalyzed || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Comparisons */}
      {data.comparisons && data.comparisons.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparisons</h2>
          <div className="space-y-4">
            {data.comparisons.map((comp: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-gray-900">{comp.competitorUrl}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(comp.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">Your Score</div>
                    <div className="text-2xl font-bold text-blue-700">{comp.yourScore}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600">Competitor Score</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {comp.competitorScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for competitors with no data */}
      {(!data.comparisons || data.comparisons.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No competitor data yet
          </h3>
          <p className="text-gray-600">
            Run competitor analyses from the Page Analyzer tool to see comparisons here
          </p>
        </div>
      )}
    </div>
  )
}

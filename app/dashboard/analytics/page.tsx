"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AnalyticsPage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [days, setDays] = useState<number>(30)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics()
    }
  }, [selectedProject, days])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data: any = await response.json()
        setProjects(data.projects || [])
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?projectId=${selectedProject}&days=${days}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(
        `/api/analytics/export?projectId=${selectedProject}&format=${format}&type=all`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting analytics:", error)
      alert("Error exporting data")
    }
  }

  const COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Traffic and SEO performance insights
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport("json")}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                📥 Export JSON
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Project:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {!analytics ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Select a project to view analytics</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Total Users</div>
                <div className="mt-2 text-3xl font-bold text-blue-600">
                  {analytics.traffic?.totals?.users?.toLocaleString() || 0}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {analytics.summary?.period?.days} days
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Page Views</div>
                <div className="mt-2 text-3xl font-bold text-green-600">
                  {analytics.traffic?.totals?.pageViews?.toLocaleString() || 0}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Avg {(analytics.traffic?.totals?.pageViews / analytics.traffic?.totals?.users || 0).toFixed(1)} per user
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-600">SEO Score</div>
                <div className="mt-2 text-3xl font-bold text-purple-600">
                  {analytics.summary?.currentSEOScore || 0}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Current score
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-600">Search Clicks</div>
                <div className="mt-2 text-3xl font-bold text-orange-600">
                  {analytics.searchConsole?.totals?.clicks?.toLocaleString() || 0}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {analytics.searchConsole?.totals?.avgCTR?.toFixed(2)}% CTR
                </div>
              </div>
            </div>

            {/* Traffic Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Traffic Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.traffic?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stackId="2"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* SEO vs Traffic Correlation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SEO Score Trend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO Score Trend
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.seo?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="seoScore"
                      stroke={COLORS.purple}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Correlation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO vs Traffic Correlation
                </h2>
                <div className="flex items-center justify-center h-[250px]">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-purple-600 mb-4">
                      {(analytics.correlations?.seoTrafficCorrelation || 0).toFixed(2)}
                    </div>
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      {analytics.correlations?.interpretation || "N/A"} Correlation
                    </div>
                    <div className="text-sm text-gray-600 max-w-xs mx-auto">
                      {analytics.correlations?.seoTrafficCorrelation > 0
                        ? "Positive correlation: SEO improvements tend to increase traffic"
                        : "Negative or weak correlation between SEO score and traffic"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Console Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Console Performance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.searchConsole?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="clicks"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources Pie */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Traffic Sources
                </h2>
                {analytics.traffic?.timeline && analytics.traffic.timeline.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Organic",
                            value: analytics.traffic.timeline.reduce((sum: number, d: any) => sum + d.organicTraffic, 0),
                          },
                          {
                            name: "Direct",
                            value: analytics.traffic.timeline.reduce((sum: number, d: any) => sum + d.directTraffic, 0),
                          },
                          {
                            name: "Referral",
                            value: analytics.traffic.timeline.reduce((sum: number, d: any) => sum + d.referralTraffic, 0),
                          },
                          {
                            name: "Social",
                            value: analytics.traffic.timeline.reduce((sum: number, d: any) => sum + d.socialTraffic, 0),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${((entry.value / analytics.traffic.totals.users) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.success} />
                        <Cell fill={COLORS.warning} />
                        <Cell fill={COLORS.purple} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top Search Queries */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Search Queries
                </h2>
                <div className="space-y-3">
                  {analytics.searchConsole?.topQueries?.slice(0, 5).map((query: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{query.query}</div>
                        <div className="text-sm text-gray-600">
                          {query.impressions.toLocaleString()} impressions • {query.clicks} clicks
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">Pos. {query.position.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">{query.ctr.toFixed(1)}% CTR</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues Over Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Issues Over Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.seo?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="criticalIssues" stackId="a" fill={COLORS.danger} />
                  <Bar dataKey="highIssues" stackId="a" fill={COLORS.warning} />
                  <Bar dataKey="mediumIssues" stackId="a" fill="#fbbf24" />
                  <Bar dataKey="lowIssues" stackId="a" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Pages */}
            {analytics.searchConsole?.topPages && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Performing Pages
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.searchConsole.topPages.map((page: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {page.page}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {page.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {page.clicks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {page.ctr.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {page.position.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Integration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                📊 Data Integration Status
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                This dashboard currently shows simulated data. To see your real analytics:
              </p>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Connect Google Analytics 4 to import traffic data</li>
                <li>• Connect Google Search Console for search performance data</li>
                <li>• Real-time sync updates every hour</li>
                <li>• Historical data up to 16 months</li>
              </ul>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  🔗 Connect Google Analytics
                </button>
                <button className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  🔗 Connect Search Console
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const dynamic = 'force-dynamic'

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())

  // Filters
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterRead, setFilterRead] = useState<string>("all")
  const [filterProject, setFilterProject] = useState<string>("all")

  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetchAlerts()
    fetchProjects()
  }, [filterType, filterSeverity, filterRead, filterProject])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filterType !== "all") params.append("type", filterType)
      if (filterSeverity !== "all") params.append("severity", filterSeverity)
      if (filterRead !== "all") params.append("read", filterRead)
      if (filterProject !== "all") params.append("projectId", filterProject)

      const response = await fetch(`/api/alerts?${params}`)
      if (response.ok) {
        const data: any = await response.json()
        setAlerts(data.alerts || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data: any = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleToggleSelect = (alertId: string) => {
    const newSelected = new Set(selectedAlerts)
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId)
    } else {
      newSelected.add(alertId)
    }
    setSelectedAlerts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set())
    } else {
      setSelectedAlerts(new Set(alerts.map((a: any) => a.id)))
    }
  }

  const handleMarkAsRead = async (alertId?: string) => {
    try {
      if (alertId) {
        // Mark single alert as read
        await fetch(`/api/alerts/${alertId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      } else if (selectedAlerts.size > 0) {
        // Mark selected alerts as read
        await fetch("/api/alerts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alertIds: Array.from(selectedAlerts),
            read: true,
          }),
        })
        setSelectedAlerts(new Set())
      }
      fetchAlerts()
    } catch (error) {
      console.error("Error marking alerts as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/alerts/mark-all-read", { method: "POST" })
      fetchAlerts()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleDelete = async (alertId?: string) => {
    if (!confirm("Are you sure you want to delete the selected alert(s)?")) {
      return
    }

    try {
      if (alertId) {
        // Delete single alert
        await fetch(`/api/alerts/${alertId}`, { method: "DELETE" })
      } else if (selectedAlerts.size > 0) {
        // Delete selected alerts
        const ids = Array.from(selectedAlerts).join(",")
        await fetch(`/api/alerts?ids=${ids}`, { method: "DELETE" })
        setSelectedAlerts(new Set())
      }
      fetchAlerts()
    } catch (error) {
      console.error("Error deleting alerts:", error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors: any = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    }

    const icons: any = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🔵",
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors[severity] || "bg-gray-100 text-gray-800"}`}>
        <span>{icons[severity]}</span>
        <span className="capitalize">{severity}</span>
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: any = {
      seo_improvement: "SEO Improvement",
      seo_decline: "SEO Decline",
      new_critical_issues: "New Critical Issues",
      title_changed: "Title Changed",
      meta_description_changed: "Meta Description Changed",
      h1_changed: "H1 Tag Changed",
      issue_detected: "Issue Detected",
      rank_drop: "Ranking Drop",
      site_down: "Site Down",
    }
    return labels[type] || type
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading alerts...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="mt-2 text-gray-600">
            Manage your SEO monitoring alerts and notifications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Total Alerts</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.total || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Unread</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {stats.unread || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Critical</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {stats.critical || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">High Priority</div>
            <div className="mt-2 text-3xl font-bold text-orange-600">
              {stats.high || 0}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="seo_improvement">SEO Improvement</option>
                <option value="seo_decline">SEO Decline</option>
                <option value="new_critical_issues">New Critical Issues</option>
                <option value="title_changed">Title Changed</option>
                <option value="meta_description_changed">Meta Changed</option>
                <option value="h1_changed">H1 Changed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Severity:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="false">Unread Only</option>
                <option value="true">Read Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Project:</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {(selectedAlerts.size > 0 || stats.unread > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-900">
                {selectedAlerts.size > 0 ? (
                  <span className="font-medium">{selectedAlerts.size} alert(s) selected</span>
                ) : (
                  <span className="font-medium">{stats.unread} unread alert(s)</span>
                )}
              </div>
              <div className="flex gap-3">
                {selectedAlerts.size > 0 && (
                  <>
                    <button
                      onClick={() => handleMarkAsRead()}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Mark Selected as Read
                    </button>
                    <button
                      onClick={() => handleDelete()}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete Selected
                    </button>
                  </>
                )}
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No alerts found
            </h3>
            <p className="text-gray-600">
              {filterType !== "all" || filterSeverity !== "all" || filterRead !== "all" || filterProject !== "all"
                ? "Try adjusting your filters to see more alerts"
                : "You'll see notifications here when monitoring detects changes"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert: any) => (
                    <tr
                      key={alert.id}
                      className={`hover:bg-gray-50 ${!alert.read ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.has(alert.id)}
                          onChange={() => handleToggleSelect(alert.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {alert.title}
                            {!alert.read && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          {alert.message && (
                            <div className="text-sm text-gray-600 mt-1">
                              {alert.message}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTypeLabel(alert.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {alert.project ? (
                            <button
                              onClick={() => router.push(`/dashboard/projects/${alert.projectId}`)}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {alert.project.name}
                            </button>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(alert.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {!alert.read && (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark as read"
                            >
                              ✓ Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

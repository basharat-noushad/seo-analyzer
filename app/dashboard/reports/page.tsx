"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const dynamic = \'force-dynamic\'

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)

  // Filters
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchReports()
    fetchProjects()
  }, [filterProject, filterType])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filterProject !== "all") params.append("projectId", filterProject)
      if (filterType !== "all") params.append("type", filterType)

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data: any = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
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

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchReports()
      } else {
        alert("Failed to delete report")
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      alert("Error deleting report")
    }
  }

  const handleTogglePublic = async (reportId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      })

      if (response.ok) {
        fetchReports()
      } else {
        alert("Failed to update report")
      }
    } catch (error) {
      console.error("Error updating report:", error)
      alert("Error updating report")
    }
  }

  const handleExport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=pdf`, {
        method: "POST",
      })

      if (response.ok) {
        const data: any = await response.json()
        alert(`PDF generated! URL: ${data.url}`)
      } else {
        alert("Failed to export report")
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("Error exporting report")
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: any = {
      seo_audit: "SEO Audit",
      progress: "Progress Report",
      competitor: "Competitor Analysis",
    }
    return labels[type] || type
  }

  const getTypeBadge = (type: string) => {
    const colors: any = {
      seo_audit: "bg-blue-100 text-blue-800",
      progress: "bg-green-100 text-green-800",
      competitor: "bg-purple-100 text-purple-800",
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[type] || "bg-gray-100 text-gray-800"
        }`}
      >
        {getTypeLabel(type)}
      </span>
    )
  }

  const copyPublicLink = (token: string) => {
    const url = `${window.location.origin}/reports/public/${token}`
    navigator.clipboard.writeText(url)
    alert("Public link copied to clipboard!")
  }

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading reports...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="mt-2 text-gray-600">
                Generate and manage SEO reports for your projects
              </p>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Total Reports</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {reports.length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">SEO Audits</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {reports.filter((r: any) => r.type === "seo_audit").length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Progress Reports</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {reports.filter((r: any) => r.type === "progress").length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Public Reports</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {reports.filter((r: any) => r.isPublic).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
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

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="seo_audit">SEO Audit</option>
                <option value="progress">Progress Report</option>
                <option value="competitor">Competitor Analysis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first report to track SEO performance over time
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Report
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {report.name}
                          </div>
                          {report.dateRangeStart && report.dateRangeEnd && (
                            <div className="text-sm text-gray-500">
                              {new Date(report.dateRangeStart).toLocaleDateString()} -{" "}
                              {new Date(report.dateRangeEnd).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(report.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.project.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            🌐 Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            🔒 Private
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            👁 View
                          </button>
                          <button
                            onClick={() => handleExport(report.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Export PDF"
                          >
                            📄 Export
                          </button>
                          {report.isPublic && report.publicToken && (
                            <button
                              onClick={() => copyPublicLink(report.publicToken)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Copy public link"
                            >
                              🔗 Link
                            </button>
                          )}
                          <button
                            onClick={() => handleTogglePublic(report.id, report.isPublic)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={report.isPublic ? "Make private" : "Make public"}
                          >
                            {report.isPublic ? "🔒" : "🌐"}
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
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

        {/* Report Builder Modal */}
        {showBuilder && (
          <ReportBuilder
            projects={projects}
            onClose={() => setShowBuilder(false)}
            onSuccess={() => {
              setShowBuilder(false)
              fetchReports()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Report Builder Component
function ReportBuilder({
  projects,
  onClose,
  onSuccess,
}: {
  projects: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [projectId, setProjectId] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("seo_audit")
  const [dateRangeStart, setDateRangeStart] = useState("")
  const [dateRangeEnd, setDateRangeEnd] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!projectId || !name) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setCreating(true)

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name,
          type,
          dateRangeStart: dateRangeStart || undefined,
          dateRangeEnd: dateRangeEnd || undefined,
          isPublic,
        }),
      })

      if (response.ok) {
        alert("Report created successfully!")
        onSuccess()
      } else {
        alert("Failed to create report")
      }
    } catch (error) {
      console.error("Error creating report:", error)
      alert("Error creating report")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Report
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Monthly SEO Audit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project...</option>
                  {projects.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="seo_audit">SEO Audit</option>
                  <option value="progress">Progress Report</option>
                  <option value="competitor">Competitor Analysis</option>
                </select>
              </div>

              {type === "progress" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make report publicly accessible
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleCreate}
              disabled={creating || !projectId || !name}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Report"}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

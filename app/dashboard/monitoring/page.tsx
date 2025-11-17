"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const dynamic = 'force-dynamic'

export default function MonitoringPage() {
  const router = useRouter()
  const [monitoringJobs, setMonitoringJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchMonitoringJobs()
  }, [filterStatus])

  const fetchMonitoringJobs = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      const response = await fetch(`/api/monitoring?${params}`)
      if (response.ok) {
        const data: any = await response.json()
        setMonitoringJobs(data.monitoringJobs || [])
      }
    } catch (error) {
      console.error("Error fetching monitoring jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerScan = async (job: any) => {
    try {
      setTriggering(job.id)

      const response = await fetch("/api/monitoring/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: job.projectId,
          pageId: job.pageId,
        }),
      })

      if (response.ok) {
        const data: any = await response.json()
        alert(`Scan completed! SEO Score: ${data.analysis.seoScore}. ${data.alerts.length} alert(s) created.`)
        fetchMonitoringJobs()
      } else {
        alert("Failed to trigger scan")
      }
    } catch (error) {
      console.error("Error triggering scan:", error)
      alert("Error triggering scan")
    } finally {
      setTriggering(null)
    }
  }

  const handleToggleStatus = async (job: any) => {
    try {
      const newStatus = job.status === "active" ? "paused" : "active"

      const response = await fetch(`/api/monitoring/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchMonitoringJobs()
      } else {
        alert("Failed to update monitoring job")
      }
    } catch (error) {
      console.error("Error updating monitoring job:", error)
      alert("Error updating monitoring job")
    }
  }

  const handleDelete = async (job: any) => {
    if (!confirm("Are you sure you want to delete this monitoring job?")) {
      return
    }

    try {
      const response = await fetch(`/api/monitoring/${job.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMonitoringJobs()
      } else {
        alert("Failed to delete monitoring job")
      }
    } catch (error) {
      console.error("Error deleting monitoring job:", error)
      alert("Error deleting monitoring job")
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: any = {
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    )
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: any = {
      daily: "Every Day",
      weekly: "Every Week",
      monthly: "Every Month",
    }
    return labels[frequency] || frequency
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading monitoring jobs...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Automated monitoring jobs for your projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Total Jobs</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {monitoringJobs.length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Active</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {monitoringJobs.filter((j: any) => j.status === "active").length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Paused</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {monitoringJobs.filter((j: any) => j.status === "paused").length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Failed</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {monitoringJobs.filter((j: any) => j.status === "failed").length}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Monitoring Jobs List */}
        {monitoringJobs.length === 0 ? (
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No monitoring jobs found
            </h3>
            <p className="text-gray-600 mb-6">
              Enable monitoring in your project settings to start tracking changes
            </p>
            <button
              onClick={() => router.push("/dashboard/projects")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Projects
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project / Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monitoringJobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {job.project.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.page ? job.page.pageTitle || job.page.url : job.project.domain}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getFrequencyLabel(job.frequency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job.lastRunAt
                            ? formatDistanceToNow(new Date(job.lastRunAt), { addSuffix: true })
                            : "Never"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job.status === "active"
                            ? formatDistanceToNow(new Date(job.nextRunAt), { addSuffix: true })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTriggerScan(job)}
                            disabled={triggering === job.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Run now"
                          >
                            {triggering === job.id ? "Running..." : "▶ Run"}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(job)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={job.status === "active" ? "Pause" : "Resume"}
                          >
                            {job.status === "active" ? "⏸ Pause" : "▶ Resume"}
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
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

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            How Monitoring Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Enable monitoring in your project settings to create monitoring jobs</li>
            <li>• Jobs run automatically based on your chosen frequency (daily, weekly, or monthly)</li>
            <li>• You'll receive alerts when significant changes are detected</li>
            <li>• Use "Run now" to manually trigger a scan at any time</li>
            <li>• Pause jobs temporarily or delete them when no longer needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ProjectSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [description, setDescription] = useState("")
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const [monitoringFrequency, setMonitoringFrequency] = useState("daily")

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data: any = await response.json()
        setProject(data.project)
        setName(data.project.name)
        setDomain(data.project.domain)
        setDescription(data.project.description || "")
        setMonitoringEnabled(data.project.monitoringEnabled)
        setMonitoringFrequency(data.project.monitoringFrequency || "daily")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Update project
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          domain,
          description,
          monitoringEnabled,
          monitoringFrequency,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      // If monitoring is enabled, create/update monitoring job
      if (monitoringEnabled) {
        const monitoringResponse = await fetch("/api/monitoring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            frequency: monitoringFrequency,
          }),
        })

        if (!monitoringResponse.ok) {
          console.error("Failed to create monitoring job")
        }
      }

      alert("Project settings saved successfully!")
      router.push(`/dashboard/projects/${projectId}`)
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Failed to save project settings")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Project deleted successfully")
        router.push("/dashboard/projects")
      } else {
        alert("Failed to delete project")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Error deleting project")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading project settings...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Project
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage project details and monitoring configuration
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {/* Basic Information */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Website"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of your project"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Monitoring Configuration */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Automated Monitoring
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Enable Monitoring</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Automatically scan your website for SEO changes and issues
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={monitoringEnabled}
                    onChange={(e) => setMonitoringEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {monitoringEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monitoring Frequency
                  </label>
                  <select
                    value={monitoringFrequency}
                    onChange={(e) => setMonitoringFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily - Every 24 hours</option>
                    <option value="weekly">Weekly - Every 7 days</option>
                    <option value="monthly">Monthly - Every 30 days</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    Choose how often you want to automatically scan this project for changes.
                  </p>
                </div>
              )}

              {monitoringEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    What Monitoring Detects:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• SEO score changes (improvements or declines)</li>
                    <li>• New critical or high-priority issues</li>
                    <li>• Changes to title tags and meta descriptions</li>
                    <li>• Changes to H1 tags and heading structure</li>
                    <li>• Technical issues and broken links</li>
                  </ul>
                  <p className="mt-3 text-sm text-blue-700">
                    You'll receive alerts when significant changes are detected.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete Project
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !domain}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notes
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deleting a project will remove all associated data including analyses, issues, and monitoring jobs.</li>
                  <li>Monitoring jobs run automatically based on your chosen frequency.</li>
                  <li>You can manually trigger scans at any time from the Monitoring dashboard.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

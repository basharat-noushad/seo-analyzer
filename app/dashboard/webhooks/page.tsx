"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import {
  Webhook,
  Plus,
  Trash2,
  Power,
  PowerOff,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"

interface WebhookData {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: string | null
  failureCount: number
  createdAt: string
}

const AVAILABLE_EVENTS = [
  { value: "analysis_completed", label: "Analysis Completed" },
  { value: "analysis_failed", label: "Analysis Failed" },
  { value: "rank_changed", label: "Rank Changed" },
  { value: "issue_detected", label: "Issue Detected" },
  { value: "issue_resolved", label: "Issue Resolved" },
  { value: "monitoring_triggered", label: "Monitoring Triggered" },
  { value: "project_created", label: "Project Created" },
  { value: "project_updated", label: "Project Updated" },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks")
      const data = await response.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      console.error("Error fetching webhooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook),
      })

      if (response.ok) {
        const data = await response.json()
        setNewSecret(data.webhook.secret)
        fetchWebhooks()
        setNewWebhook({ name: "", url: "", events: [] })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create webhook")
      }
    } catch (error) {
      console.error("Error creating webhook:", error)
      alert("Failed to create webhook")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleWebhook = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      })

      if (response.ok) {
        fetchWebhooks()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update webhook")
      }
    } catch (error) {
      console.error("Error updating webhook:", error)
      alert("Failed to update webhook")
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this webhook? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchWebhooks()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete webhook")
      }
    } catch (error) {
      console.error("Error deleting webhook:", error)
      alert("Failed to delete webhook")
    }
  }

  const handleToggleEvent = (event: string) => {
    if (newWebhook.events.includes(event)) {
      setNewWebhook({
        ...newWebhook,
        events: newWebhook.events.filter((e) => e !== event),
      })
    } else {
      setNewWebhook({
        ...newWebhook,
        events: [...newWebhook.events, event],
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Webhook className="h-8 w-8 text-purple-600" />
            Webhooks
          </h1>
          <p className="text-gray-600 mt-2">
            Receive real-time notifications about events in your account
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Webhook
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              How Webhooks Work
            </h3>
            <p className="text-sm text-blue-800">
              Webhooks allow you to receive HTTP POST requests when specific events
              occur. Each payload is signed with a secret for verification.
            </p>
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Webhook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No webhooks yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create a webhook to receive real-time notifications
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Your First Webhook
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {webhook.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        webhook.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {webhook.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {webhook.url}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleToggleWebhook(webhook.id, webhook.isActive)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      webhook.isActive
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={webhook.isActive ? "Disable" : "Enable"}
                  >
                    {webhook.isActive ? (
                      <PowerOff className="h-5 w-5" />
                    ) : (
                      <Power className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Subscribed Events
                </h4>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last triggered: {formatDate(webhook.lastTriggeredAt)}</span>
                </div>
                {webhook.failureCount > 0 && (
                  <span className="text-orange-600 font-medium">
                    {webhook.failureCount} consecutive failures
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && !newSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Webhook
            </h2>

            <form onSubmit={handleCreateWebhook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Name *
                </label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Production Webhook"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payload URL *
                </label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://yoursite.com/webhooks/seo-analyzer"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Events to Subscribe *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_EVENTS.map((event) => (
                    <label
                      key={event.value}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.value)}
                        onChange={() => handleToggleEvent(event.value)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-900">{event.label}</span>
                    </label>
                  ))}
                </div>
                {newWebhook.events.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Please select at least one event
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewWebhook({ name: "", url: "", events: [] })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={creating || newWebhook.events.length === 0}
                >
                  {creating ? "Creating..." : "Create Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Secret Modal */}
      {newSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Webhook Created Successfully
              </h2>
              <button
                onClick={() => {
                  setNewSecret(null)
                  setShowCreateModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Save your webhook secret
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Use this secret to verify webhook signatures. You won't be able to
                    see it again.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                type="text"
                value={newSecret}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
            </div>

            <button
              onClick={() => {
                setNewSecret(null)
                setShowCreateModal(false)
              }}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              I've Saved My Secret
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

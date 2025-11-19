"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, X } from "lucide-react"

export function NotificationBell() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts?limit=10")
      if (response.ok) {
        const data: any = await response.json()
        setAlerts(data.alerts || [])
        setUnreadCount(data.stats?.unread || 0)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })

      if (response.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/alerts/mark-all-read", {
        method: "POST",
      })

      if (response.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Error marking all alerts as read:", error)
    }
  }

  const handleViewAll = () => {
    setIsOpen(false)
    router.push("/dashboard/alerts")
  }

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: "text-red-600 bg-red-50",
      high: "text-orange-600 bg-orange-50",
      medium: "text-yellow-600 bg-yellow-50",
      low: "text-blue-600 bg-blue-50",
    }
    return colors[severity] || "text-gray-600 bg-gray-50"
  }

  const getSeverityIcon = (severity: string) => {
    const icons: any = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🔵",
    }
    return icons[severity] || "⚪"
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-sm text-gray-500">Loading...</div>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Bell className="h-12 w-12 text-gray-300 mb-2" />
                  <div className="text-sm text-gray-500">No notifications</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alerts.map((alert: any) => (
                    <div
                      key={alert.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !alert.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (alert.project) {
                          router.push(`/dashboard/projects/${alert.projectId}`)
                          setIsOpen(false)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Severity Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-xl">
                            {getSeverityIcon(alert.severity)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {alert.title}
                            </h4>
                            {!alert.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(alert.id, e)}
                                className="flex-shrink-0 text-blue-600 hover:text-blue-700 p-1"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {alert.message && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {alert.message}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {alert.project && (
                              <>
                                <span className="font-medium">
                                  {alert.project.name}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {formatDistanceToNow(new Date(alert.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

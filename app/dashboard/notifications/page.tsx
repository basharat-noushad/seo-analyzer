/**
 * Notifications Center
 *
 * View and manage all notifications
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  Check,
  X
} from "lucide-react"

export const dynamic = 'force-dynamic'

// Mock notifications data
// In production, this would come from the database
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "success",
    title: "Analysis Complete",
    message: "SEO analysis for 'example.com/blog/post-1' is complete. Score: 85/100",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/dashboard/analyses/123"
  },
  {
    id: "2",
    type: "warning",
    title: "Critical Issues Found",
    message: "3 critical SEO issues detected in your 'Marketing Website' project",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/dashboard/issues"
  },
  {
    id: "3",
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly SEO report for January 15-22 is now available",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/dashboard/reports"
  },
  {
    id: "4",
    type: "success",
    title: "Rank Improvement",
    message: "'best seo tools' keyword moved up 5 positions to rank #12",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/dashboard/rankings"
  },
  {
    id: "5",
    type: "info",
    title: "Team Member Added",
    message: "john@example.com joined your 'Marketing' team",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/dashboard/teams"
  },
  {
    id: "6",
    type: "warning",
    title: "Usage Limit Warning",
    message: "You've used 80% of your monthly analysis quota",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/dashboard/billing"
  }
]

// Notification type configuration
const NOTIFICATION_CONFIG = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  error: {
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

export default async function NotificationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your SEO activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Check className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href="/dashboard/settings#notifications">
              <Settings className="h-4 w-4" />
              Settings
            </a>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <Bell className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
              </div>
              <Calendar className="h-10 w-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900">6</p>
              </div>
              <TrendingUp className="h-10 w-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <Users className="h-10 w-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Showing {MOCK_NOTIFICATIONS.length} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
              <p className="text-gray-600">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {MOCK_NOTIFICATIONS.map((notification) => {
                const config = NOTIFICATION_CONFIG[notification.type as keyof typeof NOTIFICATION_CONFIG]
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                      !notification.read
                        ? `${config.bgColor} ${config.borderColor} border-l-4`
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Badge variant="default" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>

                          <div className="flex gap-2">
                            {notification.actionUrl && (
                              <Button
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                asChild
                              >
                                <a href={notification.actionUrl}>
                                  View Details →
                                </a>
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-auto p-0 text-xs"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {MOCK_NOTIFICATIONS.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline">
                Load More Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Customize how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Analysis Completions</p>
                  <p className="text-sm text-gray-600">Get notified when analyses finish</p>
                </div>
              </div>
              <Badge>Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Critical Issues</p>
                  <p className="text-sm text-gray-600">Alerts for critical SEO issues</p>
                </div>
              </div>
              <Badge>Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Rank Changes</p>
                  <p className="text-sm text-gray-600">Updates on keyword ranking changes</p>
                </div>
              </div>
              <Badge variant="secondary">Disabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Team Activity</p>
                  <p className="text-sm text-gray-600">Notifications about team actions</p>
                </div>
              </div>
              <Badge>Enabled</Badge>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4" asChild>
            <a href="/dashboard/settings">
              Manage All Preferences
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Note Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These are sample notifications to demonstrate the interface.
              Real-time notifications with database persistence, marking as read, and filtering will be implemented in the next phase.
              Email notifications are controlled in the Settings page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

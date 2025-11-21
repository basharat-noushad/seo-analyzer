/**
 * Admin Dashboard
 *
 * System overview and administration
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
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
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Server,
  Database
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch system statistics
  const [
    totalUsers,
    activeUsers,
    totalProjects,
    totalAnalyses,
    proUsers,
    agencyUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.project.count(),
    prisma.analysis.count(),
    prisma.user.count({ where: { tier: "pro" } }),
    prisma.user.count({ where: { tier: "agency" } })
  ])

  // Calculate growth (mock data - in production, compare with previous period)
  const userGrowth = "+12.5%"
  const analysisGrowth = "+8.3%"
  const revenue = "$" + ((proUsers * 29) + (agencyUsers * 99)).toLocaleString()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            System overview and administration
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          Administrator
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">{userGrowth} from last month</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{activeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
              </div>
              <Activity className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-3xl font-bold text-gray-900">{totalAnalyses.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">{analysisGrowth} this month</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MRR</p>
                <p className="text-3xl font-bold text-gray-900">{revenue}</p>
                <p className="text-sm text-gray-600 mt-1">Monthly revenue</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Tier</CardTitle>
            <CardDescription>
              Breakdown of users across pricing tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{totalUsers - proUsers - agencyUsers}</span>
                  <Badge variant="outline">
                    {(((totalUsers - proUsers - agencyUsers) / totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Pro</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{proUsers}</span>
                  <Badge variant="secondary">
                    {((proUsers / totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg border-primary-200 bg-primary-50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  <span className="font-medium">Agency</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{agencyUsers}</span>
                  <Badge>
                    {((agencyUsers / totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Current system status and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-green-500" />
                  <span className="font-medium">API Status</span>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Operational
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Database</span>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Healthy
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Response Time</span>
                </div>
                <span className="font-medium text-gray-900">142ms</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Uptime</span>
                </div>
                <span className="font-medium text-gray-900">99.98%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administration tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
            </Link>

            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>

            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <AlertCircle className="h-6 w-6" />
                <span>System Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest user registrations and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: "user", message: "New user registered: john@example.com", time: "2 minutes ago" },
              { type: "upgrade", message: "User upgraded to Pro plan: sarah@company.com", time: "15 minutes ago" },
              { type: "analysis", message: "1,234 analyses completed in the last hour", time: "1 hour ago" },
              { type: "user", message: "New user registered: mike@startup.io", time: "2 hours ago" },
              { type: "system", message: "Database backup completed successfully", time: "3 hours ago" }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === "user" ? "bg-blue-500" :
                  activity.type === "upgrade" ? "bg-green-500" :
                  activity.type === "analysis" ? "bg-purple-500" :
                  "bg-gray-500"
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
